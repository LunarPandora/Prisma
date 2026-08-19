<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScholarCitationByYear extends Model
{
    protected $table = 'scholar_citations_by_year';
    protected $primaryKey = 'citation_id';

    protected $fillable = [
        'scholar_profile_id',
        'year',
        'citation_count',
    ];

    protected $casts = [
        'year'           => 'integer',
        'citation_count' => 'integer',
    ];

    public function profile(): BelongsTo
    {
        return $this->belongsTo(ScholarProfile::class, 'scholar_profile_id', 'scholar_profile_id');
    }
}
