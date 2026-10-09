<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Backward-compatible wrapper. Delegates to SUSRunner.
 */
class SUSDemoSeeder extends Seeder
{
    public function run(): void
    {
        (new SUSRunner())->setCommand($this->command)->run();
    }
}
