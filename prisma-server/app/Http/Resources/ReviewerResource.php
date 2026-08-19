<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'reviewer_id' => $this->id,
            'nama' => $this->nama,
            'email' => $this->email,

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
