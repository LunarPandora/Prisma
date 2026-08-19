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
use App\Models\KegiatanPengajuan;

use App\Http\Resources\Admin\ProposalAdminResource;
use App\Http\Resources\Dosen\ProposalDosenResource;
use App\Http\Resources\Reviewer\ProposalReviewerResource;

use App\Http\Resources\Dosen\ProposalUploadResource;

use App\Services\ProposalDocxService;
use App\Services\DocumentService;
use App\Helpers\ApiResponse;

class ProposalWorkflowController extends Controller
{  
    public function tolakProposal(
        Request $request,
        DocumentService $documentService
    ) {
        DB::beginTransaction();

        try {

            /*
            |--------------------------------------------------------------------------
            | Find Proposal
            |--------------------------------------------------------------------------
            */

            $proposal = Proposal::with([
                'dokumen.versions'
            ])->findOrFail(
                $request->proposal_id
            );

            /*
            |--------------------------------------------------------------------------
            | Delete Physical Files
            |--------------------------------------------------------------------------
            */

            foreach ($proposal->dokumen as $dokumen) {

                foreach ($dokumen->versions as $version) {

                    if ($version->local_file_url) {

                        $documentService->delete(
                            $version->local_file_url
                        );
                    }
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Soft Delete Dokumen + Versions
            |--------------------------------------------------------------------------
            */

            foreach ($proposal->dokumen as $dokumen) {

                $dokumen->versions()->delete();

                $dokumen->delete();
            }

            /*
            |--------------------------------------------------------------------------
            | Delete Reviewer Assignments
            |--------------------------------------------------------------------------
            */

            PenugasanReviewer::where(
                'proposal_id',
                $proposal->proposal_id
            )->delete();

            /*
            |--------------------------------------------------------------------------
            | Update Proposal
            |--------------------------------------------------------------------------
            */

            $proposal->update([
                'status' => 'Ditolak',

                'ketua_seleksi_approved' => false,
                'staff_seleksi_approved' => false,

                'catatan' => trim($request->catatan) !== ''
                    ? $request->catatan
                    : '-'
            ]);

            \App\Services\NotificationService::create(
                userId: $proposal->user_id,
                type: 'proposal.rejected',
                title: 'Proposal ditolak',
                message: "Proposal \"{$proposal->judul}\" telah ditolak.",
                data: ['proposal_id' => $proposal->proposal_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'proposal', $proposal->kegiatan->skema_id, $proposal->proposal_id, $proposal->kegiatan->kode_kegiatan, $proposal->jenis_penelitian),
                key: "proposal.rejected.{$proposal->proposal_id}",
            );

            /*
            |--------------------------------------------------------------------------
            | Soft Delete Proposal
            |--------------------------------------------------------------------------
            */

            $proposal->delete();

            DB::commit();

            return ApiResponse::success();

        } catch (\Exception $e) {

            DB::rollBack();

            \Log::error(
                'Delete failed: ' . $e->getMessage()
            );

            return ApiResponse::failed();
        }
    }

    public function updateTahapProposal(Request $request)
    {
        DB::beginTransaction();

        try {
            $proposal = Proposal::with(['penugasan.review', 'kegiatan' => fn($q) => $q->withTrashed()])
                ->findOrFail($request->proposal_id);

            /*
            |--------------------------------------------------------------------------
            | Check Proposal Status
            |--------------------------------------------------------------------------
            */

            if ($proposal->status !== 'Menunggu persetujuan Ketua LPPM') {
                return ApiResponse::failed(
                    'Proposal belum siap untuk diproses. Status saat ini: ' . $proposal->status
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Check All Reviewer Reviews
            |--------------------------------------------------------------------------
            */

            $allReviewed = $proposal->penugasan->every(function ($item) {
                return
                    $item->status_review === 'Telah direview'
                    &&
                    $item->review !== null;
            });

            if (!$allReviewed) {
                return ApiResponse::failed();
            }

            /*
            |--------------------------------------------------------------------------
            | Move Proposal to Pengumuman Surat Tugas Stage
            |--------------------------------------------------------------------------
            | Laporan Ganjil + Genap are created later, when Admin uploads the
            | official SK document (PengumumanSuratTugasController::upload).
            |--------------------------------------------------------------------------
            */

            $pengumumanKegiatan = KegiatanPengajuan::where(
                'skema_id',
                $proposal->kegiatan?->skema_id
            )
            ->where(
                'jenis_penelitian',
                $proposal->jenis_penelitian
            )
            ->where('kode_kegiatan', 'PENGUMUMAN_SURAT_TUGAS')
            ->first();

            if (!$pengumumanKegiatan) {
                return ApiResponse::failed(
                    'Kegiatan Pengumuman Surat Tugas tidak ditemukan.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Update Proposal
            |--------------------------------------------------------------------------
            | Status remains 'Menunggu persetujuan Ketua LPPM' until SK is uploaded.
            |--------------------------------------------------------------------------
            */

            $proposal->update([
                'kegiatan_id' => $pengumumanKegiatan->kegiatan_id,
            ]);

            DB::commit();

            return ApiResponse::success();

        } catch (\Exception $e) {

            DB::rollBack();

            \Log::error(
                'Update failed: ' . $e->getMessage()
            );

            return ApiResponse::failed();
        }
    }
}
