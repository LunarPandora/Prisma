<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scholar_profiles', function (Blueprint $table) {
            $table->id('scholar_profile_id');
            $table->foreignId('user_id')->constrained('users', 'id')->cascadeOnDelete();
            $table->string('scholar_author_id');
            $table->string('profile_url');
            $table->string('display_name')->nullable();
            $table->string('affiliation')->nullable();
            $table->unsignedInteger('total_citations')->default(0);
            $table->unsignedInteger('h_index')->default(0);
            $table->unsignedInteger('i10_index')->default(0);
            $table->enum('sync_status', ['pending', 'syncing', 'success', 'failed'])->default('pending');
            $table->timestamp('last_synced_at')->nullable();
            $table->text('last_sync_error')->nullable();
            $table->timestamps();

            $table->unique('user_id');
            $table->unique('scholar_author_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scholar_profiles');
    }
};
