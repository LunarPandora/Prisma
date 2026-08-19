<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\PenugasanReviewer;
use App\Helpers\ApiResponse;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Create Review
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        try {
            /*
            |--------------------------------------------------------------------------
            | Check Penugasan
            |--------------------------------------------------------------------------
            */

            $penugasan = PenugasanReviewer::findOrFail(
                $request->penugasan_id
            );

            /*
            |--------------------------------------------------------------------------
            | Ownership Check — only the assigned reviewer may submit
            |--------------------------------------------------------------------------
            */

            if ($penugasan->user_id !== auth()->id()) {
                return ApiResponse::failed(
                    'Anda tidak memiliki akses untuk review ini.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Prevent Duplicate Review
            |--------------------------------------------------------------------------
            */

            $existing = Review::where(
                'penugasan_id',
                $request->penugasan_id
            )->first();

            if ($existing) {
                \Log::error('Review already exists', [
                    'penugasan_id' => $request->penugasan_id,
                ]);

                return ApiResponse::failed('Review already exists');
            }

            /*
            |--------------------------------------------------------------------------
            | Create Review + All-Reviewers-Complete Check (Atomic)
            |--------------------------------------------------------------------------
            | Wrap the review creation and the "all reviewers complete" check
            | inside a single DB transaction with row-level locking to prevent
            | race conditions when two reviewers submit simultaneously.
            |--------------------------------------------------------------------------
            */

            DB::transaction(function () use ($request, $penugasan) {

                /*
                |--------------------------------------------------------------------------
                | Create Review
                |--------------------------------------------------------------------------
                */

                Review::create([
                    'penugasan_id' => $request->penugasan_id,
                    'keputusan' => $request->keputusan,
                    'catatan' => $request->catatan,
                    'tgl_review' => now(),

                    'kriteria_kesesuaian_tema' => json_decode(
                        $request->kriteria_kesesuaian_tema,
                        true
                    ),

                    'kriteria_penilaian' => json_decode(
                        $request->kriteria_penilaian,
                        true
                    ),
                ]);

                $penugasan->status_review = 'Telah direview';
                $penugasan->save();

                /*
                |--------------------------------------------------------------------------
                | Diseminasi: promote laporan when all reviewers approved
                |--------------------------------------------------------------------------
                | Mirrors the Proposal admin-approve flow, but scoped to a Laporan.
                |--------------------------------------------------------------------------
                */

                if ($penugasan->reviewable_type === 'App\\Models\\Laporan') {

                    $penugasanList = PenugasanReviewer::with('review')
                        ->where('reviewable_type', 'App\\Models\\Laporan')
                        ->where('reviewable_id', $penugasan->reviewable_id)
                        ->lockForUpdate()
                        ->get();

                    $allReviewed = $penugasanList->every(
                        fn($p) => $p->status_review === 'Telah direview'
                    );

                    if ($allReviewed) {

                        $laporan = \App\Models\Laporan::with('kegiatan')
                            ->where('laporan_id', $penugasan->reviewable_id)
                            ->lockForUpdate()
                            ->first();

                        if ($laporan) {

                            /*
                            |--------------------------------------------------------------------------
                            | All reviewers complete: advance to Ketua final decision
                            |--------------------------------------------------------------------------
                            | Ketua LPPM will review all results and make accept/reject decision.
                            |--------------------------------------------------------------------------
                            */

                            $laporan->update([
                                'status' => 'Menunggu keputusan Ketua',
                            ]);

                            \App\Services\NotificationService::createForRole(
                                role: 'Ketua LPPM',
                                type: 'laporan.reviews.complete',
                                title: 'Semua review Laporan selesai',
                                message: "Semua reviewer telah menyelesaikan review laporan \"{$laporan->judul_penelitian}\".",
                                data: ['laporan_id' => $laporan->laporan_id],
                                actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                                key: "laporan.reviews.complete.{$laporan->laporan_id}",
                            );

                            \App\Services\NotificationService::createForRole(
                                role: 'Staff LPPM',
                                type: 'laporan.reviews.complete',
                                title: 'Semua review Laporan selesai',
                                message: "Semua reviewer telah menyelesaikan review laporan \"{$laporan->judul_penelitian}\".",
                                data: ['laporan_id' => $laporan->laporan_id],
                                actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                                key: "laporan.reviews.complete.staff.{$laporan->laporan_id}",
                            );

                            \App\Services\NotificationService::create(
                                userId: $laporan->proposal->user_id,
                                type: 'laporan.reviews.complete',
                                title: 'Semua review selesai',
                                message: "Semua review untuk laporan \"{$laporan->judul_penelitian}\" telah selesai.",
                                data: ['laporan_id' => $laporan->laporan_id],
                                actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                                key: "laporan.reviews.complete.dosen.{$laporan->laporan_id}",
                            );
                        }
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | Proposal: auto-advance to "Menunggu review admin" when all reviewers complete
                |--------------------------------------------------------------------------
                */

                if ($penugasan->reviewable_type === 'App\\Models\\Proposal') {

                    $penugasanList = PenugasanReviewer::with('review')
                        ->where('reviewable_type', 'App\\Models\\Proposal')
                        ->where('reviewable_id', $penugasan->reviewable_id)
                        ->lockForUpdate()
                        ->get();

                    $allReviewed = $penugasanList->every(
                        fn($p) => $p->status_review === 'Telah direview'
                    );

                    if ($allReviewed) {

                        $proposal = \App\Models\Proposal::where('proposal_id', $penugasan->reviewable_id)
                            ->lockForUpdate()
                            ->first();

                        if ($proposal && $proposal->status === 'Menunggu review') {

                            $proposal->update([
                                'status' => 'Menunggu persetujuan Ketua LPPM',
                            ]);

                            \App\Services\NotificationService::createForRole(
                                role: 'Ketua LPPM',
                                type: 'proposal.reviews.complete',
                                title: 'Semua review selesai',
                                message: "Semua reviewer telah menyelesaikan review proposal \"{$proposal->judul}\".",
                                data: ['proposal_id' => $proposal->proposal_id],
                                actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'proposal', $proposal->kegiatan->skema_id, $proposal->proposal_id, $proposal->kegiatan->kode_kegiatan, $proposal->jenis_penelitian),
                                key: "proposal.reviews.complete.{$proposal->proposal_id}",
                            );

                            \App\Services\NotificationService::createForRole(
                                role: 'Staff LPPM',
                                type: 'proposal.reviews.complete',
                                title: 'Semua review selesai',
                                message: "Semua reviewer telah menyelesaikan review proposal \"{$proposal->judul}\".",
                                data: ['proposal_id' => $proposal->proposal_id],
                                actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'proposal', $proposal->kegiatan->skema_id, $proposal->proposal_id, $proposal->kegiatan->kode_kegiatan, $proposal->jenis_penelitian),
                                key: "proposal.reviews.complete.staff.{$proposal->proposal_id}",
                            );

                            \App\Services\NotificationService::create(
                                userId: $proposal->user_id,
                                type: 'proposal.reviews.complete',
                                title: 'Semua review selesai',
                                message: "Semua review untuk proposal \"{$proposal->judul}\" telah selesai.",
                                data: ['proposal_id' => $proposal->proposal_id],
                                actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'proposal', $proposal->kegiatan->skema_id, $proposal->proposal_id, $proposal->kegiatan->kode_kegiatan, $proposal->jenis_penelitian),
                                key: "proposal.reviews.complete.dosen.{$proposal->proposal_id}",
                            );
                        }
                    }
                }
            });

            return ApiResponse::success();
        }
        catch (\Exception $e) {

            \Log::error(
                'Review create failed: ' .
                $e->getMessage()
            );

            return ApiResponse::failed($e->getMessage());
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Update Review
    |--------------------------------------------------------------------------
    */

    public function update(Request $request)
    {
        try {
            /*
            |--------------------------------------------------------------------------
            | Find Review
            |--------------------------------------------------------------------------
            */

            $review = Review::findOrFail(
                $request->review_id
            );

            /*
            |--------------------------------------------------------------------------
            | Ownership Check — only the assigned reviewer may update
            |--------------------------------------------------------------------------
            */

            $penugasan = PenugasanReviewer::find($review->penugasan_id);

            if (!$penugasan || $penugasan->user_id !== auth()->id()) {
                return ApiResponse::failed(
                    'Anda tidak memiliki akses untuk mengubah review ini.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Update Review
            |--------------------------------------------------------------------------
            */

            $review->update([

                'keputusan' => $request->keputusan,

                'catatan' => $request->catatan,

                'tgl_review' => now(),

                'kriteria_kesesuaian_tema' => json_decode(
                    $request->kriteria_kesesuaian_tema,
                    true
                ),

                'kriteria_penilaian' => json_decode(
                    $request->kriteria_penilaian,
                    true
                ),
            ]);

            return ApiResponse::success();

        }
        catch (\Exception $e) {
            \Log::error(
                'Review update failed: ' .
                $e->getMessage()
            );

            return ApiResponse::failed($e->getMessage());
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Single Review
    |--------------------------------------------------------------------------
    */

    public function show(Request $request, $id)
    {
        try {
            $review = Review::with([
                'penugasan'
            ])->findOrFail($id);

            $penugasan = PenugasanReviewer::find($review->penugasan_id);

            if (!$penugasan || $penugasan->user_id !== $request->user()->id) {
                return ApiResponse::failed('Review tidak ditemukan atau bukan milik Anda.');
            }

            return ApiResponse::success($review);
        }
        catch (\Exception $e) {
            \Log::error(
                'Review fetch failed: ' .
                $e->getMessage()
            );

            return ApiResponse::failed($e->getMessage());
        }
    }
}