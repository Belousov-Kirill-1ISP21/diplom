<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    private $validationMessages = [
        'email.required' => 'Email обязателен',
        'email.email' => 'Введите корректный email адрес',
        'email.unique' => 'Пользователь с таким email уже зарегистрирован',
        'phone.required' => 'Номер телефона обязателен',
        'phone.unique' => 'Пользователь с таким номером телефона уже зарегистрирован',
        'user_type.required' => 'Тип пользователя обязателен',
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
                'message' => 'Пользователь обновлён',
                'user' => $user->load(['userType', 'clientProfile'])
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);
        }
    }
}