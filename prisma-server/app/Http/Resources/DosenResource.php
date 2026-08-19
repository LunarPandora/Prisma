<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DosenResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'user_id' => $this->id,
            'nama' => $this->nama,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status,
            'gender' => $this->gender,
            'created_at' => $this->created_at,
            'prodi_id' => $this->prodi_id,
            'nidn' => $this->nidn,
            'nuptk' => $this->nuptk,
            'avatar' => $this->avatar_url
        ];
    }
}
