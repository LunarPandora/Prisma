<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Orchestrates all SUS seeders in the correct order.
 */
class SUSRunner extends Seeder
{
    public function run(): void
    {
        $this->command->info('Starting SUS Demo data generation...');

        // 1. Users
        $users = new SUSUsersSeeder();
        $users->setCommand($this->command)->run();

        // 2. Master Data
        $master = new SUSMasterDataSeeder();
        $master->setCommand($this->command)->run();

        // 3. Proposals
        $proposals = new SUSProposalSeeder();
        $proposals->init($users->prodi, $users->dosen, $users->staff, $users->ketua, $master->skema, $master->kegiatan);
        $proposals->setCommand($this->command)->run();

        // 4. Reviews (queries DB directly for proposals and reviewers)
        $reviews = new SUSReviewSeeder();
        $reviews->setCommand($this->command)->run();

        // 5. Laporans
        $laporans = new SUSLaporanSeeder();
        $laporans->init($proposals->proposals, $users->dosen, $master->kegiatan);
        $laporans->setCommand($this->command)->run();

        // 6. Logbooks
        $logbooks = new SUSLogbookSeeder();
        $logbooks->setCommand($this->command)->run();

        // 7. Auth & Notifications
        $auth = new SUSAuthNotifSeeder();
        $auth->init($proposals->proposals, $laporans->laporan, $users->dosen, $users->staff, $users->ketua, $users->reviewers);
        $auth->setCommand($this->command)->run();

        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('  SUS Demo Data Generation Complete!');
        $this->command->info('========================================');
    }
}
