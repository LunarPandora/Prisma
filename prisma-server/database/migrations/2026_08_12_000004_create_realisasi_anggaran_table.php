<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('realisasi_anggaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('laporan_id')
                ->constrained('laporan', 'laporan_id')
                ->cascadeOnDelete();
            $table->string('item_kebutuhan');
            $table->string('satuan');
            $table->integer('jumlah_item');
            $table->decimal('harga_satuan', 15, 2);
            $table->decimal('total', 15, 2);
            $table->timestamps();

            $table->index('laporan_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('realisasi_anggaran');
    }
};
