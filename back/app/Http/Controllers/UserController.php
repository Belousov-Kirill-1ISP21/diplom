<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Список всех пользователей
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $userType = $request->get('user_type');
        $search = $request->get('search');
        
        $query = User::with('userType');
        
        if ($userType) {
            $query->whereHas('userType', function($q) use ($userType) {
                $q->where('name', $userType);
            });
        }
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }
        
        $users = $query->paginate($perPage);
        
        return response()->json($users);
    }

    // Показать конкретного пользователя
    public function show($id)
    {
        $user = User::with(['userType', 'clientProfile'])->findOrFail($id);
        
        return response()->json($user);
    }

    // Создать пользователя (админ)
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users',
            'phone' => 'required|string|unique:users',
            'password' => 'required|min:6',
            'user_type' => 'required|string|exists:user_types,name',
        ]);
        
        $userType = UserType::where('name', $request->user_type)->first();
        
        $user = User::create([
            'email' => $request->email,
            'phone' => $request->phone,
            'password_hash' => Hash::make($request->password),
            'user_type_id' => $userType->id,
        ]);
        
        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->load('userType')
        ], 201);
    }

    // Обновить пользователя (админ)
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'phone' => 'sometimes|string|unique:users,phone,' . $id,
            'user_type' => 'sometimes|string|exists:user_types,name',
        ]);
        
        if ($request->has('user_type')) {
            $userType = UserType::where('name', $request->user_type)->first();
            $user->user_type_id = $userType->id;
        }
        
        $user->update($request->only(['email', 'phone']));
        
        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->load('userType')
        ]);
    }

    // Удалить пользователя (админ)
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Нельзя удалить самого себя
        if (request()->user()->id === $user->id) {
            return response()->json(['message' => 'Cannot delete yourself'], 422);
        }
        
        $user->delete();
        
        return response()->json(['message' => 'User deleted successfully']);
    }

    // Заблокировать пользователя (админ)
    public function block($id)
    {
        $user = User::findOrFail($id);
        
        // Здесь можно добавить поле is_blocked в таблицу users
        // Пока просто заглушка
        $user->update(['is_blocked' => true]);
        
        // Удаляем все токены заблокированного пользователя
        $user->tokens()->delete();
        
        return response()->json(['message' => 'User blocked successfully']);
    }

    // Разблокировать пользователя (админ)
    public function unblock($id)
    {
        $user = User::findOrFail($id);
        
        $user->update(['is_blocked' => false]);
        
        return response()->json(['message' => 'User unblocked successfully']);
    }
}