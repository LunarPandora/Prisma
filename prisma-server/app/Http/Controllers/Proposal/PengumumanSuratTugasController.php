<?php

namespace App\Http\Controllers\Proposal;
use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Proposal;
use App\Models\Dokumen;
use App\Models\DokumenVersion;
use App\Models\Laporan;
use App\Models\KegiatanPengajuan;
use App\Models\Settings;

use App\Services\PengumumanSuratTugasService;
use App\Services\DocumentService;
use App\Helpers\ApiResponse;

class PengumumanSuratTugasController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Fetch Surat Tugas Documents for a Skema + Jenis
    |--------------------------------------------------------------------------
    */

    public function fetch(Request $request)
    {
        try {

            $kegiatan = $this->findKegiatan(
                $request->skema_id,
                $request->jenis_penelitian,
                'PENGUMUMAN_SURAT_TUGAS'
            );

            if (!$kegiatan) {
                return ApiResponse::failed(
                    'Kegiatan Pengumuman Surat Tugas tidak ditemukan.'
                );
            }

            $dokumen = $kegiatan->dokumen()
                ->with('currentVersion')
                ->whereIn('jenis_dokumen', [
                    'Pengumuman Surat Tugas',
                    'SK Resmi'
                ])
                ->get();

            return ApiResponse::success([
                'kegiatan' => $kegiatan,
                'dokumen' => $dokumen,
            ]);

        } catch (\Exception $e) {

            \Log::error($e);

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Generate Pengumuman Surat Tugas Document
    |--------------------------------------------------------------------------
    */

    public function generate(
        Request $request,
        PengumumanSuratTugasService $pengumumanSuratTugasService
    ) {
        DB::beginTransaction();

        try {

            $kegiatan = $this->findKegiatan(
                $request->skema_id,
                $request->jenis_penelitian,
                'PENGUMUMAN_SURAT_TUGAS'
            );

            if (!$kegiatan) {
                return ApiResponse::failed(
                    'Kegiatan Pengumuman Surat Tugas tidak ditemukan.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Proposals in Pengumuman Stage
            |--------------------------------------------------------------------------
            */

            $proposals = Proposal::with([
                'user' => fn($q) => $q->withTrashed(),
                'user.prodi',
            ])
            ->where('kegiatan_id', $kegiatan->kegiatan_id)
            ->where('status', '!=', 'Ditolak')
            ->orderBy('proposal_id')
            ->get();

            if ($proposals->count() < 1) {
                return ApiResponse::failed(
                    'Belum ada proposal yang lolos seleksi pada kegiatan ini.'
                );
            }

            $settings = Settings::with([
                'kepalaLppmUser',
                'rektorUser'
            ])->first();

            /*
            |--------------------------------------------------------------------------
            | Generate Document
            |--------------------------------------------------------------------------
            */

            $docxPath = $pengumumanSuratTugasService->generate(
                $kegiatan,
                $proposals,
                $settings
            );

            /*
            |--------------------------------------------------------------------------
            | Store as Dokumen Version
            |--------------------------------------------------------------------------
            */

            $dokumen = $kegiatan->dokumen()
                ->firstOrCreate([
                    'jenis_dokumen' => 'Pengumuman Surat Tugas'
                ]);

            $nextVersion = (
                $dokumen->versions()->max('version') ?? 0
            ) + 1;

            $version = $dokumen->versions()->create([
                'version'          => $nextVersion,

                'nama_file'        => basename($docxPath),

                'drive_file_id'    => '-',
                'drive_file_url'   => '-',

                'local_file_url'   => $docxPath,

                'uploaded_by'      => auth()->id(),

                'catatan_revisi'   => $nextVersion === 1
                    ? 'Generate pengumuman surat tugas awal'
                    : 'Regenerate pengumuman surat tugas',

                'tgl_upload'       => now(),
            ]);

            $dokumen->update([
                'current_version_id' => $version->version_id
            ]);

            DB::commit();

            return ApiResponse::success(
                $dokumen->fresh()->load('currentVersion')
            );

        } catch (\Exception $e) {

            DB::rollBack();

            \Log::error(
                'Generate Surat Tugas failed: ' . $e->getMessage()
            );

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Upload Official Surat Tugas
    |--------------------------------------------------------------------------
    | After upload:
    | - Close SELEKSI_PROPOSAL and PENGUMUMAN_SURAT_TUGAS
    | - Open the next stage (PROSES_PENELITIAN_GANJIL / CLAIM_DANA_GANJIL)
    | - Move approved proposals into the next stage
    | - Split each proposal into Laporan Ganjil + Laporan Genap
    |--------------------------------------------------------------------------
    */

    public function upload(
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

            $kegiatan = $this->findKegiatan(
                $request->skema_id,
                $request->jenis_penelitian,
                'PENGUMUMAN_SURAT_TUGAS'
            );

            if (!$kegiatan) {
                return ApiResponse::failed(
                    'Kegiatan Pengumuman Surat Tugas tidak ditemukan.'
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
                'documents/sk'
            );

            $originalName = pathinfo(
                $file->getClientOriginalName(),
                PATHINFO_FILENAME
            );

            $extension = $file->getClientOriginalExtension();

            $timestamp = now()->format('Ymd_His');

            $namaFile = $originalName . '_' . $timestamp . '.' . $extension;

            /*
            |--------------------------------------------------------------------------
            | Store as Dokumen Version
            |--------------------------------------------------------------------------
            */

            $dokumen = $kegiatan->dokumen()
                ->firstOrCreate([
                    'jenis_dokumen' => 'SK Resmi'
                ]);

            $nextVersion = (
                $dokumen->versions()->max('version') ?? 0
            ) + 1;

            $version = $dokumen->versions()->create([
                'version'          => $nextVersion,

                'nama_file'        => $namaFile,

                'drive_file_id'    => '-',
                'drive_file_url'   => '-',

                'local_file_url'   => $relativePath,

                'uploaded_by'      => auth()->id(),

                'catatan_revisi'   => $nextVersion === 1
                    ? 'Upload SK resmi'
                    : 'Revisi SK resmi',

                'tgl_upload'       => now(),
            ]);

            $dokumen->update([
                'current_version_id' => $version->version_id
            ]);

            /*
            |--------------------------------------------------------------------------
            | Move Kegiatan Forward
            |--------------------------------------------------------------------------
            */

            $nextKegiatan = $this->moveToNextStage($kegiatan);

            /*
            |--------------------------------------------------------------------------
            | Split Proposals into Laporan Ganjil + Genap
            |--------------------------------------------------------------------------
            */

            $proposals = Proposal::where(
                'kegiatan_id',
                $kegiatan->kegiatan_id
            )
            ->where('status', '!=', 'Ditolak')
            ->get();

            foreach ($proposals as $proposal) {

                $this->splitLaporan($proposal);

                $proposal->update([
                    'kegiatan_id' => $nextKegiatan->kegiatan_id,
                    'tahap_penelitian' => 'Laporan',
                    'status' => 'Proposal Diterima',
                ]);
            }
            DB::commit();

            return ApiResponse::success();

        } catch (\Exception $e) {

            DB::rollBack();

            \Log::error(
                'Upload Surat Tugas failed: ' . $e->getMessage()
            );

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Accept Proposal (Per-Proposal Surat Tugas Upload)
    |--------------------------------------------------------------------------
    | Admin reviews the proposal, then uploads a Surat Tugas for it.
    | Status changes to "Proposal Diterima".
    | Laporan Ganjil + Genap are created, and the first stage is opened.
    |--------------------------------------------------------------------------
    */

    public function acceptProposal(
        Request $request,
        DocumentService $documentService
    ) {
        DB::beginTransaction();

        try {

            $request->validate([
                'proposal_id' => ['required', 'integer'],
                'uploaded_file' => [
                    'required',
                    'file',
                    'max:10240',
                    'mimes:pdf',
                    'mimetypes:application/pdf',
                ],
            ]);

            $proposal = Proposal::with([
                'kegiatan' => fn($q) => $q->withTrashed(),
            ])->findOrFail($request->proposal_id);

            if ($proposal->status !== 'Menunggu persetujuan Ketua LPPM') {
                return ApiResponse::failed(
                    'Proposal tidak dapat diterima. Status saat ini: '
                    . $proposal->status
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
                'documents/sk/proposal'
            );

            $originalName = pathinfo(
                $file->getClientOriginalName(),
                PATHINFO_FILENAME
            );

            $extension = $file->getClientOriginalExtension();
            $timestamp = now()->format('Ymd_His');
            $namaFile = $originalName . '_' . $timestamp . '.' . $extension;

            /*
            |--------------------------------------------------------------------------
            | Store as Dokumen (per-proposal)
            |--------------------------------------------------------------------------
            */

            $dokumen = $proposal->dokumen()
                ->firstOrCreate([
                    'jenis_dokumen' => 'Pengumuman Surat Tugas',
                ]);

            $nextVersion = (
                $dokumen->versions()->max('version') ?? 0
            ) + 1;

            $version = $dokumen->versions()->create([
                'version'          => $nextVersion,
                'nama_file'        => $namaFile,
                'drive_file_id'    => '-',
                'drive_file_url'   => '-',
                'local_file_url'   => $relativePath,
                'uploaded_by'      => auth()->id(),
                'catatan_revisi'   => $nextVersion === 1
                    ? 'Upload surat tugas proposal'
                    : 'Revisi surat tugas proposal',
                'tgl_upload'       => now(),
            ]);

            $dokumen->update([
                'current_version_id' => $version->version_id
            ]);

            /*
            |--------------------------------------------------------------------------
            | Update Proposal Status
            |--------------------------------------------------------------------------
            */

            $proposal->update([
                'status' => 'Proposal Diterima',
            ]);

            \App\Services\NotificationService::create(
                userId: $proposal->user_id,
                type: 'proposal.accepted',
                title: 'Proposal diterima',
                message: "Proposal \"{$proposal->judul}\" telah diterima. Surat tugas telah diterbitkan.",
                data: ['proposal_id' => $proposal->proposal_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'proposal', $proposal->kegiatan->skema_id, $proposal->proposal_id, $proposal->kegiatan->kode_kegiatan, $proposal->jenis_penelitian),
                key: "proposal.accepted.{$proposal->proposal_id}",
            );

            $members = \App\Models\ProposalMember::where('proposal_id', $proposal->proposal_id)->get();
            foreach ($members as $member) {
                if ($member->user_id && $member->user_id !== $proposal->user_id) {
                    \App\Services\NotificationService::create(
                        userId: $member->user_id,
                        type: 'proposal.accepted',
                        title: 'Proposal tim diterima',
                        message: "Proposal \"{$proposal->judul}\" telah diterima. Surat tugas telah diterbitkan.",
                        data: ['proposal_id' => $proposal->proposal_id],
                        actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'proposal', $proposal->kegiatan->skema_id, $proposal->proposal_id, $proposal->kegiatan->kode_kegiatan, $proposal->jenis_penelitian),
                        key: "proposal.accepted.member.{$proposal->proposal_id}.{$member->user_id}",
                    );
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Open First Laporan Stage (if not already open)
            |--------------------------------------------------------------------------
            */

            $firstStageKode = \App\Helpers\KegiatanStage::firstLaporanStage(
                $proposal->jenis_penelitian_gan,
                'Ganjil'
            );

            $firstStageKegiatan = $this->findKegiatan(
                $proposal->kegiatan?->skema_id,
                $proposal->jenis_penelitian_gan,
                $firstStageKode
            );

            if ($firstStageKegiatan && $firstStageKegiatan->status !== 'Terbuka') {
                $firstStageKegiatan->update([
                    'status' => 'Terbuka',
                    'manual_status_override' => true,
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Split into Laporan Ganjil + Genap
            |--------------------------------------------------------------------------
            */

            $this->splitLaporan($proposal);

            DB::commit();

            return ApiResponse::success(
                $proposal->fresh()->load('dokumen.currentVersion')
            );

        } catch (\Exception $e) {

            DB::rollBack();

            \Log::error(
                'Accept proposal failed: ' . $e->getMessage()
            );

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    private function findKegiatan($skemaId, $jenisPenelitian, $kodeKegiatan)
    {
        return KegiatanPengajuan::with('skema')
            ->where('skema_id', $skemaId)
            ->where('jenis_penelitian', $jenisPenelitian)
            ->where('kode_kegiatan', $kodeKegiatan)
            ->first();
    }

    private function moveToNextStage(KegiatanPengajuan $kegiatan)
    {
        /*
        |--------------------------------------------------------------------------
        | Close Seleksi + Pengumuman
        |--------------------------------------------------------------------------
        */

        KegiatanPengajuan::where('skema_id', $kegiatan->skema_id)
            ->where('jenis_penelitian', $kegiatan->jenis_penelitian)
            ->whereIn('kode_kegiatan', [
                'SELEKSI_PROPOSAL',
                'PENGUMUMAN_SURAT_TUGAS'
            ])
            ->update([
                'status' => 'Selesai',
                'manual_status_override' => true,
            ]);

        /*
        |--------------------------------------------------------------------------
        | Open Next Stage
        |--------------------------------------------------------------------------
        | After PENGUMUMAN_SURAT_TUGAS the workflow moves out of the Proposal sequence
        | into the first Laporan stage (Ganjil), which depends on jenis.
        |--------------------------------------------------------------------------
        */

        $nextKode = \App\Helpers\KegiatanStage::firstLaporanStage(
            $kegiatan->jenis_penelitian,
            'Ganjil'
        );

        $nextKegiatan = $this->findKegiatan(
            $kegiatan->skema_id,
            $kegiatan->jenis_penelitian,
            $nextKode
        );

        if (!$nextKegiatan) {
            throw new \Exception(
                "Kegiatan {$nextKode} tidak ditemukan untuk skema ini."
            );
        }

        $nextKegiatan->update([
            'status' => 'Terbuka',
            'manual_status_override' => true,
        ]);

        return $nextKegiatan;
    }

    private function splitLaporan(Proposal $proposal)
    {
        /*
        |--------------------------------------------------------------------------
        | Locate each semester's first stage from its own sequence.
        | Each semester may have a different jenis_penelitian.
        |--------------------------------------------------------------------------
        */

        $ganjilJenis = $proposal->jenis_penelitian_gan;
        $genapJenis = $proposal->jenis_penelitian_gen;

        $ganjilKode = \App\Helpers\KegiatanStage::firstLaporanStage(
            $ganjilJenis,
            'Ganjil'
        );

        $genapKode = \App\Helpers\KegiatanStage::firstLaporanStage(
            $genapJenis,
            'Genap'
        );

        $ganjilKegiatan = \App\Models\KegiatanPengajuan::where(
            'skema_id',
            $proposal->kegiatan?->skema_id
        )
        ->where('jenis_penelitian', $ganjilJenis)
        ->where('kode_kegiatan', $ganjilKode)
        ->first();

        $genapKegiatan = \App\Models\KegiatanPengajuan::where(
            'skema_id',
            $proposal->kegiatan?->skema_id
        )
        ->where('jenis_penelitian', $genapJenis)
        ->where('kode_kegiatan', $genapKode)
        ->first();

        /*
        |--------------------------------------------------------------------------
        | Laporan Ganjil
        |--------------------------------------------------------------------------
        */

        Laporan::firstOrCreate(
            [
                'proposal_id' => $proposal->proposal_id,
                'semester'    => 'Ganjil',
            ],
            [
                'judul_penelitian' => $proposal->rencana_judul_publikasi_gan,
                'kegiatan_id'       => $ganjilKegiatan?->kegiatan_id,
                'jenis_penelitian' => $ganjilJenis,
                'status'           => 'Belum dimulai',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Laporan Genap
        |--------------------------------------------------------------------------
        */

        Laporan::firstOrCreate(
            [
                'proposal_id' => $proposal->proposal_id,
                'semester'    => 'Genap',
            ],
            [
                'judul_penelitian' => $proposal->rencana_judul_publikasi_gen,
                'kegiatan_id'       => $genapKegiatan?->kegiatan_id,
                'jenis_penelitian' => $genapJenis,
                'status'           => 'Belum dimulai',
            ]
        );
    }
}
