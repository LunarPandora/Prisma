<?php

namespace App\Http\Controllers;

use App\Models\Laporan;
use App\Models\RealisasiAnggaran;
use Illuminate\Http\Request;
use App\Helpers\ApiResponse;

class RealisasiAnggaranController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | List Point F items for a Laporan
    |--------------------------------------------------------------------------
    */

    public function index(Request $request, $laporanId)
    {
        $laporan = $this->findOwnedLaporan($laporanId);

        if (!$laporan) {
            return ApiResponse::failed('Laporan tidak ditemukan.');
        }

        $items = $laporan->realisasiAnggaran()
            ->orderBy('id')
            ->get();

        $totalSemua = $items->sum('total');

        return ApiResponse::success([
            'items' => $items,
            'total_semua' => $totalSemua,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Add a Point F item
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validated = $request->validate([
            'laporan_id'     => ['required', 'exists:laporan,laporan_id'],
            'item_kebutuhan' => ['required', 'string', 'max:255'],
            'satuan'         => ['required', 'string', 'max:100'],
            'jumlah_item'    => ['required', 'integer', 'min:1'],
            'harga_satuan'   => ['required', 'numeric', 'min:0'],
        ]);

        $laporan = $this->findOwnedLaporan($validated['laporan_id']);

        if (!$laporan) {
            return ApiResponse::failed('Laporan tidak ditemukan.');
        }

        $validated['total'] = $validated['jumlah_item'] * $validated['harga_satuan'];

        $item = RealisasiAnggaran::create($validated);

        return ApiResponse::success($item);
    }

    /*
    |--------------------------------------------------------------------------
    | Update a Point F item
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $item = RealisasiAnggaran::find($id);

        if (!$item) {
            return ApiResponse::failed('Item realisasi tidak ditemukan.');
        }

        $laporan = $this->findOwnedLaporan($item->laporan_id);

        if (!$laporan) {
            return ApiResponse::failed('Laporan tidak ditemukan.');
        }

        $validated = $request->validate([
            'item_kebutuhan' => ['sometimes', 'required', 'string', 'max:255'],
            'satuan'         => ['sometimes', 'required', 'string', 'max:100'],
            'jumlah_item'    => ['sometimes', 'required', 'integer', 'min:1'],
            'harga_satuan'   => ['sometimes', 'required', 'numeric', 'min:0'],
        ]);

        if (isset($validated['jumlah_item']) || isset($validated['harga_satuan'])) {
            $jumlah = $validated['jumlah_item'] ?? $item->jumlah_item;
            $harga = $validated['harga_satuan'] ?? $item->harga_satuan;
            $validated['total'] = $jumlah * $harga;
        }

        $item->update($validated);

        return ApiResponse::success($item->fresh());
    }

    /*
    |--------------------------------------------------------------------------
    | Delete a Point F item
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        $item = RealisasiAnggaran::find($id);

        if (!$item) {
            return ApiResponse::failed('Item realisasi tidak ditemukan.');
        }

        $laporan = $this->findOwnedLaporan($item->laporan_id);

        if (!$laporan) {
            return ApiResponse::failed('Laporan tidak ditemukan.');
        }

        $item->delete();

        return ApiResponse::success(null, 'Item realisasi berhasil dihapus.');
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    private function findOwnedLaporan($laporanId)
    {
        return Laporan::with([
            'proposal' => fn($q) => $q->withTrashed(),
        ])
        ->where('laporan_id', $laporanId)
        ->whereHas('proposal', function ($q) {
            $q->where('user_id', auth()->id());
        })
        ->first();
    }
}
