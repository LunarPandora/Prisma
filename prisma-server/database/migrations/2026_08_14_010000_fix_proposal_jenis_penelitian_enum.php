<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Change 'Pengabdian kepada Masyarakat' to 'PkM' to match kegiatan_pengajuan
        // and all backend comparisons (KegiatanStage, LaporanController, etc.)
        DB::table('proposal')
            ->where('jenis_penelitian', 'Pengabdian kepada Masyarakat')
            ->update(['jenis_penelitian' => 'PkM']);

        Schema::table('proposal', function (Blueprint $table) {
            $table->enum('jenis_penelitian', ['Penelitian', 'PkM'])->change();
        });
    }

    public function down(): void
    {
        DB::table('proposal')
            ->where('jenis_penelitian', 'PkM')
            ->update(['jenis_penelitian' => 'Pengabdian kepada Masyarakat']);

        Schema::table('proposal', function (Blueprint $table) {
            $table->enum('jenis_penelitian', ['Penelitian', 'Pengabdian kepada Masyarakat'])->change();
        });
    }
};
