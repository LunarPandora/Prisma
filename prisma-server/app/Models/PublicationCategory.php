<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PublicationCategory extends Model
{
    protected $primaryKey = 'pub_category_id';

    protected $fillable = [
        'nama',
        'urutan',
        'peringkat',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'peringkat' => 'array',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function publications()
    {
        return $this->hasMany(
            Publication::class,
            'pub_category_id',
            'pub_category_id'
        );
    }
}