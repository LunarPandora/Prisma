<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

use App\Services\AvatarService;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'nama',
        'email',
        'password',
        'role',
        'status',
        'gender',
        'nidn',
        'nuptk',
        'no_hp',
        'prodi_id',
        'avatar',
    ];

    protected $appends = ['avatar_url'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            return asset($this->avatar);
        }

        try {
            $service = app(AvatarService::class);

            return asset(
                $service->generateAndStore($this->nama ?? '', $this->id)
            );
        } catch (\Throwable $e) {
            // Avatar generation shouldn't fail responses. Fall back to the
            // shipped placeholder so the frontend never sees a broken URL.
            return asset('img/user_placeholder.webp');
        }
    }

    /**
     * Role constants
     */
    const ROLE_SUPERADMIN = 'Superadmin';
    const ROLE_STAFF_LPPM = 'Staff LPPM';
    const ROLE_KETUA_LPPM = 'Ketua LPPM';
    const ROLE_DOSEN = 'Dosen';
    const ROLE_REVIEWER = 'Reviewer';

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string ...$roles): bool
    {
        return in_array($this->role, $roles);
    }

    /**
     * Check if user is Superadmin.
     */
    public function isSuperadmin(): bool
    {
        return $this->role === self::ROLE_SUPERADMIN;
    }

    /**
     * Check if user is Staff LPPM.
     */
    public function isStaffLppm(): bool
    {
        return $this->role === self::ROLE_STAFF_LPPM;
    }

    /**
     * Check if user is Ketua LPPM.
     */
    public function isKetuaLppm(): bool
    {
        return $this->role === self::ROLE_KETUA_LPPM;
    }

    /**
     * Check if user is Dosen.
     */
    public function isDosen(): bool
    {
        return $this->role === self::ROLE_DOSEN;
    }

    /**
     * Check if user is Reviewer.
     */
    public function isReviewer(): bool
    {
        return $this->role === self::ROLE_REVIEWER;
    }

    /**
     * Check if user is any LPPM role (Staff or Ketua).
     */
    public function isLppm(): bool
    {
        return $this->hasRole(self::ROLE_STAFF_LPPM, self::ROLE_KETUA_LPPM);
    }

    /**
     * Check if user can perform system administration.
     */
    public function isSystemAdmin(): bool
    {
        return $this->isSuperadmin();
    }

    public function prodi()
    {
        return $this->belongsTo(Prodi::class, 'prodi_id', 'prodi_id');
    }

    public function penelitiDetail()
    {
        return $this->hasOne(PenelitiDetail::class);
    }

    public function scholarProfile()
    {
        return $this->hasOne(ScholarProfile::class);
    }
}
