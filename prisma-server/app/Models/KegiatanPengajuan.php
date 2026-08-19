<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class KegiatanPengajuan extends Model
{
    use SoftDeletes;
    
    protected $primaryKey = "kegiatan_id";
    protected $table = "kegiatan_pengajuan";

    protected $fillable = [
        'skema_id',
        'jenis_penelitian',
        'kode_kegiatan',
        'nama_kegiatan',
        'tgl_mulai',
        'tgl_selesai',
        'status',
        'manual_status_override',
    ];

    /*
    |--------------------------------------------------------------------------
    | Effective Status Accessor
    |--------------------------------------------------------------------------
    | When manual_status_override is true, the admin has explicitly set the
    | status, so we honour the stored value.
    |
    | When manual_status_override is false, the status flows naturally based
    | on today's date relative to tgl_mulai and tgl_selesai:
    |   - Before tgl_mulai  → 'Belum dibuka'
    |   - Within range      → 'Terbuka'
    |   - After tgl_selesai → 'Selesai'
    |--------------------------------------------------------------------------
    */

    public function getEffectiveStatusAttribute(): string
    {
        if ($this->manual_status_override) {
            return $this->status;
        }

        $today = Carbon::today()->toDateString();

        if (!$this->tgl_mulai || !$this->tgl_selesai) {
            return $this->status;
        }

        if ($today < $this->tgl_mulai) {
            return 'Belum dibuka';
        }

        if ($today > $this->tgl_selesai) {
            return 'Selesai';
        }

        return 'Terbuka';
    }

    public function skema()
    {
        return $this->belongsTo(
            Skema::class,
            'skema_id',
            'skema_id'
        );
    }

    public function dokumen()
    {
        return $this->morphMany(
            Dokumen::class,
            'documentable'
        );
    }
}
