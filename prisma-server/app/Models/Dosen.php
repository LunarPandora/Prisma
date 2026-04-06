<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dosen extends Model
{
    use SoftDeletes;

    protected $primaryKey = "dosen_id";
    protected $table = "dosen";

    protected $fillable = [
        'user_id',
        'nidn',
        'prodi_id',
    ];
}
