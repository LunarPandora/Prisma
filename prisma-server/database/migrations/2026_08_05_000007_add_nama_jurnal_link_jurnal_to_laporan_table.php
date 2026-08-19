<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->string('nama_jurnal')->nullable()->after('target_publikasi');
            $table->string('link_jurnal')->nullable()->after('nama_jurnal');
        });
    }

    public function down(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->dropColumn(['nama_jurnal', 'link_jurnal']);
        });
    }
};
