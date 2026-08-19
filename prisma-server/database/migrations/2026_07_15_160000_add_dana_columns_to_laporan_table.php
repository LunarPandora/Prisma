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
        Schema::table('laporan', function (Blueprint $table) {

            /*
            |--------------------------------------------------------------------------
            | Claim Dana
            |--------------------------------------------------------------------------
            */

            $table->string('claim_dana_status')
                ->nullable()
                ->after('dana_dikembalikan');

            $table->timestamp('claim_dana_approved_at')->nullable();
            $table->timestamp('claim_dana_confirmed_at')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Pengembalian Dana (PkM only)
            |--------------------------------------------------------------------------
            */

            $table->string('pengembalian_dana_status')
                ->nullable()
                ->after('claim_dana_confirmed_at');

            $table->timestamp('pengembalian_dana_confirmed_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->dropColumn([
                'claim_dana_status',
                'claim_dana_approved_at',
                'claim_dana_confirmed_at',
                'pengembalian_dana_status',
                'pengembalian_dana_confirmed_at',
            ]);
        });
    }
};
