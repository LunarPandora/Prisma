<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PeriodePengajuan extends Model
{
    use SoftDeletes;
    
    protected $primaryKey = "periode_id";
    protected $table = "periode_pengajuan";

    protected $fillable = [
        'skema_id',
        'nama_periode',
        'tgl_mulai',
        'tgl_selesai',
        'status'
    ];

    public function skema()
    {
        return $this->belongsTo(Skema::class, 'skema_id');
    }
}
