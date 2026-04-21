<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\ClientProfile;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    /**
     * Кастомные сообщения для валидации
     */
    private $validationMessages = [
        // Госномер
        'state_number.required' => 'Государственный номер обязателен для заполнения',
        'state_number.string' => 'Государственный номер должен быть строкой',
        'state_number.max' => 'Государственный номер не может превышать 15 символов',
        'state_number.unique' => 'Автомобиль с таким государственным номером уже зарегистрирован',
        'state_number.regex' => 'Неверный формат госномера. Номер должен быть в формате: А123АА124 (русские буквы А,В,Е,К,М,Н,О,Р,С,Т,У,Х, затем 3 цифры, затем 2 русские буквы, затем 3 цифры)',
        
        // Марка
        'brand.required' => 'Марка автомобиля обязательна для заполнения',
        'brand.string' => 'Марка автомобиля должна быть строкой',
        'brand.min' => 'Марка автомобиля должна содержать минимум :min символа',
        'brand.max' => 'Марка автомобиля не может превышать :max символов',
        
        // Модель
        'model.required' => 'Модель автомобиля обязательна для заполнения',
        'model.string' => 'Модель автомобиля должна быть строкой',
        'model.min' => 'Модель автомобиля должна содержать минимум :min символ',
        'model.max' => 'Модель автомобиля не может превышать :max символов',
        
        // Год выпуска
        'manufacture_year.required' => 'Год выпуска автомобиля обязателен',
        'manufacture_year.integer' => 'Год выпуска должен быть целым числом',
        'manufacture_year.min' => 'Год выпуска не может быть раньше 1900 года',
        'manufacture_year.max' => 'Год выпуска не может быть в будущем',
        
        // Мощность
        'power_hp.required' => 'Мощность двигателя обязательна для заполнения',
        'power_hp.integer' => 'Мощность двигателя должна быть целым числом',
        'power_hp.min' => 'Мощность двигателя должна быть минимум :min л.с.',
        'power_hp.max' => 'Мощность двигателя не может превышать :max л.с.',
        
        // Категория
        'category.string' => 'Категория должна быть строкой',
        'category.exists' => 'Выбранная категория транспортного средства не существует',
        
        // VIN
        'vin.required' => 'VIN номер автомобиля обязателен для заполнения',
        'vin.string' => 'VIN номер должен быть строкой',
        'vin.size' => 'VIN номер должен содержать ровно :size символов (цифры и латинские буквы, кроме I, O, Q)',
        'vin.unique' => 'Автомобиль с таким VIN номером уже зарегистрирован',
        'vin.regex' => 'VIN номер может содержать только латинские буквы (кроме I, O, Q) и цифры от 0 до 9',
        
        // Стоимость
        'purchase_price.numeric' => 'Стоимость автомобиля должна быть числом',
        'purchase_price.min' => 'Стоимость автомобиля должна быть минимум :min рублей',
        
        // Пробег
        'mileage.integer' => 'Пробег должен быть целым числом',
        'mileage.min' => 'Пробег не может быть отрицательным',
        
        // Трекер
        'has_tracker.boolean' => 'Поле наличия сигнализации должно быть true или false',
        
        // Парковка
        'parking_type.in' => 'Выберите корректный способ парковки (гараж, улица, охраняемая парковка, другое)',
    ];

    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $vehicles = Vehicle::with(['client.user', 'category'])->paginate($perPage);
        return response()->json($vehicles);
    }

    public function myVehicles(Request $request)
    {
        $user = $request->user();
        $profile = $user->clientProfile;
        
        if (!$profile) {
            return response()->json([]);
        }
        
        $vehicles = Vehicle::where('client_id', $profile->id)
            ->with('category')
            ->get();
        
        return response()->json($vehicles);
    }

    public function show($id)
    {
        $vehicle = Vehicle::with(['client.user', 'category', 'policies'])->findOrFail($id);
        
        $user = request()->user();
        if ($user->userType->name === 'client') {
            $profile = $user->clientProfile;
            if (!$profile || $vehicle->client_id !== $profile->id) {
                return response()->json(['message' => 'Доступ запрещён'], 403);
            }
        }
        
        return response()->json($vehicle);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'state_number' => [
                    'required',
                    'string',
                    'max:15',
                    'unique:vehicles',
                    'regex:/^[АВЕКМНОРСТУХ]{1}\d{3}[АВЕКМНОРСТУХ]{2}\d{3}$/iu'
                ],
                'brand' => 'required|string|min:2|max:30',
                'model' => 'required|string|min:1|max:30',
                'manufacture_year' => 'required|integer|min:1900|max:' . date('Y'),
                'power_hp' => 'required|integer|min:1|max:2000',
                'category' => 'nullable|string|exists:vehicle_categories,code',
                'vin' => [
                    'required',
                    'string',
                    'size:17',
                    'unique:vehicles',
                    'regex:/^[A-HJ-NPR-Z0-9]{17}$/i'
                ],
                'purchase_price' => 'nullable|numeric|min:10000',
                'mileage' => 'nullable|integer|min:0',
                'has_tracker' => 'boolean',
                'parking_type' => 'nullable|in:garage,street,parking_lot,other',
            ], $this->validationMessages);

            $clientId = $request->client_id;
            
            if (!$clientId && $request->user()->userType->name === 'client') {
                $profile = $request->user()->clientProfile;
                if ($profile) {
                    $clientId = $profile->id;
                }
            }
            
            if (!$clientId) {
                return response()->json(['message' => 'Требуется ID клиента'], 422);
            }

            $vehicle = Vehicle::create(array_merge(
                $validated,
                ['client_id' => $clientId]
            ));

            if ($vehicle->category && $clientId) {
                $profile = ClientProfile::find($clientId);
                if ($profile) {
                    $currentCategories = $profile->driverCategories->pluck('code')->toArray();
                    if (!in_array($vehicle->category, $currentCategories)) {
                        $currentCategories[] = $vehicle->category;
                        $profile->driverCategories()->sync($currentCategories);
                    }
                }
            }

            return response()->json([
                'message' => 'Автомобиль успешно создан',
                'vehicle' => $vehicle->load('category')
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
        $vehicle = Vehicle::findOrFail($id);
        
        $user = $request->user();
        if ($user->userType->name === 'client') {
            $profile = $user->clientProfile;
            if (!$profile || $vehicle->client_id !== $profile->id) {
                return response()->json(['message' => 'Доступ запрещён'], 403);
            }
        }
        
        try {
            $validated = $request->validate([
                'state_number' => [
                    'sometimes',
                    'string',
                    'max:15',
                    'unique:vehicles,state_number,' . $id,
                    'regex:/^[АВЕКМНОРСТУХ]{1}\d{3}[АВЕКМНОРСТУХ]{2}\d{3}$/iu'
                ],
                'brand' => 'sometimes|string|min:2|max:30',
                'model' => 'sometimes|string|min:1|max:30',
                'manufacture_year' => 'sometimes|integer|min:1900|max:' . date('Y'),
                'power_hp' => 'sometimes|integer|min:1|max:2000',
                'category' => 'nullable|string|exists:vehicle_categories,code',
                'vin' => [
                    'sometimes',
                    'string',
                    'size:17',
                    'unique:vehicles,vin,' . $id,
                    'regex:/^[A-HJ-NPR-Z0-9]{17}$/i'
                ],
                'purchase_price' => 'nullable|numeric|min:10000',
                'mileage' => 'nullable|integer|min:0',
                'has_tracker' => 'boolean',
                'parking_type' => 'nullable|in:garage,street,parking_lot,other',
            ], $this->validationMessages);

            $oldCategory = $vehicle->category;
            $vehicle->update($validated);
            
            if ($request->has('category') && $oldCategory !== $request->category) {
                $profile = ClientProfile::find($vehicle->client_id);
                if ($profile) {
                    $currentCategories = $profile->driverCategories->pluck('code')->toArray();
                    
                    $hasOtherVehiclesOfOldCategory = Vehicle::where('client_id', $vehicle->client_id)
                        ->where('category', $oldCategory)
                        ->where('id', '!=', $id)
                        ->exists();
                    
                    if (!$hasOtherVehiclesOfOldCategory && in_array($oldCategory, $currentCategories)) {
                        $currentCategories = array_values(array_diff($currentCategories, [$oldCategory]));
                    }
                    
                    if (!in_array($request->category, $currentCategories)) {
                        $currentCategories[] = $request->category;
                    }
                    
                    $profile->driverCategories()->sync($currentCategories);
                }
            }

            return response()->json([
                'message' => 'Автомобиль успешно обновлён',
                'vehicle' => $vehicle->load('category')
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации данных',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function destroy(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        
        $user = $request->user();
        if ($user->userType->name === 'client') {
            $profile = $user->clientProfile;
            if (!$profile || $vehicle->client_id !== $profile->id) {
                return response()->json(['message' => 'Доступ запрещён'], 403);
            }
        }
        
        if ($vehicle->policies()->where('status', 'active')->exists()) {
            return response()->json(['message' => 'Нельзя удалить автомобиль с активными полисами'], 422);
        }
        
        $categoryCode = $vehicle->category;
        $clientId = $vehicle->client_id;
        
        $vehicle->delete();
        
        if ($categoryCode && $clientId) {
            $profile = ClientProfile::find($clientId);
            if ($profile) {
                $hasOtherVehiclesOfCategory = Vehicle::where('client_id', $clientId)
                    ->where('category', $categoryCode)
                    ->exists();
                
                if (!$hasOtherVehiclesOfCategory) {
                    $currentCategories = $profile->driverCategories->pluck('code')->toArray();
                    $currentCategories = array_values(array_diff($currentCategories, [$categoryCode]));
                    $profile->driverCategories()->sync($currentCategories);
                }
            }
        }
        
        return response()->json(['message' => 'Автомобиль успешно удалён']);
    }
}