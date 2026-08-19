<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sitasi extends Model
{
    use SoftDeletes;

    protected $primaryKey = 'sitasi_id';
    protected $table = 'sitasi';

    protected $fillable = [
        'laporan_id',
        'judul_sitasi',
        'sumber',
        'tahun',
        'url',
    ];

    public function laporan()
    {
        return $this->belongsTo(
            Laporan::class,
            'laporan_id',
            'laporan_id'
        );
    }
}
