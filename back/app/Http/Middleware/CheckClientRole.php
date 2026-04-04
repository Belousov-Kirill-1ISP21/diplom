<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckClientRole
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        $allowedRoles = ['admin', 'agent', 'client'];
        if (!$user->userType || !in_array($user->userType->name, $allowedRoles)) {
            return response()->json(['message' => 'Access denied.'], 403);
        }
        
        return $next($request);
    }
}