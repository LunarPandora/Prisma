<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

use App\Models\User;

use App\Http\Resources\UserResource;
use App\Helpers\ApiResponse;

use App\Services\AvatarService;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class UserController extends Controller
{
    public function index()
    {
        return UserResource::collection(
            User::orderBy('id')
                ->paginate(10, [
                    'id',
                    'nama',
                    'email',
                    'role',
                    'status',
                    'gender',
                    'avatar',
                    'nidn',
                    'nuptk',
                    'no_hp',
                    'prodi_id',
                    'created_at'
                ])
        );
    }

    public function fetch(){
        return UserResource::collection(
            User::orderBy('id')->get()
        );
    }

    public function create(Request $request, AvatarService $avatarService)
    {
        $validRoles = ['Superadmin', 'Staff LPPM', 'Ketua LPPM', 'Dosen', 'Reviewer'];
        $validStatuses = ['Aktif', 'Nonaktif'];

        $validated = $request->validate([
            'nama'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role'     => ['required', 'in:' . implode(',', $validRoles)],
            'status'   => ['required', 'in:' . implode(',', $validStatuses)],
            'nidn'     => ['nullable', 'string', 'max:50', 'unique:users,nidn'],
            'nuptk'    => ['nullable', 'string', 'max:50', 'unique:users,nuptk'],
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

        if (empty($request->nidn) && empty($request->nuptk)) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'nidn' => ['NIDN atau NUPTK wajib diisi salah satu.'],
                ],
            ], 422);
        }

        $user = User::create([
            'nama'     => $validated['nama'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role'     => $validated['role'],
            'status'   => $validated['status'],
            'gender'   => $request->gender,
            'nidn'     => $request->nidn,
            'nuptk'    => $request->nuptk,
            'no_hp'    => $request->no_hp,
            'prodi_id' => $request->prodi_id,
            'avatar'   => null,
        ]);

        $user->update([
            'avatar' => $avatarService->ensureDefault(
                $user->nama,
                $user->id,
                $request->hasFile('uploaded_file')
                    ? $request->file('uploaded_file')
                    : null
            ),
        ]);

        return ApiResponse::success();
    }

    public function update(Request $request, AvatarService $avatarService){
        $validRoles = ['Superadmin', 'Staff LPPM', 'Ketua LPPM', 'Dosen', 'Reviewer'];
        $validStatuses = ['Aktif', 'Nonaktif'];

        $userId = $request->id;

        $validated = $request->validate([
            'nama'  => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,' . $userId],
            'role'  => ['sometimes', 'in:' . implode(',', $validRoles)],
            'status' => ['sometimes', 'in:' . implode(',', $validStatuses)],
            'nidn'  => ['nullable', 'string', 'max:50', 'unique:users,nidn,' . $userId],
            'nuptk' => ['nullable', 'string', 'max:50', 'unique:users,nuptk,' . $userId],
            'no_hp' => ['nullable', 'string', 'max:20'],
            'prodi_id' => ['nullable', 'integer'],
            'uploaded_file' => [
                'sometimes',
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        if (empty($request->nidn) && empty($request->nuptk)) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'nidn' => ['NIDN atau NUPTK wajib diisi salah satu.'],
                ],
            ], 422);
        }

        $user = User::findOrFail($userId);

        if ($request->hasFile('uploaded_file')) {
            $avatarUrl = $avatarService->replace(
                $user->avatar,
                $request->file('uploaded_file')
            );
        } else {
            $avatarUrl = $avatarService->refreshDefaultOnRename(
                $user->avatar,
                $request->nama,
                $user->id
            );
        }

        $user->update([
            'nama'     => $request->nama,
            'email'    => $request->email,
            'role'     => $request->role,
            'status'   => $request->status,
            'gender'   => $request->gender,
            'nidn'     => $request->nidn,
            'nuptk'    => $request->nuptk,
            'no_hp'    => $request->no_hp,
            'prodi_id' => $request->prodi_id,
            'avatar'   => $avatarUrl
        ]);

        return ApiResponse::success();
    }

    public function delete(Request $request, AvatarService $avatarService){
        try {
            $user = User::findOrFail($request->id);

            $user->status = 'Nonaktif'; // disable the user
            $user->save(); // save status change

            $avatarService->delete($user->avatar);
            $user->delete();

            return ApiResponse::success();
        } catch (\Exception $e) {
            \Log::error('Delete failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }
}
