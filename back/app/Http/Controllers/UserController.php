<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Кастомные сообщения для валидации
     */
    private $validationMessages = [
        // Email
        'email.required' => 'Email обязателен для заполнения',
        'email.email' => 'Введите корректный email адрес (например: user@example.com)',
        'email.unique' => 'Пользователь с таким email уже зарегистрирован',
        
        // Телефон
        'phone.required' => 'Номер телефона обязателен для заполнения',
        'phone.string' => 'Номер телефона должен быть строкой',
        'phone.unique' => 'Пользователь с таким номером телефона уже зарегистрирован',
        
        // Пароль
        'password.required' => 'Пароль обязателен для заполнения',
        'password.min' => 'Пароль должен содержать минимум :min символов',
        
        // Тип пользователя
        'user_type.required' => 'Тип пользователя обязателен для заполнения',
        'user_type.string' => 'Тип пользователя должен быть строкой',
        'user_type.exists' => 'Выбранный тип пользователя не существует',
    ];

    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $userType = $request->get('user_type');
        $search = $request->get('search');
        
        $query = User::with(['userType', 'clientProfile', 'clientProfile.driverCategories']);
        
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

    public function show($id)
    {
        $user = User::with(['userType', 'clientProfile', 'clientProfile.driverCategories'])->findOrFail($id);
        return response()->json($user);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email|unique:users',
                'phone' => 'required|string|unique:users',
                'password' => 'required|min:6',
                'user_type' => 'required|string|exists:user_types,name',
            ], $this->validationMessages);
            
            $userType = UserType::where('name', $request->user_type)->first();
            
            $user = User::create([
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password_hash' => Hash::make($validated['password']),
                'user_type_id' => $userType->id,
            ]);
            
            return response()->json([
                'message' => 'Пользователь успешно создан',
                'user' => $user->load(['userType', 'clientProfile'])
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации данных',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
            
            $validated = $request->validate([
                'email' => 'sometimes|email|unique:users,email,' . $id,
                'phone' => 'sometimes|string|unique:users,phone,' . $id,
                'user_type' => 'sometimes|string|exists:user_types,name',
            ], $this->validationMessages);
            
            if ($request->has('user_type')) {
                $userType = UserType::where('name', $request->user_type)->first();
                $user->user_type_id = $userType->id;
            }
            
            $user->update($request->only(['email', 'phone']));
            
            return response()->json([
                'message' => 'Пользователь успешно обновлён',
                'user' => $user->load(['userType', 'clientProfile'])
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации данных',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        if (request()->user()->id === $user->id) {
            return response()->json(['message' => 'Нельзя удалить самого себя'], 422);
        }
        
        $user->delete();
        
        return response()->json(['message' => 'Пользователь успешно удалён']);
    }

    public function block($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->is_blocked) {
            return response()->json(['message' => 'Пользователь уже заблокирован'], 422);
        }
        
        $user->update(['is_blocked' => true]);
        $user->tokens()->delete();
        
        return response()->json(['message' => 'Пользователь успешно заблокирован']);
    }

    public function unblock($id)
    {
        $user = User::findOrFail($id);
        
        if (!$user->is_blocked) {
            return response()->json(['message' => 'Пользователь уже разблокирован'], 422);
        }
        
        $user->update(['is_blocked' => false]);
        
        return response()->json(['message' => 'Пользователь успешно разблокирован']);
    }
}