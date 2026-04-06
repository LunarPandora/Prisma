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
                "role" => $user->role
            ]);

        } catch (\Throwable $e) {
            \Log::error($e);

            return response()->json([
                'message' => 'Login failed'
            ], 500);
        }
    }   
}
