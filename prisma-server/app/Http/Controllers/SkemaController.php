<?php

namespace App\Http\Controllers;

use App\Models\Skema;
use App\Models\KegiatanPengajuan;
use App\Models\Proposal;
use App\Models\Laporan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\ApiResponse;
use Carbon\Carbon;

class SkemaController extends Controller
{
    public function index()
    {
        return Skema::with('kegiatan')
            ->orderByDesc('created_at')
            ->paginate(10);
    }

    public function fetchAll(){
        return Skema::select(
            'skema_id',
            'nama_skema'
        )->get();
    }

    /*
    |--------------------------------------------------------------------------
    | Staff LPPM Monitoring — enriched per-Skema data
    |--------------------------------------------------------------------------
    | Returns each Skema with aggregated counts so Staff can decide which
    | Skema needs attention before opening it.
    |--------------------------------------------------------------------------
    */

    public function staffMonitoring()
    {
        $skemas = Skema::with('kegiatan')
            ->orderByDesc('created_at')
            ->get();

        $result = $skemas->map(function ($skema) {
            $kegiatanIds = $skema->kegiatan->pluck('kegiatan_id');

            // ── Proposal counts ──────────────────────────────────────
            $proposalQuery = Proposal::whereIn('kegiatan_id', $kegiatanIds);
            $totalProposals = (clone $proposalQuery)->count();

            // Staff-actionable proposal statuses
            $proposalSelectionPending = (clone $proposalQuery)
                ->where('status', 'Menunggu review Staff LPPM')
                ->count();

            $reviewerAssignmentPending = (clone $proposalQuery)
                ->where('status', 'Menunggu penugasan reviewer')
                ->count();

            // ── Laporan counts ───────────────────────────────────────
            $laporanQuery = Laporan::whereIn('kegiatan_id', $kegiatanIds);
            $activeLaporans = (clone $laporanQuery)
                ->whereNull('completed_at')
                ->count();

            // Staff-actionable laporan statuses
            $laporanReviewPending = (clone $laporanQuery)
                ->whereIn('status', [
                    'Menunggu review Staff LPPM',
                    'Menunggu review Admin',
                ])
                ->count();

            // ── Dana confirmation (both claim & pengembalian) ────────
            $danaConfirmationPending = (clone $laporanQuery)
                ->where(function ($q) {
                    $q->where('claim_dana_status', 'Menunggu konfirmasi admin')
                      ->orWhere('pengembalian_dana_status', 'Menunggu konfirmasi admin');
                })
                ->count();

            // ── Total staff pending actions ──────────────────────────
            $pendingActions = $proposalSelectionPending
                + $reviewerAssignmentPending
                + $laporanReviewPending
                + $danaConfirmationPending;

            // ── Pending breakdown (only non-zero) ────────────────────
            $pendingBreakdown = collect([
                'Seleksi Proposal' => $proposalSelectionPending,
                'Penugasan Reviewer' => $reviewerAssignmentPending,
                'Pemeriksaan Laporan' => $laporanReviewPending,
                'Konfirmasi Dana' => $danaConfirmationPending,
            ])->filter(fn($count) => $count > 0)->toArray();

            // ── Open kegiatan (effective_status === 'Terbuka') ───────
            $openKegiatan = $skema->kegiatan
                ->filter(fn($k) => $k->effective_status === 'Terbuka');

            $openKegiatanLabels = $openKegiatan
                ->map(fn($k) => $k->nama_kegiatan)
                ->values()
                ->toArray();

            // ── Manual override warning count ────────────────────────
            $manualOverrideCount = $openKegiatan
                ->filter(fn($k) => $k->manual_status_override)
                ->count();

            return [
                'skema_id' => $skema->skema_id,
                'nama_skema' => $skema->nama_skema,
                'tahun_ajaran' => $skema->tahun_ajaran,
                'status' => $skema->status,

                'proposal_count' => $totalProposals,
                'active_laporan_count' => $activeLaporans,

                'pending_actions' => $pendingActions,
                'pending_breakdown' => $pendingBreakdown,

                'open_kegiatan_count' => $openKegiatan->count(),
                'open_kegiatan_labels' => $openKegiatanLabels,
                'manual_override_count' => $manualOverrideCount,

                // Needed by Proposal/Laporan pages to derive availableTypes
                'kegiatan' => $skema->kegiatan->map(fn($k) => [
                    'kegiatan_id' => $k->kegiatan_id,
                    'jenis_penelitian' => $k->jenis_penelitian,
                    'kode_kegiatan' => $k->kode_kegiatan,
                    'nama_kegiatan' => $k->nama_kegiatan,
                    'tgl_mulai' => $k->tgl_mulai,
                    'tgl_selesai' => $k->tgl_selesai,
                    'status' => $k->status,
                    'effective_status' => $k->effective_status,
                ])->values(),
            ];
        });

        // ── Sort: pending actions first, then active, then finished, then draft ──
        $statusOrder = ['Aktif' => 0, 'Selesai' => 1, 'Draft' => 2];
        $result = $result->sortBy([
            fn($a, $b) => ($b['pending_actions'] > 0) <=> ($a['pending_actions'] > 0),
            fn($a, $b) => ($statusOrder[$a['status']] ?? 9) <=> ($statusOrder[$b['status']] ?? 9),
            fn($a, $b) => $b['tahun_ajaran'] <=> $a['tahun_ajaran'],
        ])->values();

        return ApiResponse::success($result);
    }

