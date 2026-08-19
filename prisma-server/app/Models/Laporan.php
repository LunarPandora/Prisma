<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\AuthorizationRequest;

class Laporan extends Model
{
    use SoftDeletes;

    protected $primaryKey = "laporan_id";
    protected $table = "laporan";

    protected $fillable = [
        'proposal_id',
        'kegiatan_id',

        'semester',
        'jenis_penelitian',

        'judul_penelitian',
        'metode_penelitian',
        'unit_analisis',

        'link_luaran_drive_id',
        'link_luaran_drive_url',

        'target_publikasi',
        'nama_jurnal',
        'link_jurnal',
        'link_publikasi',

        'link_laporan_akhir',
        'link_hki',
        'link_buku',
        'link_poster',
        'link_video',

        'dana_dikembalikan',

        'claim_dana_status',
        'claim_dana_approved_at',
        'claim_dana_confirmed_at',

        'pengembalian_dana_status',
        'pengembalian_dana_confirmed_at',
        'pengembalian_dana_skipped_reason',

        'completed_at',

        // dana_disetujui* fields are NOT mass-assignable for defense-in-depth.
        // They must be set via explicit ->update() calls in DanaController.

        'institusi_mitra',

        'realisasi_biaya_penelitian',
        'realisasi_biaya_publikasi',
        'realisasi_insentif',

        'status',
        // 'tahap' — replaced by kegiatan_id → kode_kegiatan

        'ketua_diseminasi_approved',
        'staff_diseminasi_approved',

        'tgl_mulai',
        'tgl_submit',
        'tgl_selesai',

        'current_logbook_id',

        'catatan',

        'hasil_pelaksanaan',
        'status_luaran',
        'peran_mitra',
        'kendala_pelaksanaan',
        'rencana_tahapan_selanjutnya',
        'daftar_pustaka',
    ];

