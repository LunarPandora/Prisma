<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('penugasan_reviewer', function (Blueprint $table) {

            $table->string('reviewable_type')
                ->default('App\\Models\\Proposal')
                ->after('penugasan_id');

            $table->unsignedBigInteger('reviewable_id')
                ->nullable()
                ->after('reviewable_type');

            $table->index(['reviewable_type', 'reviewable_id']);
        });

        /*
        |--------------------------------------------------------------------------
        | Drop the NOT NULL + FK on proposal_id so Laporan-based rows can be
        | inserted with proposal_id = NULL.
        |--------------------------------------------------------------------------
        */

        Schema::table('penugasan_reviewer', function (Blueprint $table) {
            $table->dropForeign(['proposal_id']);
        });

        Schema::table('penugasan_reviewer', function (Blueprint $table) {
            $table->unsignedBigInteger('proposal_id')->nullable()->change();

            $table->foreign('proposal_id')
                ->references('proposal_id')
                ->on('proposal')
                ->nullOnDelete();
        });

        /*
        |--------------------------------------------------------------------------
        | Backfill existing rows (all are Proposal reviews so far)
        |--------------------------------------------------------------------------
        */

        DB::statement(
            'UPDATE penugasan_reviewer '
            . 'SET reviewable_type = ?, reviewable_id = proposal_id '
            . 'WHERE reviewable_id IS NULL',
            ['App\\Models\\Proposal']
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('penugasan_reviewer', function (Blueprint $table) {
            $table->dropIndex(['reviewable_type', 'reviewable_id']);
            $table->dropColumn(['reviewable_type', 'reviewable_id']);
        });
    }
};
