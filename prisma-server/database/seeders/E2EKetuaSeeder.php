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
use App\Models\AuthorizationRequest;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class E2EKetuaSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // ── Prodi ──
        $prodiTI = Prodi::create(['nama_prodi' => 'Sistem Teknologi dan Informasi']);
        $prodiBD = Prodi::create(['nama_prodi' => 'Bisnis Digital']);

        // ── Users ──
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

        $reviewerA = User::create([
            'nama' => 'Reviewer A', 'email' => 'reviewer.a@itbss.ac.id',
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
            'kriteria_penilaian' => json_encode([
                ['kriteria' => 'Kesesuaian Tema', 'bobot' => 30],
                ['kriteria' => 'Metodologi', 'bobot' => 30],
                ['kriteria' => 'Timeline', 'bobot' => 20],
                ['kriteria' => 'Anggaran', 'bobot' => 20],
            ]),
            'list_kesesuaian_tema' => json_encode(['SDGs', 'Teknologi', 'Kesehatan']),
            'ignore_kegiatan_dates' => true,
        ]);

        // ── Skema ──
        $skema = Skema::create([
            'nama_skema' => 'Penelitian Dosen Tetap 2026',
            'tahun_ajaran' => '2025/2026',
            'status' => 'Aktif',
        ]);

        // ════════════════════════════════════════════════════════════
        // KEGIATAN PENGAJUAN — Proposal Stages (Penelitian)
        // ════════════════════════════════════════════════════════════
        $kegPenPenerimaan = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'PENERIMAAN_PROPOSAL', 'nama_kegiatan' => 'Penerimaan Proposal Penelitian',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPenSeleksi = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'SELEKSI_PROPOSAL', 'nama_kegiatan' => 'Seleksi Proposal Penelitian',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPenSK = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'nama_kegiatan' => 'Pengumuman Surat Tugas Penelitian',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);

        // ════════════════════════════════════════════════════════════
        // KEGIATAN PENGAJUAN — Proposal Stages (PkM)
        // ════════════════════════════════════════════════════════════
        $kegPkmSeleksi = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'SELEKSI_PROPOSAL', 'nama_kegiatan' => 'Seleksi Proposal PkM',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);

        // ════════════════════════════════════════════════════════════
        // KEGIATAN PENGAJUAN — Laporan Stages (Penelitian, Ganjil)
        // ════════════════════════════════════════════════════════════
        $kegPenGanProses = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'PROSES_PENELITIAN_GANJIL', 'nama_kegiatan' => 'Proses Penelitian Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPenGanPub = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'PUBLIKASI_GANJIL', 'nama_kegiatan' => 'Publikasi Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPenGanDis = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'DISEMINASI_GANJIL', 'nama_kegiatan' => 'Diseminasi Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPenGanClaim = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'CLAIM_DANA_GANJIL', 'nama_kegiatan' => 'Claim Dana Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);

        // ════════════════════════════════════════════════════════════
        // KEGIATAN PENGAJUAN — Laporan Stages (PkM, Ganjil)
        // ════════════════════════════════════════════════════════════
        $kegPkmGanProses = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'PROSES_PENELITIAN_GANJIL', 'nama_kegiatan' => 'Proses PkM Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPkmGanPub = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'PUBLIKASI_GANJIL', 'nama_kegiatan' => 'Publikasi PkM Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPkmGanDis = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'DISEMINASI_GANJIL', 'nama_kegiatan' => 'Diseminasi PkM Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPkmGanClaim = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'CLAIM_DANA_GANJIL', 'nama_kegiatan' => 'Claim Dana PkM Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPkmGanReturn = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'PENGEMBALIAN_DANA_GANJIL', 'nama_kegiatan' => 'Pengembalian Dana PkM Ganjil',
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
        // PROPOSALS — Ketua Normal Seleksi Checkpoint
        // ════════════════════════════════════════════════════════════
        $propKetuaSeleksi = Proposal::create(array_merge($baseProposal, [
            'judul' => 'KT-E2E: Proposal Menunggu Keputusan Ketua',
            'topik_penelitian' => 'AI', 'bidang_ilmu' => 'Teknik Informatika',
            'fokus_sdg' => 'SDGs 4', 'status' => 'Menunggu review dari Ketua LPPM',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => false, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-01',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        // ════════════════════════════════════════════════════════════
        // PROPOSALS — Post-review (3/3 complete, awaiting Ketua decision)
        // ════════════════════════════════════════════════════════════
        $propPostReview = Proposal::create(array_merge($baseProposal, [
            'judul' => 'KT-E2E: Proposal Post-Review 3/3',
            'topik_penelitian' => 'Energi', 'bidang_ilmu' => 'Teknik',
            'fokus_sdg' => 'SDGs 7', 'status' => 'Menunggu persetujuan Ketua LPPM',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-15',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
        ]));

        // Assign 3 reviewers — all completed
        foreach ([$reviewerA, $reviewerB, $reviewerC] as $reviewer) {
            $penugasan = PenugasanReviewer::create([
                'reviewable_type' => 'App\Models\Proposal',
                'reviewable_id' => $propPostReview->proposal_id,
                'proposal_id' => $propPostReview->proposal_id,
                'tgl_penugasan' => '2026-07-20',
                'user_id' => $reviewer->id,
                'status_review' => 'Telah direview',
            ]);

            Review::create([
                'penugasan_id' => $penugasan->penugasan_id,
                'keputusan' => 'Diterima',
                'catatan' => 'Review dari ' . $reviewer->nama,
                'tgl_review' => '2026-07-25',
                'kriteria_kesesuaian_tema' => json_encode(['nilai' => 85, 'catatan' => 'Sesuai']),
                'kriteria_penilaian' => json_encode(['nilai' => 80, 'catatan' => 'Baik']),
            ]);
        }

        // ════════════════════════════════════════════════════════════
        // PROPOSALS — Partial review (2/3 complete — NOT ready for Ketua)
        // ════════════════════════════════════════════════════════════
        $propPartialReview = Proposal::create(array_merge($baseProposal, [
            'judul' => 'KT-E2E: Proposal Partial Review 2/3',
            'topik_penelitian' => 'Kesehatan', 'bidang_ilmu' => 'Kedokteran',
            'fokus_sdg' => 'SDGs 3', 'status' => 'Menunggu review',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-25',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal',
            'reviewable_id' => $propPartialReview->proposal_id,
            'proposal_id' => $propPartialReview->proposal_id,
            'tgl_penugasan' => '2026-07-30',
            'user_id' => $reviewerA->id,
            'status_review' => 'Telah direview',
        ]);
        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal',
            'reviewable_id' => $propPartialReview->proposal_id,
            'proposal_id' => $propPartialReview->proposal_id,
            'tgl_penugasan' => '2026-07-30',
            'user_id' => $reviewerB->id,
            'status_review' => 'Belum direview',
        ]);
        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal',
            'reviewable_id' => $propPartialReview->proposal_id,
            'proposal_id' => $propPartialReview->proposal_id,
            'tgl_penugasan' => '2026-07-30',
            'user_id' => $reviewerC->id,
            'status_review' => 'Telah direview',
        ]);

        // ════════════════════════════════════════════════════════════
        // PROPOSALS — For Authorization Tests (Reject & Return pending)
        // ════════════════════════════════════════════════════════════
        $propAuthReject = Proposal::create(array_merge($baseProposal, [
            'judul' => 'KT-E2E: Proposal Penolakan Pending',
            'topik_penelitian' => 'Lingkungan', 'bidang_ilmu' => 'Biologi',
            'fokus_sdg' => 'SDGs 13', 'status' => 'Menunggu review dari Ketua LPPM',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => false, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-05',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
        ]));

        $propAuthReturn = Proposal::create(array_merge($baseProposal, [
            'judul' => 'KT-E2E: Proposal Pengembalian Pending',
            'topik_penelitian' => 'Sosial', 'bidang_ilmu' => 'Sosiologi',
            'fokus_sdg' => 'SDGs 11', 'status' => 'Menunggu review dari Ketua LPPM',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => false, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-06',
            'rencana_luaran' => 'Prosiding', 'institusi_mitra' => '-',
        ]));

        // ════════════════════════════════════════════════════════════
        // PROPOSALS — Accepted & Rejected (for status visibility tests)
        // ════════════════════════════════════════════════════════════
        $propAccepted = Proposal::create(array_merge($baseProposal, [
            'judul' => 'KT-E2E: Proposal Diterima Proses',
            'topik_penelitian' => 'Pendidikan', 'bidang_ilmu' => 'Pendidikan',
            'fokus_sdg' => 'SDGs 4', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPenSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-10',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        $propAcceptedPub = Proposal::create(array_merge($baseProposal, [
            'judul' => 'KT-E2E: Proposal Diterima Publikasi',
            'topik_penelitian' => 'Pendidikan', 'bidang_ilmu' => 'Pendidikan',
            'fokus_sdg' => 'SDGs 4', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPenSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-10',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        $propAcceptedClaim = Proposal::create(array_merge($baseProposal, [
            'judul' => 'KT-E2E: Proposal Diterima Claim',
            'topik_penelitian' => 'Pendidikan', 'bidang_ilmu' => 'Pendidikan',
            'fokus_sdg' => 'SDGs 4', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPenSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-10',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        $propRejected = Proposal::create(array_merge($baseProposal, [
            'judul' => 'KT-E2E: Proposal Ditolak',
            'topik_penelitian' => 'Seni', 'bidang_ilmu' => 'Seni Rupa',
            'fokus_sdg' => 'SDGs 11', 'status' => 'Ditolak',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-12',
            'rencana_luaran' => 'Pameran', 'institusi_mitra' => '-',
        ]));

        // ════════════════════════════════════════════════════════════
        // LAPORANS — Penelitian (one proposal per laporan)
        // ════════════════════════════════════════════════════════════
        $lapPenProses = Laporan::create([
            'proposal_id' => $propAccepted->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'Penelitian', 'judul_penelitian' => 'KT-E2E: Laporan Proses Penelitian',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-07-01',
            'kegiatan_id' => $kegPenGanProses->kegiatan_id,
        ]);

        $lapPenPub = Laporan::create([
            'proposal_id' => $propAcceptedPub->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'Penelitian', 'judul_penelitian' => 'KT-E2E: Laporan Publikasi Penelitian',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-07-01',
            'kegiatan_id' => $kegPenGanPub->kegiatan_id,
        ]);

        $lapPenClaim = Laporan::create([
            'proposal_id' => $propAcceptedClaim->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'Penelitian', 'judul_penelitian' => 'KT-E2E: Laporan Claim Dana Penelitian',
            'status' => 'Menunggu konfirmasi penerimaan dana', 'tgl_mulai' => '2026-07-01',
            'kegiatan_id' => $kegPenGanClaim->kegiatan_id,
        ]);

        // ════════════════════════════════════════════════════════════
        // LAPORANS — PkM Ganjil (for monitoring)
        // ════════════════════════════════════════════════════════════
        $propPkmAccepted = Proposal::create(array_merge($baseProposal, [
            'judul' => 'KT-E2E: PkM Diterima Proses',
            'topik_penelitian' => 'Lingkungan', 'bidang_ilmu' => 'Lingkungan',
            'fokus_sdg' => 'SDGs 11', 'status' => 'Proposal Diterima',
            'jenis_penelitian' => 'PkM',
            'kegiatan_id' => $kegPkmSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-20',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
        ]));

        $propPkmAcceptedDis = Proposal::create(array_merge($baseProposal, [
            'judul' => 'KT-E2E: PkM Diterima Diseminasi',
            'topik_penelitian' => 'Lingkungan', 'bidang_ilmu' => 'Lingkungan',
            'fokus_sdg' => 'SDGs 11', 'status' => 'Proposal Diterima',
            'jenis_penelitian' => 'PkM',
            'kegiatan_id' => $kegPkmSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-20',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
        ]));

        $propPkmAcceptedClaim = Proposal::create(array_merge($baseProposal, [
            'judul' => 'KT-E2E: PkM Diterima Claim',
            'topik_penelitian' => 'Lingkungan', 'bidang_ilmu' => 'Lingkungan',
            'fokus_sdg' => 'SDGs 11', 'status' => 'Proposal Diterima',
            'jenis_penelitian' => 'PkM',
            'kegiatan_id' => $kegPkmSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-20',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
        ]));

        $propPkmAcceptedReturn = Proposal::create(array_merge($baseProposal, [
            'judul' => 'KT-E2E: PkM Diterima Return',
            'topik_penelitian' => 'Lingkungan', 'bidang_ilmu' => 'Lingkungan',
            'fokus_sdg' => 'SDGs 11', 'status' => 'Proposal Diterima',
            'jenis_penelitian' => 'PkM',
            'kegiatan_id' => $kegPkmSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-20',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
        ]));

        $lapPkmProses = Laporan::create([
            'proposal_id' => $propPkmAccepted->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'PkM', 'judul_penelitian' => 'KT-E2E: Laporan Proses PkM',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-07-01',
            'kegiatan_id' => $kegPkmGanProses->kegiatan_id,
        ]);

        $lapPkmDis = Laporan::create([
            'proposal_id' => $propPkmAcceptedDis->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'PkM', 'judul_penelitian' => 'KT-E2E: Laporan Diseminasi PkM',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-07-01',
            'kegiatan_id' => $kegPkmGanDis->kegiatan_id,
        ]);

        $lapPkmClaim = Laporan::create([
            'proposal_id' => $propPkmAcceptedClaim->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'PkM', 'judul_penelitian' => 'KT-E2E: Laporan Claim Dana PkM',
            'status' => 'Menunggu konfirmasi penerimaan dana', 'tgl_mulai' => '2026-07-01',
            'kegiatan_id' => $kegPkmGanClaim->kegiatan_id,
        ]);

        $lapPkmReturn = Laporan::create([
            'proposal_id' => $propPkmAcceptedReturn->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'PkM', 'judul_penelitian' => 'KT-E2E: Laporan Pengembalian PkM',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-08-01',
            'pengembalian_dana_status' => 'Menunggu Pengembalian Dana',
            'kegiatan_id' => $kegPkmGanReturn->kegiatan_id,
        ]);

        // ════════════════════════════════════════════════════════════
        // AUTHORIZATION REQUESTS — For Ketua approval/denial tests
        // ════════════════════════════════════════════════════════════
        AuthorizationRequest::create([
            'requestable_type' => 'App\Models\Proposal',
            'requestable_id' => $propAuthReject->proposal_id,
            'requested_by' => $staff->id,
            'action' => 'reject_proposal',
            'source_stage' => 'SELEKSI_PROPOSAL',
            'target_stage' => null,
            'reason' => 'Proposal tidak sesuai dengan skema penelitian.',
            'status' => 'Menunggu Persetujuan',
        ]);

        AuthorizationRequest::create([
            'requestable_type' => 'App\Models\Proposal',
            'requestable_id' => $propAuthReturn->proposal_id,
            'requested_by' => $staff->id,
            'action' => 'return_proposal_for_revision',
            'source_stage' => 'SELEKSI_PROPOSAL',
            'target_stage' => 'PENERIMAAN_PROPOSAL',
            'reason' => 'Metodologi perlu diperbaiki sebelum review.',
            'status' => 'Menunggu Persetujuan',
        ]);

        AuthorizationRequest::create([
            'requestable_type' => 'App\Models\Laporan',
            'requestable_id' => $lapPenPub->laporan_id,
            'requested_by' => $staff->id,
            'action' => 'return_laporan_for_revision',
            'source_stage' => 'PUBLIKASI_GANJIL',
            'target_stage' => 'PROSES_PENELITIAN_GANJIL',
            'reason' => 'Data publikasi belum lengkap.',
            'status' => 'Menunggu Persetujuan',
        ]);

        AuthorizationRequest::create([
            'requestable_type' => 'App\Models\Laporan',
            'requestable_id' => $lapPenClaim->laporan_id,
            'requested_by' => $staff->id,
            'action' => 'return_laporan_for_revision',
            'source_stage' => 'CLAIM_DANA_GANJIL',
            'target_stage' => 'DISEMINASI_GANJIL',
            'reason' => 'Bukti claim tidak valid.',
            'status' => 'Menunggu Persetujuan',
        ]);

        // ════════════════════════════════════════════════════════════
        // NOTIFICATIONS — For Ketua
        // ════════════════════════════════════════════════════════════
        Notification::create([
            'user_id' => $ketua->id,
            'type' => 'authorization.request.created',
            'title' => 'Permintaan Otorisasi Baru',
            'message' => 'Staff LPPM meminta persetujuan penolakan proposal.',
            'data' => json_encode(['proposal_id' => $propAuthReject->proposal_id]),
            'action_url' => '/dashboard?module=staffmonitoringprogress&skema_id=' . $skema->skema_id . '&view=proposal&proposal_id=' . $propAuthReject->proposal_id . '&tab=SELEKSI_PROPOSAL&jenis=Penelitian',
            'key' => 'e2e-notif-ketua-auth-reject-' . $propAuthReject->proposal_id,
            'read_at' => null,
        ]);

        Notification::create([
            'user_id' => $ketua->id,
            'type' => 'proposal.reviews.complete',
            'title' => 'Semua review selesai',
            'message' => 'Semua reviewer telah menyelesaikan review proposal.',
            'data' => json_encode(['proposal_id' => $propPostReview->proposal_id]),
            'action_url' => '/dashboard?module=staffmonitoringprogress&skema_id=' . $skema->skema_id . '&view=proposal&proposal_id=' . $propPostReview->proposal_id . '&tab=SELEKSI_PROPOSAL&jenis=Penelitian',
            'key' => 'e2e-notif-ketua-reviews-complete-' . $propPostReview->proposal_id,
            'read_at' => null,
        ]);

        // ════════════════════════════════════════════════════════════
        // PROPOSAL — Revisi status (for DS-REV-MUT-002)
        // ════════════════════════════════════════════════════════════
        Proposal::create(array_merge($baseProposal, [
            'judul' => 'KT-E2E: Proposal Revisi untuk Dosen',
            'topik_penelitian' => 'Teknologi', 'bidang_ilmu' => 'TI',
            'fokus_sdg' => 'SDGs 9', 'status' => 'Revisi',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-10',
            'catatan' => 'Perlu perbaikan metodologi penelitian.',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
        ]));

        // ════════════════════════════════════════════════════════════
        // LAPORAN — Diseminasi stage awaiting Ketua approval (for KT-DIS-APPROVE-MUT-001)
        // ════════════════════════════════════════════════════════════
        $propDisApproved = Proposal::create(array_merge($baseProposal, [
            'judul' => 'KT-E2E: Diseminasi Menunggu Ketua',
            'topik_penelitian' => 'Pendidikan', 'bidang_ilmu' => 'Pendidikan',
            'fokus_sdg' => 'SDGs 4', 'status' => 'Proposal Diterima',
            'jenis_penelitian' => 'PkM',
            'kegiatan_id' => $kegPkmSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-15',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
        ]));

        Laporan::create([
            'proposal_id' => $propDisApproved->proposal_id,
            'semester' => 'Ganjil',
            'jenis_penelitian' => 'PkM',
            'judul_penelitian' => 'KT-E2E: Laporan Diseminasi Menunggu Ketua',
            'status' => 'Dalam pengerjaan',
            'ketua_diseminasi_approved' => false,
            'staff_diseminasi_approved' => true,
            'tgl_mulai' => '2026-07-01',
            'kegiatan_id' => $kegPkmGanDis->kegiatan_id,
        ]);

        $this->command->info('E2E Ketua seeder completed.');
        $this->command->info('Ketua: ketua.lppm@itbss.ac.id / password');
        $this->command->info('Staff: staff.lppm1@itbss.ac.id / password');
        $this->command->info('Dosen: dosen.e2e@itbss.ac.id / password');
        $this->command->info('Proposals: ' . Proposal::count());
        $this->command->info('Laporans: ' . Laporan::count());
        $this->command->info('AuthorizationRequests: ' . AuthorizationRequest::count());
    }
}
