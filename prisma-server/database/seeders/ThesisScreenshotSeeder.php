<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Prodi;
use App\Models\Skema;
use App\Models\KegiatanPengajuan;
use App\Models\Proposal;
use App\Models\ProposalMember;
use App\Models\Laporan;
use App\Models\LaporanMember;
use App\Models\PenugasanReviewer;
use App\Models\Review;
use App\Models\Settings;
use App\Models\Notification;
use App\Models\LogbookPengerjaan;
use App\Models\Dokumen;
use App\Models\DokumenVersion;
use App\Models\AuthorizationRequest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Deterministic seeder for thesis screenshot capture.
 * Creates users, proposals, laporans, and reviews at every workflow stage
 * needed for Bab IV Section 4.3 Hasil Pengembangan Sistem screenshots.
 *
 * Safe to run repeatedly (idempotent via migrate:fresh).
 */
class ThesisScreenshotSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // ════════════════════════════════════════════════════════════
        // PRODI
        // ════════════════════════════════════════════════════════════
        $prodiTI = Prodi::create(['nama_prodi' => 'Sistem Teknologi dan Informasi']);
        $prodiBD = Prodi::create(['nama_prodi' => 'Bisnis Digital']);
        $prodiKW = Prodi::create(['nama_prodi' => 'Kewirausahaan']);

        // ════════════════════════════════════════════════════════════
        // USERS — Must match E2E auth setup emails
        // ════════════════════════════════════════════════════════════
        $superadmin = User::create([
            'nama' => 'Superadmin', 'email' => 'superadmin.e2e@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Superadmin', 'status' => 'Aktif', 'gender' => 'L',
            'nidn' => '90001', 'no_hp' => '081234567801',
            'prodi_id' => $prodiTI->prodi_id, 'remember_token' => Str::random(10),
        ]);

        $ketua = User::create([
            'nama' => 'Ketua LPPM', 'email' => 'ketua.lppm@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Ketua LPPM', 'status' => 'Aktif', 'gender' => 'P',
            'nidn' => '10001', 'no_hp' => '081234567891',
            'prodi_id' => $prodiTI->prodi_id, 'remember_token' => Str::random(10),
        ]);

        $staff = User::create([
            'nama' => 'Staff LPPM 1', 'email' => 'staff.lppm1@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Staff LPPM', 'status' => 'Aktif', 'gender' => 'L',
            'nidn' => '10002', 'no_hp' => '081234567892',
            'prodi_id' => $prodiBD->prodi_id, 'remember_token' => Str::random(10),
        ]);

        $dosen = User::create([
            'nama' => 'Dosen E2E', 'email' => 'dosen.e2e@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Dosen', 'status' => 'Aktif', 'gender' => 'L',
            'nidn' => '20001', 'no_hp' => '081234567894',
            'prodi_id' => $prodiTI->prodi_id, 'remember_token' => Str::random(10),
        ]);

        $reviewer = User::create([
            'nama' => 'Reviewer E2E', 'email' => 'reviewer.e2e@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Reviewer', 'status' => 'Aktif', 'gender' => 'L',
            'nidn' => '30001', 'no_hp' => '081234567897',
            'prodi_id' => $prodiTI->prodi_id, 'remember_token' => Str::random(10),
        ]);

        $reviewer2 = User::create([
            'nama' => 'Reviewer E2E 2', 'email' => 'reviewer2.e2e@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Reviewer', 'status' => 'Aktif', 'gender' => 'P',
            'nidn' => '30004', 'no_hp' => '081234567800',
            'prodi_id' => $prodiTI->prodi_id, 'remember_token' => Str::random(10),
        ]);

        $reviewer3 = User::create([
            'nama' => 'Reviewer E2E 3', 'email' => 'reviewer3.e2e@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Reviewer', 'status' => 'Aktif', 'gender' => 'L',
            'nidn' => '30005', 'no_hp' => '081234567801',
            'prodi_id' => $prodiTI->prodi_id, 'remember_token' => Str::random(10),
        ]);

        // ════════════════════════════════════════════════════════════
        // SETTINGS
        // ════════════════════════════════════════════════════════════
        Settings::create([
            'kepala_lppm' => $ketua->id,
            'rektor' => $superadmin->id,
            'rektor_nama' => 'Prof. Dr. Rektor Test',
            'rektor_nidn' => '99001',
            'rektor_nuptk' => '99001',
            'nama_kampus' => 'ITBSS Thesis Demo',
            'kriteria_penilaian' => json_encode([
                ['kriteria' => 'Kesesuaian Tema', 'bobot' => 30],
                ['kriteria' => 'Metodologi', 'bobot' => 30],
                ['kriteria' => 'Timeline', 'bobot' => 20],
                ['kriteria' => 'Anggaran', 'bobot' => 20],
            ]),
            'list_kesesuaian_tema' => json_encode(['SDGs', 'Teknologi', 'Kesehatan', 'Lingkungan']),
            'ignore_kegiatan_dates' => true,
        ]);

        // ════════════════════════════════════════════════════════════
        // SKEMA
        // ════════════════════════════════════════════════════════════
        $skema = Skema::create([
            'nama_skema' => 'Penelitian Dosen Tetap 2026',
            'tahun_ajaran' => '2025/2026',
            'status' => 'Aktif',
        ]);

        // ════════════════════════════════════════════════════════════
        // KEGIATAN PENGAJUAN — All stages
        // ════════════════════════════════════════════════════════════
        $kegPenerimaan = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'PENERIMAAN_PROPOSAL', 'nama_kegiatan' => 'Penerimaan Proposal Penelitian',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegSeleksi = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'SELEKSI_PROPOSAL', 'nama_kegiatan' => 'Seleksi Proposal Penelitian',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegSK = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'nama_kegiatan' => 'Pengumuman Surat Tugas',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        // Laporan stages — Penelitian Ganjil
        $kegGanProses = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'PROSES_PENELITIAN_GANJIL', 'nama_kegiatan' => 'Proses Penelitian Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegGanPub = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'PUBLIKASI_GANJIL', 'nama_kegiatan' => 'Publikasi Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegGanDis = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'DISEMINASI_GANJIL', 'nama_kegiatan' => 'Diseminasi Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegGanClaim = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'CLAIM_DANA_GANJIL', 'nama_kegiatan' => 'Claim Dana Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegGanLuaran = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'LUARAN_PENELITIAN', 'nama_kegiatan' => 'Luaran Penelitian',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        // Laporan stages — PkM Ganjil
        $kegPkmClaim = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'CLAIM_DANA_GANJIL', 'nama_kegiatan' => 'Claim Dana PkM Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPkmProses = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'PROSES_PKM_GANJIL', 'nama_kegiatan' => 'Proses PkM Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPkmPub = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'PUBLIKASI_GANJIL', 'nama_kegiatan' => 'Publikasi PkM Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPkmReturn = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'PENGEMBALIAN_DANA_GANJIL', 'nama_kegiatan' => 'Pengembalian Dana PkM Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPkmDis = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'DISEMINASI_GANJIL', 'nama_kegiatan' => 'Diseminasi PkM Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);

        // ════════════════════════════════════════════════════════════
        // BASE PROPOSAL TEMPLATE
        // ════════════════════════════════════════════════════════════
        $baseProposal = [
            'jenis_penelitian' => 'Penelitian', 'jenis_penelitian_gan' => 'Penelitian',
            'jenis_penelitian_gen' => 'Penelitian', 'tahap_penelitian' => 'Proposal',
            'skema' => 'Internal', 'sumber_skema' => 'Dana Internal',
            'user_id' => $dosen->id,
            'target_publikasi_gan' => 'SCOPUS Q3', 'target_publikasi_gen' => 'SCOPUS Q3',
            'rencana_judul_publikasi_gan' => 'Judul Publikasi Ganjil',
            'rencana_judul_publikasi_gen' => 'Judul Publikasi Genap',
            'metopen_gan' => 'Mixed Methods', 'metopen_gen' => 'Mixed Methods',
            'unit_analisis_gan' => 'Sample Penelitian', 'unit_analisis_gen' => 'Sample Penelitian',
            'kontribusi_ilmu_makul' => 'Kontribusi Ilmu ke Rekayasa Perangkat Lunak',
            'kontribusi_pkm' => 'Kontribusi PkM kepada Masyarakat',
        ];

        // ════════════════════════════════════════════════════════════
        // PROPOSALS — All workflow stages (Penelitian)
        // ════════════════════════════════════════════════════════════

        // 1. Draft
        Proposal::create(array_merge($baseProposal, [
            'judul' => 'Analisis Dampak Kecerdasan Buatan dalam Pendidikan',
            'topik_penelitian' => 'Teknologi Pendidikan', 'bidang_ilmu' => 'Teknologi Informasi',
            'fokus_sdg' => 'SDGs 4 - Pendidikan Berkualitas',
            'status' => 'Draft', 'kegiatan_id' => $kegPenerimaan->kegiatan_id,
            'tgl_pengajuan' => '2026-08-01',
            'rencana_luaran' => 'Jurnal Internasional Scopus Q3', 'institusi_mitra' => '-',
        ]));

        // 2. Menunggu proposal untuk diupload
        Proposal::create(array_merge($baseProposal, [
            'judul' => 'Machine Learning untuk Deteksi Dini Penyakit',
            'topik_penelitian' => 'Kesehatan', 'bidang_ilmu' => 'Informatika Kesehatan',
            'fokus_sdg' => 'SDGs 3 - Kesehatan yang Baik',
            'status' => 'Menunggu proposal untuk diupload', 'kegiatan_id' => $kegPenerimaan->kegiatan_id,
            'tgl_pengajuan' => '2026-08-02',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
        ]));

        // 3. Menunggu review dari Ketua LPPM
        Proposal::create(array_merge($baseProposal, [
            'judul' => 'Cloud Computing untuk IoT Smart Agriculture',
            'topik_penelitian' => 'Pertanian Cerdas', 'bidang_ilmu' => 'Teknologi Informasi',
            'fokus_sdg' => 'SDGs 2 - Tanpa Kelaparan',
            'status' => 'Menunggu review dari Ketua LPPM', 'kegiatan_id' => $kegSeleksi->kegiatan_id,
            'staff_seleksi_approved' => true, 'tgl_pengajuan' => '2026-08-03',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        // 4. Menunggu review Staff LPPM
        Proposal::create(array_merge($baseProposal, [
            'judul' => 'IoT untuk Monitoring Kualitas Air Tambak',
            'topik_penelitian' => 'Akuakultur', 'bidang_ilmu' => 'Teknik Kelautan',
            'fokus_sdg' => 'SDGs 14 - Ekosistem Laut',
            'status' => 'Menunggu review Staff LPPM', 'kegiatan_id' => $kegSeleksi->kegiatan_id,
            'tgl_pengajuan' => '2026-08-04',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
        ]));

        // 5. Menunggu penugasan reviewer
        Proposal::create(array_merge($baseProposal, [
            'judul' => 'Blockchain untuk Sertifikasi Pendidikan',
            'topik_penelitian' => 'Pendidikan', 'bidang_ilmu' => 'Teknologi Informasi',
            'fokus_sdg' => 'SDGs 4 - Pendidikan Berkualitas',
            'status' => 'Menunggu penugasan reviewer', 'kegiatan_id' => $kegSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-05',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        // 6. Menunggu review (3 reviewers assigned, 0/3 complete)
        $propReview0 = Proposal::create(array_merge($baseProposal, [
            'judul' => 'Natural Language Processing untuk Analisis Sentimen',
            'topik_penelitian' => 'NLP', 'bidang_ilmu' => 'Ilmu Komputer',
            'fokus_sdg' => 'SDGs 4 - Pendidikan Berkualitas',
            'status' => 'Menunggu review', 'kegiatan_id' => $kegSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-06',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal', 'reviewable_id' => $propReview0->proposal_id,
            'proposal_id' => $propReview0->proposal_id, 'user_id' => $reviewer->id,
            'tgl_penugasan' => '2026-08-07', 'status_review' => 'Belum direview',
        ]);
        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal', 'reviewable_id' => $propReview0->proposal_id,
            'proposal_id' => $propReview0->proposal_id, 'user_id' => $reviewer2->id,
            'tgl_penugasan' => '2026-08-07', 'status_review' => 'Belum direview',
        ]);
        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal', 'reviewable_id' => $propReview0->proposal_id,
            'proposal_id' => $propReview0->proposal_id, 'user_id' => $reviewer3->id,
            'tgl_penugasan' => '2026-08-07', 'status_review' => 'Belum direview',
        ]);

        // 7. Menunggu review (3/3 complete, status still "Menunggu review" — for screenshot of all 3 reviews)
        $propReview3 = Proposal::create(array_merge($baseProposal, [
            'judul' => 'Deep Learning untuk Pengenalan Wajah',
            'topik_penelitian' => 'Computer Vision', 'bidang_ilmu' => 'Ilmu Komputer',
            'fokus_sdg' => 'SDGs 9 - Industri dan Inovasi',
            'status' => 'Menunggu persetujuan Ketua LPPM', 'kegiatan_id' => $kegSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-08',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        $pa1 = PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal', 'reviewable_id' => $propReview3->proposal_id,
            'proposal_id' => $propReview3->proposal_id, 'user_id' => $reviewer->id,
            'tgl_penugasan' => '2026-08-07', 'status_review' => 'Telah direview',
        ]);
        Review::create([
            'penugasan_id' => $pa1->penugasan_id, 'keputusan' => 'Diterima',
            'kriteria_kesesuaian_tema' => json_encode(['Sangat Sesuai']),
            'kriteria_penilaian' => json_encode([
                ['kriteria' => 'Kesesuaian Tema', 'skor' => 90],
                ['kriteria' => 'Metodologi', 'skor' => 85],
                ['kriteria' => 'Timeline', 'skor' => 80],
                ['kriteria' => 'Anggaran', 'skor' => 85],
            ]),
            'catatan' => 'Proposal sangat baik, metodologi tepat.', 'tgl_review' => '2026-08-08',
        ]);

        $pa2 = PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal', 'reviewable_id' => $propReview3->proposal_id,
            'proposal_id' => $propReview3->proposal_id, 'user_id' => $reviewer2->id,
            'tgl_penugasan' => '2026-08-07', 'status_review' => 'Telah direview',
        ]);
        Review::create([
            'penugasan_id' => $pa2->penugasan_id, 'keputusan' => 'Diterima dengan perbaikan',
            'kriteria_kesesuaian_tema' => json_encode(['Sesuai']),
            'kriteria_penilaian' => json_encode([
                ['kriteria' => 'Kesesuaian Tema', 'skor' => 80],
                ['kriteria' => 'Metodologi', 'skor' => 75],
                ['kriteria' => 'Timeline', 'skor' => 70],
                ['kriteria' => 'Anggaran', 'skor' => 80],
            ]),
            'catatan' => 'Perlu perbaikan pada timeline dan anggaran.', 'tgl_review' => '2026-08-09',
        ]);

        $pa3 = PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal', 'reviewable_id' => $propReview3->proposal_id,
            'proposal_id' => $propReview3->proposal_id, 'user_id' => $reviewer3->id,
            'tgl_penugasan' => '2026-08-07', 'status_review' => 'Telah direview',
        ]);
        Review::create([
            'penugasan_id' => $pa3->penugasan_id, 'keputusan' => 'Diterima',
            'kriteria_kesesuaian_tema' => json_encode(['Sangat Sesuai']),
            'kriteria_penilaian' => json_encode([
                ['kriteria' => 'Kesesuaian Tema', 'skor' => 95],
                ['kriteria' => 'Metodologi', 'skor' => 90],
                ['kriteria' => 'Timeline', 'skor' => 85],
                ['kriteria' => 'Anggaran', 'skor' => 90],
            ]),
            'catatan' => 'Proposal berkualitas tinggi.', 'tgl_review' => '2026-08-10',
        ]);

        // ════════════════════════════════════════════════════════════
        // PROPOSALS — Penelitian Accepted (3 proposals, each gets 1 Ganjil + 1 Genap laporan)
        // ════════════════════════════════════════════════════════════

        // Accepted A: Ganjil = Dalam pengerjaan + logbook, Genap = Publikasi
        $propAccepted = Proposal::create(array_merge($baseProposal, [
            'judul' => 'Optimasi Energi Terbarukan untuk Smart Grid',
            'topik_penelitian' => 'Energi Terbarukan', 'bidang_ilmu' => 'Teknik Elektro',
            'fokus_sdg' => 'SDGs 7 - Energi Bersih',
            'status' => 'Proposal Diterima', 'kegiatan_id' => $kegSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-01',
            'rencana_luaran' => 'Jurnal Internasional Scopus Q2', 'institusi_mitra' => 'PLN Research Center',
        ]));

        // Accepted B: Ganjil = Diseminasi, Genap = Claim Dana
        $propAcceptedB = Proposal::create(array_merge($baseProposal, [
            'judul' => 'Sistem Pendukung Keputusan Berbasis AI untuk Diagnosis Penyakit',
            'topik_penelitian' => 'Kecerdasan Buatan', 'bidang_ilmu' => 'Informatika Kesehatan',
            'fokus_sdg' => 'SDGs 3 - Kesehatan yang Baik',
            'status' => 'Proposal Diterima', 'kegiatan_id' => $kegSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-10',
            'rencana_luaran' => 'Jurnal Internasional Scopus Q3', 'institusi_mitra' => 'RSUD Dr. Soetomo',
        ]));

        // Accepted C: Ganjil = Pengembalian Dana, Genap = Pengembalian Skip
        $propAcceptedC = Proposal::create(array_merge($baseProposal, [
            'judul' => 'Pemanfaatan Drone untuk Pemantauan Lingkungan',
            'topik_penelitian' => 'Lingkungan Hidup', 'bidang_ilmu' => 'Teknologi Lingkungan',
            'fokus_sdg' => 'SDGs 13 - Penanganan Perubahan Iklim',
            'status' => 'Proposal Diterima', 'kegiatan_id' => $kegSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-20',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => 'DLH Provinsi',
        ]));

        // ════════════════════════════════════════════════════════════
        // PROPOSALS — PkM Accepted (2 proposals)
        // ════════════════════════════════════════════════════════════

        // PkM A: Ganjil = Claim Dana PkM
        $propPkmAccepted = Proposal::create(array_merge($baseProposal, [
            'judul' => 'Pelatihan Digitalisasi UMKM Berbasis Teknologi',
            'jenis_penelitian' => 'PkM', 'jenis_penelitian_gan' => 'PkM',
            'jenis_penelitian_gen' => 'PkM', 'tahap_penelitian' => 'Proposal',
            'topik_penelitian' => 'UMKM Digital', 'bidang_ilmu' => 'Sistem Informasi',
            'fokus_sdg' => 'SDGs 8 - Pekerjaan Layak',
            'status' => 'Proposal Diterima', 'kegiatan_id' => $kegSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-15',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => 'Dinas Koperasi',
            'target_publikasi_gan' => 'Jurnal Nasional', 'target_publikasi_gen' => 'Jurnal Nasional',
            'rencana_judul_publikasi_gan' => 'Digitalisasi UMKM', 'rencana_judul_publikasi_gen' => 'Digitalisasi UMKM',
            'metopen_gan' => 'Action Research', 'metopen_gen' => 'Action Research',
            'unit_analisis_gan' => 'UMKM', 'unit_analisis_gen' => 'UMKM',
        ]));

        // PkM B: Ganjil = Pengembalian Dana (dosen uploaded), Genap = Pengembalian Skip
        $propPkmAcceptedB = Proposal::create(array_merge($baseProposal, [
            'judul' => 'Sosialisasi Literasi Digital untuk Masyarakat Pedesaan',
            'jenis_penelitian' => 'PkM', 'jenis_penelitian_gan' => 'PkM',
            'jenis_penelitian_gen' => 'PkM', 'tahap_penelitian' => 'Proposal',
            'topik_penelitian' => 'Literasi Digital', 'bidang_ilmu' => 'Teknologi Informasi',
            'fokus_sdg' => 'SDGs 4 - Pendidikan Berkualitas',
            'status' => 'Proposal Diterima', 'kegiatan_id' => $kegSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-25',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => 'Dinas Pendidikan',
            'target_publikasi_gan' => 'Jurnal Nasional', 'target_publikasi_gen' => 'Jurnal Nasional',
            'rencana_judul_publikasi_gan' => 'Literasi Digital Pedesaan', 'rencana_judul_publikasi_gen' => 'Literasi Digital Pedesaan',
            'metopen_gan' => 'Action Research', 'metopen_gen' => 'Action Research',
            'unit_analisis_gan' => 'Masyarakat', 'unit_analisis_gen' => 'Masyarakat',
        ]));

        // ════════════════════════════════════════════════════════════
        // LAPORAN — Penelitian (one per proposal per semester)
        // ════════════════════════════════════════════════════════════

        // Prop A — Ganjil: Dalam pengerjaan + logbook (screenshots 16, 17, 18)
        $lapProses = Laporan::create([
            'proposal_id' => $propAccepted->proposal_id, 'kegiatan_id' => $kegGanProses->kegiatan_id,
            'semester' => 'Ganjil', 'jenis_penelitian' => 'Penelitian',
            'judul_penelitian' => 'Optimasi Energi Terbarukan untuk Smart Grid',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-08-01',
            'institusi_mitra' => 'PLN Research Center',
        ]);

        // Prop A — Genap: Menunggu review Admin (screenshot 19 — publikasi)
        $lapPub = Laporan::create([
            'proposal_id' => $propAccepted->proposal_id, 'kegiatan_id' => $kegGanPub->kegiatan_id,
            'semester' => 'Genap', 'jenis_penelitian' => 'Penelitian',
            'judul_penelitian' => 'Optimasi Energi Terbarukan untuk Smart Grid',
            'status' => 'Menunggu review Admin', 'tgl_mulai' => '2026-02-01',
            'institusi_mitra' => 'PLN Research Center',
            'target_publikasi' => 'SCOPUS Q2', 'nama_jurnal' => 'IEEE Transactions on Smart Grid',
        ]);

        // Prop B — Ganjil: Diseminasi (screenshot 20)
        $lapDis = Laporan::create([
            'proposal_id' => $propAcceptedB->proposal_id, 'kegiatan_id' => $kegGanDis->kegiatan_id,
            'semester' => 'Ganjil', 'jenis_penelitian' => 'Penelitian',
            'judul_penelitian' => 'Sistem Pendukung Keputusan Berbasis AI untuk Diagnosis Penyakit',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-08-01',
            'institusi_mitra' => 'RSUD Dr. Soetomo',
            'ketua_diseminasi_approved' => false, 'staff_diseminasi_approved' => false,
        ]);

        // Prop B — Genap: Claim Dana (screenshots 21, 22)
        $lapClaim = Laporan::create([
            'proposal_id' => $propAcceptedB->proposal_id, 'kegiatan_id' => $kegGanClaim->kegiatan_id,
            'semester' => 'Genap', 'jenis_penelitian' => 'Penelitian',
            'judul_penelitian' => 'Sistem Pendukung Keputusan Berbasis AI untuk Diagnosis Penyakit',
            'status' => 'Menunggu konfirmasi penerimaan dana', 'tgl_mulai' => '2026-02-01',
            'institusi_mitra' => 'RSUD Dr. Soetomo',
            'claim_dana_status' => 'Menunggu bukti terima',
        ]);

        // Prop C — Ganjil: Pengembalian Dana (screenshots 23, 24)
        $lapReturn = Laporan::create([
            'proposal_id' => $propAcceptedC->proposal_id, 'kegiatan_id' => $kegGanClaim->kegiatan_id,
            'semester' => 'Ganjil', 'jenis_penelitian' => 'Penelitian',
            'judul_penelitian' => 'Pemanfaatan Drone untuk Pemantauan Lingkungan',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-08-01',
            'institusi_mitra' => 'DLH Provinsi',
            'pengembalian_dana_status' => 'Menunggu Pengembalian Dana',
            'dana_dikembalikan' => true,
        ]);

        // Prop C — Genap: Pengembalian Skip (screenshot 25)
        $lapSkip = Laporan::create([
            'proposal_id' => $propAcceptedC->proposal_id, 'kegiatan_id' => $kegGanProses->kegiatan_id,
            'semester' => 'Genap', 'jenis_penelitian' => 'Penelitian',
            'judul_penelitian' => 'Pemanfaatan Drone untuk Pemantauan Lingkungan',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-02-01',
            'institusi_mitra' => 'DLH Provinsi',
            'pengembalian_dana_status' => 'Selesai',
            'pengembalian_dana_skipped_reason' => 'Tidak ada sisa dana yang harus dikembalikan',
            'pengembalian_dana_confirmed_at' => $now,
        ]);

        // ════════════════════════════════════════════════════════════
        // LAPORAN — PkM (one per proposal per semester)
        // ════════════════════════════════════════════════════════════

        // PkM A — Ganjil: Claim Dana PkM
        $lapPkmClaim = Laporan::create([
            'proposal_id' => $propPkmAccepted->proposal_id, 'kegiatan_id' => $kegPkmClaim->kegiatan_id,
            'semester' => 'Ganjil', 'jenis_penelitian' => 'PkM',
            'judul_penelitian' => 'Pelatihan Digitalisasi UMKM Berbasis Teknologi',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-08-01',
            'institusi_mitra' => 'Dinas Koperasi',
            'claim_dana_status' => 'Menunggu bukti terima',
        ]);

        // PkM B — Ganjil: Pengembalian Dana PkM (dosen uploaded proof)
        $lapPkmReturn = Laporan::create([
            'proposal_id' => $propPkmAcceptedB->proposal_id, 'kegiatan_id' => $kegPkmReturn->kegiatan_id,
            'semester' => 'Ganjil', 'jenis_penelitian' => 'PkM',
            'judul_penelitian' => 'Sosialisasi Literasi Digital untuk Masyarakat Pedesaan',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-08-01',
            'institusi_mitra' => 'Dinas Pendidikan',
            'pengembalian_dana_status' => 'Menunggu Pengembalian Dana',
            'dana_dikembalikan' => true,
        ]);

        // PkM B — Genap: Pengembalian Skip
        $lapPkmSkip = Laporan::create([
            'proposal_id' => $propPkmAcceptedB->proposal_id, 'kegiatan_id' => $kegPkmProses->kegiatan_id,
            'semester' => 'Genap', 'jenis_penelitian' => 'PkM',
            'judul_penelitian' => 'Sosialisasi Literasi Digital untuk Masyarakat Pedesaan',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-02-01',
            'institusi_mitra' => 'Dinas Pendidikan',
            'pengembalian_dana_status' => 'Selesai',
            'pengembalian_dana_skipped_reason' => 'Tidak ada sisa dana yang harus dikembalikan',
            'pengembalian_dana_confirmed_at' => $now,
        ]);

        // ════════════════════════════════════════════════════════════
        // AUTHORIZATION REQUEST — pending
        // ════════════════════════════════════════════════════════════
        AuthorizationRequest::create([
            'requestable_type' => 'App\Models\Laporan',
            'requestable_id' => $lapProses->laporan_id,
            'requested_by' => $staff->id,
            'action' => 'return_for_revision',
            'source_stage' => 'Dalam pengerjaan',
            'target_stage' => 'Revisi',
            'reason' => 'Laporan memerlukan revisi pada bagian metodologi penelitian.',
            'current_data' => json_encode(['status' => 'Dalam pengerjaan']),
            'proposed_data' => json_encode(['status' => 'Revisi']),
            'status' => 'Menunggu Persetujuan',
        ]);

        // ════════════════════════════════════════════════════════════
        // NOTIFICATIONS
        // ════════════════════════════════════════════════════════════
        Notification::create([
            'user_id' => $dosen->id, 'type' => 'proposal_update',
            'title' => 'Proposal Diterima',
            'message' => 'Proposal "Optimasi Energi Terbarukan untuk Smart Grid" telah diterima oleh Ketua LPPM.',
            'data' => json_encode(['proposal_id' => $propAccepted->proposal_id]),
            'action_url' => '/dashboard?module=dosenmonitoringprogress',
            'key' => 'proposal-accepted-' . $propAccepted->proposal_id,
        ]);
        Notification::create([
            'user_id' => $dosen->id, 'type' => 'reviewer_assigned',
            'title' => 'Reviewer Ditugaskan',
            'message' => 'Reviewer telah ditugaskan untuk menilai proposal Anda.',
            'data' => json_encode(['proposal_id' => $propReview3->proposal_id]),
            'action_url' => '/dashboard?module=dosenmonitoringprogress',
            'key' => 'reviewer-assigned-' . $propReview3->proposal_id,
        ]);
        Notification::create([
            'user_id' => $ketua->id, 'type' => 'authorization_request',
            'title' => 'Permintaan Otorisasi',
            'message' => 'Staff LPPM meminta otorisasi untuk revisi laporan.',
            'data' => json_encode(['laporan_id' => $lapProses->laporan_id]),
            'action_url' => '/dashboard?module=staffmonitoringprogress',
            'key' => 'auth-request-' . $lapProses->laporan_id,
        ]);

        // ════════════════════════════════════════════════════════════
        // LOGBOOK entries
        // ════════════════════════════════════════════════════════════
        LogbookPengerjaan::create([
            'laporan_id' => $lapProses->laporan_id, 'user_id' => $dosen->id,
            'judul' => 'Perencanaan Metodologi Penelitian',
            'deskripsi' => 'Menyusun metodologi penelitian dan melakukan studi literatur terkait optimasi energi terbarukan.',
            'tgl_kegiatan' => '2026-08-15',
        ]);
        LogbookPengerjaan::create([
            'laporan_id' => $lapProses->laporan_id, 'user_id' => $dosen->id,
            'judul' => 'Pengumpulan Data Primer',
            'deskripsi' => 'Melakukan pengumpulan data di lapangan bekerja sama dengan PLN Research Center.',
            'tgl_kegiatan' => '2026-09-01',
        ]);

        // ════════════════════════════════════════════════════════════
        // PROPOSAL MEMBERS
        // ════════════════════════════════════════════════════════════
        ProposalMember::create([
            'proposal_id' => $propAccepted->proposal_id, 'member_id' => $dosen->id,
            'role' => 'Dosen', 'semester' => 'Ganjil',
            'ttjp' => 'Ketua Tim Peneliti',
        ]);

        LaporanMember::create([
            'laporan_id' => $lapProses->laporan_id, 'member_id' => $dosen->id,
            'role' => 'Dosen', 'position' => 1, 'ttjp' => 'Ketua Tim Peneliti',
        ]);

        $this->command->info('Thesis screenshot seeder completed. All fixtures created.');
    }
}
