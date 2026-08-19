<?php

namespace App\Http\Controllers;

use App\Models\Settings;
use App\Models\User;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Get Settings
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        $settings = Settings::with([
            'kepalaLppmUser:id,nama,avatar',
        ])->first();

        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Save / Update Settings
    |--------------------------------------------------------------------------
    */

    public function update(Request $request)
    {
        try {

            $settings = Settings::first();

            /*
            |--------------------------------------------------------------------------
            | Create Row If Not Exists
            |--------------------------------------------------------------------------
            */

            if (!$settings) {
                $settings = Settings::create([
                    'kepala_lppm' => null,
                    'nama_kampus' => '',
                    'kriteria_penilaian' => [],
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Update
            |--------------------------------------------------------------------------
            */

            $updates = [];

            if ($request->has('kepala_lppm')) {
                $updates['kepala_lppm'] = $request->kepala_lppm;
            }

            if ($request->has('nama_kampus')) {
                $updates['nama_kampus'] = $request->nama_kampus;
            }

            if (!empty($updates)) {
                $settings->update($updates);
            }

            return response()->json([
                'status' => 'success'
            ]);

        } catch (\Exception $e) {
            \Log::error(
                'Settings update failed: ' .
                $e->getMessage()
            );

            return response()->json([
                'status' => 'failed'
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Update Rektor Data (for document generation)
    |--------------------------------------------------------------------------
    */

    public function updateRektor(Request $request)
    {
        try {
            $validated = $request->validate([
                'rektor_nama'  => ['required', 'string', 'max:255'],
                'rektor_nidn'  => ['required', 'string', 'max:50'],
                'rektor_nuptk' => ['required', 'string', 'max:50'],
            ]);

            $settings = Settings::first();

            if (!$settings) {
                $settings = Settings::create([
                    'kepala_lppm' => null,
                    'nama_kampus' => '',
                    'kriteria_penilaian' => [],
                ]);
            }

            $settings->update([
                'rektor_nama'  => $validated['rektor_nama'],
                'rektor_nidn'  => $validated['rektor_nidn'],
                'rektor_nuptk' => $validated['rektor_nuptk'],
            ]);

            return response()->json([
                'status' => 'success'
            ]);

        } catch (\Exception $e) {
            \Log::error('Update rektor data failed: ' . $e->getMessage());

            return response()->json([
                'status' => 'failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Update Ignore Kegiatan Dates (Ketua LPPM only)
    |--------------------------------------------------------------------------
    */

    public function updateIgnoreKegiatanDates(Request $request)
    {
        try {
            $validated = $request->validate([
                'ignore_kegiatan_dates' => ['required', 'boolean'],
            ]);

            $settings = Settings::first();

            if (!$settings) {
                $settings = Settings::create([
                    'kepala_lppm' => null,
                    'nama_kampus' => '',
                    'kriteria_penilaian' => [],
                ]);
            }

            $settings->update([
                'ignore_kegiatan_dates' => $validated['ignore_kegiatan_dates'],
            ]);

            return response()->json([
                'status' => 'success'
            ]);

        } catch (\Exception $e) {
            \Log::error('Update ignore kegiatan dates failed: ' . $e->getMessage());

            return response()->json([
                'status' => 'failed',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Users with Ketua LPPM role (for Kepala LPPM selection)
    |--------------------------------------------------------------------------
    */

    public function fetchKetuaLppm()
    {
        $users = User::where('role', 'Ketua LPPM')
            ->select(
                'id',
                'nama',
                'nidn',
                'nuptk',
                'avatar'
            )
            ->get()
            ->append('avatar_url');

        return response()->json([
            'status' => 'success',
            'data' => $users
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Fetch Users with Rektorat role (legacy, kept for compatibility)
    |--------------------------------------------------------------------------
    */

    public function fetchRektor()
    {
        $users = User::where('role', 'Rektorat')
            ->select(
                'id',
                'nama',
                'avatar'
            )
            ->get()
            ->append('avatar_url');

        return response()->json([
            'status' => 'success',
            'data' => $users
        ]);
    }

    public function fetchTimLppm()
    {
        $users = User::where('role', 'Staff LPPM')
            ->select(
                'id',
                'nama',
                'avatar'
            )
            ->get()
            ->append('avatar_url');

        return response()->json([
            'status' => 'success',
            'data' => $users
        ]);
    }
}
