<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchHistory extends Model
{
    protected $fillable = [
        'peneliti_detail_id',
        'kategori',
        'judul',
        'tahun',
        'dana_disetujui',
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