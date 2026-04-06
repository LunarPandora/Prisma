<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Proposal extends Model
{
    use SoftDeletes;
    
    protected $primaryKey = "proposal_id";
    protected $table = "proposal";

    protected $fillable = [
        'judul',
        'dosen_id',
        'periode_id',
        'tgl_pengajuan',
        'status_proposal'
    ];
}
