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
            $table->dropColumn('nidn');
        });
    }

    public function down(): void
    {
        Schema::table('peneliti_details', function (Blueprint $table) {
            $table->string('nidn')->nullable()->after('user_id');
        });
    }
};
