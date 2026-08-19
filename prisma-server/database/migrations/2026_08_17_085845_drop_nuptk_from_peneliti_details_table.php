<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('peneliti_details', function (Blueprint $table) {
            $table->dropColumn('nuptk');
        });
    }

    public function down(): void
    {
        Schema::table('peneliti_details', function (Blueprint $table) {
            $table->string('nuptk')->nullable()->after('kolab_id');
        });
    }
};
