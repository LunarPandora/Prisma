<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\AuthorizationRequest;

class Proposal extends Model
{
    use SoftDeletes;
    
    protected $primaryKey = "proposal_id";
    protected $table = "proposal";

    protected $fillable = [
        'topik_penelitian',
        'jenis_penelitian',
        'jenis_penelitian_gan',
        'jenis_penelitian_gen',
        'judul',
        'tahap_penelitian',
        'bidang_ilmu',
        'fokus_sdg',
        'ra_biaya_penelitian_gan',
        'ra_biaya_publikasi_gan',
        'ra_insentif_gan',
        'ra_biaya_penelitian_gen',
        'ra_biaya_publikasi_gen',
        'ra_insentif_gen',

        'target_publikasi_gan',
        'target_publikasi_gen',
        'rencana_judul_publikasi_gan',
        'rencana_judul_publikasi_gen',
        'metopen_gan',
        'metopen_gen',
        'unit_analisis_gan',
        'unit_analisis_gen',
        'kontribusi_ilmu_makul',
        'kontribusi_pkm',

        'rencana_luaran',
        'institusi_mitra',
        'user_id',
        'kegiatan_id',
        'skema',
        'sumber_skema',
        'status',
        'ketua_seleksi_approved',
        'staff_seleksi_approved',
        'tgl_pengajuan',
        'catatan'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function kegiatan()
    {
        return $this->belongsTo(KegiatanPengajuan::class, 'kegiatan_id');
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
        return $this->hasMany(PenugasanReviewer::class, 'proposal_id')
            ->where('reviewable_type', Proposal::class);
    }

    public function prodi()
    {
        return $this->belongsTo(Prodi::class, 'prodi_id', 'prodi_id');
    }

    public function laporan()
    {
        return $this->hasMany(Laporan::class, 'proposal_id', 'proposal_id');
    }

    public function memberDosenProposal()
    {
        return $this->hasMany(ProposalMember::class, 'proposal_id')
            ->where('role', 'Dosen');
    }

    public function memberMhswaProposal()
    {
        return $this->hasMany(ProposalMember::class, 'proposal_id')
            ->where('role', 'Mahasiswa');
    }

    public function memberKolabProposal()
    {
        return $this->hasMany(ProposalMember::class, 'proposal_id')
            ->where('role', 'Kolaborator');
    }

    /*
    |--------------------------------------------------------------------------
    | Seleksi Double-Verification
    |--------------------------------------------------------------------------
    */

    public function isSeleksiFullyApproved(): bool
    {
        return (bool) $this->ketua_seleksi_approved
            && (bool) $this->staff_seleksi_approved;
    }

    public function hasPendingSeleksiRejection(): bool
    {
        return AuthorizationRequest::where('requestable_type', 'App\\Models\\Proposal')
            ->where('requestable_id', $this->proposal_id)
            ->whereIn('action', ['return_seleksi', 'return_proposal_for_revision', 'reject_proposal'])
            ->where('status', 'Menunggu Persetujuan')
            ->exists();
    }

    public function getPendingSeleksiRejectionReasonAttribute(): ?string
    {
        $request = AuthorizationRequest::where('requestable_type', 'App\\Models\\Proposal')
            ->where('requestable_id', $this->proposal_id)
            ->whereIn('action', ['return_seleksi', 'return_proposal_for_revision', 'reject_proposal'])
            ->where('status', 'Menunggu Persetujuan')
            ->first();

        return $request?->reason;
    }

    public function getPendingSeleksiRejectionIdAttribute(): ?int
    {
        $request = AuthorizationRequest::where('requestable_type', 'App\\Models\\Proposal')
            ->where('requestable_id', $this->proposal_id)
            ->whereIn('action', ['return_seleksi', 'return_proposal_for_revision', 'reject_proposal'])
            ->where('status', 'Menunggu Persetujuan')
            ->first();

        return $request?->id;
    }

    /*
    |--------------------------------------------------------------------------
    | General Destructive Action Checks
    |--------------------------------------------------------------------------
    */

    public function hasPendingDestructiveAction(): bool
    {
        return AuthorizationRequest::where('requestable_type', 'App\\Models\\Proposal')
            ->where('requestable_id', $this->proposal_id)
            ->where('status', 'Menunggu Persetujuan')
            ->exists();
    }

    public function hasPendingRejectionRequest(): bool
    {
        return AuthorizationRequest::where('requestable_type', 'App\\Models\\Proposal')
            ->where('requestable_id', $this->proposal_id)
            ->where('action', 'reject_proposal')
            ->where('status', 'Menunggu Persetujuan')
            ->exists();
    }

    public function hasPendingReturnRequest(): bool
    {
        return AuthorizationRequest::where('requestable_type', 'App\\Models\\Proposal')
            ->where('requestable_id', $this->proposal_id)
            ->where('action', 'return_proposal_for_revision')
            ->where('status', 'Menunggu Persetujuan')
            ->exists();
    }

    public function isRevisi(): bool
    {
        return $this->status === 'Revisi';
    }

    public function getPendingRejectionRequestAttribute(): ?AuthorizationRequest
    {
        return AuthorizationRequest::where('requestable_type', 'App\\Models\\Proposal')
            ->where('requestable_id', $this->proposal_id)
            ->where('action', 'reject_proposal')
            ->where('status', 'Menunggu Persetujuan')
            ->first();
    }

    public function getPendingReturnRequestAttribute(): ?AuthorizationRequest
    {
        return AuthorizationRequest::where('requestable_type', 'App\\Models\\Proposal')
            ->where('requestable_id', $this->proposal_id)
            ->where('action', 'return_proposal_for_revision')
            ->where('status', 'Menunggu Persetujuan')
            ->first();
    }

    public function hasRejectedByKetuaSeleksi(): bool
    {
        return AuthorizationRequest::where('requestable_type', 'App\\Models\\Proposal')
            ->where('requestable_id', $this->proposal_id)
            ->whereIn('action', ['return_seleksi', 'return_proposal_for_revision', 'reject_proposal'])
            ->where('status', 'Ditolak')
            ->exists();
    }

    public function getRejectedByKetuaSeleksiReasonAttribute(): ?string
    {
        $request = AuthorizationRequest::where('requestable_type', 'App\\Models\\Proposal')
            ->where('requestable_id', $this->proposal_id)
            ->whereIn('action', ['return_seleksi', 'return_proposal_for_revision', 'reject_proposal'])
            ->where('status', 'Ditolak')
            ->latest('reviewed_at')
            ->first();

        return $request?->review_note;
    }
}
