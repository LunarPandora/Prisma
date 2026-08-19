<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->renameColumn('realisasi_data_collection', 'realisasi_biaya_penelitian');
        });
    }

    public function down(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->renameColumn('realisasi_biaya_penelitian', 'realisasi_data_collection');
        });
    }
};
