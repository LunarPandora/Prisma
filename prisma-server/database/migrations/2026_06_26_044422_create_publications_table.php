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
        Schema::create('publications', function (Blueprint $table) {
            $table->id();

            $table->foreignId('peneliti_detail_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('kategori', [
                'scopus',
                'internasional',
                'nasional_1_3',
                'nasional_4_6',
                'conference'
            ]);

            $table->string('judul');

            $table->enum('peran', [
                'first_author',
                'corresponding_author',
                'co_author'
            ]);

            $table->string('nama_jurnal');

            $table->year('tahun');

            $table->string('volume')->nullable();

            $table->string('issn')->nullable();

            $table->text('url')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('publications');
    }
};
