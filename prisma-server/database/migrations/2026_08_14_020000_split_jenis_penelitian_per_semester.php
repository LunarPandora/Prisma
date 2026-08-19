<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
        |--------------------------------------------------------------------------
        | 1. Add semester-specific columns to proposal table
        |--------------------------------------------------------------------------
        */
        Schema::table('proposal', function (Blueprint $table) {
            $table->enum('jenis_penelitian_gan', ['Penelitian', 'PkM'])->nullable()->after('jenis_penelitian');
            $table->enum('jenis_penelitian_gen', ['Penelitian', 'PkM'])->nullable()->after('jenis_penelitian_gan');
        });

        /*
        |--------------------------------------------------------------------------
        | 2. Migrate existing data: copy single value to both semester columns
        |--------------------------------------------------------------------------
        */
        DB::table('proposal')
            ->whereNotNull('jenis_penelitian')
            ->update([
                'jenis_penelitian_gan' => DB::raw('jenis_penelitian'),
                'jenis_penelitian_gen' => DB::raw('jenis_penelitian'),
            ]);

        /*
        |--------------------------------------------------------------------------
        | 3. Make new columns non-nullable after backfill
        |--------------------------------------------------------------------------
        */
        Schema::table('proposal', function (Blueprint $table) {
            $table->enum('jenis_penelitian_gan', ['Penelitian', 'PkM'])->nullable(false)->change();
            $table->enum('jenis_penelitian_gen', ['Penelitian', 'PkM'])->nullable(false)->change();
        });

        /*
        |--------------------------------------------------------------------------
        | 4. Add jenis_penelitian to laporan table
        |--------------------------------------------------------------------------
        */
        Schema::table('laporan', function (Blueprint $table) {
            $table->enum('jenis_penelitian', ['Penelitian', 'PkM'])->nullable()->after('semester');
        });

        /*
        |--------------------------------------------------------------------------
        | 5. Backfill laporan.jenis_penelitian from proposal semester-specific values
        |--------------------------------------------------------------------------
        */
        DB::statement('
            UPDATE laporan l
            JOIN proposal p ON l.proposal_id = p.proposal_id
            SET l.jenis_penelitian = CASE
                WHEN l.semester = "Ganjil" THEN p.jenis_penelitian_gan
                WHEN l.semester = "Genap" THEN p.jenis_penelitian_gen
            END
            WHERE l.jenis_penelitian IS NULL
        ');

        /*
        |--------------------------------------------------------------------------
        | 6. Make laporan.jenis_penelitian non-nullable after backfill
        |--------------------------------------------------------------------------
        */
        Schema::table('laporan', function (Blueprint $table) {
            $table->enum('jenis_penelitian', ['Penelitian', 'PkM'])->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->dropColumn('jenis_penelitian');
        });

        Schema::table('proposal', function (Blueprint $table) {
            $table->dropColumn(['jenis_penelitian_gan', 'jenis_penelitian_gen']);
        });
    }
};
