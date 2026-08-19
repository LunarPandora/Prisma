<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\UserController;
use App\Http\Controllers\ReviewerController;
use App\Http\Controllers\DosenController;
use App\Http\Controllers\MahasiswaController;
use App\Http\Controllers\KolaboratorController;
use App\Http\Controllers\ProdiController;

use App\Http\Controllers\Proposal\ProposalController;
use App\Http\Controllers\Proposal\ProposalDraftController;
use App\Http\Controllers\Proposal\ProposalDocumentController;
use App\Http\Controllers\Proposal\ProposalWorkflowController;
use App\Http\Controllers\Proposal\ProposalSeleksiController;
use App\Http\Controllers\Proposal\PengumumanSuratTugasController;

use App\Http\Controllers\SkemaController;
use App\Http\Controllers\PenelitiDetailController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\LaporanMemberController;
use App\Http\Controllers\RealisasiAnggaranController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\KegiatanPengajuanController;
use App\Http\Controllers\PenugasanReviewerController;
use App\Http\Controllers\PublicationCategoryController;
use App\Http\Controllers\ScholarController;
use App\Http\Controllers\LogbookPengerjaanController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\DiseminasiController;
use App\Http\Controllers\DanaController;
use App\Http\Controllers\SitasiController;

use App\Http\Controllers\KegiatanEditRequestController;
use App\Http\Controllers\AuthorizationRequestController;
use App\Http\Controllers\KetuaCriteriaController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DashboardController;

