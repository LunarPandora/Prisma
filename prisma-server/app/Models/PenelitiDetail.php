<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PenelitiDetail extends Model
{
    protected $fillable = [
        'user_id',
        'kolab_id',
        'jabatan',
        'pangkat_golongan',
        'no_hp',

        'sinta_id',
        'scopus_id',
        'google_scholar_id',
        'h_index',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function kolaborator()
    {
        return $this->belongsTo(
            Kolaborator::class,
            'kolab_id',
            'kolab_id'
        );
    }

    public function publications()
    {
        return $this->hasMany(Publication::class);
    }

    public function books()
    {
        return $this->hasMany(Book::class);
    }

    public function hkis()
    {
        return $this->hasMany(Hki::class);
    }

    public function researchHistories()
    {
        return $this->hasMany(ResearchHistory::class);
    }
}