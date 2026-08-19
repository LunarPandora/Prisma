<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->boolean('ketua_diseminasi_approved')
                ->default(false)
                ->after('status');

            $table->boolean('staff_diseminasi_approved')
                ->default(false)
                ->after('ketua_diseminasi_approved');
        });
    }

    public function down(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->dropColumn([
                'ketua_diseminasi_approved',
                'staff_diseminasi_approved',
            ]);
        });
    }
};
