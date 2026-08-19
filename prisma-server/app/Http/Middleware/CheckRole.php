<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to check if the authenticated user has one of the allowed roles.
 *
 * Usage in routes:
 *   ->middleware('role:Superadmin')
 *   ->middleware('role:Staff LPPM,Ketua LPPM')
 *   ->middleware('role:Superadmin,Staff LPPM,Ketua LPPM')
 */
class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$allowedRoles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if (!in_array($user->role, $allowedRoles)) {
            return response()->json([
                'message' => 'Unauthorized. You do not have the required role to perform this action.',
                'required' => $allowedRoles,
                'current' => $user->role,
            ], 403);
        }

        return $next($request);
    }
}
