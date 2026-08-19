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
        Schema::create('peneliti_details', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('kolab_id')
                ->nullable()
                ->constrained('kolaborator', 'kolab_id')
                ->cascadeOnDelete();

            $table->string('nidn')->nullable();
            $table->string('nuptk')->nullable();

            $table->string('jabatan')->nullable();

            $table->string('no_hp')->nullable();

            $table->string('sinta_id')->nullable();

            $table->decimal('h_index', 5, 2)->nullable();

            $table->timestamps();

            $table->unique('user_id');
            $table->unique('kolab_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peneliti_details');
    }
};
