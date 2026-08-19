<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DokumenVersion extends Model
{
    use SoftDeletes;

    protected $primaryKey = "version_id";
    protected $table = "dokumen_version";
    
    protected $fillable = [
        'dokumen_id',
        'version',
        'nama_file',
        'drive_file_id',
        'drive_file_url',
        'local_file_url',
        'uploaded_by',
        'catatan_revisi',
        'tgl_upload'
    ];

    protected $appends = ['file_url'];

    public function dokumen()
    {
        return $this->belongsTo(
            Dokumen::class,
            'dokumen_id',
            'dokumen_id'
        );
    }

    public function uploader()
    {
        return $this->belongsTo(
            User::class,
            'uploaded_by',
            'id'
        );
    }

    public function getFileUrlAttribute()
    {
        if (!$this->local_file_url) {
            return null;
        }

        return url('/file/' . $this->local_file_url);
    }
}
