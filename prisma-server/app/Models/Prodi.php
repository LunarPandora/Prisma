<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Prodi extends Model
{
    use SoftDeletes;
    
    protected $primaryKey = "prodi_id";
    protected $table = "prodi";

    protected $fillable = [
        'nama_prodi',
        'kaprodi_id',
    ];

    public function kaprodi()
    {
        return $this->belongsTo(User::class, 'kaprodi_id', 'id');
    }
}
