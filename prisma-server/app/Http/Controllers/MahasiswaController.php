<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Mahasiswa;

use App\Services\AvatarService;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

use App\Http\Resources\MahasiswaResource;
use App\Helpers\ApiResponse;

class MahasiswaController extends Controller
{
    public function fetch()
    {
        return MahasiswaResource::collection(
            Mahasiswa::with(['prodi'])->orderBy('nim')->get()
        );
    }

    public function create(Request $request, AvatarService $avatarService)
    {
        $validated = $request->validate([
            'nama'     => ['required', 'string', 'max:255'],
            'nim'      => ['required', 'string', 'max:50', 'unique:mahasiswa,nim'],
            'email'    => ['required', 'email', 'max:255', 'unique:mahasiswa,email'],
            'no_hp'    => ['nullable', 'string', 'max:20'],
            'prodi_id' => ['nullable', 'integer'],
            'uploaded_file' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $mhswa = Mahasiswa::create([
            'nim'      => $validated['nim'],
            'nama'     => $validated['nama'],
            'email'    => $validated['email'],
            'no_hp'    => $request->no_hp,
            'prodi_id' => $request->prodi_id,
            'avatar'   => null,
        ]);

        $mhswa->update([
            'avatar' => $avatarService->ensureDefault(
                $mhswa->nama,
                $mhswa->mhswa_id,
                $request->hasFile('uploaded_file')
                    ? $request->file('uploaded_file')
                    : null
            ),
        ]);

        return ApiResponse::success();
    }

    public function update(Request $request, AvatarService $avatarService){
        $mhswaId = $request->mhswa_id;

        $validated = $request->validate([
            'nama'     => ['sometimes', 'string', 'max:255'],
            'nim'      => ['sometimes', 'string', 'max:50', 'unique:mahasiswa,nim,' . $mhswaId . ',mhswa_id'],
            'email'    => ['sometimes', 'email', 'max:255', 'unique:mahasiswa,email,' . $mhswaId . ',mhswa_id'],
            'no_hp'    => ['nullable', 'string', 'max:20'],
            'prodi_id' => ['nullable', 'integer'],
            'uploaded_file' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $mhswa = Mahasiswa::findOrFail($mhswaId);

        if ($request->hasFile('uploaded_file')) {
            $avatarUrl = $avatarService->replace(
                $mhswa->avatar,
                $request->file('uploaded_file')
            );
        } else {
            $avatarUrl = $avatarService->refreshDefaultOnRename(
                $mhswa->avatar,
                $request->nama,
                $mhswa->mhswa_id
            );
        }

        $mhswa->update([
            'nim'      => $request->nim,
            'nama'     => $request->nama,
            'email'    => $request->email,
            'no_hp'    => $request->no_hp,
            'prodi_id' => $request->prodi_id,
            'avatar'   => $avatarUrl
        ]);

        return ApiResponse::success();
    }

    public function delete(Request $request, AvatarService $avatarService){
        try {
            $mhswa = Mahasiswa::findOrFail($request->id);
            $avatarService->delete($mhswa->avatar);
            $mhswa->delete();

            return ApiResponse::success();
        } catch (\Exception $e) {
            \Log::error('Delete failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }
}
