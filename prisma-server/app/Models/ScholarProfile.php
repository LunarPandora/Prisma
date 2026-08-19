<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScholarProfile extends Model
{
    protected $primaryKey = 'scholar_profile_id';

    protected $fillable = [
        'user_id',
        'scholar_author_id',
        'profile_url',
        'display_name',
        'affiliation',
        'total_citations',
        'h_index',
        'i10_index',
        'sync_status',
        'last_synced_at',
        'last_sync_error',
    ];

    protected $casts = [
        'total_citations' => 'integer',
        'h_index'         => 'integer',
        'i10_index'       => 'integer',
        'last_synced_at'  => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function citationsByYear(): HasMany
    {
        return $this->hasMany(ScholarCitationByYear::class, 'scholar_profile_id', 'scholar_profile_id');
    }

    public function publications(): HasMany
    {
        return $this->hasMany(ScholarPublication::class, 'scholar_profile_id', 'scholar_profile_id');
    }
}
