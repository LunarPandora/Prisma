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
            $table->enum('jenis_penelitian',
                [
                    'Penelitian', 
                    'Pengabdian kepada Masyarakat'
                ]
            );
            $table->string('topik_penelitian');
            $table->string('bidang_ilmu');
            $table->string('fokus_sdg');
            $table->double('ra_data_collection');
            $table->double('ra_biaya_publikasi');
            $table->double('ra_insentif');

            $table->string('target_publikasi_gan');
            $table->string('target_publikasi_gen');

            $table->text('rencana_judul_publikasi_gan');
            $table->text('rencana_judul_publikasi_gen');

            $table->text('metopen_gan');
            $table->text('metopen_gen');

            $table->text('unit_analisis_gan');
            $table->text('unit_analisis_gen');

            $table->text('kontribusi_ilmu_makul');
            $table->text('kontribusi_pkm');
            $table->text('rencana_luaran');
            $table->string('institusi_mitra')->default("-");

            $table->foreignId('user_id')->constrained('users', 'id');
            $table->foreignId('periode_id')->constrained('periode_pengajuan', 'periode_id');
            $table->enum('skema', 
                [
                    'Internal', 
                    'Eksternal', 
                    'Mandiri'
                ]
            );
            $table->string('sumber_skema');
            $table->enum('status', 
                [
                    // Pengajuan
                    'Draft', 
                    'Ditarik', 
                    'Ditolak',
                    'Menunggu proposal untuk diupload',
                    'Menunggu penugasan reviewer', 

                    // Review
                    'Menunggu review', 

                    // Logbook
                    'Dalam pengerjaan'
                ]
            );
            $table->date('tgl_pengajuan')->nullable();
            $table->text('catatan')->nullable();
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
