<?php

namespace App\Http\Controllers;

use App\Models\Settings;
use Illuminate\Http\Request;
use App\Helpers\ApiResponse;

class KetuaCriteriaController extends Controller
{
    /**
     * Get review criteria and theme conformity criteria.
     * Staff LPPM only.
     */
    public function index()
    {
        try {
            $user = auth()->user();

            if (!$user || !in_array($user->role, ['Staff LPPM', 'Superadmin'])) {
                return ApiResponse::failed(
                    'Hanya Staff LPPM yang dapat mengakses kriteria penilaian.'
                );
            }

            $settings = Settings::first();

            return ApiResponse::success([
                'kriteria_penilaian'    => $settings?->kriteria_penilaian ?? [],
                'list_kesesuaian_tema'  => $settings?->list_kesesuaian_tema ?? [],
            ]);

        } catch (\Exception $e) {
            \Log::error('Fetch criteria failed: ' . $e->getMessage());
            return ApiResponse::failed($e->getMessage());
        }
    }

    /**
     * Update review criteria.
     * Staff LPPM only.
     */
    public function updateKriteriaPenilaian(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || !in_array($user->role, ['Staff LPPM', 'Superadmin'])) {
                return ApiResponse::failed(
                    'Hanya Staff LPPM yang dapat mengubah kriteria penilaian.'
                );
            }

            $validated = $request->validate([
                'kriteria_penilaian' => ['required', 'string'],
            ]);

            $settings = Settings::first();

            if (!$settings) {
                $settings = Settings::create([
                    'kepala_lppm' => null,
                    'rektor' => null,
                    'nama_kampus' => '',
                    'kriteria_penilaian' => [],
                ]);
            }

            $settings->update([
                'kriteria_penilaian' => json_decode(
                    $validated['kriteria_penilaian'],
                    true
                ),
            ]);

            return ApiResponse::success();

        } catch (\Exception $e) {
            \Log::error('Update kriteria penilaian failed: ' . $e->getMessage());
            return ApiResponse::failed($e->getMessage());
        }
    }

    /**
     * Update theme conformity criteria.
     * Staff LPPM only.
     */
    public function updateKesesuaianTema(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || !in_array($user->role, ['Staff LPPM', 'Superadmin'])) {
                return ApiResponse::failed(
                    'Hanya Staff LPPM yang dapat mengubah kriteria kesesuaian tema.'
                );
            }

            $validated = $request->validate([
                'list_kesesuaian_tema' => ['required', 'string'],
            ]);

            $settings = Settings::first();

            if (!$settings) {
                $settings = Settings::create([
                    'kepala_lppm' => null,
                    'rektor' => null,
                    'nama_kampus' => '',
                    'kriteria_penilaian' => [],
                ]);
            }

            $settings->update([
                'list_kesesuaian_tema' => json_decode(
                    $validated['list_kesesuaian_tema'],
                    true
                ),
            ]);

            return ApiResponse::success();

        } catch (\Exception $e) {
            \Log::error('Update kesesuaian tema failed: ' . $e->getMessage());
            return ApiResponse::failed($e->getMessage());
        }
    }
}
