<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add per-Laporan funding approval fields.
     * Ketua LPPM must approve funding before Staff can process.
     */
    public function up(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->boolean('dana_disetujui')->default(false)->after('dana_dikembalikan');
            $table->foreignId('dana_disetujui_by')->nullable()->after('dana_disetujui');
            $table->timestamp('dana_disetujui_at')->nullable()->after('dana_disetujui_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->dropColumn(['dana_disetujui', 'dana_disetujui_by', 'dana_disetujui_at']);
        });
    }
};
