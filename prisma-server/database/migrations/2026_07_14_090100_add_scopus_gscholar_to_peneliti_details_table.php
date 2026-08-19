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
        Schema::table('peneliti_details', function (Blueprint $table) {
            $table->string('scopus_id')->nullable()->after('sinta_id');
            $table->string('google_scholar_id')->nullable()->after('scopus_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('peneliti_details', function (Blueprint $table) {
            $table->dropColumn(['scopus_id', 'google_scholar_id']);
        });
    }
};
