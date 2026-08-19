<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProposalAdminResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'proposal_id'                   => $this->proposal_id, 

            'jenis_penelitian'              => $this->jenis_penelitian,
            'jenis_penelitian_gan'          => $this->jenis_penelitian_gan,
            'jenis_penelitian_gen'          => $this->jenis_penelitian_gen,
            'judul'                         => $this->judul,
            'topik_penelitian'              => $this->topik_penelitian,
            'bidang_ilmu'                   => $this->bidang_ilmu,
            'fokus_sdgs'                    => $this->fokus_sdg,
            'ra_biaya_penelitian_gan'        => $this->ra_biaya_penelitian_gan,
            'ra_biaya_publikasi_gan'        => $this->ra_biaya_publikasi_gan,
            'ra_insentif_gan'               => $this->ra_insentif_gan,
            'ra_biaya_penelitian_gen'        => $this->ra_biaya_penelitian_gen,
            'ra_biaya_publikasi_gen'        => $this->ra_biaya_publikasi_gen,
            'ra_insentif_gen'               => $this->ra_insentif_gen,

            'target_publikasi_gan'          => $this->target_publikasi_gan,
            'target_publikasi_gen'          => $this->target_publikasi_gen,
            'rencana_judul_publikasi_gan'   => $this->rencana_judul_publikasi_gan,
            'rencana_judul_publikasi_gen'   => $this->rencana_judul_publikasi_gen,
            'metopen_gan'                   => $this->metopen_gan,
            'metopen_gen'                   => $this->metopen_gen,
            'unit_analisis_gan'             => $this->unit_analisis_gan,
            'unit_analisis_gen'             => $this->unit_analisis_gen,

            'kontribusi_ilmu_makul'         => $this->kontribusi_ilmu_makul,
            'kontribusi_pkm'                => $this->kontribusi_pkm,
            
            'rencana_luaran'                => $this->rencana_luaran,
            'institusi_mitra'               => $this->institusi_mitra,
            'tgl_pengajuan'                 => $this->tgl_pengajuan,
            'skema'                         => $this->skema,
            'sumber_skema'                  => $this->sumber_skema,

            'penugasan'                     => $this->penugasan,
            'dokumen'                       => $this->dokumen,
            'status'                        => $this->status,

            'ketua_seleksi_approved'        => $this->ketua_seleksi_approved,
            'staff_seleksi_approved'        => $this->staff_seleksi_approved,

            'has_pending_seleksi_rejection' => $this->hasPendingSeleksiRejection(),
            'pending_seleksi_rejection_reason' => $this->pending_seleksi_rejection_reason,
            'pending_seleksi_rejection_id'  => $this->pending_seleksi_rejection_id,
            'has_rejected_by_ketua_seleksi' => $this->hasRejectedByKetuaSeleksi(),
            'rejected_by_ketua_seleksi_reason' => $this->rejected_by_ketua_seleksi_reason,

            'has_pending_rejection_request' => $this->hasPendingRejectionRequest(),
            'has_pending_return_request' => $this->hasPendingReturnRequest(),
            'has_pending_destructive_action' => $this->hasPendingDestructiveAction(),
            'is_revisi' => $this->isRevisi(),

            'dosen'                         => $this->user,
            'member_dosen_proposal'         => $this->memberDosenProposal->map(function ($item) {
                                                    return [
                                                        'user_id'   => $item->member_id,
                                                        'nama'      => $item->user?->nama,
                                                        'avatar'    => $item->user?->avatar_url,                                                        'unique_id' => $item->user?->nidn,
                                                        'unique_id' => $item->user?->nidn,
                                                        'ttjp'      => $item->ttjp,
                                                        'semester'  => $item->semester,
                                                    ];
                                                }),
            'member_mhswa_proposal'         => $this->memberMhswaProposal->map(function ($item) {
                                                    return [
                                                        'mhswa_id'  => $item->member_id,
                                                        'nama'      => $item->mahasiswa?->nama,
                                                        'avatar'    => $item->mahasiswa?->avatar_url,                                                        'unique_id' => $item->mahasiswa?->nim,
                                                        'unique_id' => $item->mahasiswa?->nim,
                                                        'ttjp'      => $item->ttjp,
                                                        'semester'  => $item->semester,
                                                    ];
                                                }),
            'member_kolab_proposal'         => $this->memberKolabProposal->map(function ($item) {
                                                    return [
                                                        'kolab_id'  => $item->member_id,
                                                        'nama'      => $item->kolaborator?->nama,
                                                        'avatar'    => $item->kolaborator?->avatar_url,                                                        'unique_id' => $item->kolaborator?->nidn,
                                                        'unique_id' => $item->kolaborator?->nidn,
                                                        'ttjp'      => $item->ttjp,
                                                        'semester'  => $item->semester,
                                                    ];
                                                }),

            'kegiatan_id'                    => $this->kegiatan?->kegiatan_id,
            'nama_kegiatan'                  => $this->kegiatan?->nama_kegiatan,
            'kode_kegiatan'                  => $this->kegiatan?->kode_kegiatan,

            'kriteria_penilaian'            => $this->kriteria_penilaian ?? [],
            'kriteria_kesesuaian_tema'      => $this->kriteria_kesesuaian_tema ?? [],
            
            'created_at'                    => $this->created_at, 
            'updated_at'                    => $this->updated_at,
        ];
    }
}
