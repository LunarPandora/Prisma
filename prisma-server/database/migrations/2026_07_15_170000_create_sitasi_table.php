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
        Schema::create('sitasi', function (Blueprint $table) {
            $table->id('sitasi_id');

            $table->foreignId('laporan_id')
                ->constrained('laporan', 'laporan_id')
                ->cascadeOnDelete();

            $table->string('judul_sitasi');
            $table->string('sumber')->nullable();
            $table->year('tahun')->nullable();
            $table->text('url')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sitasi');
    }
};