Route::middleware(['auth:sanctum'])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Dashboard — Role-specific dashboard data
    |--------------------------------------------------------------------------
    */
    Route::prefix('dashboard')->group(function () {
        Route::middleware('role:Superadmin')->get('/superadmin', [DashboardController::class, 'superadmin']);
        Route::middleware('role:Staff LPPM')->get('/staff', [DashboardController::class, 'staff']);
        Route::middleware('role:Ketua LPPM')->get('/ketua', [DashboardController::class, 'ketua']);
        Route::middleware('role:Dosen')->get('/dosen', [DashboardController::class, 'dosen']);
        Route::middleware('role:Reviewer')->get('/reviewer', [DashboardController::class, 'reviewer']);
    });

    /*
    |--------------------------------------------------------------------------
    | Users — Read: all LPPM | Write: Superadmin only
    |--------------------------------------------------------------------------
    */
    Route::prefix('users')->group(function (){
        Route::get('/', [UserController::class, 'index']);
        Route::get('/fetch', [UserController::class, 'fetch']);
        Route::get('/me', function(Request $request){
            return $request->user();
        });
        Route::middleware('role:Superadmin')->group(function () {
            Route::post('/add', [UserController::class, 'create']);
            Route::post('/update', [UserController::class, 'update']);
            Route::delete('/delete/{id}', [UserController::class, 'delete']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Reviewer / Dosen — Read-only lists
    |--------------------------------------------------------------------------
    */
    Route::prefix('reviewer')->group(function (){
        Route::get('/', [ReviewerController::class, 'index']);
    });

    Route::prefix('dosen')->group(function (){
        Route::get('/', [DosenController::class, 'index']);
    });

    /*
    |--------------------------------------------------------------------------
    | Mahasiswa — Read: all LPPM | Write: Staff + Superadmin
    |--------------------------------------------------------------------------
    */
    Route::prefix('mahasiswa')->group(function (){
        Route::get('/fetch', [MahasiswaController::class, 'fetch']);
        Route::middleware('role:Staff LPPM,Superadmin')->group(function () {
            Route::post('/add', [MahasiswaController::class, 'create']);
            Route::post('/update', [MahasiswaController::class, 'update']);
            Route::delete('/delete/{id}', [MahasiswaController::class, 'delete']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Kolaborator — Read: all | Create: Staff LPPM + Dosen | Update/Delete: Staff LPPM
    |--------------------------------------------------------------------------
    */
    Route::prefix('kolaborator')->group(function (){
        Route::get('/', [KolaboratorController::class, 'index']);
        Route::get('/fetch', [KolaboratorController::class, 'fetch']);
        Route::middleware('role:Staff LPPM,Dosen')->group(function () {
            Route::post('/add', [KolaboratorController::class, 'create']);
        });
        Route::middleware('role:Staff LPPM')->group(function () {
            Route::post('/update', [KolaboratorController::class, 'update']);
            Route::delete('/delete/{id}', [KolaboratorController::class, 'delete']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Prodi — Read: all LPPM | Write: Superadmin only
    |--------------------------------------------------------------------------
    */
    Route::prefix('prodi')->group(function (){
        Route::get('/', [ProdiController::class, 'index']);
        Route::get('/fetch', [ProdiController::class, 'fetch']);
        Route::middleware('role:Superadmin')->group(function () {
            Route::post('/add', [ProdiController::class, 'create']);
            Route::post('/update', [ProdiController::class, 'update']);
            Route::delete('/delete/{id}', [ProdiController::class, 'delete']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Proposal
    |--------------------------------------------------------------------------
    */
    Route::prefix('proposal')->group(function (){
        // Read — all roles (scoped by controller)
        Route::get('/', [ProposalController::class, 'index']);
        Route::get('/fetch', [ProposalController::class, 'fetch']);

        // Draft — Dosen (ownership checked in controller)
        Route::prefix('draft')->group(function () {
            Route::post('/add', [ProposalDraftController::class, 'createDraft']);
            Route::post('/update', [ProposalDraftController::class, 'updateDraft']);
        });

        // Documents — Dosen (ownership checked in controller)
        Route::prefix('upload')->group(function () {
            Route::post('/prepare', [ProposalDocumentController::class, 'prepareProposalUpload']);
            Route::post('/store', [ProposalDocumentController::class, 'uploadProposal']);
        });

        // Workflow
        Route::middleware('role:Staff LPPM')->group(function () {
            Route::post('/update', [ProposalWorkflowController::class, 'updateTahapProposal']);
        });
        // tolakProposal requires Ketua authorization via AuthorizationRequest
        // Staff creates request, Ketua authorizes. Direct Ketua action also allowed.
        Route::middleware('role:Ketua LPPM')->group(function () {
            Route::post('/delete', [ProposalWorkflowController::class, 'tolakProposal']);
        });

        // Seleksi Double-Verification
        Route::prefix('seleksi')->group(function () {
            Route::middleware('role:Ketua LPPM')->group(function () {
                Route::post('/ketua-decide', [ProposalSeleksiController::class, 'ketuaDecide']);
            });
            Route::middleware('role:Staff LPPM')->group(function () {
                Route::post('/staff-decide', [ProposalSeleksiController::class, 'staffDecide']);
            });
        });

        // Pengumuman Surat Tugas
        Route::prefix('sk')->group(function () {
            Route::get('/fetch', [PengumumanSuratTugasController::class, 'fetch']);
            Route::middleware('role:Staff LPPM')->group(function () {
                Route::post('/generate', [PengumumanSuratTugasController::class, 'generate']);
                Route::post('/upload', [PengumumanSuratTugasController::class, 'upload']);
            });
            // acceptProposal IS the decision point — Ketua only
            Route::middleware('role:Ketua LPPM')->group(function () {
                Route::post('/accept', [PengumumanSuratTugasController::class, 'acceptProposal']);
            });
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Laporan
    |--------------------------------------------------------------------------
    */
    Route::prefix('laporan')->group(function (){
        // Read — all roles (scoped by controller)
        Route::get('/', [LaporanController::class, 'index']);

        // Dosen operational actions (ownership checked in controller via findOwnedLaporan)
        Route::post('/update', [LaporanController::class, 'update']);
        Route::post('/upload-dokumen', [LaporanController::class, 'uploadDokumen']);
        Route::post('/finish', [LaporanController::class, 'finish']);
        Route::post('/generate-laporan-akhir', [LaporanController::class, 'generateLaporanAkhir']);
        Route::post('/publikasi', [LaporanController::class, 'submitPublikasi']);

        Route::get('/{id}/documents', [LaporanController::class, 'documents']);

        // Laporan Member management (independent from Proposal members)
        Route::get('/{id}/members', [LaporanMemberController::class, 'index']);
        Route::post('/members', [LaporanMemberController::class, 'store']);
        Route::post('/members/reorder', [LaporanMemberController::class, 'reorder']);
        Route::post('/{id}/members/seed', [LaporanMemberController::class, 'seedFromProposal']);
        Route::put('/members/{id}', [LaporanMemberController::class, 'update']);
        Route::delete('/members/{id}', [LaporanMemberController::class, 'destroy']);

        // Realisasi Anggaran (Point F budget items)
        Route::get('/{id}/realisasi-anggaran', [RealisasiAnggaranController::class, 'index']);
        Route::post('/realisasi-anggaran', [RealisasiAnggaranController::class, 'store']);
        Route::put('/realisasi-anggaran/{id}', [RealisasiAnggaranController::class, 'update']);
        Route::delete('/realisasi-anggaran/{id}', [RealisasiAnggaranController::class, 'destroy']);

        // Ketua decision — accept/reject laporan
        Route::middleware('role:Ketua LPPM')->group(function () {
            Route::post('/decide', [LaporanController::class, 'adminDecide']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Diseminasi
    |--------------------------------------------------------------------------
    */
    Route::prefix('diseminasi')->group(function (){
        // Read — Staff + Reviewer (scoped by controller)
        Route::get('/', [DiseminasiController::class, 'index']);
        // Ketua approval
        Route::middleware('role:Ketua LPPM')->group(function () {
            Route::post('/approve', [DiseminasiController::class, 'approve']);
            Route::post('/final-decision', [DiseminasiController::class, 'finalDecision']);
        });
        // Staff second-step approval
        Route::middleware('role:Staff LPPM')->group(function () {
            Route::post('/staff-decide', [DiseminasiController::class, 'staffDecide']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Claim Dana + Pengembalian Dana
    |--------------------------------------------------------------------------
    */
    Route::prefix('dana')->group(function () {
        // Read — all roles (scoped by controller)
        Route::get('/', [DanaController::class, 'index']);

        // Staff operational actions (after Ketua funding approval — checked in controller)
        Route::middleware('role:Staff LPPM')->group(function () {
            Route::post('/claim/upload-bukti-transfer', [DanaController::class, 'uploadBuktiTransfer']);
            Route::post('/claim/confirm', [DanaController::class, 'confirmClaim']);
            Route::post('/pengembalian/request', [DanaController::class, 'requestPengembalian']);
            Route::post('/pengembalian/confirm', [DanaController::class, 'confirmPengembalian']);
            Route::post('/pengembalian/skip', [DanaController::class, 'skipPengembalian']);
        });

        // Dosen actions (ownership checked in controller via findOwnedLaporan)
        Route::post('/claim/upload-bukti-terima', [DanaController::class, 'uploadBuktiTerima']);
        Route::post('/pengembalian/upload-proof', [DanaController::class, 'uploadPengembalianProof']);
    });

    /*
    |--------------------------------------------------------------------------
    | Luaran (Sitasi) — Dosen only (ownership checked in controller)
    |--------------------------------------------------------------------------
    */
    Route::prefix('sitasi')->group(function () {
        Route::get('/', [SitasiController::class, 'index']);
        Route::post('/', [SitasiController::class, 'store']);
        Route::delete('/{id}', [SitasiController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | Logbook — Dosen only (ownership checked in controller)
    |--------------------------------------------------------------------------
    */
    Route::prefix('logbook_pengerjaan')->group(function () {
        Route::get('/', [LogbookPengerjaanController::class, 'index']);
        Route::get('/{id}', [LogbookPengerjaanController::class, 'show']);
        Route::get('/{id}/documents', [LogbookPengerjaanController::class, 'documents']);
        Route::post('/', [LogbookPengerjaanController::class, 'store']);
        Route::put('/{id}', [LogbookPengerjaanController::class, 'update']);
        Route::delete('/{id}', [LogbookPengerjaanController::class, 'destroy']);
        Route::post('/replace-document', [LogbookPengerjaanController::class, 'replaceDocument']);
    });

    /*
    |--------------------------------------------------------------------------
    | Skema — Read: all LPPM | Write: Ketua LPPM only
    |--------------------------------------------------------------------------
    */
    Route::prefix('skema')->group(function () {
        Route::get('/', [SkemaController::class, 'index']);
        Route::get('/fetch', [SkemaController::class, 'fetch']);
        Route::get('/fetch/all', [SkemaController::class, 'fetchAll']);
        Route::get('/staff-monitoring', [SkemaController::class, 'staffMonitoring']);
        Route::middleware('role:Ketua LPPM')->group(function () {
            Route::post('/add', [SkemaController::class, 'store']);
            Route::post('/update', [SkemaController::class, 'update']);
            Route::post('/delete', [SkemaController::class, 'destroy']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Kegiatan — Read: all LPPM | Write: Staff + Ketua
    |--------------------------------------------------------------------------
    */
    Route::prefix('kegiatan')->group(function (){
        Route::get('/', [KegiatanPengajuanController::class, 'index']);
        Route::get('/fetch', [KegiatanPengajuanController::class, 'fetch']);
        Route::get('/fetch/all', [KegiatanPengajuanController::class, 'fetchAll']);
        Route::get('/fetch-penerimaan-proposal', [KegiatanPengajuanController::class, 'fetchPenerimaanProposal']);
        Route::middleware('role:Staff LPPM,Ketua LPPM')->group(function () {
            Route::post('/add', [KegiatanPengajuanController::class, 'create']);
            Route::post('/update', [KegiatanPengajuanController::class, 'update']);
        });
        // Delete requires Ketua authorization via AuthorizationRequest for Staff,
        // or direct Ketua action
        Route::middleware('role:Ketua LPPM')->group(function () {
            Route::delete('/delete/{id}', [KegiatanPengajuanController::class, 'delete']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Kegiatan Edit Requests — Staff submits, Ketua authorizes
    |--------------------------------------------------------------------------
    */
    Route::prefix('kegiatan-edit-request')->group(function () {
        Route::get('/', [KegiatanEditRequestController::class, 'index']);
        Route::middleware('role:Staff LPPM')->group(function () {
            Route::post('/', [KegiatanEditRequestController::class, 'store']);
            Route::post('/execute', [KegiatanEditRequestController::class, 'execute']);
        });
        Route::middleware('role:Ketua LPPM')->group(function () {
            Route::post('/authorize', [KegiatanEditRequestController::class, 'authorize']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Authorization Requests — Staff initiates, Ketua authorizes destructive actions
    |--------------------------------------------------------------------------
    */
    Route::prefix('authorization-request')->group(function () {
        Route::get('/', [AuthorizationRequestController::class, 'index']);
        Route::middleware('role:Staff LPPM')->group(function () {
            Route::post('/', [AuthorizationRequestController::class, 'store']);
        });
        Route::middleware('role:Ketua LPPM')->group(function () {
            Route::post('/authorize', [AuthorizationRequestController::class, 'authorize']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Review Criteria — Ketua LPPM only (criteria ownership)
    |--------------------------------------------------------------------------
    */
    Route::prefix('criteria')->middleware('role:Staff LPPM')->group(function () {
        Route::get('/', [KetuaCriteriaController::class, 'index']);
        Route::post('/kriteria-penilaian', [KetuaCriteriaController::class, 'updateKriteriaPenilaian']);
        Route::post('/kesesuaian-tema', [KetuaCriteriaController::class, 'updateKesesuaianTema']);
    });

    /*
    |--------------------------------------------------------------------------
    | Penugasan Reviewer — Staff LPPM only
    |--------------------------------------------------------------------------
    */
    Route::prefix('penugasan')->middleware('role:Staff LPPM')->group(function (){
        Route::post('/assign', [PenugasanReviewerController::class, 'assignReviewers']);
        Route::post('/confirm-assignment', [PenugasanReviewerController::class, 'confirmAssignment']);
    });

    /*
    |--------------------------------------------------------------------------
    | Review — Reviewer only (ownership checked in controller)
    |--------------------------------------------------------------------------
    */
    Route::prefix('review')->group(function (){
        Route::post('/upload', [ReviewController::class, 'store']);
    });

    /*
    |--------------------------------------------------------------------------
    | Settings — Read: all LPPM | Write: Superadmin only
    |--------------------------------------------------------------------------
    */
    Route::prefix('settings')->group(function (){
        Route::get('/', [SettingsController::class, 'index']);
        Route::get('/fetch-rektorat', [SettingsController::class, 'fetchRektor']);
        Route::get('/fetch-lppm', [SettingsController::class, 'fetchTimLppm']);
        Route::get('/fetch-ketua-lppm', [SettingsController::class, 'fetchKetuaLppm']);
        Route::middleware('role:Superadmin')->group(function () {
            Route::post('/update', [SettingsController::class, 'update']);
            Route::post('/update-rektor', [SettingsController::class, 'updateRektor']);
        });
        Route::middleware('role:Ketua LPPM')->group(function () {
            Route::post('/update-ignore-kegiatan-dates', [SettingsController::class, 'updateIgnoreKegiatanDates']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Peneliti Detail — Dosen (ownership checked in controller)
    |--------------------------------------------------------------------------
    */
    Route::prefix('peneliti-detail')->group(function () {
        Route::get('/', [PenelitiDetailController::class, 'detail']);
        Route::post('/update', [PenelitiDetailController::class, 'update']);
    });

    /*
    |--------------------------------------------------------------------------
    | Publication Category — Read: all authenticated | Write: Superadmin, Staff LPPM
    |--------------------------------------------------------------------------
    */
    Route::prefix('publication-category')->group(function () {
        Route::get('/fetch', [PublicationCategoryController::class, 'fetch']);
        Route::middleware('role:Superadmin,Staff LPPM')->group(function () {
            Route::post('/add', [PublicationCategoryController::class, 'create']);
            Route::post('/update', [PublicationCategoryController::class, 'update']);
            Route::delete('/delete/{id}', [PublicationCategoryController::class, 'delete']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Scholar — Dosen (ownership checked in controller)
    |--------------------------------------------------------------------------
    */
    Route::prefix('scholar')->group(function () {
        Route::get('/dashboard', [ScholarController::class, 'dashboard']);
        Route::post('/connect', [ScholarController::class, 'connect']);
        Route::post('/sync', [ScholarController::class, 'sync']);
        Route::get('/publications', [ScholarController::class, 'publications']);
        Route::get('/publications/{publicationId}/citation-history', [ScholarController::class, 'publicationCitationHistory']);
    });

    /*
    |--------------------------------------------------------------------------
    | Notifications — All authenticated users (ownership checked in controller)
    |--------------------------------------------------------------------------
    */
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::put('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });
});
