<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('logbook_pengerjaan', function (Blueprint $table) {
            $table->date('tgl_kegiatan_end')->nullable()->after('tgl_kegiatan');
        });
    }

    public function down(): void
    {
        Schema::table('logbook_pengerjaan', function (Blueprint $table) {
            $table->dropColumn('tgl_kegiatan_end');
        });
    }
};
