<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckAdminRole
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        if (!$user->userType || $user->userType->name !== 'admin') {
            return response()->json(['message' => 'Access denied. Admin rights required.'], 403);
        }
        
        return $next($request);
    }
}