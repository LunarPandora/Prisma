<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dokumen extends Model
{
    use SoftDeletes;

    protected $primaryKey = "dokumen_id";
    protected $table = "dokumen";

    protected $fillable = [
        'documentable_id',
        'documentable_type',
        'jenis_dokumen',
        'current_version_id'
    ];

    protected $appends = [
        'file_url',
        'nama_file',
        'tgl_upload',
        'drive_file_url',
    ];

    public function getNamaFileAttribute()
    {
        return $this->currentVersion?->nama_file;
    }

    public function getTglUploadAttribute()
    {
        return $this->currentVersion?->tgl_upload;
    }

    public function getDriveFileUrlAttribute()
    {
        return $this->currentVersion?->drive_file_url;
    }

    public function documentable()
    {
        return $this->morphTo();
    }

    public function versions()
    {
        return $this->hasMany(
            DokumenVersion::class,
            'dokumen_id',
            'dokumen_id'
        );
    }

    public function currentVersion()
    {
        return $this->belongsTo(
            DokumenVersion::class,
            'current_version_id',
            'version_id'
        );
    }

    public function latestVersion()
    {
        return $this->hasOne(
            DokumenVersion::class,
            'dokumen_id',
            'dokumen_id'
        )->latestOfMany('version');
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function getFileUrlAttribute()
    {
        return $this->currentVersion?->file_url;
    }
}