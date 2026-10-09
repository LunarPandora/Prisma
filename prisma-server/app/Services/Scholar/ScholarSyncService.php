<?php

namespace App\Services\Scholar;

use App\Models\ScholarProfile;
use App\Models\ScholarCitationByYear;
use App\Models\ScholarPublication;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ScholarSyncService
{
    private SerpApiProvider $provider;

    public function __construct(SerpApiProvider $provider)
    {
        $this->provider = $provider;
    }

    public function sync(ScholarProfile $profile): void
    {
        $start = microtime(true);

        Log::info('Scholar: Sync started', [
            'profile_id'    => $profile->scholar_profile_id,
            'author_id'     => $profile->scholar_author_id,
        ]);

        DB::beginTransaction();

        try {
            $profile->update([
                'sync_status'     => 'syncing',
                'last_sync_error' => null,
            ]);

            $result = $this->provider->fetchAuthorProfile($profile->scholar_author_id);

            $profileData = $result['profile'] ?? [];

            $profile->update([
                'display_name'     => $profileData['name'] ?? $profile->display_name,
                'affiliation'      => $profileData['affiliation'] ?? $profile->affiliation,
                'total_citations'  => $profileData['total_citations'] ?? 0,
                'h_index'          => $profileData['h_index'] ?? 0,
                'i10_index'        => $profileData['i10_index'] ?? 0,
                'sync_status'      => 'success',
                'last_synced_at'   => now(),
                'last_sync_error'  => null,
            ]);

            $this->syncCitationsByYear($profile, $result['citations_by_year'] ?? []);
            $this->syncPublications($profile, $result['publications'] ?? []);

            DB::commit();

            $elapsed = round((microtime(true) - $start) * 1000);

            Log::info('Scholar: Sync completed successfully', [
                'profile_id'        => $profile->scholar_profile_id,
                'author_id'         => $profile->scholar_author_id,
                'display_name'      => $profileData['name'] ?? null,
                'total_citations'   => $profileData['total_citations'] ?? 0,
                'h_index'           => $profileData['h_index'] ?? 0,
                'publications_synced'=> count($result['publications'] ?? []),
                'elapsed_ms'        => $elapsed,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            $elapsed = round((microtime(true) - $start) * 1000);

            Log::error('Scholar: Sync failed', [
                'profile_id' => $profile->scholar_profile_id,
                'author_id'  => $profile->scholar_author_id,
                'message'    => $e->getMessage(),
                'elapsed_ms' => $elapsed,
            ]);

            $profile->update([
                'sync_status'     => 'failed',
                'last_sync_error' => $this->sanitizeError($e->getMessage()),
            ]);

            throw $e;
        }
    }

    private function syncCitationsByYear(ScholarProfile $profile, array $citations): void
    {
        foreach ($citations as $item) {
            $profile->citationsByYear()->updateOrCreate(
                ['year' => $item['year']],
                ['citation_count' => $item['citation_count']]
            );
        }
    }

    private function syncPublications(ScholarProfile $profile, array $publications): void
    {
        $syncedAt = now();

        foreach ($publications as $pub) {
            $externalId = $pub['external_id'] ?? null;

            if ($externalId) {
                $profile->publications()->updateOrCreate(
                    ['external_id' => $externalId],
                    [
                        'title'            => $pub['title'] ?? '',
                        'authors'          => $pub['authors'] ?? null,
                        'publication_name' => $pub['publication_name'] ?? null,
                        'publication_year' => $pub['publication_year'] ?? null,
                        'citation_count'   => $pub['citation_count'] ?? 0,
                        'publication_url'  => $pub['publication_url'] ?? null,
                        'last_synced_at'   => $syncedAt,
                    ]
                );
            } else {
                $normalizedTitle = $this->normalizeTitle($pub['title'] ?? '');
                $year = $pub['publication_year'] ?? null;

                $existing = $profile->publications()
                    ->where('external_id', null)
                    ->where('publication_year', $year)
                    ->whereRaw('LOWER(REPLACE(REPLACE(title, " ", ""), ".", "")) = ?', [$normalizedTitle])
                    ->first();

                if ($existing) {
                    $existing->update([
                        'authors'          => $pub['authors'] ?? $existing->authors,
                        'publication_name' => $pub['publication_name'] ?? $existing->publication_name,
                        'citation_count'   => $pub['citation_count'] ?? 0,
                        'publication_url'  => $pub['publication_url'] ?? $existing->publication_url,
                        'last_synced_at'   => $syncedAt,
                    ]);
                } else {
                    $profile->publications()->create([
                        'title'            => $pub['title'] ?? '',
                        'authors'          => $pub['authors'] ?? null,
                        'publication_name' => $pub['publication_name'] ?? null,
                        'publication_year' => $pub['publication_year'] ?? null,
                        'citation_count'   => $pub['citation_count'] ?? 0,
                        'publication_url'  => $pub['publication_url'] ?? null,
                        'last_synced_at'   => $syncedAt,
                    ]);
                }
            }
        }
    }

    private function normalizeTitle(string $title): string
    {
        return strtolower(preg_replace('/[\s.]+/', '', $title));
    }

    private function sanitizeError(string $message): string
    {
        $message = preg_replace('/api_key[=:]\s*\S+/i', 'api_key=***', $message);
        $message = preg_replace('/key[=:]\s*\S+/i', 'key=***', $message);
        return mb_substr($message, 0, 500);
    }
}
