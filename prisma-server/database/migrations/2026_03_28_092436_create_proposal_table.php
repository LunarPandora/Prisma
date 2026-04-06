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
        Schema::create('proposal', function (Blueprint $table) {
            $table->id('proposal_id');
            $table->string('judul');
            $table->foreignId('dosen_id')->constrained('dosen', 'dosen_id');
            $table->foreignId('periode_id')->constrained('periode_pengajuan', 'periode_id');
            $table->date('tgl_pengajuan');
            $table->enum('status', ['Menunggu review', 'Disetujui', 'Disetujui dengan perbaikan', 'Ditolak']);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal');
    }
};
