<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Skema;
use App\Models\Prodi;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Skema::create([
            'nama_skema' => 'Penelitian Dosen',
            'jenis' => 'Penelitian',
            'keterangan' => "Ini adalah penelitian dosen."
        ]);

        Skema::create([
            'nama_skema' => 'PkM Dosen',
            'jenis' => 'Pengabdian kepada Masyarakat',
            'keterangan' => "Ini adalah penelitian dosen."
        ]);

        Prodi::create(['nama_prodi' => 'Sistem Teknologi dan Informasi']);
        Prodi::create(['nama_prodi' => 'Bisnis Digital']);
        Prodi::create(['nama_prodi' => 'Kewirausahaan']);

        User::create([
            'nama' => 'Admin',
            'email' => 'admin_lppm@itbss.ac.id',
            'email_verified_at' => now(),
            'password' => Hash::make('admin123'),
            'role' => 'Admin',
            'status' => 'Aktif',
            'gender' => 'L',
            'remember_token' => Str::random(10),
        ]);
    }
}
