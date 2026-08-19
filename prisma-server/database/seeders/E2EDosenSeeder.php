<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Prodi;
use App\Models\Skema;
use App\Models\KegiatanPengajuan;
use App\Models\Proposal;
use App\Models\Laporan;
use App\Models\PenugasanReviewer;
use App\Models\Settings;
use App\Models\Notification;
use App\Models\LogbookPengerjaan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class E2EDosenSeeder extends Seeder
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
        $kegPkmPenerimaan = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'PENERIMAAN_PROPOSAL', 'nama_kegiatan' => 'Penerimaan Proposal PkM',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPkmSeleksi = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'SELEKSI_PROPOSAL', 'nama_kegiatan' => 'Seleksi Proposal PkM',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPkmSK = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'nama_kegiatan' => 'Pengumuman Surat Tugas PkM',
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
        $kegPenGanLuaran = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'LUARAN_PENELITIAN', 'nama_kegiatan' => 'Luaran Penelitian',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);

        // ════════════════════════════════════════════════════════════
        // KEGIATAN PENGAJUAN — Laporan Stages (Penelitian, Genap)
        // ════════════════════════════════════════════════════════════
        $kegPenGenProses = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'PROSES_PENELITIAN_GENAP', 'nama_kegiatan' => 'Proses Penelitian Genap',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPenGenPub = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'PUBLIKASI_GENAP', 'nama_kegiatan' => 'Publikasi Genap',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPenGenDis = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'DISEMINASI_GENAP', 'nama_kegiatan' => 'Diseminasi Genap',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPenGenClaim = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'Penelitian',
            'kode_kegiatan' => 'CLAIM_DANA_GENAP', 'nama_kegiatan' => 'Claim Dana Genap',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);

        // ════════════════════════════════════════════════════════════
        // KEGIATAN PENGAJUAN — Laporan Stages (PkM, Ganjil)
        // ════════════════════════════════════════════════════════════
        $kegPkmGanClaim = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'CLAIM_DANA_GANJIL', 'nama_kegiatan' => 'Claim Dana PkM Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPkmGanProses = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'PROSES_PKM_GANJIL', 'nama_kegiatan' => 'Proses PkM Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPkmGanPub = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'PUBLIKASI_GANJIL', 'nama_kegiatan' => 'Publikasi PkM Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPkmGanReturn = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'PENGEMBALIAN_DANA_GANJIL', 'nama_kegiatan' => 'Pengembalian Dana PkM Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);
        $kegPkmGanDis = KegiatanPengajuan::create([
            'skema_id' => $skema->skema_id, 'jenis_penelitian' => 'PkM',
            'kode_kegiatan' => 'DISEMINASI_GANJIL', 'nama_kegiatan' => 'Diseminasi PkM Ganjil',
            'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka', 'manual_status_override' => true,
        ]);

        // ════════════════════════════════════════════════════════════
        // PROPOSALS — Penelitian (owned by Dosen E2E)
        // ════════════════════════════════════════════════════════════
        $baseProposal = [
            'jenis_penelitian' => 'Penelitian', 'jenis_penelitian_gan' => 'Penelitian',
            'jenis_penelitian_gen' => 'Penelitian', 'tahap_penelitian' => 'Proposal',
            'skema' => 'Internal', 'sumber_skema' => 'Dana Internal',
            'user_id' => $dosen->id,
            'target_publikasi_gan' => 'SCOPUS Q3', 'target_publikasi_gen' => 'SCOPUS Q3',
            'rencana_judul_publikasi_gan' => 'Default Title', 'rencana_judul_publikasi_gen' => 'Default Title',
            'metopen_gan' => 'Mixed Methods', 'metopen_gen' => 'Mixed Methods',
            'unit_analisis_gan' => 'Sample', 'unit_analisis_gen' => 'Sample',
            'kontribusi_ilmu_makul' => 'Kontribusi Ilmu', 'kontribusi_pkm' => 'Kontribusi PKM',
        ];

        $basePkmProposal = [
            'jenis_penelitian' => 'PkM', 'jenis_penelitian_gan' => 'PkM',
            'jenis_penelitian_gen' => 'PkM', 'tahap_penelitian' => 'Proposal',
            'skema' => 'Internal', 'sumber_skema' => 'Dana Internal',
            'user_id' => $dosen->id,
            'target_publikasi_gan' => 'Jurnal Nasional', 'target_publikasi_gen' => 'Jurnal Nasional',
            'rencana_judul_publikasi_gan' => 'PkM Title', 'rencana_judul_publikasi_gen' => 'PkM Title',
            'metopen_gan' => 'Mixed Methods', 'metopen_gen' => 'Mixed Methods',
            'unit_analisis_gan' => 'UMKM', 'unit_analisis_gen' => 'UMKM',
            'kontribusi_ilmu_makul' => 'Kontribusi Ilmu', 'kontribusi_pkm' => 'Kontribusi PKM',
        ];

        $propDraft = Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-PROP-DRAFT: Analisis Dampak AI',
            'topik_penelitian' => 'Teknologi Pendidikan', 'bidang_ilmu' => 'TI',
            'fokus_sdg' => 'SDGs 4', 'status' => 'Draft',
            'kegiatan_id' => $kegPenPenerimaan->kegiatan_id,
            'tgl_pengajuan' => '2026-08-01',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        $propUpload = Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-PROP-UPLOAD: ML untuk Kesehatan',
            'topik_penelitian' => 'Kesehatan', 'bidang_ilmu' => 'Kedokteran',
            'fokus_sdg' => 'SDGs 3', 'status' => 'Menunggu proposal untuk diupload',
            'kegiatan_id' => $kegPenPenerimaan->kegiatan_id,
            'tgl_pengajuan' => '2026-08-02',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
        ]));

        $propKetua = Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-PROP-KETUA: Cloud Computing Edge',
            'topik_penelitian' => 'Cloud Computing', 'bidang_ilmu' => 'TI',
            'fokus_sdg' => 'SDGs 9', 'status' => 'Menunggu review dari Ketua LPPM',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'tgl_pengajuan' => '2026-08-03',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        $propStaff = Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-PROP-STAFF: IoT Smart Agriculture',
            'topik_penelitian' => 'Pertanian', 'bidang_ilmu' => 'Pertanian',
            'fokus_sdg' => 'SDGs 2', 'status' => 'Menunggu review Staff LPPM',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'tgl_pengajuan' => '2026-08-04',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
        ]));

        $propAssign = Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-PROP-ASSIGN: Blockchain untuk Governance',
            'topik_penelitian' => 'Blockchain', 'bidang_ilmu' => 'TI',
            'fokus_sdg' => 'SDGs 16', 'status' => 'Menunggu penugasan reviewer',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-05',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        $propReview = Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-PROP-REVIEW: NLP untuk Education',
            'topik_penelitian' => 'NLP', 'bidang_ilmu' => 'TI',
            'fokus_sdg' => 'SDGs 4', 'status' => 'Menunggu review',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-06',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal', 'reviewable_id' => $propReview->proposal_id,
            'proposal_id' => $propReview->proposal_id, 'user_id' => $reviewer->id,
            'tgl_penugasan' => '2026-08-07', 'status_review' => 'Belum direview',
        ]);

        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal', 'reviewable_id' => $propReview->proposal_id,
            'proposal_id' => $propReview->proposal_id, 'user_id' => $reviewer2->id,
            'tgl_penugasan' => '2026-08-07', 'status_review' => 'Belum direview',
        ]);

        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal', 'reviewable_id' => $propReview->proposal_id,
            'proposal_id' => $propReview->proposal_id, 'user_id' => $reviewer3->id,
            'tgl_penugasan' => '2026-08-07', 'status_review' => 'Belum direview',
        ]);

        // ════════════════════════════════════════════════════════════
        // PROPOSALS — Accepted Penelitian (one per laporan state needed)
        // ════════════════════════════════════════════════════════════
        $propAccepted = Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-PROP-ACCEPTED: Green Energy Solutions',
            'topik_penelitian' => 'Energi', 'bidang_ilmu' => 'Teknik',
            'fokus_sdg' => 'SDGs 7', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPenSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-01',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => 'Universitas Test',
        ]));

        // Separate accepted proposals for each laporan state (unique constraint: proposal_id + semester)
        $propAcceptedGanBelum = Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-ACCEPTED-GAN-BELUM: Solar Panel Optimization',
            'topik_penelitian' => 'Energi Surya', 'bidang_ilmu' => 'Teknik',
            'fokus_sdg' => 'SDGs 7', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPenSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-01',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        $propAcceptedGanProses = Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-ACCEPTED-GAN-PROSES: Wind Energy Research',
            'topik_penelitian' => 'Energi Angin', 'bidang_ilmu' => 'Teknik',
            'fokus_sdg' => 'SDGs 7', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPenSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-01',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        $propAcceptedGanPub = Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-ACCEPTED-GAN-PUB: Hydro Power Study',
            'topik_penelitian' => 'Energi Air', 'bidang_ilmu' => 'Teknik',
            'fokus_sdg' => 'SDGs 7', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPenSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-01',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        $propAcceptedGanDis = Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-ACCEPTED-GAN-DIS: Geothermal Energy',
            'topik_penelitian' => 'Energi Geothermal', 'bidang_ilmu' => 'Teknik',
            'fokus_sdg' => 'SDGs 7', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPenSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-01',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        $propAcceptedGanClaim = Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-ACCEPTED-GAN-CLAIM: Biomass Energy',
            'topik_penelitian' => 'Energi Biomassa', 'bidang_ilmu' => 'Teknik',
            'fokus_sdg' => 'SDGs 7', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPenSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-01',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        $propAcceptedGanSelesai = Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-ACCEPTED-GAN-SELESAI: Tidal Energy',
            'topik_penelitian' => 'Energi Pasang', 'bidang_ilmu' => 'Teknik',
            'fokus_sdg' => 'SDGs 7', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPenSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-01',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        // Separate accepted proposals for Genap laporans
        $propAcceptedGenBelum = Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-ACCEPTED-GEN-BELUM: Hydrogen Fuel Cell',
            'topik_penelitian' => 'Hidrogen', 'bidang_ilmu' => 'Teknik',
            'fokus_sdg' => 'SDGs 7', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPenSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-01',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        $propAcceptedGenProses = Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-ACCEPTED-GEN-PROSES: Nuclear Fusion Research',
            'topik_penelitian' => 'Fusi Nuklir', 'bidang_ilmu' => 'Fisika',
            'fokus_sdg' => 'SDGs 7', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPenSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-01',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        // Separate accepted proposals for PkM laporans
        $propPkmAcceptedClaim = Proposal::create(array_merge($basePkmProposal, [
            'judul' => 'E2E-PKM-ACCEPTED-CLAIM: Pelatihan UMKM Digital',
            'topik_penelitian' => 'Digitalisasi UMKM', 'bidang_ilmu' => 'Bisnis',
            'fokus_sdg' => 'SDGs 8', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPkmSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-20',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => 'UMKM Mitra',
        ]));

        $propPkmAcceptedProses = Proposal::create(array_merge($basePkmProposal, [
            'judul' => 'E2E-PKM-ACCEPTED-PROSES: Edukasi Literasi',
            'topik_penelitian' => 'Literasi', 'bidang_ilmu' => 'Pendidikan',
            'fokus_sdg' => 'SDGs 4', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPkmSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-20',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => 'Sekolah',
        ]));

        $propPkmAcceptedPub = Proposal::create(array_merge($basePkmProposal, [
            'judul' => 'E2E-PKM-ACCEPTED-PUB: Pengolahan Sampah',
            'topik_penelitian' => 'Lingkungan', 'bidang_ilmu' => 'Lingkungan',
            'fokus_sdg' => 'SDGs 11', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPkmSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-20',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => 'DLH',
        ]));

        $propPkmAcceptedReturn = Proposal::create(array_merge($basePkmProposal, [
            'judul' => 'E2E-PKM-ACCEPTED-RETURN: Bank Sampah',
            'topik_penelitian' => 'Bank Sampah', 'bidang_ilmu' => 'Lingkungan',
            'fokus_sdg' => 'SDGs 12', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPkmSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-20',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => 'DLH',
        ]));

        $propPkmAcceptedDis = Proposal::create(array_merge($basePkmProposal, [
            'judul' => 'E2E-PKM-ACCEPTED-DIS: Kompos Organik',
            'topik_penelitian' => 'Kompos', 'bidang_ilmu' => 'Pertanian',
            'fokus_sdg' => 'SDGs 2', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPkmSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-20',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => 'Dinas Pertanian',
        ]));

        $propRejected = Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-PROP-REJECTED: Deprecated Technology',
            'topik_penelitian' => 'Legacy', 'bidang_ilmu' => 'TI',
            'fokus_sdg' => 'SDGs 9', 'status' => 'Ditolak',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-15', 'catatan' => 'Tidak sesuai tema',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
        ]));

        // ════════════════════════════════════════════════════════════
        // PROPOSALS — PkM (owned by Dosen E2E)
        // ════════════════════════════════════════════════════════════
        $propPkmDraft = Proposal::create(array_merge($basePkmProposal, [
            'judul' => 'E2E-PKM-PROP-DRAFT: Pelatihan Digital UMKM',
            'topik_penelitian' => 'Pemberdayaan UMKM', 'bidang_ilmu' => 'Bisnis',
            'fokus_sdg' => 'SDGs 8', 'status' => 'Draft',
            'kegiatan_id' => $kegPkmPenerimaan->kegiatan_id,
            'tgl_pengajuan' => '2026-08-10',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => 'UMKM Mitra',
        ]));

        $propPkmReview = Proposal::create(array_merge($basePkmProposal, [
            'judul' => 'E2E-PKM-PROP-REVIEW: Edukasi Literasi Digital',
            'topik_penelitian' => 'Pendidikan', 'bidang_ilmu' => 'Pendidikan',
            'fokus_sdg' => 'SDGs 4', 'status' => 'Menunggu review',
            'kegiatan_id' => $kegPkmSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-11',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => 'Sekolah Mitra',
        ]));

        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal', 'reviewable_id' => $propPkmReview->proposal_id,
            'proposal_id' => $propPkmReview->proposal_id, 'user_id' => $reviewer->id,
            'tgl_penugasan' => '2026-08-12', 'status_review' => 'Belum direview',
        ]);

        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal', 'reviewable_id' => $propPkmReview->proposal_id,
            'proposal_id' => $propPkmReview->proposal_id, 'user_id' => $reviewer2->id,
            'tgl_penugasan' => '2026-08-12', 'status_review' => 'Belum direview',
        ]);

        PenugasanReviewer::create([
            'reviewable_type' => 'App\Models\Proposal', 'reviewable_id' => $propPkmReview->proposal_id,
            'proposal_id' => $propPkmReview->proposal_id, 'user_id' => $reviewer3->id,
            'tgl_penugasan' => '2026-08-12', 'status_review' => 'Belum direview',
        ]);

        $propPkmAccepted = Proposal::create(array_merge($basePkmProposal, [
            'judul' => 'E2E-PKM-PROP-ACCEPTED: Pengolahan Sampah Organik',
            'topik_penelitian' => 'Lingkungan', 'bidang_ilmu' => 'Lingkungan',
            'fokus_sdg' => 'SDGs 11', 'status' => 'Proposal Diterima',
            'kegiatan_id' => $kegPkmSK->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-07-20',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => 'DLH Kota',
        ]));

        // ════════════════════════════════════════════════════════════
        // LAPORAN — Penelitian Ganjil (each linked to its own accepted proposal)
        // ════════════════════════════════════════════════════════════
        $lapGanBelum = Laporan::create([
            'proposal_id' => $propAcceptedGanBelum->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'Penelitian', 'judul_penelitian' => 'E2E-PEN-GAN-BELUM: Solar Panel Optimization',
            'status' => 'Belum dimulai', 'tgl_mulai' => '2026-08-01',
            'kegiatan_id' => $kegPenGanProses->kegiatan_id,
        ]);

        $lapGanProses = Laporan::create([
            'proposal_id' => $propAcceptedGanProses->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'Penelitian', 'judul_penelitian' => 'E2E-PEN-GAN-PROSES: Wind Energy Research',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-07-01',
            'kegiatan_id' => $kegPenGanProses->kegiatan_id,
        ]);

        $logbook1 = LogbookPengerjaan::create([
            'laporan_id' => $lapGanProses->laporan_id, 'user_id' => $dosen->id,
            'judul' => 'E2E-LOG-001: Konsultasi Awal',
            'deskripsi' => 'Meeting dengan mitra untuk membahas rencana penelitian',
            'tgl_kegiatan' => '2026-07-15',
            'lampiran_drive_url' => 'https://drive.google.com/file/d/e2e-log-001/view',
        ]);

        $logbook2 = LogbookPengerjaan::create([
            'laporan_id' => $lapGanProses->laporan_id, 'user_id' => $dosen->id,
            'judul' => 'E2E-LOG-002: Pengumpulan Data',
            'deskripsi' => 'Pengumpulan data primer di lapangan',
            'tgl_kegiatan' => '2026-08-01',
            'lampiran_drive_url' => 'https://drive.google.com/file/d/e2e-log-002/view',
        ]);

        $lapGanProses->update(['current_logbook_id' => $logbook2->logbook_id]);

        $lapGanPub = Laporan::create([
            'proposal_id' => $propAcceptedGanPub->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'Penelitian', 'judul_penelitian' => 'E2E-PEN-GAN-PUB: Hydro Power Study',
            'status' => 'Menunggu review Admin', 'tgl_mulai' => '2026-07-01',
            'tgl_submit' => '2026-08-10',
            'target_publikasi' => 'SCOPUS Q3', 'nama_jurnal' => 'Energy Journal',
            'link_jurnal' => 'https://journal.example.com/e2e-pen-gan-pub',
            'kegiatan_id' => $kegPenGanPub->kegiatan_id,
        ]);

        $lapGanDis = Laporan::create([
            'proposal_id' => $propAcceptedGanDis->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'Penelitian', 'judul_penelitian' => 'E2E-PEN-GAN-DIS: Geothermal Energy',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-07-01',
            'kegiatan_id' => $kegPenGanDis->kegiatan_id,
        ]);

        $lapGanClaim = Laporan::create([
            'proposal_id' => $propAcceptedGanClaim->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'Penelitian', 'judul_penelitian' => 'E2E-PEN-GAN-CLAIM: Biomass Energy',
            'status' => 'Menunggu konfirmasi penerimaan dana', 'tgl_mulai' => '2026-07-01',
            'claim_dana_status' => 'Menunggu bukti terima',
            'kegiatan_id' => $kegPenGanClaim->kegiatan_id,
        ]);

        $lapGanSelesai = Laporan::create([
            'proposal_id' => $propAcceptedGanSelesai->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'Penelitian', 'judul_penelitian' => 'E2E-PEN-GAN-SELESAI: Tidal Energy',
            'status' => 'Selesai', 'tgl_mulai' => '2026-07-01',
            'completed_at' => $now,
            'kegiatan_id' => $kegPenGanClaim->kegiatan_id,
        ]);

        // ════════════════════════════════════════════════════════════
        // LAPORAN — Penelitian Genap (each linked to its own accepted proposal)
        // ════════════════════════════════════════════════════════════
        $lapGenBelum = Laporan::create([
            'proposal_id' => $propAcceptedGenBelum->proposal_id, 'semester' => 'Genap',
            'jenis_penelitian' => 'Penelitian', 'judul_penelitian' => 'E2E-PEN-GEN-BELUM: Hydrogen Fuel Cell',
            'status' => 'Belum dimulai', 'tgl_mulai' => '2026-08-01',
            'kegiatan_id' => $kegPenGenProses->kegiatan_id,
        ]);

        $lapGenProses = Laporan::create([
            'proposal_id' => $propAcceptedGenProses->proposal_id, 'semester' => 'Genap',
            'jenis_penelitian' => 'Penelitian', 'judul_penelitian' => 'E2E-PEN-GEN-PROSES: Nuclear Fusion Research',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-08-01',
            'kegiatan_id' => $kegPenGenProses->kegiatan_id,
        ]);

        LogbookPengerjaan::create([
            'laporan_id' => $lapGenProses->laporan_id, 'user_id' => $dosen->id,
            'judul' => 'E2E-LOG-GEN-001: Persiapan Genap',
            'deskripsi' => 'Persiapan aktivitas penelitian semester genap',
            'tgl_kegiatan' => '2026-08-15',
            'lampiran_drive_url' => 'https://drive.google.com/file/d/e2e-log-gen-001/view',
        ]);

        // ════════════════════════════════════════════════════════════
        // LAPORAN — PkM (each linked to its own accepted proposal)
        // ════════════════════════════════════════════════════════════
        $lapPkmClaim = Laporan::create([
            'proposal_id' => $propPkmAcceptedClaim->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'PkM', 'judul_penelitian' => 'E2E-PKM-LAP-CLAIM: Pelatihan UMKM Digital',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-08-01',
            'claim_dana_status' => 'Menunggu bukti terima',
            'kegiatan_id' => $kegPkmGanClaim->kegiatan_id,
        ]);

        $lapPkmProses = Laporan::create([
            'proposal_id' => $propPkmAcceptedProses->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'PkM', 'judul_penelitian' => 'E2E-PKM-LAP-PROSES: Edukasi Literasi',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-08-01',
            'kegiatan_id' => $kegPkmGanProses->kegiatan_id,
        ]);

        LogbookPengerjaan::create([
            'laporan_id' => $lapPkmProses->laporan_id, 'user_id' => $dosen->id,
            'judul' => 'E2E-LOG-PKM-001: Pelaksanaan PKM',
            'deskripsi' => 'Pelaksanaan kegiatan pengolahan sampah di mitra',
            'tgl_kegiatan' => '2026-08-10',
            'lampiran_drive_url' => 'https://drive.google.com/file/d/e2e-log-pkm-001/view',
        ]);

        $lapPkmPub = Laporan::create([
            'proposal_id' => $propPkmAcceptedPub->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'PkM', 'judul_penelitian' => 'E2E-PKM-LAP-PUB: Pengolahan Sampah',
            'status' => 'Menunggu review Admin', 'tgl_mulai' => '2026-08-01',
            'tgl_submit' => '2026-08-20',
            'target_publikasi' => 'Jurnal Nasional', 'nama_jurnal' => 'PkM Journal',
            'link_jurnal' => 'https://journal.example.com/e2e-pkm-lap-pub',
            'kegiatan_id' => $kegPkmGanPub->kegiatan_id,
        ]);

        $lapPkmReturn = Laporan::create([
            'proposal_id' => $propPkmAcceptedReturn->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'PkM', 'judul_penelitian' => 'E2E-PKM-LAP-RETURN: Bank Sampah',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-08-01',
            'pengembalian_dana_status' => 'Menunggu Pengembalian Dana',
            'kegiatan_id' => $kegPkmGanReturn->kegiatan_id,
        ]);

        $lapPkmDis = Laporan::create([
            'proposal_id' => $propPkmAcceptedDis->proposal_id, 'semester' => 'Ganjil',
            'jenis_penelitian' => 'PkM', 'judul_penelitian' => 'E2E-PKM-LAP-DIS: Kompos Organik',
            'status' => 'Dalam pengerjaan', 'tgl_mulai' => '2026-08-01',
            'kegiatan_id' => $kegPkmGanDis->kegiatan_id,
        ]);

        // ════════════════════════════════════════════════════════════
        // NOTIFICATIONS — For Dosen E2E
        // ════════════════════════════════════════════════════════════
        Notification::create([
            'user_id' => $dosen->id, 'type' => 'proposal.accepted',
            'title' => 'Proposal Diterima',
            'message' => 'Proposal "E2E-PEN-PROP-ACCEPTED: Green Energy Solutions" telah diterima.',
            'data' => json_encode(['proposal_id' => $propAccepted->proposal_id]),
            'action_url' => '/dashboard?module=dosenmonitoringprogress&skema_id=' . $skema->skema_id . '&view=proposal&proposal_id=' . $propAccepted->proposal_id . '&tab=PENGUMUMAN_SURAT_TUGAS&jenis=Penelitian',
            'key' => 'e2e-dosen-notif-accepted-' . $propAccepted->proposal_id,
        ]);

        Notification::create([
            'user_id' => $dosen->id, 'type' => 'proposal.revision',
            'title' => 'Proposal Perlu Revisi',
            'message' => 'Proposal "E2E-PEN-PROP-REVIEW: NLP untuk Education" menunggu review.',
            'data' => json_encode(['proposal_id' => $propReview->proposal_id]),
            'action_url' => '/dashboard?module=dosenmonitoringprogress&skema_id=' . $skema->skema_id . '&view=proposal&proposal_id=' . $propReview->proposal_id . '&tab=SELEKSI_PROPOSAL&jenis=Penelitian',
            'key' => 'e2e-dosen-notif-review-' . $propReview->proposal_id,
            'read_at' => $now,
        ]);

        Notification::create([
            'user_id' => $dosen->id, 'type' => 'laporan.status_changed',
            'title' => 'Laporan Status Updated',
            'message' => 'Laporan "E2E-PEN-GAN-PUB" menunggu review Admin.',
            'data' => json_encode(['laporan_id' => $lapGanPub->laporan_id]),
            'action_url' => '/dashboard?module=dosenmonitoringprogresslaporan&skema_id=' . $skema->skema_id . '&view=laporan&laporan_id=' . $lapGanPub->laporan_id . '&tab=PUBLIKASI&jenis=Penelitian',
            'key' => 'e2e-dosen-notif-laporan-' . $lapGanPub->laporan_id,
        ]);

        // ════════════════════════════════════════════════════════════
        // DOSEN B — For isolation test (DS-ISO-001)
        // ════════════════════════════════════════════════════════════
        $dosenB = User::create([
            'nama' => 'Dosen B E2E', 'email' => 'dosen.b@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Dosen', 'status' => 'Aktif', 'gender' => 'P',
            'nidn' => '20002', 'no_hp' => '081234567895',
            'prodi_id' => $prodiBD->prodi_id, 'remember_token' => Str::random(10),
        ]);

        Proposal::create(array_merge($baseProposal, [
            'judul' => 'DS-ISO-B: Milik Dosen B',
            'topik_penelitian' => 'Data Science', 'bidang_ilmu' => 'Statistika',
            'fokus_sdg' => 'SDGs 9', 'status' => 'Menunggu review',
            'user_id' => $dosenB->id,
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-10',
            'rencana_luaran' => 'Jurnal Nasional', 'institusi_mitra' => '-',
        ]));

        // ════════════════════════════════════════════════════════════
        // PROPOSAL — Revisi status (for DS-REV-MUT-002)
        // ════════════════════════════════════════════════════════════
        Proposal::create(array_merge($baseProposal, [
            'judul' => 'E2E-PEN-PROP-REVISI: Cloud Computing Edge',
            'topik_penelitian' => 'Cloud Computing', 'bidang_ilmu' => 'TI',
            'fokus_sdg' => 'SDGs 9', 'status' => 'Revisi',
            'kegiatan_id' => $kegPenSeleksi->kegiatan_id,
            'ketua_seleksi_approved' => true, 'staff_seleksi_approved' => true,
            'tgl_pengajuan' => '2026-08-12',
            'catatan' => 'Metodologi perlu diperbaiki. Gunakan mixed methods.',
            'rencana_luaran' => 'Jurnal Internasional', 'institusi_mitra' => '-',
        ]));

        // Print summary
        $this->command->info('E2E Dosen fixtures seeded:');
        $this->command->info('  Dosen: dosen.e2e@itbss.ac.id / password');
        $this->command->info('  Penelitian Proposals: 8 (Draft, Upload, Ketua, Staff, Assign, Review, Accepted, Rejected)');
        $this->command->info('  PkM Proposals: 3 (Draft, Review, Accepted)');
        $this->command->info('  Penelitian Laporan Ganjil: 6 (Belum, Proses, Pub, Dis, Claim, Selesai)');
        $this->command->info('  Penelitian Laporan Genap: 2 (Belum, Proses)');
        $this->command->info('  PkM Laporan: 5 (Claim, Proses, Pub, Return, Dis)');
        $this->command->info('  Logbook entries: 4');
        $this->command->info('  Notifications: 3');
    }
}
