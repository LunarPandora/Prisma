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
        Schema::create('hkis', function (Blueprint $table) {
            $table->id();

            $table->foreignId('peneliti_detail_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('judul');

            $table->year('tahun');

            $table->string('jenis')->nullable();

            $table->string('nomor')->nullable();

            $table->enum('status', [
                'terdaftar',
                'granted'
            ]);

            $table->text('url')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hkis');
    }
};
