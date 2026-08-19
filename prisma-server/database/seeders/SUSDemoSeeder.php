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
use App\Models\AuthorizationRequest;
use App\Models\Mahasiswa;
use App\Models\PublicationCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * SUS / Exploratory Testing Seeder for PRISMA.
 *
 * Creates a rich, realistic, populated environment so SUS participants
 * and evaluators can log into each role and explore the application naturally.
 *
 * SEPARATE from E2E fixtures and Thesis Screenshot fixtures.
 * Does NOT modify existing test data — uses its own SUS-specific accounts.
 *
 * Usage:
 *   php artisan migrate:fresh --env=testing --force --seeder="SUSDemoSeeder"
 */
class SUSDemoSeeder extends Seeder
{
    // Fixed timestamps for determinism
    protected $now;
    protected $fixedDate = '2026-08-15';
    protected $fixedDateTime = '2026-08-15 08:00:00';

    // Collectors for cross-referencing
    protected $prodi = [];
    protected $dosen = [];
    protected $staff = [];
    protected $ketua = [];
    protected $reviewers = [];
    protected $superadmin;
    protected $skema;
    protected $kegiatan = [];
    protected $proposals = [];
    protected $laporan = [];

    public function run(): void
    {
        $this->now = now();

        $this->seedProdi();
        $this->seedUsers();
        $this->seedSettings();
        $this->seedMasterData();
        $this->seedKegiatanPengajuan();
        $this->seedProposals();
        $this->seedReviewerAssignments();
        $this->seedReviews();
        $this->seedLaporanPenelitian();
        $this->seedLaporanPkM();
        $this->seedLogbookEntries();
        $this->seedAuthorizationRequests();
        $this->seedNotifications();
        $this->seedProposalMembers();
        $this->seedLaporanMembers();
        $this->seedPenelitiDetails();
        $this->seedMahasiswa();

        $this->command->info('SUS Demo seeder completed successfully.');
        $this->command->info("Dosen: " . count($this->dosen));
        $this->command->info("Staff: " . count($this->staff));
        $this->command->info("Ketua: " . count($this->ketua));
        $this->command->info("Reviewers: " . count($this->reviewers));
        $this->command->info("Proposals: " . count($this->proposals));
        $this->command->info("Laporan: " . count($this->laporan));
    }

    // ════════════════════════════════════════════════════════════
    // PRODI
    // ════════════════════════════════════════════════════════════
    protected function seedProdi(): void
    {
        $names = [
            'Sistem Teknologi dan Informasi',
            'Bisnis Digital',
            'Kewirausahaan',
            'Informatika',
            'Manajemen',
            'Akuntansi',
            'Teknik Elektro',
            'Desain Komunikasi Visual',
        ];

        foreach ($names as $name) {
            $this->prodi[] = Prodi::create(['nama_prodi' => $name]);
        }
    }

