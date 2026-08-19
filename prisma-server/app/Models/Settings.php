<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Settings extends Model
{
    protected $primaryKey = "id";
    protected $table = "settings";

    protected $fillable = [
        'kepala_lppm',
        'rektor',
        'rektor_nama',
        'rektor_nidn',
        'rektor_nuptk',
        'nama_kampus',
        'kriteria_penilaian',
        'list_kesesuaian_tema',
        'ignore_kegiatan_dates',
    ];

    protected $casts = [
        'kriteria_penilaian' => 'array',
        'list_kesesuaian_tema' => 'array',
    ];

    public function kepalaLppmUser()
    {
        return $this->belongsTo(User::class, 'kepala_lppm', 'id');
    }

    public function rektorUser()
    {
        return $this->belongsTo(User::class, 'rektor', 'id');
    }
}
