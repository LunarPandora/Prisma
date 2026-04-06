<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\UserController;
use App\Http\Controllers\SkemaController;
use App\Http\Controllers\ProdiController;
use App\Http\Controllers\PeriodePengajuanController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('users')->group(function (){
        Route::get('/', [UserController::class, 'index']);
        Route::get('/me', function(Request $request){
            return $request->user();
        });
        Route::post('/add', [UserController::class, 'create']);
        Route::post('/update', [UserController::class, 'update']);
        Route::delete('/delete/{id}', [UserController::class, 'delete']);
    });

    Route::prefix('skema')->group(function (){
        Route::get('/', [SkemaController::class, 'index']);
        Route::get('/fetch', [SkemaController::class, 'fetch']);
        
        Route::post('/add', [SkemaController::class, 'create']);
        Route::post('/update', [SkemaController::class, 'update']);
        Route::delete('/delete/{id}', [SkemaController::class, 'delete']);
    });

    Route::prefix('prodi')->group(function (){
        Route::get('/', [ProdiController::class, 'index']);
        Route::get('/fetch', [ProdiController::class, 'fetch']);
        
        Route::post('/add', [ProdiController::class, 'create']);
        Route::post('/update', [ProdiController::class, 'update']);
        Route::delete('/delete/{id}', [ProdiController::class, 'delete']);
    });

    Route::prefix('periode')->group(function (){
        Route::get('/', [PeriodePengajuanController::class, 'index']);
        Route::post('/add', [PeriodePengajuanController::class, 'create']);
        Route::post('/update', [PeriodePengajuanController::class, 'update']);
        Route::delete('/delete/{id}', [PeriodePengajuanController::class, 'delete']);
    });
});
