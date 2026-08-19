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
        Schema::create('laporan', function (Blueprint $table) {
            $table->id('laporan_id');

            $table->foreignId('proposal_id')->constrained('proposal', 'proposal_id');

            $table->enum('semester', [
                'Ganjil',
                'Genap'
            ]);

            $table->string('judul_penelitian');
            $table->text('metode_penelitian')->nullable();
            $table->text('unit_analisis')->nullable();

            $table->text('link_luaran_drive_id')->nullable();
            $table->text('link_luaran_drive_url')->nullable();

            $table->string('target_publikasi')->nullable();
            $table->text('link_publikasi')->nullable();

            $table->string('institusi_mitra')->nullable();

            $table->double('realisasi_data_collection')
                ->default(0);

            $table->double('realisasi_biaya_publikasi')
                ->default(0);

            $table->double('realisasi_insentif')
                ->default(0);

            $table->enum('status', [
                'Belum dimulai',
                'Dalam pengerjaan',
                'Menunggu review',
                'Revisi',
                'Selesai'
            ])->default('Dalam pengerjaan');

            $table->date('tgl_mulai')->nullable();
            $table->date('tgl_submit')->nullable();
            $table->date('tgl_selesai')->nullable();

            // $table->foreignId('current_logbook_id')
            //     ->nullable()
            //     ->constrained('logbook_pengerjaan', 'logbook_id');

            $table->text('catatan')
                ->nullable();

            $table->timestamps();
            $table->softDeletes();

            /*
            |--------------------------------------------------------------------------
            | One Proposal = One Ganjil + One Genap
            |--------------------------------------------------------------------------
            */

            $table->unique([
                'proposal_id',
                'semester'
            ]);

            // Need to be confirmed later...
            // $table->text('hasil_capaian')->nullable();
            // $table->text('kendala')->nullable();
            // $table->text('solusi')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporan');
    }
};
