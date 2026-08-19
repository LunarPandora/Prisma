<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Kolaborator;

use App\Services\AvatarService;

use App\Http\Resources\KolaboratorResource;
use App\Helpers\ApiResponse;

class KolaboratorController extends Controller
{
    /**
     * Paginated listing for the admin table.
     */
    public function index(Request $request)
    {
        $query = Kolaborator::query();

        if ($request->filled('search')) {
            $term = $request->search;

            $query->where(function ($q) use ($term) {
                $q->where('nama', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")
                    ->orWhere('nidn', 'like', "%{$term}%")
                    ->orWhere('nuptk', 'like', "%{$term}%")
                    ->orWhere('institusi', 'like', "%{$term}%");
            });
        }

        if ($request->filled('sort_by') && $request->filled('sort_order')) {
            $query->orderBy($request->sort_by, $request->sort_order);
        } else {
            $query->orderBy('nama');
        }

        return KolaboratorResource::collection(
            $query->paginate($request->per_page ?? 10)
        );
    }

    public function fetch()
    {
        return KolaboratorResource::collection(
            Kolaborator::orderBy('nama')->get()
        );
    }

    public function create(Request $request, AvatarService $avatarService)
    {
        $validated = $request->validate([
            'nama'  => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:kolaborator,email'],
            'nidn'  => ['nullable', 'string', 'max:50', 'unique:kolaborator,nidn'],
            'nuptk' => ['nullable', 'string', 'max:50', 'unique:kolaborator,nuptk'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'prodi' => ['nullable', 'string', 'max:255'],
            'institusi' => ['nullable', 'string', 'max:255'],
            'uploaded_file' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $kolab = Kolaborator::create([
            'nama'       => $validated['nama'],
            'email'      => $validated['email'],
            'no_hp'      => $request->no_hp,
            'nidn'       => $request->nidn,
            'nuptk'      => $request->nuptk,
            'prodi'      => $request->prodi,
            'institusi'  => $request->institusi,
            'avatar'     => null,
        ]);

        $kolab->update([
            'avatar' => $avatarService->ensureDefault(
                $kolab->nama,
                $kolab->kolab_id,
                $request->hasFile('uploaded_file')
                    ? $request->file('uploaded_file')
                    : null
            ),
        ]);

        return ApiResponse::success($kolab->fresh());
    }

    public function update(Request $request, AvatarService $avatarService)
    {
        $kolabId = $request->kolab_id;

        $validated = $request->validate([
            'nama'  => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:kolaborator,email,' . $kolabId . ',kolab_id'],
            'nidn'  => ['nullable', 'string', 'max:50', 'unique:kolaborator,nidn,' . $kolabId . ',kolab_id'],
            'nuptk' => ['nullable', 'string', 'max:50', 'unique:kolaborator,nuptk,' . $kolabId . ',kolab_id'],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'prodi' => ['nullable', 'string', 'max:255'],
            'institusi' => ['nullable', 'string', 'max:255'],
            'uploaded_file' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $kolab = Kolaborator::findOrFail($kolabId);

        if ($request->hasFile('uploaded_file')) {
            $avatarUrl = $avatarService->replace(
                $kolab->avatar,
                $request->file('uploaded_file')
            );
        } else {
            $avatarUrl = $avatarService->refreshDefaultOnRename(
                $kolab->avatar,
                $request->nama,
                $kolab->kolab_id
            );
        }

        $kolab->update([
            'nama'       => $request->nama,
            'email'      => $request->email,
            'no_hp'      => $request->no_hp,
            'nidn'       => $request->nidn,
            'nuptk'      => $request->nuptk,
            'prodi'      => $request->prodi,
            'institusi'  => $request->institusi,
            'avatar'     => $avatarUrl
        ]);

        return ApiResponse::success();
    }

    public function delete(Request $request, AvatarService $avatarService)
    {
        $kolab = Kolaborator::findOrFail($request->id);

        $avatarService->delete($kolab->avatar);

        $kolab->delete();

        return ApiResponse::success();
    }
}