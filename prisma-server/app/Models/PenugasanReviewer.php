<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PenugasanReviewer extends Model
{
    use SoftDeletes;

    protected $primaryKey = "penugasan_id";
    protected $table = "penugasan_reviewer";

    protected $fillable = [
        'proposal_id',
        'reviewable_type',
        'reviewable_id',
        'tgl_penugasan',
        'user_id',
        'status_review'
    ];

    /*
    |--------------------------------------------------------------------------
    | Polymorphic subject: Proposal (Seleksi) or Laporan (Diseminasi)
    |--------------------------------------------------------------------------
    */

    public function reviewable()
    {
        return $this->morphTo();
    }

    /*
    |--------------------------------------------------------------------------
    | Legacy accessor kept so existing code using ->proposal keeps working
    | on Proposal-based penugasan rows.
    |--------------------------------------------------------------------------
    */

    public function proposal()
    {
        return $this->belongsTo(Proposal::class, 'proposal_id', 'proposal_id');
    }

    public function laporan()
    {
        return $this->belongsTo(Laporan::class, 'reviewable_id', 'laporan_id');
    }

    public function review()
    {
        return $this->hasOne(Review::class, 'penugasan_id', 'penugasan_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'user_id', 'id')
            ->where('role', 'Reviewer');
    }
}