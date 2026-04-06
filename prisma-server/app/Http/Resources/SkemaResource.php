<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SkemaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'skema_id' => $this->skema_id, 
            'nama_skema' => $this->nama_skema, 
            'jenis' => $this->jenis, 
            'keterangan' => $this->keterangan, 
            'created_at' => $this->created_at
        ];
    }
}
