<?php

namespace App\Http\Controllers\Proposal;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use App\Models\Proposal;
use App\Models\AuthorizationRequest;

use App\Helpers\ApiResponse;

class ProposalSeleksiController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Ketua LPPM First Verification
    |--------------------------------------------------------------------------
    | Accept: sets ketua_seleksi_approved = true, status = "Menunggu review Staff LPPM"
    | Reject: calls existing tolakProposal logic
    |--------------------------------------------------------------------------
    */

    public function ketuaDecide(Request $request)
    {
        DB::beginTransaction();

        try {

            $user = $request->user();

            if (!$user || $user->role !== 'Ketua LPPM') {
                return ApiResponse::failed(
                    'Hanya Ketua LPPM yang dapat melakukan verifikasi pertama.'
                );
            }

            $validated = $request->validate([
                'proposal_id' => ['required', 'integer', 'exists:proposal,proposal_id'],
                'decision'    => ['required', 'in:accept,reject'],
                'catatan'     => ['nullable', 'string'],
            ]);

            $proposal = Proposal::findOrFail($validated['proposal_id']);

            if ($proposal->status !== 'Menunggu review dari Ketua LPPM') {
                return ApiResponse::failed(
                    'Proposal belum siap untuk verifikasi Ketua. Status: '
                    . $proposal->status
                );
            }

            if ($validated['decision'] === 'accept') {

                $proposal->update([
                    'ketua_seleksi_approved' => true,
                    'status' => 'Menunggu review Staff LPPM',
                ]);

                \App\Services\NotificationService::createForRole(
                    role: 'Staff LPPM',
                    type: 'proposal.seleksi.ketua_approved',
                    title: 'Proposal disetujui oleh Ketua',
                    message: "Proposal \"{$proposal->judul}\" telah disetujui oleh Ketua LPPM dan menunggu verifikasi Staff.",
                    data: ['proposal_id' => $proposal->proposal_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Staff LPPM', 'proposal', $proposal->kegiatan->skema_id, $proposal->proposal_id, $proposal->kegiatan->kode_kegiatan, $proposal->jenis_penelitian),
                    key: "proposal.seleksi.ketua_approved.{$proposal->proposal_id}",
                );

                \App\Services\NotificationService::create(
                    userId: $proposal->user_id,
                    type: 'proposal.seleksi.ketua_approved',
                    title: 'Proposal disetujui oleh Ketua LPPM',
                    message: "Proposal \"{$proposal->judul}\" telah disetujui oleh Ketua LPPM.",
                    data: ['proposal_id' => $proposal->proposal_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'proposal', $proposal->kegiatan->skema_id, $proposal->proposal_id, $proposal->kegiatan->kode_kegiatan, $proposal->jenis_penelitian),
                    key: "proposal.seleksi.ketua_approved.dosen.{$proposal->proposal_id}",
                );

                DB::commit();

                return ApiResponse::success();

            } else {

                $proposal->update([
                    'status' => 'Ditolak',
                    'catatan' => trim($validated['catatan'] ?? '') !== ''
                        ? $validated['catatan']
                        : '-',
                    'ketua_seleksi_approved' => false,
                    'staff_seleksi_approved' => false,
                ]);

                \App\Services\NotificationService::create(
                    userId: $proposal->user_id,
                    type: 'proposal.seleksi.ketua_rejected',
                    title: 'Proposal ditolak oleh Ketua LPPM',
                    message: "Proposal \"{$proposal->judul}\" telah ditolak oleh Ketua LPPM.",
                    data: ['proposal_id' => $proposal->proposal_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'proposal', $proposal->kegiatan->skema_id, $proposal->proposal_id, $proposal->kegiatan->kode_kegiatan, $proposal->jenis_penelitian),
                    key: "proposal.seleksi.ketua_rejected.{$proposal->proposal_id}",
                );

                $proposal->delete();

                DB::commit();

                return ApiResponse::success();
            }

        } catch (\Exception $e) {

            DB::rollBack();

            \Log::error(
                'Ketua decide seleksi failed: ' . $e->getMessage()
            );

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Staff LPPM Second Verification
    |--------------------------------------------------------------------------
    | Accept: sets staff_seleksi_approved = true, status = "Menunggu penugasan reviewer"
    | Reject: creates AuthorizationRequest with action 'return_seleksi'
    |          status = "Menunggu review dari Ketua LPPM" (Ketua re-evaluates)
    |--------------------------------------------------------------------------
    */

    public function staffDecide(Request $request)
    {
        try {

            $user = $request->user();

            if (!$user || !in_array($user->role, ['Staff LPPM', 'Superadmin'])) {
                return ApiResponse::failed(
                    'Hanya Staff LPPM yang dapat melakukan verifikasi kedua.'
                );
            }

            $validated = $request->validate([
                'proposal_id' => ['required', 'integer', 'exists:proposal,proposal_id'],
                'decision'    => ['required', 'in:accept,reject'],
                'catatan'     => ['nullable', 'string'],
            ]);

            $proposal = Proposal::with([
                'kegiatan' => fn($q) => $q->withTrashed(),
            ])->find($validated['proposal_id']);

            if (!$proposal) {
                return ApiResponse::failed('Proposal tidak ditemukan.');
            }

            if ($proposal->status !== 'Menunggu review Staff LPPM') {
                return ApiResponse::failed(
                    'Proposal belum siap untuk verifikasi Staff. Status: '
                    . $proposal->status
                );
            }

            if (!$proposal->ketua_seleksi_approved) {
                return ApiResponse::failed(
                    'Ketua LPPM belum menyetujui proposal ini.'
                );
            }

            if ($validated['decision'] === 'accept') {

                $proposal->update([
                    'staff_seleksi_approved' => true,
                    'status' => 'Menunggu penugasan reviewer',
                ]);

                \App\Services\NotificationService::createForRole(
                    role: 'Ketua LPPM',
                    type: 'proposal.seleksi.staff_approved',
                    title: 'Proposal siap untuk penugasan reviewer',
                    message: "Proposal \"{$proposal->judul}\" telah disetujui oleh Staff LPPM.",
                    data: ['proposal_id' => $proposal->proposal_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'proposal', $proposal->kegiatan->skema_id, $proposal->proposal_id, $proposal->kegiatan->kode_kegiatan, $proposal->jenis_penelitian),
                    key: "proposal.seleksi.staff_approved.{$proposal->proposal_id}",
                );

                \App\Services\NotificationService::create(
                    userId: $proposal->user_id,
                    type: 'proposal.seleksi.staff_approved',
                    title: 'Proposal disetujui oleh Staff LPPM',
                    message: "Proposal \"{$proposal->judul}\" telah disetujui oleh Staff LPPM. Reviewer akan segera ditugaskan.",
                    data: ['proposal_id' => $proposal->proposal_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'proposal', $proposal->kegiatan->skema_id, $proposal->proposal_id, $proposal->kegiatan->kode_kegiatan, $proposal->jenis_penelitian),
                    key: "proposal.seleksi.staff_approved.dosen.{$proposal->proposal_id}",
                );

            } else {

                $pending = AuthorizationRequest::where('requestable_type', 'App\\Models\\Proposal')
                    ->where('requestable_id', $proposal->proposal_id)
                    ->whereIn('action', ['return_seleksi', 'return_proposal_for_revision', 'reject_proposal'])
                    ->where('status', 'Menunggu Persetujuan')
                    ->exists();

                if ($pending) {
                    return ApiResponse::failed(
                        'Masih ada permintaan yang menunggu persetujuan Ketua LPPM.'
                    );
                }

                // Determine action type from request (default: return for revision)
                $actionType = $request->input('type', 'return');
                $authAction = $actionType === 'reject' ? 'reject_proposal' : 'return_proposal_for_revision';

                AuthorizationRequest::create([
                    'requestable_type' => 'App\\Models\\Proposal',
                    'requestable_id'   => $proposal->proposal_id,
                    'requested_by'     => $user->id,
                    'action'           => $authAction,
                    'source_stage'     => $proposal->kegiatan?->kode_kegiatan,
                    'reason'           => $validated['catatan'] ?? ($actionType === 'reject'
                        ? 'Proposal ditolak oleh Staff LPPM'
                        : 'Proposal dikembalikan untuk perbaikan oleh Staff LPPM'),
                    'current_data'     => $proposal->toArray(),
                    'status'           => 'Menunggu Persetujuan',
                ]);

                $proposal->update([
                    'status' => 'Menunggu review dari Ketua LPPM',
                ]);

                $titleSuffix = $actionType === 'reject' ? 'Penolakan' : 'Pengembalian';
                $messageSuffix = $actionType === 'reject' ? 'penolakan' : 'pengembalian';

                \App\Services\NotificationService::createForRole(
                    role: 'Ketua LPPM',
                    type: 'proposal.seleksi.rejection_requested',
                    title: "Persetujuan {$messageSuffix} proposal diperlukan",
                    message: "Staff LPPM meminta {$messageSuffix} proposal \"{$proposal->judul}\".",
                    data: ['proposal_id' => $proposal->proposal_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'proposal', $proposal->kegiatan->skema_id, $proposal->proposal_id, $proposal->kegiatan->kode_kegiatan, $proposal->jenis_penelitian),
                    key: "proposal.seleksi.rejection_requested.{$proposal->proposal_id}",
                );
            }

            return ApiResponse::success();

        } catch (\Exception $e) {

            \Log::error('Staff decide seleksi failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }
}
