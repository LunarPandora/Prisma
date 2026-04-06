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
        Schema::create('periode_pengajuan', function (Blueprint $table) {
            $table->bigIncrements('periode_id');
            $table->foreignId('skema_id')->constrained('skema', 'skema_id');
            $table->string('nama_periode');
            $table->date('tgl_mulai');
            $table->date('tgl_selesai');
            $table->enum('status', ['Belum dibuka', 'Terbuka', 'Selesai']);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('periode_pengajuan');
    }
};