    public function show($id)
    {
        return Skema::with('kegiatan')
            ->findOrFail($id);
    }

    public function store(Request $request)
    {
        DB::beginTransaction();

        try {

            $skema = Skema::create([
                'nama_skema'   => $request->nama_skema,
                'tahun_ajaran' => $request->tahun_ajaran,
                'status'       => 'Draft',
            ]);

            $this->generateKegiatan($skema);

            DB::commit();

            return ApiResponse::success();
        }
        catch (\Exception $e) {

            DB::rollBack();

            return ApiResponse::failed(
                $e->getMessage()
            );
        }
    }

    public function update(Request $request)
    {
        try{
            $s = Skema::findOrFail($request->skema_id);

            /*
            |--------------------------------------------------------------------------
            | Validate Status Change
            |--------------------------------------------------------------------------
            */

            if(in_array($request->status, ['Aktif', 'Selesai']))
            {
                $missingTimeline = $s->kegiatan()
                    ->where(function($q){
                        $q->whereNull('tgl_mulai')
                        ->orWhereNull('tgl_selesai');
                    })
                    ->exists();

                if($missingTimeline){
                    return ApiResponse::failed('Seluruh kegiatan harus memiliki tanggal mulai dan tanggal selesai terlebih dahulu.');
                }
            }

            $s->update([
                'nama_skema' => $request->nama_skema,
                'tahun_ajaran' => $request->tahun_ajaran,
                'status' => $request->status,
            ]);

            return ApiResponse::success();
        }
        catch (\Exception $e) {
            \Log::error($e->getMessage());
            return ApiResponse::failed();
        }
    }

    public function destroy(Request $request)
    {
        try {
            $skema = Skema::findOrFail($request->skema_id);
            $skema->kegiatan()->delete();
            $skema->delete();

            return ApiResponse::success();
        }
        catch (\Exception $e) {

            return ApiResponse::failed(
                $e->getMessage()
            );
        }
    }

