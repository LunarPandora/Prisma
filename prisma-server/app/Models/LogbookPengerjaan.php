<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogbookPengerjaan extends Model
{
    protected $primaryKey = 'logbook_id';
    protected $table = 'logbook_pengerjaan';

    protected $fillable = [
        'laporan_id',
        'user_id',
        'judul',
        'deskripsi',
        'tgl_kegiatan',
        'tgl_kegiatan_end',
        'lampiran_drive_id',
        'lampiran_drive_url',
    ];

    protected $casts = [
        'tgl_kegiatan' => 'date',
        'tgl_kegiatan_end' => 'date',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function laporan()
    {
        return $this->belongsTo(
            Laporan::class,
            'laporan_id',
            'laporan_id'
        );
    }

    public function user()
    {
        return $this->belongsTo(
            User::class,
            'user_id',
            'id'
        );
    }
}