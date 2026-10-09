<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE laporan MODIFY COLUMN status ENUM(
            'Belum dimulai',
            'Dalam pengerjaan',
            'Menunggu kelengkapan data',
            'Menunggu review Admin',
            'Menunggu review Staff LPPM',
            'Menunggu review dari Ketua LPPM',
            'Menunggu review',
            'Menunggu hasil dari Reviewers',
            'Menuggu penugasan Reviewer',
            'Menunggu keputusan Ketua',
            'Menunggu Persetujuan Ketua LPPM',
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
            'Menunggu review Staff LPPM',
            'Menunggu review',
            'Menunggu hasil dari Reviewers',
            'Menuggu penugasan Reviewer',
            'Menunggu keputusan Ketua',
            'Menunggu Persetujuan Ketua LPPM',
            'Menunggu konfirmasi pengiriman dana',
            'Menunggu konfirmasi penerimaan dana',
            'Revisi',
            'Selesai'
        ) DEFAULT 'Dalam pengerjaan'");
    }
};
