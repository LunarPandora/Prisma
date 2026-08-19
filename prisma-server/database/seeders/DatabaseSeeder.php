<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Prodi;
use App\Models\Mahasiswa;
use App\Models\Kolaborator;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Prodi
        $prodi1 = Prodi::create(['nama_prodi' => 'Sistem Teknologi dan Informasi']);
        $prodi2 = Prodi::create(['nama_prodi' => 'Bisnis Digital']);
        $prodi3 = Prodi::create(['nama_prodi' => 'Kewirausahaan']);

        // 1 Superadmin
        User::create([
            'nama' => 'Superadmin',
            'email' => 'superadmin@itbss.ac.id',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'Superadmin',
            'status' => 'Aktif',
            'gender' => 'L',
            'no_hp' => '081234567890',
            'remember_token' => Str::random(10),
        ]);

        // 1 Ketua LPPM
        User::create([
            'nama' => 'Ketua LPPM',
            'email' => 'ketua.lppm@itbss.ac.id',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'Ketua LPPM',
            'status' => 'Aktif',
            'gender' => 'P',
            'nidn' => '10001',
            'no_hp' => '081234567891',
            'prodi_id' => $prodi1->prodi_id,
            'remember_token' => Str::random(10),
        ]);

        // 2 Staff LPPM
        User::create([
            'nama' => 'Staff LPPM 1',
            'email' => 'staff.lppm1@itbss.ac.id',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'Staff LPPM',
            'status' => 'Aktif',
            'gender' => 'L',
            'nidn' => '10002',
            'no_hp' => '081234567892',
            'prodi_id' => $prodi2->prodi_id,
            'remember_token' => Str::random(10),
        ]);

        User::create([
            'nama' => 'Staff LPPM 2',
            'email' => 'staff.lppm2@itbss.ac.id',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'Staff LPPM',
            'status' => 'Aktif',
            'gender' => 'P',
            'nidn' => '10003',
            'no_hp' => '081234567893',
            'prodi_id' => $prodi3->prodi_id,
            'remember_token' => Str::random(10),
        ]);

        // 3 Dosen
        User::create([
            'nama' => 'Dosen A',
            'email' => 'dosen.a@itbss.ac.id',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'Dosen',
            'status' => 'Aktif',
            'gender' => 'L',
            'nidn' => '20001',
            'no_hp' => '081234567894',
            'prodi_id' => $prodi1->prodi_id,
            'remember_token' => Str::random(10),
        ]);

        User::create([
            'nama' => 'Dosen B',
            'email' => 'dosen.b@itbss.ac.id',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'Dosen',
            'status' => 'Aktif',
            'gender' => 'P',
            'nidn' => '20002',
            'no_hp' => '081234567895',
            'prodi_id' => $prodi2->prodi_id,
            'remember_token' => Str::random(10),
        ]);

        User::create([
            'nama' => 'Dosen C',
            'email' => 'dosen.c@itbss.ac.id',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'Dosen',
            'status' => 'Aktif',
            'gender' => 'L',
            'nidn' => '20003',
            'no_hp' => '081234567896',
            'prodi_id' => $prodi3->prodi_id,
            'remember_token' => Str::random(10),
        ]);

        // 3 Reviewer
        User::create([
            'nama' => 'Reviewer A',
            'email' => 'reviewer.a@itbss.ac.id',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'Reviewer',
            'status' => 'Aktif',
            'gender' => 'L',
            'nidn' => '30001',
            'no_hp' => '081234567897',
            'prodi_id' => $prodi1->prodi_id,
            'remember_token' => Str::random(10),
        ]);

        User::create([
            'nama' => 'Reviewer B',
            'email' => 'reviewer.b@itbss.ac.id',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'Reviewer',
            'status' => 'Aktif',
            'gender' => 'P',
            'nidn' => '30002',
            'no_hp' => '081234567898',
            'prodi_id' => $prodi2->prodi_id,
            'remember_token' => Str::random(10),
        ]);

        User::create([
            'nama' => 'Reviewer C',
            'email' => 'reviewer.c@itbss.ac.id',
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => 'Reviewer',
            'status' => 'Aktif',
            'gender' => 'L',
            'nidn' => '30003',
            'no_hp' => '081234567899',
            'prodi_id' => $prodi3->prodi_id,
            'remember_token' => Str::random(10),
        ]);

        // 3 Mahasiswa
        Mahasiswa::create([
            'nim' => '10820001',
            'nama' => 'Mahasiswa A',
            'prodi_id' => $prodi1->prodi_id,
        ]);

        Mahasiswa::create([
            'nim' => '10820002',
            'nama' => 'Mahasiswa B',
            'prodi_id' => $prodi2->prodi_id,
        ]);

        Mahasiswa::create([
            'nim' => '10820003',
            'nama' => 'Mahasiswa C',
            'prodi_id' => $prodi3->prodi_id,
        ]);

        // 3 Kolaborator
        Kolaborator::create([
            'nidn' => '40001',
            'nama' => 'Kolaborator A',
            'email' => 'kolab.a@university.ac.id',
            'no_hp' => '082134567890',
            'prodi' => 'Teknologi Informasi',
            'institusi' => 'Universitas Nasional',
        ]);

        Kolaborator::create([
            'nidn' => '40002',
            'nama' => 'Kolaborator B',
            'email' => 'kolab.b@university.ac.id',
            'no_hp' => '082134567891',
            'prodi' => 'Bisnis Digital',
            'institusi' => 'Universitas Terbuka',
        ]);

        Kolaborator::create([
            'nidn' => '40003',
            'nama' => 'Kolaborator C',
            'email' => 'kolab.c@university.ac.id',
            'no_hp' => '082134567892',
            'prodi' => 'Kewirausahaan',
            'institusi' => 'Institut Teknologi',
        ]);
    }
}
