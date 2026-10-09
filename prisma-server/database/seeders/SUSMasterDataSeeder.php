<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SUSMasterDataSeeder extends Seeder
{
    public $skema;
    public $kegiatan = [];

    public function run(): void
    {
        $this->seedSkema();
        $this->seedPublicationCategories();
        $this->seedKegiatanPengajuan();

        $skemaCount = DB::table('skema')->count();
        $pubCatCount = DB::table('publication_categories')->count();
        $kegiatanCount = DB::table('kegiatan_pengajuan')->count();

        $this->command->info("SUS Master Data seeded: {$skemaCount} Skema, {$pubCatCount} PublicationCategories, {$kegiatanCount} KegiatanPengajuan");
    }

    protected function seedSkema(): void
    {
        $skemas = [
            ['nama_skema' => 'Penelitian Dosen Tetap 2026', 'tahun_ajaran' => '2025/2026', 'status' => 'Aktif'],
            ['nama_skema' => 'PkM Dosen Tetap 2026', 'tahun_ajaran' => '2025/2026', 'status' => 'Aktif'],
            ['nama_skema' => 'Penelitian Hibah Eksternal 2026', 'tahun_ajaran' => '2025/2026', 'status' => 'Aktif'],
            ['nama_skema' => 'Penelitian Dosen Pemula 2026', 'tahun_ajaran' => '2025/2026', 'status' => 'Aktif'],
            ['nama_skema' => 'PkM Hibah Kemendikbud 2026', 'tahun_ajaran' => '2025/2026', 'status' => 'Aktif'],
            ['nama_skema' => 'Penelitian Kerjasama Industri 2026', 'tahun_ajaran' => '2025/2026', 'status' => 'Aktif'],
            ['nama_skema' => 'PkM Pemberdayaan Masyarakat 2026', 'tahun_ajaran' => '2025/2026', 'status' => 'Aktif'],
            ['nama_skema' => 'Penelitian Dasar 2026', 'tahun_ajaran' => '2025/2026', 'status' => 'Aktif'],
            ['nama_skema' => 'PkM Kewirausahaan 2026', 'tahun_ajaran' => '2025/2026', 'status' => 'Aktif'],
        ];

        $this->skema = null;

        foreach ($skemas as $index => $data) {
            $data['created_at'] = now();
            $data['updated_at'] = now();
            $data['skema_id'] = DB::table('skema')->insertGetId($data);

            if ($index === 0) {
                $this->skema = (object) $data;
            }
        }
    }

    protected function seedPublicationCategories(): void
    {
        $categories = [
            [
                'nama' => 'Scopus',
                'peringkat' => json_encode(['Q1', 'Q2', 'Q3', 'Q4']),
                'urutan' => 1,
            ],
            [
                'nama' => 'SINTA',
                'peringkat' => json_encode(['Sinta 1', 'Sinta 2', 'Sinta 3', 'Sinta 4', 'Sinta 5', 'Sinta 6']),
                'urutan' => 2,
            ],
            [
                'nama' => 'Google Scholar',
                'peringkat' => json_encode(['Q1', 'Q2', 'Q3', 'Q4']),
                'urutan' => 3,
            ],
            [
                'nama' => 'Web of Science',
                'peringkat' => json_encode(['Q1', 'Q2', 'Q3', 'Q4']),
                'urutan' => 4,
            ],
            [
                'nama' => 'Dimensions',
                'peringkat' => json_encode(['Q1', 'Q2', 'Q3', 'Q4']),
                'urutan' => 5,
            ],
            [
                'nama' => 'DOAJ',
                'peringkat' => json_encode(['Indexed', 'Not Indexed']),
                'urutan' => 6,
            ],
            [
                'nama' => 'PubMed',
                'peringkat' => json_encode(['Indexed', 'Not Indexed']),
                'urutan' => 7,
            ],
            [
                'nama' => 'EBSCOhost',
                'peringkat' => json_encode(['Indexed', 'Not Indexed']),
                'urutan' => 8,
            ],
            [
                'nama' => 'ProQuest',
                'peringkat' => json_encode(['Indexed', 'Not Indexed']),
                'urutan' => 9,
            ],
            [
                'nama' => 'Hak Kekayaan Intelektual',
                'peringkat' => json_encode(['Paten', 'Hak Cipta', 'Merek']),
                'urutan' => 10,
            ],
        ];

        foreach ($categories as $data) {
            $data['created_at'] = now();
            $data['updated_at'] = now();
            DB::table('publication_categories')->insert($data);
        }
    }

    protected function seedKegiatanPengajuan(): void
    {
        $penelitianKegiatan = [
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
        ];

        $pkmKegiatan = [
            'CLAIM_DANA_PKM_GANJIL' => 'Claim Dana PkM Ganjil',
            'PROSES_PKM_GANJIL' => 'Proses PkM Ganjil',
            'PUBLIKASI_PKM_GANJIL' => 'Publikasi PkM Ganjil',
            'PENGEMBALIAN_DANA_GANJIL' => 'Pengembalian Dana PkM Ganjil',
            'DISEMINASI_PKM_GANJIL' => 'Diseminasi PkM Ganjil',
        ];

        $prefixes = ['', 'S2_', 'S3_'];
        $skemaIds = [];

        foreach ($prefixes as $i => $prefix) {
            $skemaRecord = DB::table('skema')->orderBy('skema_id')->skip($i)->first();
            if ($skemaRecord) {
                $skemaIds[$prefix] = $skemaRecord->skema_id;
            }
        }

        foreach ($prefixes as $prefix) {
            $skemaId = $skemaIds[$prefix];
            $isFirstSkema = ($prefix === '');

            foreach ($penelitianKegiatan as $code => $nama) {
                $prefixedCode = $prefix . $code;
                $this->insertKegiatan($skemaId, $prefixedCode, $nama, 'Penelitian', $isFirstSkema);
            }

            foreach ($pkmKegiatan as $code => $nama) {
                $prefixedCode = $prefix . $code;
                $this->insertKegiatan($skemaId, $prefixedCode, $nama, 'PkM', $isFirstSkema);
            }
        }
    }

    protected function insertKegiatan(int $skemaId, string $code, string $nama, string $jenisPenelitian, bool $storeInMemory): void
    {
        $data = [
            'skema_id' => $skemaId,
            'kode_kegiatan' => $code,
            'nama_kegiatan' => $nama,
            'jenis_penelitian' => $jenisPenelitian,
            'tgl_mulai' => '2026-01-01',
            'tgl_selesai' => '2026-12-31',
            'status' => 'Terbuka',
            'manual_status_override' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $data['kegiatan_id'] = DB::table('kegiatan_pengajuan')->insertGetId($data);

        if ($storeInMemory) {
            $this->kegiatan[$code] = (object) $data;
        }
    }
}
