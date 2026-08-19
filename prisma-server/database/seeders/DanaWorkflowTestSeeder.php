<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Prodi;
use App\Models\Skema;
use App\Models\KegiatanPengajuan;
use App\Models\Proposal;
use App\Models\Laporan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DanaWorkflowTestSeeder extends Seeder
{
    private const PASSWORD = 'password';

    public function run(): void
    {
        $staff = $this->findOrCreateStaff();
        $dosen = $this->findOrCreateDosen();
        $ketua = $this->findOrCreateKetua();

        $skema = $this->ensureSkema();

        $penelitianKegiatan = $this->ensurePenelitianKegiatan($skema->skema_id);
        $pkmKegiatan = $this->ensurePkmKegiatan($skema->skema_id);

        $this->seedScenarioA($dosen, $skema, $penelitianKegiatan);
        $this->seedScenarioB($dosen, $skema, $pkmKegiatan);
        $this->seedScenarioC($dosen, $skema, $pkmKegiatan);
        $this->seedScenarioD($dosen, $skema, $pkmKegiatan);

        $this->printCredentials($staff, $dosen, $ketua);
    }

    private function findOrCreateStaff(): User
    {
        $existing = User::where('email', 'staff.dana@itbss.ac.id')->first();
        if ($existing) return $existing;

        $prodi = Prodi::firstOrCreate(['nama_prodi' => 'Sistem Teknologi dan Informasi']);

        return User::create([
            'nama'              => 'Staff LPPM Dana Test',
            'email'             => 'staff.dana@itbss.ac.id',
            'email_verified_at' => now(),
            'password'          => Hash::make(self::PASSWORD),
            'role'              => 'Staff LPPM',
            'status'            => 'Aktif',
            'gender'            => 'L',
            'nidn'              => '90001',
            'no_hp'             => '08900000001',
            'prodi_id'          => $prodi->prodi_id,
            'remember_token'    => Str::random(10),
        ]);
    }

    private function findOrCreateDosen(): User
    {
        $existing = User::where('email', 'dosen.dana@itbss.ac.id')->first();
        if ($existing) return $existing;

        $prodi = Prodi::firstOrCreate(['nama_prodi' => 'Bisnis Digital']);

        return User::create([
            'nama'              => 'Dosen Dana Test',
            'email'             => 'dosen.dana@itbss.ac.id',
            'email_verified_at' => now(),
            'password'          => Hash::make(self::PASSWORD),
            'role'              => 'Dosen',
            'status'            => 'Aktif',
            'gender'            => 'P',
            'nidn'              => '90002',
            'no_hp'             => '08900000002',
            'prodi_id'          => $prodi->prodi_id,
            'remember_token'    => Str::random(10),
        ]);
    }

    private function findOrCreateKetua(): User
    {
        $existing = User::where('email', 'ketua.dana@itbss.ac.id')->first();
        if ($existing) return $existing;

        $prodi = Prodi::firstOrCreate(['nama_prodi' => 'Kewirausahaan']);

        return User::create([
            'nama'              => 'Ketua LPPM Dana Test',
            'email'             => 'ketua.dana@itbss.ac.id',
            'email_verified_at' => now(),
            'password'          => Hash::make(self::PASSWORD),
            'role'              => 'Ketua LPPM',
            'status'            => 'Aktif',
            'gender'            => 'L',
            'nidn'              => '90003',
            'no_hp'             => '08900000003',
            'prodi_id'          => $prodi->prodi_id,
            'remember_token'    => Str::random(10),
        ]);
    }

    private function ensureSkema(): Skema
    {
        return Skema::firstOrCreate(
            ['nama_skema' => 'Dana Test Skema 2026'],
            [
                'tahun_ajaran' => '2025/2026',
                'status'       => 'Aktif',
            ]
        );
    }

    private function ensurePenelitianKegiatan(int $skemaId): array
    {
        $specs = [
            ['kode' => 'PENERIMAAN_PROPOSAL',    'nama' => 'Penerimaan Proposal Penelitian Dana Test'],
            ['kode' => 'SELEKSI_PROPOSAL',        'nama' => 'Seleksi Proposal Penelitian Dana Test'],
            ['kode' => 'PENGUMUMAN_SURAT_TUGAS',  'nama' => 'Pengumuman Surat Tugas Penelitian Dana Test'],
            ['kode' => 'CLAIM_DANA_GANJIL',       'nama' => 'Claim Dana Penelitian Ganjil Dana Test'],
            ['kode' => 'PENGEMBALIAN_DANA_GANJIL','nama' => 'Pengembalian Dana Penelitian Ganjil Dana Test'],
            ['kode' => 'DISEMINASI_GANJIL',       'nama' => 'Diseminasi Penelitian Ganjil Dana Test'],
            ['kode' => 'LUARAN_PENELITIAN_GANJIL','nama' => 'Luaran Penelitian Ganjil Dana Test'],
        ];

        $result = [];
        foreach ($specs as $spec) {
            $kg = KegiatanPengajuan::firstOrCreate(
                [
                    'skema_id'          => $skemaId,
                    'jenis_penelitian'  => 'Penelitian',
                    'kode_kegiatan'     => $spec['kode'],
                ],
                [
                    'nama_kegiatan'          => $spec['nama'],
                    'tgl_mulai'              => '2026-01-01',
                    'tgl_selesai'            => '2026-12-31',
                    'status'                 => 'Terbuka',
                    'manual_status_override' => true,
                ]
            );
            $result[$spec['kode']] = $kg;
        }

        return $result;
    }

    private function ensurePkmKegiatan(int $skemaId): array
    {
        $specs = [
            ['kode' => 'PENERIMAAN_PROPOSAL',    'nama' => 'Penerimaan Proposal PkM Dana Test'],
            ['kode' => 'SELEKSI_PROPOSAL',        'nama' => 'Seleksi Proposal PkM Dana Test'],
            ['kode' => 'PENGUMUMAN_SURAT_TUGAS',  'nama' => 'Pengumuman Surat Tugas PkM Dana Test'],
            ['kode' => 'CLAIM_DANA_GANJIL',       'nama' => 'Claim Dana PkM Ganjil Dana Test'],
            ['kode' => 'PROSES_PKM_GANJIL',       'nama' => 'Proses PkM Ganjil Dana Test'],
            ['kode' => 'PUBLIKASI_GANJIL',        'nama' => 'Publikasi PkM Ganjil Dana Test'],
            ['kode' => 'PENGEMBALIAN_DANA_GANJIL','nama' => 'Pengembalian Dana PkM Ganjil Dana Test'],
            ['kode' => 'DISEMINASI_GANJIL',       'nama' => 'Diseminasi PkM Ganjil Dana Test'],
            ['kode' => 'LUARAN_PKM',              'nama' => 'Luaran PkM Dana Test'],
        ];

        $result = [];
        foreach ($specs as $spec) {
            $kg = KegiatanPengajuan::firstOrCreate(
                [
                    'skema_id'          => $skemaId,
                    'jenis_penelitian'  => 'PkM',
                    'kode_kegiatan'     => $spec['kode'],
                ],
                [
                    'nama_kegiatan'          => $spec['nama'],
                    'tgl_mulai'              => '2026-01-01',
                    'tgl_selesai'            => '2026-12-31',
                    'status'                 => 'Terbuka',
                    'manual_status_override' => true,
                ]
            );
            $result[$spec['kode']] = $kg;
        }

        return $result;
    }

    private function createAcceptedProposal(User $dosen, int $kegiatanId, string $judul, string $jenis, string $topik, string $bidang, string $sdg, string $luaran, string $mitra): Proposal
    {
        return Proposal::firstOrCreate(
            ['judul' => $judul],
            [
                'jenis_penelitian'     => $jenis,
                'jenis_penelitian_gan' => $jenis,
                'jenis_penelitian_gen' => $jenis,
                'tahap_penelitian'     => 'Laporan',
                'topik_penelitian'     => $topik,
                'bidang_ilmu'          => $bidang,
                'fokus_sdg'            => $sdg,
                'skema'                => 'Internal',
                'sumber_skema'         => 'Dana Internal',
                'status'               => 'Proposal Diterima',
                'ketua_seleksi_approved' => true,
                'staff_seleksi_approved' => true,
                'user_id'              => $dosen->id,
                'kegiatan_id'          => $kegiatanId,
                'tgl_pengajuan'        => '2026-06-01',
                'ra_biaya_penelitian_gan' => 5000000,
                'ra_biaya_publikasi_gan'  => 2000000,
                'ra_insentif_gan'         => 1500000,
                'ra_biaya_penelitian_gen' => 5000000,
                'ra_biaya_publikasi_gen'  => 2000000,
                'ra_insentif_gen'         => 1500000,
                'target_publikasi_gan'    => 'SCOPUS Q3',
                'target_publikasi_gen'    => 'SCOPUS Q3',
                'rencana_judul_publikasi_gan' => $judul,
                'rencana_judul_publikasi_gen' => $judul,
                'metopen_gan'    => 'Mixed Methods',
                'metopen_gen'    => 'Mixed Methods',
                'unit_analisis_gan' => 'Sample',
                'unit_analisis_gen' => 'Sample',
                'kontribusi_ilmu_makul' => 'Kontribusi Ilmu',
                'kontribusi_pkm'        => 'Kontribusi PKM',
                'rencana_luaran'        => $luaran,
                'institusi_mitra'       => $mitra,
            ]
        );
    }

    private function createLaporan(Proposal $proposal, int $kegiatanId, string $judul, string $semester, string $jenis, string $status, array $overrides = []): Laporan
    {
        return Laporan::updateOrCreate(
            ['proposal_id' => $proposal->proposal_id, 'semester' => $semester],
            array_merge([
                'kegiatan_id'     => $kegiatanId,
                'judul_penelitian' => $judul,
                'jenis_penelitian' => $jenis,
                'status'          => $status,
                'tgl_mulai'       => '2026-07-01',
                'tgl_submit'      => '2026-07-15',
            ], $overrides)
        );
    }

    /**
     * A. Penelitian — CLAIM DANA
     * Laporan at CLAIM_DANA_GANJIL stage. claim_dana_status = null (ready for first upload).
     * Manual flow:
     *   1. Staff uploads bukti pengiriman → status becomes "Menunggu bukti terima"
     *   2. Dosen uploads bukti penerimaan → status becomes "Menunggu konfirmasi admin"
     *   3. System auto-completes → claim_dana_status = "Selesai"
     */
    private function seedScenarioA(User $dosen, Skema $skema, array $kegiatan): void
    {
        $proposal = $this->createAcceptedProposal(
            $dosen,
            $kegiatan['PENGUMUMAN_SURAT_TUGAS']->kegiatan_id,
            '[TEST DANA] Penelitian - Claim Dana',
            'Penelitian',
            'Energi Terbarukan',
            'Teknik',
            'SDGs 7 - Energi Bersih',
            'Jurnal Internasional',
            'Universitas Test',
        );

        $this->createLaporan(
            $proposal,
            $kegiatan['CLAIM_DANA_GANJIL']->kegiatan_id,
            '[TEST DANA] Penelitian - Claim Dana',
            'Ganjil',
            'Penelitian',
            'Dalam pengerjaan',
        );
    }

    /**
     * B. PkM — CLAIM DANA
     * Laporan at CLAIM_DANA_GANJIL stage (PkM). claim_dana_status = null.
     * Manual flow:
     *   1. Staff uploads bukti pengiriman
     *   2. Dosen uploads bukti penerimaan
     *   3. System auto-completes → claim_dana_status = "Selesai"
     */
    private function seedScenarioB(User $dosen, Skema $skema, array $kegiatan): void
    {
        $proposal = $this->createAcceptedProposal(
            $dosen,
            $kegiatan['PENGUMUMAN_SURAT_TUGAS']->kegiatan_id,
            '[TEST DANA] PkM - Claim Dana',
            'PkM',
            'Digitalisasi UMKM',
            'Bisnis',
            'SDGs 8 - Decent Work',
            'Jurnal Nasional',
            'UMKM Mitra',
        );

        $this->createLaporan(
            $proposal,
            $kegiatan['CLAIM_DANA_GANJIL']->kegiatan_id,
            '[TEST DANA] PkM - Claim Dana',
            'Ganjil',
            'PkM',
            'Dalam pengerjaan',
        );
    }

    /**
     * C. PkM — PENGEMBALIAN DANA WITH FUNDS TO RETURN
     * Laporan at PENGEMBALIAN_DANA_GANJIL stage.
     * pengembalian_dana_status = "Menunggu Pengembalian Dana" (Staff already requested).
     * Manual flow:
     *   1. Dosen uploads bukti pengembalian → status becomes "Menunggu konfirmasi admin"
     *   2. Staff uploads bukti penerimaan → system auto-completes → "Selesai"
     */
    private function seedScenarioC(User $dosen, Skema $skema, array $kegiatan): void
    {
        $proposal = $this->createAcceptedProposal(
            $dosen,
            $kegiatan['PENGUMUMAN_SURAT_TUGAS']->kegiatan_id,
            '[TEST DANA] PkM - Pengembalian',
            'PkM',
            'Bank Sampah',
            'Lingkungan',
            'SDGs 12 - Responsible Consumption',
            'Jurnal Nasional',
            'DLH',
        );

        $this->createLaporan(
            $proposal,
            $kegiatan['PENGEMBALIAN_DANA_GANJIL']->kegiatan_id,
            '[TEST DANA] PkM - Pengembalian',
            'Ganjil',
            'PkM',
            'Dalam pengerjaan',
            [
                'dana_dikembalikan' => true,
                'pengembalian_dana_status' => 'Menunggu Pengembalian Dana',
            ],
        );
    }

    /**
     * D. PkM — NO FUNDS LEFT TO RETURN (skip flow)
     * Laporan at PENGEMBALIAN_DANA_GANJIL stage.
     * pengembalian_dana_status = "Menunggu Pengembalian Dana" (Staff already requested).
     * dana_dikembalikan = false.
     * Manual flow:
     *   1. Staff skips (no remaining funds) → status becomes "Dilewati"
     *      OR: Dosen uploads → Staff confirms (tests both paths)
     */
    private function seedScenarioD(User $dosen, Skema $skema, array $kegiatan): void
    {
        $proposal = $this->createAcceptedProposal(
            $dosen,
            $kegiatan['PENGUMUMAN_SURAT_TUGAS']->kegiatan_id,
            '[TEST DANA] PkM - Tanpa Pengembalian',
            'PkM',
            'Edukasi Literasi',
            'Pendidikan',
            'SDGs 4 - Quality Education',
            'Jurnal Nasional',
            'Sekolah',
        );

        $this->createLaporan(
            $proposal,
            $kegiatan['PENGEMBALIAN_DANA_GANJIL']->kegiatan_id,
            '[TEST DANA] PkM - Tanpa Pengembalian',
            'Ganjil',
            'PkM',
            'Dalam pengerjaan',
            [
                'dana_dikembalikan' => false,
                'pengembalian_dana_status' => 'Menunggu Pengembalian Dana',
            ],
        );
    }

    private function printCredentials(User $staff, User $dosen, User $ketua): void
    {
        $this->command->info('');
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->info('  Dana Workflow Test Seeder — Complete');
        $this->command->info('═══════════════════════════════════════════════════════════');
        $this->command->info('');
        $this->command->info('  CREDENTIALS (all passwords: password)');
        $this->command->info('  ─────────────────────────────────────────');
        $this->command->info("  Staff LPPM: {$staff->email}");
        $this->command->info("  Dosen:      {$dosen->email}");
        $this->command->info("  Ketua LPPM: {$ketua->email}");
        $this->command->info('');
        $this->command->info('  SCENARIOS');
        $this->command->info('  ─────────────────────────────────────────');
        $this->command->info('  A. [TEST DANA] Penelitian - Claim Dana');
        $this->command->info('     Stage: CLAIM_DANA_GANJIL  |  Status: null (ready for Staff upload)');
        $this->command->info('     Flow:  Staff upload → Dosen upload → auto-complete');
        $this->command->info('');
        $this->command->info('  B. [TEST DANA] PkM - Claim Dana');
        $this->command->info('     Stage: CLAIM_DANA_GANJIL  |  Status: null (ready for Staff upload)');
        $this->command->info('     Flow:  Staff upload → Dosen upload → auto-complete');
        $this->command->info('');
        $this->command->info('  C. [TEST DANA] PkM - Pengembalian');
        $this->command->info('     Stage: PENGEMBALIAN_DANA_GANJIL  |  Status: "Menunggu Pengembalian Dana", dana_dikembalikan=true');
        $this->command->info('     Flow:  Dosen proof → Staff confirm → auto-complete');
        $this->command->info('');
        $this->command->info('  D. [TEST DANA] PkM - Tanpa Pengembalian');
        $this->command->info('     Stage: PENGEMBALIAN_DANA_GANJIL  |  Status: "Menunggu Pengembalian Dana", dana_dikembalikan=false');
        $this->command->info('     Flow:  Staff skip (no funds) → "Dilewati"');
        $this->command->info('');
        $this->command->info('═══════════════════════════════════════════════════════════');
    }
}
