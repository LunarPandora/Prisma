<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Skema extends Model
{
    use SoftDeletes;
    
    protected $primaryKey = "skema_id";
    protected $table = "skema";

    protected $fillable = [
        'nama_skema',
        'jenis',
        'keterangan'
    ];
}
