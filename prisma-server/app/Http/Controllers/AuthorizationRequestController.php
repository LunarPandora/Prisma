<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AuthorizationRequest;
use App\Models\Skema;
use App\Models\KegiatanPengajuan;
use App\Models\Proposal;
use App\Models\Laporan;
use App\Helpers\ApiResponse;
use App\Helpers\KegiatanStage;
use App\Services\DocumentService;

class AuthorizationRequestController extends Controller
{
    /**
     * Staff initiates a destructive action request.
     */
    public function store(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || !in_array($user->role, ['Staff LPPM', 'Superadmin'])) {
                return ApiResponse::failed(
                    'Hanya Staff LPPM yang dapat mengajukan permintaan aksi destruktif.'
                );
            }

            $validated = $request->validate([
                'requestable_type' => ['required', 'string', 'in:Skema,KegiatanPengajuan,Proposal,Laporan'],
                'requestable_id'   => ['required', 'integer'],
                'action'           => ['required', 'string', 'in:delete,return,reject,return_diseminasi,return_seleksi,reject_proposal,return_proposal_for_revision,return_laporan_for_revision'],
                'reason'           => ['required', 'string', 'min:10'],
            ]);

            $modelClass = 'App\\Models\\' . $validated['requestable_type'];
            $resource = $modelClass::find($validated['requestable_id']);

            if (!$resource) {
                return ApiResponse::failed('Sumber daya tidak ditemukan.');
            }

            $pending = AuthorizationRequest::where('requestable_type', $modelClass)
                ->where('requestable_id', $validated['requestable_id'])
                ->where('status', 'Menunggu Persetujuan')
                ->exists();

            if ($pending) {
                return ApiResponse::failed(
                    'Masih ada permintaan yang belum diproses untuk sumber daya ini.'
                );
            }

            // Compute source_stage and target_stage
            $sourceStage = null;
            $targetStage = null;

            if ($resource instanceof Proposal) {
                $sourceStage = $resource->kegiatan?->kode_kegiatan;
            } elseif ($resource instanceof Laporan) {
                $sourceStage = $resource->kodeKegiatan();

                if (in_array($validated['action'], ['return_laporan_for_revision', 'return_diseminasi'])) {
                    $targetStage = KegiatanStage::previousKode($sourceStage, $resource) ?? $sourceStage;
                }
            }

            $authRequest = AuthorizationRequest::create([
                'requestable_type' => $modelClass,
                'requestable_id'   => $validated['requestable_id'],
                'requested_by'     => $user->id,
                'action'           => $validated['action'],
                'source_stage'     => $sourceStage,
                'target_stage'     => $targetStage,
                'reason'           => $validated['reason'],
                'current_data'     => $resource->toArray(),
                'status'           => 'Menunggu Persetujuan',
            ]);

            $skemaId = $resource->kegiatan->skema_id ?? $resource->skema_id ?? null;
            $itemId = $resource->proposal_id ?? $resource->laporan_id ?? null;
            $tab = $resource->kode_kegiatan ?? ($resource instanceof Laporan ? \App\Helpers\NotificationUrl::laporanTab($resource->kodeKegiatan()) : $resource->kegiatan?->kode_kegiatan);

            $actionLabels = [
                'delete'                          => 'Hapus',
                'return'                          => 'Kembalikan',
                'reject'                          => 'Tolak',
                'return_diseminasi'               => 'Kembalikan dari Diseminasi',
                'return_seleksi'                  => 'Kembalikan dari Seleksi',
                'reject_proposal'                 => 'Tolak Proposal',
                'return_proposal_for_revision'    => 'Kembalikan Proposal untuk Revisi',
                'return_laporan_for_revision'     => 'Kembalikan Laporan untuk Revisi',
            ];
            $actionLabel = $actionLabels[$authRequest->action] ?? $authRequest->action;

            \App\Services\NotificationService::createForRole(
                role: 'Ketua LPPM',
                type: 'authorization.created',
                title: 'Otorisasi diperlukan',
                message: "Staff LPPM meminta otorisasi untuk tindakan: {$actionLabel}.",
                data: ['authorization_request_id' => $authRequest->id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'proposal', $skemaId, $itemId, $tab, $resource->jenis_penelitian),
                key: "authorization.created.{$authRequest->id}",
            );

