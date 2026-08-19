<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->timestamp('completed_at')->nullable()->after('tgl_selesai');
            $table->string('pengembalian_dana_skipped_reason')->nullable()->after('pengembalian_dana_confirmed_at');
        });
    }

    public function down(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->dropColumn(['completed_at', 'pengembalian_dana_skipped_reason']);
        });
    }
};