    // ════════════════════════════════════════════════════════════
    // USERS
    // ════════════════════════════════════════════════════════════
    protected function seedUsers(): void
    {
        // ── Superadmin (1 — primary SUS account) ──
        $this->superadmin = User::create([
            'nama' => 'Superadmin Utama',
            'email' => 'sustest.superadmin@itbss.ac.id',
            'email_verified_at' => $this->now,
            'password' => Hash::make('password'),
            'role' => 'Superadmin',
            'status' => 'Aktif',
            'gender' => 'L',
            'nidn' => '90001',
            'no_hp' => '081234567801',
            'prodi_id' => $this->prodi[0]->prodi_id,
            'remember_token' => Str::random(10),
        ]);

        // ── Ketua LPPM (3) ──
        $ketuaNames = [
            ['nama' => 'Dr. Siti Nurhaliza, M.Kom.', 'email' => 'sustest.ketua@itbss.ac.id', 'gender' => 'P', 'nidn' => '10001'],
            ['nama' => 'Prof. Bambang Sugiharto, M.T.', 'email' => 'ketua.lppm2@itbss.ac.id', 'gender' => 'L', 'nidn' => '10002'],
            ['nama' => 'Dr. Rina Wulandari, S.Pd., M.Pd.', 'email' => 'ketua.lppm3@itbss.ac.id', 'gender' => 'P', 'nidn' => '10003'],
        ];
        foreach ($ketuaNames as $i => $k) {
            $this->ketua[] = User::create([
                'nama' => $k['nama'], 'email' => $k['email'],
                'email_verified_at' => $this->now, 'password' => Hash::make('password'),
                'role' => 'Ketua LPPM', 'status' => 'Aktif', 'gender' => $k['gender'],
                'nidn' => $k['nidn'], 'no_hp' => '08123456' . str_pad(890 + $i, 4, '0', STR_PAD_LEFT),
                'prodi_id' => $this->prodi[$i % count($this->prodi)]->prodi_id,
                'remember_token' => Str::random(10),
            ]);
        }

        // ── Staff LPPM (4) ──
        $staffNames = [
            ['nama' => 'Ahmad Fauzi, S.Kom.', 'email' => 'sustest.staff@itbss.ac.id', 'gender' => 'L', 'nidn' => '10010'],
            ['nama' => 'Dewi Kartika, S.E.', 'email' => 'staff.lppm2@itbss.ac.id', 'gender' => 'P', 'nidn' => '10011'],
            ['nama' => 'Hendra Wijaya, S.T.', 'email' => 'staff.lppm3@itbss.ac.id', 'gender' => 'L', 'nidn' => '10012'],
            ['nama' => 'Maya Putri, S.Pd.', 'email' => 'staff.lppm4@itbss.ac.id', 'gender' => 'P', 'nidn' => '10013'],
        ];
        foreach ($staffNames as $i => $s) {
            $this->staff[] = User::create([
                'nama' => $s['nama'], 'email' => $s['email'],
                'email_verified_at' => $this->now, 'password' => Hash::make('password'),
                'role' => 'Staff LPPM', 'status' => 'Aktif', 'gender' => $s['gender'],
                'nidn' => $s['nidn'], 'no_hp' => '08123456' . str_pad(870 + $i, 4, '0', STR_PAD_LEFT),
                'prodi_id' => $this->prodi[$i % count($this->prodi)]->prodi_id,
                'remember_token' => Str::random(10),
            ]);
        }

        // ── Dosen (15) ──
        $dosenData = [
            ['nama' => 'Dr. Andi Pratama, M.Kom.', 'email' => 'sustest.dosen@itbss.ac.id', 'gender' => 'L', 'nidn' => '20001', 'prodi' => 0],
            ['nama' => 'Siti Rahmawati, S.T., M.T.', 'email' => 'dosen.02@itbss.ac.id', 'gender' => 'P', 'nidn' => '20002', 'prodi' => 1],
            ['nama' => 'Budi Santoso, S.Kom., M.Kom.', 'email' => 'dosen.03@itbss.ac.id', 'gender' => 'L', 'nidn' => '20003', 'prodi' => 2],
            ['nama' => 'Ratna Dewi, S.Pd., M.Pd.', 'email' => 'dosen.04@itbss.ac.id', 'gender' => 'P', 'nidn' => '20004', 'prodi' => 3],
            ['nama' => 'Eko Prasetyo, S.E., M.E.', 'email' => 'dosen.05@itbss.ac.id', 'gender' => 'L', 'nidn' => '20005', 'prodi' => 4],
            ['nama' => 'Lestari Wulandari, S.Ak., M.Ak.', 'email' => 'dosen.06@itbss.ac.id', 'gender' => 'P', 'nidn' => '20006', 'prodi' => 5],
            ['nama' => 'Agus Setiawan, S.T., M.T.', 'email' => 'dosen.07@itbss.ac.id', 'gender' => 'L', 'nidn' => '20007', 'prodi' => 6],
            ['nama' => 'Dian Kusuma, S.Ds., M.Ds.', 'email' => 'dosen.08@itbss.ac.id', 'gender' => 'P', 'nidn' => '20008', 'prodi' => 7],
            ['nama' => 'Hari Kurniawan, S.Kom., M.Kom.', 'email' => 'dosen.09@itbss.ac.id', 'gender' => 'L', 'nidn' => '20009', 'prodi' => 0],
            ['nama' => 'Nina Susanti, S.E., M.M.', 'email' => 'dosen.10@itbss.ac.id', 'gender' => 'P', 'nidn' => '20010', 'prodi' => 1],
            ['nama' => 'Rudi Hermawan, S.T., M.T.', 'email' => 'dosen.11@itbss.ac.id', 'gender' => 'L', 'nidn' => '20011', 'prodi' => 2],
            ['nama' => 'Wati Susilawati, S.Pd., M.Pd.', 'email' => 'dosen.12@itbss.ac.id', 'gender' => 'P', 'nidn' => '20012', 'prodi' => 3],
            ['nama' => 'Joko Prayitno, S.Kom., M.Kom.', 'email' => 'dosen.13@itbss.ac.id', 'gender' => 'L', 'nidn' => '20013', 'prodi' => 4],
            ['nama' => 'Sri Mulyani, S.Ak., M.Ak.', 'email' => 'dosen.14@itbss.ac.id', 'gender' => 'P', 'nidn' => '20014', 'prodi' => 5],
            ['nama' => 'Dodi Gunawan, S.T., M.T.', 'email' => 'dosen.15@itbss.ac.id', 'gender' => 'L', 'nidn' => '20015', 'prodi' => 6],
        ];
        foreach ($dosenData as $i => $d) {
            $this->dosen[] = User::create([
                'nama' => $d['nama'], 'email' => $d['email'],
                'email_verified_at' => $this->now, 'password' => Hash::make('password'),
                'role' => 'Dosen', 'status' => 'Aktif', 'gender' => $d['gender'],
                'nidn' => $d['nidn'], 'no_hp' => '08123456' . str_pad(800 + $i, 4, '0', STR_PAD_LEFT),
                'prodi_id' => $this->prodi[$d['prodi']]->prodi_id,
                'remember_token' => Str::random(10),
            ]);
        }

        // ── Reviewers (10) ──
        $reviewerData = [
            ['nama' => 'Prof. Dr. Ahmad Dahlan, M.T.', 'email' => 'sustest.reviewer@itbss.ac.id', 'gender' => 'L', 'nidn' => '30001', 'prodi' => 0],
            ['nama' => 'Dr. Fatimah Azzahra, M.Kom.', 'email' => 'reviewer.02@itbss.ac.id', 'gender' => 'P', 'nidn' => '30002', 'prodi' => 1],
            ['nama' => 'Dr. Hendro Wibowo, M.T.', 'email' => 'reviewer.03@itbss.ac.id', 'gender' => 'L', 'nidn' => '30003', 'prodi' => 2],
            ['nama' => 'Dr. Kartini Sari, M.Pd.', 'email' => 'reviewer.04@itbss.ac.id', 'gender' => 'P', 'nidn' => '30004', 'prodi' => 3],
            ['nama' => 'Dr. Lukman Hakim, S.E., M.E.', 'email' => 'reviewer.05@itbss.ac.id', 'gender' => 'L', 'nidn' => '30005', 'prodi' => 4],
            ['nama' => 'Dr. Maya Sari, S.Ak., M.Ak.', 'email' => 'reviewer.06@itbss.ac.id', 'gender' => 'P', 'nidn' => '30006', 'prodi' => 5],
            ['nama' => 'Dr. Nugroho Adi, S.T., M.T.', 'email' => 'reviewer.07@itbss.ac.id', 'gender' => 'L', 'nidn' => '30007', 'prodi' => 6],
            ['nama' => 'Dr. Ophelia Chen, M.Ds.', 'email' => 'reviewer.08@itbss.ac.id', 'gender' => 'P', 'nidn' => '30008', 'prodi' => 7],
            ['nama' => 'Dr. Prabowo Subianto, S.Kom., M.Kom.', 'email' => 'reviewer.09@itbss.ac.id', 'gender' => 'L', 'nidn' => '30009', 'prodi' => 0],
            ['nama' => 'Dr. Ratna Sari, M.T.', 'email' => 'reviewer.10@itbss.ac.id', 'gender' => 'P', 'nidn' => '30010', 'prodi' => 1],
        ];
        foreach ($reviewerData as $i => $r) {
            $this->reviewers[] = User::create([
                'nama' => $r['nama'], 'email' => $r['email'],
                'email_verified_at' => $this->now, 'password' => Hash::make('password'),
                'role' => 'Reviewer', 'status' => 'Aktif', 'gender' => $r['gender'],
                'nidn' => $r['nidn'], 'no_hp' => '08123456' . str_pad(850 + $i, 4, '0', STR_PAD_LEFT),
                'prodi_id' => $this->prodi[$r['prodi']]->prodi_id,
                'remember_token' => Str::random(10),
            ]);
        }
    }

    // ════════════════════════════════════════════════════════════
    // SETTINGS
    // ════════════════════════════════════════════════════════════
    protected function seedSettings(): void
    {
        Settings::create([
            'kepala_lppm' => $this->ketua[0]->id,
            'rektor' => $this->superadmin->id,
            'rektor_nama' => 'Prof. Dr. Suharto, M.T.',
            'rektor_nidn' => '99001',
            'rektor_nuptk' => '99001',
            'nama_kampus' => 'ITB SUS Testing',
            'kriteria_penilaian' => json_encode([
                ['kriteria' => 'Kesesuaian Tema', 'bobot' => 30],
                ['kriteria' => 'Metodologi', 'bobot' => 30],
                ['kriteria' => 'Timeline', 'bobot' => 20],
                ['kriteria' => 'Anggaran', 'bobot' => 20],
            ]),
            'list_kesesuaian_tema' => json_encode(['SDGs', 'Teknologi', 'Kesehatan', 'Lingkungan', 'Pendidikan', 'Ekonomi']),
            'ignore_kegiatan_dates' => true,
        ]);
    }

