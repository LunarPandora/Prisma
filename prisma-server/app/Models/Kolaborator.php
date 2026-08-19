<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Services\AvatarService;

class Kolaborator extends Model
{
    use SoftDeletes;

    protected $primaryKey = "kolab_id";
    protected $table = "kolaborator";

    protected $fillable = [
        'nidn',
        'nuptk',
        'nama',
        'email',
        'no_hp',
        'prodi',
        'institusi',
        'avatar'
    ];

    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            return asset($this->avatar);
        }

        try {
            $service = app(AvatarService::class);

            return asset(
                $service->generateAndStore($this->nama ?? '', $this->kolab_id)
            );
        } catch (\Throwable $e) {
            return asset('img/user_placeholder.webp');
        }
    }

    public function penelitiDetail()
    {
        return $this->hasOne(
            PenelitiDetail::class,
            'kolab_id',
            'kolab_id'
        );
    }
}
