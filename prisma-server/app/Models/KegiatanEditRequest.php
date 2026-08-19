<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KegiatanEditRequest extends Model
{
    protected $table = 'kegiatan_edit_requests';

    protected $fillable = [
        'kegiatan_id',
        'requested_by',
        'current_tgl_mulai',
        'current_tgl_selesai',
        'proposed_tgl_mulai',
        'proposed_tgl_selesai',
        'reason',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_note',
        'executed_by',
        'executed_at',
    ];

    protected $casts = [
        'current_tgl_mulai' => 'date',
        'current_tgl_selesai' => 'date',
        'proposed_tgl_mulai' => 'date',
        'proposed_tgl_selesai' => 'date',
        'reviewed_at' => 'datetime',
        'executed_at' => 'datetime',
    ];

    public function kegiatan()
    {
        return $this->belongsTo(KegiatanPengajuan::class, 'kegiatan_id', 'kegiatan_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function executor()
    {
        return $this->belongsTo(User::class, 'executed_by');
    }
}
