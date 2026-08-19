<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scholar_publication_citations_by_year', function (Blueprint $table) {
            $table->id('publication_citation_id');
            $table->unsignedBigInteger('scholar_publication_id');
            $table->unsignedSmallInteger('year');
            $table->unsignedInteger('citation_count')->default(0);
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();

            $table->unique(['scholar_publication_id', 'year'], 'spub_cit_pub_year_ux');
            $table->index('scholar_publication_id', 'spub_cit_pub_ix');

            $table->foreign('scholar_publication_id')
                ->references('publication_id')
                ->on('scholar_publications')
                ->onDelete('cascade')
                ->name('spub_cit_fk');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scholar_publication_citations_by_year');
    }
};
