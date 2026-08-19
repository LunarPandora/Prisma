<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE laporan MODIFY COLUMN status ENUM(
            'Belum dimulai',
            'Dalam pengerjaan',
            'Menunggu kelengkapan data',
            'Menunggu review Admin',
            'Menunggu review',
            'Menunggu hasil dari Reviewers',
            'Menunggu keputusan Ketua',
            'Menunggu konfirmasi pengiriman dana',
            'Menunggu konfirmasi penerimaan dana',
            'Revisi',
            'Selesai'
        ) DEFAULT 'Dalam pengerjaan'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE laporan MODIFY COLUMN status ENUM(
            'Belum dimulai',
            'Dalam pengerjaan',
            'Menunggu kelengkapan data',
            'Menunggu review Admin',
            'Menunggu review',
            'Menunggu hasil dari Reviewers',
            'Menunggu konfirmasi pengiriman dana',
            'Menunggu konfirmasi penerimaan dana',
            'Revisi',
            'Selesai'
        ) DEFAULT 'Dalam pengerjaan'");
    }
};
