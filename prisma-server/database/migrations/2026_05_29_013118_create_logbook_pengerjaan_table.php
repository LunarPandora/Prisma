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
        Schema::create('logbook_pengerjaan', function (Blueprint $table) {
            $table->id('logbook_id');
            $table->foreignId('laporan_id')->constrained('laporan', 'laporan_id');
            $table->foreignId('user_id')->constrained('users', 'id');
            $table->string('judul');
            $table->text('deskripsi');
            $table->date('tgl_kegiatan');
            $table->text('lampiran_drive_id')->nullable();
            $table->text('lampiran_drive_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logbook_pengerjaan');
    }
};
