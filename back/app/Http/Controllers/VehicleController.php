<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\ClientProfile;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    private $validationMessages = [
        'state_number.required' => 'Госномер обязателен',
        'state_number.unique' => 'Автомобиль с таким госномером уже зарегистрирован',
        'state_number.regex' => 'Неверный формат госномера. Пример: А123АА124',
        'brand.required' => 'Марка обязательна',
        'brand.min' => 'Марка должна содержать минимум :min символа',
        'brand.max' => 'Марка не может превышать :max символов',
        'model.required' => 'Модель обязательна',
        'model.min' => 'Модель должна содержать минимум :min символ',
        'model.max' => 'Модель не может превышать :max символов',
        'manufacture_year.required' => 'Год выпуска обязателен',
        'manufacture_year.min' => 'Год выпуска не может быть раньше 1900',
        'manufacture_year.max' => 'Год выпуска не может быть в будущем',
        'power_hp.required' => 'Мощность обязательна',
        'power_hp.min' => 'Мощность должна быть минимум :min л.с.',
        'power_hp.max' => 'Мощность не может превышать :max л.с.',
        'vin.required' => 'VIN обязателен',
        'vin.size' => 'VIN должен содержать ровно :size символов',
        'vin.unique' => 'Автомобиль с таким VIN уже зарегистрирован',
        'vin.regex' => 'VIN может содержать только латинские буквы и цифры',
        'purchase_price.min' => 'Стоимость должна быть минимум :min рублей',
    ];

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
                'message' => 'Автомобиль создан',
                'vehicle' => $vehicle->load('category')
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации',
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
        
        return response()->json(['message' => 'Автомобиль удалён']);
    }
}