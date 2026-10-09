<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class E2EUnifiedSeeder extends Seeder
{
    public function run(): void
    {
        $seeders = [
            E2EStaffSeeder::class,
            E2EDosenSeeder::class,
            E2EScholarSeeder::class,
            E2EKetuaSeeder::class,
            E2EReviewerSeeder::class,
            E2ESuperadminSeeder::class,
            E2EDataSeeder::class,
        ];

        foreach ($seeders as $seeder) {
            $this->command->info("Running $seeder...");
            try {
                (new $seeder)->setCommand($this->command)->run();
            } catch (\Exception $e) {
                if (str_contains($e->getMessage(), 'Duplicate entry')
                    || str_contains($e->getMessage(), 'SQLSTATE[23')
                    || str_contains($e->getMessage(), 'already exists')) {
                    $this->command->warn("  Skipped duplicate: " . class_basename($seeder));
                    continue;
                }
                throw $e;
            }
        }

        $this->command->info('E2E Unified seeder completed.');
    }
}
