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
    /**
     * Кастомные сообщения для валидации
     */
    private $validationMessages = [
        // Регистрация
        'email.required' => 'Email обязателен для заполнения',
        'email.email' => 'Введите корректный email адрес (например: user@example.com)',
        'email.unique' => 'Пользователь с таким email уже зарегистрирован',
        
        'phone.required' => 'Номер телефона обязателен для заполнения',
        'phone.string' => 'Номер телефона должен быть строкой',
        'phone.regex' => 'Телефон должен быть в формате +7XXXXXXXXXX (10 цифр после +7)',
        'phone.unique' => 'Пользователь с таким номером телефона уже зарегистрирован',
        
        'password.required' => 'Пароль обязателен для заполнения',
        'password.min' => 'Пароль должен содержать минимум :min символов',
        'password.confirmed' => 'Подтверждение пароля не совпадает',
        
        'last_name.required' => 'Фамилия обязательна для заполнения',
        'last_name.string' => 'Фамилия должна быть строкой',
        'last_name.max' => 'Фамилия не может превышать :max символов',
        'last_name.regex' => 'Фамилия должна начинаться с заглавной буквы и содержать только русские буквы. Допускается дефис (например: Иванов, Смирнов-Петров)',
        
        'first_name.required' => 'Имя обязательно для заполнения',
        'first_name.string' => 'Имя должно быть строкой',
        'first_name.max' => 'Имя не может превышать :max символов',
        'first_name.regex' => 'Имя должно начинаться с заглавной буквы и содержать только русские буквы (например: Иван)',
        
        'middle_name.required' => 'Отчество обязательно для заполнения',
        'middle_name.string' => 'Отчество должно быть строкой',
        'middle_name.max' => 'Отчество не может превышать :max символов',
        'middle_name.regex' => 'Отчество должно начинаться с заглавной буквы и содержать только русские буквы (например: Иванович)',
        
        'birth_date.required' => 'Дата рождения обязательна для заполнения',
        'birth_date.date' => 'Дата рождения должна быть корректной датой',
        'birth_date.before_or_equal' => 'Дата рождения не может быть в будущем',
        'birth_date.after' => 'Дата рождения должна быть позже 01.01.1900',
        
        'passport_series.required' => 'Серия паспорта обязательна для заполнения',
        'passport_series.string' => 'Серия паспорта должна быть строкой',
        'passport_series.size' => 'Серия паспорта должна содержать ровно :size цифры',
        'passport_series.regex' => 'Серия паспорта должна содержать только цифры (4 цифры)',
        
        'passport_number.required' => 'Номер паспорта обязателен для заполнения',
        'passport_number.string' => 'Номер паспорта должен быть строкой',
        'passport_number.size' => 'Номер паспорта должен содержать ровно :size цифр',
        'passport_number.regex' => 'Номер паспорта должна содержать только цифры (6 цифр)',
        
        'passport_issued_by.required' => 'Орган, выдавший паспорт, обязателен для заполнения',
        'passport_issued_by.string' => 'Название органа выдачи должно быть строкой',
        'passport_issued_by.min' => 'Название органа выдачи должно содержать минимум :min символов',
        'passport_issued_by.max' => 'Название органа выдачи не может превышать :max символов',
        
        'passport_issue_date.required' => 'Дата выдачи паспорта обязательна для заполнения',
        'passport_issue_date.date' => 'Дата выдачи паспорта должна быть корректной датой',
        'passport_issue_date.before_or_equal' => 'Дата выдачи паспорта не может быть в будущем',
        'passport_issue_date.after' => 'Дата выдачи паспорта должна быть позже 31.12.1990',
        
        'driver_license_series.required' => 'Серия водительского удостоверения обязательна',
        'driver_license_series.string' => 'Серия ВУ должна быть строкой',
        'driver_license_series.size' => 'Серия ВУ должна содержать ровно :size цифры',
        'driver_license_series.regex' => 'Серия ВУ должна содержать только цифры (4 цифры)',
        
        'driver_license_number.required' => 'Номер водительского удостоверения обязателен',
        'driver_license_number.string' => 'Номер ВУ должен быть строкой',
        'driver_license_number.size' => 'Номер ВУ должен содержать ровно :size цифр',
        'driver_license_number.regex' => 'Номер ВУ должна содержать только цифры (6 цифр)',
        
        'driver_license_issued_by.required' => 'Орган, выдавший ВУ, обязателен для заполнения',
        'driver_license_issued_by.string' => 'Название органа выдачи ВУ должно быть строкой',
        'driver_license_issued_by.min' => 'Название органа выдачи ВУ должно содержать минимум :min символов',
        'driver_license_issued_by.max' => 'Название органа выдачи ВУ не может превышать :max символов',
        
        'driver_license_issue_date.required' => 'Дата выдачи ВУ обязательна для заполнения',
        'driver_license_issue_date.date' => 'Дата выдачи ВУ должна быть корректной датой',
        'driver_license_issue_date.before_or_equal' => 'Дата выдачи ВУ не может быть в будущем',
        
        'driver_license_expiry_date.required' => 'Дата окончания действия ВУ обязательна',
        'driver_license_expiry_date.date' => 'Дата окончания ВУ должна быть корректной датой',
        'driver_license_expiry_date.after' => 'Дата окончания ВУ должна быть позже даты выдачи',
        
        // Логин
        'login.email.required' => 'Email обязателен для заполнения',
        'login.email.email' => 'Введите корректный email адрес',
        'login.password.required' => 'Пароль обязателен для заполнения',
        
        // Смена пароля
        'current_password.required' => 'Текущий пароль обязателен для заполнения',
        'new_password.required' => 'Новый пароль обязателен для заполнения',
        'new_password.min' => 'Новый пароль должен содержать минимум :min символов',
        'new_password.confirmed' => 'Подтверждение нового пароля не совпадает',
        'new_password.different' => 'Новый пароль должен отличаться от текущего',
        
        // Восстановление пароля
        'forgot.email.required' => 'Email обязателен для заполнения',
        'forgot.email.email' => 'Введите корректный email адрес',
        
        'reset.email.required' => 'Email обязателен для заполнения',
        'reset.email.email' => 'Введите корректный email адрес',
        'reset.token.required' => 'Код подтверждения обязателен',
        'reset.password.required' => 'Новый пароль обязателен',
        'reset.password.min' => 'Пароль должен содержать минимум :min символов',
        'reset.password.confirmed' => 'Подтверждение пароля не совпадает',
    ];

    public function register(Request $request)
    {
        \Log::info('Register method called');
        \Log::info('Request data:', $request->all());
        
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
            
            \Log::info('Validation passed');
            
            $clientType = UserType::where('name', 'client')->first();
            
            if (!$clientType) {
                return response()->json(['message' => 'Тип пользователя "client" не найден в системе'], 500);
            }
            
            $user = User::create([
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'password_hash' => Hash::make($validated['password']),
                'user_type_id' => $clientType->id,
            ]);
            \Log::info('User created:', $user->toArray());
            
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
            \Log::info('Client profile created:', $clientProfile->toArray());
            
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
            \Log::error('Registration error: ' . $e->getMessage());
            return response()->json(['message' => 'Ошибка регистрации: ' . $e->getMessage()], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ], [
                'email.required' => $this->validationMessages['login.email.required'],
                'email.email' => $this->validationMessages['login.email.email'],
                'password.required' => $this->validationMessages['login.password.required'],
            ]);

            $user = User::where('email', $validated['email'])->first();

            if (!$user || !Hash::check($validated['password'], $user->password_hash)) {
                return response()->json(['message' => 'Неверный email или пароль'], 401);
            }

            if ($user->is_blocked) {
                return response()->json(['message' => 'Ваш аккаунт заблокирован. Обратитесь в поддержку'], 403);
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
            ], [
                'current_password.required' => $this->validationMessages['current_password.required'],
                'new_password.required' => $this->validationMessages['new_password.required'],
                'new_password.min' => $this->validationMessages['new_password.min'],
                'new_password.confirmed' => $this->validationMessages['new_password.confirmed'],
                'new_password.different' => $this->validationMessages['new_password.different'],
            ]);

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
            ], [
                'email.required' => $this->validationMessages['forgot.email.required'],
                'email.email' => $this->validationMessages['forgot.email.email'],
            ]);

            $user = User::where('email', $validated['email'])->first();

            if (!$user) {
                return response()->json(['message' => 'Пользователь с таким email не найден'], 404);
            }

            // TODO: Здесь должна быть реальная отправка email с кодом
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
            ], [
                'email.required' => $this->validationMessages['reset.email.required'],
                'email.email' => $this->validationMessages['reset.email.email'],
                'token.required' => $this->validationMessages['reset.token.required'],
                'password.required' => $this->validationMessages['reset.password.required'],
                'password.min' => $this->validationMessages['reset.password.min'],
                'password.confirmed' => $this->validationMessages['reset.password.confirmed'],
            ]);

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