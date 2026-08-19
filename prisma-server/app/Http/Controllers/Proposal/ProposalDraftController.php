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

class ProposalDraftController extends Controller
{
    public function createDraft(
        Request $request,
        DocumentService $documentService,
        ProposalDocxService $proposalDocxService
    ) {
        try {
            \Log::info($request->all());

            /*
            |--------------------------------------------------------------------------
            | Gate: PENERIMAAN_PROPOSAL kegiatan must be open (by date range).
            |--------------------------------------------------------------------------
            | Sanity check both here and at upload time so that a stale form
            | held open past the deadline cannot submit a proposal.
            |--------------------------------------------------------------------------
            */

            $kegiatan = \App\Models\KegiatanPengajuan::find($request->kegiatan_id);

            if (!$kegiatan
                || $kegiatan->kode_kegiatan !== 'PENERIMAAN_PROPOSAL'
            ) {
                return ApiResponse::failed(
                    'Kegiatan tidak valid untuk pengajuan proposal.'
                );
            }

            $today = date('Y-m-d');

            if (!$kegiatan->tgl_mulai || !$kegiatan->tgl_selesai) {
                return ApiResponse::failed(
                    'Kegiatan penerimaan proposal tidak sedang berlangsung.'
                );
            }

            $isOpen = $kegiatan->manual_status_override
                ? $kegiatan->status === 'Terbuka'
                : ($today >= $kegiatan->tgl_mulai && $today <= $kegiatan->tgl_selesai);

            if (!$isOpen) {
                return ApiResponse::failed(
                    'Kegiatan penerimaan proposal tidak sedang berlangsung.'
                );
            }

            $skema = \App\Models\Skema::find($kegiatan->skema_id);

            if (!$skema || $skema->status !== 'Aktif') {
                return ApiResponse::failed(
                    'Skema pengajuan tidak sedang aktif.'
                );
            }

            $status = ($request->mode == 'submit')
                ? 'Menunggu proposal untuk diupload'
                : 'Draft';

            $tgl_submit = ($request->mode == 'submit')
                ? date('Y-m-d')
                : null;

            /*
            |--------------------------------------------------------------------------
            | Create Proposal
            |--------------------------------------------------------------------------
            */

            $p = Proposal::create([
                'jenis_penelitian'              => $request->jenis_penelitian_gan,
                'jenis_penelitian_gan'          => $request->jenis_penelitian_gan,
                'jenis_penelitian_gen'          => $request->jenis_penelitian_gen,
                'judul'                         => $request->judul,
                'topik_penelitian'              => $request->topik_penelitian,
                'bidang_ilmu'                   => $request->bidang_ilmu,
                'fokus_sdg'                     => $request->fokus_sdgs,

                'ra_biaya_penelitian_gan'        => $request->ra_biaya_penelitian_gan,
                'ra_biaya_publikasi_gan'        => $request->ra_biaya_publikasi_gan,
                'ra_insentif_gan'               => $request->ra_insentif_gan,
                'ra_biaya_penelitian_gen'        => $request->ra_biaya_penelitian_gen,
                'ra_biaya_publikasi_gen'        => $request->ra_biaya_publikasi_gen,
                'ra_insentif_gen'               => $request->ra_insentif_gen,

                'target_publikasi_gan'          => $request->target_publikasi_gan,
                'target_publikasi_gen'          => $request->target_publikasi_gen,

                'rencana_judul_publikasi_gan'   => $request->rencana_judul_publikasi_gan,
                'rencana_judul_publikasi_gen'   => $request->rencana_judul_publikasi_gen,

                'metopen_gan'                   => $request->metopen_gan,
                'metopen_gen'                   => $request->metopen_gen,

                'unit_analisis_gan'             => $request->unit_analisis_gan,
                'unit_analisis_gen'             => $request->unit_analisis_gen,

                'kontribusi_ilmu_makul'         => $request->kontribusi_ilmu_makul,
                'kontribusi_pkm'                => $request->kontribusi_pkm,

                'rencana_luaran'                => $request->rencana_luaran,
                'institusi_mitra'               => $request->institusi_mitra,

                'user_id'                       => auth()->id(),
                'kegiatan_id'                    => $request->kegiatan_id,

                'skema'                         => $request->skema,
                'sumber_skema'                  => $request->sumber_skema,

                'status'                        => $status,
                'tgl_pengajuan'                 => $tgl_submit,
                'catatan'                       => '-'
            ]);

            /*
            |--------------------------------------------------------------------------
            | Add Members
            |--------------------------------------------------------------------------
            */

            $researcherList = json_decode(
                $request->researcher_list,
                true
            ) ?? [];

            $this->createMembers(
                $p->proposal_id,
                $researcherList
            );

            /*
            |--------------------------------------------------------------------------
            | Generate DOCX Only If Submitted
            |--------------------------------------------------------------------------
            */

            if ($status !== 'Draft') {

                /*
                |--------------------------------------------------------------------------
                | Reload Full Relations
                |--------------------------------------------------------------------------
                */

                $proposal = Proposal::with([
                    'user',
                    'user.prodi',
                    'kegiatan'
                ])->find($p->proposal_id);

                $proposalMembers = ProposalMember::with([
                    'user',
                    'user.prodi',
                    'mahasiswa',
                    'kolaborator'
                ])
                ->where('proposal_id', $p->proposal_id)
                ->get();

                $prodi = $proposal->user->prodi;

                $settings = Settings::with([
                    'kepalaLppmUser',
                    'rektorUser'
                ])->first();

                /*
                |--------------------------------------------------------------------------
                | Generate DOCX
                |--------------------------------------------------------------------------
                */

                $docxPath = $proposalDocxService->generate(
                    $proposal,
                    $proposalMembers,
                    $prodi,
                    $settings
                );

                /*
                |--------------------------------------------------------------------------
                | Create Dokumen Container
                |--------------------------------------------------------------------------
                */

                $dokumen = $proposal->dokumen()->create([
                    'jenis_dokumen' => 'Halaman Pengesahan'
                ]);

                /*
                |--------------------------------------------------------------------------
                | Create First Version
                |--------------------------------------------------------------------------
                */

                $version = $dokumen->versions()->create([
                    'version'          => 1,

                    'nama_file'        => basename($docxPath),

                    'drive_file_id'    => '-',
                    'drive_file_url'   => '-',

                    'local_file_url'   => $docxPath,

                    'uploaded_by'      => auth()->id(),

                    'catatan_revisi'   => 'Generate halaman pengesahan awal',

                    'tgl_upload'       => now()
                ]);

                /*
                |--------------------------------------------------------------------------
                | Set Current Version
                |--------------------------------------------------------------------------
                */

                $dokumen->update([
                    'current_version_id' => $version->version_id
                ]);
            }

            return ApiResponse::success();

        } catch (\Exception $e) {

            \Log::error('Create failed: ' . $e->getMessage());

            return ApiResponse::failed($e->getMessage());
        }
    }

