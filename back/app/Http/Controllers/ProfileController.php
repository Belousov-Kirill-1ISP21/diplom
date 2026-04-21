<?php

namespace App\Http\Controllers;

use App\Models\ClientProfile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Кастомные сообщения для валидации
     */
    private $validationMessages = [
        // Основные данные пользователя
        'email.email' => 'Введите корректный email адрес (например: user@example.com)',
        'email.unique' => 'Пользователь с таким email уже зарегистрирован',
        
        'phone.string' => 'Номер телефона должен быть строкой',
        'phone.regex' => 'Телефон должен быть в формате +7XXXXXXXXXX (10 цифр после +7)',
        'phone.unique' => 'Пользователь с таким номером телефона уже зарегистрирован',
        
        // ФИО
        'last_name.string' => 'Фамилия должна быть строкой',
        'last_name.max' => 'Фамилия не может превышать :max символов',
        'last_name.regex' => 'Фамилия должна начинаться с заглавной буквы и содержать только русские буквы. Допускается дефис (например: Иванов, Смирнов-Петров)',
        
        'first_name.string' => 'Имя должно быть строкой',
        'first_name.max' => 'Имя не может превышать :max символов',
        'first_name.regex' => 'Имя должно начинаться с заглавной буквы и содержать только русские буквы (например: Иван)',
        
        'middle_name.string' => 'Отчество должно быть строкой',
        'middle_name.max' => 'Отчество не может превышать :max символов',
        'middle_name.regex' => 'Отчество должно начинаться с заглавной буквы и содержать только русские буквы (например: Иванович)',
        
        // Дата рождения
        'birth_date.date' => 'Дата рождения должна быть корректной датой',
        'birth_date.before_or_equal' => 'Дата рождения не может быть в будущем',
        'birth_date.after' => 'Дата рождения должна быть позже 01.01.1900',
        
        // Паспортные данные
        'passport_series.size' => 'Серия паспорта должна содержать ровно :size цифры',
        'passport_series.regex' => 'Серия паспорта должна содержать только цифры (4 цифры)',
        
        'passport_number.size' => 'Номер паспорта должен содержать ровно :size цифр',
        'passport_number.regex' => 'Номер паспорта должен содержать только цифры (6 цифр)',
        
        'passport_issued_by.string' => 'Название органа выдачи должно быть строкой',
        'passport_issued_by.min' => 'Название органа выдачи должно содержать минимум :min символов',
        'passport_issued_by.max' => 'Название органа выдачи не может превышать :max символов',
        
        'passport_issue_date.date' => 'Дата выдачи паспорта должна быть корректной датой',
        'passport_issue_date.before_or_equal' => 'Дата выдачи паспорта не может быть в будущем',
        'passport_issue_date.after' => 'Дата выдачи паспорта должна быть позже 31.12.1990',
        
        'passport_expiry_date.date' => 'Дата окончания паспорта должна быть корректной датой',
        'passport_expiry_date.after' => 'Дата окончания паспорта должна быть позже даты выдачи',
        
        // Водительское удостоверение
        'driver_license_series.size' => 'Серия ВУ должна содержать ровно :size цифры',
        'driver_license_series.regex' => 'Серия ВУ должна содержать только цифры (4 цифры)',
        
        'driver_license_number.size' => 'Номер ВУ должен содержать ровно :size цифр',
        'driver_license_number.regex' => 'Номер ВУ должен содержать только цифры (6 цифр)',
        
        'driver_license_issued_by.string' => 'Название органа выдачи ВУ должно быть строкой',
        'driver_license_issued_by.min' => 'Название органа выдачи ВУ должно содержать минимум :min символов',
        'driver_license_issued_by.max' => 'Название органа выдачи ВУ не может превышать :max символов',
        
        'driver_license_issue_date.date' => 'Дата выдачи ВУ должна быть корректной датой',
        'driver_license_issue_date.before_or_equal' => 'Дата выдачи ВУ не может быть в будущем',
        
        'driver_license_expiry_date.date' => 'Дата окончания ВУ должна быть корректной датой',
        'driver_license_expiry_date.after' => 'Дата окончания ВУ должна быть позже даты выдачи',
        
        // Водительский стаж
        'driver_experience_years.integer' => 'Стаж вождения должен быть целым числом',
        'driver_experience_years.min' => 'Стаж вождения не может быть отрицательным',
        'driver_experience_years.max' => 'Стаж вождения не может превышать :max лет',
        
        // Бонус-малус
        'bonus_malus_class.string' => 'Класс бонус-малус должен быть строкой',
        'bonus_malus_class.max' => 'Класс бонус-малус не может превышать :max символов',
        
        // Аварии
        'has_accidents_last_year.boolean' => 'Значение поля "были ли аварии" должно быть true или false',
    ];

    public function show(Request $request)
    {
        $user = $request->user();
        $profile = $user->clientProfile()->with(['driverCategories'])->first();
        
        return response()->json([
            'user' => $user,
            'profile' => $profile
        ]);
    }

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
                'passport_expiry_date' => 'nullable|date|after:passport_issue_date',
                'driver_license_series' => 'nullable|string|size:4|regex:/^\d{4}$/',
                'driver_license_number' => 'nullable|string|size:6|regex:/^\d{6}$/',
                'driver_license_issued_by' => 'nullable|string|min:10|max:200',
                'driver_license_issue_date' => 'nullable|date|before_or_equal:today',
                'driver_license_expiry_date' => 'nullable|date|after:driver_license_issue_date',
                'driver_experience_years' => 'nullable|integer|min:0|max:70',
                'bonus_malus_class' => 'nullable|string|max:10',
                'has_accidents_last_year' => 'nullable|boolean',
            ], $this->validationMessages);

            // Обновляем данные пользователя
            if ($request->has('email')) {
                $user->update(['email' => $validated['email']]);
            }
            
            if ($request->has('phone')) {
                $user->update(['phone' => $validated['phone']]);
            }

            // Обновляем или создаём профиль
            $profileData = $request->only([
                'last_name', 'first_name', 'middle_name', 'birth_date',
                'passport_series', 'passport_number', 'passport_issued_by', 
                'passport_issue_date', 'passport_expiry_date',
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
                'message' => 'Профиль успешно обновлён',
                'profile' => $profile->load(['driverCategories'])
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации данных',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Profile update error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Произошла ошибка при обновлении профиля'
            ], 500);
        }
    }
}