<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PenugasanReviewer;
use App\Models\Proposal;
use App\Models\KegiatanPengajuan;

// use App\Http\Resources\PenugasanReviewerResource;
use App\Helpers\ApiResponse;

class PenugasanReviewerController extends Controller
{
    public function fetch()
    {
        return ProposalDetail::collection(
            PenugasanReviewer::with(['prodi'])->orderBy('nim')->get()
        );
    }

    public function assignReviewers(Request $request)
    {
        try{
            $reviewerIds = $request->input('reviewer_id', []);

            /*
            |--------------------------------------------------------------------------
            | Resolve Subject (defaults to Proposal for backward compatibility)
            |--------------------------------------------------------------------------
            */

            $reviewableType = $request->input(
                'reviewable_type',
                'App\\Models\\Proposal'
            );

            $reviewableId = $request->input(
                'reviewable_id',
                $request->proposal_id
            );

            $baseQuery = PenugasanReviewer::where(
                'reviewable_type',
                $reviewableType
            )->where(
                'reviewable_id',
                $reviewableId
            );

            /*
            |--------------------------------------------------------------------------
            | Block Reviewer Change After Review Started
            |--------------------------------------------------------------------------
            | Per spec: "Admin may replace Reviewer before review starts."
            |--------------------------------------------------------------------------
            */

            $reviewStarted = $baseQuery->clone()
                ->where('status_review', 'Telah direview')
                ->exists();

            if ($reviewStarted && empty($reviewerIds)) {
                return ApiResponse::failed(
                    'Tidak dapat menghapus reviewer setelah review dimulai.'
                );
            }

            if (empty($reviewerIds)) {
                $baseQuery->clone()->forceDelete();
                return ApiResponse::success();
            }

            /*
            |--------------------------------------------------------------------------
            | Exactly 3 Reviewers Required
            |--------------------------------------------------------------------------
            */

            $uniqueReviewerIds = array_unique($reviewerIds);
            if (count($uniqueReviewerIds) !== count($reviewerIds)) {
                return ApiResponse::failed(
                    'Tidak boleh ada reviewer duplikat.'
                );
            }
            if (count($reviewerIds) !== 3) {
                return ApiResponse::failed(
                    'Harus tepat 3 reviewer yang ditugaskan. Saat ini: ' . count($reviewerIds)
                );
            }

            if ($reviewableType === 'App\\Models\\Laporan' && !empty($reviewerIds)) {
                $laporan = \App\Models\Laporan::find($reviewableId);
                if ($laporan) {
                    if (!$laporan->isDiseminasiFullyApproved()) {
                        return ApiResponse::failed(
                            'Reviewer hanya dapat ditugaskan setelah diseminasi disetujui oleh Ketua dan Staff LPPM.'
                        );
                    }
                    if ($laporan->hasPendingDiseminasiRejection()) {
                        return ApiResponse::failed(
                            'Reviewer tidak dapat ditugaskan karena ada permintaan penolakan yang belum diproses.'
                        );
                    }
                }
            }

            if ($reviewableType === 'App\\Models\\Proposal' && !empty($reviewerIds)) {
                $proposal = \App\Models\Proposal::find($reviewableId);
                if ($proposal) {
                    if (!$proposal->isSeleksiFullyApproved()) {
                        return ApiResponse::failed(
                            'Reviewer hanya dapat ditugaskan setelah seleksi disetujui oleh Ketua dan Staff LPPM.'
                        );
                    }
                    if ($proposal->hasPendingSeleksiRejection()) {
                        return ApiResponse::failed(
                            'Reviewer tidak dapat ditugaskan karena ada permintaan penolakan yang belum diproses.'
                        );
                    }
                }
            }

            $existing = $baseQuery->clone()
                ->pluck('user_id')
                ->toArray();

            $toInsert = array_diff($reviewerIds, $existing);
            $toDelete = array_diff($existing, $reviewerIds);

            /*
            |--------------------------------------------------------------------------
            | Deletions are blocked if that reviewer already reviewed
            |--------------------------------------------------------------------------
            */

            if (!empty($toDelete)) {

                $lockedIds = $baseQuery->clone()
                    ->whereIn('user_id', $toDelete)
                    ->where('status_review', 'Telah direview')
                    ->pluck('user_id')
                    ->toArray();

                if (!empty($lockedIds)) {
                    return ApiResponse::failed(
                        'Tidak dapat mengganti reviewer yang sudah selesai mereview.'
                    );
                }
            }

            foreach ($toInsert as $reviewerId) {
                PenugasanReviewer::create([
                    'proposal_id' => $reviewableType === 'App\\Models\\Proposal'
                        ? $reviewableId
                        : null,
                    'reviewable_type' => $reviewableType,
                    'reviewable_id'   => $reviewableId,
                    'user_id'         => $reviewerId,
                    'tgl_penugasan'   => date('Y-m-d')
                ]);
            }

            $baseQuery->clone()
                ->whereIn('user_id', $toDelete)
                ->forceDelete();

            if ($reviewableType === 'App\\Models\\Laporan' && !empty($toInsert)) {
                $laporan = \App\Models\Laporan::find($reviewableId);
                if ($laporan) {
                    $laporan->update(['status' => 'Menunggu hasil dari Reviewers']);
                }
            }

            return ApiResponse::success();
        }
        catch (\Exception $e) {
            \Log::error('Update failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }

    public function confirmAssignment(Request $request)
    {
        try{
            $reviewableType = $request->input(
                'reviewable_type',
                'App\\Models\\Proposal'
            );

            $reviewableId = $request->input(
                'reviewable_id',
                $request->proposal_id
            );

            $reviewerIds = $request->input('reviewer_id', []);

            /*
            |--------------------------------------------------------------------------
            | Exactly 3 Reviewers Required
            |--------------------------------------------------------------------------
            */

            $uniqueReviewerIds = array_unique($reviewerIds);
            if (count($uniqueReviewerIds) !== count($reviewerIds)) {
                return ApiResponse::failed(
                    'Tidak boleh ada reviewer duplikat.'
                );
            }
            if (count($reviewerIds) !== 3) {
                return ApiResponse::failed(
                    'Harus tepat 3 reviewer yang ditugaskan. Saat ini: ' . count($reviewerIds)
                );
            }

            if ($reviewableType === 'App\\Models\\Laporan' && !empty($reviewerIds)) {
                $laporan = \App\Models\Laporan::find($reviewableId);
                if ($laporan) {
                    if (!$laporan->isDiseminasiFullyApproved()) {
                        return ApiResponse::failed(
                            'Reviewer hanya dapat ditugaskan setelah diseminasi disetujui oleh Ketua dan Staff LPPM.'
                        );
                    }
                    if ($laporan->hasPendingDiseminasiRejection()) {
                        return ApiResponse::failed(
                            'Reviewer tidak dapat ditugaskan karena ada permintaan penolakan yang belum diproses.'
                        );
                    }
                }
            }

            if ($reviewableType === 'App\\Models\\Proposal' && !empty($reviewerIds)) {
                $proposal = \App\Models\Proposal::find($reviewableId);
                if ($proposal) {
                    if (!$proposal->isSeleksiFullyApproved()) {
                        return ApiResponse::failed(
                            'Reviewer hanya dapat ditugaskan setelah seleksi disetujui oleh Ketua dan Staff LPPM.'
                        );
                    }
                    if ($proposal->hasPendingSeleksiRejection()) {
                        return ApiResponse::failed(
                            'Reviewer tidak dapat ditugaskan karena ada permintaan penolakan yang belum diproses.'
                        );
                    }
                }
            }

            $baseQuery = PenugasanReviewer::where(
                'reviewable_type',
                $reviewableType
            )->where(
                'reviewable_id',
                $reviewableId
            );

            if (!empty($reviewerIds)) {

                $existing = $baseQuery->clone()
                    ->pluck('user_id')
                    ->toArray();

                $toInsert = array_diff($reviewerIds, $existing);
                $toDelete = array_diff($existing, $reviewerIds);

                if (!empty($toDelete)) {
                    $lockedIds = $baseQuery->clone()
                        ->whereIn('user_id', $toDelete)
                        ->where('status_review', 'Telah direview')
                        ->pluck('user_id')
                        ->toArray();

                    if (!empty($lockedIds)) {
                        return ApiResponse::failed(
                            'Tidak dapat mengganti reviewer yang sudah selesai mereview.'
                        );
                    }
                }

                foreach ($toInsert as $reviewerId) {
                    PenugasanReviewer::create([
                        'proposal_id'      => $reviewableType === 'App\\Models\\Proposal'
                            ? $reviewableId
                            : null,
                        'reviewable_type'  => $reviewableType,
                        'reviewable_id'    => $reviewableId,
                        'user_id'          => $reviewerId,
                        'tgl_penugasan'    => date('Y-m-d'),
                    ]);
                }

                $baseQuery->clone()
                    ->whereIn('user_id', $toDelete)
                    ->forceDelete();
            } else {
                $baseQuery->clone()->forceDelete();
            }

            if ($reviewableType === 'App\\Models\\Proposal') {
                $p = Proposal::with([
                    'kegiatan' => fn($q) => $q->withTrashed()
                ])->findOrFail($reviewableId);

                $seleksiKegiatan = KegiatanPengajuan::where(
                    'skema_id',
                    $p->kegiatan?->skema_id
                )
                ->where(
                    'jenis_penelitian',
                    $p->jenis_penelitian
                )
                ->where('kode_kegiatan', 'SELEKSI_PROPOSAL')
                ->first();

                $p->update([
                    'status' => 'Menunggu review',
                    'kegiatan_id' => $seleksiKegiatan
                        ? $seleksiKegiatan->kegiatan_id
                        : $p->kegiatan_id,
                ]);

                foreach ($reviewerIds as $reviewerId) {
                    $reviewer = \App\Models\User::find($reviewerId);
                    if ($reviewer) {
                        \App\Services\NotificationService::create(
                            userId: $reviewer->id,
                            type: 'proposal.reviewer.assigned',
                            title: 'Anda ditugaskan sebagai reviewer',
                            message: "Anda ditugaskan untuk mereview proposal \"{$p->judul}\".",
                            data: ['proposal_id' => $p->proposal_id],
                            actionUrl: \App\Helpers\NotificationUrl::forRole('Reviewer', 'proposal', $p->kegiatan->skema_id, $p->proposal_id, $p->kegiatan->kode_kegiatan, $p->jenis_penelitian),
                            key: "proposal.reviewer.assigned.{$p->proposal_id}.{$reviewer->id}",
                        );
                    }
                }

                \App\Services\NotificationService::create(
                    userId: $p->user_id,
                    type: 'proposal.reviewer.assigned',
                    title: 'Reviewer ditugaskan',
                    message: "Reviewer telah ditugaskan untuk proposal \"{$p->judul}\".",
                    data: ['proposal_id' => $p->proposal_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'proposal', $p->kegiatan->skema_id, $p->proposal_id, $p->kegiatan->kode_kegiatan, $p->jenis_penelitian),
                    key: "proposal.reviewer.assigned.dosen.{$p->proposal_id}",
                );
            } elseif ($reviewableType === 'App\\Models\\Laporan' && !empty($reviewerIds)) {
                $laporan = \App\Models\Laporan::find($reviewableId);
                if ($laporan) {
                    $laporan->update(['status' => 'Menunggu hasil dari Reviewers']);
                }
            }

            return ApiResponse::success();
        }
        catch (\Exception $e) {
            \Log::error('Update failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }
}
