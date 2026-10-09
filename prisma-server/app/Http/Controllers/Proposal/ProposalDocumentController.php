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

class ProposalDocumentController extends Controller
{
    public function prepareProposalUpload(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | Load Proposal
        |--------------------------------------------------------------------------
        */

        $proposal = Proposal::with([
            'user' => fn($q) => $q->withTrashed(),

            'dokumen' => fn($q) => $q->withTrashed()
                ->where('jenis_dokumen', 'Halaman Pengesahan')
                ->limit(1),
        ])
        ->where('proposal_id', $request->proposal_id)
        ->first();

        if (!$proposal) {
            \Log::error('Fetch failed: No document were found.');

            return ApiResponse::failed();
        }

        $absolutePath = storage_path('app/' . $proposal->local_file_url);

        /*
        |--------------------------------------------------------------------------
        | Check File Exists
        |--------------------------------------------------------------------------
        */

        if (!file_exists($absolutePath)) {
            \Log::error('Fetch failed: File does not exist.');

            return ApiResponse::failed();
        }

        /*
        |--------------------------------------------------------------------------
        | Return
        |--------------------------------------------------------------------------
        */

        if ($proposal->dokumen->isEmpty()) {
            return ApiResponse::failed();
        }

        return ApiResponse::success($proposal->dokumen[0]->file_url);
    }

    public function uploadProposal(
        Request $request,
        DocumentService $documentService
    ) {
        DB::beginTransaction();

        try {

            $request->validate([
                'uploaded_file' => [
                    'required',
                    'file',
                    'max:10240',
                    'mimes:pdf',
                    'mimetypes:application/pdf',
                ],
            ]);

            /*
            |--------------------------------------------------------------------------
            | Find Proposal
            |--------------------------------------------------------------------------
            */

            $proposal = Proposal::with(['kegiatan' => fn($q) => $q->withTrashed()])
                ->findOrFail($request->proposal_id);

            /*
            |--------------------------------------------------------------------------
            | Gate: PENERIMAAN_PROPOSAL kegiatan must still be open
            |--------------------------------------------------------------------------
            */

            $kegiatan = $proposal->kegiatan;
            $today = date('Y-m-d');

            if (!$kegiatan
                || $kegiatan->kode_kegiatan !== 'PENERIMAAN_PROPOSAL'
                || !$kegiatan->tgl_mulai
                || !$kegiatan->tgl_selesai
            ) {
                DB::rollBack();
                return ApiResponse::failed(
                    'Batas waktu upload proposal untuk kegiatan ini telah berakhir.'
                );
            }

            $isOpen = $kegiatan->manual_status_override
                ? $kegiatan->status === 'Terbuka'
                : ($today >= $kegiatan->tgl_mulai && $today <= $kegiatan->tgl_selesai);

            if (!$isOpen) {
                DB::rollBack();
                return ApiResponse::failed(
                    'Batas waktu upload proposal untuk kegiatan ini telah berakhir.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Upload File
            |--------------------------------------------------------------------------
            */

            $file = $request->file('uploaded_file');

            $relativePath = $documentService->upload(
                $file,
                'documents/proposal'
            );

            /*
            |--------------------------------------------------------------------------
            | Generate File Name
            |--------------------------------------------------------------------------
            */

            $originalName = pathinfo(
                $file->getClientOriginalName(),
                PATHINFO_FILENAME
            );

            $extension = $file->getClientOriginalExtension();

            $timestamp = now()->format('Ymd_His');

            $namaFile = $originalName . '_' . $timestamp . '.' . $extension;

            /*
            |--------------------------------------------------------------------------
            | Find/Create Dokumen Container
            |--------------------------------------------------------------------------
            */

            $dokumen = $proposal->dokumen()
                ->firstOrCreate([
                    'jenis_dokumen' => 'Dokumen Proposal'
                ]);

            /*
            |--------------------------------------------------------------------------
            | Get Next Version
            |--------------------------------------------------------------------------
            */

            $nextVersion = (
                $dokumen->versions()->max('version') ?? 0
            ) + 1;

            /*
            |--------------------------------------------------------------------------
            | Create New Version
            |--------------------------------------------------------------------------
            */

            $version = $dokumen->versions()->create([
                'version'          => $nextVersion,

                'nama_file'        => $namaFile,

                'drive_file_id'    => '-',
                'drive_file_url'   => '-',

                'local_file_url'   => $relativePath,

                'uploaded_by'      => auth()->id(),

                'catatan_revisi'   => $nextVersion === 1
                    ? 'Upload proposal awal'
                    : 'Revisi dokumen proposal',

                'tgl_upload'       => now(),
            ]);

            /*
            |--------------------------------------------------------------------------
            | Set Current Version
            |--------------------------------------------------------------------------
            */

            $dokumen->update([
                'current_version_id' => $version->version_id
            ]);

            /*
            |--------------------------------------------------------------------------
            | Update Proposal Status & Kegiatan
            |--------------------------------------------------------------------------
            */

            $seleksiKegiatan = \App\Models\KegiatanPengajuan::where(
                'skema_id',
                $proposal->kegiatan?->skema_id
            )
            ->where(
                'jenis_penelitian',
                $proposal->jenis_penelitian
            )
            ->where('kode_kegiatan', 'SELEKSI_PROPOSAL')
            ->first();

            $proposal->update([
                'status' => 'Menunggu review Staff LPPM',
                'kegiatan_id' => $seleksiKegiatan
                    ? $seleksiKegiatan->kegiatan_id
                    : $proposal->kegiatan_id,
            ]);

            \App\Services\NotificationService::createForRole(
                role: 'Staff LPPM',
                type: 'proposal.submitted',
                title: 'Proposal baru menunggu pengecekan',
                message: "Proposal \"{$proposal->judul}\" telah diajukan oleh {$proposal->user->nama}.",
                data: ['proposal_id' => $proposal->proposal_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'proposal', $proposal->kegiatan->skema_id, $proposal->proposal_id, $proposal->kegiatan->kode_kegiatan, $proposal->jenis_penelitian),
                key: "proposal.submitted.{$proposal->proposal_id}",
            );

            DB::commit();

            return ApiResponse::success();

        } catch (\Exception $e) {

            DB::rollBack();

            \Log::error(
                'Upload failed: ' . $e->getMessage()
            );

            return ApiResponse::failed();
        }
    }
}
