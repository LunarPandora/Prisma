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
        Schema::table('penugasan_reviewer', function (Blueprint $table) {
            $table->enum('status_review', ['Belum direview', 'Telah direview'])->default('Belum direview')->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penugasan_reviewer', function (Blueprint $table) {
            //
        });
    }
};
