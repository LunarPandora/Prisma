<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\KegiatanPengajuan;
use Carbon\Carbon;

use App\Http\Resources\KegiatanPengajuanResource;
use App\Helpers\ApiResponse;

class KegiatanPengajuanController extends Controller
{
    public function index(Request $request)
    {
        $query = KegiatanPengajuan::with('skema');

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_kegiatan', 'like', '%' . $request->search . '%')
                ->orWhere('kode_kegiatan', 'like', '%' . $request->search . '%');
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Filters
        |--------------------------------------------------------------------------
        */

        if ($request->filled('skema_id')) {
            $query->where('skema_id', $request->skema_id);
        }

        if ($request->filled('jenis_penelitian')) {
            $query->where(
                'jenis_penelitian',
                $request->jenis_penelitian
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Sorting
        |--------------------------------------------------------------------------
        */

        if (
            $request->filled('sort_by')
            &&
            $request->filled('sort_order')
        ) {
            $query->orderBy(
                $request->sort_by,
                $request->sort_order
            );
        }
        else {
            $query->orderBy('kegiatan_id');
        }

        return KegiatanPengajuanResource::collection(
            $query->paginate(
                $request->per_page ?? 10
            )
        );
    }

    /**
     * Fetch active periods (today is inside timeline)
     */
    public function fetch(Request $request)
    {
        $today = Carbon::today();
        $query = KegiatanPengajuan::select(
                'kegiatan_id',
                'skema_id',
                'jenis_penelitian',
                'kode_kegiatan',
                'nama_kegiatan'
            )
            ->whereDate('tgl_mulai', '<=', $today)
            ->whereDate('tgl_selesai', '>=', $today);

        if ($request->filled('skema_id')) {
            $query->where('skema_id', $request->skema_id);
        }

        if ($request->filled('jenis_penelitian')) {
            $query->where('jenis_penelitian', $request->jenis_penelitian);
        }

        return $query
            ->orderBy('kegiatan_id')
            ->get();
    }

    /**
     * Fetch all periods
     */
    public function fetchAll(Request $request)
    {
        $query = KegiatanPengajuan::query();

        if ($request->filled('skema_id')) {
            $query->where('skema_id', $request->skema_id);
        }

        if ($request->filled('jenis_penelitian')) {
            $query->where('jenis_penelitian', $request->jenis_penelitian);
        }

        return $query
            ->orderBy('kegiatan_id')
            ->get();
    }

    /**
     * Create manually (optional)
     * In practice periods should be generated automatically from Skema.
     */
    public function create(Request $request)
    {
        try {
            KegiatanPengajuan::create([
                'skema_id'          => $request->skema_id,
                'jenis_penelitian'  => $request->jenis_penelitian,
                'kode_kegiatan'      => $request->kode_kegiatan,
                'nama_kegiatan'      => $request->nama_kegiatan,
                'tgl_mulai'         => $request->tgl_mulai,
                'tgl_selesai'       => $request->tgl_selesai,
                'status'            => $request->status ?? 'Belum dibuka',
            ]);

            return ApiResponse::success();
        } catch (\Exception $e) {
            \Log::error('Create failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }

    /**
     * Update timeline of period.
     *
     * When Admin explicitly changes the status, manual_status_override is
     * set to true so the status is honoured as-is.
     *
     * When only dates are changed (status omitted or unchanged), the flag
     * remains false so the status flows naturally based on the date range.
     */
    public function update(Request $request)
    {
        try {
            $kegiatan = KegiatanPengajuan::findOrFail($request->kegiatan_id);

            $updates = [];

            if ($request->filled('tgl_mulai')) {
                $updates['tgl_mulai'] = $request->tgl_mulai;
            }

            if ($request->filled('tgl_selesai')) {
                $updates['tgl_selesai'] = $request->tgl_selesai;
            }

            if ($request->filled('status')) {
                $updates['status'] = $request->status;
                $updates['manual_status_override'] = true;
            }

            if (!empty($updates)) {
                $kegiatan->update($updates);
            }

            return ApiResponse::success();
        } catch (\Exception $e) {
            \Log::error('Update failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }

    public function delete(Request $request)
    {
        try {
            $kegiatan = KegiatanPengajuan::findOrFail($request->id);
            $kegiatan->delete();

            return ApiResponse::success();
        } catch (\Exception $e) {
            \Log::error('Delete failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }

    /**
     * Skemas whose PENERIMAAN_PROPOSAL periode is currently open.
     *
     * "Open" is defined by the date range: today must fall inside the
     * periode's [tgl_mulai, tgl_selesai] window. We don't require the
     * periode's `status` column to be set to 'Terbuka' — the date range
     * is the source of truth, so forgetting to flip a status can never
     * hide a live skema from dosen.
     */
    public function fetchPenerimaanProposal()
    {
        $today = Carbon::today()->toDateString();

        $rows = KegiatanPengajuan::query()
            ->join('skema', 'skema.skema_id', '=', 'kegiatan_pengajuan.skema_id')
            ->select([
                'kegiatan_pengajuan.kegiatan_id',
                'kegiatan_pengajuan.skema_id',
                'kegiatan_pengajuan.jenis_penelitian',
                'kegiatan_pengajuan.tgl_mulai',
                'kegiatan_pengajuan.tgl_selesai',
                'kegiatan_pengajuan.manual_status_override',
                'kegiatan_pengajuan.status',
                'skema.nama_skema'
            ])
            ->where('kegiatan_pengajuan.kode_kegiatan', 'PENERIMAAN_PROPOSAL')
            ->where('skema.status', 'Aktif')
            ->whereNotNull('kegiatan_pengajuan.tgl_mulai')
            ->whereNotNull('kegiatan_pengajuan.tgl_selesai')
            ->where(function ($q) use ($today) {
                // Admin manually set status → trust it
                $q->where('kegiatan_pengajuan.manual_status_override', true)
                  ->where('kegiatan_pengajuan.status', 'Terbuka');

                // Otherwise fall back to date-range check
                $q->orWhere(function ($q2) use ($today) {
                    $q2->where('kegiatan_pengajuan.manual_status_override', false)
                       ->whereDate('kegiatan_pengajuan.tgl_mulai', '<=', $today)
                       ->whereDate('kegiatan_pengajuan.tgl_selesai', '>=', $today);
                });
            })
            ->orderBy('skema.nama_skema')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Dedupe by skema_id
        |--------------------------------------------------------------------------
        | Each skema has two PENERIMAAN_PROPOSAL periodes — one for Penelitian
        | and one for PkM — because the workflows diverge. From the dosen's
        | perspective those are still one skema; they pick the jenis on the
        | form itself. The API returns per-jenis periode IDs so the frontend
        | can look up the right one when the user selects jenis.
        |--------------------------------------------------------------------------
        */

        return $rows
            ->groupBy('skema_id')
            ->map(function ($group) {

                $first = $group->first();

                $kegiatansByJenis = [];

                foreach ($group as $row) {
                    $kegiatansByJenis[$row->jenis_penelitian] = $row->kegiatan_id;
                }

                return [
                    'skema_id'          => $first->skema_id,
                    'nama_skema'        => $first->nama_skema,

                    // Kept for backward compatibility with any caller that
                    // expects a single kegiatan_id — resolves to Penelitian
                    // if present, otherwise PkM.
                    'kegiatan_id'        => $kegiatansByJenis['Penelitian']
                        ?? $kegiatansByJenis['PkM']
                        ?? $first->kegiatan_id,

                    'kegiatan_id_map'    => $kegiatansByJenis,
                ];
            })
            ->values();
    }
}