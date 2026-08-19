<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class KolaboratorResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'kolab_id' => $this->kolab_id,
            'nama' => $this->nama,
            'email' => $this->email,
            'no_hp' => $this->no_hp,
            'nidn' => empty($this->nidn) ? "-" : $this->nidn,
            'nuptk' => empty($this->nuptk) ? "-" : $this->nuptk,
            'prodi' => $this->prodi,
            'institusi' => $this->institusi,
            'created_at' => $this->created_at,
            'avatar' => $this->avatar_url
        ];
    }
}
