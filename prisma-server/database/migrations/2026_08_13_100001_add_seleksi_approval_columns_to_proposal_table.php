<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proposal', function (Blueprint $table) {
            $table->boolean('ketua_seleksi_approved')->default(false)->after('status');
            $table->boolean('staff_seleksi_approved')->default(false)->after('ketua_seleksi_approved');
        });
    }

    public function down(): void
    {
        Schema::table('proposal', function (Blueprint $table) {
            $table->dropColumn(['ketua_seleksi_approved', 'staff_seleksi_approved']);
        });
    }
};
