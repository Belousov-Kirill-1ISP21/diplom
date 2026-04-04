<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckAgentRole
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        if (!$user->userType || !in_array($user->userType->name, ['admin', 'agent'])) {
            return response()->json(['message' => 'Access denied. Agent rights required.'], 403);
        }
        
        return $next($request);
    }
}