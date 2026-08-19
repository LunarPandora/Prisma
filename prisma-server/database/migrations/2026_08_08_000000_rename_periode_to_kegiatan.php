<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $tables = DB::select("SHOW TABLES LIKE 'periode_pengajuan'");
        if (empty($tables)) return;

        // Drop foreign keys if they exist
        $fks = DB::select("
            SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME IN ('proposal', 'laporan')
            AND REFERENCED_TABLE_NAME = 'periode_pengajuan'
        ");
        foreach ($fks as $fk) {
            $table = $fk->TABLE_NAME ?? null;
            if (!$table) continue;
            try { Schema::table($table, fn(Blueprint $t) => $t->dropForeign($fk->CONSTRAINT_NAME)); } catch (\Throwable $e) {}
        }

        // Rename table
        Schema::rename('periode_pengajuan', 'kegiatan_pengajuan');

        // Rename columns in kegiatan_pengajuan
        Schema::table('kegiatan_pengajuan', function (Blueprint $table) {
            if (Schema::hasColumn('kegiatan_pengajuan', 'periode_id')) {
                $table->renameColumn('periode_id', 'kegiatan_id');
            }
            if (Schema::hasColumn('kegiatan_pengajuan', 'kode_periode')) {
                $table->renameColumn('kode_periode', 'kode_kegiatan');
            }
            if (Schema::hasColumn('kegiatan_pengajuan', 'nama_periode')) {
                $table->renameColumn('nama_periode', 'nama_kegiatan');
            }
        });

        // Rename columns in proposal
        Schema::table('proposal', function (Blueprint $table) {
            if (Schema::hasColumn('proposal', 'periode_id')) {
                $table->renameColumn('periode_id', 'kegiatan_id');
            }
        });

        // Rename columns in laporan
        Schema::table('laporan', function (Blueprint $table) {
            if (Schema::hasColumn('laporan', 'periode_id')) {
                $table->renameColumn('periode_id', 'kegiatan_id');
            }
        });

        // Rename column in settings
        Schema::table('settings', function (Blueprint $table) {
            if (Schema::hasColumn('settings', 'ignore_periode_dates')) {
                $table->renameColumn('ignore_periode_dates', 'ignore_kegiatan_dates');
            }
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->renameColumn('ignore_kegiatan_dates', 'ignore_periode_dates');
        });

        Schema::table('laporan', function (Blueprint $table) {
            $table->renameColumn('kegiatan_id', 'periode_id');
        });

        Schema::table('proposal', function (Blueprint $table) {
            $table->renameColumn('kegiatan_id', 'periode_id');
        });

        Schema::table('kegiatan_pengajuan', function (Blueprint $table) {
            $table->renameColumn('kegiatan_id', 'periode_id');
            $table->renameColumn('kode_kegiatan', 'kode_periode');
            $table->renameColumn('nama_kegiatan', 'nama_periode');
        });

        Schema::rename('kegiatan_pengajuan', 'periode_pengajuan');
    }
};
