<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserType;
use App\Models\ClientProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // Регистрация нового клиента
    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users',
            'phone' => 'required|string|unique:users',
            'password' => 'required|min:6|confirmed',
            'last_name' => 'required|string|max:30',
            'first_name' => 'required|string|max:30',
            'middle_name' => 'nullable|string|max:30',
            'birth_date' => 'nullable|date',
        ]);

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

        $clientProfile = ClientProfile::create([
            'user_id' => $user->id,
            'last_name' => $request->last_name,
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'birth_date' => $request->birth_date,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user->load('userType'),
            'profile' => $clientProfile,
            'token' => $token
        ], 201);
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

        // Удаляем старые токены
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user->load('userType', 'clientProfile'),
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
        $user = $request->user()->load('userType', 'clientProfile');
        
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
            return response()->json(['message' => 'User not found'], 404);
        }

        // Здесь можно отправить email со ссылкой для сброса
        // Пока просто возвращаем токен для тестирования
        $token = Str::random(64);
        
        return response()->json([
            'message' => 'Password reset link sent',
            'token' => $token // только для тестирования, в проде убрать
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
            return response()->json(['message' => 'User not found'], 404);
        }

        // Здесь проверять токен из email
        $user->password_hash = Hash::make($request->password);
        $user->save();

        // Удаляем все токены пользователя
        $user->tokens()->delete();

        return response()->json(['message' => 'Password reset successfully']);
    }
}