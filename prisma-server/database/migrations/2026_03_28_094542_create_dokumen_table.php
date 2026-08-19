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
        Schema::create('dokumen', function (Blueprint $table) {
            $table->id('dokumen_id');
            $table->foreignId('proposal_id')->constrained('proposal', 'proposal_id');
            $table->string('jenis_dokumen');

            $table->string('nama_file');
            $table->text('drive_file_id');
            $table->text('drive_file_url');
            $table->text('local_file_url');
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
        Schema::dropIfExists('dokumen');
    }
};
