<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Rename kode_periode in periode_pengajuan table
        DB::table('periode_pengajuan')
            ->where('kode_periode', 'PENGUMUMAN_SK')
            ->update(['kode_periode' => 'PENGUMUMAN_SURAT_TUGAS']);

        // Rename jenis_dokumen in dokumen table
        DB::table('dokumen')
            ->where('jenis_dokumen', 'Pengumuman SK')
            ->update(['jenis_dokumen' => 'Pengumuman Surat Tugas']);

        // Update nama_periode in periode_pengajuan table
        DB::table('periode_pengajuan')
            ->where('kode_periode', 'PENGUMUMAN_SURAT_TUGAS')
            ->update(['nama_periode' => 'Pengumuman Surat Tugas Proposal']);
    }

    public function down(): void
    {
        // Revert kode_periode
        DB::table('periode_pengajuan')
            ->where('kode_periode', 'PENGUMUMAN_SURAT_TUGAS')
            ->update(['kode_periode' => 'PENGUMUMAN_SK']);

        // Revert jenis_dokumen
        DB::table('dokumen')
            ->where('jenis_dokumen', 'Pengumuman Surat Tugas')
            ->update(['jenis_dokumen' => 'Pengumuman SK']);

        // Revert nama_periode
        DB::table('periode_pengajuan')
            ->where('kode_periode', 'PENGUMUMAN_SK')
            ->update(['nama_periode' => 'Pengumuman SK Proposal']);
    }
};
