<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Policy;
use App\Models\ClientProfile;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    // Агентский дашборд
    public function dashboard(Request $request)
    {
        $agentId = $request->user()->id;
        
        $stats = [
            'total_clients' => User::whereHas('userType', function($q) {
                $q->where('name', 'client');
            })->count(),
            'my_clients' => 0, // Здесь логика привязки агента к клиентам
            'policies_issued_today' => Policy::whereDate('created_at', today())->count(),
            'policies_issued_month' => Policy::whereMonth('created_at', now()->month)->count(),
            'total_premium_month' => Policy::whereMonth('created_at', now()->month)->sum('final_price'),
        ];
        
        // Последние 10 полисов
        $recentPolicies = Policy::with(['client.user', 'policyType'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        
        return response()->json([
            'stats' => $stats,
            'recent_policies' => $recentPolicies
        ]);
    }
}