<?php

namespace App\Http\Controllers\Proposal;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Proposal;
use App\Models\ProposalMember;
use App\Models\Dokumen;
use App\Models\DokumenVersion;
use App\Models\PenugasanReviewer;
use App\Models\Settings;
use App\Models\Laporan;

use App\Http\Resources\Admin\ProposalAdminResource;
use App\Http\Resources\Dosen\ProposalDosenResource;
use App\Http\Resources\Reviewer\ProposalReviewerResource;

use App\Http\Resources\Dosen\ProposalUploadResource;

use App\Services\ProposalDocxService;
use App\Services\DocumentService;
use App\Helpers\ApiResponse;

class ProposalController extends Controller
{
    public function index(Request $request)
    {
        $query = Proposal::with([
            'prodi',

            'user' => fn($q) => $q->withTrashed(),
            
            'kegiatan' => fn($q) => $q->withTrashed(),

            'dokumen.currentVersion' => fn($q) => $q->withTrashed(),

            'penugasan' => fn($q) =>
                $q->select(
                    'penugasan_id',
                    'proposal_id',
                    'user_id',
                    'tgl_penugasan',
                    'status_review'
                )
                ->with([
                    'reviewer' => fn($q2) =>
                        $q2->select(
                            'id',
                            'nama',
                            'avatar'
                        ),
                    'review'
                ]),

            'memberDosenProposal' => fn($q) =>
                $q->where('role', 'Dosen')
                ->select('prop_member_id', 'proposal_id', 'member_id', 'ttjp', 'semester')
                ->with([
                    'user' => fn($q2) =>
                        $q2->select(
                            'id',
                            'nama',
                            'avatar',
                            'nidn'
                        )
                ]),

            'memberMhswaProposal' => fn($q) =>
                $q->where('role', 'Mahasiswa')
                ->select('prop_member_id', 'proposal_id', 'member_id', 'ttjp', 'semester')
                ->with([
                    'mahasiswa' => fn($q2) =>
                        $q2->select(
                            'mhswa_id',
                            'nama',
                            'avatar',
                            'nim'
                        )
                ]),

            'memberKolabProposal' => fn($q) =>
                $q->where('role', 'Kolaborator')
                ->select('prop_member_id', 'proposal_id', 'member_id', 'ttjp', 'semester')
                ->with([
                    'kolaborator' => fn($q2) =>
                        $q2->select(
                            'kolab_id',
                            'nama',
                            'avatar',
                            'nidn'
                        )
                ]),
        ]);

        if ($search = request('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                ->orWhereHas('user', function ($q2) use ($search) {
                    $q2->where('nama', 'like', "%{$search}%");
                })
                ->orWhereHas('penugasan.reviewer', function ($q2) use ($search) {
                    $q2->where('nama', 'like', "%{$search}%");
                });
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Filters
        |--------------------------------------------------------------------------
        */

        $this->applyFilters(
            $query,
            $request
        );

        $user = auth()->user();
        if ($user->role === 'Superadmin' || $user->role === 'Staff LPPM' || $user->role === 'Ketua LPPM') {

            $settings = Settings::first();

            $perPage = $request->input('per_page', 50);
            $orderedQuery = $query->orderByDesc('updated_at');

            $highlightPage = null;
            if ($request->filled('highlight_id')) {
                $allIds = (clone $orderedQuery)->pluck('proposal_id')->toArray();
                $pos = array_search((int) $request->highlight_id, array_map('intval', $allIds));
                if ($pos !== false) {
                    $highlightPage = intdiv($pos, $perPage) + 1;
                }
            }

            $page = $highlightPage ?? $request->input('page', 1);

            $paginator = $orderedQuery->paginate($perPage, ['*'], 'page', $page);

            $resource = ProposalAdminResource::collection(
                $paginator->through(fn ($proposal) =>
                    $this->detailKriteria(
                        $proposal,
                        $settings
                    )
                )
            );

            $resource->additional['highlight_page'] = $highlightPage;

            return $resource;
        }

        if ($user->role === 'Dosen') {
            $query->where('user_id', $user->id)->with(['kegiatan' => fn($q) => $q->withTrashed()->with('skema')]);

            $perPage = $request->input('per_page', 10);
            $orderedQuery = $query->orderByDesc('updated_at');

            $highlightPage = null;
            if ($request->filled('highlight_id')) {
                $allIds = (clone $orderedQuery)->pluck('proposal_id')->toArray();
                $pos = array_search((int) $request->highlight_id, array_map('intval', $allIds));
                if ($pos !== false) {
                    $highlightPage = intdiv($pos, $perPage) + 1;
                }
            }

            $page = $highlightPage ?? $request->input('page', 1);
            $paginator = $orderedQuery->paginate($perPage, ['*'], 'page', $page);

            $resource = ProposalDosenResource::collection($paginator);
            $resource->additional['highlight_page'] = $highlightPage;

            return $resource;
        }

        if ($user->role === 'Reviewer') {
            $query->whereHas('penugasan', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });

            $settings = Settings::first();

            $perPage = $request->input('per_page', 50);
            $orderedQuery = $query->orderByDesc('updated_at');

            $highlightPage = null;
            if ($request->filled('highlight_id')) {
                $allIds = (clone $orderedQuery)->pluck('proposal_id')->toArray();
                $pos = array_search((int) $request->highlight_id, array_map('intval', $allIds));
                if ($pos !== false) {
                    $highlightPage = intdiv($pos, $perPage) + 1;
                }
            }

            $page = $highlightPage ?? $request->input('page', 1);

            $resource = ProposalReviewerResource::collection(
                $orderedQuery
                    ->with(['penugasan.reviewer', 'dokumen.currentVersion'])
                    ->paginate($perPage, ['*'], 'page', $page)
                    ->through(fn ($proposal) =>
                        $this->detailKriteria(
                            $proposal,
                            $settings,
                            $user
                        )
                    )
            );
            $resource->additional['highlight_page'] = $highlightPage;

            return $resource;
        }
    }

    private function detailKriteria($proposal, $settings, $user = null)
    {
        /*
        |--------------------------------------------------------------------------
        | Get Current Reviewer's Penugasan ID
        |--------------------------------------------------------------------------
        */

        if ($user && $user->role === 'Reviewer') {

            $currentPenugasan = $proposal->penugasan
                ->firstWhere('user_id', $user->id);

            $proposal->setAttribute(
                'penugasan_id',
                $currentPenugasan?->penugasan_id
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Global Kriteria Penilaian
        |--------------------------------------------------------------------------
        */

        $proposal->setAttribute(
            'kriteria_kesesuaian_tema',
            $settings?->list_kesesuaian_tema ?? []
        );

        $proposal->setAttribute(
            'kriteria_penilaian',
            $settings?->kriteria_penilaian ?? []
        );

        return $proposal;
    }

    private function applyFilters($query, Request $request)
    {
        if ($request->filled('kode_kegiatan')) {
            $kodes = is_array($request->kode_kegiatan)
                ? $request->kode_kegiatan
                : explode(',', $request->kode_kegiatan);
            $query->whereHas('kegiatan', function ($q) use ($kodes) {
                $q->whereIn('kode_kegiatan', $kodes);
            });
        }

        if ($request->filled('kegiatan_id')) {
            $query->where('kegiatan_id', $request->kegiatan_id);
        }

        if ($request->filled('skema_id')) {
            $query->whereHas('kegiatan', function ($q) use ($request) {
                $q->where('skema_id', $request->skema_id);
            });
        }

        if ($request->filled('status')) {
            $statuses = is_array($request->status)
                ? $request->status
                : explode(',', $request->status);
            $query->whereIn('status', $statuses);
        }

        if ($request->filled('jenis_penelitian')) {
            $query->where(function ($q) use ($request) {
                $q->where('jenis_penelitian_gan', $request->jenis_penelitian)
                  ->orWhere('jenis_penelitian_gen', $request->jenis_penelitian);
            });
        }

        return $query;
    }
}
