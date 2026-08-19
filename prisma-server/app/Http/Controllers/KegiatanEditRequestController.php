<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\KegiatanEditRequest;
use App\Models\KegiatanPengajuan;
use App\Helpers\ApiResponse;

class KegiatanEditRequestController extends Controller
{
    /**
     * Staff submits a request to change Kegiatan dates.
     */
    public function store(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || !in_array($user->role, ['Staff LPPM', 'Superadmin'])) {
                return ApiResponse::failed(
                    'Hanya Staff LPPM yang dapat mengajukan perubahan kegiatan.'
                );
            }

            $validated = $request->validate([
                'kegiatan_id'          => ['required', 'exists:kegiatan_pengajuan,kegiatan_id'],
                'proposed_tgl_mulai'   => ['required', 'date'],
                'proposed_tgl_selesai' => ['required', 'date', 'after_or_equal:proposed_tgl_mulai'],
                'reason'               => ['required', 'string', 'min:10'],
            ]);

            $kegiatan = KegiatanPengajuan::findOrFail($validated['kegiatan_id']);

            // Check for pending request on this kegiatan
            $pending = KegiatanEditRequest::where('kegiatan_id', $validated['kegiatan_id'])
                ->where('status', 'Menunggu Otorisasi')
                ->exists();

            if ($pending) {
                return ApiResponse::failed(
                    'Masih ada permintaan perubahan yang belum diproses untuk kegiatan ini.'
                );
            }

            $editRequest = KegiatanEditRequest::create([
                'kegiatan_id'          => $validated['kegiatan_id'],
                'requested_by'         => $user->id,
                'current_tgl_mulai'    => $kegiatan->tgl_mulai,
                'current_tgl_selesai'  => $kegiatan->tgl_selesai,
                'proposed_tgl_mulai'   => $validated['proposed_tgl_mulai'],
                'proposed_tgl_selesai' => $validated['proposed_tgl_selesai'],
                'reason'               => $validated['reason'],
                'status'               => 'Menunggu Otorisasi',
            ]);

            \App\Services\NotificationService::createForRole(
                role: 'Ketua LPPM',
                type: 'kegiatan_edit.created',
                title: 'Edit kegiatan diminta',
                message: "Staff LPPM meminta perubahan tanggal kegiatan.",
                data: ['kegiatan_edit_request_id' => $editRequest->id],
                actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'proposal', $kegiatan->skema_id),
                key: "kegiatan_edit.created.{$editRequest->id}",
            );

            return ApiResponse::success($editRequest, 'Permintaan perubahan berhasil diajukan.', 201);

        } catch (\Exception $e) {
            \Log::error('Create kegiatan edit request failed: ' . $e->getMessage());
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
                    'Hanya Ketua LPPM yang dapat menyetujui perubahan kegiatan.'
                );
            }

            $validated = $request->validate([
                'edit_request_id' => ['required', 'exists:kegiatan_edit_requests,id'],
                'action'          => ['required', 'in:approve,reject'],
                'review_note'     => ['nullable', 'string'],
            ]);

            $editRequest = KegiatanEditRequest::with('kegiatan')->findOrFail($validated['edit_request_id']);

            if ($editRequest->status !== 'Menunggu Otorisasi') {
                return ApiResponse::failed(
                    'Permintaan ini sudah diproses sebelumnya.'
                );
            }

            $editRequest->update([
                'status'      => $validated['action'] === 'approve' ? 'Disetujui' : 'Ditolak',
                'reviewed_by' => $user->id,
                'reviewed_at' => now(),
                'review_note' => $validated['review_note'],
            ]);

            if ($validated['action'] === 'approve') {
                \App\Services\NotificationService::create(
                    userId: $editRequest->requested_by,
                    type: 'kegiatan_edit.approved',
                    title: 'Edit kegiatan disetujui',
                    message: "Permintaan edit kegiatan telah disetujui oleh Ketua LPPM.",
                    data: ['kegiatan_edit_request_id' => $editRequest->id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'proposal', $editRequest->kegiatan->skema_id),
                    key: "kegiatan_edit.approved.{$editRequest->id}",
                );
            } else {
                \App\Services\NotificationService::create(
                    userId: $editRequest->requested_by,
                    type: 'kegiatan_edit.rejected',
                    title: 'Edit kegiatan ditolak',
                    message: "Permintaan edit kegiatan telah ditolak oleh Ketua LPPM.",
                    data: ['kegiatan_edit_request_id' => $editRequest->id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'proposal', $editRequest->kegiatan->skema_id),
                    key: "kegiatan_edit.rejected.{$editRequest->id}",
                );
            }

            return ApiResponse::success($editRequest);

        } catch (\Exception $e) {
            \Log::error('Authorize kegiatan edit request failed: ' . $e->getMessage());
            return ApiResponse::failed($e->getMessage());
        }
    }

    /**
     * Staff executes an approved change.
     */
    public function execute(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user || !in_array($user->role, ['Staff LPPM', 'Superadmin'])) {
                return ApiResponse::failed(
                    'Hanya Staff LPPM yang dapat menjalankan perubahan kegiatan.'
                );
            }

            $validated = $request->validate([
                'edit_request_id' => ['required', 'exists:kegiatan_edit_requests,id'],
            ]);

            $editRequest = KegiatanEditRequest::findOrFail($validated['edit_request_id']);

            if ($editRequest->status !== 'Disetujui') {
                return ApiResponse::failed(
                    'Permintaan ini belum disetujui atau sudah ditolak.'
                );
            }

            $kegiatan = KegiatanPengajuan::find($editRequest->kegiatan_id);

            if (!$kegiatan) {
                return ApiResponse::failed('Kegiatan tidak ditemukan.');
            }

            // Execute the date change
            $kegiatan->update([
                'tgl_mulai'  => $editRequest->proposed_tgl_mulai,
                'tgl_selesai' => $editRequest->proposed_tgl_selesai,
            ]);

            // Record execution
            $editRequest->update([
                'executed_by' => $user->id,
                'executed_at' => now(),
            ]);

            return ApiResponse::success($editRequest, 'Perubahan kegiatan berhasil dijalankan.');

        } catch (\Exception $e) {
            \Log::error('Execute kegiatan edit request failed: ' . $e->getMessage());
            return ApiResponse::failed($e->getMessage());
        }
    }

    /**
     * List edit requests. Staff sees own, Ketua sees all pending.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $query = KegiatanEditRequest::with(['kegiatan', 'requester', 'reviewer', 'executor']);

            if ($user->role === 'Staff LPPM') {
                $query->where('requested_by', $user->id);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            $data = $query->orderByDesc('created_at')
                ->paginate($request->get('per_page', 10));

            return ApiResponse::success($data);

        } catch (\Exception $e) {
            \Log::error('List kegiatan edit requests failed: ' . $e->getMessage());
            return ApiResponse::failed($e->getMessage());
        }
    }
}
