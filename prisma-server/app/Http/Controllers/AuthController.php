<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Throwable;

use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request){
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ]);

            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json([
                    'message' => 'Invalid credentials'
                ], 401);
            }

            $request->session()->regenerate();
            $user = Auth::user();

            return response()->json([
                "id" => $user->id,
                "nama" => $user->nama,
                "role" => $user->role,
                "avatar" => $user->avatar_url,
            ]);

        } catch (\Throwable $e) {
            \Log::error($e);

            return response()->json([
                'message' => 'Login failed'
            ], 500);
        }
    }

    public function logout(Request $request){
        try {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Logged out'
            ]);

        } catch (\Throwable $e) {
            \Log::error($e);

            return response()->json([
                'message' => 'Logout failed'
            ], 500);
        }
    }
}