    public function updateDraft(
        Request $request,
        DocumentService $documentService,
        ProposalDocxService $proposalDocxService
    ) {
        DB::beginTransaction();

        try {

            $proposal = Proposal::where('proposal_id', $request->proposal_id)
                ->where('user_id', auth()->id())
                ->first();

            if (!$proposal) {
                DB::rollBack();
                return ApiResponse::failed('Proposal tidak ditemukan atau bukan milik Anda.');
            }

            $status = ($request->mode == 'submit')
                ? 'Menunggu proposal untuk diupload'
                : 'Draft';

            $tgl_submit = ($request->mode == 'submit')
                ? date('Y-m-d')
                : null;

            /*
            |--------------------------------------------------------------------------
            | Update Proposal
            |--------------------------------------------------------------------------
            */

            $proposal->update([
                'topik_penelitian'              => $request->topik_penelitian,
                'jenis_penelitian'             => $request->jenis_penelitian_gan,
                'jenis_penelitian_gan'         => $request->jenis_penelitian_gan,
                'jenis_penelitian_gen'         => $request->jenis_penelitian_gen,
                'judul'                        => $request->judul,
                'bidang_ilmu'                  => $request->bidang_ilmu,
                'fokus_sdg'                    => $request->fokus_sdgs,

                'ra_biaya_penelitian_gan'       => $request->ra_biaya_penelitian_gan,
                'ra_biaya_publikasi_gan'       => $request->ra_biaya_publikasi_gan,
                'ra_insentif_gan'              => $request->ra_insentif_gan,
                'ra_biaya_penelitian_gen'       => $request->ra_biaya_penelitian_gen,
                'ra_biaya_publikasi_gen'       => $request->ra_biaya_publikasi_gen,
                'ra_insentif_gen'              => $request->ra_insentif_gen,

                'target_publikasi_gan'         => $request->target_publikasi_gan,
                'target_publikasi_gen'         => $request->target_publikasi_gen,

                'rencana_judul_publikasi_gan'  => $request->rencana_judul_publikasi_gan,
                'rencana_judul_publikasi_gen'  => $request->rencana_judul_publikasi_gen,

                'metopen_gan'                  => $request->metopen_gan,
                'metopen_gen'                  => $request->metopen_gen,

                'unit_analisis_gan'            => $request->unit_analisis_gan,
                'unit_analisis_gen'            => $request->unit_analisis_gen,

                'kontribusi_ilmu_makul'        => $request->kontribusi_ilmu_makul,
                'kontribusi_pkm'               => $request->kontribusi_pkm,

                'rencana_luaran'               => $request->rencana_luaran,
                'institusi_mitra'              => $request->institusi_mitra,

                'user_id'                      => auth()->id(),
                'kegiatan_id'                   => $request->kegiatan_id,

                'skema'                        => $request->skema,
                'sumber_skema'                 => $request->sumber_skema,

                'status'                       => $status,
                'tgl_pengajuan'                => $tgl_submit,
                'catatan'                      => '-'
            ]);

            /*
            |--------------------------------------------------------------------------
            | Sync Members
            |--------------------------------------------------------------------------
            */

            $researcherList = json_decode(
                $request->researcher_list,
                true
            ) ?? [];

            collect($researcherList)
                ->groupBy('type')
                ->each(function ($members, $type) use ($request) {
                    $this->syncMembers(
                        $request->proposal_id,
                        $members->values()->toArray(),
                        $type
                    );
                });

            /*
            |--------------------------------------------------------------------------
            | Generate DOCX Only If Submitted
            |--------------------------------------------------------------------------
            */

            if ($status !== 'Draft') {

                /*
                |--------------------------------------------------------------------------
                | Reload Relations
                |--------------------------------------------------------------------------
                */

                $proposal->load([
                    'user',
                    'user.prodi',
                    'kegiatan'
                ]);

                $proposalMembers = ProposalMember::with([
                    'user',
                    'user.prodi',
                    'mahasiswa',
                    'kolaborator'
                ])
                ->where(
                    'proposal_id',
                    $proposal->proposal_id
                )
                ->get();

                $prodi = $proposal->user->prodi;

                $settings = Settings::with([
                    'kepalaLppmUser',
                    'rektorUser'
                ])->first();

                /*
                |--------------------------------------------------------------------------
                | Generate DOCX
                |--------------------------------------------------------------------------
                */

                $docxPath = $proposalDocxService->generate(
                    $proposal,
                    $proposalMembers,
                    $prodi,
                    $settings
                );

                /*
                |--------------------------------------------------------------------------
                | Find/Create Dokumen Container
                |--------------------------------------------------------------------------
                */

                $dokumen = $proposal->dokumen()
                    ->firstOrCreate([
                        'jenis_dokumen' => 'Halaman Pengesahan'
                    ]);

                /*
                |--------------------------------------------------------------------------
                | Get Next Version Number
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

                    'nama_file'        => basename($docxPath),

                    'drive_file_id'    => '-',
                    'drive_file_url'   => '-',

                    'local_file_url'   => $docxPath,

                    'uploaded_by'      => auth()->id(),

                    'catatan_revisi'   => $nextVersion === 1
                        ? 'Generate halaman pengesahan awal'
                        : 'Generate ulang halaman pengesahan',

                    'tgl_upload'       => now()
                ]);

                /*
                |--------------------------------------------------------------------------
                | Update Current Version
                |--------------------------------------------------------------------------
                */

                $dokumen->update([
                    'current_version_id' => $version->version_id
                ]);
            }

            DB::commit();

            return ApiResponse::success();

        } catch (\Exception $e) {

            DB::rollBack();

            \Log::error(
                'Update failed: ' . $e->getMessage()
            );

            return ApiResponse::failed(
                $e->getMessage()
            );
        }
    }

