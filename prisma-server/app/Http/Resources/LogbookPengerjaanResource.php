<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LogbookPengerjaanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'logbook_id' => $this->logbook_id,

            'laporan_id' => $this->laporan_id,

            'judul'      => $this->judul,
            'deskripsi'  => $this->deskripsi,

            'tgl_kegiatan' => $this->tgl_kegiatan,

            'lampiran_drive_id'  => $this->lampiran_drive_id,
            'lampiran_drive_url' => $this->lampiran_drive_url,

            'user' => [
                'id'    => $this->user?->id,
                'nama'  => $this->user?->nama,
                'avatar'=> $this->user?->avatar_url,
            ],

            'laporan' => [
                'laporan_id' => $this->laporan?->laporan_id,
                'status'     => $this->laporan?->status,
            ],

            'created_at' => $this->created_at,
        ];
    }
}