<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scholar_publications', function (Blueprint $table) {
            $table->id('publication_id');
            $table->foreignId('scholar_profile_id')->constrained('scholar_profiles', 'scholar_profile_id')->cascadeOnDelete();
            $table->string('external_id')->nullable();
            $table->string('title');
            $table->text('authors')->nullable();
            $table->string('publication_name')->nullable();
            $table->unsignedSmallInteger('publication_year')->nullable();
            $table->unsignedInteger('citation_count')->default(0);
            $table->string('publication_url')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();

            $table->index('scholar_profile_id');
            $table->index('external_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scholar_publications');
    }
};
