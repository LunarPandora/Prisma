<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create kegiatan_edit_requests table for Staff-initiated, Ketua-authorized Kegiatan changes.
     */
    public function up(): void
    {
        Schema::create('kegiatan_edit_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('kegiatan_id');
            $table->unsignedBigInteger('requested_by');
            $table->date('current_tgl_mulai');
            $table->date('current_tgl_selesai');
            $table->date('proposed_tgl_mulai');
            $table->date('proposed_tgl_selesai');
            $table->text('reason');
            $table->enum('status', ['Menunggu Otorisasi', 'Disetujui', 'Ditolak'])->default('Menunggu Otorisasi');
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_note')->nullable();
            $table->unsignedBigInteger('executed_by')->nullable();
            $table->timestamp('executed_at')->nullable();
            $table->timestamps();

            $table->foreign('kegiatan_id')->references('kegiatan_id')->on('kegiatan_pengajuan')->cascadeOnDelete();
            $table->foreign('requested_by')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('reviewed_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('executed_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kegiatan_edit_requests');
    }
};
