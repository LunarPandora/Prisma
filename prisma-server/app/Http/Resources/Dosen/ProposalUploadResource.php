<?php

namespace App\Http\Resources\Dosen;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProposalUploadResource extends JsonResource
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
                                                
            'halaman_template'              => $this->dokumen,

            'kegiatan_id'                    => $this->kegiatan?->kegiatan_id,
            'nama_kegiatan'                  => $this->kegiatan?->nama_kegiatan,

            'penugasan'                     => $this->penugasan,
            'status'                        => $this->status,

            'created_at'                    => $this->created_at, 
            'updated_at'                    => $this->updated_at,
        ];
    }
}
