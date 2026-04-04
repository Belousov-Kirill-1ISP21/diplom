<?php

namespace App\Http\Controllers;

use App\Models\Policy;
use App\Models\User;
use App\Models\Accident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    // Отчет для агента (ежедневный)
    public function agentDaily(Request $request)
    {
        $date = $request->get('date', today());
        
        $agent = $request->user();
        
        $stats = [
            'date' => $date,
            'policies_issued' => Policy::whereDate('created_at', $date)->count(),
            'policies_amount' => Policy::whereDate('created_at', $date)->sum('final_price'),
            'clients_registered' => User::whereHas('userType', function($q) {
                $q->where('name', 'client');
            })->whereDate('created_at', $date)->count(),
            'accidents_reported' => Accident::whereDate('accident_date', $date)->count(),
        ];
        
        // Список выданных полисов за день
        $policies = Policy::whereDate('created_at', $date)
            ->with(['client.user', 'policyType'])
            ->get();
        
        return response()->json([
            'summary' => $stats,
            'policies' => $policies
        ]);
    }

    // Отчет для агента (ежемесячный)
    public function agentMonthly(Request $request)
    {
        $year = $request->get('year', now()->year);
        $month = $request->get('month', now()->month);
        
        $stats = [
            'year' => $year,
            'month' => $month,
            'policies_issued' => Policy::whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->count(),
            'policies_amount' => Policy::whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->sum('final_price'),
            'clients_registered' => User::whereHas('userType', function($q) {
                $q->where('name', 'client');
            })->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->count(),
            'active_policies' => Policy::where('status', 'active')
                ->whereYear('start_date', $year)
                ->whereMonth('start_date', $month)
                ->count(),
        ];
        
        // Ежедневная разбивка - используем CAST для совместимости с SQLite и MySQL
        $daily = Policy::select(
                DB::raw("CAST(strftime('%d', created_at) as INTEGER) as day"),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(final_price) as total')
            )
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->groupBy('day')
            ->orderBy('day')
            ->get();
        
        return response()->json([
            'summary' => $stats,
            'daily_breakdown' => $daily
        ]);
    }

    // Отчет по продажам (админ)
    public function sales(Request $request)
    {
        $period = $request->get('period', 'month'); // day, week, month, year
        $dateFrom = $request->get('date_from');
        $dateTo = $request->get('date_to');
        
        if ($dateFrom && $dateTo) {
            $startDate = $dateFrom;
            $endDate = $dateTo;
        } else {
            switch ($period) {
                case 'day':
                    $startDate = now()->startOfDay();
                    $endDate = now()->endOfDay();
                    break;
                case 'week':
                    $startDate = now()->startOfWeek();
                    $endDate = now()->endOfWeek();
                    break;
                case 'year':
                    $startDate = now()->startOfYear();
                    $endDate = now()->endOfYear();
                    break;
                default:
                    $startDate = now()->startOfMonth();
                    $endDate = now()->endOfMonth();
            }
        }
        
        $sales = Policy::whereBetween('created_at', [$startDate, $endDate])
            ->with(['policyType', 'client.user'])
            ->get();
        
        $summary = [
            'total_policies' => $sales->count(),
            'total_amount' => $sales->sum('final_price'),
            'by_type' => $sales->groupBy('policy_type_id')->map(function($group) {
                return [
                    'count' => $group->count(),
                    'total' => $group->sum('final_price')
                ];
            }),
            'by_status' => $sales->groupBy('status')->map(function($group) {
                return $group->count();
            }),
        ];
        
        return response()->json([
            'period' => [
                'from' => $startDate,
                'to' => $endDate
            ],
            'summary' => $summary,
            'sales' => $sales
        ]);
    }

    // Отчет по платежам (админ)
    public function payments(Request $request)
    {
        $year = $request->get('year', now()->year);
        
        $monthly = Policy::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(final_price) as total')
            )
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();
        
        $total = Policy::whereYear('created_at', $year)->sum('final_price');
        
        return response()->json([
            'year' => $year,
            'total' => $total,
            'monthly' => $monthly
        ]);
    }

    // Отчет по страховым случаям (админ)
    public function accidentsStats(Request $request)
    {
        $year = $request->get('year', now()->year);
        
        $stats = [
            'total_accidents' => Accident::whereYear('accident_date', $year)->count(),
            'total_payouts' => Accident::whereYear('accident_date', $year)->sum('damage_amount'),
            'at_fault_accidents' => Accident::whereYear('accident_date', $year)
                ->where('is_client_fault', true)
                ->count(),
            'not_at_fault_accidents' => Accident::whereYear('accident_date', $year)
                ->where('is_client_fault', false)
                ->count(),
            'average_payout' => Accident::whereYear('accident_date', $year)->avg('damage_amount'),
        ];
        
        $monthly = Accident::select(
                DB::raw('MONTH(accident_date) as month'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(damage_amount) as total')
            )
            ->whereYear('accident_date', $year)
            ->groupBy('month')
            ->orderBy('month')
            ->get();
        
        return response()->json([
            'year' => $year,
            'stats' => $stats,
            'monthly' => $monthly
        ]);
    }

    // Отчет по клиентам (админ)
    public function clientsStats(Request $request)
    {
        $totalClients = User::whereHas('userType', function($q) {
            $q->where('name', 'client');
        })->count();
        
        $clientsWithPolicies = ClientProfile::has('policies')->count();
        $clientsWithAccidents = ClientProfile::has('accidents')->count();
        
        // Топ клиентов по сумме страховых премий
        $topClients = ClientProfile::select('client_profiles.*')
            ->with(['user'])
            ->withSum('policies', 'final_price')
            ->having('policies_sum_final_price', '>', 0)
            ->orderBy('policies_sum_final_price', 'desc')
            ->limit(10)
            ->get();
        
        // Распределение по бонус-малус классам
        $bonusMalusDistribution = ClientProfile::select('bonus_malus_class', DB::raw('COUNT(*) as count'))
            ->groupBy('bonus_malus_class')
            ->orderBy('bonus_malus_class')
            ->get();
        
        return response()->json([
            'total_clients' => $totalClients,
            'clients_with_policies' => $clientsWithPolicies,
            'clients_with_accidents' => $clientsWithAccidents,
            'conversion_rate' => $totalClients > 0 ? round($clientsWithPolicies / $totalClients * 100, 2) : 0,
            'top_clients' => $topClients,
            'bonus_malus_distribution' => $bonusMalusDistribution
        ]);
    }

    // Финансовый отчет (админ)
    public function financial(Request $request)
    {
        $year = $request->get('year', now()->year);
        
        $totalPremium = Policy::whereYear('created_at', $year)->sum('final_price');
        $totalPayouts = Accident::whereYear('accident_date', $year)->sum('damage_amount');
        $profit = $totalPremium - $totalPayouts;
        $lossRatio = $totalPremium > 0 ? round($totalPayouts / $totalPremium * 100, 2) : 0;
        
        // Данные для графика
        $monthlyData = [];
        for ($month = 1; $month <= 12; $month++) {
            $premium = Policy::whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->sum('final_price');
            $payouts = Accident::whereYear('accident_date', $year)
                ->whereMonth('accident_date', $month)
                ->sum('damage_amount');
            
            $monthlyData[] = [
                'month' => $month,
                'premium' => $premium,
                'payouts' => $payouts,
                'profit' => $premium - $payouts
            ];
        }
        
        return response()->json([
            'year' => $year,
            'total_premium' => $totalPremium,
            'total_payouts' => $totalPayouts,
            'profit' => $profit,
            'loss_ratio' => $lossRatio,
            'monthly_data' => $monthlyData
        ]);
    }
}