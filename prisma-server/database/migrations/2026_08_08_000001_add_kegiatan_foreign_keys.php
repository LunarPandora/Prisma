<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proposal', function (Blueprint $table) {
            $table->foreign('kegiatan_id')
                ->references('kegiatan_id')
                ->on('kegiatan_pengajuan')
                ->cascadeOnDelete();
        });

        Schema::table('laporan', function (Blueprint $table) {
            $table->foreign('kegiatan_id')
                ->references('kegiatan_id')
                ->on('kegiatan_pengajuan')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('proposal', function (Blueprint $table) {
            $table->dropForeign(['kegiatan_id']);
        });

        Schema::table('laporan', function (Blueprint $table) {
            $table->dropForeign(['kegiatan_id']);
        });
    }
};
