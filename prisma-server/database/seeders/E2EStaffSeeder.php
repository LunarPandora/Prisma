<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Prodi;
use App\Models\Skema;
use App\Models\KegiatanPengajuan;
use App\Models\Proposal;
use App\Models\Laporan;
use App\Models\PenugasanReviewer;
use App\Models\Review;
use App\Models\Settings;
use App\Models\Notification;
use App\Models\Dokumen;
use App\Models\DokumenVersion;
use App\Models\LogbookPengerjaan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class E2EStaffSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // ── Prodi ──
        $prodiTI = Prodi::create(['nama_prodi' => 'Sistem Teknologi dan Informasi']);
        $prodiBD = Prodi::create(['nama_prodi' => 'Bisnis Digital']);
        $prodiKW = Prodi::create(['nama_prodi' => 'Kewirausahaan']);

        // ── Users ──
        $superadmin = User::firstOrCreate(
            ['email' => 'superadmin@itbss.ac.id'],
            [
'nama' => 'Superadmin',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Superadmin', 'status' => 'Aktif', 'gender' => 'L',
            'no_hp' => '081234567890', 'remember_token' => Str::random(10),
            ]
        );

        $ketua = User::firstOrCreate(
            ['email' => 'ketua.lppm@itbss.ac.id'],
            [
'nama' => 'Ketua LPPM',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Ketua LPPM', 'status' => 'Aktif', 'gender' => 'P',
            'nidn' => '10001', 'no_hp' => '081234567891',
            'prodi_id' => $prodiTI->prodi_id, 'remember_token' => Str::random(10),
            ]
        );

        $staff1 = User::firstOrCreate(
            ['email' => 'staff.lppm1@itbss.ac.id'],
            [
'nama' => 'Staff LPPM 1',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Staff LPPM', 'status' => 'Aktif', 'gender' => 'L',
            'nidn' => '10002', 'no_hp' => '081234567892',
            'prodi_id' => $prodiBD->prodi_id, 'remember_token' => Str::random(10),
            ]
        );

        $staff2 = User::firstOrCreate(
            ['email' => 'staff.lppm2@itbss.ac.id'],
            [
'nama' => 'Staff LPPM 2',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Staff LPPM', 'status' => 'Aktif', 'gender' => 'P',
            'nidn' => '10003', 'no_hp' => '081234567893',
            'prodi_id' => $prodiKW->prodi_id, 'remember_token' => Str::random(10),
            ]
        );

        $dosenA = User::firstOrCreate(
            ['email' => 'dosen.a@itbss.ac.id'],
            [
'nama' => 'Dosen A',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Dosen', 'status' => 'Aktif', 'gender' => 'L',
            'nidn' => '20001', 'no_hp' => '081234567894',
            'prodi_id' => $prodiTI->prodi_id, 'remember_token' => Str::random(10),
            ]
        );

        $dosenB = User::firstOrCreate(
            ['email' => 'dosen.b@itbss.ac.id'],
            [
'nama' => 'Dosen B',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Dosen', 'status' => 'Aktif', 'gender' => 'P',
            'nidn' => '20002', 'no_hp' => '081234567895',
            'prodi_id' => $prodiBD->prodi_id, 'remember_token' => Str::random(10),
            ]
        );

        $reviewerA = User::firstOrCreate(
            ['email' => 'reviewer.a@itbss.ac.id'],
            [
'nama' => 'Reviewer A',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Reviewer', 'status' => 'Aktif', 'gender' => 'L',
            'nidn' => '30001', 'no_hp' => '081234567897',
            'prodi_id' => $prodiTI->prodi_id, 'remember_token' => Str::random(10),
            ]
        );

        $reviewerB = User::firstOrCreate(
            ['email' => 'reviewer.b@itbss.ac.id'],
            [
'nama' => 'Reviewer B',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Reviewer', 'status' => 'Aktif', 'gender' => 'P',
            'nidn' => '30002', 'no_hp' => '081234567898',
            'prodi_id' => $prodiBD->prodi_id, 'remember_token' => Str::random(10),
            ]
        );

        $reviewerC = User::firstOrCreate(
            ['email' => 'reviewer.c@itbss.ac.id'],
            [
'nama' => 'Reviewer C',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Reviewer', 'status' => 'Aktif', 'gender' => 'L',
            'nidn' => '30003', 'no_hp' => '081234567899',
            'prodi_id' => $prodiTI->prodi_id, 'remember_token' => Str::random(10),
            ]
        );

        // ── Settings ──
        Settings::create([
            'kepala_lppm' => $ketua->id,
            'kriteria_penilaian' => [
                ['kriteria' => 'Kesesuaian Tema', 'bobot' => 30],
                ['kriteria' => 'Metodologi', 'bobot' => 30],
                ['kriteria' => 'Timeline', 'bobot' => 20],
                ['kriteria' => 'Anggaran', 'bobot' => 20],
            ],
            'list_kesesuaian_tema' => [
                'SDGs', 'Teknologi', 'Kesehatan', 'Pendidikan',
            ],
            'ignore_kegiatan_dates' => true,
        ]);

        // ── Skema ──
        $skema1 = Skema::create([
            'nama_skema' => 'Penelitian Dosen Tetap 2026',
            'tahun_ajaran' => '2025/2026',
            'status' => 'Aktif',
        ]);

        // ── Kegiatan (stages for Penelitian) ──
        $kegiatanPenerimaan = KegiatanPengajuan::create([
            'skema_id' => $skema1->skema_id,
            'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'PENERIMAAN_PROPOSAL',
            'nama_kegiatan' => 'Penerimaan Proposal',
            'tgl_mulai' => '2026-01-01',
            'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka',
            'manual_status_override' => true,
        ]);

        $kegiatanSeleksi = KegiatanPengajuan::create([
            'skema_id' => $skema1->skema_id,
            'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'SELEKSI_PROPOSAL',
            'nama_kegiatan' => 'Seleksi Proposal',
            'tgl_mulai' => '2026-01-01',
            'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka',
            'manual_status_override' => true,
        ]);

        $kegiatanSK = KegiatanPengajuan::create([
            'skema_id' => $skema1->skema_id,
            'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'PENGUMUMAN_SURAT_TUGAS',
            'nama_kegiatan' => 'Pengumuman Surat Tugas',
            'tgl_mulai' => '2026-01-01',
            'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka',
            'manual_status_override' => true,
        ]);

        $kegiatanProses = KegiatanPengajuan::create([
            'skema_id' => $skema1->skema_id,
            'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'PROSES_PENELITIAN_GANJIL',
            'nama_kegiatan' => 'Proses Penelitian Ganjil',
            'tgl_mulai' => '2026-01-01',
            'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka',
            'manual_status_override' => true,
        ]);

        $kegiatanClaim = KegiatanPengajuan::create([
            'skema_id' => $skema1->skema_id,
            'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'CLAIM_DANA_GANJIL',
            'nama_kegiatan' => 'Claim Dana Ganjil',
            'tgl_mulai' => '2026-01-01',
            'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka',
            'manual_status_override' => true,
        ]);

        $kegiatanPengembalian = KegiatanPengajuan::create([
            'skema_id' => $skema1->skema_id,
            'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'PENGEMBALIAN_DANA_GANJIL',
            'nama_kegiatan' => 'Pengembalian Dana Ganjil',
            'tgl_mulai' => '2026-01-01',
            'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka',
            'manual_status_override' => true,
        ]);

        // ── TEST SCENARIO: Proposal waiting for Staff review ──
        $proposalStaffReview = Proposal::create([
            'jenis_penelitian' => 'Penelitian',
            'jenis_penelitian_gan' => 'Penelitian',
            'jenis_penelitian_gen' => 'Penelitian',
            'judul' => 'E2E: Analisis Dampak AI dalam Pendidikan',
            'tahap_penelitian' => 'Proposal',
            'topik_penelitian' => 'Teknologi Pendidikan',
            'bidang_ilmu' => 'Teknologi Informasi',
            'fokus_sdg' => 'SDGs 4 - Pendidikan Berkualitas',
            'skema' => 'Internal',
            'sumber_skema' => 'Dana Internal',
            'status' => 'Menunggu review Staff LPPM',
            'ketua_seleksi_approved' => false,
            'staff_seleksi_approved' => false,
            'user_id' => $dosenA->id,
            'kegiatan_id' => $kegiatanSeleksi->kegiatan_id,
            'tgl_pengajuan' => '2026-07-15',
            'ra_biaya_penelitian_gan' => 5000000,
            'ra_biaya_publikasi_gan' => 2000000,
            'ra_insentif_gan' => 1500000,
            'ra_biaya_penelitian_gen' => 5000000,
            'ra_biaya_publikasi_gen' => 2000000,
            'ra_insentif_gen' => 1500000,
            'target_publikasi_gan' => 'SCOPUS Q3',
            'target_publikasi_gen' => 'SCOPUS Q3',
            'rencana_judul_publikasi_gan' => 'AI in Education: A Comprehensive Study',
            'rencana_judul_publikasi_gen' => 'AI in Education: A Comprehensive Study',
            'metopen_gan' => 'Mixed Methods',
            'metopen_gen' => 'Mixed Methods',
            'unit_analisis_gan' => 'Mahasiswa',
            'unit_analisis_gen' => 'Mahasiswa',
            'kontribusi_ilmu_makul' => 'Kontribusi Ilmu',
            'kontribusi_pkm' => 'Kontribusi PKM',
            'rencana_luaran' => 'Jurnal Internasional',
            'institusi_mitra' => 'Universitas Test',
        ]);

        // ── TEST SCENARIO: Proposal waiting for reviewer assignment ──
        $proposalAssignReviewer = Proposal::create([
            'jenis_penelitian' => 'Penelitian',
            'jenis_penelitian_gan' => 'Penelitian',
            'jenis_penelitian_gen' => 'Penelitian',
            'judul' => 'E2E: Sistem Rekomendasi Berbasis Machine Learning',
            'tahap_penelitian' => 'Proposal',
            'topik_penelitian' => 'Machine Learning',
            'bidang_ilmu' => 'Ilmu Komputer',
            'fokus_sdg' => 'SDGs 9 - Industri dan Inovasi',
            'skema' => 'Internal',
            'sumber_skema' => 'Dana Internal',
            'status' => 'Menunggu penugasan reviewer',
            'ketua_seleksi_approved' => true,
            'staff_seleksi_approved' => true,
            'user_id' => $dosenB->id,
            'kegiatan_id' => $kegiatanSeleksi->kegiatan_id,
            'tgl_pengajuan' => '2026-07-10',
            'ra_biaya_penelitian_gan' => 3000000,
            'ra_biaya_publikasi_gan' => 1500000,
            'ra_insentif_gan' => 1000000,
            'ra_biaya_penelitian_gen' => 3000000,
            'ra_biaya_publikasi_gen' => 1500000,
            'ra_insentif_gen' => 1000000,
            'target_publikasi_gan' => 'SCOPUS Q4',
            'target_publikasi_gen' => 'SCOPUS Q4',
            'rencana_judul_publikasi_gan' => 'ML Recommendation Systems',
            'rencana_judul_publikasi_gen' => 'ML Recommendation Systems',
            'metopen_gan' => 'Quantitative',
            'metopen_gen' => 'Quantitative',
            'unit_analisis_gan' => 'Sistem',
            'unit_analisis_gen' => 'Sistem',
            'kontribusi_ilmu_makul' => 'Kontribusi Ilmu',
            'kontribusi_pkm' => 'Kontribusi PKM',
            'rencana_luaran' => 'Jurnal Nasional',
            'institusi_mitra' => '-',
        ]);

        // ── TEST SCENARIO: Proposal under review (reviewers assigned) ──
        $proposalUnderReview = Proposal::create([
            'jenis_penelitian' => 'Penelitian',
            'jenis_penelitian_gan' => 'Penelitian',
            'jenis_penelitian_gen' => 'Penelitian',
            'judul' => 'E2E: Optimasi Database untuk Aplikasi Real-time',
            'tahap_penelitian' => 'Proposal',
            'topik_penelitian' => 'Basis Data',
            'bidang_ilmu' => 'Teknologi Informasi',
            'fokus_sdg' => 'SDGs 9 - Industri dan Inovasi',
            'skema' => 'Internal',
            'sumber_skema' => 'Dana Internal',
            'status' => 'Menunggu review',
            'ketua_seleksi_approved' => true,
            'staff_seleksi_approved' => true,
            'user_id' => $dosenA->id,
            'kegiatan_id' => $kegiatanSeleksi->kegiatan_id,
            'tgl_pengajuan' => '2026-06-20',
            'ra_biaya_penelitian_gan' => 4000000,
            'ra_biaya_publikasi_gan' => 2000000,
            'ra_insentif_gan' => 1200000,
            'ra_biaya_penelitian_gen' => 4000000,
            'ra_biaya_publikasi_gen' => 2000000,
            'ra_insentif_gen' => 1200000,
            'target_publikasi_gan' => 'SCOPUS Q2',
            'target_publikasi_gen' => 'SCOPUS Q2',
            'rencana_judul_publikasi_gan' => 'Real-time Database Optimization',
            'rencana_judul_publikasi_gen' => 'Real-time Database Optimization',
            'metopen_gan' => 'Experimental',
            'metopen_gen' => 'Experimental',
            'unit_analisis_gan' => 'Database',
            'unit_analisis_gen' => 'Database',
            'kontribusi_ilmu_makul' => 'Kontribusi Ilmu',
            'kontribusi_pkm' => 'Kontribusi PKM',
            'rencana_luaran' => 'Jurnal Internasional',
            'institusi_mitra' => '-',
        ]);

        // Assign reviewers to the under-review proposal
        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal',
            'reviewable_id' => $proposalUnderReview->proposal_id,
            'proposal_id' => $proposalUnderReview->proposal_id,
            'tgl_penugasan' => '2026-07-01',
            'user_id' => $reviewerA->id,
            'status_review' => 'Belum direview',
        ]);

        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal',
            'reviewable_id' => $proposalUnderReview->proposal_id,
            'proposal_id' => $proposalUnderReview->proposal_id,
            'tgl_penugasan' => '2026-07-01',
            'user_id' => $reviewerB->id,
            'status_review' => 'Belum direview',
        ]);

        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal',
            'reviewable_id' => $proposalUnderReview->proposal_id,
            'proposal_id' => $proposalUnderReview->proposal_id,
            'tgl_penugasan' => '2026-07-01',
            'user_id' => $reviewerC->id,
            'status_review' => 'Belum direview',
        ]);

        // ── TEST SCENARIO: Kriteria page data (Settings already created above) ──

        // ── TEST SCENARIO: Notification for Staff ──
        Notification::create([
            'user_id' => $staff1->id,
            'type' => 'proposal.seleksi.ketua_approved',
            'title' => 'Proposal Menunggu Review',
            'message' => 'Proposal "E2E: Analisis Dampak AI dalam Pendidikan" menunggu review Staff LPPM.',
            'data' => json_encode(['proposal_id' => $proposalStaffReview->proposal_id]),
            'action_url' => '/dashboard?module=staffmonitoringprogress&skema_id=' . $skema1->skema_id . '&view=proposal&proposal_id=' . $proposalStaffReview->proposal_id . '&tab=SELEKSI_PROPOSAL&jenis=Penelitian',
            'key' => 'e2e-notif-staff-review-' . $proposalStaffReview->proposal_id,
            'read_at' => null,
        ]);

        Notification::create([
            'user_id' => $staff1->id,
            'type' => 'proposal.reviews.complete',
            'title' => 'Review Selesai',
            'message' => 'Review proposal "E2E: Optimasi Database untuk Aplikasi Real-time" telah selesai.',
            'data' => json_encode(['proposal_id' => $proposalUnderReview->proposal_id]),
            'action_url' => '/dashboard?module=staffmonitoringprogress&skema_id=' . $skema1->skema_id . '&view=proposal&proposal_id=' . $proposalUnderReview->proposal_id . '&tab=SELEKSI_PROPOSAL&jenis=Penelitian',
            'key' => 'e2e-notif-staff-review-complete-' . $proposalUnderReview->proposal_id,
            'read_at' => null,
        ]);

        // ════════════════════════════════════════════════════════════
        // ACCEPTED PROPOSALS — for laporan/dana test data
        // ════════════════════════════════════════════════════════════
        $propAcceptedClaim1 = Proposal::create([
            'jenis_penelitian' => 'Penelitian',
            'jenis_penelitian_gan' => 'Penelitian',
            'jenis_penelitian_gen' => 'Penelitian',
            'judul' => 'ST-E2E: Klaim Dana Penelitian Energi',
            'tahap_penelitian' => 'Laporan',
            'topik_penelitian' => 'Energi Terbarukan',
            'bidang_ilmu' => 'Teknik',
            'fokus_sdg' => 'SDGs 7 - Energi Bersih',
            'skema' => 'Internal',
            'sumber_skema' => 'Dana Internal',
            'status' => 'Dalam pengerjaan',
            'ketua_seleksi_approved' => true,
            'staff_seleksi_approved' => true,
            'user_id' => $dosenA->id,
            'kegiatan_id' => $kegiatanSeleksi->kegiatan_id,
            'tgl_pengajuan' => '2026-03-01',
            'ra_biaya_penelitian_gan' => 5000000,
            'ra_biaya_publikasi_gan' => 2000000,
            'ra_insentif_gan' => 1500000,
            'ra_biaya_penelitian_gen' => 5000000,
            'ra_biaya_publikasi_gen' => 2000000,
            'ra_insentif_gen' => 1500000,
            'target_publikasi_gan' => 'SCOPUS Q3',
            'target_publikasi_gen' => 'SCOPUS Q3',
            'rencana_judul_publikasi_gan' => 'Renewable Energy Study',
            'rencana_judul_publikasi_gen' => 'Renewable Energy Study',
            'metopen_gan' => 'Mixed Methods',
            'metopen_gen' => 'Mixed Methods',
            'unit_analisis_gan' => 'Laboratorium',
            'unit_analisis_gen' => 'Laboratorium',
            'kontribusi_ilmu_makul' => 'Kontribusi Ilmu',
            'kontribusi_pkm' => 'Kontribusi PKM',
            'rencana_luaran' => 'Jurnal Internasional',
            'institusi_mitra' => 'Universitas Test',
        ]);

        $propAcceptedClaim2 = Proposal::create([
            'jenis_penelitian' => 'Penelitian',
            'jenis_penelitian_gan' => 'Penelitian',
            'jenis_penelitian_gen' => 'Penelitian',
            'judul' => 'ST-E2E: Klaim Dana Konfirmasi Admin',
            'tahap_penelitian' => 'Laporan',
            'topik_penelitian' => 'Kesehatan Masyarakat',
            'bidang_ilmu' => 'Kedokteran',
            'fokus_sdg' => 'SDGs 3 - Kesehatan',
            'skema' => 'Internal',
            'sumber_skema' => 'Dana Internal',
            'status' => 'Dalam pengerjaan',
            'ketua_seleksi_approved' => true,
            'staff_seleksi_approved' => true,
            'user_id' => $dosenB->id,
            'kegiatan_id' => $kegiatanSeleksi->kegiatan_id,
            'tgl_pengajuan' => '2026-03-15',
            'ra_biaya_penelitian_gan' => 4000000,
            'ra_biaya_publikasi_gan' => 1800000,
            'ra_insentif_gan' => 1200000,
            'ra_biaya_penelitian_gen' => 4000000,
            'ra_biaya_publikasi_gen' => 1800000,
            'ra_insentif_gen' => 1200000,
            'target_publikasi_gan' => 'SCOPUS Q2',
            'target_publikasi_gen' => 'SCOPUS Q2',
            'rencana_judul_publikasi_gan' => 'Public Health Intervention',
            'rencana_judul_publikasi_gen' => 'Public Health Intervention',
            'metopen_gan' => 'Quantitative',
            'metopen_gen' => 'Quantitative',
            'unit_analisis_gan' => 'Individu',
            'unit_analisis_gen' => 'Individu',
            'kontribusi_ilmu_makul' => 'Kontribusi Ilmu',
            'kontribusi_pkm' => 'Kontribusi PKM',
            'rencana_luaran' => 'Jurnal Nasional',
            'institusi_mitra' => '-',
        ]);

        $propAcceptedPengembalian = Proposal::create([
            'jenis_penelitian' => 'Penelitian',
            'jenis_penelitian_gan' => 'Penelitian',
            'jenis_penelitian_gen' => 'Penelitian',
            'judul' => 'ST-E2E: Pengembalian Dana Penelitian',
            'tahap_penelitian' => 'Laporan',
            'topik_penelitian' => 'Lingkungan Hidup',
            'bidang_ilmu' => 'Biologi',
            'fokus_sdg' => 'SDGs 13 - Iklim',
            'skema' => 'Internal',
            'sumber_skema' => 'Dana Internal',
            'status' => 'Dalam pengerjaan',
            'ketua_seleksi_approved' => true,
            'staff_seleksi_approved' => true,
            'user_id' => $dosenA->id,
            'kegiatan_id' => $kegiatanSeleksi->kegiatan_id,
            'tgl_pengajuan' => '2026-04-01',
            'ra_biaya_penelitian_gan' => 3500000,
            'ra_biaya_publikasi_gan' => 1600000,
            'ra_insentif_gan' => 1100000,
            'ra_biaya_penelitian_gen' => 3500000,
            'ra_biaya_publikasi_gen' => 1600000,
            'ra_insentif_gen' => 1100000,
            'target_publikasi_gan' => 'SCOPUS Q3',
            'target_publikasi_gen' => 'SCOPUS Q3',
            'rencana_judul_publikasi_gan' => 'Climate Change Adaptation',
            'rencana_judul_publikasi_gen' => 'Climate Change Adaptation',
            'metopen_gan' => 'Mixed Methods',
            'metopen_gen' => 'Mixed Methods',
            'unit_analisis_gan' => 'Ekosistem',
            'unit_analisis_gen' => 'Ekosistem',
            'kontribusi_ilmu_makul' => 'Kontribusi Ilmu',
            'kontribusi_pkm' => 'Kontribusi PKM',
            'rencana_luaran' => 'Jurnal Internasional',
            'institusi_mitra' => '-',
        ]);

        // ════════════════════════════════════════════════════════════
        // LAPORAN — Dana tasks for Staff dashboard
        // ════════════════════════════════════════════════════════════

        // Laporan 1: claim_dana_status = 'Menunggu bukti terima' (Staff uploaded transfer, waiting for Dosen receipt)
        Laporan::create([
            'proposal_id' => $propAcceptedClaim1->proposal_id,
            'semester' => 'Ganjil',
            'jenis_penelitian' => 'Penelitian',
            'judul_penelitian' => 'ST-E2E: Klaim Dana Energi - Menunggu Bukti Terima',
            'status' => 'Menunggu konfirmasi penerimaan dana',
            'claim_dana_status' => 'Menunggu bukti terima',
            'claim_dana_approved_at' => $now,
            'tgl_mulai' => '2026-07-01',
            'kegiatan_id' => $kegiatanClaim->kegiatan_id,
        ]);

        // Laporan 2: claim_dana_status = 'Menunggu konfirmasi admin' (Dosen uploaded receipt, Staff needs to confirm)
        Laporan::create([
            'proposal_id' => $propAcceptedClaim2->proposal_id,
            'semester' => 'Ganjil',
            'jenis_penelitian' => 'Penelitian',
            'judul_penelitian' => 'ST-E2E: Klaim Dana Kesehatan - Menunggu Konfirmasi',
            'status' => 'Menunggu konfirmasi penerimaan dana',
            'claim_dana_status' => 'Menunggu konfirmasi admin',
            'claim_dana_approved_at' => $now->subDays(3),
            'tgl_mulai' => '2026-07-01',
            'kegiatan_id' => $kegiatanClaim->kegiatan_id,
        ]);

        // Laporan 3: pengembalian_dana_status = 'Menunggu Pengembalian Dana' (Staff requested, Dosen returning)
        Laporan::create([
            'proposal_id' => $propAcceptedPengembalian->proposal_id,
            'semester' => 'Ganjil',
            'jenis_penelitian' => 'Penelitian',
            'judul_penelitian' => 'ST-E2E: Pengembalian Dana Lingkungan - Dosen Mengembalikan',
            'status' => 'Dalam pengerjaan',
            'pengembalian_dana_status' => 'Menunggu Pengembalian Dana',
            'tgl_mulai' => '2026-07-01',
            'kegiatan_id' => $kegiatanPengembalian->kegiatan_id,
        ]);

        // ════════════════════════════════════════════════════════════
        // KEGIATAN — Diseminasi Ganjil (for KT-DIS-APPROVE-MUT-001)
        // ════════════════════════════════════════════════════════════
        $kegiatanDiseminasi = KegiatanPengajuan::create([
            'skema_id' => $skema1->skema_id,
            'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'DISEMINASI_GANJIL',
            'nama_kegiatan' => 'Diseminasi Ganjil',
            'tgl_mulai' => '2026-01-01',
            'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka',
            'manual_status_override' => true,
        ]);

        // ════════════════════════════════════════════════════════════
        // LAPORAN — Diseminasi stage (for Ketua approval test)
        // ════════════════════════════════════════════════════════════
        $propAcceptedDis = Proposal::create([
            'jenis_penelitian' => 'Penelitian',
            'jenis_penelitian_gan' => 'Penelitian',
            'jenis_penelitian_gen' => 'Penelitian',
            'judul' => 'ST-E2E: Diseminasi Energi Terbarukan',
            'tahap_penelitian' => 'Laporan',
            'topik_penelitian' => 'Energi Terbarukan',
            'bidang_ilmu' => 'Teknik',
            'fokus_sdg' => 'SDGs 7 - Energi Bersih',
            'skema' => 'Internal',
            'sumber_skema' => 'Dana Internal',
            'status' => 'Proposal Diterima',
            'ketua_seleksi_approved' => true,
            'staff_seleksi_approved' => true,
            'user_id' => $dosenA->id,
            'kegiatan_id' => $kegiatanSeleksi->kegiatan_id,
            'tgl_pengajuan' => '2026-05-01',
            'ra_biaya_penelitian_gan' => 5000000,
            'ra_biaya_publikasi_gan' => 2000000,
            'ra_insentif_gan' => 1500000,
            'ra_biaya_penelitian_gen' => 5000000,
            'ra_biaya_publikasi_gen' => 2000000,
            'ra_insentif_gen' => 1500000,
            'target_publikasi_gan' => 'SCOPUS Q3',
            'target_publikasi_gen' => 'SCOPUS Q3',
            'rencana_judul_publikasi_gan' => 'Renewable Energy Dissemination',
            'rencana_judul_publikasi_gen' => 'Renewable Energy Dissemination',
            'metopen_gan' => 'Mixed Methods',
            'metopen_gen' => 'Mixed Methods',
            'unit_analisis_gan' => 'Laboratorium',
            'unit_analisis_gen' => 'Laboratorium',
            'kontribusi_ilmu_makul' => 'Kontribusi Ilmu',
            'kontribusi_pkm' => 'Kontribusi PKM',
            'rencana_luaran' => 'Jurnal Internasional',
            'institusi_mitra' => '-',
        ]);

        Laporan::create([
            'proposal_id' => $propAcceptedDis->proposal_id,
            'semester' => 'Ganjil',
            'jenis_penelitian' => 'Penelitian',
            'judul_penelitian' => 'ST-E2E: Laporan Diseminasi Energi',
            'status' => 'Dalam pengerjaan',
            'tgl_mulai' => '2026-07-01',
            'kegiatan_id' => $kegiatanDiseminasi->kegiatan_id,
        ]);
    }
}
