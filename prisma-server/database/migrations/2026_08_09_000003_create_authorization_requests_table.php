<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create authorization_requests table for Staff-initiated, Ketua-authorized destructive actions.
     * Covers: Skema deletion, Kegiatan deletion, Proposal rejection, Laporan return, etc.
     */
    public function up(): void
    {
        Schema::create('authorization_requests', function (Blueprint $table) {
            $table->id();
            $table->string('requestable_type');
            $table->unsignedBigInteger('requestable_id');
            $table->unsignedBigInteger('requested_by');
            $table->string('action');
            $table->text('reason');
            $table->json('current_data')->nullable();
            $table->json('proposed_data')->nullable();
            $table->enum('status', ['Menunggu Persetujuan', 'Disetujui', 'Ditolak'])->default('Menunggu Persetujuan');
            $table->unsignedBigInteger('reviewed_by')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_note')->nullable();
            $table->timestamps();

            $table->foreign('requested_by')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('reviewed_by')->references('id')->on('users')->nullOnDelete();

            $table->index(['requestable_type', 'requestable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('authorization_requests');
    }
};
