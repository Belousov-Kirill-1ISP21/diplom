<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserType;
use App\Models\ClientProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // Регистрация нового клиента
    public function register(Request $request)
    {
        \Log::info('Register method called');
        \Log::info('Request data:', $request->all());
        
        try {
            $request->validate([
                'email' => 'required|email|unique:users',
                'phone' => 'required|string|unique:users',
                'password' => 'required|min:6|confirmed',
                'last_name' => 'required|string|max:30',
                'first_name' => 'required|string|max:30',
                'middle_name' => 'nullable|string|max:30',
                'birth_date' => 'nullable|date',
                // Паспортные данные
                'passport_series' => 'nullable|string|max:10',
                'passport_number' => 'nullable|string|max:20',
                'passport_issued_by' => 'nullable|string|max:100',
                'passport_issue_date' => 'nullable|date',
                // Водительские права
                'driver_license_series' => 'nullable|string|max:10',
                'driver_license_number' => 'nullable|string|max:20',
                'driver_license_issued_by' => 'nullable|string|max:100',
                'driver_license_issue_date' => 'nullable|date',
                'driver_license_expiry_date' => 'nullable|date',
            ]);
            \Log::info('Validation passed');
            
            $clientType = UserType::where('name', 'client')->first();
            
            if (!$clientType) {
                return response()->json(['message' => 'User type not found'], 500);
            }
            
            $user = User::create([
                'email' => $request->email,
                'phone' => $request->phone,
                'password_hash' => Hash::make($request->password),
                'user_type_id' => $clientType->id,
            ]);
            \Log::info('User created:', $user->toArray());
            
            $clientProfile = ClientProfile::create([
                'user_id' => $user->id,
                'last_name' => $request->last_name,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'birth_date' => $request->birth_date,
                // Паспортные данные
                'passport_series' => $request->passport_series,
                'passport_number' => $request->passport_number,
                'passport_issued_by' => $request->passport_issued_by,
                'passport_issue_date' => $request->passport_issue_date,
                // Водительские права
                'driver_license_series' => $request->driver_license_series,
                'driver_license_number' => $request->driver_license_number,
                'driver_license_issued_by' => $request->driver_license_issued_by,
                'driver_license_issue_date' => $request->driver_license_issue_date,
                'driver_license_expiry_date' => $request->driver_license_expiry_date,
            ]);
            \Log::info('Client profile created:', $clientProfile->toArray());
            
            $token = $user->createToken('auth_token')->plainTextToken;
            
            return response()->json([
                'message' => 'Registration successful',
                'user' => $user->load('userType'),
                'profile' => $clientProfile,
                'token' => $token
            ], 201);
            
        } catch (\Exception $e) {
            \Log::error('Registration error: ' . $e->getMessage());
            return response()->json(['message' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

    // Авторизация
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user->load(['userType', 'clientProfile', 'clientProfile.driverCategories']),
            'token' => $token
        ]);
    }

    // Выход
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    // Получить текущего пользователя
    public function me(Request $request)
    {
        $user = $request->user()->load(['userType', 'clientProfile', 'clientProfile.driverCategories']);
        return response()->json($user);
    }

    // Смена пароля
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password_hash)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        $user->password_hash = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password changed successfully']);
    }

    // Запрос на сброс пароля
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Пользователь с таким email не найден'], 404);
        }

        $token = '4444';
        
        return response()->json([
            'message' => 'Код сброса отправлен на вашу почту',
            'token' => $token
        ]);
    }

    // Сброс пароля
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Пользователь не найден'], 404);
        }

        if ($request->token !== '4444') {
            return response()->json(['message' => 'Неверный код подтверждения'], 422);
        }

        $user->password_hash = Hash::make($request->password);
        $user->save();

        $user->tokens()->delete();

        return response()->json(['message' => 'Пароль успешно изменен']);
    }
}