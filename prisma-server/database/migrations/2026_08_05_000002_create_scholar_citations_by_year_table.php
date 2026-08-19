<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scholar_citations_by_year', function (Blueprint $table) {
            $table->id('citation_id');
            $table->foreignId('scholar_profile_id')->constrained('scholar_profiles', 'scholar_profile_id')->cascadeOnDelete();
            $table->unsignedSmallInteger('year');
            $table->unsignedInteger('citation_count')->default(0);
            $table->timestamps();

            $table->unique(['scholar_profile_id', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scholar_citations_by_year');
    }
};
