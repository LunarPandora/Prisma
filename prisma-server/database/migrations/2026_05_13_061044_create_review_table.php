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
        Schema::create('review', function (Blueprint $table) {
            $table->id('review_id');
            $table->foreignId('penugasan_id')->constrained('penugasan_reviewer', 'penugasan_id');
            $table->enum('keputusan', ['Diterima', 'Diterima dengan perbaikan', 'Ditolak']);
            $table->json('kriteria_kesesuaian_tema')->nullable();
            $table->text('catatan');
            $table->date('tgl_review');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('review');
    }
};
