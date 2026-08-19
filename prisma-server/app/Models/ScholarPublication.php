<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScholarPublication extends Model
{
    protected $primaryKey = 'publication_id';

    protected $fillable = [
        'scholar_profile_id',
        'external_id',
        'title',
        'authors',
        'publication_name',
        'publication_year',
        'citation_count',
        'publication_url',
        'last_synced_at',
    ];

    protected $casts = [
        'publication_year' => 'integer',
        'citation_count'   => 'integer',
        'last_synced_at'   => 'datetime',
    ];

    public function profile(): BelongsTo
    {
        return $this->belongsTo(ScholarProfile::class, 'scholar_profile_id', 'scholar_profile_id');
    }

    public function citationsByYear(): HasMany
    {
        return $this->hasMany(ScholarPublicationCitationByYear::class, 'scholar_publication_id', 'publication_id');
    }
}
