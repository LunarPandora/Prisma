<?php

namespace App\Console\Commands;

use App\Jobs\SyncScholarProfile;
use App\Models\ScholarProfile;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SyncScholarProfilesWeekly extends Command
{
    protected $signature = 'scholar:sync-weekly';
    protected $description = 'Dispatch sync jobs for all eligible Google Scholar profiles';

    public function handle(): int
    {
        $lockKey = 'scholar_sync_weekly_lock';

        $acquired = DB::transaction(function () use ($lockKey) {
            return DB::select("SELECT GET_LOCK(?, 0) AS locked", [$lockKey])[0]->locked ?? false;
        });

        if (!$acquired) {
            $this->info('Another sync run is already in progress. Skipping.');
            Log::info('Scholar: Weekly sync skipped — lock already held');
            return self::SUCCESS;
        }

        try {
            $dispatched = 0;
            $skipped = 0;

            $eligible = ScholarProfile::query()
                ->whereNotNull('scholar_author_id')
                ->where('sync_status', '!=', 'syncing')
                ->where(function ($q) {
                    $q->whereNull('last_synced_at')
                      ->orWhere('last_synced_at', '<=', now()->subWeek());
                })
                ->chunkById(50, function ($profiles) use (&$dispatched, &$skipped) {
                    foreach ($profiles as $profile) {
                        SyncScholarProfile::dispatch($profile->scholar_profile_id);
                        $dispatched++;
                        $this->info("Dispatched sync for profile {$profile->scholar_profile_id} ({$profile->scholar_author_id})");
                    }
                });

            Log::info('Scholar: Weekly sync dispatched', [
                'dispatched' => $dispatched,
                'skipped'    => $skipped,
            ]);

            $this->info("Done. Dispatched {$dispatched} sync jobs.");

            return self::SUCCESS;
        } finally {
            DB::select("SELECT RELEASE_LOCK(?)", [$lockKey]);
        }
    }
}
