<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Prodi;
use App\Models\Settings;
use App\Models\PenelitiDetail;
use App\Models\Mahasiswa;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SUSUsersSeeder extends Seeder
{
    public $prodi = [];
    public $dosen = [];
    public $staff = [];
    public $ketua = [];
    public $reviewers = [];
    public $kolaborator = [];
    public $superadmin;

    public function run(): void
    {
        $this->seedProdi();
        $this->seedUsers();
        $this->seedSettings();
        $this->seedPenelitiDetails();
        $this->seedMahasiswa();
        $this->seedKolaborator();

        $this->command->info('');
        $this->command->info('SUSUsersSeeder completed successfully!');
        $this->command->info('Prodi: ' . count($this->prodi));
        $this->command->info('Users: ' . (count($this->dosen) + count($this->staff) + count($this->ketua) + count($this->reviewers) + 1));
        $this->command->info('Dosen: ' . count($this->dosen));
        $this->command->info('Staff: ' . count($this->staff));
        $this->command->info('Ketua: ' . count($this->ketua));
        $this->command->info('Reviewers: ' . count($this->reviewers));
        $this->command->info('Mahasiswa: ' . Mahasiswa::count());
        $this->command->info('Kolaborator: ' . count($this->kolaborator));
    }

    protected function seedProdi(): void
    {
        $prodiNames = [
            'Sistem Teknologi dan Informasi',
            'Bisnis Digital',
            'Kewirausahaan',
            'Informatika',
            'Manajemen',
            'Akuntansi',
            'Teknik Elektro',
            'Desain Komunikasi Visual',
            'Kedokteran',
            'Hukum',
            'Teknik Mesin',
            'Teknik Sipil',
            'Biologi',
            'Kimia',
            'Fisika',
            'Matematika',
            'Ekonomi',
            'Sastra Inggris',
            'Psikologi',
            'Sosiologi',
            'Ilmu Komunikasi',
            'Hubungan Internasional',
            'Arsitektur',
            'Pertanian',
            'Kehutanan',
            'Perikanan',
            'Kedokteran Gigi',
            'Farmasi',
            'Keperawatan',
            'Ilmu Hukum',
        ];

        foreach ($prodiNames as $name) {
            $prodi = Prodi::create(['nama_prodi' => $name]);
            $this->prodi[] = $prodi;
        }
    }

    protected function seedUsers(): void
    {
        // Superadmin (1)
        $this->superadmin = User::create([
            'nama' => 'Superadmin Utama',
            'email' => 'sustest.superadmin@itbss.ac.id',
            'password' => Hash::make('password'),
            'role' => 'Superadmin',
            'nidn' => '90001',
            'no_hp' => '081234567801',
            'prodi_id' => $this->prodi[0]->prodi_id,
            'email_verified_at' => now(),
            'status' => 'Aktif',
            'gender' => 'L',
            'remember_token' => Str::random(10),
        ]);

        // Ketua LPPM (12)
        $ketuaNames = [
            'Dr. Siti Nurhaliza, M.Kom.',
            'Prof. Bambang Sugiharto, M.T.',
            'Dr. Rina Wulandari, S.Pd., M.Pd.',
            'Dr. Hendra Pratama, M.E.',
            'Dr. Dewi Kartika, M.Kom.',
            'Prof. Agus Supriyadi, M.T.',
            'Dr. Maya Indah, S.Ak., M.Ak.',
            'Dr. Fauzi Hakim, S.Kom., M.Kom.',
            'Dr. Lestari Putri, S.Pd., M.Pd.',
            'Prof. Joko Widodo, M.T.',
            'Dr. Sari Murni, S.E., M.M.',
            'Dr. Rudi Hartono, S.Kom., M.Kom.',
        ];
        $ketuaGenders = ['P', 'L', 'P', 'L', 'P', 'L', 'P', 'L', 'P', 'L', 'P', 'L'];

        foreach ($ketuaNames as $i => $name) {
            $user = User::create([
                'nama' => $name,
                'email' => $i === 0 ? 'sustest.ketua@itbss.ac.id' : 'ketua.lppm' . ($i + 1) . '@itbss.ac.id',
                'password' => Hash::make('password'),
                'role' => 'Ketua LPPM',
                'nidn' => (string) (10001 + $i),
                'gender' => $ketuaGenders[$i],
                'no_hp' => '08123456' . str_pad(890 + $i, 4, '0', STR_PAD_LEFT),
                'prodi_id' => $this->prodi[$i % count($this->prodi)]->prodi_id,
                'email_verified_at' => now(),
                'status' => 'Aktif',
                'remember_token' => Str::random(10),
            ]);
            $this->ketua[] = $user;
        }

        // Staff LPPM (12)
        $staffNames = [
            'Ahmad Fauzi, S.Kom.',
            'Dewi Kartika, S.E.',
            'Hendra Wijaya, S.T.',
            'Maya Putri, S.Pd.',
            'Rina Susanti, S.Ak.',
            'Budi Prasetyo, S.Kom.',
            'Nina Marlina, S.E.',
            'Tono Sugiarto, S.T.',
            'Putri Rahayu, S.Pd.',
            'Wahyu Hidayat, S.Kom.',
            'Nurul Huda, S.Ak.',
            'Bambang Pamungkas, S.T.',
        ];
        $staffGenders = ['L', 'P', 'L', 'P', 'P', 'L', 'P', 'L', 'P', 'L', 'P', 'L'];

        foreach ($staffNames as $i => $name) {
            $user = User::create([
                'nama' => $name,
                'email' => $i === 0 ? 'sustest.staff@itbss.ac.id' : 'staff.lppm' . ($i + 1) . '@itbss.ac.id',
                'password' => Hash::make('password'),
                'role' => 'Staff LPPM',
                'nidn' => (string) (10010 + $i),
                'gender' => $staffGenders[$i],
                'no_hp' => '08123456' . str_pad(870 + $i, 4, '0', STR_PAD_LEFT),
                'prodi_id' => $this->prodi[$i % count($this->prodi)]->prodi_id,
                'email_verified_at' => now(),
                'status' => 'Aktif',
                'remember_token' => Str::random(10),
            ]);
            $this->staff[] = $user;
        }

        // Dosen (45)
        $dosenNames = [
            'Dr. Andi Pratama, M.Kom.',
            'Siti Rahmawati, S.T., M.T.',
            'Budi Santoso, S.Kom., M.Kom.',
            'Ratna Dewi, S.Pd., M.Pd.',
            'Eko Prasetyo, S.E., M.E.',
            'Lestari Wulandari, S.Ak., M.Ak.',
            'Agus Setiawan, S.T., M.T.',
            'Dian Kusuma, S.Ds., M.Ds.',
            'Hari Kurniawan, S.Kom., M.Kom.',
            'Nina Susanti, S.E., M.M.',
            'Rudi Hermawan, S.T., M.T.',
            'Wati Susilawati, S.Pd., M.Pd.',
            'Joko Prayitno, S.Kom., M.Kom.',
            'Sri Mulyani, S.Ak., M.Ak.',
            'Dodi Gunawan, S.T., M.T.',
            'Fauzi Rahman, S.Kom., M.Kom.',
            'Dewi Lestari, S.Pd., M.Pd.',
            'Hendra Kusuma, S.T., M.T.',
            'Maya Sari, S.E., M.M.',
            'Rizki Pratama, S.Kom., M.Kom.',
            'Anisa Permata, S.Pd., M.Pd.',
            'Dimas Ardianto, S.T., M.T.',
            'Sari Dewi, S.Ak., M.Ak.',
            'Fajar Nugroho, S.Kom., M.Kom.',
            'Rina Marlina, S.E., M.E.',
            'Tono Sugiarto, S.T., M.T.',
            'Putri Rahayu, S.Pd., M.Pd.',
            'Wahyu Hidayat, S.Kom., M.Kom.',
            'Nurul Huda, S.Ak., M.Ak.',
            'Bambang Pamungkas, S.T., M.T.',
            'Citra Kirana, S.E., M.M.',
            'Dedi Kurniawan, S.Kom., M.Kom.',
            'Eka Wulandari, S.Pd., M.Pd.',
            'Gilang Ramadhan, S.T., M.T.',
            'Hana Permata, S.Ak., M.Ak.',
            'Indra Gunawan, S.Kom., M.Kom.',
            'Julia Perez, S.E., M.E.',
            'Kuncoro Adi, S.T., M.T.',
            'Lia Anggraini, S.Pd., M.Pd.',
            'Muhammad Fadil, S.Kom., M.Kom.',
            'Nita Sari, S.Ak., M.Ak.',
            'Omar Dani, S.T., M.T.',
            'Putra Wijaya, S.E., M.M.',
            'Rika Susanti, S.Pd., M.Pd.',
            'Sanusi Latif, S.Kom., M.Kom.',
        ];

        foreach ($dosenNames as $i => $name) {
            $user = User::create([
                'nama' => $name,
                'email' => $i === 0 ? 'sustest.dosen@itbss.ac.id' : 'dosen.' . str_pad($i + 1, 2, '0', STR_PAD_LEFT) . '@itbss.ac.id',
                'password' => Hash::make('password'),
                'role' => 'Dosen',
                'nidn' => (string) (20001 + $i),
                'prodi_id' => $this->prodi[$i % count($this->prodi)]->prodi_id,
                'gender' => $i % 2 === 0 ? 'L' : 'P',
                'no_hp' => '08123456' . str_pad(800 + $i, 4, '0', STR_PAD_LEFT),
                'email_verified_at' => now(),
                'status' => 'Aktif',
                'remember_token' => Str::random(10),
            ]);
            $this->dosen[] = $user;
        }

        // Reviewers (30)
        $reviewerNames = [
            'Prof. Dr. Ahmad Dahlan, M.T.',
            'Dr. Fatimah Azzahra, M.Kom.',
            'Dr. Hendro Wibowo, M.T.',
            'Dr. Kartini Sari, M.Pd.',
            'Dr. Lukman Hakim, S.E., M.E.',
            'Dr. Maya Sari, S.Ak., M.Ak.',
            'Dr. Nugroho Adi, S.T., M.T.',
            'Dr. Ophelia Chen, M.Ds.',
            'Dr. Prabowo Subianto, S.Kom., M.Kom.',
            'Dr. Ratna Sari, M.T.',
            'Prof. Dr. Siti Aminah, M.Kom.',
            'Dr. Tommy Wijaya, S.T., M.T.',
            'Dr. Ulya Hidayati, S.Pd., M.Pd.',
            'Dr. Viktor Tanuwijaya, S.E., M.E.',
            'Dr. Winda Oktaviani, S.Ak., M.Ak.',
            'Dr. Yanto Kurniawan, S.Kom., M.Kom.',
            'Dr. Zaki Mubarok, S.T., M.T.',
            'Prof. Dr. Ani Wijayanti, M.Pd.',
            'Dr. Bambang Triyono, S.E., M.M.',
            'Dr. Citra Resmi, S.Ak., M.Ak.',
            'Dr. Darmawan Setiawan, S.Kom., M.Kom.',
            'Dr. Eka Putri, S.Pd., M.Pd.',
            'Dr. Fandi Ahmad, S.T., M.T.',
            'Dr. Gita Puspita, S.E., M.E.',
            'Dr. Hadi Nugroho, S.Kom., M.Kom.',
            'Dr. Indah Permatasari, S.Ak., M.Ak.',
            'Dr. Jufri Alam, S.T., M.T.',
            'Dr. Kania Sari, S.Pd., M.Pd.',
            'Dr. Lutfi Hakim, S.Kom., M.Kom.',
            'Dr. Mira Anggraeni, S.E., M.M.',
            'Dr. Nandi Sukarna, S.T., M.T.',
        ];

        foreach ($reviewerNames as $i => $name) {
            $user = User::create([
                'nama' => $name,
                'email' => $i === 0 ? 'sustest.reviewer@itbss.ac.id' : 'reviewer.' . str_pad($i + 1, 2, '0', STR_PAD_LEFT) . '@itbss.ac.id',
                'password' => Hash::make('password'),
                'role' => 'Reviewer',
                'nidn' => (string) (30001 + $i),
                'prodi_id' => $this->prodi[$i % count($this->prodi)]->prodi_id,
                'gender' => $i % 2 === 0 ? 'L' : 'P',
                'no_hp' => '08123456' . str_pad(850 + $i, 4, '0', STR_PAD_LEFT),
                'email_verified_at' => now(),
                'status' => 'Aktif',
                'remember_token' => Str::random(10),
            ]);
            $this->reviewers[] = $user;
        }
    }

    protected function seedSettings(): void
    {
        $kriteriaPenilaian = json_encode([
            ['nama' => 'Kesesuaian Tema', 'bobot' => 30],
            ['nama' => 'Metodologi', 'bobot' => 30],
            ['nama' => 'Timeline', 'bobot' => 20],
            ['nama' => 'Anggaran', 'bobot' => 20],
        ]);

        $listKesesuaianTema = json_encode([
            'Teknologi Informasi',
            'Bisnis Digital',
            'Kewirausahaan',
            'Informatika',
            'Manajemen',
            'Akuntansi',
            'Teknik Elektro',
            'Desain Komunikasi Visual',
            'Kedokteran',
            'Hukum'
        ]);

        Settings::create([
            'kepala_lppm' => $this->ketua[0]->id,
            'rektor' => $this->superadmin->id,
            'rektor_nama' => 'Prof. Dr. Suharto, M.T.',
            'rektor_nidn' => '99001',
            'rektor_nuptk' => '99001',
            'nama_kampus' => 'ITB SUS Testing',
            'kriteria_penilaian' => $kriteriaPenilaian,
            'list_kesesuaian_tema' => $listKesesuaianTema,
            'ignore_kegiatan_dates' => true,
        ]);
    }

    protected function seedPenelitiDetails(): void
    {
        foreach ($this->dosen as $dosen) {
            PenelitiDetail::create([
                'user_id' => $dosen->id,
                'jabatan' => 'Dosen Tetap',
                'pangkat_golongan' => 'IV/a',
                'no_hp' => $dosen->nidn,
                'h_index' => rand(3, 25),
            ]);
        }
    }

    protected function seedMahasiswa(): void
    {
        $mahasiswaNames = [
            'Rizky Pratama',
            'Anisa Putri',
            'Dimas Ardianto',
            'Sari Dewi',
            'Fajar Nugroho',
            'Rina Marlina',
            'Tono Sugiarto',
            'Putri Rahayu',
            'Wahyu Hidayat',
            'Nurul Huda',
            'Bambang Pamungkas',
            'Citra Kirana',
            'Dedi Kurniawan',
            'Eka Wulandari',
            'Gilang Ramadhan',
        ];

        foreach ($mahasiswaNames as $i => $name) {
            $prodiIndex = $i % count($this->prodi);
            Mahasiswa::create([
                'nama' => $name,
                'nim' => '1082' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'prodi_id' => $this->prodi[$prodiIndex]->prodi_id,
                'email' => strtolower(str_replace(' ', '.', $name)) . '@student.itbss.ac.id',
            ]);
        }
    }

    protected function seedKolaborator(): void
    {
        $kolaboratorData = [
            ['nama' => 'Dr. Ir. Suharto, M.T.', 'nidn' => '40001', 'email' => 'suharto@ui.ac.id', 'no_hp' => '081234567901', 'prodi' => 'Teknik Informatika', 'institusi' => 'Universitas Indonesia'],
            ['nama' => 'Prof. Dr. Rini Wijayanti, S.E., M.E.', 'nidn' => '40002', 'email' => 'rini@ugm.ac.id', 'no_hp' => '081234567902', 'prodi' => 'Manajemen', 'institusi' => 'Universitas Gadjah Mada'],
            ['nama' => 'Dr. Bambang Riadi, S.Kom., M.Kom.', 'nidn' => '40003', 'email' => 'bambang@its.ac.id', 'no_hp' => '081234567903', 'prodi' => 'Informatika', 'institusi' => 'Institut Teknologi Sepuluh Nopember'],
            ['nama' => 'Dr. Dewi Anggraini, S.Pd., M.Pd.', 'nidn' => '40004', 'email' => 'dewi@unpad.ac.id', 'no_hp' => '081234567904', 'prodi' => 'Pendidikan', 'institusi' => 'Universitas Padjadjaran'],
            ['nama' => 'Dr. Eko Sudarsono, S.T., M.T.', 'nidn' => '40005', 'email' => 'eko@undip.ac.id', 'no_hp' => '081234567905', 'prodi' => 'Teknik Elektro', 'institusi' => 'Universitas Diponegoro'],
            ['nama' => 'Dr. Fitri Handayani, S.Ak., M.Ak.', 'nidn' => '40006', 'email' => 'fitri@unair.ac.id', 'no_hp' => '081234567906', 'prodi' => 'Akuntansi', 'institusi' => 'Universitas Airlangga'],
            ['nama' => 'Dr. Gunawan Wibisono, S.H., M.H.', 'nidn' => '40007', 'email' => 'gunawan@unsoed.ac.id', 'no_hp' => '081234567907', 'prodi' => 'Hukum', 'institusi' => 'Universitas Jenderal Soedirman'],
            ['nama' => 'Dr. Hana Permata, S.Ds., M.Ds.', 'nidn' => '40008', 'email' => 'hana@telkomuniversity.ac.id', 'no_hp' => '081234567908', 'prodi' => 'Desain', 'institusi' => 'Telkom University'],
            ['nama' => 'Dr. Irwan Setiawan, S.Ked., M.Ked.', 'nidn' => '40009', 'email' => 'irwan@unhas.ac.id', 'no_hp' => '081234567909', 'prodi' => 'Kedokteran', 'institusi' => 'Universitas Hasanuddin'],
            ['nama' => 'Dr. Joko Widodo, S.Pi., M.Pi.', 'nidn' => '40010', 'email' => 'joko@unpatti.ac.id', 'no_hp' => '081234567910', 'prodi' => 'Perikanan', 'institusi' => 'Universitas Pattimura'],
        ];

        foreach ($kolaboratorData as $i => $data) {
            $kolab = \App\Models\Kolaborator::create([
                'nama' => $data['nama'],
                'nidn' => $data['nidn'],
                'nuptk' => $data['nidn'],
                'email' => $data['email'],
                'no_hp' => $data['no_hp'],
                'prodi' => $data['prodi'],
                'institusi' => $data['institusi'],
            ]);
            $this->kolaborator[] = $kolab;
        }
    }
}
