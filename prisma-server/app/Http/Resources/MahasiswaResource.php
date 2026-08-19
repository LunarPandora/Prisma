<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MahasiswaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'mhswa_id' => $this->mhswa_id,
            'nama' => $this->nama,
            'nim' => $this->nim,
            'email' => $this->email,
            'no_hp' => $this->no_hp,
            'prodi_id' => $this->prodi?->prodi_id,
            'nama_prodi' => $this->prodi?->nama_prodi,
            'created_at' => $this->created_at,
            'avatar' => $this->avatar_url
        ];
    }
}
