<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScholarPublicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'publication_id'    => $this->publication_id,
            'external_id'       => $this->external_id,
            'title'             => $this->title,
            'authors'           => $this->authors,
            'publication_name'  => $this->publication_name,
            'publication_year'  => $this->publication_year,
            'citation_count'    => $this->citation_count,
            'publication_url'   => $this->publication_url,
            'last_synced_at'    => $this->last_synced_at?->toISOString(),
        ];
    }
}