    private function createMembers($proposalId, $members)
    {
        foreach ($members as $member) {
            ProposalMember::create([
                'proposal_id' => $proposalId,
                'member_id'   => $member['id'],
                'role'        => $member['type'],
                'ttjp'        => $member['ttjp'],
                'semester'    => $member['semester']
            ]);
        }
    }

    private function syncMembers($proposalId, $list, $role)
    {
        $newMap = collect($list)->mapWithKeys(fn($item) => [
            $item['id'].'-'.$item['semester'] => $item
        ]);

        $existing = ProposalMember::where('proposal_id', $proposalId)
            ->where('role', $role)
            ->get();

        $existingMap = $existing->mapWithKeys(fn($item) => [
            $item->member_id.'-'.$item->semester => $item
        ]);

        $toInsert = $newMap->keys()->diff($existingMap->keys());
        $toDelete = $existingMap->keys()->diff($newMap->keys());
        $toUpdate = $newMap->keys()->intersect($existingMap->keys());

        foreach ($toInsert as $key) {
            $item = $newMap[$key];

            ProposalMember::create([
                'proposal_id' => $proposalId,
                'member_id'   => $item['id'],
                'role'        => $role,
                'semester'    => $item['semester'],
                'ttjp'        => $item['ttjp'],
            ]);
        }

        foreach ($toUpdate as $key) {
            $item = $newMap[$key];

            ProposalMember::where('proposal_id', $proposalId)
                ->where('member_id', $item['id'])
                ->where('role', $role)
                ->where('semester', $item['semester'])
                ->update([
                    'ttjp' => $item['ttjp']
                ]);
        }

        foreach ($toDelete as $key) {
            [$member_id, $semester] = explode('-', $key);

            ProposalMember::where('proposal_id', $proposalId)
                ->where('member_id', $member_id)
                ->where('role', $role)
                ->where('semester', $semester)
                ->delete();
        }
    }
}
