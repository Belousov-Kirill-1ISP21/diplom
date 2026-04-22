<?php

namespace App\Http\Controllers;

use App\Models\ClientProfile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    private $validationMessages = [
        'email.email' => 'Введите корректный email адрес',
        'email.unique' => 'Пользователь с таким email уже зарегистрирован',
        'phone.regex' => 'Телефон должен быть в формате +7XXXXXXXXXX',
        'phone.unique' => 'Пользователь с таким номером телефона уже зарегистрирован',
        'last_name.regex' => 'Фамилия должна содержать только русские буквы',
        'first_name.regex' => 'Имя должно содержать только русские буквы',
        'middle_name.regex' => 'Отчество должно содержать только русские буквы',
        'birth_date.before_or_equal' => 'Дата рождения не может быть в будущем',
        'passport_series.size' => 'Серия паспорта должна содержать 4 цифры',
        'passport_number.size' => 'Номер паспорта должен содержать 6 цифр',
        'passport_issue_date.after' => 'Дата выдачи паспорта должна быть позже 31.12.1990',
        'driver_license_series.size' => 'Серия ВУ должна содержать 4 цифры',
        'driver_license_number.size' => 'Номер ВУ должен содержать 6 цифр',
        'driver_license_issue_date.before_or_equal' => 'Дата выдачи ВУ не может быть в будущем',
        'driver_license_expiry_date.after' => 'Дата окончания ВУ должна быть позже даты выдачи',
        'driver_experience_years.max' => 'Стаж не может превышать :max лет',
    ];

    public function update(Request $request)
    {
        try {
            $user = $request->user();
            $profile = $user->clientProfile;

            $validated = $request->validate([
                'email' => 'sometimes|email|unique:users,email,' . $user->id,
                'phone' => 'sometimes|string|regex:/^\+7\d{10}$/|unique:users,phone,' . $user->id,
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
                'driver_experience_years' => 'nullable|integer|min:0|max:70',
                'bonus_malus_class' => 'nullable|string|max:10',
                'has_accidents_last_year' => 'nullable|boolean',
            ], $this->validationMessages);

            if ($request->has('email')) {
                $user->update(['email' => $validated['email']]);
            }
            
            if ($request->has('phone')) {
                $user->update(['phone' => $validated['phone']]);
            }

            $profileData = $request->only([
                'last_name', 'first_name', 'middle_name', 'birth_date',
                'passport_series', 'passport_number', 'passport_issued_by', 
                'passport_issue_date',
                'driver_license_series', 'driver_license_number', 'driver_license_issued_by',
                'driver_license_issue_date', 'driver_license_expiry_date',
                'driver_experience_years', 'bonus_malus_class', 'has_accidents_last_year'
            ]);

            if ($profile) {
                $profile->update($profileData);
            } else {
                $profile = ClientProfile::create(array_merge(
                    $profileData,
                    ['user_id' => $user->id]
                ));
            }

            return response()->json([
                'message' => 'Профиль обновлён',
                'profile' => $profile->load(['driverCategories'])
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Ошибка обновления профиля'], 500);
        }
    }
}