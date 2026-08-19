<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use SoftDeletes;

    protected $primaryKey = "review_id";
    protected $table = "review";

    protected $fillable = [
        'penugasan_id',
        'keputusan',
        'catatan',
        'tgl_review',
        'kriteria_kesesuaian_tema',
        'kriteria_penilaian',
    ];

    protected $casts = [
        'kriteria_kesesuaian_tema' => 'array',
        'kriteria_penilaian' => 'array',
    ];

    public function penugasan()
    {
        return $this->belongsTo(PenugasanReviewer::class, 'penugasan_id');
    }
}
