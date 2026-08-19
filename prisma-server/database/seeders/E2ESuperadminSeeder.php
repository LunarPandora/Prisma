<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Prodi;
use App\Models\Mahasiswa;
use App\Models\Kolaborator;
use App\Models\Settings;
use App\Models\PublicationCategory;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class E2ESuperadminSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        // ── Prodi ──
        $prodiTI = Prodi::create(['nama_prodi' => 'Sistem Teknologi dan Informasi']);
        $prodiBD = Prodi::create(['nama_prodi' => 'Bisnis Digital']);
        $prodiKW = Prodi::create(['nama_prodi' => 'Kewirausahaan']);

        // ── Superadmin (E2E login account) ──
        $superadmin = User::create([
            'nama' => 'Superadmin E2E', 'email' => 'superadmin.e2e@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Superadmin', 'status' => 'Aktif', 'gender' => 'L',
            'nidn' => '90001', 'nuptk' => '99001', 'no_hp' => '081234567800',
            'prodi_id' => $prodiTI->prodi_id, 'remember_token' => Str::random(10),
        ]);

        // ── Supporting users ──
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

        // ── Edit target user (for SA-USER-MUT-002) ──
        User::create([
            'nama' => 'E2E USER EDIT TARGET', 'email' => 'e2e.user.edit@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Dosen', 'status' => 'Aktif', 'gender' => 'L',
            'nidn' => '50001', 'nuptk' => '55001', 'no_hp' => '081234567810',
            'prodi_id' => $prodiTI->prodi_id, 'remember_token' => Str::random(10),
        ]);

        // ── Delete target user (for SA-USER-MUT-004) ──
        $deleteTarget = User::create([
            'nama' => 'E2E USER DELETE TARGET', 'email' => 'e2e.user.delete@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Dosen', 'status' => 'Nonaktif', 'gender' => 'P',
            'nidn' => '50002', 'nuptk' => '55002', 'no_hp' => '081234567811',
            'prodi_id' => $prodiBD->prodi_id, 'remember_token' => Str::random(10),
        ]);

        // ── Status toggle target (for SA-USER-MUT-003) ──
        User::create([
            'nama' => 'E2E USER STATUS TARGET', 'email' => 'e2e.user.status@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Dosen', 'status' => 'Aktif', 'gender' => 'L',
            'nidn' => '50003', 'nuptk' => '55003', 'no_hp' => '081234567812',
            'prodi_id' => $prodiTI->prodi_id, 'remember_token' => Str::random(10),
        ]);

        // ── Existing user for email uniqueness test (SA-USER-VAL-001) ──
        User::create([
            'nama' => 'Existing User', 'email' => 'existing.user@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Dosen', 'status' => 'Aktif', 'gender' => 'L',
            'nidn' => '50004', 'nuptk' => '55004', 'no_hp' => '081234567813',
            'prodi_id' => $prodiTI->prodi_id, 'remember_token' => Str::random(10),
        ]);

        // ── NIDN uniqueness test user (SA-USER-ID-004) ──
        User::create([
            'nama' => 'NIDN Unique User', 'email' => 'nidn.unique@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Dosen', 'status' => 'Aktif', 'gender' => 'L',
            'nidn' => '50005', 'nuptk' => '', 'no_hp' => '081234567814',
            'prodi_id' => $prodiBD->prodi_id, 'remember_token' => Str::random(10),
        ]);

        // ── NUPTK uniqueness test user (SA-USER-ID-005) ──
        User::create([
            'nama' => 'NUPTK Unique User', 'email' => 'nuptk.unique@itbss.ac.id',
            'email_verified_at' => $now, 'password' => Hash::make('password'),
            'role' => 'Dosen', 'status' => 'Aktif', 'gender' => 'P',
            'nidn' => '', 'nuptk' => '55006', 'no_hp' => '081234567815',
            'prodi_id' => $prodiKW->prodi_id, 'remember_token' => Str::random(10),
        ]);

        // ── Mahasiswa fixtures ──
        Mahasiswa::create([
            'nim' => 2026001, 'nama' => 'E2E MAHASISWA EDIT',
            'email' => 'e2e.mhs.edit@itbss.ac.id', 'prodi_id' => $prodiTI->prodi_id,
        ]);

        Mahasiswa::create([
            'nim' => 2026002, 'nama' => 'E2E MAHASISWA DELETE',
            'email' => 'e2e.mhs.delete@itbss.ac.id', 'prodi_id' => $prodiBD->prodi_id,
        ]);

        Mahasiswa::create([
            'nim' => 2026003, 'nama' => 'E2E NIM EXISTING',
            'email' => 'e2e.nim.existing@itbss.ac.id', 'prodi_id' => $prodiTI->prodi_id,
        ]);

        // ── Prodi edit target ──
        Prodi::create(['nama_prodi' => 'E2E PRODI EDIT TARGET']);

        // ── Prodi delete target ──
        Prodi::create(['nama_prodi' => 'E2E PRODI DELETE TARGET']);

        // ── Settings ──
        Settings::create([
            'kepala_lppm' => $ketua->id,
            'nama_kampus' => 'Institut Teknologi Batam Satu',
            'kriteria_penilaian' => json_encode([
                ['kriteria' => 'Kesesuaian Tema', 'bobot' => 30],
                ['kriteria' => 'Metodologi', 'bobot' => 30],
                ['kriteria' => 'Timeline', 'bobot' => 20],
                ['kriteria' => 'Anggaran', 'bobot' => 20],
            ]),
            'list_kesesuaian_tema' => json_encode(['SDGs', 'Teknologi', 'Kesehatan']),
            'ignore_kegiatan_dates' => true,
            'rektor_nama' => 'Prof. Rektor E2E',
            'rektor_nidn' => '90000',
            'rektor_nuptk' => '99000',
        ]);

        // ── Publication Categories ──
        PublicationCategory::create([
            'nama' => 'E2E Kategori Jurnal',
            'peringkat' => json_encode(['Q1', 'Q2', 'Q3']),
        ]);

        PublicationCategory::create([
            'nama' => 'E2E Kategori UNUSED',
            'peringkat' => json_encode(['Sinta 1', 'Sinta 2']),
        ]);

        // ── Kolaborator ──
        Kolaborator::create([
            'nidn' => '40001', 'nama' => 'Kolaborator A',
            'email' => 'kolab.a@university.ac.id', 'no_hp' => '082134567890',
            'prodi' => 'Teknologi Informasi', 'institusi' => 'Universitas Nasional',
        ]);

        // ── Notification for Superadmin ──
        Notification::create([
            'user_id' => $superadmin->id, 'type' => 'system.info',
            'title' => 'Selamat Datang di PRISMA',
            'message' => 'Sistem PRISMA telah dikonfigurasi untuk penggunaan E2E testing.',
            'data' => json_encode([]),
            'key' => 'e2e-superadmin-welcome',
        ]);

        Notification::create([
            'user_id' => $superadmin->id, 'type' => 'system.info',
            'title' => 'Notifikasi Belum Dibaca',
            'message' => 'Ini adalah notifikasi belum dibaca untuk testing.',
            'data' => json_encode([]),
            'key' => 'e2e-superadmin-unread',
        ]);

        // Print summary
        $this->command->info('E2E Superadmin fixtures seeded:');
        $this->command->info('  Superadmin: superadmin.e2e@itbss.ac.id / password');
        $this->command->info('  Prodi: 3 + 2 fixture = 5');
        $this->command->info('  Users: Superadmin, Ketua, Staff, + 7 fixture users');
        $this->command->info('  Mahasiswa: 3 fixtures');
        $this->command->info('  Kolaborator: 1');
        $this->command->info('  Settings: configured with kepala_lppm, nama_kampus, rektor data');
        $this->command->info('  Publication Categories: 2');
        $this->command->info('  Notifications: 2');
    }
}
