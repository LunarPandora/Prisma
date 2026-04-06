<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

use App\Models\User;
use App\Models\Dosen;
use App\Models\Reviewer;

use App\Http\Resources\UserResource;
use App\Helpers\ApiResponse;

class UserController extends Controller
{
    public function index()
    {
        return UserResource::collection(
            User::with(['dosen' => function($q) {
                    $q->withTrashed()->select('dosen_id','user_id','prodi_id','nidn');
                }])
                ->orderBy('id')
                ->paginate(10, ['id', 'nama', 'email', 'role', 'status', 'gender', 'created_at'])
        );
    }

    public function create(Request $request)
    {
        try {
            $user = User::create([
                'nama'     => $request->nama,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => $request->role,
                'status'   => $request->status,
                'gender'   => $request->gender,
            ]);

            if ($user->role === 'Dosen') {
                Dosen::create([
                    'user_id'  => $user->id,
                    'nidn'     => $request->nidn,
                    'prodi_id' => $request->prodi_id,
                ]);
            }
            elseif ($user->role === 'Reviewer') {
                Reviewer::create([
                    'user_id'   => $user->id,
                    'nidn'      => $request->nidn
                ]);
            }

            return ApiResponse::success();
        } catch (\Exception $e) {
            \Log::error('Create failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }

    public function update(Request $request){
        try {
            $user = User::findOrFail($request->id);

            // Update user
            $user->update([
                'nama'   => $request->nama,
                'email'  => $request->email,
                'role'   => $request->role,
                'status' => $request->status,
                'gender' => $request->gender,
            ]);

            // Handle Dosen role
            if ($user->role === 'Dosen') {
                $dosen = Dosen::withTrashed()->firstOrNew(['user_id' => $user->id]);

                // Restore if soft deleted
                if ($dosen->exists && $dosen->trashed() && $request->status == "Aktif") {
                    $dosen->restore();
                }

                // Update Dosen fields
                $dosen->nidn = $request->nidn;
                $dosen->prodi_id = $request->prodi_id;

                $dosen->save(); // create or update
            }
            elseif ($user->role === 'Reviewer'){
                $reviewer = Dosen::withTrashed()->firstOrNew(['user_id' => $user->id]);

                // Restore if soft deleted
                if ($reviewer->exists && $reviewer->trashed() && $request->status == "Aktif") {
                    $reviewer->restore();
                }

                // Update Reviewer fields
                $reviewer->nidn = $request->nidn;

                $reviewer->save();
            }

            return ApiResponse::success();
        } catch (\Exception $e) {
            \Log::error('Update failed: '.$e->getMessage());

            return ApiResponse::failed();
        }
    }

    public function delete(Request $request){
        try {
            $user = User::findOrFail($request->id);
            $user->status = 'Nonaktif'; // disable the user

            if ($user->role === 'Dosen') {
                // Get the Dosen, including soft-deleted
                $dosen = Dosen::withTrashed()->firstOrNew(['user_id' => $user->id]);

                // Only delete if not already soft-deleted
                if (!$dosen->trashed() && $dosen->exists) {
                    $dosen->delete();
                }
            }
            elseif ($user->role === 'Reviewer') {
                // Get the Reviewer, including soft-deleted
                $reviewer = Reviewer::withTrashed()->firstOrNew(['user_id' => $user->id]);

                // Only delete if not already soft-deleted
                if (!$reviewer->trashed() && $reviewer->exists) {
                    $reviewer->delete();
                }
            }

            $user->save(); // save status change
            $user->delete();

            return ApiResponse::success();
        } catch (\Exception $e) {
            \Log::error('Delete failed: ' . $e->getMessage());
            return ApiResponse::failed();
        }
    }
}
