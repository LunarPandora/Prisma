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
        Schema::table("publications", function (Blueprint $table) {
            $table->dropColumn('kategori');
            $table->foreignId('pub_category_id')
                ->nullable()
                ->constrained('publication_categories', 'pub_category_id')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
