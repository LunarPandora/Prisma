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
        Schema::create('penugasan_reviewer', function (Blueprint $table) {
            $table->id('penugasan_id');
            $table->foreignId('proposal_id')->constrained('proposal', 'proposal_id');
            $table->date('tgl_penugasan');
            $table->foreignId('user_id')->constrained('users', 'id');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penugasan_reviewer');
    }
};
