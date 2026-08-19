<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE proposal MODIFY COLUMN status ENUM(
            'Draft',
            'Ditarik',
            'Ditolak',
            'Menunggu proposal untuk diupload',
            'Menunggu penugasan reviewer',
            'Menunggu review',
            'Menunggu persetujuan Ketua LPPM',
            'Menunggu review dari Ketua LPPM',
            'Menunggu review Staff LPPM',
            'Proposal Diterima',
            'Dalam pengerjaan'
        ) NOT NULL DEFAULT 'Draft'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE proposal MODIFY COLUMN status ENUM(
            'Draft',
            'Ditarik',
            'Ditolak',
            'Menunggu proposal untuk diupload',
            'Menunggu penugasan reviewer',
            'Menunggu review',
            'Menunggu persetujuan Ketua LPPM',
            'Proposal Diterima',
            'Dalam pengerjaan'
        ) NOT NULL DEFAULT 'Draft'");
    }
};
