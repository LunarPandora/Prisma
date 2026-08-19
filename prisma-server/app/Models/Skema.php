<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Skema extends Model
{
    use SoftDeletes;

    protected $table = 'skema';
    protected $primaryKey = 'skema_id';

    protected $fillable = [
        'nama_skema',
        'tahun_ajaran',
        'status',
    ];

    public function kegiatan()
    {
        return $this->hasMany(
            KegiatanPengajuan::class,
            'skema_id',
            'skema_id'
        );
    }
}