<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->text('hasil_pelaksanaan')->nullable()->after('catatan');
            $table->text('status_luaran')->nullable()->after('hasil_pelaksanaan');
            $table->text('peran_mitra')->nullable()->after('status_luaran');
            $table->text('kendala_pelaksanaan')->nullable()->after('peran_mitra');
            $table->text('rencana_tahapan_selanjutnya')->nullable()->after('kendala_pelaksanaan');
            $table->text('daftar_pustaka')->nullable()->after('rencana_tahapan_selanjutnya');
        });
    }

    public function down(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->dropColumn([
                'hasil_pelaksanaan',
                'status_luaran',
                'peran_mitra',
                'kendala_pelaksanaan',
                'rencana_tahapan_selanjutnya',
                'daftar_pustaka',
            ]);
        });
    }
};
