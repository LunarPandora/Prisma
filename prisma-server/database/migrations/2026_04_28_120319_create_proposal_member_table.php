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
        Schema::create('proposal_member', function (Blueprint $table) {
            $table->id('prop_member_id');
            $table->foreignId('proposal_id')->constrained('proposal', 'proposal_id');
            $table->unsignedBigInteger('member_id');
            $table->enum('role', ['Dosen', 'Mahasiswa', 'Kolaborator']);
            $table->enum('semester', ['Ganjil', 'Genap']);
            $table->text('ttjp');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal_member');
    }
};
