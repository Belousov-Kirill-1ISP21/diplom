<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Policy;
use App\Models\ClientProfile;
use App\Models\Accident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    // Главная дашборд
    public function dashboard(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->subDays(30));
        $dateTo = $request->get('date_to', now());
        
        $stats = [
            'total_users' => User::count(),
            'total_clients' => User::whereHas('userType', function($q) {
                $q->where('name', 'client');
            })->count(),
            'total_agents' => User::whereHas('userType', function($q) {
                $q->where('name', 'agent');
            })->count(),
            'total_policies' => Policy::count(),
            'active_policies' => Policy::where('status', 'active')->count(),
            'expired_policies' => Policy::where('status', 'expired')->count(),
            'total_accidents' => Accident::count(),
            'total_premium' => Policy::sum('final_price'),
            'total_payouts' => Accident::sum('damage_amount'),
            'new_users_today' => User::whereDate('created_at', today())->count(),
            'new_policies_today' => Policy::whereDate('created_at', today())->count(),
        ];
        
        // Динамика по дням
        $dailyStats = Policy::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(final_price) as total')
            )
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        
        return response()->json([
            'stats' => $stats,
            'daily_stats' => $dailyStats,
            'period' => [
                'from' => $dateFrom,
                'to' => $dateTo
            ]
        ]);
    }

    // Статистика
    public function statistics(Request $request)
    {
        $type = $request->get('type', 'overview'); // overview, policies, payments, clients
        
        switch ($type) {
            case 'policies':
                $data = $this->getPolicyStatistics();
                break;
            case 'payments':
                $data = $this->getPaymentStatistics();
                break;
            case 'clients':
                $data = $this->getClientStatistics();
                break;
            default:
                $data = $this->getOverviewStatistics();
        }
        
        return response()->json($data);
    }

    // Создать бэкап
    public function createBackup(Request $request)
    {
        $type = $request->get('type', 'database'); // database, files, full
        
        try {
            if ($type === 'database') {
                $filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';
                $path = storage_path('app/backups/' . $filename);
                
                // Создаем директорию если нет
                if (!is_dir(dirname($path))) {
                    mkdir(dirname($path), 0755, true);
                }
                
                // Команда для дампа БД (нужен mysqldump)
                $command = sprintf(
                    'mysqldump --user=%s --password=%s --host=%s %s > %s',
                    env('DB_USERNAME'),
                    env('DB_PASSWORD'),
                    env('DB_HOST'),
                    env('DB_DATABASE'),
                    $path
                );
                
                exec($command);
                
                return response()->json([
                    'message' => 'Backup created successfully',
                    'filename' => $filename,
                    'path' => $path
                ]);
            }
            
            return response()->json(['message' => 'Backup type not implemented yet'], 501);
            
        } catch (\Exception $e) {
            return response()->json(['message' => 'Backup failed: ' . $e->getMessage()], 500);
        }
    }

    // Список бэкапов
    public function listBackups()
    {
        $backupDir = storage_path('app/backups');
        
        if (!is_dir($backupDir)) {
            return response()->json([]);
        }
        
        $files = scandir($backupDir);
        $backups = [];
        
        foreach ($files as $file) {
            if ($file !== '.' && $file !== '..' && pathinfo($file, PATHINFO_EXTENSION) === 'sql') {
                $path = $backupDir . '/' . $file;
                $backups[] = [
                    'filename' => $file,
                    'size' => filesize($path),
                    'created_at' => date('Y-m-d H:i:s', filemtime($path))
                ];
            }
        }
        
        return response()->json($backups);
    }

    // Восстановить из бэкапа
    public function restoreBackup(Request $request)
    {
        $request->validate([
            'filename' => 'required|string'
        ]);
        
        $filename = $request->filename;
        $path = storage_path('app/backups/' . $filename);
        
        if (!file_exists($path)) {
            return response()->json(['message' => 'Backup file not found'], 404);
        }
        
        try {
            $command = sprintf(
                'mysql --user=%s --password=%s --host=%s %s < %s',
                env('DB_USERNAME'),
                env('DB_PASSWORD'),
                env('DB_HOST'),
                env('DB_DATABASE'),
                $path
            );
            
            exec($command);
            
            return response()->json(['message' => 'Backup restored successfully']);
            
        } catch (\Exception $e) {
            return response()->json(['message' => 'Restore failed: ' . $e->getMessage()], 500);
        }
    }

    // Приватные методы для статистики
    private function getOverviewStatistics()
    {
        $totalPremium = Policy::sum('final_price');
        $totalPayouts = Accident::sum('damage_amount');
        
        return [
            'total_revenue' => $totalPremium,
            'total_payouts' => $totalPayouts,
            'profit' => $totalPremium - $totalPayouts,
            'loss_ratio' => $totalPremium > 0 ? ($totalPayouts / $totalPremium * 100) : 0,
            'average_policy_price' => Policy::avg('final_price') ?? 0,
        ];
    }

    private function getPolicyStatistics()
    {
        return [
            'by_type' => Policy::select('policy_type_id', DB::raw('COUNT(*) as count'))
                ->with('policyType')
                ->groupBy('policy_type_id')
                ->get(),
            'by_status' => Policy::select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get(),
            'by_month' => Policy::select(
                    DB::raw('YEAR(created_at) as year'),
                    DB::raw('MONTH(created_at) as month'),
                    DB::raw('COUNT(*) as count')
                )
                ->groupBy('year', 'month')
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->limit(12)
                ->get(),
        ];
    }

    private function getPaymentStatistics()
    {
        return [
            'total_premium' => Policy::sum('final_price'),
            'average_premium' => Policy::avg('final_price'),
            'by_month' => Policy::select(
                    DB::raw('YEAR(created_at) as year'),
                    DB::raw('MONTH(created_at) as month'),
                    DB::raw('SUM(final_price) as total')
                )
                ->groupBy('year', 'month')
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->limit(12)
                ->get(),
        ];
    }

    private function getClientStatistics()
    {
        return [
            'total_clients' => User::whereHas('userType', function($q) {
                $q->where('name', 'client');
            })->count(),
            'new_clients_month' => User::whereHas('userType', function($q) {
                $q->where('name', 'client');
            })->whereMonth('created_at', now()->month)->count(),
            'clients_with_policies' => ClientProfile::has('policies')->count(),
            'clients_with_accidents' => ClientProfile::has('accidents')->count(),
        ];
    }
}