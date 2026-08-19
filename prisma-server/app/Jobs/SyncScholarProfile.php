<?php

namespace App\Jobs;

use App\Models\ScholarProfile;
use App\Services\Scholar\ScholarSyncService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Support\Facades\Log;

class SyncScholarProfile implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;
    public int $backoff = 60;

    public function __construct(
        public int $scholarProfileId,
    ) {}

    public function middleware(): array
    {
        return [
            (new WithoutOverlapping("scholar_sync_{$this->scholarProfileId}"))
                ->dontRelease(),
        ];
    }

    public function handle(ScholarSyncService $syncService): void
    {
        $profile = ScholarProfile::find($this->scholarProfileId);

        if (!$profile) {
            Log::warning('Scholar profile not found for sync job', [
                'scholar_profile_id' => $this->scholarProfileId,
            ]);
            return;
        }

        if ($profile->sync_status === 'syncing') {
            Log::info('Scholar profile already syncing, skipping', [
                'scholar_profile_id' => $this->scholarProfileId,
            ]);
            return;
        }

        $syncService->sync($profile);
    }

    public function failed(\Throwable $exception): void
    {
        $profile = ScholarProfile::find($this->scholarProfileId);

        if ($profile) {
            $profile->update([
                'sync_status'     => 'failed',
                'last_sync_error' => mb_substr($exception->getMessage(), 0, 500),
            ]);
        }

        Log::error('SyncScholarProfile job failed', [
            'scholar_profile_id' => $this->scholarProfileId,
            'message'            => $exception->getMessage(),
        ]);
    }
}
