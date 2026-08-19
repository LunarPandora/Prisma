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
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class E2EReviewerSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // ── Prodi ──
        $prodiTI = Prodi::create(['nama_prodi' => 'Sistem Teknologi dan Informasi']);
        $prodiBD = Prodi::create(['nama_prodi' => 'Bisnis Digital']);

        // ── Users ──
        $superadmin = User::create([
            'nama' => 'Superadmin', 'email' => 'superadmin@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Superadmin', 'status' => 'Aktif', 'gender' => 'L',
            'no_hp' => '081234567890', 'remember_token' => Str::random(10),
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

        $reviewerE2E = User::create([
            'nama' => 'Reviewer E2E', 'email' => 'reviewer.e2e@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Reviewer', 'status' => 'Aktif', 'gender' => 'L',
            'nidn' => '30001', 'no_hp' => '081234567897',
            'prodi_id' => $prodiTI->prodi_id, 'remember_token' => Str::random(10),
        ]);

        $reviewerB = User::create([
            'nama' => 'Reviewer B', 'email' => 'reviewer.b@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Reviewer', 'status' => 'Aktif', 'gender' => 'P',
            'nidn' => '30002', 'no_hp' => '081234567898',
            'prodi_id' => $prodiBD->prodi_id, 'remember_token' => Str::random(10),
        ]);

        $reviewerC = User::create([
            'nama' => 'Reviewer C', 'email' => 'reviewer.c@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Reviewer', 'status' => 'Aktif', 'gender' => 'L',
            'nidn' => '30003', 'no_hp' => '081234567899',
            'prodi_id' => $prodiTI->prodi_id, 'remember_token' => Str::random(10),
        ]);

        // ── Settings ──
        Settings::create([
            'kepala_lppm' => $ketua->id,
            'kriteria_penilaian' => [
                ['kriteria' => 'Kesesuaian Tema', 'bobot' => 30],
                ['kriteria' => 'Metodologi', 'bobot' => 30],
                ['kriteria' => 'Timeline', 'bobot' => 20],
                ['kriteria' => 'Anggaran', 'bobot' => 20],
            ],
            'list_kesesuaian_tema' => ['SDGs', 'Teknologi', 'Kesehatan', 'Pendidikan'],
            'ignore_kegiatan_dates' => true,
        ]);

        // ── Skema ──
        $skema = Skema::create([
            'nama_skema' => 'Penelitian Dosen Tetap 2026',
            'tahun_ajaran' => '2025/2026',
            'status' => 'Aktif',
        ]);

        // ── Kegiatan Pengajuan — Penelitian ──
        $kegPenSeleksi = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'SELEKSI_PROPOSAL', 'nama_kegiatan' => 'Seleksi Proposal Penelitian',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);

        // ── Kegiatan Pengajuan — PkM ──
        $kegPkmSeleksi = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'SELEKSI_PROPOSAL', 'nama_kegiatan' => 'Seleksi Proposal PkM',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);

        // ── Kegiatan Pengajuan — Laporan (Penelitian) ──
        $kegPenGanProses = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'PROSES_PENELITIAN_GANJIL', 'nama_kegiatan' => 'Proses Penelitian Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);

        // ── Kegiatan Pengajuan — Laporan (PkM) ──
        $kegPkmGanProses = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'PROSES_PENELITIAN_GANJIL', 'nama_kegiatan' => 'Proses PkM Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);

        // ════════════════════════════════════════════════════════════
        // BASE PROPOSAL TEMPLATE
        // ════════════════════════════════════════════════════════════
        $baseProposal = [
            'user_id' => $dosen->id,
            'jenis_penelitian' => 'Penelitian',
            'topik_penelitian' => '-',
            'bidang_ilmu' => '-',
            'fokus_sdg' => '-',
            'target_publikasi_gan' => '-',
            'target_publikasi_gen' => '-',
            'rencana_judul_publikasi_gan' => '-',
            'rencana_judul_publikasi_gen' => '-',
            'metopen_gan' => '-',
            'metopen_gen' => '-',
            'unit_analisis_gan' => '-',
            'unit_analisis_gen' => '-',
            'kontribusi_ilmu_makul' => '-',
            'kontribusi_pkm' => '-',
            'rencana_luaran' => '-',
            'institusi_mitra' => '-',
            'skema' => 'Internal',
            'sumber_skema' => '-',
            'status' => 'Draft',
            'ketua_seleksi_approved' => false,
            'staff_seleksi_approved' => false,
            'tgl_pengajuan' => '2026-07-01',
            'judul' => '',
        ];

        // ════════════════════════════════════════════════════════════
        // PROPOSAL 1: Penelitian — waiting for E2E Reviewer (0/3 reviewed)
        // ════════════════════════════════════════════════════════════
        $propReview = Proposal::create(array_merge($baseProposal, [
            'judul' => 'RV-E2E: Proposal Menunggu Review E2E',
            'topik_penelitian' => 'Kecerdasan Buatan', 'bidang_ilmu' => 'Teknik Informatika',
            'fokus_sdg' => 'SDGs 4', 'status' => 'Menunggu review',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-01',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
            'ra_biaya_penelitian_gan' => 5000000, 'ra_biaya_publikasi_gan' => 2000000, 'ra_insentif_gan' => 1500000,
            'ra_biaya_penelitian_gen' => 5000000, 'ra_biaya_publikasi_gen' => 2000000, 'ra_insentif_gen' => 1500000,
            'rencana_judul_publikasi_gan' => 'AI for Education', 'rencana_judul_publikasi_gen' => 'AI for Education',
        ]));

        foreach ([$reviewerE2E, $reviewerB, $reviewerC] as $r) {
            PenugasanReviewer::create([
                'reviewable_type' => 'App\Models\Proposal',
                'reviewable_id' => $propReview->proposal_id,
                'proposal_id' => $propReview->proposal_id,
                'tgl_penugasan' => '2026-08-01', 'user_id' => $r->id,
                'status_review' => 'Belum direview',
            ]);
        }

        // ════════════════════════════════════════════════════════════
        // PROPOSAL 2: Penelitian — 1/3 reviewed (E2E reviewer pending)
        // ════════════════════════════════════════════════════════════
        $propOneThird = Proposal::create(array_merge($baseProposal, [
            'judul' => 'RV-E2E: Proposal 1/3 Review',
            'topik_penelitian' => 'Big Data', 'bidang_ilmu' => 'Ilmu Komputer',
            'fokus_sdg' => 'SDGs 9', 'status' => 'Menunggu review',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-02',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
        ]));

        $penE2E_2 = PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal',
            'reviewable_id' => $propOneThird->proposal_id,
            'proposal_id' => $propOneThird->proposal_id,
            'tgl_penugasan' => '2026-08-02', 'user_id' => $reviewerE2E->id,
            'status_review' => 'Belum direview',
        ]);
        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal',
            'reviewable_id' => $propOneThird->proposal_id,
            'proposal_id' => $propOneThird->proposal_id,
            'tgl_penugasan' => '2026-08-02', 'user_id' => $reviewerB->id,
            'status_review' => 'Telah direview',
        ]);
        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal',
            'reviewable_id' => $propOneThird->proposal_id,
            'proposal_id' => $propOneThird->proposal_id,
            'tgl_penugasan' => '2026-08-02', 'user_id' => $reviewerC->id,
            'status_review' => 'Belum direview',
        ]);

        // ════════════════════════════════════════════════════════════
        // PROPOSAL 3: Penelitian — 2/3 reviewed (E2E reviewer is the 3rd)
        // ════════════════════════════════════════════════════════════
        $propTwoThird = Proposal::create(array_merge($baseProposal, [
            'judul' => 'RV-E2E: Proposal 2/3 Review',
            'topik_penelitian' => 'Sains Data', 'bidang_ilmu' => 'Statistika',
            'fokus_sdg' => 'SDGs 3', 'status' => 'Menunggu review',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-03',
            'rencana_luaran' => 'Prosiding', 'institusi_mitra' => '-',
        ]));

        $penE2E_3 = PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal',
            'reviewable_id' => $propTwoThird->proposal_id,
            'proposal_id' => $propTwoThird->proposal_id,
            'tgl_penugasan' => '2026-08-03', 'user_id' => $reviewerE2E->id,
            'status_review' => 'Belum direview',
        ]);
        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal',
            'reviewable_id' => $propTwoThird->proposal_id,
            'proposal_id' => $propTwoThird->proposal_id,
            'tgl_penugasan' => '2026-08-03', 'user_id' => $reviewerB->id,
            'status_review' => 'Telah direview',
        ]);
        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal',
            'reviewable_id' => $propTwoThird->proposal_id,
            'proposal_id' => $propTwoThird->proposal_id,
            'tgl_penugasan' => '2026-08-03', 'user_id' => $reviewerC->id,
            'status_review' => 'Telah direview',
        ]);

        // ════════════════════════════════════════════════════════════
        // PROPOSAL 4: Penelitian — already reviewed by E2E (for persistence test)
        // ════════════════════════════════════════════════════════════
        $propReviewed = Proposal::create(array_merge($baseProposal, [
            'judul' => 'RV-E2E: Proposal Sudah Direview',
            'topik_penelitian' => 'Energi Terbarukan', 'bidang_ilmu' => 'Teknik',
            'fokus_sdg' => 'SDGs 7', 'status' => 'Menunggu persetujuan Ketua LPPM',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-25',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        foreach ([$reviewerE2E, $reviewerB, $reviewerC] as $reviewer) {
            $pen = PenugasanReviewer::create([
                'reviewable_type' => 'App\Models\Proposal',
                'reviewable_id' => $propReviewed->proposal_id,
                'proposal_id' => $propReviewed->proposal_id,
                'tgl_penugasan' => '2026-07-28', 'user_id' => $reviewer->id,
                'status_review' => 'Telah direview',
            ]);
            Review::create([
                'penugasan_id' => $pen->penugasan_id,
                'keputusan' => 'Diterima',
                'catatan' => 'Review dari ' . $reviewer->nama,
                'tgl_review' => '2026-07-30',
                'kriteria_kesesuaian_tema' => json_encode(['nilai' => 85, 'catatan' => 'Sesuai']),
                'kriteria_penilaian' => json_encode(['nilai' => 80, 'catatan' => 'Baik']),
            ]);
        }

        // ════════════════════════════════════════════════════════════
        // PROPOSAL 5: Unassigned (Reviewer E2E NOT assigned — isolation test)
        // ════════════════════════════════════════════════════════════
        $propUnassigned = Proposal::create(array_merge($baseProposal, [
            'judul' => 'RV-E2E: Proposal Tidak Ditugaskan',
            'topik_penelitian' => 'Lingkungan', 'bidang_ilmu' => 'Biologi',
            'fokus_sdg' => 'SDGs 13', 'status' => 'Menunggu review',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-04',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
        ]));

        // Only assign B and C (not E2E)
        foreach ([$reviewerB, $reviewerC] as $r) {
            PenugasanReviewer::create([
                'reviewable_type' => 'App\Models\Proposal',
                'reviewable_id' => $propUnassigned->proposal_id,
                'proposal_id' => $propUnassigned->proposal_id,
                'tgl_penugasan' => '2026-08-04', 'user_id' => $r->id,
                'status_review' => 'Belum direview',
            ]);
        }

        // ════════════════════════════════════════════════════════════
        // PROPOSAL 6: PkM — waiting for E2E Reviewer
        // ════════════════════════════════════════════════════════════
        $propPkmReview = Proposal::create(array_merge($baseProposal, [
            'judul' => 'RV-E2E: PkM Menunggu Review',
            'jenis_penelitian' => 'PkM',
            'topik_penelitian' => 'Pendidikan', 'bidang_ilmu' => 'Pendidikan',
            'fokus_sdg' => 'SDGs 4', 'status' => 'Menunggu review',
            'kegiatan_id' => $kegPkmSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-05',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
            'rencana_judul_publikasi_gan' => 'PkM: Edukasi Digital',
            'rencana_judul_publikasi_gen' => 'PkM: Edukasi Digital',
        ]));

        foreach ([$reviewerE2E, $reviewerB, $reviewerC] as $r) {
            PenugasanReviewer::create([
                'reviewable_type' => 'App\Models\Proposal',
                'reviewable_id' => $propPkmReview->proposal_id,
                'proposal_id' => $propPkmReview->proposal_id,
                'tgl_penugasan' => '2026-08-05', 'user_id' => $r->id,
                'status_review' => 'Belum direview',
            ]);
        }

        // ════════════════════════════════════════════════════════════
        // PROPOSAL 7: PkM — already reviewed (persistence test)
        // ════════════════════════════════════════════════════════════
        $propPkmReviewed = Proposal::create(array_merge($baseProposal, [
            'judul' => 'RV-E2E: PkM Sudah Direview',
            'jenis_penelitian' => 'PkM',
            'topik_penelitian' => 'Kesehatan', 'bidang_ilmu' => 'Kedokteran',
            'fokus_sdg' => 'SDGs 3', 'status' => 'Menunggu persetujuan Ketua LPPM',
            'kegiatan_id' => $kegPkmSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-30',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
            'rencana_judul_publikasi_gan' => 'PkM: Kesehatan Masyarakat',
            'rencana_judul_publikasi_gen' => 'PkM: Kesehatan Masyarakat',
        ]));

        foreach ([$reviewerE2E, $reviewerB, $reviewerC] as $reviewer) {
            $pen = PenugasanReviewer::create([
                'reviewable_type' => 'App\Models\Proposal',
                'reviewable_id' => $propPkmReviewed->proposal_id,
                'proposal_id' => $propPkmReviewed->proposal_id,
                'tgl_penugasan' => '2026-08-01', 'user_id' => $reviewer->id,
                'status_review' => 'Telah direview',
            ]);
            Review::create([
                'penugasan_id' => $pen->penugasan_id,
                'keputusan' => 'Diterima dengan perbaikan',
                'catatan' => 'PkM review dari ' . $reviewer->nama,
                'tgl_review' => '2026-08-05',
                'kriteria_kesesuaian_tema' => json_encode(['nilai' => 75, 'catatan' => 'Cukup sesuai']),
                'kriteria_penilaian' => json_encode(['nilai' => 70, 'catatan' => 'Perlu perbaikan']),
            ]);
        }

        // ════════════════════════════════════════════════════════════
        // LAPORAN 1: Penelitian — waiting for review (3 reviewers, E2E pending)
        // ════════════════════════════════════════════════════════════
        $lapPenReview = Laporan::create([
            'proposal_id' => $propReview->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'Penelitian', 'judul_penelitian' => 'RV-E2E: Laporan Penelitian Review',
            'status' => 'Menunggu review', 'tgl_mulai' => '2026-08-01',
            'kegiatan_id' => $kegPenGanProses->kegiatan_id,
        ]);

        $lapPenE2E = PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Laporan',
            'reviewable_id' => $lapPenReview->laporan_id,
            'proposal_id' => $propReview->proposal_id,
            'tgl_penugasan' => '2026-08-06', 'user_id' => $reviewerE2E->id,
            'status_review' => 'Belum direview',
        ]);
        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Laporan',
            'reviewable_id' => $lapPenReview->laporan_id,
            'proposal_id' => $propReview->proposal_id,
            'tgl_penugasan' => '2026-08-06', 'user_id' => $reviewerB->id,
            'status_review' => 'Telah direview',
        ]);
        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Laporan',
            'reviewable_id' => $lapPenReview->laporan_id,
            'proposal_id' => $propReview->proposal_id,
            'tgl_penugasan' => '2026-08-06', 'user_id' => $reviewerC->id,
            'status_review' => 'Belum direview',
        ]);

        // ════════════════════════════════════════════════════════════
        // LAPORAN 2: Penelitian — already reviewed (persistence test)
        // ════════════════════════════════════════════════════════════
        $lapPenReviewed = Laporan::create([
            'proposal_id' => $propReviewed->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'Penelitian', 'judul_penelitian' => 'RV-E2E: Laporan Penelitian Sudah Direview',
            'status' => 'Menunggu keputusan Ketua', 'tgl_mulai' => '2026-07-20',
            'kegiatan_id' => $kegPenGanProses->kegiatan_id,
        ]);

        foreach ([$reviewerE2E, $reviewerB, $reviewerC] as $reviewer) {
            $pen = PenugasanReviewer::create([
                'reviewable_type' => 'App\Models\Laporan',
                'reviewable_id' => $lapPenReviewed->laporan_id,
                'proposal_id' => $propReviewed->proposal_id,
                'tgl_penugasan' => '2026-07-25', 'user_id' => $reviewer->id,
                'status_review' => 'Telah direview',
            ]);
            Review::create([
                'penugasan_id' => $pen->penugasan_id,
                'keputusan' => 'Diterima',
                'catatan' => 'Laporan review dari ' . $reviewer->nama,
                'tgl_review' => '2026-07-28',
                'kriteria_kesesuaian_tema' => json_encode(['nilai' => 90, 'catatan' => 'Sangat sesuai']),
                'kriteria_penilaian' => json_encode(['nilai' => 85, 'catatan' => 'Sangat baik']),
            ]);
        }

        // ════════════════════════════════════════════════════════════
        // LAPORAN 3: PkM — waiting for review (E2E pending)
        // ════════════════════════════════════════════════════════════
        $lapPkmReview = Laporan::create([
            'proposal_id' => $propPkmReview->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'PkM', 'judul_penelitian' => 'RV-E2E: Laporan PkM Review',
            'status' => 'Menunggu review', 'tgl_mulai' => '2026-08-05',
            'kegiatan_id' => $kegPkmGanProses->kegiatan_id,
        ]);

        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Laporan',
            'reviewable_id' => $lapPkmReview->laporan_id,
            'proposal_id' => $propPkmReview->proposal_id,
            'tgl_penugasan' => '2026-08-07', 'user_id' => $reviewerE2E->id,
            'status_review' => 'Belum direview',
        ]);
        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Laporan',
            'reviewable_id' => $lapPkmReview->laporan_id,
            'proposal_id' => $propPkmReview->proposal_id,
            'tgl_penugasan' => '2026-08-07', 'user_id' => $reviewerB->id,
            'status_review' => 'Belum direview',
        ]);
        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Laporan',
            'reviewable_id' => $lapPkmReview->laporan_id,
            'proposal_id' => $propPkmReview->proposal_id,
            'tgl_penugasan' => '2026-08-07', 'user_id' => $reviewerC->id,
            'status_review' => 'Belum direview',
        ]);

        // ════════════════════════════════════════════════════════════
        // NOTIFICATIONS — for Reviewer E2E
        // ════════════════════════════════════════════════════════════
        Notification::create([
            'user_id' => $reviewerE2E->id,
            'type' => 'reviewer.assigned',
            'title' => 'Penugasan Review Baru',
            'message' => 'Anda ditugaskan untuk mereview proposal "RV-E2E: Proposal Menunggu Review E2E".',
            'data' => json_encode(['proposal_id' => $propReview->proposal_id]),
            'action_url' => '/dashboard?module=reviewproposal',
            'key' => 'e2e-notif-reviewer-assign-' . $propReview->proposal_id,
            'read_at' => null,
        ]);

        Notification::create([
            'user_id' => $reviewerE2E->id,
            'type' => 'reviewer.assigned',
            'title' => 'Penugasan Review Laporan',
            'message' => 'Anda ditugaskan untuk mereview laporan "RV-E2E: Laporan Penelitian Review".',
            'data' => json_encode(['laporan_id' => $lapPenReview->laporan_id]),
            'action_url' => '/dashboard?module=reviewproposal',
            'key' => 'e2e-notif-reviewer-laporan-' . $lapPenReview->laporan_id,
            'read_at' => null,
        ]);

        $this->command->info('E2E Reviewer seeder completed.');
        $this->command->info('Reviewer: reviewer.e2e@itbss.ac.id / password');
        $this->command->info('Proposals: ' . Proposal::count());
        $this->command->info('Laporans: ' . Laporan::count());
        $this->command->info('PenugasanReviewer: ' . PenugasanReviewer::count());
        $this->command->info('Reviews: ' . Review::count());
    }
}
