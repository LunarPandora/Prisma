<?php

namespace App\Http\Resources\Reviewer;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use App\Models\Settings;

class ProposalReviewerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $status = $this->penugasan->firstWhere('user_id', Auth::id());
        $settings = Settings::first();

        return [
            'proposal_id'                   => $this->proposal_id, 
            'penugasan_id'                  => $this->penugasan_id,

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

            'ketua'                         => $this->user,
            'dokumen'                       => $this->dokumen,

            'member_dosen_proposal'         => $this->memberDosenProposal->map(function ($item) {
                                                    return [
                                                        'user_id'  => $item->member_id,
                                                        'nama'     => $item->user?->nama,
                                                        'avatar'   => $item->user?->avatar_url,
                                                        'ttjp'     => $item->ttjp,
                                                        'semester' => $item->semester,
                                                    ];
                                                }),
            'member_mhswa_proposal'         => $this->memberMhswaProposal->map(function ($item) {
                                                    return [
                                                        'mhswa_id' => $item->member_id,
                                                        'nama'     => $item->mahasiswa?->nama,
                                                        'avatar'   => $item->mahasiswa?->avatar_url,
                                                        'ttjp'     => $item->ttjp,
                                                        'semester' => $item->semester,
                                                    ];
                                                }),
            'member_kolab_proposal'         => $this->memberKolabProposal->map(function ($item) {
                                                    return [
                                                        'kolab_id' => $item->member_id,
                                                        'nama'     => $item->kolaborator?->nama,
                                                        'avatar'   => $item->kolaborator?->avatar_url,
                                                        'ttjp'     => $item->ttjp,
                                                        'semester' => $item->semester,
                                                    ];
                                                }),

            'kegiatan_id'                    => $this->kegiatan?->kegiatan_id,
            'nama_kegiatan'                  => $this->kegiatan?->nama_kegiatan,

            'penugasan'                     => $this->penugasan,
            'status'                        => $status->status_review,

            'kriteria_penilaian'            => $settings?->kriteria_penilaian ?? [],
            'kriteria_kesesuaian_tema'      => $settings?->list_kesesuaian_tema ?? [],

            'created_at'                    => $this->created_at, 
            'updated_at'                    => $this->updated_at,
        ];
    }
}
