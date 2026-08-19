<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Services\AvatarService;

class Mahasiswa extends Model
{
    use SoftDeletes;

    protected $primaryKey = "mhswa_id";
    protected $table = "mahasiswa";

    protected $fillable = [
        'nim',
        'nama',
        'email',
        'no_hp',
        'prodi_id',
        'avatar'
    ];

    protected $appends = ['avatar_url'];

    public function prodi(){
        return $this->belongsTo(Prodi::class, 'prodi_id');
    }

    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            return asset($this->avatar);
        }

        try {
            $service = app(AvatarService::class);

            return asset(
                $service->generateAndStore($this->nama ?? '', $this->mhswa_id)
            );
        } catch (\Throwable $e) {
            return asset('img/user_placeholder.webp');
        }
    }
}
