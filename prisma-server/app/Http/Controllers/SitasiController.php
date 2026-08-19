<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Sitasi;
use App\Models\Laporan;

use App\Helpers\ApiResponse;
use App\Helpers\KegiatanStage;

class SitasiController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | List sitasi for a laporan (dosen own; admin all)
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        try {

            $user = $request->user();

            $query = Sitasi::query()
                ->with([
                    'laporan.proposal' => fn($q) => $q->withTrashed(),
                ]);

            if ($request->filled('laporan_id')) {
                $query->where('laporan_id', $request->laporan_id);
            }

            if ($user->role === 'Dosen') {
                $query->whereHas('laporan.proposal', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            }

            return ApiResponse::success(
                $query->orderByDesc('tahun')
                    ->paginate($request->get('per_page', 20))
            );

        } catch (\Exception $e) {

            \Log::error('Fetch sitasi failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Create sitasi (Dosen, during LUARAN_*)
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        try {

            $validated = $request->validate([
                'laporan_id'   => ['required', 'exists:laporan,laporan_id'],
                'judul_sitasi' => ['required', 'string', 'max:255'],
                'sumber'       => ['nullable', 'string', 'max:255'],
                'tahun'        => ['nullable', 'integer', 'min:1900', 'max:2100'],
                'url'          => ['nullable', 'url'],
            ]);

            $laporan = $this->findOwnedLaporan($validated['laporan_id']);

            if (!$laporan) {
                return ApiResponse::failed(
                    'Laporan bukan pada tahap Luaran.'
                );
            }

            $sitasi = Sitasi::create($validated);

            return ApiResponse::success($sitasi);

        } catch (\Exception $e) {

            \Log::error('Create sitasi failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Delete sitasi
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        try {

            $sitasi = Sitasi::with('laporan.proposal')->findOrFail($id);

            if ($sitasi->laporan?->proposal?->user_id !== auth()->id()) {
                return ApiResponse::failed(
                    'Tidak memiliki akses ke sitasi ini.'
                );
            }

            $laporan = $this->findOwnedLaporan($sitasi->laporan_id);

            if (!$laporan) {
                return ApiResponse::failed(
                    'Sitasi hanya dapat dihapus pada tahap Luaran.'
                );
            }

            $sitasi->delete();

            return ApiResponse::success();

        } catch (\Exception $e) {

            \Log::error('Delete sitasi failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    private function findOwnedLaporan($laporanId)
    {
        $laporan = Laporan::with([
            'proposal' => fn($q) => $q->withTrashed(),
            'kegiatan'  => fn($q) => $q->withTrashed(),
        ])->find($laporanId);

        if (!$laporan) {
            return null;
        }

        if ($laporan->proposal?->user_id !== auth()->id()) {
            return null;
        }

        $current = $laporan->kodeKegiatan();

        if (!in_array($current, ['LUARAN_PENELITIAN', 'LUARAN_PKM'], true)
            || !KegiatanStage::isOpen($laporan, $current)
        ) {
            return null;
        }

        return $laporan;
    }
}
