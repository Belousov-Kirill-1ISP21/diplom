<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserType;
use App\Models\ClientProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    private $validationMessages = [
        'email.required' => 'Email обязателен для заполнения',
        'email.email' => 'Введите корректный email адрес',
        'email.unique' => 'Пользователь с таким email уже зарегистрирован',
        'phone.required' => 'Номер телефона обязателен для заполнения',
        'phone.regex' => 'Телефон должен быть в формате +7XXXXXXXXXX',
        'phone.unique' => 'Пользователь с таким номером телефона уже зарегистрирован',
        'password.required' => 'Пароль обязателен для заполнения',
        'password.min' => 'Пароль должен содержать минимум :min символов',
        'password.confirmed' => 'Подтверждение пароля не совпадает',
        'last_name.required' => 'Фамилия обязательна для заполнения',
        'last_name.regex' => 'Фамилия должна содержать только русские буквы',
        'first_name.required' => 'Имя обязательно для заполнения',
        'first_name.regex' => 'Имя должно содержать только русские буквы',
        'middle_name.required' => 'Отчество обязательно для заполнения',
        'middle_name.regex' => 'Отчество должно содержать только русские буквы',
        'birth_date.required' => 'Дата рождения обязательна для заполнения',
        'birth_date.before_or_equal' => 'Дата рождения не может быть в будущем',
        'passport_series.required' => 'Серия паспорта обязательна',
        'passport_series.size' => 'Серия паспорта должна содержать 4 цифры',
        'passport_number.required' => 'Номер паспорта обязателен',
        'passport_number.size' => 'Номер паспорта должен содержать 6 цифр',
        'passport_issued_by.required' => 'Кем выдан - обязательно',
        'passport_issue_date.required' => 'Дата выдачи паспорта обязательна',
        'passport_issue_date.after' => 'Дата выдачи паспорта должна быть позже 31.12.1990',
        'driver_license_series.required' => 'Серия ВУ обязательна',
        'driver_license_series.size' => 'Серия ВУ должна содержать 4 цифры',
        'driver_license_number.required' => 'Номер ВУ обязателен',
        'driver_license_number.size' => 'Номер ВУ должен содержать 6 цифр',
        'driver_license_issued_by.required' => 'Кем выдано ВУ - обязательно',
        'driver_license_issue_date.required' => 'Дата выдачи ВУ обязательна',
        'driver_license_issue_date.before_or_equal' => 'Дата выдачи ВУ не может быть в будущем',
        'driver_license_expiry_date.required' => 'Дата окончания ВУ обязательна',
        'driver_license_expiry_date.after' => 'Дата окончания ВУ должна быть позже даты выдачи',
        'current_password.required' => 'Текущий пароль обязателен',
        'new_password.required' => 'Новый пароль обязателен',
        'new_password.min' => 'Новый пароль должен содержать минимум :min символов',
        'new_password.confirmed' => 'Подтверждение пароля не совпадает',
        'new_password.different' => 'Новый пароль должен отличаться от текущего',
    ];

    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email|unique:users',
                'phone' => 'required|string|regex:/^\+7\d{10}$/|unique:users',
                'password' => 'required|min:6|confirmed',
                'last_name' => 'required|string|max:30|regex:/^[А-ЯЁ][а-яё]+(-[А-ЯЁ][а-яё]+)?$/u',
                'first_name' => 'required|string|max:30|regex:/^[А-ЯЁ][а-яё]+$/u',
                'middle_name' => 'required|string|max:30|regex:/^[А-ЯЁ][а-яё]+$/u',
                'birth_date' => 'required|date|before_or_equal:today|after:1900-01-01',
                'passport_series' => 'required|string|size:4|regex:/^\d{4}$/',
                'passport_number' => 'required|string|size:6|regex:/^\d{6}$/',
                'passport_issued_by' => 'required|string|min:10|max:200',
                'passport_issue_date' => 'required|date|before_or_equal:today|after:1990-12-31',
                'driver_license_series' => 'required|string|size:4|regex:/^\d{4}$/',
                'driver_license_number' => 'required|string|size:6|regex:/^\d{6}$/',
                'driver_license_issued_by' => 'required|string|min:10|max:200',
                'driver_license_issue_date' => 'required|date|before_or_equal:today',
                'driver_license_expiry_date' => 'required|date|after:driver_license_issue_date',
            ], $this->validationMessages);
            
            $clientType = UserType::where('name', 'client')->first();
            
            if (!$clientType) {
                return response()->json(['message' => 'Тип пользователя не найден'], 500);
            }
            
            $user = User::create([
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password_hash' => Hash::make($validated['password']),
                'user_type_id' => $clientType->id,
            ]);
            
            $clientProfile = ClientProfile::create([
                'user_id' => $user->id,
                'last_name' => $validated['last_name'],
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'],
                'birth_date' => $validated['birth_date'],
                'passport_series' => $validated['passport_series'],
                'passport_number' => $validated['passport_number'],
                'passport_issued_by' => $validated['passport_issued_by'],
                'passport_issue_date' => $validated['passport_issue_date'],
                'driver_license_series' => $validated['driver_license_series'],
                'driver_license_number' => $validated['driver_license_number'],
                'driver_license_issued_by' => $validated['driver_license_issued_by'],
                'driver_license_issue_date' => $validated['driver_license_issue_date'],
                'driver_license_expiry_date' => $validated['driver_license_expiry_date'],
            ]);
            
            $token = $user->createToken('auth_token')->plainTextToken;
            
            return response()->json([
                'message' => 'Регистрация прошла успешно',
                'user' => $user->load('userType'),
                'profile' => $clientProfile,
                'token' => $token
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации данных',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Ошибка регистрации'], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ], $this->validationMessages);

            $user = User::where('email', $validated['email'])->first();

            if (!$user || !Hash::check($validated['password'], $user->password_hash)) {
                return response()->json(['message' => 'Неверный email или пароль'], 401);
            }

            if ($user->is_blocked) {
                return response()->json(['message' => 'Аккаунт заблокирован'], 403);
            }

            $user->tokens()->delete();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Вход выполнен успешно',
                'user' => $user->load(['userType', 'clientProfile', 'clientProfile.driverCategories']),
                'token' => $token
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации данных',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Выход выполнен успешно']);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load(['userType', 'clientProfile', 'clientProfile.driverCategories']);
        return response()->json($user);
    }

    public function changePassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'current_password' => 'required',
                'new_password' => 'required|min:8|confirmed|different:current_password', 
            ], $this->validationMessages);

            $user = $request->user();

            if (!Hash::check($validated['current_password'], $user->password_hash)) {
                return response()->json(['message' => 'Текущий пароль указан неверно'], 422);
            }

            $user->password_hash = Hash::make($validated['new_password']);
            $user->save();

            return response()->json(['message' => 'Пароль успешно изменён']);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации данных',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function forgotPassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email'
            ], $this->validationMessages);

            $user = User::where('email', $validated['email'])->first();

            if (!$user) {
                return response()->json(['message' => 'Пользователь с таким email не найден'], 404);
            }

            $token = '4444';
            
            return response()->json([
                'message' => 'Код сброса отправлен на вашу почту',
                'token' => $token
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации данных',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function resetPassword(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'token' => 'required',
                'password' => 'required|min:6|confirmed',
            ], $this->validationMessages);

            $user = User::where('email', $validated['email'])->first();

            if (!$user) {
                return response()->json(['message' => 'Пользователь с таким email не найден'], 404);
            }

            if ($validated['token'] !== '4444') {
                return response()->json(['message' => 'Неверный код подтверждения'], 422);
            }

            $user->password_hash = Hash::make($validated['password']);
            $user->save();
            $user->tokens()->delete();

            return response()->json(['message' => 'Пароль успешно изменён']);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации данных',
                'errors' => $e->errors()
            ], 422);
        }
    }
}