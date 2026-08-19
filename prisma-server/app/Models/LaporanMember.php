<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LaporanMember extends Model
{
    protected $primaryKey = 'laporan_member_id';
    protected $table = 'laporan_member';

    protected $fillable = [
        'laporan_id',
        'member_id',
        'role',
        'position',
        'ttjp',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function laporan()
    {
        return $this->belongsTo(
            Laporan::class,
            'laporan_id',
            'laporan_id'
        );
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'member_id', 'id');
    }

    public function mahasiswa()
    {
        return $this->belongsTo(
            Mahasiswa::class,
            'member_id',
            'mhswa_id'
        )->withTrashed();
    }

    public function kolaborator()
    {
        return $this->belongsTo(
            Kolaborator::class,
            'member_id',
            'kolab_id'
        );
    }
}
