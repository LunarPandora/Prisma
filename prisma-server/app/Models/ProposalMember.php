<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProposalMember extends Model
{
    protected $primaryKey = "prop_member_id";
    protected $table = "proposal_member";

    protected $fillable = [
        'proposal_id',
        'member_id',
        'role',
        'semester',
        'ttjp'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'member_id', 'id');
    }

    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class, 'member_id', 'mhswa_id')->withTrashed();
    }

    public function kolaborator()
    {
        return $this->belongsTo(Kolaborator::class, 'member_id', 'kolab_id');
    }
}
