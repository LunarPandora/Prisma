<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reviewer extends Model
{
    use SoftDeletes;
    
    protected $primaryKey = "reviewer_id";
    protected $table = "reviewer";

    protected $fillable = [
        'user_id',
        'nidn',
    ];
}


