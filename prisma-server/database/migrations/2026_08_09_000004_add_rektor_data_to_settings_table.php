<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add Rektor data fields for document generation.
     * Rektor is admin data, not a login role.
     */
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('rektor_nama')->nullable()->after('rektor');
            $table->string('rektor_nidn')->nullable()->after('rektor_nama');
            $table->string('rektor_nuptk')->nullable()->after('rektor_nidn');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['rektor_nama', 'rektor_nidn', 'rektor_nuptk']);
        });
    }
};
