<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\PolicyController;
use App\Http\Controllers\TariffController;
use App\Http\Controllers\AccidentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\NotificationController;

// Публичные эндпоинты
Route::post('auth/register', [AuthController::class, 'register']);
Route::post('auth/login', [AuthController::class, 'login']);
Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);
Route::post('policies/calculate', [PolicyController::class, 'calculate']);

// Публичные справочники
Route::get('tariffs/public', [TariffController::class, 'publicIndex']);

// Защищенные эндпоинты
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Общие для всех
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::put('auth/change-password', [AuthController::class, 'changePassword']);
    Route::put('profile', [ProfileController::class, 'update']);
    
    // Уведомления
    Route::post('notifications', [NotificationController::class, 'store']);
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::put('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy']);
    
    // Клиент
    Route::middleware(['client'])->prefix('client')->group(function () {
        Route::get('policies', [PolicyController::class, 'myPolicies']);
        Route::get('policies/{policy}', [PolicyController::class, 'showMyPolicy']);
        Route::post('policies', [PolicyController::class, 'store']);
        Route::post('policies/{policy}/pay', [PolicyController::class, 'pay']);
        Route::post('policies/{policy}/cancel', [PolicyController::class, 'cancel']);
        
        Route::get('vehicles', [VehicleController::class, 'myVehicles']);
        Route::post('vehicles', [VehicleController::class, 'store']);
        Route::delete('vehicles/{vehicle}', [VehicleController::class, 'destroy']);
        
        Route::get('accidents', [AccidentController::class, 'myAccidents']);
        Route::post('accidents/{policy}', [AccidentController::class, 'store']);
    });
    
    // Агент
    Route::middleware(['agent'])->prefix('agent')->group(function () {
        Route::get('clients', [ClientController::class, 'index']);
        Route::post('clients', [ClientController::class, 'store']);
        Route::put('clients/{client}', [ClientController::class, 'update']);
        Route::delete('clients/{client}', [ClientController::class, 'destroy']);
        
        Route::get('policies', [PolicyController::class, 'index']);
        Route::put('policies/{policy}', [PolicyController::class, 'update']);
        Route::post('policies/{policy}/activate', [PolicyController::class, 'activate']);
        Route::post('policies/{policy}/renew', [PolicyController::class, 'renew']);
        Route::post('policies/{policy}/cancel', [PolicyController::class, 'cancel']);
        
        Route::get('accidents', [AccidentController::class, 'index']);
        Route::put('accidents/{accident}', [AccidentController::class, 'update']);
        
        Route::get('notifications/all', [NotificationController::class, 'allForAgent']);
    });
    
    // Админ
    Route::middleware(['admin'])->prefix('admin')->group(function () {
        Route::get('users', [UserController::class, 'index']);
        Route::put('users/{user}', [UserController::class, 'update']);
        
        Route::get('policies', [PolicyController::class, 'index']);
        Route::post('policies/{policy}/cancel', [PolicyController::class, 'cancel']);
        
        Route::get('accidents', [AccidentController::class, 'index']);
        Route::put('accidents/{accident}', [AccidentController::class, 'update']);
        
        Route::get('tariffs', [TariffController::class, 'index']);
        Route::post('tariffs', [TariffController::class, 'store']);
        Route::put('tariffs/{tariff}', [TariffController::class, 'update']);
        Route::delete('tariffs/{tariff}', [TariffController::class, 'destroy']);
    });
});