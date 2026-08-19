<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Http\Resources\ReviewerResource;

class ReviewerController extends Controller
{
    public function index()
    {
        return ReviewerResource::collection(
            User::where('role', 'Reviewer')
                ->orderBy('id')
                ->get()
        );
    }
}
