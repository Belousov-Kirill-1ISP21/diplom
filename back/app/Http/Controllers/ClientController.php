<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ClientProfile;
use App\Models\UserType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ClientController extends Controller
{
    private $validationMessages = [
        'email.required' => 'Email обязателен для заполнения',
        'email.email' => 'Введите корректный email адрес',
        'email.unique' => 'Пользователь с таким email уже зарегистрирован',
        'phone.required' => 'Номер телефона обязателен',
        'phone.regex' => 'Телефон должен быть в формате +7XXXXXXXXXX',
        'phone.unique' => 'Пользователь с таким номером телефона уже зарегистрирован',
        'password.required' => 'Пароль обязателен',
        'password.min' => 'Пароль должен содержать минимум :min символов',
        'last_name.required' => 'Фамилия обязательна',
        'last_name.regex' => 'Фамилия должна содержать только русские буквы',
        'first_name.required' => 'Имя обязательно',
        'first_name.regex' => 'Имя должно содержать только русские буквы',
        'middle_name.regex' => 'Отчество должно содержать только русские буквы',
        'birth_date.before_or_equal' => 'Дата рождения не может быть в будущем',
        'passport_series.size' => 'Серия паспорта должна содержать 4 цифры',
        'passport_number.size' => 'Номер паспорта должен содержать 6 цифр',
        'passport_issued_by.min' => 'Название органа выдачи слишком короткое',
        'passport_issue_date.after' => 'Дата выдачи паспорта должна быть позже 31.12.1990',
        'driver_license_series.size' => 'Серия ВУ должна содержать 4 цифры',
        'driver_license_number.size' => 'Номер ВУ должен содержать 6 цифр',
        'driver_license_issue_date.before_or_equal' => 'Дата выдачи ВУ не может быть в будущем',
        'driver_license_expiry_date.after' => 'Дата окончания ВУ должна быть позже даты выдачи',
    ];

    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');
        
        $query = User::whereHas('userType', function($q) {
            $q->where('name', 'client');
        })->with(['clientProfile', 'clientProfile.driverCategories']);
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhereHas('clientProfile', function($sub) use ($search) {
                      $sub->where('last_name', 'like', "%{$search}%")
                          ->orWhere('first_name', 'like', "%{$search}%");
                  });
            });
        }
        
        $clients = $query->paginate($perPage);
        
        return response()->json($clients);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email|unique:users',
                'phone' => 'required|string|regex:/^\+7\d{10}$/|unique:users',
                'password' => 'required|min:6',
                'last_name' => 'required|string|max:30|regex:/^[А-ЯЁ][а-яё]+(-[А-ЯЁ][а-яё]+)?$/u',
                'first_name' => 'required|string|max:30|regex:/^[А-ЯЁ][а-яё]+$/u',
                'middle_name' => 'nullable|string|max:30|regex:/^[А-ЯЁ][а-яё]+$/u',
                'birth_date' => 'nullable|date|before_or_equal:today|after:1900-01-01',
                'passport_series' => 'nullable|string|size:4|regex:/^\d{4}$/',
                'passport_number' => 'nullable|string|size:6|regex:/^\d{6}$/',
                'passport_issued_by' => 'nullable|string|min:10|max:200',
                'passport_issue_date' => 'nullable|date|before_or_equal:today|after:1990-12-31',
                'driver_license_series' => 'nullable|string|size:4|regex:/^\d{4}$/',
                'driver_license_number' => 'nullable|string|size:6|regex:/^\d{6}$/',
                'driver_license_issued_by' => 'nullable|string|min:10|max:200',
                'driver_license_issue_date' => 'nullable|date|before_or_equal:today',
                'driver_license_expiry_date' => 'nullable|date|after:driver_license_issue_date',
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

            ClientProfile::create([
                'user_id' => $user->id,
                'last_name' => $validated['last_name'],
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'birth_date' => $validated['birth_date'] ?? null,
                'passport_series' => $validated['passport_series'] ?? null,
                'passport_number' => $validated['passport_number'] ?? null,
                'passport_issued_by' => $validated['passport_issued_by'] ?? null,
                'passport_issue_date' => $validated['passport_issue_date'] ?? null,
                'driver_license_series' => $validated['driver_license_series'] ?? null,
                'driver_license_number' => $validated['driver_license_number'] ?? null,
                'driver_license_issued_by' => $validated['driver_license_issued_by'] ?? null,
                'driver_license_issue_date' => $validated['driver_license_issue_date'] ?? null,
                'driver_license_expiry_date' => $validated['driver_license_expiry_date'] ?? null,
            ]);

            return response()->json([
                'message' => 'Клиент успешно создан',
                'client' => $user->load(['clientProfile', 'clientProfile.driverCategories'])
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
            $client = User::findOrFail($id);
            
            $validated = $request->validate([
                'email' => 'sometimes|email|unique:users,email,' . $id,
                'phone' => 'sometimes|string|regex:/^\+7\d{10}$/|unique:users,phone,' . $id,
                'last_name' => 'sometimes|string|max:30|regex:/^[А-ЯЁ][а-яё]+(-[А-ЯЁ][а-яё]+)?$/u',
                'first_name' => 'sometimes|string|max:30|regex:/^[А-ЯЁ][а-яё]+$/u',
                'middle_name' => 'nullable|string|max:30|regex:/^[А-ЯЁ][а-яё]+$/u',
                'birth_date' => 'nullable|date|before_or_equal:today|after:1900-01-01',
                'passport_series' => 'nullable|string|size:4|regex:/^\d{4}$/',
                'passport_number' => 'nullable|string|size:6|regex:/^\d{6}$/',
                'passport_issued_by' => 'nullable|string|min:10|max:200',
                'passport_issue_date' => 'nullable|date|before_or_equal:today|after:1990-12-31',
                'driver_license_series' => 'nullable|string|size:4|regex:/^\d{4}$/',
                'driver_license_number' => 'nullable|string|size:6|regex:/^\d{6}$/',
                'driver_license_issued_by' => 'nullable|string|min:10|max:200',
                'driver_license_issue_date' => 'nullable|date|before_or_equal:today',
                'driver_license_expiry_date' => 'nullable|date|after:driver_license_issue_date',
            ], $this->validationMessages);

            $client->update($request->only(['email', 'phone']));

            if ($client->clientProfile) {
                $client->clientProfile->update($request->only([
                    'last_name', 'first_name', 'middle_name', 'birth_date',
                    'passport_series', 'passport_number', 'passport_issued_by', 'passport_issue_date',
                    'driver_license_series', 'driver_license_number', 'driver_license_issued_by',
                    'driver_license_issue_date', 'driver_license_expiry_date'
                ]));
            }

            return response()->json([
                'message' => 'Клиент успешно обновлён',
                'client' => $client->load(['clientProfile', 'clientProfile.driverCategories'])
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
        $client = User::findOrFail($id);
        
        if ($client->userType->name !== 'client') {
            return response()->json(['message' => 'Пользователь не является клиентом'], 422);
        }
        
        $profile = $client->clientProfile;
        
        if ($profile) {
            if ($profile->policies()->where('status', 'active')->exists()) {
                return response()->json(['message' => 'Нельзя удалить клиента с активными полисами'], 422);
            }
            
            $profile->driverCategories()->detach();
            $profile->vehicles()->delete();
            $profile->policies()->delete();
            $profile->accidents()->delete();
            $profile->delete();
        }
        
        $client->delete();
        
        return response()->json(['message' => 'Клиент успешно удалён']);
    }
}