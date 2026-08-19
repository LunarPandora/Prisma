<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proposal', function (Blueprint $table) {
            $table->double('ra_data_collection_gan')->nullable()->after('ra_insentif');
            $table->double('ra_biaya_publikasi_gan')->nullable()->after('ra_data_collection_gan');
            $table->double('ra_insentif_gan')->nullable()->after('ra_biaya_publikasi_gan');
            $table->double('ra_data_collection_gen')->nullable()->after('ra_insentif_gan');
            $table->double('ra_biaya_publikasi_gen')->nullable()->after('ra_data_collection_gen');
            $table->double('ra_insentif_gen')->nullable()->after('ra_biaya_publikasi_gen');
        });
    }

    public function down(): void
    {
        Schema::table('proposal', function (Blueprint $table) {
            $table->dropColumn([
                'ra_data_collection_gan',
                'ra_biaya_publikasi_gan',
                'ra_insentif_gan',
                'ra_data_collection_gen',
                'ra_biaya_publikasi_gen',
                'ra_insentif_gen',
            ]);
        });
    }
};
