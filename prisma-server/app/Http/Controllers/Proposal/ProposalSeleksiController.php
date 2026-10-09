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
    | Staff LPPM First Verification (Screening)
    |--------------------------------------------------------------------------
    | Accept: sets staff_seleksi_approved = true, status = "Menunggu review dari Ketua LPPM"
    | Reject: status = "Revisi" (returned to Dosen for revision)
    |--------------------------------------------------------------------------
    */

    public function staffDecide(Request $request)
    {
        try {

            $user = $request->user();

            if (!$user || !in_array($user->role, ['Staff LPPM', 'Superadmin'])) {
                return ApiResponse::failed(
                    'Hanya Staff LPPM yang dapat melakukan pengecekan awal.'
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
                    'Proposal belum siap untuk pengecekan Staff. Status: '
                    . $proposal->status
                );
            }

            if ($validated['decision'] === 'accept') {

                $proposal->update([
                    'staff_seleksi_approved' => true,
                    'status' => 'Menunggu review dari Ketua LPPM',
                ]);

                \App\Services\NotificationService::createForRole(
                    role: 'Ketua LPPM',
                    type: 'proposal.seleksi.staff_approved',
                    title: 'Proposal menunggu review Ketua LPPM',
                    message: "Proposal \"{$proposal->judul}\" telah dicek oleh Staff LPPM dan menunggu review Ketua LPPM.",
                    data: ['proposal_id' => $proposal->proposal_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Ketua LPPM', 'proposal', $proposal->kegiatan->skema_id, $proposal->proposal_id, $proposal->kegiatan->kode_kegiatan, $proposal->jenis_penelitian),
                    key: "proposal.seleksi.staff_approved.{$proposal->proposal_id}",
                );

                \App\Services\NotificationService::create(
                    userId: $proposal->user_id,
                    type: 'proposal.seleksi.staff_approved',
                    title: 'Proposal telah dicek oleh Staff LPPM',
                    message: "Proposal \"{$proposal->judul}\" telah dicek oleh Staff LPPM dan menunggu review Ketua LPPM.",
                    data: ['proposal_id' => $proposal->proposal_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'proposal', $proposal->kegiatan->skema_id, $proposal->proposal_id, $proposal->kegiatan->kode_kegiatan, $proposal->jenis_penelitian),
                    key: "proposal.seleksi.staff_approved.dosen.{$proposal->proposal_id}",
                );

            } else {

                $proposal->update([
                    'status' => 'Revisi',
                    'catatan' => $validated['catatan'] ?? 'Proposal dikembalikan untuk perbaikan oleh Staff LPPM',
                    'staff_seleksi_approved' => false,
                ]);

                \App\Services\NotificationService::create(
                    userId: $proposal->user_id,
                    type: 'proposal.seleksi.staff_returned',
                    title: 'Proposal dikembalikan untuk perbaikan',
                    message: "Proposal \"{$proposal->judul}\" dikembalikan oleh Staff LPPM untuk perbaikan.",
                    data: ['proposal_id' => $proposal->proposal_id],
                    actionUrl: \App\Helpers\NotificationUrl::forRole('Dosen', 'proposal', $proposal->kegiatan->skema_id, $proposal->proposal_id, $proposal->kegiatan->kode_kegiatan, $proposal->jenis_penelitian),
                    key: "proposal.seleksi.staff_returned.{$proposal->proposal_id}",
                );
            }

            return ApiResponse::success();

        } catch (\Exception $e) {

            \Log::error('Staff decide seleksi failed: ' . $e->getMessage());

            return ApiResponse::failed();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Ketua LPPM Second Verification (Review/Decision)
    |--------------------------------------------------------------------------
    | Accept: sets ketua_seleksi_approved = true, status = "Menunggu penugasan reviewer"
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
                    'Hanya Ketua LPPM yang dapat melakukan review dan keputusan.'
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
                    'Proposal belum siap untuk review Ketua. Status: '
                    . $proposal->status
                );
            }

            if (!$proposal->staff_seleksi_approved) {
                return ApiResponse::failed(
                    'Staff LPPM belum melakukan pengecekan awal pada proposal ini.'
                );
            }

            if ($validated['decision'] === 'accept') {

                $proposal->update([
                    'ketua_seleksi_approved' => true,
                    'status' => 'Menunggu penugasan reviewer',
                ]);

                \App\Services\NotificationService::createForRole(
                    role: 'Staff LPPM',
                    type: 'proposal.seleksi.ketua_approved',
                    title: 'Proposal disetujui oleh Ketua',
                    message: "Proposal \"{$proposal->judul}\" telah disetujui oleh Ketua LPPM dan siap untuk penugasan reviewer.",
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
}