            return ApiResponse::success($authRequest, 'Permintaan aksi berhasil diajukan.', 201);

        } catch (\Exception $e) {
            \Log::error('Create authorization request failed: ' . $e->getMessage());
            return ApiResponse::failed($e->getMessage());
        }
    }

    /**
     * Ketua reviews and approves/rejects the request.
     */
    public function authorize(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || !in_array($user->role, ['Ketua LPPM', 'Superadmin'])) {
                return ApiResponse::failed(
                    'Hanya Ketua LPPM yang dapat menyetujui aksi destruktif.'
                );
            }

            $validated = $request->validate([
                'authorization_request_id' => ['required', 'exists:authorization_requests,id'],
                'action'                   => ['required', 'in:approve,reject'],
                'review_note'              => ['nullable', 'string'],
            ]);

            $authRequest = AuthorizationRequest::findOrFail($validated['authorization_request_id']);

            if ($authRequest->status !== 'Menunggu Persetujuan') {
                return ApiResponse::failed(
                    'Permintaan ini sudah diproses sebelumnya.'
                );
            }

            $authRequest->update([
                'status'      => $validated['action'] === 'approve' ? 'Disetujui' : 'Ditolak',
                'reviewed_by' => $user->id,
                'reviewed_at' => now(),
                'review_note' => $validated['review_note'],
            ]);

            $requestable = $authRequest->requestable()->with('kegiatan')->first();
            $skemaId = $requestable?->kegiatan->skema_id ?? $requestable?->skema_id ?? null;
            $itemId = $requestable?->proposal_id ?? $requestable?->laporan_id ?? null;
            $tab = $requestable?->kode_kegiatan ?? ($requestable instanceof Laporan ? \App\Helpers\NotificationUrl::laporanTab($requestable->kodeKegiatan()) : $requestable?->kegiatan?->kode_kegiatan);

            if ($validated['action'] === 'approve') {
                $this->executeAction($authRequest);

                \App\Services\NotificationService::create(
                    userId: $authRequest->requested_by,
                    type: 'authorization.approved',
                    title: 'Otorisasi disetujui',
                    message: "Permintaan otorisasi Anda telah disetujui oleh Ketua LPPM.",
                    data: ['authorization_request_id' => $authRequest->id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'proposal', $skemaId, $itemId, $tab, $requestable->jenis_penelitian),
                    key: "authorization.approved.{$authRequest->id}",
                );
            } else {
                \App\Services\NotificationService::create(
                    userId: $authRequest->requested_by,
                    type: 'authorization.rejected',
                    title: 'Otorisasi ditolak',
                    message: "Permintaan otorisasi Anda telah ditolak oleh Ketua LPPM.",
                    data: ['authorization_request_id' => $authRequest->id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'proposal', $skemaId, $itemId, $tab, $requestable->jenis_penelitian),
                    key: "authorization.rejected.{$authRequest->id}",
                );
            }

            // For return_diseminasi rejection: update Laporan status so both parties see clear state
            if ($validated['action'] === 'reject' && $authRequest->action === 'return_diseminasi') {
                $rawType = $authRequest->requestable_type;
                $modelClass = str_starts_with($rawType, 'App\\Models\\')
                    ? $rawType
                    : 'App\\Models\\' . $rawType;
                $resource = $modelClass::find($authRequest->requestable_id);

                if ($resource instanceof Laporan) {
                    $resource->update([
                        'status' => 'Menunggu review dari Ketua LPPM',
                        'catatan' => $validated['review_note'] ?? $authRequest->reason ?? '-',
                        'ketua_diseminasi_approved' => false,
                        'staff_diseminasi_approved' => false,
                    ]);
                }
            }

            // For return_seleksi rejection: update Proposal status so Ketua can review directly
            if ($validated['action'] === 'reject' && $authRequest->action === 'return_seleksi') {
                $rawType = $authRequest->requestable_type;
                $modelClass = str_starts_with($rawType, 'App\\Models\\')
                    ? $rawType
                    : 'App\\Models\\' . $rawType;
                $resource = $modelClass::find($authRequest->requestable_id);

                if ($resource instanceof Proposal) {
                    $resource->update([
                        'status' => 'Menunggu review dari Ketua LPPM',
                        'catatan' => $validated['review_note'] ?? $authRequest->reason ?? '-',
                        'ketua_seleksi_approved' => false,
                        'staff_seleksi_approved' => false,
                    ]);
                }
            }

            // For return_laporan_for_revision rejection: no state change (laporan stays in original stage)
            // No additional handling needed

            return ApiResponse::success($authRequest);

        } catch (\Exception $e) {
            \Log::error('Authorize destructive action failed: ' . $e->getMessage());
            return ApiResponse::failed($e->getMessage());
        }
    }

    /**
     * Execute the approved destructive action.
     */
    private function executeAction(AuthorizationRequest $authRequest): void
    {
        $rawType = $authRequest->requestable_type;
        $modelClass = str_starts_with($rawType, 'App\\Models\\')
            ? $rawType
            : 'App\\Models\\' . $rawType;
        $resource = $modelClass::find($authRequest->requestable_id);

        if (!$resource) {
            return;
        }

        $skemaId = $resource->kegiatan->skema_id ?? $resource->skema_id ?? null;
        $itemId = $resource->proposal_id ?? $resource->laporan_id ?? null;
        $tab = $resource->kode_kegiatan ?? ($resource instanceof Laporan ? \App\Helpers\NotificationUrl::laporanTab($resource->kodeKegiatan()) : $resource->kegiatan?->kode_kegiatan);

        switch ($authRequest->action) {
            case 'delete':
                if ($resource instanceof Skema) {
                    $resource->kegiatan()->delete();
                    $resource->delete();
                } elseif ($resource instanceof KegiatanPengajuan) {
                    $resource->delete();
                } elseif ($resource instanceof Proposal) {
                    $resource->update(['status' => 'Ditolak']);
                }
                break;

            case 'return':
                if ($resource instanceof Laporan) {
                    $previousKode = \App\Helpers\KegiatanStage::previousKode(
                        $resource->kodeKegiatan() ?? '',
                        $resource
                    );

                    if ($previousKode) {
                        \App\Helpers\KegiatanStage::move($resource, $previousKode);
                    }

                    $resource->update([
                        'status'  => 'Revisi',
                        'catatan' => $authRequest->review_note ?? '-',
                    ]);
                }
                break;

            case 'reject':
                // Legacy reject: cleans up docs and soft-deletes
                if ($resource instanceof Proposal) {
                    $documentService = app(\App\Services\DocumentService::class);

                    foreach ($resource->dokumen()->with('versions')->get() as $dokumen) {
                        foreach ($dokumen->versions as $version) {
                            if ($version->local_file_url) {
                                $documentService->delete($version->local_file_url);
                            }
                        }
                        $dokumen->versions()->delete();
                        $dokumen->delete();
                    }

                    \App\Models\PenugasanReviewer::where('proposal_id', $resource->proposal_id)->delete();

                    $resource->update([
                        'status' => 'Ditolak',
                        'catatan' => $authRequest->review_note ?? '-',
                    ]);

                    $resource->delete();
                }
                break;

            case 'return_diseminasi':
                if ($resource instanceof Laporan) {
                    $previousKode = \App\Helpers\KegiatanStage::previousKode(
                        $resource->kodeKegiatan() ?? '',
                        $resource
                    );

                    if ($previousKode) {
                        \App\Helpers\KegiatanStage::move($resource, $previousKode);
                    }

                    $resource->update([
                        'status' => 'Menunggu review Staff LPPM',
                        'catatan' => $authRequest->review_note ?? '-',
                        'ketua_diseminasi_approved' => false,
                        'staff_diseminasi_approved' => false,
                    ]);
                }
                break;

            case 'return_seleksi':
                // FIX: Do NOT delete. Set status to Revisi.
                if ($resource instanceof Proposal) {
                    $resource->update([
                        'ketua_seleksi_approved' => false,
                        'staff_seleksi_approved' => false,
                        'status' => 'Revisi',
                        'catatan' => $authRequest->review_note ?? '-',
                    ]);
                }
                break;

            case 'reject_proposal':
                if ($resource instanceof Proposal) {
                    $documentService = app(\App\Services\DocumentService::class);

                    foreach ($resource->dokumen()->with('versions')->get() as $dokumen) {
                        foreach ($dokumen->versions as $version) {
                            if ($version->local_file_url) {
                                $documentService->delete($version->local_file_url);
                            }
                        }
                        $dokumen->versions()->delete();
                        $dokumen->delete();
                    }

                    \App\Models\PenugasanReviewer::where('proposal_id', $resource->proposal_id)->delete();

                    $resource->update([
                        'status' => 'Ditolak',
                        'catatan' => $authRequest->review_note ?? '-',
                    ]);

                    $resource->delete();

                    if ($resource->user_id) {
                        \App\Services\NotificationService::create(
                            userId: $resource->user_id,
                            type: 'proposal.rejected',
                            title: 'Proposal ditolak',
                            message: 'Proposal Anda telah ditolak oleh Ketua LPPM.',
                            data: ['proposal_id' => $resource->proposal_id],
                            actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'proposal', $skemaId, $itemId, $tab, $resource->jenis_penelitian),
                            key: "proposal.rejected.{$resource->proposal_id}",
                        );
                    }
                }
                break;

            case 'return_proposal_for_revision':
                if ($resource instanceof Proposal) {
                    $resource->update([
                        'status' => 'Revisi',
                        'catatan' => $authRequest->review_note ?? '-',
                    ]);

                    if ($resource->user_id) {
                        \App\Services\NotificationService::create(
                            userId: $resource->user_id,
                            type: 'proposal.returned_for_revision',
                            title: 'Proposal dikembalikan untuk revisi',
                            message: 'Proposal Anda dikembalikan untuk revisi oleh Ketua LPPM.',
                            data: ['proposal_id' => $resource->proposal_id],
                            actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'proposal', $skemaId, $itemId, $tab, $resource->jenis_penelitian),
                            key: "proposal.returned_for_revision.{$resource->proposal_id}",
                        );
                    }
                }
                break;

            case 'return_laporan_for_revision':
                if ($resource instanceof Laporan) {
                    $sourceStage = $authRequest->source_stage;
                    $targetStage = $authRequest->target_stage;

                    if ($targetStage && $targetStage !== $sourceStage) {
                        \App\Helpers\KegiatanStage::move($resource, $targetStage);
                    }

                    $resource->update([
                        'status' => 'Revisi',
                        'catatan' => $authRequest->review_note ?? '-',
                    ]);

                    // If source was Diseminasi, reset diseminasi approval flags
                    if ($sourceStage && str_starts_with($sourceStage, 'DISEMINASI')) {
                        $resource->update([
                            'ketua_diseminasi_approved' => false,
                            'staff_diseminasi_approved' => false,
                        ]);
                    }

                    if ($resource->proposal?->user_id) {
                        \App\Services\NotificationService::create(
                            userId: $resource->proposal->user_id,
                            type: 'laporan.returned_for_revision',
                            title: 'Laporan dikembalikan untuk revisi',
                            message: 'Laporan Anda dikembalikan untuk revisi oleh Ketua LPPM.',
                            data: ['laporan_id' => $resource->laporan_id],
                            actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'laporan', $skemaId, $itemId, $tab, $resource->proposal?->jenis_penelitian),
                            key: "laporan.returned_for_revision.{$resource->laporan_id}",
                        );
                    }
                }
                break;
        }
    }

    /**
     * List authorization requests.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $query = AuthorizationRequest::with(['requestable', 'requester', 'reviewer']);

            if ($user->role === 'Staff LPPM') {
                $query->where('requested_by', $user->id);
            } elseif ($user->role === 'Ketua LPPM') {
                $query->where('status', 'Menunggu Persetujuan');
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('requestable_type')) {
                $type = $request->requestable_type;
                $fullType = str_starts_with($type, 'App\\Models\\')
                    ? $type
                    : 'App\\Models\\' . $type;
                $query->where('requestable_type', $fullType);
            }

            $data = $query->orderByDesc('created_at')
                ->paginate($request->get('per_page', 10));

            return ApiResponse::success($data);

        } catch (\Exception $e) {
            \Log::error('List authorization requests failed: ' . $e->getMessage());
            return ApiResponse::failed($e->getMessage());
        }
    }
}
