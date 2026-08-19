<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Publication extends Model
{
    protected $fillable = [
        'peneliti_detail_id',
        'jenis_jurnal',
        'pub_category_id',
        'peringkat',

        'judul',
        'peran',
        'nama_jurnal',

        'tahun',
        'volume',
        'issn',
        'doi',

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

    public function category()
    {
        return $this->belongsTo(
            PublicationCategory::class,
            'pub_category_id',
            'pub_category_id'
        );
    }
}