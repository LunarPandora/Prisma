<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PeriodePengajuanResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'periode_id' => $this->periode_id, 
            'skema_id' => $this->skema_id, 
            'nama_skema' => $this->skema?->nama_skema, 
            'nama_periode' => $this->nama_periode, 
            'tgl_mulai' => $this->tgl_mulai, 
            'tgl_selesai' => $this->tgl_selesai, 
            'status' => $this->status, 
            'created_at' => $this->created_at
        ];
    }
}
