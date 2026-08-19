<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\AuthorizationRequest;
use App\Models\KegiatanEditRequest;
use App\Models\KegiatanPengajuan;
use App\Models\Laporan;
use App\Models\PenugasanReviewer;
use App\Models\Proposal;
use App\Models\Skema;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function superadmin(): JsonResponse
    {
        $totalUsers = User::count();
        $usersByRole = User::select('role', DB::raw('count(*) as total'))
            ->groupBy('role')
            ->pluck('total', 'role');

        $totalSkema = Skema::count();
        $activeSkema = Skema::where('status', 'Aktif')->count();

        $totalProposals = Proposal::count();
        $totalLaporan = Laporan::count();
        $activeLaporan = Laporan::active()->count();

        $kegiatanByStatus = KegiatanPengajuan::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $recentProposals = Proposal::with(['user' => fn($q) => $q->withTrashed()])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($p) => [
                'proposal_id' => $p->proposal_id,
                'judul' => $p->judul,
                'status' => $p->status,
                'dosen' => $p->user->nama ?? '-',
                'created_at' => $p->created_at->toISOString(),
            ]);

        return ApiResponse::success([
            'summary' => [
                'total_users' => $totalUsers,
                'users_by_role' => $usersByRole,
                'total_skema' => $totalSkema,
                'active_skema' => $activeSkema,
                'total_proposals' => $totalProposals,
                'total_laporan' => $totalLaporan,
                'active_laporan' => $activeLaporan,
            ],
            'kegiatan_by_status' => $kegiatanByStatus,
            'recent_proposals' => $recentProposals,
        ]);
    }

    public function staff(): JsonResponse
    {
        $proposalSelectionPending = Proposal::where('status', 'Menunggu review Staff LPPM')->count();

        $reviewerAssignmentPending = Proposal::where('status', 'Menunggu penugasan reviewer')->count();

        $laporanReviewPending = Laporan::whereIn('status', [
            'Menunggu review Staff LPPM',
            'Menunggu review Admin',
        ])->count();

        $danaPending = Laporan::where(function ($q) {
                $q->where('claim_dana_status', 'Menunggu bukti terima')
                  ->orWhere('claim_dana_status', 'Menunggu konfirmasi admin')
                  ->orWhere('pengembalian_dana_status', 'Menunggu Pengembalian Dana')
                  ->orWhere('pengembalian_dana_status', 'Menunggu konfirmasi admin');
            })
            ->count();

        $workload = [
            'seleksi_proposal' => $proposalSelectionPending,
            'penugasan_reviewer' => $reviewerAssignmentPending,
            'pemeriksaan_laporan' => $laporanReviewPending,
            'konfirmasi_dana' => $danaPending,
        ];

        $proposalByStatus = Proposal::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $laporanByStage = Laporan::active()
            ->join('kegiatan_pengajuan', 'laporan.kegiatan_id', '=', 'kegiatan_pengajuan.kegiatan_id')
            ->select('kegiatan_pengajuan.kode_kegiatan', DB::raw('count(*) as total'))
            ->groupBy('kegiatan_pengajuan.kode_kegiatan')
            ->pluck('total', 'kode_kegiatan');

        $activePeriodes = KegiatanPengajuan::with('skema')
            ->get()
            ->filter(fn($kp) => $kp->effective_status === 'Terbuka')
            ->values()
            ->map(fn($kp) => [
                'kegiatan_id' => $kp->kegiatan_id,
                'nama_kegiatan' => $kp->nama_kegiatan,
                'kode_kegiatan' => $kp->kode_kegiatan,
                'jenis_penelitian' => $kp->jenis_penelitian,
                'tgl_mulai' => $kp->tgl_mulai,
                'tgl_selesai' => $kp->tgl_selesai,
                'status' => $kp->status,
                'effective_status' => $kp->effective_status,
                'manual_status_override' => $kp->manual_status_override,
                'skema_nama' => $kp->skema->nama_skema ?? '-',
                'skema_id' => $kp->skema_id,
            ]);

        $activeSkemaIds = KegiatanPengajuan::whereHas('skema', fn($q) => $q->where('status', 'Aktif'))
            ->pluck('skema_id')
            ->unique();

        $allStages = KegiatanPengajuan::with('skema')
            ->whereIn('skema_id', $activeSkemaIds)
            ->get()
            ->groupBy(fn($kp) => "{$kp->skema_id}_{$kp->jenis_penelitian}")
            ->map(fn($group) => [
                'skema_id' => $group->first()->skema_id,
                'skema_nama' => $group->first()->skema->nama_skema ?? '-',
                'jenis_penelitian' => $group->first()->jenis_penelitian,
                'stages' => $group->map(fn($kp) => [
                    'kegiatan_id' => $kp->kegiatan_id,
                    'kode_kegiatan' => $kp->kode_kegiatan,
                    'nama_kegiatan' => $kp->nama_kegiatan,
                    'tgl_mulai' => $kp->tgl_mulai,
                    'tgl_selesai' => $kp->tgl_selesai,
                    'effective_status' => $kp->effective_status,
                    'manual_status_override' => $kp->manual_status_override,
                ])->values(),
            ])
            ->values();

        $actionQueue = $this->getStaffActionQueue();

        $recentActivity = $this->getRecentActivity(5);

        return ApiResponse::success([
            'summary' => [
                'proposal_selection_pending' => $proposalSelectionPending,
                'reviewer_assignment_pending' => $reviewerAssignmentPending,
                'laporan_review_pending' => $laporanReviewPending,
                'dana_confirmation_pending' => $danaPending,
            ],
            'workload' => $workload,
            'active_periodes' => $activePeriodes,
            'kegiatan_flows' => $allStages,
            'proposal_by_status' => $proposalByStatus,
            'laporan_by_stage' => $laporanByStage,
            'action_queue' => $actionQueue,
            'recent_activity' => $recentActivity,
        ]);
    }

    public function ketua(): JsonResponse
    {
        $proposalMenunggu = Proposal::where('status', 'Menunggu review dari Ketua LPPM')->count();

        $laporanMenunggu = Laporan::whereIn('status', [
            'Menunggu review Admin',
            'Menunggu keputusan Ketua',
        ])->count();

        $pendingAuth = AuthorizationRequest::where('status', 'Menunggu Persetujuan')->count();

        $pendingKegiatanEdit = KegiatanEditRequest::where('status', 'Menunggu Otorisasi')->count();

        $actionQueue = $this->getKetuaActionQueue();

        $recentActivity = $this->getRecentActivity(5);

        return ApiResponse::success([
            'summary' => [
                'proposal_menunggu' => $proposalMenunggu,
                'laporan_menunggu' => $laporanMenunggu,
                'pending_auth' => $pendingAuth,
                'pending_kegiatan_edit' => $pendingKegiatanEdit,
            ],
            'action_queue' => $actionQueue,
            'recent_activity' => $recentActivity,
        ]);
    }

    public function dosen(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $totalProposal = Proposal::where('user_id', $userId)->count();

        $laporanAktif = Laporan::whereHas('proposal', fn($q) => $q->where('user_id', $userId))
            ->active()
            ->count();

        $laporanSelesai = Laporan::whereHas('proposal', fn($q) => $q->where('user_id', $userId))
            ->whereNotNull('completed_at')
            ->count();

        $perluTindakan = Laporan::whereHas('proposal', fn($q) => $q->where('user_id', $userId))
            ->active()
            ->whereIn('status', [
                'Dalam pengerjaan',
                'Menunggu kelengkapan data',
                'Revisi',
                'Menunggu konfirmasi penerimaan dana',
                'Menunggu Pengembalian Dana',
            ])
            ->count();

        $actionQueue = $this->getDosenActionQueue($userId);

        $waitingProcess = $this->getDosenWaitingProcess($userId);

        $workflowProgress = $this->getDosenWorkflowProgress($userId);

        $recentActivity = $this->getDosenRecentActivity($userId, 5);

        return ApiResponse::success([
            'summary' => [
                'total_proposal' => $totalProposal,
                'laporan_aktif' => $laporanAktif,
                'perlu_tindakan' => $perluTindakan,
                'laporan_selesai' => $laporanSelesai,
            ],
            'action_queue' => $actionQueue,
            'waiting_process' => $waitingProcess,
            'workflow_progress' => $workflowProgress,
            'recent_activity' => $recentActivity,
        ]);
    }

    public function reviewer(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $menungguReview = PenugasanReviewer::where('user_id', $userId)
            ->where('status_review', 'Belum direview')
            ->count();

        $sedangDikerjakan = PenugasanReviewer::where('user_id', $userId)
            ->where('status_review', 'Belum direview')
            ->count();

        $reviewSelesai = PenugasanReviewer::where('user_id', $userId)
            ->where('status_review', 'Telah direview')
            ->count();

        $reviewQueue = $this->getReviewerQueue($userId);

        return ApiResponse::success([
            'summary' => [
                'menunggu_review' => $menungguReview,
                'sedang_dikerjakan' => $sedangDikerjakan,
                'review_selesai' => $reviewSelesai,
            ],
            'review_queue' => $reviewQueue,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Private Helpers
    |--------------------------------------------------------------------------
    */

    private function getStaffActionQueue(): array
    {
        $items = [];

        $proposals = Proposal::with(['user' => fn($q) => $q->withTrashed(), 'kegiatan.skema'])
            ->whereIn('status', [
                'Menunggu review Staff LPPM',
                'Menunggu penugasan reviewer',
            ])
            ->latest()
            ->take(5)
            ->get();

        foreach ($proposals as $p) {
            $skemaId = $p->kegiatan->skema->skema_id ?? null;
            $url = '/dashboard?module=staffmonitoringprogress';
            if ($skemaId) {
                $url .= '&skema_id=' . $skemaId . '&view=proposal';
            }
            $url .= '&proposal_id=' . $p->proposal_id;
            $url .= '&tab=SELEKSI_PROPOSAL';
            $items[] = [
                'type' => 'proposal',
                'id' => $p->proposal_id,
                'title' => $p->judul,
                'status' => $p->status,
                'owner' => $p->user->nama ?? '-',
                'created_at' => $p->created_at->toISOString(),
                'skema_id' => $skemaId,
                'action_url' => $url,
            ];
        }

        $laporan = Laporan::with(['proposal' => fn($q) => $q->withTrashed(), 'proposal.user' => fn($q) => $q->withTrashed(), 'proposal.kegiatan.skema'])
            ->whereIn('status', [
                'Menunggu review Staff LPPM',
                'Menunggu review Admin',
            ])
            ->latest('tgl_mulai')
            ->take(5)
            ->get();

        foreach ($laporan as $l) {
            $skemaId = $l->proposal->kegiatan->skema->skema_id ?? null;
            $url = '/dashboard?module=staffmonitoringprogresslaporan';
            if ($skemaId) {
                $url .= '&skema_id=' . $skemaId . '&view=laporan';
            }
            $url .= '&laporan_id=' . $l->laporan_id;

            $kode = $l->kodeKegiatan();
            $tab = \App\Helpers\NotificationUrl::laporanTab($kode) ?: 'PROSES_PENELITIAN';
            $url .= '&tab=' . $tab;

            $items[] = [
                'type' => 'laporan',
                'id' => $l->laporan_id,
                'title' => $l->judul_penelitian,
                'status' => $l->status,
                'semester' => $l->semester,
                'owner' => $l->proposal->user->nama ?? '-',
                'created_at' => $l->created_at->toISOString(),
                'skema_id' => $skemaId,
                'action_url' => $url,
            ];
        }

        $dana = Laporan::with(['proposal' => fn($q) => $q->withTrashed(), 'proposal.user' => fn($q) => $q->withTrashed(), 'proposal.kegiatan.skema'])
            ->where(function ($q) {
                $q->where('claim_dana_status', 'Menunggu bukti terima')
                  ->orWhere('claim_dana_status', 'Menunggu konfirmasi admin')
                  ->orWhere('pengembalian_dana_status', 'Menunggu Pengembalian Dana')
                  ->orWhere('pengembalian_dana_status', 'Menunggu konfirmasi admin');
            })
            ->latest('updated_at')
            ->take(5)
            ->get();

        foreach ($dana as $d) {
            $skemaId = $d->proposal->kegiatan->skema->skema_id ?? null;
            $url = '/dashboard?module=staffmonitoringprogresslaporan';
            if ($skemaId) {
                $url .= '&skema_id=' . $skemaId . '&view=laporan';
            }
            $url .= '&laporan_id=' . $d->laporan_id;
            $url .= '&tab=CLAIM_DANA';

            $status = $d->claim_dana_status ?: $d->pengembalian_dana_status;

            $items[] = [
                'type' => 'dana',
                'id' => $d->laporan_id,
                'title' => $d->judul_penelitian,
                'status' => $status,
                'semester' => $d->semester,
                'owner' => $d->proposal->user->nama ?? '-',
                'created_at' => $d->updated_at->toISOString(),
                'skema_id' => $skemaId,
                'action_url' => $url,
            ];
        }

        usort($items, fn($a, $b) => strtotime($b['created_at'] ?? 'now') - strtotime($a['created_at'] ?? 'now'));

        return array_slice($items, 0, 10);
    }

    private function getKetuaActionQueue(): array
    {
        $items = [];

        $proposals = Proposal::with(['user' => fn($q) => $q->withTrashed(), 'kegiatan.skema'])
            ->where('status', 'Menunggu review dari Ketua LPPM')
            ->latest()
            ->take(5)
            ->get();

        foreach ($proposals as $p) {
            $skemaId = $p->kegiatan->skema->skema_id ?? null;
            $url = '/dashboard?module=staffmonitoringprogress';
            if ($skemaId) {
                $url .= '&skema_id=' . $skemaId . '&view=proposal';
            }
            $url .= '&proposal_id=' . $p->proposal_id;
            $url .= '&tab=SELEKSI_PROPOSAL';
            $items[] = [
                'type' => 'proposal',
                'id' => $p->proposal_id,
                'title' => $p->judul,
                'status' => $p->status,
                'owner' => $p->user->nama ?? '-',
                'skema_id' => $skemaId,
                'action_url' => $url,
            ];
        }

        $laporan = Laporan::with(['proposal' => fn($q) => $q->withTrashed(), 'proposal.user' => fn($q) => $q->withTrashed(), 'proposal.kegiatan.skema'])
            ->whereIn('status', [
                'Menunggu review Admin',
                'Menunggu keputusan Ketua',
            ])
            ->latest('tgl_mulai')
            ->take(5)
            ->get();

        foreach ($laporan as $l) {
            $skemaId = $l->proposal->kegiatan->skema->skema_id ?? null;
            $url = '/dashboard?module=staffmonitoringprogresslaporan';
            if ($skemaId) {
                $url .= '&skema_id=' . $skemaId . '&view=laporan';
            }
            $url .= '&laporan_id=' . $l->laporan_id;

            $kode = $l->kodeKegiatan();
            $tab = \App\Helpers\NotificationUrl::laporanTab($kode) ?: 'PROSES_PENELITIAN';
            $url .= '&tab=' . $tab;

            $items[] = [
                'type' => 'laporan',
                'id' => $l->laporan_id,
                'title' => $l->judul_penelitian,
                'status' => $l->status,
                'semester' => $l->semester,
                'owner' => $l->proposal->user->nama ?? '-',
                'skema_id' => $skemaId,
                'action_url' => $url,
            ];
        }

        $authRequests = AuthorizationRequest::with(['requestable', 'requester'])
            ->where('status', 'Menunggu Persetujuan')
            ->latest()
            ->take(3)
            ->get();

        foreach ($authRequests as $ar) {
            $url = '/dashboard?module=staffmonitoringprogress';
            if ($ar->requestable_type === 'App\\Models\\Proposal') {
                $proposal = $ar->requestable;
                $skemaId = $proposal->kegiatan->skema->skema_id ?? null;
                if ($skemaId) {
                    $url .= '&skema_id=' . $skemaId . '&view=proposal';
                }
                $url .= '&proposal_id=' . $ar->requestable_id;
                $url .= '&tab=SELEKSI_PROPOSAL';
            } elseif ($ar->requestable_type === 'App\\Models\\Laporan') {
                $laporan = $ar->requestable;
                $skemaId = $laporan->proposal->kegiatan->skema->skema_id ?? null;
                if ($skemaId) {
                    $url .= '&skema_id=' . $skemaId . '&view=laporan';
                }
                $url .= '&laporan_id=' . $ar->requestable_id;
                $url .= '&tab=DISEMINASI';
            }
            $items[] = [
                'type' => 'authorization',
                'id' => $ar->id,
                'title' => 'Otorisasi: ' . $ar->action,
                'status' => $ar->status,
                'owner' => $ar->requester->nama ?? '-',
                'action_url' => $url,
            ];
        }

        return array_slice($items, 0, 10);
    }

    private function getDosenActionQueue(int $userId): array
    {
        $items = [];

        $laporan = Laporan::with(['proposal' => fn($q) => $q->withTrashed(), 'kegiatan' => fn($q) => $q->withTrashed()])
            ->whereHas('proposal', fn($q) => $q->where('user_id', $userId))
            ->active()
            ->whereIn('status', [
                'Dalam pengerjaan',
                'Menunggu kelengkapan data',
                'Revisi',
                'Menunggu konfirmasi penerimaan dana',
                'Menunggu Pengembalian Dana',
            ])
            ->latest('tgl_mulai')
            ->take(10)
            ->get();

        foreach ($laporan as $l) {
            $skemaId = $l->proposal->kegiatan->skema->skema_id ?? null;

            // Determine the tab from kode_kegiatan (e.g., "PUBLIKASI_GANJIL" → "PUBLIKASI")
            $tab = \App\Helpers\NotificationUrl::laporanTab($l->kodeKegiatan());

            $url = '/dashboard?module=dosenmonitoringprogresslaporan';
            if ($skemaId) {
                $url .= '&skema_id=' . $skemaId . '&view=laporan';
            }
            $url .= '&laporan_id=' . $l->laporan_id;
            if ($tab) {
                $url .= '&tab=' . $tab;
            }
            if ($l->jenis_penelitian) {
                $url .= '&jenis=' . urlencode($l->jenis_penelitian);
            }

            $items[] = [
                'type' => 'laporan',
                'id' => $l->laporan_id,
                'title' => $l->judul_penelitian,
                'status' => $l->status,
                'semester' => $l->semester,
                'jenis' => $l->jenis_penelitian,
                'action_url' => $url,
            ];
        }

        return $items;
    }

    private function getDosenWaitingProcess(int $userId): array
    {
        $items = [];

        // Proposals waiting for external processing (not needing Dosen action)
        $proposals = Proposal::with(['kegiatan' => fn($q) => $q->withTrashed()])
            ->where('user_id', $userId)
            ->whereIn('status', [
                'Menunggu review dari Ketua LPPM',
                'Menunggu review Staff LPPM',
                'Menunggu penugasan reviewer',
                'Menunggu review',
                'Menunggu persetujuan Ketua LPPM',
                'Proposal Diterima',
            ])
            ->latest()
            ->take(5)
            ->get();

        foreach ($proposals as $p) {
            $skemaId = $p->kegiatan->skema->skema_id ?? null;

            // Determine the correct tab based on proposal status
            $tab = 'SELEKSI_PROPOSAL';
            if ($p->status === 'Proposal Diterima') {
                $tab = 'PENGUMUMAN_SURAT_TUGAS';
            }

            $url = '/dashboard?module=dosenmonitoringprogress';
            if ($skemaId) {
                $url .= '&skema_id=' . $skemaId . '&view=proposal';
            }
            $url .= '&proposal_id=' . $p->proposal_id;
            $url .= '&tab=' . $tab;
            if ($p->jenis_penelitian) {
                $url .= '&jenis=' . urlencode($p->jenis_penelitian);
            }

            $items[] = [
                'type' => 'proposal',
                'id' => $p->proposal_id,
                'title' => $p->judul,
                'status' => $p->status,
                'action_url' => $url,
            ];
        }

        // Laporans waiting for external processing (not needing Dosen action)
        $laporan = Laporan::with(['proposal' => fn($q) => $q->withTrashed(), 'kegiatan' => fn($q) => $q->withTrashed()])
            ->whereHas('proposal', fn($q) => $q->where('user_id', $userId))
            ->active()
            ->whereIn('status', [
                'Menunggu review Staff LPPM',
                'Menunggu review Admin',
                'Menunggu review',
                'Menunggu hasil dari Reviewers',
                'Menunggu keputusan Ketua',
                'Menunggu penugasan reviewer',
                'Menunggu Persetujuan Ketua LPPM',
                'Menunggu konfirmasi pengiriman dana',
            ])
            ->latest('tgl_mulai')
            ->take(5)
            ->get();

        foreach ($laporan as $l) {
            $skemaId = $l->proposal->kegiatan->skema->skema_id ?? null;

            // Determine the tab from kode_kegiatan (e.g., "PUBLIKASI_GANJIL" → "PUBLIKASI")
            $tab = \App\Helpers\NotificationUrl::laporanTab($l->kodeKegiatan());

            $url = '/dashboard?module=dosenmonitoringprogresslaporan';
            if ($skemaId) {
                $url .= '&skema_id=' . $skemaId . '&view=laporan';
            }
            $url .= '&laporan_id=' . $l->laporan_id;
            if ($tab) {
                $url .= '&tab=' . $tab;
            }
            if ($l->jenis_penelitian) {
                $url .= '&jenis=' . urlencode($l->jenis_penelitian);
            }

            $items[] = [
                'type' => 'laporan',
                'id' => $l->laporan_id,
                'title' => $l->judul_penelitian,
                'status' => $l->status,
                'semester' => $l->semester,
                'action_url' => $url,
            ];
        }

        return array_slice($items, 0, 10);
    }

    private function getDosenWorkflowProgress(int $userId): array
    {
        $latestProposal = Proposal::with(['kegiatan' => fn($q) => $q->withTrashed(), 'laporan' => fn($q) => $q->with(['kegiatan' => fn($q2) => $q2->withTrashed()])])
            ->where('user_id', $userId)
            ->latest()
            ->first();

        if (!$latestProposal) {
            return [];
        }

        $stages = [
            'Pengajuan' => in_array($latestProposal->status, ['Draf', 'Menunggu proposal untuk diupload']),
            'Seleksi' => in_array($latestProposal->status, ['Menunggu review dari Ketua LPPM', 'Menunggu review Staff LPPM', 'Menunggu penugasan reviewer', 'Menunggu review', 'Menunggu persetujuan Ketua LPPM']),
            'Surat Tugas' => $latestProposal->status === 'Proposal Diterima',
        ];

        foreach ($latestProposal->laporan as $laporan) {
            $label = 'Laporan ' . $laporan->semester;
            $stages[$label] = !in_array($laporan->status, ['Belum dimulai', 'Dalam pengerjaan']);
        }

        // Determine the current stage and build the navigation URL
        $firstIncomplete = null;
        foreach ($stages as $label => $done) {
            if (!$done) {
                $firstIncomplete = $label;
                break;
            }
        }
        // If all stages are done, the current stage is the last one
        if ($firstIncomplete === null) {
            $lastKey = array_key_last($stages);
            $firstIncomplete = $lastKey;
        }

        // Build navigation URL based on current stage
        $skemaId = $latestProposal->kegiatan->skema->skema_id ?? null;
        $navigationUrl = '/dashboard?module=dosenmonitoringprogress';

        if ($firstIncomplete === 'Pengajuan' || $firstIncomplete === 'Seleksi' || $firstIncomplete === 'Surat Tugas') {
            // Current stage is a proposal stage
            if ($skemaId) {
                $navigationUrl .= '&skema_id=' . $skemaId . '&view=proposal';
            }
            $navigationUrl .= '&proposal_id=' . $latestProposal->proposal_id;
            // Determine the correct tab based on status
            if ($latestProposal->status === 'Proposal Diterima') {
                $navigationUrl .= '&tab=PENGUMUMAN_SURAT_TUGAS';
            } elseif (in_array($latestProposal->status, ['Menunggu review dari Ketua LPPM', 'Menunggu review Staff LPPM', 'Menunggu penugasan reviewer', 'Menunggu review', 'Menunggu persetujuan Ketua LPPM'])) {
                $navigationUrl .= '&tab=SELEKSI_PROPOSAL';
            } else {
                $navigationUrl .= '&tab=PENERIMAAN_PROPOSAL';
            }
            if ($latestProposal->jenis_penelitian) {
                $navigationUrl .= '&jenis=' . urlencode($latestProposal->jenis_penelitian);
            }
        } else {
            // Current stage is a laporan stage - find the matching laporan
            $targetLaporan = null;
            foreach ($latestProposal->laporan as $laporan) {
                $label = 'Laporan ' . $laporan->semester;
                if ($label === $firstIncomplete) {
                    $targetLaporan = $laporan;
                    break;
                }
            }

            if ($targetLaporan) {
                $navigationUrl = '/dashboard?module=dosenmonitoringprogresslaporan';
                if ($skemaId) {
                    $navigationUrl .= '&skema_id=' . $skemaId . '&view=laporan';
                }
                $navigationUrl .= '&laporan_id=' . $targetLaporan->laporan_id;
                // Determine the tab from kode_kegiatan
                $tab = \App\Helpers\NotificationUrl::laporanTab($targetLaporan->kodeKegiatan());
                if ($tab) {
                    $navigationUrl .= '&tab=' . $tab;
                }
                if ($targetLaporan->jenis_penelitian) {
                    $navigationUrl .= '&jenis=' . urlencode($targetLaporan->jenis_penelitian);
                }
            }
        }

        return [
            'proposal_judul' => $latestProposal->judul,
            'stages' => $stages,
            'current_stage' => $firstIncomplete,
            'navigation_url' => $navigationUrl,
        ];
    }

    private function getReviewerQueue(int $userId): array
    {
        return PenugasanReviewer::with([
            'reviewable' => function ($q) {
                $q->withTrashed();
                if ($q instanceof \App\Models\Proposal) {
                    $q->with(['user' => fn($q2) => $q2->withTrashed()]);
                } elseif ($q instanceof \App\Models\Laporan) {
                    $q->with(['proposal' => fn($q2) => $q2->withTrashed(), 'proposal.user' => fn($q2) => $q2->withTrashed()]);
                }
            },
        ])
            ->where('user_id', $userId)
            ->where('status_review', 'Belum direview')
            ->latest('tgl_penugasan')
            ->take(10)
            ->get()
            ->map(function ($p) {
                $reviewable = $p->reviewable;
                $isProposal = $reviewable instanceof Proposal;

                return [
                    'type' => $isProposal ? 'proposal' : 'laporan',
                    'id' => $p->penugasan_id,
                    'reviewable_id' => $p->reviewable_id,
                    'judul' => $isProposal ? ($reviewable->judul ?? '-') : ($reviewable->judul_penelitian ?? '-'),
                    'dosen' => $isProposal
                        ? ($reviewable->user->nama ?? '-')
                        : ($reviewable->proposal->user->nama ?? '-'),
                    'semester' => $isProposal ? null : $reviewable->semester,
                ];
            })
            ->toArray();
    }

    private function getRecentActivity(int $limit = 5): array
    {
        $proposals = Proposal::with(['user' => fn($q) => $q->withTrashed()])
            ->latest('updated_at')
            ->take($limit)
            ->get()
            ->map(fn($p) => [
                'type' => 'proposal',
                'title' => $p->judul,
                'description' => $p->status,
                'time' => $p->updated_at->toISOString(),
            ]);

        $laporan = Laporan::with(['proposal' => fn($q) => $q->withTrashed()])
            ->latest('updated_at')
            ->take($limit)
            ->get()
            ->map(fn($l) => [
                'type' => 'laporan',
                'title' => $l->judul_penelitian,
                'description' => $l->semester . ' — ' . $l->status,
                'time' => $l->updated_at->toISOString(),
            ]);

        return $proposals->concat($laporan)
            ->sortByDesc('time')
            ->take($limit)
            ->values()
            ->toArray();
    }

    private function getDosenRecentActivity(int $userId, int $limit = 5): array
    {
        $activities = [];

        $proposals = Proposal::where('user_id', $userId)
            ->latest('updated_at')
            ->take(3)
            ->get()
            ->map(fn($p) => [
                'type' => 'proposal',
                'title' => 'Proposal "' . $p->judul . '"',
                'description' => 'Status: ' . $p->status,
                'time' => $p->updated_at->toISOString(),
            ]);

        $laporan = Laporan::whereHas('proposal', fn($q) => $q->where('user_id', $userId))
            ->latest('updated_at')
            ->take(3)
            ->get()
            ->map(fn($l) => [
                'type' => 'laporan',
                'title' => 'Laporan "' . $l->judul_penelitian . '"',
                'description' => $l->semester . ' — Status: ' . $l->status,
                'time' => $l->updated_at->toISOString(),
            ]);

        return $proposals->concat($laporan)
            ->sortByDesc('time')
            ->take($limit)
            ->values()
            ->toArray();
    }
}