    // ════════════════════════════════════════════════════════════
    // MASTER DATA
    // ════════════════════════════════════════════════════════════
    protected function seedMasterData(): void
    {
        // Skema
        $this->skema = Skema::create([
            'nama_skema' => 'Penelitian Dosen Tetap 2026',
            'tahun_ajaran' => '2025/2026',
            'status' => 'Aktif',
        ]);

        Skema::create([
            'nama_skema' => 'PkM Dosen Tetap 2026',
            'tahun_ajaran' => '2025/2026',
            'status' => 'Aktif',
        ]);

        // Publication Categories
        PublicationCategory::create(['nama' => 'Jurnal Nasional Terakreditasi', 'peringkat' => json_encode(['Sinta 2', 'Sinta 3', 'Sinta 4']), 'urutan' => 1]);
        PublicationCategory::create(['nama' => 'Jurnal Internasional', 'peringkat' => json_encode(['Q1', 'Q2', 'Q3', 'Q4']), 'urutan' => 2]);
        PublicationCategory::create(['nama' => 'Prosiding Internasional', 'peringkat' => json_encode(['Scopus', 'Non-Scopus']), 'urutan' => 3]);
        PublicationCategory::create(['nama' => 'Buku', 'peringkat' => json_encode(['ISBN']), 'urutan' => 4]);
    }

    // ════════════════════════════════════════════════════════════
    // KEGIATAN PENGAJUAN
    // ════════════════════════════════════════════════════════════
    protected function seedKegiatanPengajuan(): void
    {
        $codes = [
            // Penelitian
            'PENERIMAAN_PROPOSAL' => 'Penerimaan Proposal Penelitian',
            'SELEKSI_PROPOSAL' => 'Seleksi Proposal Penelitian',
            'PENGUMUMAN_SURAT_TUGAS' => 'Pengumuman Surat Tugas',
            'PROSES_PENELITIAN_GANJIL' => 'Proses Penelitian Ganjil',
            'PROSES_PENELITIAN_GENAP' => 'Proses Penelitian Genap',
            'PUBLIKASI_GANJIL' => 'Publikasi Ganjil',
            'PUBLIKASI_GENAP' => 'Publikasi Genap',
            'DISEMINASI_GANJIL' => 'Diseminasi Ganjil',
            'DISEMINASI_GENAP' => 'Diseminasi Genap',
            'CLAIM_DANA_GANJIL' => 'Claim Dana Ganjil',
            'CLAIM_DANA_GENAP' => 'Claim Dana Genap',
            'LUARAN_PENELITIAN' => 'Luaran Penelitian',
            // PkM
            'CLAIM_DANA_PKM_GANJIL' => 'Claim Dana PkM Ganjil',
            'PROSES_PKM_GANJIL' => 'Proses PkM Ganjil',
            'PUBLIKASI_PKM_GANJIL' => 'Publikasi PkM Ganjil',
            'PENGEMBALIAN_DANA_GANJIL' => 'Pengembalian Dana PkM Ganjil',
            'DISEMINASI_PKM_GANJIL' => 'Diseminasi PkM Ganjil',
        ];

        foreach ($codes as $code => $name) {
            $jenis = str_contains($code, 'PKM') || str_contains($code, 'PENGEMBALIAN') ? 'PkM' : 'Penelitian';
            $this->kegiatan[$code] = KegiatanPengajuan::create([
                'skema_id' => $this->skema->skema_id,
                'jenis_penelitian' => $jenis,
                'kode_kegiatan' => $code,
                'nama_kegiatan' => $name,
                'tgl_mulai' => '2026-01-01',
                'tgl_selesai' => '2026-12-31',
                'status' => 'Terbuka',
                'manual_status_override' => true,
            ]);
        }
    }

