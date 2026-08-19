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
        Schema::table('kolaborator', function (Blueprint $table) {
            $table->unsignedInteger('nuptk')->nullable()->after('nidn');
            $table->string('email')->after('nuptk');
            $table->string('no_hp')->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kolaborator', function (Blueprint $table) {
            //
        });
    }
};
