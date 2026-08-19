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

            $table->foreignId('skema_id')
                ->constrained('skema', 'skema_id')
                ->cascadeOnDelete();

            $table->enum('jenis_penelitian', [
                'Penelitian',
                'PkM'
            ]);

            $table->string('kode_periode');
            $table->string('nama_periode');
            $table->date('tgl_mulai')->nullable();
            $table->date('tgl_selesai')->nullable();
            $table->enum('status', [
                'Belum dibuka',
                'Terbuka',
                'Selesai'
            ])->default('Belum dibuka');

            $table->timestamps();
            $table->softDeletes();

            $table->unique([
                'skema_id',
                'jenis_penelitian',
                'kode_periode'
            ]);
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
