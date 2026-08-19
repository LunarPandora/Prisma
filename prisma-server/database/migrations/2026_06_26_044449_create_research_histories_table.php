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
        Schema::create('research_histories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('peneliti_detail_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->enum('kategori', [
                'kemdikbud',
                'internal'
            ]);

            $table->string('judul');

            $table->year('tahun');

            $table->decimal('dana_disetujui', 18, 2);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('research_histories');
    }
};
