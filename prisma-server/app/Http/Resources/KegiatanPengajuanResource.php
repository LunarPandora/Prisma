<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KegiatanPengajuanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'kegiatan_id' => $this->kegiatan_id,

            'skema_id' => $this->skema_id,
            'skema' => $this->skema?->nama_skema,

            'jenis_penelitian' => $this->jenis_penelitian,

            'kode_kegiatan' => $this->kode_kegiatan,
            'nama_kegiatan' => $this->nama_kegiatan,

            'tgl_mulai' => $this->tgl_mulai,
            'tgl_selesai' => $this->tgl_selesai,

            'status' => $this->effective_status,
            'raw_status' => $this->status,
            'manual_status_override' => $this->manual_status_override,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
