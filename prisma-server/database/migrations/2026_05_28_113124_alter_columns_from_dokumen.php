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
        Schema::table('dokumen', function (Blueprint $table) {
            $table->foreignId('current_version_id')->nullable()->after('jenis_dokumen');

            $table->dropColumn('nama_file');
            $table->dropColumn('drive_file_id');
            $table->dropColumn('drive_file_url');
            $table->dropColumn('local_file_url');
            $table->dropColumn('tgl_upload');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dokumen', function (Blueprint $table) {
            //
        });
    }
};
