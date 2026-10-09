<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Prodi;
use App\Models\Skema;
use App\Models\KegiatanPengajuan;
use App\Models\Settings;
use App\Models\PublicationCategory;
use App\Models\Mahasiswa;
use App\Models\Kolaborator;
use App\Models\PenelitiDetail;
use App\Models\Proposal;
use App\Models\ProposalMember;
use App\Models\Laporan;
use App\Models\LaporanMember;
use App\Models\PenugasanReviewer;
use App\Models\Review;
use App\Models\LogbookPengerjaan;
use App\Models\RealisasiAnggaran;
use App\Models\Dokumen;
use App\Models\DokumenVersion;
use App\Models\AuthorizationRequest;
use App\Models\Notification;
use App\Models\ScholarProfile;
use App\Models\ScholarCitationByYear;
use App\Models\ScholarPublication;
use App\Models\Publication;
use App\Models\ResearchHistory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SUSWorkflowSeeder extends Seeder
{
    private array $prodi = [];
    private array $skema = [];
    private array $kegiatan = [];
    private array $dosen = [];
    private array $staff = [];
    private array $ketua = [];
    private array $reviewers = [];
    private object $superadmin;
    private array $mahasiswa = [];
    private array $kolaborator = [];
    private int $notifCount = 0;
    private int $proposalCount = 0;
    private int $laporanCount = 0;
    private int $reviewCount = 0;
    private int $docCount = 0;
    private int $logbookCount = 0;

    private const PASSWORD = 'password';

    private array $topics = [
        'Kecerdasan Buatan', 'Internet of Things', 'Machine Learning', 'Data Mining',
        'Cyber Security', 'Cloud Computing', 'Big Data', 'Blockchain',
        'Computer Vision', 'Natural Language Processing', 'Robotics', 'Edge Computing',
    ];
    private array $bidang = [
        'Ilmu Komputer', 'Teknik Informatika', 'Sistem Informasi', 'Teknologi Informasi',
        'Bisnis Digital', 'Rekayasa Perangkat Lunak', 'Kedokteran', 'Pertanian',
    ];
    private array $sdgs = [
        'SDG 1: No Poverty', 'SDG 2: Zero Hunger', 'SDG 3: Good Health',
        'SDG 4: Quality Education', 'SDG 8: Decent Work', 'SDG 9: Industry Innovation',
        'SDG 11: Sustainable Cities', 'SDG 12: Responsible Consumption',
    ];

    public function run(): void
    {
        $this->command->info('Starting SUS Workflow Seeder...');

        $this->seedProdi();
        $this->seedUsers();
        $this->seedMasterData();
        $this->seedPenelitiDetails();
        $this->seedMahasiswaAndKolaborator();

        $this->seedPenelitianProposals();
        $this->seedPenelitianLaporans();

        $this->seedPkMProposals();
        $this->seedPkMLaporans();

        $this->seedTestDosen();

        $this->seedScholarProfiles();
        $this->seedNotifications();

        $this->printReport();
    }

    // ─── MASTER DATA ─────────────────────────────────────────────────

    private function seedProdi(): void
    {
        $names = [
            'Sistem Teknologi dan Informasi', 'Bisnis Digital', 'Kewirausahaan',
            'Informatika', 'Manajemen', 'Teknik Elektro', 'Desain Komunikasi Visual',
            'Kedokteran', 'Hukum', 'Teknik Mesin',
        ];
        foreach ($names as $name) {
            $p = Prodi::firstOrCreate(['nama_prodi' => $name]);
            $this->prodi[] = $p;
        }
        $this->command->info('Prodi: ' . count($this->prodi));
    }

    private function seedUsers(): void
    {
        $this->superadmin = User::firstOrCreate(
            ['email' => 'sus.superadmin@itbss.ac.id'],
            [
                'nama' => 'Superadmin Utama', 'password' => Hash::make(self::PASSWORD),
                'role' => 'Superadmin', 'status' => 'Aktif', 'gender' => 'L',
                'nidn' => '90001', 'no_hp' => '081234567801',
                'prodi_id' => $this->prodi[0]->prodi_id,
                'email_verified_at' => now(), 'remember_token' => Str::random(10),
            ]
        );

        for ($i = 0; $i < 2; $i++) {
            $this->staff[] = User::firstOrCreate(
                ['email' => "sus.staff{$i}@itbss.ac.id"],
                [
                    'nama' => "Staff LPPM " . ($i + 1), 'password' => Hash::make(self::PASSWORD),
                    'role' => 'Staff LPPM', 'status' => 'Aktif', 'gender' => $i % 2 === 0 ? 'L' : 'P',
                    'nidn' => 90010 + $i, 'no_hp' => "08123456781{$i}",
                    'prodi_id' => $this->prodi[$i]->prodi_id,
                    'email_verified_at' => now(), 'remember_token' => Str::random(10),
                ]
            );
        }

        $this->ketua[] = User::firstOrCreate(
            ['email' => 'sus.ketua@itbss.ac.id'],
            [
                'nama' => 'Ketua LPPM', 'password' => Hash::make(self::PASSWORD),
                'role' => 'Ketua LPPM', 'status' => 'Aktif', 'gender' => 'P',
                'nidn' => '90020', 'no_hp' => '081234567820',
                'prodi_id' => $this->prodi[0]->prodi_id,
                'email_verified_at' => now(), 'remember_token' => Str::random(10),
            ]
        );

        $dosenNames = [
            ['Dr. Ahmad Fauzi, M.Kom.', 'L'], ['Dr. Siti Rahmawati, S.T., M.T.', 'P'],
            ['Prof. Budi Santoso, Ph.D.', 'L'], ['Dr. Rina Wulandari, S.Kom., M.Kom.', 'P'],
            ['Dr. Hendra Kurniawan, S.T., M.T.', 'L'], ['Dr. Dewi Lestari, S.Pd., M.Pd.', 'P'],
            ['Dr. Agus Setiawan, S.Kom., M.Kom.', 'L'], ['Dr. Maya Anggraeni, S.E., M.M.', 'P'],
            ['Dr. Teguh Prasetyo, S.T., M.T.', 'L'], ['Dr. Nurul Hidayah, S.Pd., M.Pd.', 'P'],
            ['Dr. Eko Prasetyo, S.Kom., M.Kom.', 'L'], ['Dr. Lia Amalia, S.E., M.M.', 'P'],
            ['Dr. Wahyu Nugroho, S.T., M.T.', 'L'], ['Dr. Fitri Susanti, S.Kom., M.Kom.', 'P'],
            ['Dr. Rudi Hermawan, S.T., M.T.', 'L'], ['Dr. Citra Dewi, S.Pd., M.Pd.', 'P'],
        ];
        foreach ($dosenNames as $i => [$nama, $gender]) {
            $this->dosen[] = User::firstOrCreate(
                ['email' => "sus.dosen{$i}@itbss.ac.id"],
                [
                    'nama' => $nama, 'password' => Hash::make(self::PASSWORD),
                    'role' => 'Dosen', 'status' => 'Aktif', 'gender' => $gender,
                    'nidn' => 20000 + $i, 'no_hp' => "08123456783{$i}",
                    'prodi_id' => $this->prodi[$i % count($this->prodi)]->prodi_id,
                    'email_verified_at' => now(), 'remember_token' => Str::random(10),
                ]
            );
        }

        $reviewerNames = [
            ['Dr. Reviewer A, M.Kom.', 'L'], ['Dr. Reviewer B, M.T.', 'P'],
            ['Dr. Reviewer C, Ph.D.', 'L'], ['Dr. Reviewer D, S.Kom., M.Kom.', 'P'],
            ['Dr. Reviewer E, S.T., M.T.', 'L'], ['Dr. Reviewer F, M.Pd.', 'P'],
        ];
        foreach ($reviewerNames as $i => [$nama, $gender]) {
            $this->reviewers[] = User::firstOrCreate(
                ['email' => "sus.reviewer{$i}@itbss.ac.id"],
                [
                    'nama' => $nama, 'password' => Hash::make(self::PASSWORD),
                    'role' => 'Reviewer', 'status' => 'Aktif', 'gender' => $gender,
                    'nidn' => 30000 + $i, 'no_hp' => "08123456784{$i}",
                    'prodi_id' => $this->prodi[$i % count($this->prodi)]->prodi_id,
                    'email_verified_at' => now(), 'remember_token' => Str::random(10),
                ]
            );
        }

        $this->command->info('Users: 1 Superadmin, ' . count($this->staff) . ' Staff, ' . count($this->ketua) . ' Ketua, ' . count($this->dosen) . ' Dosen, ' . count($this->reviewers) . ' Reviewers');
    }

    private function seedMasterData(): void
    {
        $skemas = [
            ['nama_skema' => 'Penelitian Dosen Tetap 2026', 'tahun_ajaran' => '2025/2026', 'status' => 'Aktif'],
            ['nama_skema' => 'PkM Dosen Tetap 2026', 'tahun_ajaran' => '2025/2026', 'status' => 'Aktif'],
            ['nama_skema' => 'Penelitian Dosen Pemula 2026', 'tahun_ajaran' => '2025/2026', 'status' => 'Aktif'],
        ];
        foreach ($skemas as $data) {
            $s = Skema::firstOrCreate(['nama_skema' => $data['nama_skema']], $data);
            $this->skema[] = $s;
        }

        $this->seedPublicationCategories();

        $penelitianCodes = [
            'PENERIMAAN_PROPOSAL' => 'Penerimaan Proposal Penelitian',
            'SELEKSI_PROPOSAL' => 'Seleksi Proposal Penelitian',
            'PENGUMUMAN_SURAT_TUGAS' => 'Pengumuman Surat Tugas Penelitian',
            'PROSES_PENELITIAN_GANJIL' => 'Proses Penelitian Ganjil',
            'PROSES_PENELITIAN_GENAP' => 'Proses Penelitian Genap',
            'PUBLIKASI_GANJIL' => 'Publikasi Ganjil',
            'PUBLIKASI_GENAP' => 'Publikasi Genap',
            'DISEMINASI_GANJIL' => 'Diseminasi Ganjil',
            'DISEMINASI_GENAP' => 'Diseminasi Genap',
            'CLAIM_DANA_GANJIL' => 'Claim Dana Ganjil',
            'CLAIM_DANA_GENAP' => 'Claim Dana Genap',
            'LUARAN_PENELITIAN' => 'Luaran Penelitian',
        ];
        $pkmCodes = [
            'CLAIM_DANA_PKM_GANJIL' => 'Claim Dana PkM Ganjil',
            'CLAIM_DANA_PKM_GENAP' => 'Claim Dana PkM Genap',
            'PROSES_PKM_GANJIL' => 'Proses PkM Ganjil',
            'PROSES_PKM_GENAP' => 'Proses PkM Genap',
            'PUBLIKASI_PKM_GANJIL' => 'Publikasi PkM Ganjil',
            'PUBLIKASI_PKM_GENAP' => 'Publikasi PkM Genap',
            'PENGEMBALIAN_DANA_GANJIL' => 'Pengembalian Dana PkM Ganjil',
            'PENGEMBALIAN_DANA_GENAP' => 'Pengembalian Dana PkM Genap',
            'DISEMINASI_PKM_GANJIL' => 'Diseminasi PkM Ganjil',
            'DISEMINASI_PKM_GENAP' => 'Diseminasi PkM Genap',
            'LUARAN_PKM' => 'Luaran PkM',
        ];

        foreach ($this->skema as $sk) {
            $allCodes = array_merge($penelitianCodes, $pkmCodes);
            foreach ($allCodes as $code => $nama) {
                $jenis = str_contains($code, 'PKM') || str_contains($code, 'LUARAN_PKM') ? 'PkM' : 'Penelitian';
                if ($code === 'LUARAN_PENELITIAN') $jenis = 'Penelitian';
                $this->kegiatan[$sk->skema_id][$code] = KegiatanPengajuan::firstOrCreate(
                    ['skema_id' => $sk->skema_id, 'jenis_penelitian' => $jenis, 'kode_kegiatan' => $code],
                    [
                        'nama_kegiatan' => $nama, 'tgl_mulai' => '2026-01-01', 'tgl_selesai' => '2026-12-31',
                        'status' => 'Terbuka', 'manual_status_override' => true,
                    ]
                );
            }
        }

        Settings::firstOrCreate([], [
            'kepala_lppm' => $this->ketua[0]->id,
            'nama_kampus' => 'ITB Sangga Buana',
            'ignore_kegiatan_dates' => true,
            'kriteria_penilaian' => [
                ['kriteria' => 'Kesesuaian Tema', 'bobot' => 30],
                ['kriteria' => 'Metodologi', 'bobot' => 30],
                ['kriteria' => 'Timeline', 'bobot' => 20],
                ['kriteria' => 'Anggaran', 'bobot' => 20],
            ],
            'list_kesesuaian_tema' => ['Sangat Sesuai', 'Sesuai', 'Cukup Sesuai', 'Kurang Sesuai'],
        ]);

        $this->command->info('Master Data: ' . count($this->skema) . ' Skema, ' . count($this->kegiatan[$this->skema[0]->skema_id] ?? []) . ' Kegiatan per Skema');
    }

    private function seedPublicationCategories(): void
    {
        $cats = [
            ['nama' => 'Scopus', 'peringkat' => ['Q1', 'Q2', 'Q3', 'Q4'], 'urutan' => 1],
            ['nama' => 'SINTA', 'peringkat' => ['Sinta 1', 'Sinta 2', 'Sinta 3', 'Sinta 4', 'Sinta 5', 'Sinta 6'], 'urutan' => 2],
            ['nama' => 'Google Scholar', 'peringkat' => ['Q1', 'Q2', 'Q3', 'Q4'], 'urutan' => 3],
            ['nama' => 'Web of Science', 'peringkat' => ['Q1', 'Q2', 'Q3', 'Q4'], 'urutan' => 4],
            ['nama' => 'DOAJ', 'peringkat' => ['Indexed', 'Not Indexed'], 'urutan' => 5],
        ];
        foreach ($cats as $c) {
            PublicationCategory::firstOrCreate(['nama' => $c['nama']], [
                'peringkat' => $c['peringkat'], 'urutan' => $c['urutan'], 'is_active' => true,
            ]);
        }
    }

    private function seedPenelitiDetails(): void
    {
        foreach ($this->dosen as $d) {
            PenelitiDetail::firstOrCreate(['user_id' => $d->id], [
                'jabatan' => 'Dosen Tetap', 'pangkat_golongan' => 'III/c',
                'sinta_id' => 'S' . rand(10000, 99999),
            ]);
        }
    }

    private function seedMahasiswaAndKolaborator(): void
    {
        $mhswNames = ['Ahmad Rizki', 'Siti Nurhaliza', 'Budi Prasetyo', 'Dewi Kartika', 'Eko Firmansyah'];
        foreach ($mhswNames as $i => $nama) {
            $this->mahasiswa[] = Mahasiswa::firstOrCreate(
                ['nim' => 10820001 + $i],
                ['nama' => $nama, 'prodi_id' => $this->prodi[$i % count($this->prodi)]->prodi_id]
            );
        }

        $kolabData = [
            ['nama' => 'Dr. Kolaborator A', 'institusi' => 'Universitas Nasional', 'prodi' => 'Teknologi Informasi'],
            ['nama' => 'Dr. Kolaborator B', 'institusi' => 'Universitas Terbuka', 'prodi' => 'Bisnis Digital'],
            ['nama' => 'Dr. Kolaborator C', 'institusi' => 'Institut Teknologi', 'prodi' => 'Kewirausahaan'],
        ];
        foreach ($kolabData as $i => $kd) {
            $this->kolaborator[] = Kolaborator::firstOrCreate(
                ['email' => "sus.kolab{$i}@external.ac.id"],
                array_merge($kd, ['no_hp' => '08213456789' . $i, 'nidn' => 40000 + $i])
            );
        }
    }

    // ─── HELPER: Kegiatan lookup ─────────────────────────────────────

    private function keg(string $kode, ?int $skemaId = null): KegiatanPengajuan
    {
        $sid = $skemaId ?? $this->skema[0]->skema_id;
        return $this->kegiatan[$sid][$kode] ?? KegiatanPengajuan::where('kode_kegiatan', $kode)->firstOrFail();
    }

    private function dosen(int $index): User
    {
        return $this->dosen[$index % count($this->dosen)];
    }

    private function reviewer(int $index): User
    {
        return $this->reviewers[$index % count($this->reviewers)];
    }

    // ─── HELPER: Create proposal ─────────────────────────────────────

    private function createProposal(
        User $owner,
        string $jenis,
        string $status,
        string $kodeKegiatan,
        string $judul,
        ?string $tahap = 'Proposal',
        bool $ketuaOk = false,
        bool $staffOk = false,
    ): Proposal {
        return Proposal::create([
            'user_id' => $owner->id,
            'jenis_penelitian' => $jenis,
            'jenis_penelitian_gan' => $jenis,
            'jenis_penelitian_gen' => $jenis,
            'judul' => $judul,
            'tahap_penelitian' => $tahap,
            'topik_penelitian' => fake()->randomElement($this->topics),
            'bidang_ilmu' => fake()->randomElement($this->bidang),
            'fokus_sdg' => fake()->randomElement($this->sdgs),
            'skema' => 'Internal',
            'sumber_skema' => 'Dana Internal',
            'kegiatan_id' => $this->keg($kodeKegiatan)->kegiatan_id,
            'status' => $status,
            'ketua_seleksi_approved' => $ketuaOk,
            'staff_seleksi_approved' => $staffOk,
            'tgl_pengajuan' => now()->subDays(rand(5, 60))->toDateString(),
            'ra_biaya_penelitian_gan' => rand(5000000, 50000000),
            'ra_biaya_publikasi_gan' => rand(2000000, 15000000),
            'ra_insentif_gan' => rand(1000000, 5000000),
            'ra_biaya_penelitian_gen' => rand(5000000, 50000000),
            'ra_biaya_publikasi_gen' => rand(2000000, 15000000),
            'ra_insentif_gen' => rand(1000000, 5000000),
            'target_publikasi_gan' => fake()->randomElement(['SCOPUS Q1', 'SCOPUS Q2', 'SCOPUS Q3', 'SCOPUS Q4', 'SINTA 1', 'SINTA 2', 'SINTA 3', 'SINTA 4', 'SINTA 5', 'SINTA 6']),
            'target_publikasi_gen' => fake()->randomElement(['SCOPUS Q1', 'SCOPUS Q2', 'SCOPUS Q3', 'SCOPUS Q4', 'SINTA 1', 'SINTA 2', 'SINTA 3', 'SINTA 4', 'SINTA 5', 'SINTA 6']),
            'rencana_judul_publikasi_gan' => $judul . ' - Publikasi Ganjil',
            'rencana_judul_publikasi_gen' => $judul . ' - Publikasi Genap',
            'metopen_gan' => 'Mixed Methods',
            'metopen_gen' => 'Mixed Methods',
            'unit_analisis_gan' => 'Sample Penelitian',
            'unit_analisis_gen' => 'Sample Penelitian',
            'kontribusi_ilmu_makul' => 'Kontribusi Ilmu',
            'kontribusi_pkm' => 'Kontribusi PkM',
            'rencana_luaran' => 'Jurnal Internasional',
            'institusi_mitra' => 'PT. Teknologi Nusantara',
        ]);
    }

    private function addProposalMembers(Proposal $proposal): void
    {
        ProposalMember::create([
            'proposal_id' => $proposal->proposal_id, 'member_id' => $proposal->user_id,
            'role' => 'Dosen', 'semester' => 'Ganjil', 'ttjp' => 'Ketua Tim Peneliti',
        ]);
        if (rand(0, 1)) {
            ProposalMember::create([
                'proposal_id' => $proposal->proposal_id,
                'member_id' => $this->mahasiswa[array_rand($this->mahasiswa)]->mhswa_id,
                'role' => 'Mahasiswa', 'semester' => 'Ganjil', 'ttjp' => 'Asisten Riset',
            ]);
        }
    }

    private function addProposalDocument(Proposal $proposal, string $jenis = 'Dokumen Proposal'): void
    {
        $path = $this->createDummyPdf('proposal', $proposal->judul);
        $d = Dokumen::create([
            'documentable_id' => $proposal->proposal_id,
            'documentable_type' => Proposal::class,
            'jenis_dokumen' => $jenis,
        ]);
        $v = DokumenVersion::create([
            'dokumen_id' => $d->dokumen_id, 'uploaded_by' => $proposal->user_id,
            'version' => 1, 'nama_file' => basename($path),
            'local_file_url' => $path, 'drive_file_id' => '', 'drive_file_url' => '',
            'tgl_upload' => now()->subDays(rand(1, 10))->toDateTimeString(),
        ]);
        $d->update(['current_version_id' => $v->version_id]);
        $this->docCount++;
    }

    private function attachReviewersToProposal(Proposal $proposal, bool $allReviewed = false): array
    {
        $existing = PenugasanReviewer::where('reviewable_type', Proposal::class)
            ->where('reviewable_id', $proposal->proposal_id)
            ->count();
        if ($existing >= 3) return [];

        $assignments = [];
        for ($i = $existing; $i < 3; $i++) {
            $done = $allReviewed || ($i < 2 && rand(0, 1));
            $a = PenugasanReviewer::create([
                'reviewable_type' => Proposal::class,
                'reviewable_id' => $proposal->proposal_id,
                'proposal_id' => $proposal->proposal_id,
                'user_id' => $this->reviewer($i + ($proposal->proposal_id % 3))->id,
                'tgl_penugasan' => now()->subDays(rand(1, 5))->toDateString(),
                'status_review' => $done ? 'Telah direview' : 'Belum direview',
            ]);
            $assignments[] = $a;
            if ($done) {
                $this->createReview($a);
            }
        }
        return $assignments;
    }

    private function createReview(PenugasanReviewer $assignment): void
    {
        $bobot = [
            ['kriteria' => 'Kesesuaian Tema', 'bobot' => 30],
            ['kriteria' => 'Metodologi', 'bobot' => 30],
            ['kriteria' => 'Timeline', 'bobot' => 20],
            ['kriteria' => 'Anggaran', 'bobot' => 20],
        ];
        $kriteria = array_map(fn($b) => array_merge($b, ['skor' => rand(60, 95), 'nilai' => $b['bobot'] * rand(60, 95) / 100]), $bobot);

        $kTema = array_map(fn($t) => ['question' => $t, 'checked' => rand(0, 1)], ['Sangat Sesuai', 'Sesuai', 'Cukup Sesuai']);

        Review::create([
            'penugasan_id' => $assignment->penugasan_id,
            'keputusan' => fake()->randomElement(['Diterima', 'Diterima', 'Diterima dengan perbaikan']),
            'kriteria_penilaian' => $kriteria,
            'kriteria_kesesuaian_tema' => $kTema,
            'catatan' => fake()->sentence(10),
            'tgl_review' => now()->subDays(rand(1, 3))->toDateString(),
        ]);
        $this->reviewCount++;
    }

    private function createDummyPdf(string $folder, string $name): string
    {
        $slug = Str::slug(Str::limit($name, 50));
        $filename = "{$slug}_" . now()->format('Ymd') . '_' . Str::random(6) . ".pdf";
        $path = "documents/{$folder}/{$filename}";

        $pdf = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
            . "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
            . "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n"
            . "xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n"
            . "trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF";

        Storage::disk('public')->put($path, $pdf);
        return $path;
    }

    // ─── HELPER: Create laporan ──────────────────────────────────────

    private function createLaporan(
        Proposal $proposal,
        string $semester,
        string $kodeKegiatan,
        string $status,
        array $overrides = []
    ): Laporan {
        $skemaId = $proposal->kegiatan->skema_id ?? $this->skema[0]->skema_id;
        return Laporan::updateOrCreate(
            ['proposal_id' => $proposal->proposal_id, 'semester' => $semester],
            array_merge([
                'kegiatan_id' => $this->keg($kodeKegiatan, $skemaId)->kegiatan_id,
                'jenis_penelitian' => $proposal->jenis_penelitian,
                'judul_penelitian' => $proposal->judul,
                'status' => $status,
                'tgl_mulai' => now()->subDays(rand(10, 90))->toDateString(),
                'tgl_submit' => now()->subDays(rand(1, 9))->toDateString(),
                'metode_penelitian' => 'Mixed Methods',
                'unit_analisis' => 'Sample Penelitian',
                'target_publikasi' => 'Scopus Q2',
                'institusi_mitra' => 'PT. Teknologi Nusantara',
            ], $overrides)
        );
    }

    private function addLaporanMembers(Laporan $laporan, int $dosenUserId): void
    {
        LaporanMember::create([
            'laporan_id' => $laporan->laporan_id, 'member_id' => $dosenUserId,
            'role' => 'Dosen', 'position' => 1, 'ttjp' => 'Ketua Tim',
        ]);
    }

    private function addLogbooks(Laporan $laporan, int $userId, int $count = 3): void
    {
        for ($i = 1; $i <= $count; $i++) {
            LogbookPengerjaan::create([
                'laporan_id' => $laporan->laporan_id, 'user_id' => $userId,
                'judul' => "Logbook ke-{$i}",
                'deskripsi' => "Aktivitas penelitian minggu ke-{$i}: " . fake()->sentence(8),
                'tgl_kegiatan' => now()->subDays(rand(1, 30))->toDateString(),
            ]);
            $this->logbookCount++;
        }
    }

    private function addRealisasiAnggaran(Laporan $laporan, int $count = 3): void
    {
        $items = ['Buku Referensi', 'Peralatan Laboratorium', 'Bahan Habis Pakai', 'Transportasi', 'Akses Jurnal'];
        for ($i = 0; $i < $count; $i++) {
            RealisasiAnggaran::create([
                'laporan_id' => $laporan->laporan_id,
                'item_kebutuhan' => $items[array_rand($items)],
                'satuan' => fake()->randomElement(['pcs', 'unit', 'liter', 'kg']),
                'jumlah_item' => rand(1, 10),
                'harga_satuan' => rand(50000, 2000000),
            ]);
        }
    }

    private function attachReviewersToLaporan(Laporan $laporan, bool $allReviewed = false): void
    {
        $existing = PenugasanReviewer::where('reviewable_type', Laporan::class)
            ->where('reviewable_id', $laporan->laporan_id)
            ->count();
        if ($existing >= 3) return;

        for ($i = $existing; $i < 3; $i++) {
            $done = $allReviewed || ($i < 1 && rand(0, 1));
            $a = PenugasanReviewer::create([
                'reviewable_type' => Laporan::class,
                'reviewable_id' => $laporan->laporan_id,
                'proposal_id' => $laporan->proposal_id,
                'user_id' => $this->reviewer($i + ($laporan->laporan_id % 3))->id,
                'tgl_penugasan' => now()->subDays(rand(1, 5))->toDateString(),
                'status_review' => $done ? 'Telah direview' : 'Belum direview',
            ]);
            if ($done) {
                $this->createReview($a);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // PENELITIAN SCENARIOS
    // ═══════════════════════════════════════════════════════════════════

    private function seedPenelitianProposals(): void
    {
        $skemaId = $this->skema[0]->skema_id;

        // ── Snapshot 1: Draft (3 proposals) ──
        for ($i = 0; $i < 3; $i++) {
            $p = $this->createProposal($this->dosen($i), 'Penelitian', 'Draft', 'PENERIMAAN_PROPOSAL', 'Draft Penelitian #' . ($i + 1));
            $this->addProposalMembers($p);
            $this->proposalCount++;
        }

        // ── Snapshot 2: Menunggu proposal untuk diupload (2) ──
        for ($i = 0; $i < 2; $i++) {
            $p = $this->createProposal($this->dosen(3 + $i), 'Penelitian', 'Menunggu proposal untuk diupload', 'PENERIMAAN_PROPOSAL', 'Submitted Penelitian #' . ($i + 1));
            $this->addProposalMembers($p);
            $this->proposalCount++;
        }

        // ── Snapshot 3: Menunggu review dari Ketua LPPM (3) ──
        for ($i = 0; $i < 3; $i++) {
            $p = $this->createProposal($this->dosen(5 + $i), 'Penelitian', 'Menunggu review dari Ketua LPPM', 'SELEKSI_PROPOSAL', 'Uploaded Penelitian #' . ($i + 1), 'Proposal', false, true);
            $this->addProposalMembers($p);
            $this->addProposalDocument($p);
            $this->proposalCount++;
        }

        // ── Snapshot 4: Menunggu review Staff LPPM (2) ──
        for ($i = 0; $i < 2; $i++) {
            $p = $this->createProposal($this->dosen(8 + $i), 'Penelitian', 'Menunggu review Staff LPPM', 'SELEKSI_PROPOSAL', 'Staff-Screening Penelitian #' . ($i + 1), 'Proposal', false, false);
            $this->addProposalMembers($p);
            $this->addProposalDocument($p);
            $this->proposalCount++;
        }

        // ── Snapshot 5: Menunggu penugasan reviewer (2) ──
        for ($i = 0; $i < 2; $i++) {
            $p = $this->createProposal($this->dosen(10 + $i), 'Penelitian', 'Menunggu penugasan reviewer', 'SELEKSI_PROPOSAL', 'Staff-Approved Penelitian #' . ($i + 1), 'Proposal', true, true);
            $this->addProposalMembers($p);
            $this->addProposalDocument($p);
            $this->proposalCount++;
        }

        // ── Snapshot 6: Menunggu review (2) — reviewers assigned, some reviewed ──
        for ($i = 0; $i < 2; $i++) {
            $p = $this->createProposal($this->dosen(12 + $i), 'Penelitian', 'Menunggu review', 'SELEKSI_PROPOSAL', 'Reviewing Penelitian #' . ($i + 1), 'Proposal', true, true);
            $this->addProposalMembers($p);
            $this->addProposalDocument($p);
            $this->attachReviewersToProposal($p, false);
            $this->proposalCount++;
        }

        // ── Snapshot 7: Menunggu persetujuan Ketua LPPM (2) — all reviews done ──
        for ($i = 0; $i < 2; $i++) {
            $p = $this->createProposal($this->dosen(14 + $i), 'Penelitian', 'Menunggu persetujuan Ketua LPPM', 'SELEKSI_PROPOSAL', 'Reviewed Penelitian #' . ($i + 1), 'Proposal', true, true);
            $this->addProposalMembers($p);
            $this->addProposalDocument($p);
            $this->attachReviewersToProposal($p, true);
            $this->proposalCount++;
        }

        // ── Snapshot 8: Proposal Diterima (5) — with laporans ──
        for ($i = 0; $i < 5; $i++) {
            $p = $this->createProposal($this->dosen($i), 'Penelitian', 'Proposal Diterima', 'PENGUMUMAN_SURAT_TUGAS', 'Accepted Penelitian #' . ($i + 1), 'Laporan', true, true);
            $this->addProposalMembers($p);
            $this->addProposalDocument($p);
            $this->addProposalDocument($p, 'Pengumuman Surat Tugas');
            $this->attachReviewersToProposal($p, true);
            $this->proposalCount++;
        }

        // ── Snapshot 9: Ditolak (2) ──
        for ($i = 0; $i < 2; $i++) {
            $p = $this->createProposal($this->dosen(5 + $i), 'Penelitian', 'Ditolak', 'SELEKSI_PROPOSAL', 'Rejected Penelitian #' . ($i + 1), 'Proposal', true, true);
            $this->addProposalMembers($p);
            $this->addProposalDocument($p);
            $this->attachReviewersToProposal($p, true);
            $this->proposalCount++;
        }

        // ── Snapshot 10: Revisi (2) ──
        for ($i = 0; $i < 2; $i++) {
            $p = $this->createProposal($this->dosen(8 + $i), 'Penelitian', 'Revisi', 'SELEKSI_PROPOSAL', 'Revision Penelitian #' . ($i + 1), 'Proposal', true, true);
            $this->addProposalMembers($p);
            $this->addProposalDocument($p);
            $this->attachReviewersToProposal($p, true);
            $this->proposalCount++;
        }

        $this->command->info("Penelitian Proposals: {$this->proposalCount}");
    }

    // ═══════════════════════════════════════════════════════════════════
    // PENELITIAN LAPORANS — cover every laporan status
    // ═══════════════════════════════════════════════════════════════════

    private function seedPenelitianLaporans(): void
    {
        $lapCount = 0;

        $ganjilScenarios = [
            ['Belum dimulai', 'PROSES_PENELITIAN_GANJIL', []],
            ['Dalam pengerjaan', 'PROSES_PENELITIAN_GANJIL', []],
            ['Menunggu kelengkapan data', 'PUBLIKASI_GANJIL', ['tgl_submit' => now()->subDays(2)->toDateString()]],
            ['Menunggu review Admin', 'DISEMINASI_GANJIL', ['link_laporan_akhir' => 'https://drive.google.com/file/d/sample', 'ketua_diseminasi_approved' => 0, 'staff_diseminasi_approved' => 0]],
            ['Menunggu review Staff LPPM', 'DISEMINASI_GANJIL', ['ketua_diseminasi_approved' => 0, 'staff_diseminasi_approved' => 0]],
            ['Menunggu review dari Ketua LPPM', 'DISEMINASI_GANJIL', ['ketua_diseminasi_approved' => 0, 'staff_diseminasi_approved' => 1]],
            ['Menuggu penugasan Reviewer', 'DISEMINASI_GANJIL', ['ketua_diseminasi_approved' => 1, 'staff_diseminasi_approved' => 1]],
            ['Menunggu hasil dari Reviewers', 'DISEMINASI_GANJIL', ['ketua_diseminasi_approved' => 1, 'staff_diseminasi_approved' => 1]],
            ['Menunggu keputusan Ketua', 'DISEMINASI_GANJIL', ['ketua_diseminasi_approved' => 1, 'staff_diseminasi_approved' => 1]],
            ['Menunggu konfirmasi pengiriman dana', 'CLAIM_DANA_GANJIL', ['claim_dana_status' => 'Menunggu bukti terima', 'dana_disetujui' => 1]],
            ['Menunggu konfirmasi penerimaan dana', 'CLAIM_DANA_GANJIL', ['claim_dana_status' => 'Menunggu konfirmasi admin', 'dana_disetujui' => 1]],
            ['Revisi', 'PUBLIKASI_GANJIL', ['catatan' => 'Perlu perbaikan metodologi']],
            ['Selesai', 'CLAIM_DANA_GANJIL', ['completed_at' => now()->subDays(2), 'claim_dana_status' => 'Selesai', 'pengembalian_dana_status' => 'Selesai', 'dana_disetujui' => 1, 'link_laporan_akhir' => 'https://drive.google.com/file/d/selesai']],
        ];

        foreach ($ganjilScenarios as $i => [$status, $kode, $overrides]) {
            $proposal = $this->createDedicatedAcceptedProposal('Penelitian', 'Laporan Ganjil Penelitian #' . ($i + 1));

            $lap = $this->createLaporan($proposal, 'Ganjil', $kode, $status, $overrides);
            $this->addLaporanMembers($lap, $proposal->user_id);
            $lapCount++;

            if (in_array($status, ['Dalam pengerjaan'])) {
                $this->addLogbooks($lap, $proposal->user_id);
            }
            if (in_array($status, ['Selesai', 'Menunggu konfirmasi penerimaan dana'])) {
                $this->addRealisasiAnggaran($lap);
            }
            if ($status === 'Menunggu hasil dari Reviewers') {
                $this->attachReviewersToLaporan($lap, false);
            }
            if ($status === 'Menunggu keputusan Ketua') {
                $this->attachReviewersToLaporan($lap, true);
            }
        }

        $genapScenarios = [
            ['Belum dimulai', 'PROSES_PENELITIAN_GENAP', []],
            ['Dalam pengerjaan', 'PROSES_PENELITIAN_GENAP', []],
            ['Selesai', 'CLAIM_DANA_GENAP', ['completed_at' => now()->subDays(1), 'claim_dana_status' => 'Selesai', 'pengembalian_dana_status' => 'Selesai', 'dana_disetujui' => 1]],
        ];
        foreach ($genapScenarios as $i => [$status, $kode, $overrides]) {
            $proposal = $this->createDedicatedAcceptedProposal('Penelitian', 'Laporan Genap Penelitian #' . ($i + 1));

            $lap = $this->createLaporan($proposal, 'Genap', $kode, $status, $overrides);
            $this->addLaporanMembers($lap, $proposal->user_id);
            $lapCount++;

            if ($status === 'Dalam pengerjaan') {
                $this->addLogbooks($lap, $proposal->user_id);
            }
            if ($status === 'Selesai') {
                $this->addRealisasiAnggaran($lap);
            }
        }

        $this->laporanCount += $lapCount;
        $this->command->info("Penelitian Laporans: {$lapCount}");
    }

    private function createDedicatedAcceptedProposal(string $jenis, string $judul, ?User $owner = null): Proposal
    {
        $p = $this->createProposal($owner ?? $this->dosen(rand(0, count($this->dosen) - 1)), $jenis, 'Proposal Diterima', 'PENGUMUMAN_SURAT_TUGAS', $judul, 'Laporan', true, true);
        $this->addProposalMembers($p);
        $this->addProposalDocument($p, 'Pengumuman Surat Tugas');
        $this->attachReviewersToProposal($p, true);
        $this->proposalCount++;
        return $p;
    }

    // ═══════════════════════════════════════════════════════════════════
    // PKM SCENARIOS
    // ═══════════════════════════════════════════════════════════════════

    private function seedPkMProposals(): void
    {
        $pkmStart = $this->proposalCount;

        // Draft
        for ($i = 0; $i < 2; $i++) {
            $p = $this->createProposal($this->dosen(11 + $i), 'PkM', 'Draft', 'PENERIMAAN_PROPOSAL', 'Draft PkM #' . ($i + 1));
            $this->addProposalMembers($p);
            $this->proposalCount++;
        }

        // Uploaded
        for ($i = 0; $i < 2; $i++) {
            $p = $this->createProposal($this->dosen(13 + $i), 'PkM', 'Menunggu review dari Ketua LPPM', 'SELEKSI_PROPOSAL', 'Uploaded PkM #' . ($i + 1), 'Proposal', false, true);
            $this->addProposalMembers($p);
            $this->addProposalDocument($p);
            $this->proposalCount++;
        }

        // Reviewing
        $p = $this->createProposal($this->dosen(15), 'PkM', 'Menunggu review', 'SELEKSI_PROPOSAL', 'Reviewing PkM #1', 'Proposal', true, true);
        $this->addProposalMembers($p);
        $this->addProposalDocument($p);
        $this->attachReviewersToProposal($p, false);
        $this->proposalCount++;

        // Accepted
        for ($i = 0; $i < 4; $i++) {
            $p = $this->createProposal($this->dosen($i + 4), 'PkM', 'Proposal Diterima', 'PENGUMUMAN_SURAT_TUGAS', 'Accepted PkM #' . ($i + 1), 'Laporan', true, true);
            $this->addProposalMembers($p);
            $this->addProposalDocument($p);
            $this->addProposalDocument($p, 'Pengumuman Surat Tugas');
            $this->attachReviewersToProposal($p, true);
            $this->proposalCount++;
        }

        // Ditolak
        $p = $this->createProposal($this->dosen(10), 'PkM', 'Ditolak', 'SELEKSI_PROPOSAL', 'Rejected PkM #1', 'Proposal', true, true);
        $this->addProposalMembers($p);
        $this->addProposalDocument($p);
        $this->attachReviewersToProposal($p, true);
        $this->proposalCount++;

        $this->command->info("PkM Proposals: " . ($this->proposalCount - $pkmStart));
    }

    private function seedPkMLaporans(): void
    {
        $lapCount = 0;

        $ganjilScenarios = [
            ['Belum dimulai', 'CLAIM_DANA_PKM_GANJIL', []],
            ['Dalam pengerjaan', 'PROSES_PKM_GANJIL', []],
            ['Menunggu kelengkapan data', 'PUBLIKASI_PKM_GANJIL', ['tgl_submit' => now()->subDays(2)->toDateString()]],
            ['Menunggu review Admin', 'DISEMINASI_PKM_GANJIL', ['link_laporan_akhir' => 'https://drive.google.com/file/d/pkm-sample', 'ketua_diseminasi_approved' => 0, 'staff_diseminasi_approved' => 0]],
            ['Menunggu review Staff LPPM', 'DISEMINASI_PKM_GANJIL', ['ketua_diseminasi_approved' => 0, 'staff_diseminasi_approved' => 0]],
            ['Menunggu review dari Ketua LPPM', 'DISEMINASI_PKM_GANJIL', ['ketua_diseminasi_approved' => 0, 'staff_diseminasi_approved' => 1]],
            ['Menuggu penugasan Reviewer', 'DISEMINASI_PKM_GANJIL', ['ketua_diseminasi_approved' => 1, 'staff_diseminasi_approved' => 1]],
            ['Menunggu hasil dari Reviewers', 'DISEMINASI_PKM_GANJIL', ['ketua_diseminasi_approved' => 1, 'staff_diseminasi_approved' => 1]],
            ['Menunggu keputusan Ketua', 'DISEMINASI_PKM_GANJIL', ['ketua_diseminasi_approved' => 1, 'staff_diseminasi_approved' => 1]],
            ['Revisi', 'PUBLIKASI_PKM_GANJIL', ['catatan' => 'Perlu perbaikan laporan PkM']],
            ['Selesai', 'DISEMINASI_PKM_GANJIL', ['completed_at' => now()->subDays(3), 'dana_disetujui' => 1, 'link_laporan_akhir' => 'https://drive.google.com/file/d/pkm-selesai']],
        ];

        foreach ($ganjilScenarios as $i => [$status, $kode, $overrides]) {
            $proposal = $this->createDedicatedAcceptedProposal('PkM', 'Laporan Ganjil PkM #' . ($i + 1));

            $lap = $this->createLaporan($proposal, 'Ganjil', $kode, $status, $overrides);
            $this->addLaporanMembers($lap, $proposal->user_id);
            $lapCount++;

            if (in_array($status, ['Dalam pengerjaan'])) {
                $this->addLogbooks($lap, $proposal->user_id, 2);
            }
            if ($status === 'Selesai') {
                $this->addRealisasiAnggaran($lap);
            }
            if ($status === 'Menunggu hasil dari Reviewers') {
                $this->attachReviewersToLaporan($lap, false);
            }
            if ($status === 'Menunggu keputusan Ketua') {
                $this->attachReviewersToLaporan($lap, true);
            }
        }

        $genapScenarios = [
            ['Belum dimulai', 'CLAIM_DANA_PKM_GENAP', []],
            ['Dalam pengerjaan', 'PROSES_PKM_GENAP', []],
            ['Selesai', 'DISEMINASI_PKM_GENAP', ['completed_at' => now()->subDays(2), 'dana_disetujui' => 1]],
        ];
        foreach ($genapScenarios as $i => [$status, $kode, $overrides]) {
            $proposal = $this->createDedicatedAcceptedProposal('PkM', 'Laporan Genap PkM #' . ($i + 1));

            $lap = $this->createLaporan($proposal, 'Genap', $kode, $status, $overrides);
            $this->addLaporanMembers($lap, $proposal->user_id);
            $lapCount++;

            if ($status === 'Dalam pengerjaan') {
                $this->addLogbooks($lap, $proposal->user_id, 2);
            }
            if ($status === 'Selesai') {
                $this->addRealisasiAnggaran($lap);
            }
        }

        $this->laporanCount += $lapCount;
        $this->command->info("PkM Laporans: {$lapCount}");
    }

    // ═══════════════════════════════════════════════════════════════════
    // SCHOLAR PROFILES
    // ═══════════════════════════════════════════════════════════════════
    // TEST DOSEN — all tahap/status combos, 2-3 records each
    // ═══════════════════════════════════════════════════════════════════

    private function seedTestDosen(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'sus.testdosen@itbss.ac.id'],
            [
                'nama' => 'Dosen Testing Lengkap', 'password' => Hash::make(self::PASSWORD),
                'role' => 'Dosen', 'status' => 'Aktif', 'gender' => 'L',
                'nidn' => '99001', 'no_hp' => '081234567899',
                'prodi_id' => $this->prodi[0]->prodi_id,
                'email_verified_at' => now(), 'remember_token' => Str::random(10),
            ]
        );
        PenelitiDetail::firstOrCreate(['user_id' => $user->id], [
            'jabatan' => 'Dosen Tetap', 'pangkat_golongan' => 'IV/a',
            'sinta_id' => 'S99001',
        ]);

        $count = ['proposal' => 0, 'laporan' => 0];
        $n = 0;

        // ── PENGAJUAN TAB: kode_kegiatan=PENERIMAAN_PROPOSAL ──
        $pengajuanStatuses = [
            'Draft' => 3,
            'Menunggu proposal untuk diupload' => 2,
            'Ditolak' => 2,
            'Revisi' => 2,
        ];
        foreach ($pengajuanStatuses as $status => $qty) {
            for ($i = 0; $i < $qty; $i++) {
                $n++;
                $p = $this->createProposal($user, 'Penelitian', $status, 'PENERIMAAN_PROPOSAL', "Pengajuan {$status} #{$n}", 'Proposal');
                $this->addProposalMembers($p);
                $this->addProposalDocument($p);
                $count['proposal']++;
            }
        }

        // ── SELEKSI TAB: kode_kegiatan=SELEKSI_PROPOSAL ──
        $seleksiStatuses = [
            'Menunggu review dari Ketua LPPM' => 2,
            'Menunggu review Staff LPPM' => 2,
            'Menunggu penugasan reviewer' => 2,
            'Menunggu review' => 3,
            'Menunggu persetujuan Ketua LPPM' => 2,
            'Ditolak' => 2,
            'Ditarik' => 2,
            'Revisi' => 2,
        ];
        foreach ($seleksiStatuses as $status => $qty) {
            for ($i = 0; $i < $qty; $i++) {
                $n++;
                $ketuaOk = in_array($status, ['Menunggu penugasan reviewer', 'Menunggu review', 'Menunggu persetujuan Ketua LPPM', 'Revisi']);
                $staffOk = in_array($status, ['Menunggu review dari Ketua LPPM', 'Menunggu penugasan reviewer', 'Menunggu review', 'Menunggu persetujuan Ketua LPPM', 'Revisi']);
                $p = $this->createProposal($user, 'Penelitian', $status, 'SELEKSI_PROPOSAL', "Seleksi {$status} #{$n}", 'Proposal', $ketuaOk, $staffOk);
                $this->addProposalMembers($p);
                $this->addProposalDocument($p);
                if (in_array($status, ['Menunggu review', 'Menunggu persetujuan Ketua LPPM', 'Ditolak', 'Revisi'])) {
                    $this->attachReviewersToProposal($p, $status !== 'Menunggu review');
                }
                $count['proposal']++;
            }
        }

        // ── PENGUMUMAN TAB: kode_kegiatan=PENGUMUMAN_SURAT_TUGAS ──
        $pengumumanStatuses = [
            'Proposal Diterima' => 3,
            'Dalam pengerjaan' => 2,
        ];
        foreach ($pengumumanStatuses as $status => $qty) {
            for ($i = 0; $i < $qty; $i++) {
                $n++;
                $p = $this->createProposal($user, 'Penelitian', $status, 'PENGUMUMAN_SURAT_TUGAS', "Pengumuman {$status} #{$n}", 'Laporan', true, true);
                $this->addProposalMembers($p);
                $this->addProposalDocument($p, 'Pengumuman Surat Tugas');
                $this->attachReviewersToProposal($p, true);
                $count['proposal']++;
            }
        }

        // ── LAPORANS: all statuses x Ganjil + Genap ──
        $laporanStatuses = [
            'Belum dimulai' => 3,
            'Dalam pengerjaan' => 3,
            'Menunggu kelengkapan data' => 2,
            'Menunggu review Admin' => 2,
            'Menunggu review Staff LPPM' => 2,
            'Menunggu review dari Ketua LPPM' => 2,
            'Menuggu penugasan Reviewer' => 2,
            'Menunggu hasil dari Reviewers' => 3,
            'Menunggu keputusan Ketua' => 2,
            'Menunggu konfirmasi pengiriman dana' => 2,
            'Menunggu konfirmasi penerimaan dana' => 2,
            'Revisi' => 2,
            'Selesai' => 3,
        ];
        $kegiatanMap = [
            'Belum dimulai' => 'PROSES_PENELITIAN_GANJIL',
            'Dalam pengerjaan' => 'PROSES_PENELITIAN_GANJIL',
            'Menunggu kelengkapan data' => 'PUBLIKASI_GANJIL',
            'Menunggu review Admin' => 'DISEMINASI_GANJIL',
            'Menunggu review Staff LPPM' => 'DISEMINASI_GANJIL',
            'Menunggu review dari Ketua LPPM' => 'DISEMINASI_GANJIL',
            'Menuggu penugasan Reviewer' => 'DISEMINASI_GANJIL',
            'Menunggu hasil dari Reviewers' => 'DISEMINASI_GANJIL',
            'Menunggu keputusan Ketua' => 'DISEMINASI_GANJIL',
            'Menunggu konfirmasi pengiriman dana' => 'CLAIM_DANA_GANJIL',
            'Menunggu konfirmasi penerimaan dana' => 'CLAIM_DANA_GANJIL',
            'Revisi' => 'PUBLIKASI_GANJIL',
            'Selesai' => 'CLAIM_DANA_GANJIL',
        ];
        $genapMap = [
            'Belum dimulai' => 'PROSES_PENELITIAN_GENAP',
            'Dalam pengerjaan' => 'PROSES_PENELITIAN_GENAP',
            'Menunggu kelengkapan data' => 'PUBLIKASI_GENAP',
            'Menunggu review Admin' => 'DISEMINASI_GENAP',
            'Menunggu review Staff LPPM' => 'DISEMINASI_GENAP',
            'Menunggu review dari Ketua LPPM' => 'DISEMINASI_GENAP',
            'Menuggu penugasan Reviewer' => 'DISEMINASI_GENAP',
            'Menunggu hasil dari Reviewers' => 'DISEMINASI_GENAP',
            'Menunggu keputusan Ketua' => 'DISEMINASI_GENAP',
            'Menunggu konfirmasi pengiriman dana' => 'CLAIM_DANA_GENAP',
            'Menunggu konfirmasi penerimaan dana' => 'CLAIM_DANA_GENAP',
            'Revisi' => 'PUBLIKASI_GENAP',
            'Selesai' => 'CLAIM_DANA_GENAP',
        ];

        $lapN = 0;
        foreach ($laporanStatuses as $status => $qty) {
            for ($i = 0; $i < $qty; $i++) {
                $lapN++;
                foreach (['Ganjil', 'Genap'] as $semester) {
                    $kode = $semester === 'Ganjil' ? $kegiatanMap[$status] : $genapMap[$status];
                    $proposal = $this->createDedicatedAcceptedProposal('Penelitian', "TestDsn Laporan {$status} {$semester} #{$lapN}", $user);

                    $overrides = [];
                    if (in_array($status, ['Menunggu review Admin', 'Menunggu review Staff LPPM', 'Menunggu review dari Ketua LPPM', 'Menuggu penugasan Reviewer', 'Menunggu hasil dari Reviewers', 'Menunggu keputusan Ketua'])) {
                        $overrides['ketua_diseminasi_approved'] = in_array($status, ['Menuggu penugasan Reviewer', 'Menunggu hasil dari Reviewers', 'Menunggu keputusan Ketua']) ? 1 : 0;
                        $overrides['staff_diseminasi_approved'] = in_array($status, ['Menunggu review dari Ketua LPPM', 'Menuggu penugasan Reviewer', 'Menunggu hasil dari Reviewers', 'Menunggu keputusan Ketua']) ? 1 : 0;
                    }
                    if (in_array($status, ['Menunggu konfirmasi pengiriman dana'])) {
                        $overrides['claim_dana_status'] = 'Menunggu bukti terima';
                        $overrides['dana_disetujui'] = 1;
                    }
                    if (in_array($status, ['Menunggu konfirmasi penerimaan dana'])) {
                        $overrides['claim_dana_status'] = 'Menunggu konfirmasi admin';
                        $overrides['dana_disetujui'] = 1;
                    }
                    if ($status === 'Selesai') {
                        $overrides['completed_at'] = now()->subDays(1);
                        $overrides['claim_dana_status'] = 'Selesai';
                        $overrides['pengembalian_dana_status'] = 'Selesai';
                        $overrides['dana_disetujui'] = 1;
                    }
                    if ($status === 'Menunggu kelengkapan data') {
                        $overrides['tgl_submit'] = now()->subDays(2)->toDateString();
                    }

                    $lap = $this->createLaporan($proposal, $semester, $kode, $status, $overrides);
                    $this->addLaporanMembers($lap, $user->id);
                    $count['laporan']++;

                    if ($status === 'Dalam pengerjaan') {
                        $this->addLogbooks($lap, $user->id, 2);
                    }
                    if ($status === 'Selesai') {
                        $this->addRealisasiAnggaran($lap);
                    }
                    if ($status === 'Menunggu hasil dari Reviewers') {
                        $this->attachReviewersToLaporan($lap, false);
                    }
                    if ($status === 'Menunggu keputusan Ketua') {
                        $this->attachReviewersToLaporan($lap, true);
                    }
                }
            }
        }

        // ══════════════════════════════════════════════════════════
        // PkM PROPOSALS
        // ══════════════════════════════════════════════════════════

        // ── PkM PENGAJUAN TAB: kode_kegiatan=PENERIMAAN_PROPOSAL ──
        $pkmPengajuanStatuses = [
            'Draft' => 2,
            'Menunggu proposal untuk diupload' => 2,
            'Ditolak' => 2,
            'Revisi' => 2,
        ];
        foreach ($pkmPengajuanStatuses as $status => $qty) {
            for ($i = 0; $i < $qty; $i++) {
                $n++;
                $p = $this->createProposal($user, 'PkM', $status, 'PENERIMAAN_PROPOSAL', "PkM Pengajuan {$status} #{$n}", 'Proposal');
                $this->addProposalMembers($p);
                $this->addProposalDocument($p);
                $count['proposal']++;
            }
        }

        // ── PkM SELEKSI TAB: kode_kegiatan=SELEKSI_PROPOSAL ──
        $pkmSeleksiStatuses = [
            'Menunggu review dari Ketua LPPM' => 2,
            'Menunggu review Staff LPPM' => 2,
            'Menunggu penugasan reviewer' => 2,
            'Menunggu review' => 2,
            'Menunggu persetujuan Ketua LPPM' => 2,
            'Ditolak' => 2,
            'Ditarik' => 2,
            'Revisi' => 2,
        ];
        foreach ($pkmSeleksiStatuses as $status => $qty) {
            for ($i = 0; $i < $qty; $i++) {
                $n++;
                $ketuaOk = in_array($status, ['Menunggu penugasan reviewer', 'Menunggu review', 'Menunggu persetujuan Ketua LPPM', 'Revisi']);
                $staffOk = in_array($status, ['Menunggu review dari Ketua LPPM', 'Menunggu penugasan reviewer', 'Menunggu review', 'Menunggu persetujuan Ketua LPPM', 'Revisi']);
                $p = $this->createProposal($user, 'PkM', $status, 'SELEKSI_PROPOSAL', "PkM Seleksi {$status} #{$n}", 'Proposal', $ketuaOk, $staffOk);
                $this->addProposalMembers($p);
                $this->addProposalDocument($p);
                if (in_array($status, ['Menunggu review', 'Menunggu persetujuan Ketua LPPM', 'Ditolak', 'Revisi'])) {
                    $this->attachReviewersToProposal($p, $status !== 'Menunggu review');
                }
                $count['proposal']++;
            }
        }

        // ── PkM PENGUMUMAN TAB: kode_kegiatan=PENGUMUMAN_SURAT_TUGAS ──
        $pkmPengumumanStatuses = [
            'Proposal Diterima' => 3,
            'Dalam pengerjaan' => 2,
        ];
        foreach ($pkmPengumumanStatuses as $status => $qty) {
            for ($i = 0; $i < $qty; $i++) {
                $n++;
                $p = $this->createProposal($user, 'PkM', $status, 'PENGUMUMAN_SURAT_TUGAS', "PkM Pengumuman {$status} #{$n}", 'Laporan', true, true);
                $this->addProposalMembers($p);
                $this->addProposalDocument($p, 'Pengumuman Surat Tugas');
                $this->attachReviewersToProposal($p, true);
                $count['proposal']++;
            }
        }

        // ══════════════════════════════════════════════════════════
        // PkM LAPORANS: all statuses x Ganjil + Genap
        // ══════════════════════════════════════════════════════════
        $pkmLaporanStatuses = [
            'Belum dimulai' => 2,
            'Dalam pengerjaan' => 2,
            'Menunggu kelengkapan data' => 2,
            'Menunggu review Admin' => 2,
            'Menunggu review Staff LPPM' => 2,
            'Menunggu review dari Ketua LPPM' => 2,
            'Menuggu penugasan Reviewer' => 2,
            'Menunggu hasil dari Reviewers' => 2,
            'Menunggu keputusan Ketua' => 2,
            'Menunggu konfirmasi pengiriman dana' => 2,
            'Menunggu konfirmasi penerimaan dana' => 2,
            'Revisi' => 2,
            'Selesai' => 2,
        ];
        $pkmKegiatanGanjil = [
            'Belum dimulai' => 'CLAIM_DANA_PKM_GANJIL',
            'Dalam pengerjaan' => 'PROSES_PKM_GANJIL',
            'Menunggu kelengkapan data' => 'PUBLIKASI_PKM_GANJIL',
            'Menunggu review Admin' => 'DISEMINASI_PKM_GANJIL',
            'Menunggu review Staff LPPM' => 'DISEMINASI_PKM_GANJIL',
            'Menunggu review dari Ketua LPPM' => 'DISEMINASI_PKM_GANJIL',
            'Menuggu penugasan Reviewer' => 'DISEMINASI_PKM_GANJIL',
            'Menunggu hasil dari Reviewers' => 'DISEMINASI_PKM_GANJIL',
            'Menunggu keputusan Ketua' => 'DISEMINASI_PKM_GANJIL',
            'Menunggu konfirmasi pengiriman dana' => 'CLAIM_DANA_PKM_GANJIL',
            'Menunggu konfirmasi penerimaan dana' => 'PENGEMBALIAN_DANA_GANJIL',
            'Revisi' => 'PUBLIKASI_PKM_GANJIL',
            'Selesai' => 'DISEMINASI_PKM_GANJIL',
        ];
        $pkmKegiatanGenap = [
            'Belum dimulai' => 'CLAIM_DANA_PKM_GENAP',
            'Dalam pengerjaan' => 'PROSES_PKM_GENAP',
            'Menunggu kelengkapan data' => 'PUBLIKASI_PKM_GENAP',
            'Menunggu review Admin' => 'DISEMINASI_PKM_GENAP',
            'Menunggu review Staff LPPM' => 'DISEMINASI_PKM_GENAP',
            'Menunggu review dari Ketua LPPM' => 'DISEMINASI_PKM_GENAP',
            'Menuggu penugasan Reviewer' => 'DISEMINASI_PKM_GENAP',
            'Menunggu hasil dari Reviewers' => 'DISEMINASI_PKM_GENAP',
            'Menunggu keputusan Ketua' => 'DISEMINASI_PKM_GENAP',
            'Menunggu konfirmasi pengiriman dana' => 'CLAIM_DANA_PKM_GENAP',
            'Menunggu konfirmasi penerimaan dana' => 'PENGEMBALIAN_DANA_GENAP',
            'Revisi' => 'PUBLIKASI_PKM_GENAP',
            'Selesai' => 'DISEMINASI_PKM_GENAP',
        ];

        $pkmLapN = 0;
        foreach ($pkmLaporanStatuses as $status => $qty) {
            for ($i = 0; $i < $qty; $i++) {
                $pkmLapN++;
                foreach (['Ganjil', 'Genap'] as $semester) {
                    $kode = $semester === 'Ganjil' ? $pkmKegiatanGanjil[$status] : $pkmKegiatanGenap[$status];
                    $proposal = $this->createDedicatedAcceptedProposal('PkM', "TestDsn PkM Laporan {$status} {$semester} #{$pkmLapN}", $user);

                    $overrides = [];
                    if (in_array($status, ['Menunggu review Admin', 'Menunggu review Staff LPPM', 'Menunggu review dari Ketua LPPM', 'Menuggu penugasan Reviewer', 'Menunggu hasil dari Reviewers', 'Menunggu keputusan Ketua'])) {
                        $overrides['ketua_diseminasi_approved'] = in_array($status, ['Menuggu penugasan Reviewer', 'Menunggu hasil dari Reviewers', 'Menunggu keputusan Ketua']) ? 1 : 0;
                        $overrides['staff_diseminasi_approved'] = in_array($status, ['Menunggu review dari Ketua LPPM', 'Menuggu penugasan Reviewer', 'Menunggu hasil dari Reviewers', 'Menunggu keputusan Ketua']) ? 1 : 0;
                    }
                    if ($status === 'Menunggu konfirmasi pengiriman dana') {
                        $overrides['claim_dana_status'] = 'Menunggu bukti terima';
                        $overrides['dana_disetujui'] = 1;
                    }
                    if ($status === 'Menunggu konfirmasi penerimaan dana') {
                        $overrides['claim_dana_status'] = 'Selesai';
                        $overrides['pengembalian_dana_status'] = 'Menunggu konfirmasi admin';
                        $overrides['dana_disetujui'] = 1;
                    }
                    if ($status === 'Selesai') {
                        $overrides['completed_at'] = now()->subDays(1);
                        $overrides['claim_dana_status'] = 'Selesai';
                        $overrides['pengembalian_dana_status'] = 'Selesai';
                        $overrides['dana_disetujui'] = 1;
                    }
                    if ($status === 'Menunggu kelengkapan data') {
                        $overrides['tgl_submit'] = now()->subDays(2)->toDateString();
                    }

                    $lap = $this->createLaporan($proposal, $semester, $kode, $status, $overrides);
                    $this->addLaporanMembers($lap, $user->id);
                    $count['laporan']++;

                    if ($status === 'Dalam pengerjaan') {
                        $this->addLogbooks($lap, $user->id, 2);
                    }
                    if ($status === 'Selesai') {
                        $this->addRealisasiAnggaran($lap);
                    }
                    if ($status === 'Menunggu hasil dari Reviewers') {
                        $this->attachReviewersToLaporan($lap, false);
                    }
                    if ($status === 'Menunggu keputusan Ketua') {
                        $this->attachReviewersToLaporan($lap, true);
                    }
                }
            }
        }

        $this->command->info("Test Dosen: {$user->email} — {$count['proposal']} proposals, {$count['laporan']} laporans");
    }

    private function seedScholarProfiles(): void
    {
        foreach (array_slice($this->dosen, 0, 8) as $d) {
            $profile = ScholarProfile::firstOrCreate(
                ['user_id' => $d->id],
                [
                    'scholar_author_id' => 'user_' . $d->id,
                    'profile_url' => 'https://scholar.google.com/citations?user=demo' . $d->id,
                    'display_name' => $d->nama,
                    'affiliation' => 'ITB Sangga Buana',
                    'total_citations' => rand(50, 500),
                    'h_index' => rand(3, 15),
                    'i10_index' => rand(1, 8),
                    'sync_status' => 'success',
                    'last_synced_at' => now()->subDays(rand(1, 30)),
                ]
            );

            for ($y = 2020; $y <= 2026; $y++) {
                ScholarCitationByYear::firstOrCreate(
                    ['scholar_profile_id' => $profile->scholar_profile_id, 'year' => $y],
                    ['citation_count' => rand(5, 100)]
                );
            }

            $pubTitles = [
                'Deep Learning for Image Classification',
                'IoT-Based Smart Agriculture System',
                'Machine Learning Predictive Analytics',
                'Blockchain for Supply Chain Management',
                'Natural Language Processing for Education',
            ];
            foreach (array_slice($pubTitles, 0, rand(1, 3)) as $ti => $title) {
                $pub = ScholarPublication::firstOrCreate(
                    ['scholar_profile_id' => $profile->scholar_profile_id, 'title' => $title . ' v' . $d->id],
                    [
                        'authors' => $d->nama . ' et al.',
                        'publication_name' => 'Journal of ' . fake()->randomElement(['Computer Science', 'Engineering', 'Technology']),
                        'publication_year' => rand(2021, 2025),
                        'citation_count' => rand(5, 80),
                        'publication_url' => 'https://doi.org/10.' . Str::random(8),
                        'last_synced_at' => now()->subDays(rand(1, 30)),
                    ]
                );
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // AUTHORIZATION REQUESTS
    // ═══════════════════════════════════════════════════════════════════

    private function seedNotifications(): void
    {
        $allUsers = array_merge($this->dosen, $this->staff, $this->ketua, $this->reviewers, [$this->superadmin]);
        $types = ['proposal.status_change', 'laporan.status_change', 'review.assigned', 'review.completed', 'authorization.pending'];
        $titles = [
            'Status proposal berubah', 'Laporan baru menunggu review',
            'Anda ditugaskan sebagai reviewer', 'Review selesai menunggu keputusan',
            'Menunggu persetujuan Anda',
        ];
        $messages = [
            'Proposal Anda telah memasuki tahap seleksi baru.',
            'Laporan Ganjil menunggu review Anda sebagai reviewer.',
            'Penugasan reviewer telah dikonfirmasi.',
            'Semua reviewer telah menyelesaikan penilaian.',
            'Ada permintaan otorisasi yang menunggu persetujuan Anda.',
        ];

        for ($i = 0; $i < 40; $i++) {
            $user = $allUsers[array_rand($allUsers)];
            $ti = array_rand($types);
            Notification::create([
                'user_id' => $user->id,
                'type' => $types[$ti],
                'title' => $titles[$ti],
                'message' => $messages[$ti],
                'action_url' => '/dashboard',
                'key' => 'notif_' . Str::random(12) . '_' . $i,
                'read_at' => rand(0, 1) ? now()->subDays(rand(1, 5)) : null,
            ]);
            $this->notifCount++;
        }

        $this->command->info("Notifications: {$this->notifCount}");
    }

    // ═══════════════════════════════════════════════════════════════════
    // REPORT
    // ═══════════════════════════════════════════════════════════════════

    private function printReport(): void
    {
        $this->command->info('');
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->info('  SUS Workflow Seeder — Complete');
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->info('');
        $this->command->info('  RECORDS CREATED');
        $this->command->info('  ─────────────────────────────────────────');
        $this->command->info('  Proposals:           ' . $this->proposalCount);
        $this->command->info('  Laporans:            ' . $this->laporanCount);
        $this->command->info('  Reviews:             ' . $this->reviewCount);
        $this->command->info('  Documents:           ' . $this->docCount);
        $this->command->info('  Logbooks:            ' . $this->logbookCount);
        $this->command->info('  Notifications:       ' . $this->notifCount);
        $this->command->info('');
        $this->command->info('  TABLE COUNTS');
        $this->command->info('  ─────────────────────────────────────────');
        $this->command->info('  Users:               ' . User::count());
        $this->command->info('  Prodi:               ' . Prodi::count());
        $this->command->info('  Skema:               ' . Skema::count());
        $this->command->info('  Kegiatan:            ' . KegiatanPengajuan::count());
        $this->command->info('  Proposals:           ' . Proposal::count());
        $this->command->info('  Laporans:            ' . Laporan::count());
        $this->command->info('  Penugasan Reviewer:  ' . PenugasanReviewer::count());
        $this->command->info('  Reviews:             ' . Review::count());
        $this->command->info('  Dokumen:             ' . Dokumen::count());
        $this->command->info('  DokumenVersion:      ' . DokumenVersion::count());
        $this->command->info('  LogbookPengerjaan:   ' . LogbookPengerjaan::count());
        $this->command->info('  RealisasiAnggaran:   ' . RealisasiAnggaran::count());
        $this->command->info('  ProposalMember:      ' . ProposalMember::count());
        $this->command->info('  LaporanMember:       ' . LaporanMember::count());
        $this->command->info('  ScholarProfile:      ' . ScholarProfile::count());
        $this->command->info('  Mahasiswa:           ' . Mahasiswa::count());
        $this->command->info('  Kolaborator:         ' . Kolaborator::count());
        $this->command->info('  Notifications:       ' . Notification::count());
        $this->command->info('  Settings:            ' . Settings::count());
        $this->command->info('  PubCategories:       ' . PublicationCategory::count());
        $this->command->info('');
        $this->command->info('  WORKFLOW COVERAGE');
        $this->command->info('  ─────────────────────────────────────────');

        $statuses = Proposal::select('status', \DB::raw('count(*) as total'))->groupBy('status')->pluck('total', 'status');
        foreach ($statuses as $s => $c) {
            $this->command->info("  Proposal {$s}: {$c}");
        }

        $lStatuses = Laporan::select('status', \DB::raw('count(*) as total'))->groupBy('status')->pluck('total', 'status');
        foreach ($lStatuses as $s => $c) {
            $this->command->info("  Laporan {$s}: {$c}");
        }

        $this->command->info('');
        $this->command->info('  CREDENTIALS (all passwords: password)');
        $this->command->info('  ─────────────────────────────────────────');
        $this->command->info('  Superadmin: ' . $this->superadmin->email);
        foreach ($this->staff as $s) $this->command->info('  Staff:      ' . $s->email);
        foreach ($this->ketua as $k) $this->command->info('  Ketua:      ' . $k->email);
        $this->command->info('  Dosen:      sus.dosen0@itbss.ac.id — sus.dosen15@itbss.ac.id');
        $this->command->info('  Reviewer:   sus.reviewer0@itbss.ac.id — sus.reviewer5@itbss.ac.id');
        $this->command->info('');
        $this->command->info('═══════════════════════════════════════════════════════════');
    }
}
