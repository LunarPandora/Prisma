<?php

namespace App\Http\Resources\Dosen;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Settings;

class LaporanDosenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $proposal = $this->proposal;
        $settings = Settings::first();

        $isGanjil = $this->isGanjil();

        $judul = $isGanjil
            ? $proposal?->rencana_judul_publikasi_gan
            : $proposal?->rencana_judul_publikasi_gen;

        $members = collect()
            ->merge($proposal?->memberDosenProposal ?? [])
            ->merge($proposal?->memberMhswaProposal ?? [])
            ->merge($proposal?->memberKolabProposal ?? [])
            ->filter(fn ($item) => $item->semester === $this->semester)
            ->map(function ($item) {

                // ✅ explicit resolution based on actual relation
                if ($item->role === 'Dosen') {
                    $entity = $item->user;
                    $uniqueId = $entity?->id;
                    $identityType = 'user';
                }

                elseif ($item->role === 'Mahasiswa') {
                    $entity = $item->mahasiswa;
                    $uniqueId = $entity?->mhswa_id;
                    $identityType = 'mahasiswa';
                }

                elseif ($item->role === 'Kolaborator') {
                    $entity = $item->kolaborator;
                    $uniqueId = $entity?->kolab_id;
                    $identityType = 'kolaborator';
                }

                else {
                    $entity = null;
                    $uniqueId = null;
                    $identityType = 'unknown';
                }

                return [
                    'nama'          => $entity?->nama,
                    'avatar'        => $entity?->avatar_url ?? null,
                    'unique_id'     => $uniqueId,
                    'identity_type' => $identityType,
                    'role'          => $item->role,
                    'ttjp'          => $item->ttjp,
                ];
            })
            ->values();

        return [
            'laporan_id'  => $this->laporan_id,
            'proposal_id' => $this->proposal_id,

            'judul'       => $judul,
            'semester'    => $this->semester,
            'status'      => $this->status,
            'catatan'     => $this->catatan,

            'kode_kegiatan' => $this->kegiatan?->kode_kegiatan,
            'nama_kegiatan' => $this->kegiatan?->nama_kegiatan,
            'skema'        => $this->kegiatan?->skema?->nama_skema,

            'ketua' => $proposal?->user ? [
                'id'         => $proposal->user->id,
                'nama'       => $proposal->user->nama,
                'nidn'       => $proposal->user->nidn,
                'avatar'     => $proposal->user->avatar_url,
                'prodi'      => $proposal->user->prodi?->nama_prodi,
            ] : null,

            'jenis_penelitian' => $this->jenis_penelitian ?? $proposal?->jenis_penelitian,

            'penugasan' => $this->whenLoaded('penugasan', function () {
                return $this->penugasan->map(function ($p) {
                    return [
                        'penugasan_id'  => $p->penugasan_id,
                        'user_id'       => $p->user_id,
                        'status_review' => $p->status_review,
                        'reviewer' => $p->reviewer ? [
                            'id'         => $p->reviewer->id,
                            'nama'       => $p->reviewer->nama,
                            'avatar_url' => $p->reviewer->avatar_url,
                        ] : null,
                        'review' => $p->review,
                    ];
                })->values();
            }),

            // The current logged-in reviewer's own penugasan row on this
            // laporan (null for other roles). Used by PenilaianForm to
            // attach the review to the right assignment.
            'penugasan_id' => $this->when(
                auth()->user()?->role === 'Reviewer'
                && $this->relationLoaded('penugasan'),
                function () {
                    $mine = $this->penugasan->firstWhere(
                        'user_id',
                        auth()->id()
                    );
                    return $mine?->penugasan_id;
                }
            ),

            'detail' => [
                'judul_penelitian'  => $this->judul_penelitian,
                'target_publikasi'  => $this->target_publikasi,
                'nama_jurnal'       => $this->nama_jurnal,
                'link_jurnal'       => $this->link_jurnal,
                'institusi_mitra'   => $this->institusi_mitra,

                'realisasi_biaya_penelitian' => $this->realisasi_biaya_penelitian,
                'realisasi_biaya_publikasi' => $this->realisasi_biaya_publikasi,
                'realisasi_insentif'        => $this->realisasi_insentif,

                'link_publikasi'     => $this->link_publikasi,
                'link_laporan_akhir' => $this->link_laporan_akhir,
                'link_hki'           => $this->link_hki,
                'link_buku'          => $this->link_buku,
                'link_poster'        => $this->link_poster,
                'link_video'         => $this->link_video,

                'dana_dikembalikan'  => $this->dana_dikembalikan,

                'claim_dana_status'        => $this->claim_dana_status,
                'pengembalian_dana_status' => $this->pengembalian_dana_status,
                'pengembalian_dana_skipped_reason' => $this->pengembalian_dana_skipped_reason,

                'completed_at' => $this->completed_at,
                'dana_disetujui' => $this->dana_disetujui,

                'tgl_mulai'  => $this->tgl_mulai,
                'tgl_selesai' => $this->tgl_selesai,

                'ketua_diseminasi_approved' => $this->ketua_diseminasi_approved,
                'staff_diseminasi_approved' => $this->staff_diseminasi_approved,
                'has_pending_diseminasi_rejection' => $this->hasPendingDiseminasiRejection(),
                'pending_rejection_reason' => $this->pending_rejection_reason,
                'pending_rejection_id' => $this->pending_rejection_id,
                'has_rejected_by_ketua' => $this->hasRejectedByKetua(),
                'rejected_by_ketua_reason' => $this->rejected_by_ketua_reason,

                'has_pending_return_laporan' => $this->hasPendingReturnRequest(),
                'pending_return_laporan_reason' => $this->pending_return_request?->reason,
                'is_revisi' => $this->status === 'Revisi',

                'all_reviewers_completed' => $this->penugasan->isNotEmpty()
                    && $this->penugasan->every(
                        fn($p) => $p->status_review === 'Telah direview'
                    ),

                'hasil_pelaksanaan'           => $this->hasil_pelaksanaan,
                'status_luaran'               => $this->status_luaran,
                'peran_mitra'                 => $this->peran_mitra,
                'kendala_pelaksanaan'         => $this->kendala_pelaksanaan,
                'rencana_tahapan_selanjutnya' => $this->rencana_tahapan_selanjutnya,
                'daftar_pustaka'              => $this->daftar_pustaka,
            ],

            'dokumen' => $this->whenLoaded('dokumen', function () {

                return $this->dokumen->map(function ($dokumen) {

                    return [
                        'dokumen_id'     => $dokumen->dokumen_id,
                        'jenis_dokumen'  => $dokumen->jenis_dokumen,
                        'nama_file'      => $dokumen->nama_file,
                        'file_url'       => $dokumen->file_url,
                        'drive_file_url' => $dokumen->drive_file_url,
                        'tgl_upload'     => $dokumen->tgl_upload,
                        'current_version' => $dokumen->currentVersion ? [
                            'nama_file'    => $dokumen->currentVersion->nama_file,
                            'local_file_url' => $dokumen->currentVersion->local_file_url,
                        ] : null,
                    ];
                })->values();
            }),

            'progress' => [
                'tgl_mulai'   => $this->tgl_mulai,
                'tgl_submit'  => $this->tgl_submit,
                'tgl_selesai' => $this->tgl_selesai,
            ],

            'proposal' => [
                'topik'  => $proposal?->topik_penelitian,
                'bidang' => $proposal?->bidang_ilmu,
                'skema'  => $proposal?->skema,
            'jenis_penelitian' => $this->jenis_penelitian ?? $proposal?->jenis_penelitian,
            'jenis_penelitian_gan' => $proposal?->jenis_penelitian_gan,
            'jenis_penelitian_gen' => $proposal?->jenis_penelitian_gen,

                'target_publikasi_gan' => $proposal?->target_publikasi_gan,
                'target_publikasi_gen' => $proposal?->target_publikasi_gen,

                'rencana_judul_publikasi_gan' => $proposal?->rencana_judul_publikasi_gan,
                'rencana_judul_publikasi_gen' => $proposal?->rencana_judul_publikasi_gen,

                'ra_biaya_penelitian_gan' => $proposal?->ra_biaya_penelitian_gan,
                'ra_biaya_penelitian_gen' => $proposal?->ra_biaya_penelitian_gen,
                'ra_biaya_publikasi_gan'  => $proposal?->ra_biaya_publikasi_gan,
                'ra_biaya_publikasi_gen'  => $proposal?->ra_biaya_publikasi_gen,
                'ra_insentif_gan'         => $proposal?->ra_insentif_gan,
                'ra_insentif_gen'         => $proposal?->ra_insentif_gen,
            ],

            'members' => $members,

            'laporan_members' => $this->whenLoaded('laporanMember', function () {
                return $this->laporanMember
                    ->sortBy('position')
                    ->map(function ($item) {
                        if ($item->role === 'Dosen') {
                            $entity = $item->user;
                            $uniqueId = $entity?->id;
                            $identityType = 'user';
                        } elseif ($item->role === 'Mahasiswa') {
                            $entity = $item->mahasiswa;
                            $uniqueId = $entity?->mhswa_id;
                            $identityType = 'mahasiswa';
                        } elseif ($item->role === 'Kolaborator') {
                            $entity = $item->kolaborator;
                            $uniqueId = $entity?->kolab_id;
                            $identityType = 'kolaborator';
                        } else {
                            $entity = null;
                            $uniqueId = null;
                            $identityType = 'unknown';
                        }

                        return [
                            'laporan_member_id' => $item->laporan_member_id,
                            'nama'              => $entity?->nama,
                            'avatar'            => $entity?->avatar_url ?? null,
                            'unique_id'         => $uniqueId,
                            'identity_type'     => $identityType,
                            'role'              => $item->role,
                            'ttjp'              => $item->ttjp,
                            'position'          => $item->position,
                        ];
                    })->values();
            }),

            'realisasi_anggaran' => $this->whenLoaded('realisasiAnggaran', function () {
                return $this->realisasiAnggaran;
            }),

            'kriteria_penilaian'       => $settings?->kriteria_penilaian ?? [],
            'kriteria_kesesuaian_tema' => $settings?->list_kesesuaian_tema ?? [],
        ];
    }
}