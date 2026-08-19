<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScholarPublicationCitationByYear extends Model
{
    protected $table = 'scholar_publication_citations_by_year';
    protected $primaryKey = 'publication_citation_id';

    protected $fillable = [
        'scholar_publication_id',
        'year',
        'citation_count',
        'last_synced_at',
    ];

    protected $casts = [
        'year'           => 'integer',
        'citation_count' => 'integer',
        'last_synced_at' => 'datetime',
    ];

    public function publication(): BelongsTo
    {
        return $this->belongsTo(ScholarPublication::class, 'scholar_publication_id', 'publication_id');
    }
}
