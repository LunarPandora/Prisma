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
            $table->text('link_laporan_akhir')->nullable()->after('link_publikasi');
            $table->text('link_hki')->nullable()->after('link_laporan_akhir');
            $table->text('link_buku')->nullable()->after('link_hki');
            $table->text('link_poster')->nullable()->after('link_buku');
            $table->text('link_video')->nullable()->after('link_poster');

            $table->boolean('dana_dikembalikan')
                ->default(false)
                ->after('link_video');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laporan', function (Blueprint $table) {
            $table->dropColumn([
                'link_laporan_akhir',
                'link_hki',
                'link_buku',
                'link_poster',
                'link_video',
                'dana_dikembalikan',
            ]);
        });
    }
};
