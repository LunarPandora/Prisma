<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('laporan_member', function (Blueprint $table) {
            $table->id('laporan_member_id');
            $table->foreignId('laporan_id')
                ->constrained('laporan', 'laporan_id')
                ->cascadeOnDelete();
            $table->unsignedBigInteger('member_id');
            $table->enum('role', ['Dosen', 'Mahasiswa', 'Kolaborator']);
            $table->integer('position')->default(0);
            $table->text('ttjp')->nullable();
            $table->timestamps();

            $table->index(['laporan_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laporan_member');
    }
};
