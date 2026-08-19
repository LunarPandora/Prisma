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
        Schema::create('dokumen_version', function (Blueprint $table) {
            $table->id('version_id');
            $table->foreignId('dokumen_id')->constrained('dokumen', 'dokumen_id');

            $table->foreignId('uploaded_by');
            $table->integer('version');

            $table->string('nama_file');

            $table->text('local_file_url');
            $table->text('drive_file_id');
            $table->text('drive_file_url');

            $table->text('catatan_revisi')->nullable();

            $table->dateTime('tgl_upload');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dokumen_version');
    }
};
