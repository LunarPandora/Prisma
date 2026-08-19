<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScholarProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'scholar_profile_id' => $this->scholar_profile_id,
            'user_id'            => $this->user_id,
            'scholar_author_id'  => $this->scholar_author_id,
            'profile_url'        => $this->profile_url,
            'display_name'       => $this->display_name,
            'affiliation'        => $this->affiliation,
            'total_citations'    => $this->total_citations,
            'h_index'            => $this->h_index,
            'i10_index'          => $this->i10_index,
            'sync_status'        => $this->sync_status,
            'last_synced_at'     => $this->last_synced_at?->toISOString(),
            'last_sync_error'    => $this->last_sync_error,
            'citations_by_year'  => $this->whenLoaded('citationsByYear', function () {
                return $this->citationsByYear
                    ->sortBy('year')
                    ->values()
                    ->map(fn ($c) => [
                        'citation_id'     => $c->citation_id,
                        'year'            => $c->year,
                        'citation_count'  => $c->citation_count,
                    ]);
            }),
            'publications_count' => $this->whenCounted('publications'),
            'created_at'         => $this->created_at?->toISOString(),
            'updated_at'         => $this->updated_at?->toISOString(),
        ];
    }
}
