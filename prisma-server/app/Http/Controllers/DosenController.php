<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Http\Resources\DosenResource;

class DosenController extends Controller
{
    public function index()
    {
        return DosenResource::collection(
            User::where('role', 'Dosen')
                ->orderBy('id')
                ->get()
        );
    }
}
