<?php

namespace App\Http\Controllers;

use App\Jobs\SyncScholarProfile;
use App\Models\ScholarProfile;
use App\Models\ScholarPublication;
use App\Models\ScholarPublicationCitationByYear;
use App\Services\Scholar\SerpApiProvider;
use App\Helpers\ApiResponse;
use App\Http\Resources\ScholarProfileResource;
use App\Http\Resources\ScholarPublicationResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ScholarController extends Controller
{
    private const MANUAL_SYNC_COOLDOWN_HOURS = 24;

    public function dashboard()
    {
        $user = Auth::user();

        $profile = ScholarProfile::withCount('publications')
            ->with(['citationsByYear'])
            ->where('user_id', $user->id)
            ->first();

        if (!$profile) {
            return ApiResponse::success([
                'connected' => false,
            ]);
        }

        return ApiResponse::success([
            'connected'         => true,
            'profile'           => new ScholarProfileResource($profile),
            'publications_count'=> $profile->publications_count,
        ]);
    }

    public function connect(Request $request)
    {
        $validated = $request->validate([
            'profile_url' => ['required', 'string'],
        ]);

        $url = $validated['profile_url'];
        $authorId = $this->extractAuthorId($url);

        if (!$authorId) {
            return ApiResponse::failed(
                'URL profil Google Scholar tidak valid. Format: https://scholar.google.com/citations?user=AUTHOR_ID'
            );
        }

        $user = Auth::user();

        $profile = ScholarProfile::where('user_id', $user->id)->first();

        if ($profile) {
            $authorChanged = $profile->scholar_author_id !== $authorId;

            if ($authorChanged) {
                $profile->publications()->delete();
            }

            $profile->update([
                'scholar_author_id' => $authorId,
                'profile_url'       => $url,
                'sync_status'       => 'pending',
                'last_sync_error'   => null,
            ]);
        } else {
            $profile = ScholarProfile::create([
                'user_id'           => $user->id,
                'scholar_author_id' => $authorId,
                'profile_url'       => $url,
                'sync_status'       => 'pending',
            ]);
        }

        SyncScholarProfile::dispatch($profile->scholar_profile_id);

        Log::info('Scholar: Connect dispatched sync', [
            'user_id'       => $user->id,
            'profile_id'    => $profile->scholar_profile_id,
            'author_id'     => $authorId,
        ]);

        return ApiResponse::success(
            new ScholarProfileResource($profile->load(['citationsByYear'])),
            'Profil terhubung. Sinkronisasi akan dimulai.'
        );
    }

    public function sync()
    {
        $user = Auth::user();

        $profile = ScholarProfile::where('user_id', $user->id)->first();

        if (!$profile) {
            return ApiResponse::failed('Profil Google Scholar belum terhubung.');
        }

        if ($profile->sync_status === 'syncing') {
            return ApiResponse::failed('Sinkronisasi sedang berlangsung.');
        }

        if ($profile->last_synced_at &&
            $profile->last_synced_at->diffInHours(now()) < self::MANUAL_SYNC_COOLDOWN_HOURS) {
            $hoursLeft = self::MANUAL_SYNC_COOLDOWN_HOURS - $profile->last_synced_at->diffInHours(now());
            return ApiResponse::failed(
                "Anda harus menunggu {$hoursLeft} jam lagi sebelum sinkronisasi berikutnya."
            );
        }

        SyncScholarProfile::dispatch($profile->scholar_profile_id);

        Log::info('Scholar: Manual sync dispatched', [
            'user_id'    => $user->id,
            'profile_id' => $profile->scholar_profile_id,
            'author_id'  => $profile->scholar_author_id,
        ]);

        return ApiResponse::success(
            new ScholarProfileResource($profile->load(['citationsByYear'])),
            'Sinkronisasi akan dimulai.'
        );
    }

    public function publications(Request $request)
    {
        $user = Auth::user();

        $profile = ScholarProfile::where('user_id', $user->id)->first();

        if (!$profile) {
            return response()->json([
                'data' => [],
                'meta' => ['total' => 0, 'per_page' => 10, 'current_page' => 1, 'last_page' => 1],
            ]);
        }

        $query = $profile->publications();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('authors', 'like', "%{$search}%")
                  ->orWhere('publication_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('year')) {
            $query->where('publication_year', $request->input('year'));
        }

        $sortColumn = $request->input('sort_by', 'publication_year');
        $sortDirection = $request->input('sort_dir', 'desc');

        $allowedSorts = ['publication_year', 'citation_count', 'title'];
        if (!in_array($sortColumn, $allowedSorts)) {
            $sortColumn = 'publication_year';
        }
        if (!in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }

        $query->orderBy($sortColumn, $sortDirection);

        $perPage = min((int) $request->input('per_page', 10), 50);
        $publications = $query->paginate($perPage);

        return ScholarPublicationResource::collection($publications);
    }

    public function publicationCitationHistory(Request $request, int $publicationId)
    {
        $user = Auth::user();

        $profile = ScholarProfile::where('user_id', $user->id)->first();

        if (!$profile) {
            return ApiResponse::failed('Profil Google Scholar belum terhubung.');
        }

        $publication = ScholarPublication::where('publication_id', $publicationId)
            ->where('scholar_profile_id', $profile->scholar_profile_id)
            ->first();

        if (!$publication) {
            return ApiResponse::failed('Publikasi tidak ditemukan.');
        }

        $staleDays = 7;
        $cachedRecords = $publication->citationsByYear()->orderBy('year')->get();
        $isStale = true;

        if ($cachedRecords->isNotEmpty()) {
            $lastSynced = $cachedRecords->max('last_synced_at');
            $isStale = $lastSynced?->diffInDays(now()) >= $staleDays;
        }

        if ($cachedRecords->isEmpty() || $isStale) {
            $this->refreshPublicationCitationHistory($profile, $publication);
            $cachedRecords = $publication->citationsByYear()->orderBy('year')->get();
        }

        $currentYear = (int) now()->year;
        $startYear = $currentYear - 6;

        $yearMap = [];
        for ($y = $startYear; $y <= $currentYear; $y++) {
            $yearMap[$y] = 0;
        }

        foreach ($cachedRecords as $record) {
            if (isset($yearMap[$record->year])) {
                $yearMap[$record->year] = $record->citation_count;
            }
        }

        $citationsByYear = [];
        foreach ($yearMap as $year => $count) {
            $citationsByYear[] = [
                'year'           => $year,
                'citation_count' => $count,
            ];
        }

        $lastSyncedAt = $cachedRecords->max('last_synced_at');

        return ApiResponse::success([
            'publication' => [
                'id'               => $publication->publication_id,
                'title'            => $publication->title,
                'publication_year' => $publication->publication_year,
                'total_citations'  => $publication->citation_count,
            ],
            'range' => [
                'start_year' => $startYear,
                'end_year'   => $currentYear,
            ],
            'citations_by_year' => $citationsByYear,
            'last_synced_at'    => $lastSyncedAt?->toISOString(),
            'is_stale'          => $isStale,
        ]);
    }

    private function refreshPublicationCitationHistory(ScholarProfile $profile, ScholarPublication $publication): void
    {
        if (empty($publication->external_id)) {
            Log::info('Scholar: Skipping citation history refresh — no external_id', [
                'publication_id' => $publication->publication_id,
            ]);
            return;
        }

        $start = microtime(true);

        try {
            $provider = new SerpApiProvider();
            $history = $provider->fetchPublicationCitationHistory(
                $profile->scholar_author_id,
                $publication->external_id
            );

            $syncedAt = now();

            foreach ($history as $entry) {
                $publication->citationsByYear()->updateOrCreate(
                    ['year' => $entry['year']],
                    [
                        'citation_count' => $entry['citation_count'],
                        'last_synced_at' => $syncedAt,
                    ]
                );
            }

            $elapsed = round((microtime(true) - $start) * 1000);

            Log::info('Scholar: Citation history refreshed', [
                'publication_id'  => $publication->publication_id,
                'author_id'       => $profile->scholar_author_id,
                'citation_id'     => $publication->external_id,
                'years_returned'  => count($history),
                'elapsed_ms'      => $elapsed,
            ]);
        } catch (\Exception $e) {
            $elapsed = round((microtime(true) - $start) * 1000);

            Log::warning('Scholar: Citation history refresh failed', [
                'publication_id' => $publication->publication_id,
                'author_id'      => $profile->scholar_author_id,
                'message'        => $e->getMessage(),
                'elapsed_ms'     => $elapsed,
            ]);
        }
    }

    private function extractAuthorId(string $url): ?string
    {
        $parsed = parse_url($url);

        if (!$parsed || ($parsed['host'] ?? '') !== 'scholar.google.com') {
            return null;
        }

        parse_str($parsed['query'] ?? '', $params);

        $authorId = $params['user'] ?? null;

        if (empty($authorId) || !preg_match('/^[a-zA-Z0-9_-]+$/', $authorId)) {
            return null;
        }

        return $authorId;
    }
}
