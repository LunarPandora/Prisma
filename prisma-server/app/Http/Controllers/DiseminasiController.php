<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Laporan;
use App\Models\PenugasanReviewer;
use App\Models\Settings;
use App\Models\AuthorizationRequest;

use App\Helpers\ApiResponse;
use App\Helpers\KegiatanStage;

class DiseminasiController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Fetch Laporan in Diseminasi Review
    |--------------------------------------------------------------------------
    | Admins and Reviewers see the same underlying rows but with different
    | scoping. This mirrors the Proposal review architecture.
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        try {

            $user = $request->user();

            $query = Laporan::query()
                ->with([
                    'proposal' => fn($q) => $q->withTrashed(),
                    'proposal.user' => fn($q) => $q->withTrashed(),
                    'proposal.prodi',
                    'proposal.kegiatan' => fn($q) => $q->withTrashed(),

                    'kegiatan' => fn($q) => $q->withTrashed(),

                    'penugasan' => fn($q) =>
                        $q->with([
                            'reviewer' => fn($q2) =>
                                $q2->select('id', 'nama', 'avatar'),
                            'review'
                        ]),

                    'dokumen.currentVersion',
                ])
                ->whereHas('kegiatan', function ($q) {
                    $q->whereIn('kode_kegiatan', [
                        'DISEMINASI_GANJIL',
                        'DISEMINASI_GENAP',
                    ]);
                });

            if ($user->role === 'Reviewer') {
                $query->whereExists(function ($q) use ($user) {
                    $q->select(DB::raw(1))
                        ->from('penugasan_reviewer')
                        ->whereColumn('penugasan_reviewer.reviewable_id', 'laporan.laporan_id')
                        ->where('penugasan_reviewer.reviewable_type', 'App\\Models\\Laporan')
                        ->where('penugasan_reviewer.user_id', $user->id);
                });
            }

            if ($request->filled('skema_id')) {
                $query->whereHas('proposal', function ($q) use ($request) {
                    $q->whereHas('kegiatan', function ($q2) use ($request) {
                        $q2->where('skema_id', $request->skema_id);
                    });
                });
            }

            if ($request->filled('semester')) {
                $query->where('semester', $request->semester);
            }

            $settings = Settings::first();

            $paginated = $query
                ->orderByDesc('tgl_submit')
                ->paginate($request->get('per_page', 10));

            $paginated->getCollection()->transform(
                function ($laporan) use ($settings, $user) {

                    return $this->transform($laporan, $settings, $user);
                }
            );

            return ApiResponse::success($paginated);

        } catch (\Exception $e) {

            \Log::error('Fetch diseminasi failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Approve Diseminasi (Admin) — final post-reviewer approval
    |--------------------------------------------------------------------------
    | Once all reviewers have submitted, admin approves and the laporan
    | moves to Claim Dana / Luaran stage.
    |--------------------------------------------------------------------------
    */

    public function approve(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || !in_array($user->role, ['Superadmin', 'Ketua LPPM'])) {
                return ApiResponse::failed(
                    'Hanya Ketua LPPM yang dapat menyetujui diseminasi.'
                );
            }

            $laporan = Laporan::with('kegiatan')
                ->findOrFail($request->laporan_id);

            $current = $laporan->kodeKegiatan();

            if (!in_array($current, ['DISEMINASI_GANJIL', 'DISEMINASI_GENAP'], true)) {
                return ApiResponse::failed(
                    'Laporan bukan pada tahap Diseminasi.'
                );
            }

            if (!$laporan->isDiseminasiFullyApproved()) {
                return ApiResponse::failed(
                    'Diseminasi belum mendapat persetujuan Ketua dan Staff LPPM.'
                );
            }

            if ($laporan->hasPendingDiseminasiRejection()) {
                return ApiResponse::failed(
                    'Masih ada permintaan penolakan yang belum diproses.'
                );
            }

            $penugasanList = PenugasanReviewer::with('review')
                ->where('reviewable_type', 'App\\Models\\Laporan')
                ->where('reviewable_id', $laporan->laporan_id)
                ->get();

            if ($penugasanList->isEmpty()) {
                return ApiResponse::failed(
                    'Reviewer diseminasi belum ditugaskan.'
                );
            }

            $allReviewed = $penugasanList->every(
                fn($p) => $p->status_review === 'Telah direview'
            );

            if (!$allReviewed) {
                return ApiResponse::failed(
                    'Belum semua reviewer menyelesaikan review.'
                );
            }

            $moved = KegiatanStage::advance($laporan);

            $laporan->update([
                'status' => 'Dalam pengerjaan',
            ]);

            return ApiResponse::success([
                'kode_kegiatan' => $moved?->kode_kegiatan,
            ]);

        } catch (\Exception $e) {

            \Log::error('Approve diseminasi failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Staff Diseminasi second-step decision
    |--------------------------------------------------------------------------
    | Staff LPPM second-step approval/rejection.
    | Accept sets staff_diseminasi_approved = true.
    | Reject creates an AuthorizationRequest with action 'return_diseminasi'
    | that requires Ketua authorization.
    |--------------------------------------------------------------------------
    */

    public function staffDecide(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || !in_array($user->role, ['Staff LPPM', 'Superadmin'])) {
                return ApiResponse::failed(
                    'Hanya Staff LPPM yang dapat melakukan pengecekan awal diseminasi.'
                );
            }

            $validated = $request->validate([
                'laporan_id' => ['required', 'exists:laporan,laporan_id'],
                'decision'   => ['required', 'in:accept,reject'],
                'catatan'    => ['nullable', 'string'],
            ]);

            $laporan = Laporan::with([
                'proposal' => fn($q) => $q->withTrashed(),
                'kegiatan' => fn($q) => $q->withTrashed(),
            ])->find($validated['laporan_id']);

            if (!$laporan) {
                return ApiResponse::failed('Laporan tidak ditemukan.');
            }

            $current = $laporan->kodeKegiatan();

            if (!in_array($current, ['DISEMINASI_GANJIL', 'DISEMINASI_GENAP'], true)) {
                return ApiResponse::failed(
                    'Laporan bukan pada tahap Diseminasi.'
                );
            }

            if ($validated['decision'] === 'accept') {

                $ketuaAlreadyApproved = $laporan->ketua_diseminasi_approved;

                $laporan->update([
                    'staff_diseminasi_approved' => true,
                    'status' => $ketuaAlreadyApproved
                        ? 'Menuggu penugasan Reviewer'
                        : 'Menunggu review dari Ketua LPPM',
                ]);

                \App\Services\NotificationService::createForRole(
                    role: 'Ketua LPPM',
                    type: 'laporan.diseminasi.staff_approved',
                    title: 'Diseminasi menunggu review Ketua LPPM',
                    message: $ketuaAlreadyApproved
                        ? "Diseminasi laporan \"{$laporan->judul_penelitian}\" telah dicek oleh Staff LPPM. Siap untuk penugasan reviewer."
                        : "Diseminasi laporan \"{$laporan->judul_penelitian}\" telah dicek oleh Staff LPPM dan menunggu review Ketua LPPM.",
                    data: ['laporan_id' => $laporan->laporan_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                    key: "laporan.diseminasi.staff_approved.{$laporan->laporan_id}",
                );

                \App\Services\NotificationService::create(
                    userId: $laporan->proposal->user_id,
                    type: 'laporan.diseminasi.staff_approved',
                    title: 'Diseminasi dicek oleh Staff LPPM',
                    message: "Diseminasi laporan \"{$laporan->judul_penelitian}\" telah dicek oleh Staff LPPM. Menunggu review Ketua LPPM.",
                    data: ['laporan_id' => $laporan->laporan_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                    key: "laporan.diseminasi.staff_approved.dosen.{$laporan->laporan_id}",
                );

            } else {

                $previousKode = \App\Helpers\KegiatanStage::previousKode($current, $laporan);

                if ($previousKode) {
                    \App\Helpers\KegiatanStage::move($laporan, $previousKode);
                }

                $laporan->update([
                    'status' => 'Revisi',
                    'catatan' => $validated['catatan'] ?? 'Diseminasi dikembalikan untuk perbaikan oleh Staff LPPM',
                    'staff_diseminasi_approved' => false,
                    'ketua_diseminasi_approved' => false,
                ]);

                \App\Services\NotificationService::create(
                    userId: $laporan->proposal->user_id,
                    type: 'laporan.diseminasi.staff_returned',
                    title: 'Diseminasi dikembalikan untuk perbaikan',
                    message: "Diseminasi laporan \"{$laporan->judul_penelitian}\" dikembalikan oleh Staff LPPM untuk perbaikan.",
                    data: ['laporan_id' => $laporan->laporan_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                    key: "laporan.diseminasi.staff_returned.{$laporan->laporan_id}",
                );
            }

            return ApiResponse::success();

        } catch (\Exception $e) {
            \Log::error('Staff decide diseminasi failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Ketua Final Decision — after all reviewers complete
    |--------------------------------------------------------------------------
    | Ketua LPPM accepts (→ CLAIM_DANA) or rejects (→ PUBLIKASI) the Laporan
    | based on completed reviewer assessments.
    |--------------------------------------------------------------------------
    */

    public function finalDecision(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || !in_array($user->role, ['Ketua LPPM', 'Superadmin'])) {
                return ApiResponse::failed(
                    'Hanya Ketua LPPM yang dapat melakukan keputusan akhir diseminasi.'
                );
            }

            $validated = $request->validate([
                'laporan_id' => ['required', 'exists:laporan,laporan_id'],
                'decision'   => ['required', 'in:accept,reject'],
                'catatan'    => ['required_if:decision,reject', 'nullable', 'string'],
            ]);

            $laporan = Laporan::with([
                'proposal' => fn($q) => $q->withTrashed(),
                'kegiatan' => fn($q) => $q->withTrashed(),
            ])->find($validated['laporan_id']);

            if (!$laporan) {
                return ApiResponse::failed('Laporan tidak ditemukan.');
            }

            $current = $laporan->kodeKegiatan();

            if (!in_array($current, ['DISEMINASI_GANJIL', 'DISEMINASI_GENAP'], true)) {
                return ApiResponse::failed(
                    'Laporan bukan pada tahap Diseminasi.'
                );
            }

            if ($laporan->status !== 'Menunggu keputusan Ketua') {
                return ApiResponse::failed(
                    'Keputusan akhir belum tersedia. Pastikan semua reviewer telah menyelesaikan review.'
                );
            }

            // Defense in depth: verify all reviewers actually completed
            $penugasanList = PenugasanReviewer::with('review')
                ->where('reviewable_type', 'App\\Models\\Laporan')
                ->where('reviewable_id', $laporan->laporan_id)
                ->get();

            if ($penugasanList->isEmpty()) {
                return ApiResponse::failed(
                    'Tidak ada reviewer yang ditugaskan.'
                );
            }

            $allReviewed = $penugasanList->every(
                fn($p) => $p->status_review === 'Telah direview'
            );

            if (!$allReviewed) {
                return ApiResponse::failed(
                    'Belum semua reviewer menyelesaikan review.'
                );
            }

            if ($validated['decision'] === 'accept') {

                $moved = KegiatanStage::advance($laporan);

                $laporan->update([
                    'status' => 'Dalam pengerjaan',
                ]);

                \App\Services\NotificationService::create(
                    userId: $laporan->proposal->user_id,
                    type: 'laporan.diseminasi.final_accepted',
                    title: 'Laporan diterima',
                    message: "Laporan \"{$laporan->judul_penelitian}\" telah diterima.",
                    data: ['laporan_id' => $laporan->laporan_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                    key: "laporan.diseminasi.final_accepted.{$laporan->laporan_id}",
                );

                \App\Services\NotificationService::createForRole(
                    role: 'Staff LPPM',
                    type: 'laporan.diseminasi.final_accepted',
                    title: 'Laporan diterima',
                    message: "Laporan \"{$laporan->judul_penelitian}\" telah diterima.",
                    data: ['laporan_id' => $laporan->laporan_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                    key: "laporan.diseminasi.final_accepted.staff.{$laporan->laporan_id}",
                );

                return ApiResponse::success([
                    'kode_kegiatan' => $moved?->kode_kegiatan,
                ]);

            } else {

                $previousKode = KegiatanStage::previousKode($current, $laporan);

                if (!$previousKode) {
                    return ApiResponse::failed(
                        'Tidak ada tahap sebelumnya yang dapat dikembalikan.'
                    );
                }

                if (!KegiatanStage::isOpen($laporan, $previousKode)) {
                    return ApiResponse::failed(
                        'Tahap sebelumnya sudah ditutup. Laporan tidak dapat dikembalikan.'
                    );
                }

                KegiatanStage::move($laporan, $previousKode);

                $laporan->update([
                    'status' => 'Revisi',
                    'catatan' => $validated['catatan'] ?? '-',
                    'ketua_diseminasi_approved' => false,
                    'staff_diseminasi_approved' => false,
                ]);

                \App\Services\NotificationService::create(
                    userId: $laporan->proposal->user_id,
                    type: 'laporan.diseminasi.final_rejected',
                    title: 'Laporan ditolak',
                    message: "Laporan \"{$laporan->judul_penelitian}\" telah ditolak pada tahap Diseminasi.",
                    data: ['laporan_id' => $laporan->laporan_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                    key: "laporan.diseminasi.final_rejected.{$laporan->laporan_id}",
                );

                \App\Services\NotificationService::createForRole(
                    role: 'Staff LPPM',
                    type: 'laporan.diseminasi.final_rejected',
                    title: 'Laporan ditolak',
                    message: "Laporan \"{$laporan->judul_penelitian}\" telah ditolak pada tahap Diseminasi.",
                    data: ['laporan_id' => $laporan->laporan_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan), $laporan->jenis_penelitian),
                    key: "laporan.diseminasi.final_rejected.staff.{$laporan->laporan_id}",
                );

                return ApiResponse::success();
            }

        } catch (\Exception $e) {
            \Log::error('Final decision diseminasi failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Transformer
    |--------------------------------------------------------------------------
    */

    private function transform($laporan, $settings, $user)
    {
        $proposal = $laporan->proposal;

        /*
        |--------------------------------------------------------------------------
        | Reviewer-scoped penugasan id (for the current logged-in reviewer)
        |--------------------------------------------------------------------------
        */

        $currentPenugasan = null;

        if ($user && $user->role === 'Reviewer') {

            $currentPenugasan = $laporan->penugasan
                ->firstWhere('user_id', $user->id);
        }

        return [
            'laporan_id'  => $laporan->laporan_id,
            'proposal_id' => $laporan->proposal_id,

            'semester' => $laporan->semester,
            'kode_kegiatan' => $laporan->kegiatan?->kode_kegiatan,
            'nama_kegiatan' => $laporan->kegiatan?->nama_kegiatan,
            'status'   => $laporan->status,
            'tgl_submit' => $laporan->tgl_submit,

            'judul_penelitian' => $laporan->judul_penelitian,
            'target_publikasi' => $laporan->target_publikasi,

            'ketua_diseminasi_approved' => $laporan->ketua_diseminasi_approved,
            'staff_diseminasi_approved' => $laporan->staff_diseminasi_approved,
            'has_pending_diseminasi_rejection' => $laporan->hasPendingDiseminasiRejection(),

            'all_reviewers_completed' => $laporan->penugasan->isNotEmpty()
                && $laporan->penugasan->every(
                    fn($p) => $p->status_review === 'Telah direview'
                ),

            'ketua' => [
                'id'     => $proposal?->user?->id,
                'nama'   => $proposal?->user?->nama,
                'nidn'   => $proposal?->user?->nidn,
                'avatar' => $proposal?->user?->avatar_url,
            ],

            'jenis_penelitian' => $laporan->jenis_penelitian ?? $proposal?->jenis_penelitian,
            'nama_kegiatan'     => $proposal?->kegiatan?->nama_kegiatan,

            'luaran' => [
                'link_laporan_akhir' => $laporan->link_laporan_akhir,
                'link_publikasi'     => $laporan->link_publikasi,
                'link_hki'           => $laporan->link_hki,
                'link_buku'          => $laporan->link_buku,
                'link_poster'        => $laporan->link_poster,
                'link_video'         => $laporan->link_video,
                'dana_dikembalikan'  => $laporan->dana_dikembalikan,
            ],

            'penugasan' => $laporan->penugasan->map(function ($p) {
                return [
                    'penugasan_id' => $p->penugasan_id,
                    'user_id'      => $p->user_id,
                    'status_review'=> $p->status_review,
                    'reviewer'     => $p->reviewer
                        ? [
                            'id'         => $p->reviewer->id,
                            'nama'       => $p->reviewer->nama,
                            'avatar_url' => $p->reviewer->avatar_url,
                        ]
                        : null,
                    'review' => $p->review,
                ];
            })->values(),

            'penugasan_id' => $currentPenugasan?->penugasan_id,

            'kriteria_kesesuaian_tema' => $settings?->list_kesesuaian_tema ?? [],
            'kriteria_penilaian'       => $settings?->kriteria_penilaian ?? [],
        ];
    }
}
