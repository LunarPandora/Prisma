<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Laporan;

use App\Services\DocumentService;
use App\Helpers\ApiResponse;
use App\Helpers\KegiatanStage;

/*
|--------------------------------------------------------------------------
| DanaController
|--------------------------------------------------------------------------
| Handles two related workflows, both keyed on kode_kegiatan:
|
|  Claim Dana (all schemes)
|    Staff uploads bukti transfer (file) → Dosen uploads bukti terima (file)
|    → System auto-completes when both proofs exist.
|    Runs while the laporan sits at CLAIM_DANA_GANJIL / CLAIM_DANA_GENAP.
|
|  Pengembalian Dana (PkM only)
|    Staff requests return → Dosen uploads return proof → Staff uploads
|    receipt proof → System auto-completes when both proofs exist.
|    Runs while the laporan sits at PENGEMBALIAN_DANA_GANJIL / PENGEMBALIAN_DANA_GENAP.
|--------------------------------------------------------------------------
*/

class DanaController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | LIST — Admin sees all in claim/pengembalian stage; Dosen sees own.
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        try {

            $user = $request->user();

            $mode = $request->get('mode', 'claim'); // 'claim' | 'pengembalian'

            $kodes = $mode === 'pengembalian'
                ? ['PENGEMBALIAN_DANA_GANJIL', 'PENGEMBALIAN_DANA_GENAP']
                : ['CLAIM_DANA_GANJIL', 'CLAIM_DANA_GENAP'];

            $query = Laporan::query()
                ->with([
                    'proposal' => fn($q) => $q->withTrashed(),
                    'proposal.user' => fn($q) => $q->withTrashed(),
                    'proposal.prodi',
                    'kegiatan' => fn($q) => $q->withTrashed(),
                    'dokumen.currentVersion',
                ])
                ->whereHas('kegiatan', function ($q) use ($kodes) {
                    $q->whereIn('kode_kegiatan', $kodes);
                });

            if ($user->role === 'Dosen') {
                $query->whereHas('proposal', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            }

            if ($request->filled('skema_id')) {
                $query->whereHas('kegiatan', function ($q) use ($request) {
                    $q->where('skema_id', $request->skema_id);
                });
            }

            if ($mode === 'claim') {
                $query->where(function ($q) {
                    $q->whereNull('claim_dana_status')
                      ->orWhere('claim_dana_status', '!=', 'Selesai');
                });
            } else {
                $query->where(function ($q) {
                    $q->whereNull('pengembalian_dana_status')
                      ->orWhere('pengembalian_dana_status', '!=', 'Selesai');
                });
            }

            if ($request->boolean('pending_staff')) {
                $query->where(function ($q) {
                    $q->where('claim_dana_status', 'Menunggu bukti terima')
                      ->orWhere('claim_dana_status', 'Menunggu konfirmasi admin')
                      ->orWhere('pengembalian_dana_status', 'Menunggu Pengembalian Dana')
                      ->orWhere('pengembalian_dana_status', 'Menunggu konfirmasi admin');
                });
            }

            $paginated = $query
                ->orderByDesc('tgl_submit')
                ->paginate($request->get('per_page', 10));

            return ApiResponse::success($paginated);

        } catch (\Exception $e) {

            \Log::error('Fetch dana failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Claim Dana — Admin uploads bukti transfer (file)
    |--------------------------------------------------------------------------
    */

    public function uploadBuktiTransfer(Request $request, DocumentService $documentService)
    {
        if (!$this->requireStaffLppm()) {
            return ApiResponse::failed('Hanya Staff LPPM yang dapat mengunggah bukti transfer.', 403);
        }

        DB::beginTransaction();

        try {

            $validated = $request->validate([
                'laporan_id'    => ['required', 'exists:laporan,laporan_id'],
                'uploaded_file' => ['required', 'file', 'max:5120', 'mimes:pdf,jpg,jpeg,png'],
            ]);

            $laporan = $this->findLaporan(
                $validated['laporan_id'],
                ['CLAIM_DANA_GANJIL', 'CLAIM_DANA_GENAP']
            );

            if (!$laporan) {
                return ApiResponse::failed(
                    'Laporan bukan pada tahap Claim Dana.'
                );
            }

            if ($laporan->claim_dana_status !== null
                && $laporan->claim_dana_status !== '') {
                return ApiResponse::failed(
                    'Bukti transfer sudah diupload.'
                );
            }

            $file = $request->file('uploaded_file');
            $relativePath = $documentService->upload($file, 'documents/claim-dana');

            $this->storeProofFile(
                $laporan,
                'Bukti Transfer Claim',
                $file->getClientOriginalName(),
                $relativePath
            );

            $laporan->update([
                'status'                 => 'Menunggu konfirmasi penerimaan dana',
                'claim_dana_status'      => 'Menunggu bukti terima',
                'claim_dana_approved_at' => now(),
            ]);

            $tab = \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan);

            \App\Services\NotificationService::create(
                userId: $laporan->proposal->user_id,
                type: 'dana.claim.transfer_uploaded',
                title: 'Bukti transfer diunggah',
                message: "Bukti transfer untuk laporan \"{$laporan->judul_penelitian}\" telah diunggah oleh Staff LPPM.",
                data: ['laporan_id' => $laporan->laporan_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
                key: "dana.claim.transfer_uploaded.{$laporan->laporan_id}",
            );

            \App\Services\NotificationService::createForRole(
                role: 'Ketua LPPM',
                type: 'dana.claim.transfer_uploaded',
                title: 'Bukti transfer diunggah',
                message: "Bukti transfer untuk laporan \"{$laporan->judul_penelitian}\" telah diunggah.",
                data: ['laporan_id' => $laporan->laporan_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
                key: "dana.claim.transfer_uploaded.ketua.{$laporan->laporan_id}",
            );

            // Auto-complete: both proofs exist → advance stage
            $this->tryAutoCompleteClaimDana($laporan);

            DB::commit();

            return ApiResponse::success();

        } catch (\Exception $e) {

            DB::rollBack();

            \Log::error('Upload bukti transfer failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Claim Dana — Dosen uploads bukti terima (file)
    |--------------------------------------------------------------------------
    */

    public function uploadBuktiTerima(Request $request, DocumentService $documentService)
    {
        DB::beginTransaction();

        try {

            $validated = $request->validate([
                'laporan_id'    => ['required', 'exists:laporan,laporan_id'],
                'uploaded_file' => ['required', 'file', 'max:5120', 'mimes:pdf,jpg,jpeg,png'],
            ]);

            $laporan = $this->findOwnedLaporan(
                $validated['laporan_id'],
                ['CLAIM_DANA_GANJIL', 'CLAIM_DANA_GENAP']
            );

            if (!$laporan) {
                return ApiResponse::failed('Laporan tidak ditemukan.');
            }

            if ($laporan->claim_dana_status !== 'Menunggu bukti terima') {
                return ApiResponse::failed(
                    'Bukti transfer belum diupload oleh admin.'
                );
            }

            $file = $request->file('uploaded_file');
            $relativePath = $documentService->upload($file, 'documents/claim-dana');

            $this->storeProofFile(
                $laporan,
                'Bukti Terima Claim',
                $file->getClientOriginalName(),
                $relativePath
            );

            $laporan->update([
                'claim_dana_status' => 'Menunggu konfirmasi admin',
            ]);

            $tab = \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan);

            \App\Services\NotificationService::createForRole(
                role: 'Staff LPPM',
                type: 'dana.claim.receipt_uploaded',
                title: 'Bukti penerimaan diunggah',
                message: "Bukti penerimaan untuk laporan \"{$laporan->judul_penelitian}\" telah diunggah oleh Dosen.",
                data: ['laporan_id' => $laporan->laporan_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
                key: "dana.claim.receipt_uploaded.{$laporan->laporan_id}",
            );

            \App\Services\NotificationService::createForRole(
                role: 'Ketua LPPM',
                type: 'dana.claim.receipt_uploaded',
                title: 'Bukti penerimaan diunggah',
                message: "Bukti penerimaan untuk laporan \"{$laporan->judul_penelitian}\" telah diunggah.",
                data: ['laporan_id' => $laporan->laporan_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
                key: "dana.claim.receipt_uploaded.ketua.{$laporan->laporan_id}",
            );

            // Auto-complete: both proofs exist → advance stage
            $this->tryAutoCompleteClaimDana($laporan);

            DB::commit();

            return ApiResponse::success();

        } catch (\Exception $e) {

            DB::rollBack();

            \Log::error('Upload bukti terima failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Claim Dana — Admin confirms and advances stage
    |--------------------------------------------------------------------------
    */

    public function confirmClaim(Request $request)
    {
        if (!$this->requireStaffLppm()) {
            return ApiResponse::failed('Hanya Staff LPPM yang dapat mengonfirmasi klaim dana.', 403);
        }

        try {

            $laporan = $this->findLaporan(
                $request->laporan_id,
                ['CLAIM_DANA_GANJIL', 'CLAIM_DANA_GENAP']
            );

            if (!$laporan) {
                return ApiResponse::failed(
                    'Laporan bukan pada tahap Claim Dana.'
                );
            }

            if ($laporan->claim_dana_status !== 'Menunggu konfirmasi admin') {
                return ApiResponse::failed(
                    'Belum ada bukti terima yang diupload.'
                );
            }

            $laporan->update([
                'claim_dana_status'       => 'Selesai',
                'claim_dana_confirmed_at' => now(),
            ]);

            KegiatanStage::advance($laporan);

            $tab = \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan);

            \App\Services\NotificationService::create(
                userId: $laporan->proposal->user_id,
                type: 'dana.claim.confirmed',
                title: 'Klaim dana dikonfirmasi',
                message: "Klaim dana untuk laporan \"{$laporan->judul_penelitian}\" telah dikonfirmasi.",
                data: ['laporan_id' => $laporan->laporan_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
                key: "dana.claim.confirmed.{$laporan->laporan_id}",
            );

            \App\Services\NotificationService::createForRole(
                role: 'Ketua LPPM',
                type: 'dana.claim.confirmed',
                title: 'Klaim dana dikonfirmasi',
                message: "Klaim dana untuk laporan \"{$laporan->judul_penelitian}\" telah dikonfirmasi.",
                data: ['laporan_id' => $laporan->laporan_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
                key: "dana.claim.confirmed.ketua.{$laporan->laporan_id}",
            );

            return ApiResponse::success();

        } catch (\Exception $e) {

            \Log::error('Confirm claim failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Pengembalian Dana — Admin marks as awaiting return
    |--------------------------------------------------------------------------
    */

    public function requestPengembalian(Request $request)
    {
        if (!$this->requireStaffLppm()) {
            return ApiResponse::failed('Hanya Staff LPPM yang dapat meminta pengembalian dana.', 403);
        }

        try {

            $laporan = $this->findLaporan(
                $request->laporan_id,
                ['PENGEMBALIAN_DANA_GANJIL', 'PENGEMBALIAN_DANA_GENAP']
            );

            if (!$laporan) {
                return ApiResponse::failed(
                    'Laporan bukan pada tahap Pengembalian Dana.'
                );
            }

            $laporan->update([
                'pengembalian_dana_status' => 'Menunggu Pengembalian Dana',
            ]);

            $tab = \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan);

            \App\Services\NotificationService::create(
                userId: $laporan->proposal->user_id,
                type: 'dana.pengembalian.requested',
                title: 'Pengembalian dana diminta',
                message: "Anda diminta untuk mengembalikan dana laporan \"{$laporan->judul_penelitian}\".",
                data: ['laporan_id' => $laporan->laporan_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
                key: "dana.pengembalian.requested.{$laporan->laporan_id}",
            );

            \App\Services\NotificationService::createForRole(
                role: 'Ketua LPPM',
                type: 'dana.pengembalian.requested',
                title: 'Pengembalian dana diminta',
                message: "Pengembalian dana untuk laporan \"{$laporan->judul_penelitian}\" telah diminta.",
                data: ['laporan_id' => $laporan->laporan_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
                key: "dana.pengembalian.requested.ketua.{$laporan->laporan_id}",
            );

            return ApiResponse::success();

        } catch (\Exception $e) {

            \Log::error('Request pengembalian failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Pengembalian Dana — Dosen uploads transfer proof
    |--------------------------------------------------------------------------
    */

    public function uploadPengembalianProof(Request $request, DocumentService $documentService)
    {
        if (auth()->user()->role !== 'Dosen') {
            return ApiResponse::failed('Hanya Dosen yang dapat mengunggah bukti pengembalian.', 403);
        }

        DB::beginTransaction();

        try {

            $validated = $request->validate([
                'laporan_id'    => ['required', 'exists:laporan,laporan_id'],
                'uploaded_file' => ['required', 'file', 'max:5120', 'mimes:pdf,jpg,jpeg,png'],
            ]);

            $laporan = $this->findOwnedLaporan(
                $validated['laporan_id'],
                ['PENGEMBALIAN_DANA_GANJIL', 'PENGEMBALIAN_DANA_GENAP']
            );

            if (!$laporan) {
                return ApiResponse::failed('Laporan tidak ditemukan.');
            }

            if ($laporan->pengembalian_dana_status !== 'Menunggu Pengembalian Dana') {
                return ApiResponse::failed(
                    'Belum ada instruksi pengembalian dari admin.'
                );
            }

            $file = $request->file('uploaded_file');
            $relativePath = $documentService->upload($file, 'documents/pengembalian-dana');

            $this->storeProofFile(
                $laporan,
                'Bukti Transfer Pengembalian',
                $file->getClientOriginalName(),
                $relativePath
            );

            $laporan->update([
                'pengembalian_dana_status' => 'Menunggu konfirmasi admin',
            ]);

            $tab = \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan);

            \App\Services\NotificationService::createForRole(
                role: 'Staff LPPM',
                type: 'dana.pengembalian.proof_uploaded',
                title: 'Bukti pengembalian diunggah',
                message: "Bukti pengembalian dana untuk laporan \"{$laporan->judul_penelitian}\" telah diunggah oleh Dosen.",
                data: ['laporan_id' => $laporan->laporan_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
                key: "dana.pengembalian.proof_uploaded.{$laporan->laporan_id}",
            );

            \App\Services\NotificationService::createForRole(
                role: 'Ketua LPPM',
                type: 'dana.pengembalian.proof_uploaded',
                title: 'Bukti pengembalian diunggah',
                message: "Bukti pengembalian dana untuk laporan \"{$laporan->judul_penelitian}\" telah diunggah.",
                data: ['laporan_id' => $laporan->laporan_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
                key: "dana.pengembalian.proof_uploaded.ketua.{$laporan->laporan_id}",
            );

            DB::commit();

            return ApiResponse::success();

        } catch (\Exception $e) {

            DB::rollBack();

            \Log::error('Upload pengembalian proof failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Pengembalian Dana — Staff uploads receipt proof and completes workflow
    |--------------------------------------------------------------------------
    */

    public function confirmPengembalian(Request $request, DocumentService $documentService)
    {
        if (!$this->requireStaffLppm()) {
            return ApiResponse::failed('Hanya Staff LPPM yang dapat mengonfirmasi pengembalian dana.', 403);
        }

        DB::beginTransaction();

        try {

            $validated = $request->validate([
                'laporan_id'    => ['required', 'exists:laporan,laporan_id'],
                'uploaded_file' => ['required', 'file', 'max:5120', 'mimes:pdf,jpg,jpeg,png'],
            ]);

            $laporan = Laporan::with([
                'proposal' => fn($q) => $q->withTrashed(),
                'kegiatan'  => fn($q) => $q->withTrashed(),
            ])->where('laporan_id', $validated['laporan_id'])
              ->lockForUpdate()
              ->first();

            if (!$laporan) {
                return ApiResponse::failed('Laporan tidak ditemukan.');
            }

            $current = $laporan->kodeKegiatan();

            if (!in_array($current, ['PENGEMBALIAN_DANA_GANJIL', 'PENGEMBALIAN_DANA_GENAP'], true)
                || !KegiatanStage::isOpen($laporan, $current)
            ) {
                return ApiResponse::failed('Laporan bukan pada tahap Pengembalian Dana.');
            }

            if ($laporan->pengembalian_dana_status !== 'Menunggu konfirmasi admin') {
                return ApiResponse::failed(
                    'Belum ada bukti pengembalian yang diupload.'
                );
            }

            // Verify Dosen's return proof exists with valid file
            $hasReturnProof = $laporan->dokumen()
                ->where('jenis_dokumen', 'Bukti Transfer Pengembalian')
                ->whereHas('versions', function ($q) {
                    $q->where('local_file_url', '!=', '')
                      ->whereNotNull('local_file_url');
                })
                ->exists();

            if (!$hasReturnProof) {
                return ApiResponse::failed(
                    'Bukti pengembalian dari Dosen belum diunggah atau file tidak valid.'
                );
            }

            $file = $request->file('uploaded_file');
            $relativePath = $documentService->upload($file, 'documents/pengembalian-dana');

            $this->storeProofFile(
                $laporan,
                'Bukti Penerimaan Pengembalian',
                $file->getClientOriginalName(),
                $relativePath
            );

            $this->tryAutoCompletePengembalianDana($laporan);

            DB::commit();

            $tab = \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan);

            \App\Services\NotificationService::create(
                userId: $laporan->proposal->user_id,
                type: 'dana.pengembalian.confirmed',
                title: 'Pengembalian dana selesai',
                message: "Pengembalian dana untuk laporan \"{$laporan->judul_penelitian}\" telah dikonfirmasi.",
                data: ['laporan_id' => $laporan->laporan_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
                key: "dana.pengembalian.confirmed.{$laporan->laporan_id}",
            );

            \App\Services\NotificationService::createForRole(
                role: 'Ketua LPPM',
                type: 'dana.pengembalian.confirmed',
                title: 'Pengembalian dana selesai',
                message: "Pengembalian dana untuk laporan \"{$laporan->judul_penelitian}\" telah dikonfirmasi.",
                data: ['laporan_id' => $laporan->laporan_id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
                key: "dana.pengembalian.confirmed.ketua.{$laporan->laporan_id}",
            );

            return ApiResponse::success();

        } catch (\Exception $e) {

            DB::rollBack();

            \Log::error('Confirm pengembalian failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Pengembalian Dana — Staff skips when no remaining funds (PkM only)
    |--------------------------------------------------------------------------
    */

    public function skipPengembalian(Request $request)
    {
        if (!$this->requireStaffLppm()) {
            return ApiResponse::failed('Hanya Staff LPPM yang dapat melewati pengembalian dana.', 403);
        }

        try {

            $validated = $request->validate([
                'laporan_id' => ['required', 'exists:laporan,laporan_id'],
                'reason'     => ['required', 'string', 'max:500'],
            ]);

            $laporan = $this->findLaporan(
                $validated['laporan_id'],
                ['PENGEMBALIAN_DANA_GANJIL', 'PENGEMBALIAN_DANA_GENAP']
            );

            if (!$laporan) {
                return ApiResponse::failed(
                    'Laporan bukan pada tahap Pengembalian Dana.'
                );
            }

            if ($laporan->dana_dikembalikan) {
                return ApiResponse::failed(
                    'Laporan ini memiliki sisa dana yang harus dikembalikan.'
                );
            }

            $laporan->update([
                'pengembalian_dana_status'         => 'Dilewati',
                'pengembalian_dana_skipped_reason' => $validated['reason'],
                'pengembalian_dana_confirmed_at'   => now(),
            ]);

            KegiatanStage::advance($laporan);

            return ApiResponse::success();

        } catch (\Exception $e) {

            \Log::error('Skip pengembalian failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Check if both Claim Dana proofs exist and auto-complete if so.
     * Called after either uploadBuktiTransfer or uploadBuktiTerima.
     */
    private function tryAutoCompleteClaimDana(Laporan $laporan): void
    {
        $hasTransferProof = $laporan->dokumen()
            ->where('jenis_dokumen', 'Bukti Transfer Claim')
            ->exists();

        $hasReceiptProof = $laporan->dokumen()
            ->where('jenis_dokumen', 'Bukti Terima Claim')
            ->exists();

        if (!$hasTransferProof || !$hasReceiptProof) {
            return;
        }

        if ($laporan->claim_dana_status === 'Selesai') {
            return;
        }

        $laporan->update([
            'claim_dana_status'       => 'Selesai',
            'claim_dana_confirmed_at' => now(),
        ]);

        $current = $laporan->kodeKegiatan();
        $lastStage = KegiatanStage::lastNonLuaranStage(
            $laporan->jenis_penelitian,
            $laporan->semester
        );

        if ($current === $lastStage) {
            $laporan->update([
                'completed_at' => now(),
                'status'       => 'Selesai',
            ]);
        }

        KegiatanStage::advance($laporan);

        $tab = \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan);

        \App\Services\NotificationService::create(
            userId: $laporan->proposal->user_id,
            type: 'dana.claim.confirmed',
            title: 'Klaim dana selesai',
            message: "Klaim dana untuk laporan \"{$laporan->judul_penelitian}\" telah selesai.",
            data: ['laporan_id' => $laporan->laporan_id],
            actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
            key: "dana.claim.confirmed.{$laporan->laporan_id}",
        );

        \App\Services\NotificationService::createForRole(
            role: 'Ketua LPPM',
            type: 'dana.claim.confirmed',
            title: 'Klaim dana selesai',
            message: "Klaim dana untuk laporan \"{$laporan->judul_penelitian}\" telah selesai.",
            data: ['laporan_id' => $laporan->laporan_id],
            actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
            key: "dana.claim.confirmed.ketua.{$laporan->laporan_id}",
        );
    }

    /**
     * Check if both Pengembalian Dana proofs exist with valid files and auto-complete if so.
     * Called after uploadPengembalianProof or confirmPengembalian.
     */
    private function tryAutoCompletePengembalianDana(Laporan $laporan): void
    {
        $hasReturnProof = $laporan->dokumen()
            ->where('jenis_dokumen', 'Bukti Transfer Pengembalian')
            ->whereHas('versions', function ($q) {
                // Dosen's proof uses local_file_url (uploaded file)
                $q->where('local_file_url', '!=', '')
                  ->whereNotNull('local_file_url');
            })
            ->exists();

        $hasReceiptProof = $laporan->dokumen()
            ->where('jenis_dokumen', 'Bukti Penerimaan Pengembalian')
            ->whereHas('versions', function ($q) {
                // Staff's receipt proof uses local_file_url (uploaded file)
                $q->where('local_file_url', '!=', '')
                  ->whereNotNull('local_file_url');
            })
            ->exists();

        if (!$hasReturnProof || !$hasReceiptProof) {
            return;
        }

        if ($laporan->pengembalian_dana_status === 'Selesai') {
            return;
        }

        $laporan->update([
            'pengembalian_dana_status'       => 'Selesai',
            'pengembalian_dana_confirmed_at' => now(),
            'dana_dikembalikan'              => true,
        ]);

        $current = $laporan->kodeKegiatan();
        $lastStage = KegiatanStage::lastNonLuaranStage(
            $laporan->proposal->jenis_penelitian,
            $laporan->semester
        );

        if ($current === $lastStage) {
            $laporan->update([
                'completed_at' => now(),
                'status'       => 'Selesai',
            ]);
        }

        KegiatanStage::advance($laporan);

        $tab = \App\Helpers\NotificationUrl::laporanTab($laporan->kegiatan->kode_kegiatan);

        \App\Services\NotificationService::create(
            userId: $laporan->proposal->user_id,
            type: 'dana.pengembalian.confirmed',
            title: 'Pengembalian dana selesai',
            message: "Pengembalian dana untuk laporan \"{$laporan->judul_penelitian}\" telah selesai.",
            data: ['laporan_id' => $laporan->laporan_id],
            actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
            key: "dana.pengembalian.confirmed.{$laporan->laporan_id}",
        );

        \App\Services\NotificationService::createForRole(
            role: 'Ketua LPPM',
            type: 'dana.pengembalian.confirmed',
            title: 'Pengembalian dana selesai',
            message: "Pengembalian dana untuk laporan \"{$laporan->judul_penelitian}\" telah selesai.",
            data: ['laporan_id' => $laporan->laporan_id],
            actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'laporan', $laporan->kegiatan->skema_id, $laporan->laporan_id, $tab, $laporan->jenis_penelitian),
            key: "dana.pengembalian.confirmed.ketua.{$laporan->laporan_id}",
        );
    }

    private function requireStaffLppm()
    {
        $user = auth()->user();

        if (!$user || !in_array($user->role, ['Staff LPPM', 'Superadmin'])) {
            return false;
        }

        return true;
    }

    private function requireKetuaLppm()
    {
        $user = auth()->user();

        if (!$user || !in_array($user->role, ['Ketua LPPM', 'Superadmin'])) {
            return false;
        }

        return true;
    }

    private function findLaporan($laporanId, array $expectedKodes)
    {
        $laporan = Laporan::with([
            'proposal' => fn($q) => $q->withTrashed(),
            'kegiatan'  => fn($q) => $q->withTrashed(),
        ])->find($laporanId);

        if (!$laporan) {
            return null;
        }

        $current = $laporan->kodeKegiatan();

        if (!in_array($current, $expectedKodes, true)
            || !KegiatanStage::isOpen($laporan, $current)
        ) {
            return null;
        }

        return $laporan;
    }

    private function findOwnedLaporan($laporanId, array $expectedKodes)
    {
        $laporan = $this->findLaporan($laporanId, $expectedKodes);

        if (!$laporan) {
            return null;
        }

        if ($laporan->proposal?->user_id !== auth()->id()) {
            return null;
        }

        return $laporan;
    }

    private function storeProof(Laporan $laporan, string $jenis, string $driveUrl): void
    {
        $dokumen = $laporan->dokumen()
            ->firstOrCreate([
                'jenis_dokumen' => $jenis,
            ]);

        $nextVersion = ($dokumen->versions()->max('version') ?? 0) + 1;

        $version = $dokumen->versions()->create([
            'version'          => $nextVersion,

            'nama_file'        => $jenis . ' v' . $nextVersion,

            'drive_file_id'    => '-',
            'drive_file_url'   => $driveUrl,

            'local_file_url'   => '',

            'uploaded_by'      => auth()->id(),

            'catatan_revisi'   => $nextVersion === 1
                ? 'Upload bukti transfer awal'
                : 'Revisi bukti transfer',

            'tgl_upload'       => now(),
        ]);

        $dokumen->update([
            'current_version_id' => $version->version_id,
        ]);
    }

    private function storeProofFile(Laporan $laporan, string $jenis, string $namaFile, string $localPath): void
    {
        $dokumen = $laporan->dokumen()
            ->firstOrCreate([
                'jenis_dokumen' => $jenis,
            ]);

        $nextVersion = ($dokumen->versions()->max('version') ?? 0) + 1;

        $version = $dokumen->versions()->create([
            'version'          => $nextVersion,

            'nama_file'        => $namaFile,

            'drive_file_id'    => '-',
            'drive_file_url'   => '-',

            'local_file_url'   => $localPath,

            'uploaded_by'      => auth()->id(),

            'catatan_revisi'   => $nextVersion === 1
                ? 'Upload bukti transfer awal'
                : 'Revisi bukti transfer',

            'tgl_upload'       => now(),
        ]);

        $dokumen->update([
            'current_version_id' => $version->version_id,
        ]);
    }
}