    // ════════════════════════════════════════════════════════════
    // PROPOSALS — 40 across all statuses
    // ════════════════════════════════════════════════════════════
    protected function seedProposals(): void
    {
        $titles = [
            // Draft (3)
            ['judul' => 'Pengembangan Sistem Informasi Manajemen Risiko Berbasis Web', 'status' => 'Draft', 'topik' => 'Sistem Informasi', 'bidang' => 'Teknologi Informasi', 'sdg' => 'SDGs 9 - Industri dan Inovasi', 'kegiatan' => 'PENERIMAAN_PROPOSAL', 'dosen_idx' => 0],
            ['judul' => 'Implementasi Machine Learning untuk Prediksi Harga Komoditas', 'status' => 'Draft', 'topik' => 'Kecerdasan Buatan', 'bidang' => 'Ilmu Komputer', 'sdg' => 'SDGs 8 - Pekerjaan Layak', 'kegiatan' => 'PENERIMAAN_PROPOSAL', 'dosen_idx' => 1],
            ['judul' => 'Analisis Sentimen Ulasan Pengguna E-Commerce di Indonesia', 'status' => 'Draft', 'topik' => 'NLP', 'bidang' => 'Informatika', 'sdg' => 'SDGs 4 - Pendidikan Berkualitas', 'kegiatan' => 'PENERIMAAN_PROPOSAL', 'dosen_idx' => 2],

            // Menunggu proposal untuk diupload (2)
            ['judul' => 'Perancangan Sistem Pakar Diagnosa Tanaman Padi', 'status' => 'Menunggu proposal untuk diupload', 'topik' => 'Pertanian Cerdas', 'bidang' => 'Teknologi Pertanian', 'sdg' => 'SDGs 2 - Tanpa Kelaparan', 'kegiatan' => 'PENERIMAAN_PROPOSAL', 'dosen_idx' => 3],
            ['judul' => 'Pemanfaatan Blockchain untuk Transparansi Anggaran Desa', 'status' => 'Menunggu proposal untuk diupload', 'topik' => 'Governance', 'bidang' => 'Sistem Informasi', 'sdg' => 'SDGs 16 - Perdamaian dan Keadilan', 'kegiatan' => 'PENERIMAAN_PROPOSAL', 'dosen_idx' => 4],

            // Menunggu review dari Ketua LPPM (3)
            ['judul' => 'Cloud Computing untuk Smart City Kota Batam', 'status' => 'Menunggu review dari Ketua LPPM', 'topik' => 'Smart City', 'bidang' => 'Teknologi Informasi', 'sdg' => 'SDGs 11 - Kota dan Pemukiman', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 5],
            ['judul' => 'Pengembangan Media Pembelajaran AR untuk Biologi', 'status' => 'Menunggu review dari Ketua LPPM', 'topik' => 'Pendidikan', 'bidang' => 'Teknologi Pendidikan', 'sdg' => 'SDGs 4 - Pendidikan Berkualitas', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 6],
            ['judul' => 'Sistem Monitoring Kualitas Udara Berbasis IoT', 'status' => 'Menunggu review dari Ketua LPPM', 'topik' => 'Lingkungan', 'bidang' => 'Teknik Lingkungan', 'sdg' => 'SDGs 13 - Penanganan Perubahan Iklim', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 7],

            // Menunggu review Staff LPPM (3)
            ['judul' => 'Deep Learning untuk Deteksi Penyakit Tanaman', 'status' => 'Menunggu review Staff LPPM', 'topik' => 'Computer Vision', 'bidang' => 'Ilmu Komputer', 'sdg' => 'SDGs 2 - Tanpa Kelaparan', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 8, 'ketua_approved' => true],
            ['judul' => 'E-Commerce UMKM Berbasis Marketplace Lokal', 'status' => 'Menunggu review Staff LPPM', 'topik' => 'UMKM Digital', 'bidang' => 'Bisnis Digital', 'sdg' => 'SDGs 8 - Pekerjaan Layak', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 9, 'ketua_approved' => true],
            ['judul' => 'Sistem Informasi Geografis Pemetaan Risiko Bencana', 'status' => 'Menunggu review Staff LPPM', 'topik' => 'SIG', 'bidang' => 'Sistem Informasi', 'sdg' => 'SDGs 11 - Kota dan Pemukiman', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 10, 'ketua_approved' => true],

            // Menunggu penugasan reviewer (3)
            ['judul' => 'Natural Language Processing untuk Analisis Berita', 'status' => 'Menunggu penugasan reviewer', 'topik' => 'NLP', 'bidang' => 'Ilmu Komputer', 'sdg' => 'SDGs 16 - Perdamaian dan Keadilan', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 11, 'ketua_approved' => true, 'staff_approved' => true],
            ['judul' => 'Penerapan Teknologi Blockchain dalam Rantai Pasok', 'status' => 'Menunggu penugasan reviewer', 'topik' => 'Blockchain', 'bidang' => 'Teknologi Informasi', 'sdg' => 'SDGs 9 - Industri dan Inovasi', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 12, 'ketua_approved' => true, 'staff_approved' => true],
            ['judul' => 'Pengembangan Aplikasi Mobile Kesehatan Mental', 'status' => 'Menunggu penugasan reviewer', 'topik' => 'Kesehatan', 'bidang' => 'Informatika Kesehatan', 'sdg' => 'SDGs 3 - Kesehatan yang Baik', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 13, 'ketua_approved' => true, 'staff_approved' => true],

            // Menunggu review — 0/3 (2)
            ['judul' => 'Implementasi Edge Computing untuk IoT Real-Time', 'status' => 'Menunggu review', 'topik' => 'Edge Computing', 'bidang' => 'Teknologi Informasi', 'sdg' => 'SDGs 9 - Industri dan Inovasi', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 14, 'ketua_approved' => true, 'staff_approved' => true],
            ['judul' => 'Sistem Rekomendasi Pembelajaran Adaptif Berbasis AI', 'status' => 'Menunggu review', 'topik' => 'Pendidikan', 'bidang' => 'Teknologi Pendidikan', 'sdg' => 'SDGs 4 - Pendidikan Berkualitas', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 0, 'ketua_approved' => true, 'staff_approved' => true],

            // Menunggu review — 2/3 (1)
            ['judul' => 'Analisis Big Data untuk Prediksi Curah Hujan', 'status' => 'Menunggu review', 'topik' => 'Big Data', 'bidang' => 'Ilmu Komputer', 'sdg' => 'SDGs 13 - Penanganan Perubahan Iklim', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 1, 'ketua_approved' => true, 'staff_approved' => true],

            // Menunggu persetujuan Ketua LPPM (3/3 complete) (2)
            ['judul' => 'Computer Vision untuk Inspeksi Kualitas Manufaktur', 'status' => 'Menunggu persetujuan Ketua LPPM', 'topik' => 'Computer Vision', 'bidang' => 'Ilmu Komputer', 'sdg' => 'SDGs 9 - Industri dan Inovasi', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 2, 'ketua_approved' => true, 'staff_approved' => true],
            ['judul' => 'Pemanfaatan Remote Sensing untuk Pemantauan Hutan', 'status' => 'Menunggu persetujuan Ketua LPPM', 'topik' => 'Lingkungan', 'bidang' => 'Teknologi Lingkungan', 'sdg' => 'SDGs 15 - Kehidupan di Darat', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 3, 'ketua_approved' => true, 'staff_approved' => true],

            // Proposal Diterima — Penelitian (8)
            ['judul' => 'Optimasi Energi Terbarukan untuk Smart Grid', 'status' => 'Proposal Diterima', 'topik' => 'Energi Terbarukan', 'bidang' => 'Teknik Elektro', 'sdg' => 'SDGs 7 - Energi Bersih', 'kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'dosen_idx' => 4, 'ketua_approved' => true, 'staff_approved' => true, 'jenis' => 'Penelitian'],
            ['judul' => 'Sistem Pendukung Keputusan Berbasis AI untuk Diagnosis Penyakit', 'status' => 'Proposal Diterima', 'topik' => 'Kecerdasan Buatan', 'bidang' => 'Informatika Kesehatan', 'sdg' => 'SDGs 3 - Kesehatan yang Baik', 'kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'dosen_idx' => 5, 'ketua_approved' => true, 'staff_approved' => true, 'jenis' => 'Penelitian'],
            ['judul' => 'Pemanfaatan Drone untuk Pemantauan Lingkungan', 'status' => 'Proposal Diterima', 'topik' => 'Lingkungan', 'bidang' => 'Teknologi Lingkungan', 'sdg' => 'SDGs 13 - Penanganan Perubahan Iklim', 'kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'dosen_idx' => 6, 'ketua_approved' => true, 'staff_approved' => true, 'jenis' => 'Penelitian'],
            ['judul' => 'Pengembangan Sistem Deteksi Intrusi Jaringan', 'status' => 'Proposal Diterima', 'topik' => 'Keamanan Siber', 'bidang' => 'Teknologi Informasi', 'sdg' => 'SDGs 9 - Industri dan Inovasi', 'kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'dosen_idx' => 7, 'ketua_approved' => true, 'staff_approved' => true, 'jenis' => 'Penelitian'],
            ['judul' => 'Implementasi Federated Learning untuk Privasi Data', 'status' => 'Proposal Diterima', 'topik' => 'Machine Learning', 'bidang' => 'Ilmu Komputer', 'sdg' => 'SDGs 9 - Industri dan Inovasi', 'kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'dosen_idx' => 8, 'ketua_approved' => true, 'staff_approved' => true, 'jenis' => 'Penelitian'],
            ['judul' => 'Analisis Korelasi Pola Konsumsi Energi dan Emisi Karbon', 'status' => 'Proposal Diterima', 'topik' => 'Lingkungan', 'bidang' => 'Teknologi Lingkungan', 'sdg' => 'SDGs 13 - Penanganan Perubahan Iklim', 'kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'dosen_idx' => 9, 'ketua_approved' => true, 'staff_approved' => true, 'jenis' => 'Penelitian'],
            ['judul' => 'Pengembangan Robot Penjaga Pantai Berbasis Computer Vision', 'status' => 'Proposal Diterima', 'topik' => 'Robotika', 'bidang' => 'Teknik Elektro', 'sdg' => 'SDGs 14 - Ekosistem Laut', 'kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'dosen_idx' => 10, 'ketua_approved' => true, 'staff_approved' => true, 'jenis' => 'Penelitian'],
            ['judul' => 'Sistem Peringatan Dini Tsunami Berbasis Sensor IoT', 'status' => 'Proposal Diterima', 'topik' => 'Bencana', 'bidang' => 'Teknologi Informasi', 'sdg' => 'SDGs 11 - Kota dan Pemukiman', 'kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'dosen_idx' => 11, 'ketua_approved' => true, 'staff_approved' => true, 'jenis' => 'Penelitian'],

            // Proposal Diterima — PkM (6)
            ['judul' => 'Pelatihan Digitalisasi UMKM Berbasis Teknologi', 'status' => 'Proposal Diterima', 'topik' => 'UMKM Digital', 'bidang' => 'Sistem Informasi', 'sdg' => 'SDGs 8 - Pekerjaan Layak', 'kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'dosen_idx' => 12, 'ketua_approved' => true, 'staff_approved' => true, 'jenis' => 'PkM'],
            ['judul' => 'Sosialisasi Literasi Digital untuk Masyarakat Pedesaan', 'status' => 'Proposal Diterima', 'topik' => 'Literasi Digital', 'bidang' => 'Teknologi Informasi', 'sdg' => 'SDGs 4 - Pendidikan Berkualitas', 'kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'dosen_idx' => 13, 'ketua_approved' => true, 'staff_approved' => true, 'jenis' => 'PkM'],
            ['judul' => 'Pemberdayaan Masyarakat Pesisir Melalui Budidaya Rumput Laut', 'status' => 'Proposal Diterima', 'topik' => 'Pemberdayaan', 'bidang' => 'Kewirausahaan', 'sdg' => 'SDGs 14 - Ekosistem Laut', 'kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'dosen_idx' => 14, 'ketua_approved' => true, 'staff_approved' => true, 'jenis' => 'PkM'],
            ['judul' => 'Pelatihan Pengolahan Hasil Pertanian Berbasis IoT', 'status' => 'Proposal Diterima', 'topik' => 'Pertanian', 'bidang' => 'Teknologi Informasi', 'sdg' => 'SDGs 2 - Tanpa Kelaparan', 'kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'dosen_idx' => 0, 'ketua_approved' => true, 'staff_approved' => true, 'jenis' => 'PkM'],
            ['judul' => 'Sosialisasi Pemanfaatan Energi Surya untuk Rumah Tangga', 'status' => 'Proposal Diterima', 'topik' => 'Energi', 'bidang' => 'Teknik Elektro', 'sdg' => 'SDGs 7 - Energi Bersih', 'kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'dosen_idx' => 1, 'ketua_approved' => true, 'staff_approved' => true, 'jenis' => 'PkM'],
            ['judul' => 'Workshop Keamanan Siber untuk UMKM', 'status' => 'Proposal Diterima', 'topik' => 'Keamanan Siber', 'bidang' => 'Teknologi Informasi', 'sdg' => 'SDGs 9 - Industri dan Inovasi', 'kegiatan' => 'PENGUMUMAN_SURAT_TUGAS', 'dosen_idx' => 2, 'ketua_approved' => true, 'staff_approved' => true, 'jenis' => 'PkM'],

            // Ditolak (2)
            ['judul' => 'Studi Analisis Dampak Social Media terhadap Kesehatan Mental', 'status' => 'Ditolak', 'topik' => 'Kesehatan', 'bidang' => 'Psikologi', 'sdg' => 'SDGs 3 - Kesehatan yang Baik', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 3, 'ketua_approved' => true, 'staff_approved' => true],
            ['judul' => 'Rancang Bangun Microcontroller Berbasis RISC-V', 'status' => 'Ditolak', 'topik' => 'Hardware', 'bidang' => 'Teknik Elektro', 'sdg' => 'SDGs 9 - Industri dan Inovasi', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 4, 'ketua_approved' => true, 'staff_approved' => true],

            // Ditarik (1)
            ['judul' => 'Pengembangan Sistem Penilaian Otomatis Berbasis NLP', 'status' => 'Ditarik', 'topik' => 'NLP', 'bidang' => 'Ilmu Komputer', 'sdg' => 'SDGs 4 - Pendidikan Berkualitas', 'kegiatan' => 'PENERIMAAN_PROPOSAL', 'dosen_idx' => 5],

            // Revisi (2)
            ['judul' => 'Pemanfaatan Teknologi NFC untuk Sistem Pembayaran', 'status' => 'Revisi', 'topik' => 'Teknologi', 'bidang' => 'Teknologi Informasi', 'sdg' => 'SDGs 9 - Industri dan Inovasi', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 6, 'ketua_approved' => true, 'staff_approved' => true],
            ['judul' => 'Analisis Performa Jaringan 5G di Kawasan Industri', 'status' => 'Revisi', 'topik' => 'Jaringan', 'bidang' => 'Teknologi Informasi', 'sdg' => 'SDGs 9 - Industri dan Inovasi', 'kegiatan' => 'SELEKSI_PROPOSAL', 'dosen_idx' => 7, 'ketua_approved' => true, 'staff_approved' => true],
        ];

        foreach ($titles as $i => $t) {
            $jenis = $t['jenis'] ?? 'Penelitian';
            $this->proposals[] = Proposal::create([
                'jenis_penelitian' => $jenis,
                'jenis_penelitian_gan' => $jenis,
                'jenis_penelitian_gen' => $jenis,
                'judul' => $t['judul'],
                'tahap_penelitian' => 'Proposal',
                'topik_penelitian' => $t['topik'],
                'bidang_ilmu' => $t['bidang'],
                'fokus_sdg' => $t['sdg'],
                'skema' => 'Internal',
                'sumber_skema' => 'Dana Internal',
                'user_id' => $this->dosen[$t['dosen_idx']]->id,
                'kegiatan_id' => $this->kegiatan[$t['kegiatan']]->kegiatan_id,
                'status' => $t['status'],
                'ketua_seleksi_approved' => $t['ketua_approved'] ?? false,
                'staff_seleksi_approved' => $t['staff_approved'] ?? false,
                'tgl_pengajuan' => $this->fixedDate,
                'target_publikasi_gan' => 'Jurnal Nasional',
                'target_publikasi_gen' => 'Jurnal Nasional',
                'rencana_judul_publikasi_gan' => $t['judul'] . ' (Ganjil)',
                'rencana_judul_publikasi_gen' => $t['judul'] . ' (Genap)',
                'metopen_gan' => 'Mixed Methods',
                'metopen_gen' => 'Mixed Methods',
                'unit_analisis_gan' => 'Sample Penelitian',
                'unit_analisis_gen' => 'Sample Penelitian',
                'kontribusi_ilmu_makul' => 'Kontribusi Ilmu',
                'kontribusi_pkm' => 'Kontribusi PkM',
                'rencana_luaran' => 'Jurnal Nasional',
                'institusi_mitra' => 'Institusi Mitra',
                'ra_biaya_penelitian_gan' => 5000000,
                'ra_biaya_publikasi_gan' => 2000000,
                'ra_insentif_gan' => 1000000,
                'ra_biaya_penelitian_gen' => 5000000,
                'ra_biaya_publikasi_gen' => 2000000,
                'ra_insentif_gen' => 1000000,
            ]);
        }
    }

    // ════════════════════════════════════════════════════════════
    // REVIEWER ASSIGNMENTS — exactly 3 per review-state proposal
    // ════════════════════════════════════════════════════════════
    protected function seedReviewerAssignments(): void
    {
        // Proposals that need reviewer assignments
        $reviewStates = [
            'Menunggu review',
            'Menunggu persetujuan Ketua LPPM',
        ];

        $reviewProposals = array_filter($this->proposals, fn($p) => in_array($p->status, $reviewStates));
        $reviewProposals = array_values($reviewProposals);

        // Track which reviewers are used per proposal
        $reviewerIdx = 0;

        foreach ($reviewProposals as $prop) {
            // Assign exactly 3 unique reviewers
            for ($r = 0; $r < 3; $r++) {
                $reviewer = $this->reviewers[($reviewerIdx + $r) % count($this->reviewers)];
                PenugasanReviewer::create([
                    'reviewable_type' => 'App\\Models\\Proposal',
                    'reviewable_id' => $prop->proposal_id,
                    'proposal_id' => $prop->proposal_id,
                    'user_id' => $reviewer->id,
                    'tgl_penugasan' => $this->fixedDate,
                    'status_review' => 'Belum direview',
                ]);
            }
            $reviewerIdx += 3;
        }

        // Also assign reviewers for "Menunggu review" proposals that have 0/3
        // These are already handled above — they get 3 assignments with "Belum direview"
    }

    // ════════════════════════════════════════════════════════════
    // REVIEWS — varied scores for each reviewed proposal
    // ════════════════════════════════════════════════════════════
    protected function seedReviews(): void
    {
        // Find proposals at "Menunggu persetujuan Ketua LPPM" (3/3 complete)
        $pendingKetua = array_filter($this->proposals, fn($p) => $p->status === 'Menunggu persetujuan Ketua LPPM');
        $pendingKetua = array_values($pendingKetua);

        $scoreSets = [
            [['Kesesuaian Tema' => 90, 'Metodologi' => 85, 'Timeline' => 80, 'Anggaran' => 85], 'Diterima', 'Sangat Sesuai', 'Proposal sangat baik.'],
            [['Kesesuaian Tema' => 80, 'Metodologi' => 75, 'Timeline' => 70, 'Anggaran' => 80], 'Diterima dengan perbaikan', 'Sesuai', 'Perlu perbaikan pada timeline.'],
            [['Kesesuaian Tema' => 95, 'Metodologi' => 90, 'Timeline' => 85, 'Anggaran' => 90], 'Diterima', 'Sangat Sesuai', 'Proposal berkualitas tinggi.'],
        ];

        foreach ($pendingKetua as $prop) {
            $assignments = PenugasanReviewer::where('reviewable_type', 'App\\Models\\Proposal')
                ->where('reviewable_id', $prop->proposal_id)
                ->get();

            foreach ($assignments as $idx => $asg) {
                $asg->update(['status_review' => 'Telah direview']);
                $scores = $scoreSets[$idx % count($scoreSets)];
                Review::create([
                    'penugasan_id' => $asg->penugasan_id,
                    'keputusan' => $scores[1],
                    'kriteria_kesesuaian_tema' => json_encode([$scores[2]]),
                    'kriteria_penilaian' => json_encode(array_map(fn($k, $v) => ['kriteria' => $k, 'skor' => $v], array_keys($scores[0]), array_values($scores[0]))),
                    'catatan' => $scores[3],
                    'tgl_review' => $this->fixedDate,
                ]);
            }
        }
    }

    // ════════════════════════════════════════════════════════════
    // LAPORAN PENELITIAN — 20 across Ganjil/Genap
    // ════════════════════════════════════════════════════════════
    protected function seedLaporanPenelitian(): void
    {
        $penelitianAccepted = array_filter($this->proposals, fn($p) => $p->status === 'Proposal Diterima' && $p->jenis_penelitian === 'Penelitian');
        $penelitianAccepted = array_values($penelitianAccepted);

        $statuses = [
            'Dalam pengerjaan',
            'Menunggu review Admin',
            'Menunggu review Staff LPPM',
            'Menunggu review',
            'Menunggu hasil dari Reviewers',
            'Menunggu keputusan Ketua',
            'Selesai',
        ];

        $lapIdx = 0;
        foreach ($penelitianAccepted as $prop) {
            // Ganjil
            $statusGanjil = $statuses[$lapIdx % count($statuses)];
            $this->laporan[] = Laporan::create([
                'proposal_id' => $prop->proposal_id,
                'kegiatan_id' => $this->kegiatan['PROSES_PENELITIAN_GANJIL']->kegiatan_id,
                'semester' => 'Ganjil',
                'jenis_penelitian' => 'Penelitian',
                'judul_penelitian' => $prop->judul,
                'status' => $statusGanjil,
                'tgl_mulai' => '2026-08-01',
                'institusi_mitra' => $prop->institusi_mitra,
                'metode_penelitian' => 'Mixed Methods',
                'unit_analisis' => 'Sample Penelitian',
                'target_publikasi' => 'Jurnal Nasional',
                'realisasi_biaya_penelitian' => 4500000,
                'realisasi_biaya_publikasi' => 1800000,
                'realisasi_insentif' => 900000,
            ]);

            // Genap
            $statusGenap = $statuses[($lapIdx + 3) % count($statuses)];
            $this->laporan[] = Laporan::create([
                'proposal_id' => $prop->proposal_id,
                'kegiatan_id' => $this->kegiatan['PROSES_PENELITIAN_GENAP']->kegiatan_id,
                'semester' => 'Genap',
                'jenis_penelitian' => 'Penelitian',
                'judul_penelitian' => $prop->judul,
                'status' => $statusGenap,
                'tgl_mulai' => '2026-02-01',
                'institusi_mitra' => $prop->institusi_mitra,
                'metode_penelitian' => 'Mixed Methods',
                'unit_analisis' => 'Sample Penelitian',
                'target_publikasi' => 'Jurnal Nasional',
                'realisasi_biaya_penelitian' => 4500000,
                'realisasi_biaya_publikasi' => 1800000,
                'realisasi_insentif' => 900000,
            ]);

            $lapIdx++;
        }
    }

    // ════════════════════════════════════════════════════════════
    // LAPORAN PKM — 12 across PkM lifecycle
    // ════════════════════════════════════════════════════════════
    protected function seedLaporanPkM(): void
    {
        $pkmAccepted = array_filter($this->proposals, fn($p) => $p->status === 'Proposal Diterima' && $p->jenis_penelitian === 'PkM');
        $pkmAccepted = array_values($pkmAccepted);

        $pkmStatuses = [
            'Dalam pengerjaan',
            'Menunggu konfirmasi penerimaan dana',
            'Menunggu konfirmasi pengiriman dana',
            'Selesai',
        ];

        $lapIdx = 0;
        foreach ($pkmAccepted as $prop) {
            // Ganjil
            $status = $pkmStatuses[$lapIdx % count($pkmStatuses)];
            $lap = Laporan::create([
                'proposal_id' => $prop->proposal_id,
                'kegiatan_id' => $this->kegiatan['CLAIM_DANA_PKM_GANJIL']->kegiatan_id,
                'semester' => 'Ganjil',
                'jenis_penelitian' => 'PkM',
                'judul_penelitian' => $prop->judul,
                'status' => $status,
                'tgl_mulai' => '2026-08-01',
                'institusi_mitra' => $prop->institusi_mitra,
                'claim_dana_status' => $status === 'Menunggu konfirmasi penerimaan dana' ? 'Menunggu bukti terima' : null,
            ]);
            $this->laporan[] = $lap;

            // Genap
            $statusGen = $pkmStatuses[($lapIdx + 2) % count($pkmStatuses)];
            $lapGen = Laporan::create([
                'proposal_id' => $prop->proposal_id,
                'kegiatan_id' => $this->kegiatan['PROSES_PKM_GANJIL']->kegiatan_id,
                'semester' => 'Genap',
                'jenis_penelitian' => 'PkM',
                'judul_penelitian' => $prop->judul,
                'status' => $statusGen,
                'tgl_mulai' => '2026-02-01',
                'institusi_mitra' => $prop->institusi_mitra,
            ]);
            $this->laporan[] = $lapGen;

            $lapIdx++;
        }
    }

    // ════════════════════════════════════════════════════════════
    // LOGBOOK ENTRIES
    // ════════════════════════════════════════════════════════════
    protected function seedLogbookEntries(): void
    {
        $dalamPengerjaan = array_filter($this->laporan, fn($l) => $l->status === 'Dalam pengerjaan');
        $dalamPengerjaan = array_values($dalamPengerjaan);

        $logbookTitles = [
            ['judul' => 'Perencanaan Metodologi', 'deskripsi' => 'Menyusun metodologi penelitian dan melakukan studi literatur.', 'tanggal' => '2026-08-15'],
            ['judul' => 'Pengumpulan Data Primer', 'deskripsi' => 'Melakukan pengumpulan data di lapangan.', 'tanggal' => '2026-09-01'],
            ['judul' => 'Analisis Data', 'deskripsi' => 'Melakukan analisis data menggunakan teknik statistik.', 'tanggal' => '2026-09-15'],
            ['judul' => 'Penulisan Laporan', 'deskripsi' => 'Menyusun laporan hasil penelitian.', 'tanggal' => '2026-10-01'],
            ['judul' => 'Validasi Hasil', 'deskripsi' => 'Melakukan validasi hasil penelitian dengan pakar.', 'tanggal' => '2026-10-15'],
        ];

        foreach ($dalamPengerjaan as $lap) {
            $dosen = $this->dosen[0];
            $numEntries = rand(2, 4);
            for ($i = 0; $i < $numEntries; $i++) {
                $logEntry = $logbookTitles[$i % count($logbookTitles)];
                LogbookPengerjaan::create([
                    'laporan_id' => $lap->laporan_id,
                    'user_id' => $dosen->id,
                    'judul' => $logEntry['judul'],
                    'deskripsi' => $logEntry['deskripsi'],
                    'tgl_kegiatan' => $logEntry['tanggal'],
                ]);
            }
        }
    }

    // ════════════════════════════════════════════════════════════
    // AUTHORIZATION REQUESTS
    // ════════════════════════════════════════════════════════════
    protected function seedAuthorizationRequests(): void
    {
        // Pending return request on a laporan
        $dalamPengerjaan = array_filter($this->laporan, fn($l) => $l->status === 'Dalam pengerjaan' && $l->jenis_penelitian === 'Penelitian');
        $dalamPengerjaan = array_values($dalamPengerjaan);

        if (!empty($dalamPengerjaan[0])) {
            AuthorizationRequest::create([
                'requestable_type' => 'App\\Models\\Laporan',
                'requestable_id' => $dalamPengerjaan[0]->laporan_id,
                'requested_by' => $this->staff[0]->id,
                'action' => 'return_laporan_for_revision',
                'source_stage' => 'Dalam pengerjaan',
                'target_stage' => 'Revisi',
                'reason' => 'Laporan memerlukan revisi pada bagian metodologi.',
                'current_data' => json_encode(['status' => 'Dalam pengerjaan']),
                'proposed_data' => json_encode(['status' => 'Revisi']),
                'status' => 'Menunggu Persetujuan',
            ]);
        }

        // Pending reject request on a proposal
        $menungguStaff = array_filter($this->proposals, fn($p) => $p->status === 'Menunggu review Staff LPPM');
        $menungguStaff = array_values($menungguStaff);

        if (!empty($menungguStaff[0])) {
            AuthorizationRequest::create([
                'requestable_type' => 'App\\Models\\Proposal',
                'requestable_id' => $menungguStaff[0]->proposal_id,
                'requested_by' => $this->staff[0]->id,
                'action' => 'reject_proposal',
                'source_stage' => 'SELEKSI_PROPOSAL',
                'reason' => 'Proposal tidak memenuhi kriteria minimum.',
                'current_data' => json_encode(['status' => 'Menunggu review Staff LPPM']),
                'proposed_data' => json_encode(['status' => 'Ditolak']),
                'status' => 'Menunggu Persetujuan',
            ]);
        }

        // Approved historical request
        if (!empty($dalamPengerjaan[1])) {
            AuthorizationRequest::create([
                'requestable_type' => 'App\\Models\\Laporan',
                'requestable_id' => $dalamPengerjaan[1]->laporan_id,
                'requested_by' => $this->staff[1]->id,
                'action' => 'return_laporan_for_revision',
                'source_stage' => 'Dalam pengerjaan',
                'reason' => 'Revisi bagian anggaran.',
                'current_data' => json_encode(['status' => 'Dalam pengerjaan']),
                'proposed_data' => json_encode(['status' => 'Revisi']),
                'status' => 'Disetujui',
                'reviewed_by' => $this->ketua[0]->id,
                'reviewed_at' => $this->now,
                'review_note' => 'Disetujui untuk revisi.',
            ]);
        }
    }

    // ════════════════════════════════════════════════════════════
    // NOTIFICATIONS — realistic notification history
    // ════════════════════════════════════════════════════════════
    protected function seedNotifications(): void
    {
        $notificationTemplates = [
            // For Dosen
            ['user_idx' => 'dosen', 'type' => 'proposal_update', 'title' => 'Proposal Diterima', 'msg' => 'Proposal Anda telah diterima oleh Ketua LPPM.', 'key' => 'proposal-accepted', 'url' => '/dashboard?module=dosenmonitoringprogress'],
            ['user_idx' => 'dosen', 'type' => 'reviewer_assigned', 'title' => 'Reviewer Ditugaskan', 'msg' => 'Reviewer telah ditugaskan untuk menilai proposal Anda.', 'key' => 'reviewer-assigned', 'url' => '/dashboard?module=dosenmonitoringprogress'],
            ['user_idx' => 'dosen', 'type' => 'review_complete', 'title' => 'Review Selesai', 'msg' => 'Reviewer telah menyelesaikan penilaian proposal Anda.', 'key' => 'review-complete', 'url' => '/dashboard?module=dosenmonitoringprogress'],
            ['user_idx' => 'dosen', 'type' => 'proposal_returned', 'title' => 'Proposal Dikembalikan', 'msg' => 'Proposal Anda dikembalikan untuk perbaikan.', 'key' => 'proposal-returned', 'url' => '/dashboard?module=dosenmonitoringprogress'],
            ['user_idx' => 'dosen', 'type' => 'laporan_update', 'title' => 'Laporan Diperbarui', 'msg' => 'Status laporan Anda telah diperbarui.', 'key' => 'laporan-update', 'url' => '/dashboard?module=dosenmonitoringprogress'],
            ['user_idx' => 'dosen', 'type' => 'notification_read', 'title' => 'Pengumuman', 'msg' => 'Pengumuman penting dari LPPM.', 'key' => 'announcement-1', 'url' => '/dashboard?module=dosenmonitoringprogress', 'read' => true],

            // For Ketua
            ['user_idx' => 'ketua', 'type' => 'authorization_request', 'title' => 'Permintaan Otorisasi', 'msg' => 'Staff LPPM meminta otorisasi untuk revisi.', 'key' => 'auth-request-1', 'url' => '/dashboard?module=staffmonitoringprogress'],
            ['user_idx' => 'ketua', 'type' => 'proposal_submitted', 'title' => 'Proposal Baru', 'msg' => 'Proposal baru menunggu review.', 'key' => 'proposal-new', 'url' => '/dashboard?module=staffmonitoringprogress'],

            // For Staff
            ['user_idx' => 'staff', 'type' => 'reviewer_assigned', 'title' => 'Reviewer Ditugaskan', 'msg' => 'Reviewer telah ditugaskan ke proposal.', 'key' => 'staff-reviewer-assigned', 'url' => '/dashboard?module=staffmonitoringprogress'],
            ['user_idx' => 'staff', 'type' => 'review_complete', 'title' => 'Review Selesai', 'msg' => 'Semua reviewer telah menyelesaikan penilaian.', 'key' => 'staff-review-complete', 'url' => '/dashboard?module=staffmonitoringprogress'],

            // For Reviewer
            ['user_idx' => 'reviewer', 'type' => 'reviewer_assigned', 'title' => 'Penugasan Review', 'msg' => 'Anda ditugaskan untuk menilai proposal.', 'key' => 'reviewer-new-assignment', 'url' => '/dashboard?module=reviewproposal'],
            ['user_idx' => 'reviewer', 'type' => 'reminder', 'title' => 'Pengingat Review', 'msg' => 'Masih ada proposal yang belum Anda review.', 'key' => 'reviewer-reminder', 'url' => '/dashboard?module=reviewproposal'],
        ];

        foreach ($notificationTemplates as $t) {
            $userId = match($t['user_idx']) {
                'dosen' => $this->dosen[0]->id,
                'ketua' => $this->ketua[0]->id,
                'staff' => $this->staff[0]->id,
                'reviewer' => $this->reviewers[0]->id,
            };

            Notification::create([
                'user_id' => $userId,
                'type' => $t['type'],
                'title' => $t['title'],
                'message' => $t['msg'],
                'data' => json_encode(['notification_key' => $t['key']]),
                'action_url' => $t['url'],
                'key' => $t['key'] . '-' . $userId,
                'read_at' => isset($t['read']) ? $this->now : null,
            ]);
        }
    }

    // ════════════════════════════════════════════════════════════
    // PROPOSAL MEMBERS
    // ════════════════════════════════════════════════════════════
    protected function seedProposalMembers(): void
    {
        foreach ($this->proposals as $prop) {
            ProposalMember::create([
                'proposal_id' => $prop->proposal_id,
                'member_id' => $prop->user_id,
                'role' => 'Dosen',
                'semester' => 'Ganjil',
                'ttjp' => 'Ketua Tim Peneliti',
            ]);
        }
    }

    // ════════════════════════════════════════════════════════════
    // LAPORAN MEMBERS
    // ════════════════════════════════════════════════════════════
    protected function seedLaporanMembers(): void
    {
        foreach ($this->laporan as $lap) {
            $proposal = Proposal::find($lap->proposal_id);
            if ($proposal) {
                LaporanMember::create([
                    'laporan_id' => $lap->laporan_id,
                    'member_id' => $proposal->user_id,
                    'role' => 'Dosen',
                    'position' => 1,
                    'ttjp' => 'Ketua Tim Peneliti',
                ]);
            }
        }
    }

    // ════════════════════════════════════════════════════════════
    // PENELITI DETAILS — for Dosen profiles
    // ════════════════════════════════════════════════════════════
    protected function seedPenelitiDetails(): void
    {
        foreach ($this->dosen as $d) {
            \App\Models\PenelitiDetail::create([
                'user_id' => $d->id,
                'jabatan' => 'Dosen Tetap',
                'pangkat_golongan' => 'IV/a',
                'no_hp' => $d->no_hp,
                'h_index' => rand(3, 25),
            ]);
        }
    }

    // ════════════════════════════════════════════════════════════
    // MAHASISWA
    // ════════════════════════════════════════════════════════════
    protected function seedMahasiswa(): void
    {
        $mahasiswa = [
            ['nim' => '10820001', 'nama' => 'Rizky Pratama', 'email' => 'rizky@itbss.ac.id'],
            ['nim' => '10820002', 'nama' => 'Anisa Putri', 'email' => 'anisa@itbss.ac.id'],
            ['nim' => '10820003', 'nama' => 'Dimas Ardianto', 'email' => 'dimas@itbss.ac.id'],
            ['nim' => '10820004', 'nama' => 'Sari Dewi', 'email' => 'sari@itbss.ac.id'],
            ['nim' => '10820005', 'nama' => 'Fajar Nugroho', 'email' => 'fajar@itbss.ac.id'],
        ];

        foreach ($mahasiswa as $i => $m) {
            Mahasiswa::create([
                'nim' => $m['nim'],
                'nama' => $m['nama'],
                'email' => $m['email'],
                'prodi_id' => $this->prodi[$i % count($this->prodi)]->prodi_id,
            ]);
        }
    }
}
