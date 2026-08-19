<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('authorization_requests', function (Blueprint $table) {
            $table->string('source_stage')->nullable()->after('action');
            $table->string('target_stage')->nullable()->after('source_stage');
        });
    }

    public function down(): void
    {
        Schema::table('authorization_requests', function (Blueprint $table) {
            $table->dropColumn(['source_stage', 'target_stage']);
        });
    }
};