    protected $casts = [
        'tgl_mulai' => 'date',
        'tgl_submit' => 'date',
        'tgl_selesai' => 'date',

        'realisasi_biaya_penelitian' => 'double',
        'realisasi_biaya_publikasi' => 'double',
        'realisasi_insentif' => 'double',

        'dana_dikembalikan' => 'boolean',

        'claim_dana_approved_at' => 'datetime',
        'claim_dana_confirmed_at' => 'datetime',
        'pengembalian_dana_confirmed_at' => 'datetime',
        'dana_disetujui_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /*
    |--------------------------------------------------------------------------
    | Stage (kode_kegiatan is the source of truth)
    |--------------------------------------------------------------------------
    */

    public function kegiatan()
    {
        return $this->belongsTo(
            KegiatanPengajuan::class,
            'kegiatan_id',
            'kegiatan_id'
        );
    }

    public function kodeKegiatan(): ?string
    {
        return $this->kegiatan()
            ->withTrashed()
            ->first()
            ?->kode_kegiatan;
    }

    /*
    |--------------------------------------------------------------------------
    | Proposal
    |--------------------------------------------------------------------------
    */

    public function proposal()
    {
        return $this->belongsTo(
            Proposal::class,
            'proposal_id',
            'proposal_id'
        );
    }

    public function logbooks()
    {
        return $this->hasMany(
            LogbookPengerjaan::class,
            'laporan_id',
            'laporan_id'
        );
    }

    public function currentLogbook()
    {
        return $this->belongsTo(
            LogbookPengerjaan::class,
            'current_logbook_id',
            'logbook_id'
        );
    }

    public function dokumen()
    {
        return $this->morphMany(
            Dokumen::class,
            'documentable'
        );
    }

    public function penugasan()
    {
        return $this->morphMany(
            PenugasanReviewer::class,
            'reviewable'
        );
    }

    public function laporanMember()
    {
        return $this->hasMany(
            LaporanMember::class,
            'laporan_id',
            'laporan_id'
        );
    }

    public function realisasiAnggaran()
    {
        return $this->hasMany(
            RealisasiAnggaran::class,
            'laporan_id',
            'laporan_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors
    |--------------------------------------------------------------------------
    */

    public function getTotalRealisasiBiayaAttribute(): float
    {
        return ($this->realisasi_biaya_penelitian ?? 0)
            + ($this->realisasi_biaya_publikasi ?? 0)
            + ($this->realisasi_insentif ?? 0);
    }

    public function isGanjil()
    {
        return $this->semester === 'Ganjil';
    }

    public function isGenap()
    {
        return $this->semester === 'Genap';
    }

    public function isFinished()
    {
        return $this->completed_at !== null;
    }

    public function isRevisi()
    {
        return $this->status === 'Revisi';
    }

    public function isDalamPengerjaan()
    {
        return $this->status === 'Dalam pengerjaan';
    }

    public function isMenungguReview()
    {
        return $this->status === 'Menunggu review';
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActive($query)
    {
        return $query->whereNull('completed_at');
    }

    /*
    |--------------------------------------------------------------------------
    | Diseminasi Approval State
    |--------------------------------------------------------------------------
    */

    public function isKetuaDiseminasiApproved(): bool
    {
        return (bool) $this->ketua_diseminasi_approved;
    }

    public function isStaffDiseminasiApproved(): bool
    {
        return (bool) $this->staff_diseminasi_approved;
    }

    public function isDiseminasiFullyApproved(): bool
    {
        return $this->isKetuaDiseminasiApproved()
            && $this->isStaffDiseminasiApproved();
    }

    public function hasPendingDiseminasiRejection(): bool
    {
        return AuthorizationRequest::where('requestable_type', 'App\\Models\\Laporan')
            ->where('requestable_id', $this->laporan_id)
            ->where('action', 'return_diseminasi')
            ->where('status', 'Menunggu Persetujuan')
            ->exists();
    }

    public function getPendingRejectionReasonAttribute(): ?string
    {
        $request = AuthorizationRequest::where('requestable_type', 'App\\Models\\Laporan')
            ->where('requestable_id', $this->laporan_id)
            ->where('action', 'return_diseminasi')
            ->where('status', 'Menunggu Persetujuan')
            ->first();

        return $request?->reason;
    }

    public function getPendingRejectionIdAttribute(): ?int
    {
        $request = AuthorizationRequest::where('requestable_type', 'App\\Models\\Laporan')
            ->where('requestable_id', $this->laporan_id)
            ->where('action', 'return_diseminasi')
            ->where('status', 'Menunggu Persetujuan')
            ->first();

        return $request?->id;
    }

    public function getRejectedByKetuaReasonAttribute(): ?string
    {
        $request = AuthorizationRequest::where('requestable_type', 'App\\Models\\Laporan')
            ->where('requestable_id', $this->laporan_id)
            ->where('action', 'return_diseminasi')
            ->where('status', 'Ditolak')
            ->latest('reviewed_at')
            ->first();

        return $request?->review_note;
    }

    public function hasRejectedByKetua(): bool
    {
        return AuthorizationRequest::where('requestable_type', 'App\\Models\\Laporan')
            ->where('requestable_id', $this->laporan_id)
            ->where('action', 'return_diseminasi')
            ->where('status', 'Ditolak')
            ->exists();
    }

    /*
    |--------------------------------------------------------------------------
    | General Destructive Action Checks (all Laporan stages)
    |--------------------------------------------------------------------------
    */

    public function hasPendingDestructiveAction(): bool
    {
        return AuthorizationRequest::where('requestable_type', 'App\\Models\\Laporan')
            ->where('requestable_id', $this->laporan_id)
            ->where('status', 'Menunggu Persetujuan')
            ->exists();
    }

    public function hasPendingReturnRequest(): bool
    {
        return AuthorizationRequest::where('requestable_type', 'App\\Models\\Laporan')
            ->where('requestable_id', $this->laporan_id)
            ->where('action', 'return_laporan_for_revision')
            ->where('status', 'Menunggu Persetujuan')
            ->exists();
    }

    public function getPendingReturnRequestAttribute(): ?AuthorizationRequest
    {
        return AuthorizationRequest::where('requestable_type', 'App\\Models\\Laporan')
            ->where('requestable_id', $this->laporan_id)
            ->where('action', 'return_laporan_for_revision')
            ->where('status', 'Menunggu Persetujuan')
            ->first();
    }
}