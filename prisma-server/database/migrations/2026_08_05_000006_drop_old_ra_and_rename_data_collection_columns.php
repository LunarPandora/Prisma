<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('proposal', function (Blueprint $table) {
            $table->dropColumn([
                'ra_data_collection',
                'ra_biaya_publikasi',
                'ra_insentif',
            ]);

            $table->renameColumn('ra_data_collection_gan', 'ra_biaya_penelitian_gan');
            $table->renameColumn('ra_data_collection_gen', 'ra_biaya_penelitian_gen');
        });
    }

    public function down(): void
    {
        Schema::table('proposal', function (Blueprint $table) {
            $table->double('ra_data_collection')->default(0)->after('fokus_sdg');
            $table->double('ra_biaya_publikasi')->default(0)->after('ra_data_collection');
            $table->double('ra_insentif')->default(0)->after('ra_biaya_publikasi');

            $table->renameColumn('ra_biaya_penelitian_gan', 'ra_data_collection_gan');
            $table->renameColumn('ra_biaya_penelitian_gen', 'ra_data_collection_gen');
        });
    }
};
