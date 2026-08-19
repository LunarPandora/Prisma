<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('periode_pengajuan', function (Blueprint $table) {
            $table->boolean('manual_status_override')
                ->default(false)
                ->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('periode_pengajuan', function (Blueprint $table) {
            $table->dropColumn('manual_status_override');
        });
    }
};
