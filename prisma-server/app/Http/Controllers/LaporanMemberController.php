<?php

namespace App\Http\Controllers;

use App\Models\Laporan;
use App\Models\LaporanMember;
use App\Models\ProposalMember;
use Illuminate\Http\Request;
use App\Helpers\ApiResponse;

class LaporanMemberController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | List members for a Laporan
    |--------------------------------------------------------------------------
    */

    public function index(Request $request, $laporanId)
    {
        $laporan = $this->findOwnedLaporan($laporanId);

        if (!$laporan) {
            return ApiResponse::failed('Laporan tidak ditemukan.');
        }

        $members = $laporan->laporanMember()
            ->with([
                'user' => fn($q) => $q->withTrashed()->select('id', 'nama', 'nidn', 'email', 'avatar'),
                'mahasiswa' => fn($q) => $q->withTrashed()->select('mhswa_id', 'nama'),
                'kolaborator' => fn($q) => $q->select('kolab_id', 'nama', 'institusi'),
            ])
            ->orderBy('position')
            ->get();

        return ApiResponse::success($members);
    }

    /*
    |--------------------------------------------------------------------------
    | Add a member to a Laporan
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validated = $request->validate([
            'laporan_id' => ['required', 'exists:laporan,laporan_id'],
            'member_id'  => ['required', 'integer'],
            'role'       => ['required', 'in:Dosen,Mahasiswa,Kolaborator'],
            'ttjp'       => ['nullable', 'string'],
        ]);

        $laporan = $this->findOwnedLaporan($validated['laporan_id']);

        if (!$laporan) {
            return ApiResponse::failed('Laporan tidak ditemukan.');
        }

        // Check for duplicate
        $exists = LaporanMember::where('laporan_id', $validated['laporan_id'])
            ->where('member_id', $validated['member_id'])
            ->where('role', $validated['role'])
            ->exists();

        if ($exists) {
            return ApiResponse::failed('Anggota sudah terdaftar dalam laporan ini.');
        }

        // Get next position
        $maxPosition = LaporanMember::where('laporan_id', $validated['laporan_id'])
            ->max('position') ?? 0;

        $member = LaporanMember::create([
            'laporan_id' => $validated['laporan_id'],
            'member_id'  => $validated['member_id'],
            'role'       => $validated['role'],
            'position'   => $maxPosition + 1,
            'ttjp'       => $validated['ttjp'] ?? null,
        ]);

        return ApiResponse::success($member->fresh([
            'user', 'mahasiswa', 'kolaborator'
        ]));
    }

    /*
    |--------------------------------------------------------------------------
    | Update a member (position, ttjp)
    |--------------------------------------------------------------------------
    */

    public function update(Request $request, $id)
    {
        $member = LaporanMember::find($id);

        if (!$member) {
            return ApiResponse::failed('Anggota tidak ditemukan.');
        }

        // Verify ownership
        $laporan = $this->findOwnedLaporan($member->laporan_id);

        if (!$laporan) {
            return ApiResponse::failed('Laporan tidak ditemukan.');
        }

        $validated = $request->validate([
            'ttjp'       => ['nullable', 'string'],
            'position'   => ['nullable', 'integer', 'min:0'],
        ]);

        $member->update($validated);

        return ApiResponse::success($member->fresh([
            'user', 'mahasiswa', 'kolaborator'
        ]));
    }

    /*
    |--------------------------------------------------------------------------
    | Reorder members (bulk update positions)
    |--------------------------------------------------------------------------
    */

    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'laporan_id'  => ['required', 'exists:laporan,laporan_id'],
            'member_ids'  => ['required', 'array'],
            'member_ids.*' => ['exists:laporan_member,laporan_member_id'],
        ]);

        $laporan = $this->findOwnedLaporan($validated['laporan_id']);

        if (!$laporan) {
            return ApiResponse::failed('Laporan tidak ditemukan.');
        }

        foreach ($validated['member_ids'] as $index => $memberId) {
            LaporanMember::where('laporan_member_id', $memberId)
                ->update(['position' => $index + 1]);
        }

        $members = $laporan->laporanMember()
            ->with(['user', 'mahasiswa', 'kolaborator'])
            ->orderBy('position')
            ->get();

        return ApiResponse::success($members);
    }

    /*
    |--------------------------------------------------------------------------
    | Remove a member
    |--------------------------------------------------------------------------
    */

    public function destroy($id)
    {
        $member = LaporanMember::find($id);

        if (!$member) {
            return ApiResponse::failed('Anggota tidak ditemukan.');
        }

        $laporan = $this->findOwnedLaporan($member->laporan_id);

        if (!$laporan) {
            return ApiResponse::failed('Laporan tidak ditemukan.');
        }

        $member->delete();

        return ApiResponse::success(null, 'Anggota berhasil dihapus.');
    }

    /*
    |--------------------------------------------------------------------------
    | Seed members from Proposal (lazy initialization)
    |--------------------------------------------------------------------------
    */

    public function seedFromProposal(Request $request, $laporanId)
    {
        $laporan = $this->findOwnedLaporan($laporanId);

        if (!$laporan) {
            return ApiResponse::failed('Laporan tidak ditemukan.');
        }

        // Only seed if empty
        if ($laporan->laporanMember()->count() > 0) {
            return ApiResponse::success(
                $laporan->laporanMember()->with(['user', 'mahasiswa', 'kolaborator'])->orderBy('position')->get()
            );
        }

        // Get proposal members for matching semester
        $proposalMembers = ProposalMember::where('proposal_id', $laporan->proposal_id)
            ->where('semester', $laporan->semester)
            ->orderBy('prop_member_id')
            ->get();

        $seeded = [];

        foreach ($proposalMembers as $index => $pm) {
            $member = LaporanMember::create([
                'laporan_id' => $laporan->laporan_id,
                'member_id'  => $pm->member_id,
                'role'       => $pm->role,
                'position'   => $pm->position ?? ($index + 1),
                'ttjp'       => $pm->ttjp,
            ]);

            $seeded[] = $member->fresh(['user', 'mahasiswa', 'kolaborator']);
        }

        return ApiResponse::success($seeded);
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
