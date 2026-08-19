<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hki extends Model
{
    protected $fillable = [
        'peneliti_detail_id',

        'judul',

        'tahun',

        'jenis',
        'nomor',
        'status',

        'url',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function penelitiDetail()
    {
        return $this->belongsTo(PenelitiDetail::class);
    }
}