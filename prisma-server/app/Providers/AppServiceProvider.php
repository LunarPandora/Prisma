<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;
use App\Services\Scholar\GoogleScholarProvider;
use App\Services\Scholar\SerpApiProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(GoogleScholarProvider::class, SerpApiProvider::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Relation::morphMap([
            'Skema' => \App\Models\Skema::class,
            'KegiatanPengajuan' => \App\Models\KegiatanPengajuan::class,
        ]);
    }
}
