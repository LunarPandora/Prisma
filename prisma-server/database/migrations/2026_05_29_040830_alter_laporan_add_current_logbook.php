<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->foreignId('current_logbook_id')
                ->nullable()
                ->after('tgl_selesai')
                ->constrained('logbook_pengerjaan', 'logbook_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->dropForeign(['current_logbook_id']);
            $table->dropColumn('current_logbook_id');
        });
    }
};
