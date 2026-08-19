<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dokumen', function (Blueprint $table) {
            $table->dropForeign(['proposal_id']);
            $table->dropColumn('proposal_id');

            $table->unsignedBigInteger('documentable_id')
                ->after('dokumen_id');

            $table->string('documentable_type')
                ->after('documentable_id');

            $table->index([
                'documentable_id',
                'documentable_type'
            ], 'dokumen_documentable_index');
        });
    }

    public function down(): void
    {
        Schema::table('dokumen', function (Blueprint $table) {
            $table->dropIndex('dokumen_documentable_index');

            $table->dropColumn([
                'documentable_id',
                'documentable_type',
            ]);

            $table->foreignId('proposal_id')
                ->constrained('proposal', 'proposal_id');
        });
    }
};