<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RealisasiAnggaran extends Model
{
    protected $table = 'realisasi_anggaran';

    protected $fillable = [
        'laporan_id',
        'item_kebutuhan',
        'satuan',
        'jumlah_item',
        'harga_satuan',
        'total',
    ];

    protected $casts = [
        'jumlah_item'  => 'integer',
        'harga_satuan' => 'decimal:2',
        'total'        => 'decimal:2',
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

    /*
    |--------------------------------------------------------------------------
    | Auto-compute total before save
    |--------------------------------------------------------------------------
    */

    protected static function booted()
    {
        static::saving(function ($model) {
            $model->total = $model->jumlah_item * $model->harga_satuan;
        });
    }
}
