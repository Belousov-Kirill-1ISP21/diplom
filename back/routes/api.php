<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\PolicyController;
use App\Http\Controllers\TariffController;
use App\Http\Controllers\AccidentController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\DocumentTypeController;
use App\Http\Controllers\PolicyTypeController;
use App\Http\Controllers\VehicleCategoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AgentController;
use App\Http\Controllers\NotificationController;

// Публичные эндпоинты
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);

// Публичные справочники
Route::get('locations', [LocationController::class, 'index']);
Route::get('locations/{location}', [LocationController::class, 'show']);
Route::get('policy-types', [PolicyTypeController::class, 'index']);
Route::get('vehicle-categories', [VehicleCategoryController::class, 'index']);
Route::get('tariffs/public', [TariffController::class, 'publicIndex']);

// Защищенные эндпоинты
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Общие для всех
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::put('auth/change-password', [AuthController::class, 'changePassword']);
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);
    
    // Уведомления
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread', [NotificationController::class, 'unread']);
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy']);
    
    // Клиент
    Route::middleware(['client'])->prefix('client')->group(function () {
        Route::get('policies', [PolicyController::class, 'myPolicies']);
        Route::get('policies/{policy}', [PolicyController::class, 'showMyPolicy']);
        Route::post('policies/calculate', [PolicyController::class, 'calculate']);
        Route::post('policies', [PolicyController::class, 'store']);
        Route::post('policies/{policy}/pay', [PolicyController::class, 'pay']);
        Route::post('policies/{policy}/cancel', [PolicyController::class, 'cancel']);
        
        Route::get('vehicles', [VehicleController::class, 'myVehicles']);
        Route::post('vehicles', [VehicleController::class, 'store']);
        Route::get('vehicles/{vehicle}', [VehicleController::class, 'show']);
        Route::put('vehicles/{vehicle}', [VehicleController::class, 'update']);
        Route::delete('vehicles/{vehicle}', [VehicleController::class, 'destroy']);
        
        Route::get('accidents', [AccidentController::class, 'myAccidents']);
        Route::post('accidents/{policy}', [AccidentController::class, 'store']);
    });
    
    // Агент
    Route::middleware(['agent'])->prefix('agent')->group(function () {
        Route::get('clients', [ClientController::class, 'index']);
        Route::get('clients/{client}', [ClientController::class, 'show']);
        Route::post('clients', [ClientController::class, 'store']);
        Route::put('clients/{client}', [ClientController::class, 'update']);
        Route::delete('clients/{client}', [ClientController::class, 'destroy']);
        
        Route::get('policies', [PolicyController::class, 'index']);
        Route::get('policies/{policy}', [PolicyController::class, 'show']);
        Route::post('policies', [PolicyController::class, 'store']);
        Route::put('policies/{policy}', [PolicyController::class, 'update']);
        Route::post('policies/{policy}/activate', [PolicyController::class, 'activate']);
        Route::post('policies/{policy}/renew', [PolicyController::class, 'renew']);
        Route::post('policies/{policy}/cancel', [PolicyController::class, 'cancel']);
        Route::delete('policies/{policy}', [PolicyController::class, 'destroy']);
        
        Route::get('accidents', [AccidentController::class, 'index']);
        Route::get('accidents/{accident}', [AccidentController::class, 'show']);
        Route::put('accidents/{accident}', [AccidentController::class, 'update']);
        Route::post('accidents/{accident}/pay', [AccidentController::class, 'pay']);
        
        Route::get('vehicles', [VehicleController::class, 'index']);
        Route::get('vehicles/{vehicle}', [VehicleController::class, 'show']);
        
        Route::get('reports/daily', [ReportController::class, 'agentDaily']);
        Route::get('reports/monthly', [ReportController::class, 'agentMonthly']);
    });
    
    // Админ
    Route::middleware(['admin'])->prefix('admin')->group(function () {
        // Пользователи
        Route::get('users', [UserController::class, 'index']);
        Route::get('users/{user}', [UserController::class, 'show']);
        Route::post('users', [UserController::class, 'store']);
        Route::put('users/{user}', [UserController::class, 'update']);
        Route::delete('users/{user}', [UserController::class, 'destroy']);
        Route::post('users/{user}/block', [UserController::class, 'block']);
        Route::post('users/{user}/unblock', [UserController::class, 'unblock']);
        
        // Полисы (админ)
        Route::get('policies', [PolicyController::class, 'index']);
        Route::get('policies/{policy}', [PolicyController::class, 'show']);
        Route::post('policies/{policy}/cancel', [PolicyController::class, 'cancel']);
        Route::delete('policies/{policy}', [PolicyController::class, 'destroy']);
        
        // Страховые случаи (админ)
        Route::get('accidents', [AccidentController::class, 'index']);
        Route::get('accidents/{accident}', [AccidentController::class, 'show']);
        Route::put('accidents/{accident}', [AccidentController::class, 'update']);
        Route::post('accidents/{accident}/pay', [AccidentController::class, 'pay']);
        
        // Справочники
        Route::apiResource('locations', LocationController::class);
        Route::apiResource('document-types', DocumentTypeController::class);
        Route::apiResource('policy-types', PolicyTypeController::class);
        Route::apiResource('vehicle-categories', VehicleCategoryController::class);
        
        // Тарифы
        Route::get('tariffs', [TariffController::class, 'index']);
        Route::get('tariffs/{tariff}', [TariffController::class, 'show']);
        Route::post('tariffs', [TariffController::class, 'store']);
        Route::put('tariffs/{tariff}', [TariffController::class, 'update']);
        Route::delete('tariffs/{tariff}', [TariffController::class, 'destroy']);
        
        // Уведомления (админ)
        Route::post('notifications', [NotificationController::class, 'store']);
        
        // Отчеты
        Route::get('reports/sales', [ReportController::class, 'sales']);
        Route::get('reports/payments', [ReportController::class, 'payments']);
        Route::get('reports/accidents', [ReportController::class, 'accidentsStats']);
        Route::get('reports/clients', [ReportController::class, 'clientsStats']);
        Route::get('reports/financial', [ReportController::class, 'financial']);
        
        // Дашборд
        Route::get('dashboard', [AdminController::class, 'dashboard']);
        Route::get('statistics', [AdminController::class, 'statistics']);
        
        // Бэкапы
        Route::post('backup/create', [AdminController::class, 'createBackup']);
        Route::get('backup/list', [AdminController::class, 'listBackups']);
        Route::post('backup/restore', [AdminController::class, 'restoreBackup']);
    });
});