    private function generateKegiatan(Skema $skema)
    {
        $penelitian = [
            [
                'kode_kegiatan' => 'PENERIMAAN_PROPOSAL',
                'nama_kegiatan' => 'Penerimaan Proposal'
            ],
            [
                'kode_kegiatan' => 'SELEKSI_PROPOSAL',
                'nama_kegiatan' => 'Seleksi Proposal'
            ],
            [
                'kode_kegiatan' => 'PENGUMUMAN_SURAT_TUGAS',
                'nama_kegiatan' => 'Pengumuman Surat Tugas Proposal'
            ],
            [
                'kode_kegiatan' => 'PROSES_PENELITIAN_GANJIL',
                'nama_kegiatan' => 'Proses Penelitian (Ganjil)'
            ],
            [
                'kode_kegiatan' => 'PUBLIKASI_GANJIL',
                'nama_kegiatan' => 'Publikasi Penelitian (Ganjil)'
            ],
            [
                'kode_kegiatan' => 'DISEMINASI_GANJIL',
                'nama_kegiatan' => 'Diseminasi Hasil Penelitian (Ganjil)'
            ],
            [
                'kode_kegiatan' => 'CLAIM_DANA_GANJIL',
                'nama_kegiatan' => 'Claim Pembiayaan Penelitian (Ganjil)'
            ],
            [
                'kode_kegiatan' => 'PROSES_PENELITIAN_GENAP',
                'nama_kegiatan' => 'Proses Penelitian (Genap)'
            ],
            [
                'kode_kegiatan' => 'PUBLIKASI_GENAP',
                'nama_kegiatan' => 'Publikasi Penelitian (Genap)'
            ],
            [
                'kode_kegiatan' => 'DISEMINASI_GENAP',
                'nama_kegiatan' => 'Diseminasi Hasil Penelitian (Genap)'
            ],
            [
                'kode_kegiatan' => 'CLAIM_DANA_GENAP',
                'nama_kegiatan' => 'Claim Pembiayaan Penelitian (Genap)'
            ],
            [
                'kode_kegiatan' => 'LUARAN_PENELITIAN',
                'nama_kegiatan' => 'Luaran Penelitian'
            ],
        ];

        $pkm = [
            [
                'kode_kegiatan' => 'PENERIMAAN_PROPOSAL',
                'nama_kegiatan' => 'Penerimaan Proposal'
            ],
            [
                'kode_kegiatan' => 'SELEKSI_PROPOSAL',
                'nama_kegiatan' => 'Seleksi Proposal'
            ],
            [
                'kode_kegiatan' => 'PENGUMUMAN_SURAT_TUGAS',
                'nama_kegiatan' => 'Pengumuman Surat Tugas Proposal'
            ],
            [
                'kode_kegiatan' => 'CLAIM_DANA_GANJIL',
                'nama_kegiatan' => 'Claim Pembiayaan PkM (Ganjil)'
            ],
            [
                'kode_kegiatan' => 'PROSES_PKM_GANJIL',
                'nama_kegiatan' => 'Proses PkM (Ganjil)'
            ],
            [
                'kode_kegiatan' => 'PUBLIKASI_GANJIL',
                'nama_kegiatan' => 'Publikasi PkM (Ganjil)'
            ],
            [
                'kode_kegiatan' => 'PENGEMBALIAN_DANA_GANJIL',
                'nama_kegiatan' => 'Pengembalian Dana (Ganjil)'
            ],
            [
                'kode_kegiatan' => 'DISEMINASI_GANJIL',
                'nama_kegiatan' => 'Diseminasi Hasil PkM (Ganjil)'
            ],
            [
                'kode_kegiatan' => 'CLAIM_DANA_GENAP',
                'nama_kegiatan' => 'Claim Pembiayaan PkM (Genap)'
            ],
            [
                'kode_kegiatan' => 'PROSES_PKM_GENAP',
                'nama_kegiatan' => 'Proses PkM (Genap)'
            ],
            [
                'kode_kegiatan' => 'PUBLIKASI_GENAP',
                'nama_kegiatan' => 'Publikasi PkM (Genap)'
            ],
            [
                'kode_kegiatan' => 'PENGEMBALIAN_DANA_GENAP',
                'nama_kegiatan' => 'Pengembalian Dana (Genap)'
            ],
            [
                'kode_kegiatan' => 'DISEMINASI_GENAP',
                'nama_kegiatan' => 'Diseminasi Hasil PkM (Genap)'
            ],
            [
                'kode_kegiatan' => 'LUARAN_PKM',
                'nama_kegiatan' => 'Luaran PkM'
            ],
        ];

        $this->generateTimeline(
            $skema,
            'Penelitian',
            $penelitian
        );

        $this->generateTimeline(
            $skema,
            'PkM',
            $pkm
        );
    }

    private function generateTimeline(
        Skema $skema,
        string $jenisPenelitian,
        array $periods
    )
    {
        $startDate = Carbon::create(
            now()->year,
            7,
            1
        );

        $endDate = Carbon::create(
            now()->year + 1,
            7,
            1
        );

        $totalDays = $startDate->diffInDays($endDate);

        $periodCount = count($periods);

        $daysPerPeriod = floor(
            $totalDays / $periodCount
        );

        $currentStart = $startDate->copy();

        foreach ($periods as $index => $item) {

            if ($index === ($periodCount - 1)) {
                $currentEnd = $endDate->copy();
            }
            else {
                $currentEnd = $currentStart
                    ->copy()
                    ->addDays($daysPerPeriod - 1);
            }

            KegiatanPengajuan::create([
                'skema_id' => $skema->skema_id,
                'jenis_penelitian' => $jenisPenelitian,
                'kode_kegiatan' => $item['kode_kegiatan'],
                'nama_kegiatan' => $item['nama_kegiatan'],
                'tgl_mulai' => $currentStart->toDateString(),
                'tgl_selesai' => $currentEnd->toDateString(),
                'status' => 'Belum dibuka',
            ]);

            $currentStart = $currentEnd
                ->copy()
                ->addDay();
        }
}
}