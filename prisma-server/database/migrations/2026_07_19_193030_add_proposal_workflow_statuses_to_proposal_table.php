<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
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
            'Proposal Diterima',
            'Dalam pengerjaan'
        ) NOT NULL DEFAULT 'Draft'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE proposal MODIFY COLUMN status ENUM(
            'Draft',
            'Ditarik',
            'Ditolak',
            'Menunggu proposal untuk diupload',
            'Menunggu penugasan reviewer',
            'Menunggu review',
            'Dalam pengerjaan'
        ) NOT NULL DEFAULT 'Draft'");
    }
};
