<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VehicleController extends Controller
{
    /**
     * Нормализация госномера (замена русских букв на английские)
     */
    private function normalizeLicensePlate($plate)
    {
        if (!$plate) return $plate;
        
        $mapping = [
            'А' => 'A', 'В' => 'B', 'Е' => 'E', 'К' => 'K', 'М' => 'M',
            'Н' => 'H', 'О' => 'O', 'Р' => 'P', 'С' => 'C', 'Т' => 'T',
            'У' => 'Y', 'Х' => 'X', 'а' => 'a', 'в' => 'b', 'е' => 'e',
            'к' => 'k', 'м' => 'm', 'н' => 'h', 'о' => 'o', 'р' => 'p',
            'с' => 'c', 'т' => 't', 'у' => 'y', 'х' => 'x'
        ];
        
        $normalized = '';
        $length = mb_strlen($plate);
        for ($i = 0; $i < $length; $i++) {
            $char = mb_substr($plate, $i, 1);
            $normalized .= $mapping[$char] ?? $char;
        }
        
        return strtoupper($normalized);
    }

    /**
     * Валидация формата госномера
     */
    private function validateLicensePlateFormat($plate)
    {
        $normalized = $this->normalizeLicensePlate($plate);
        
        if (!preg_match('/^[A-Z]{1}[0-9]{3}[A-Z]{2}[0-9]{2,3}$/', $normalized)) {
            return false;
        }
        
        return true;
    }

    /**
     * Получить список автомобилей текущего клиента
     */
    public function myVehicles()
    {
        $clientProfile = Auth::user()->clientProfile;
        
        if (!$clientProfile) {
            return response()->json([]);
        }
        
        $vehicles = Vehicle::where('client_id', $clientProfile->id)->get();
        
        return response()->json($vehicles);
    }

    /**
     * Получить конкретный автомобиль
     */
    public function show($id)
    {
        $clientProfile = Auth::user()->clientProfile;
        
        $vehicle = Vehicle::where('id', $id)
            ->where('client_id', $clientProfile->id)
            ->firstOrFail();
        
        return response()->json($vehicle);
    }

    /**
     * Создать новый автомобиль
     */
    public function store(Request $request)
    {
        $clientProfile = Auth::user()->clientProfile;
        
        if (!$clientProfile) {
            return response()->json(['message' => 'Профиль клиента не найден'], 404);
        }
        
        try {
            $validated = $request->validate([
                'state_number' => 'required|string|max:20',
                'brand' => 'required|string|max:50',
                'model' => 'required|string|max:50',
                'manufacture_year' => 'nullable|integer|min:1900|max:' . date('Y'),
                'power_hp' => 'nullable|integer|min:1|max:2000',
                'category' => 'nullable|string|max:10',
                'vin' => 'nullable|string|max:17',
                'purchase_price' => 'nullable|numeric|min:0',
                'has_tracker' => 'boolean',
                'parking_type' => 'nullable|string|max:50'
            ]);
            
            if (!empty($validated['state_number'])) {
                if (!$this->validateLicensePlateFormat($validated['state_number'])) {
                    return response()->json([
                        'message' => 'Неверный формат госномера',
                        'errors' => [
                            'state_number' => ['Неверный формат госномера. Примеры: А123АА123 или A123AA123']
                        ]
                    ], 422);
                }
                $validated['state_number'] = $this->normalizeLicensePlate($validated['state_number']);
            }
            
            $vehicle = Vehicle::create([
                'client_id' => $clientProfile->id,
                'state_number' => $validated['state_number'],
                'brand' => $validated['brand'],
                'model' => $validated['model'],
                'manufacture_year' => $validated['manufacture_year'] ?? null,
                'power_hp' => $validated['power_hp'] ?? null,
                'category' => $validated['category'] ?? 'B',
                'vin' => $validated['vin'] ?? null,
                'purchase_price' => $validated['purchase_price'] ?? null,
                'has_tracker' => $validated['has_tracker'] ?? false,
                'parking_type' => $validated['parking_type'] ?? 'garage'
            ]);
            
            return response()->json([
                'message' => 'Автомобиль успешно добавлен',
                'vehicle' => $vehicle
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка при создании автомобиля: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Обновить автомобиль
     */
    public function update(Request $request, $id)
    {
        $clientProfile = Auth::user()->clientProfile;
        
        $vehicle = Vehicle::where('id', $id)
            ->where('client_id', $clientProfile->id)
            ->firstOrFail();
        
        try {
            $validated = $request->validate([
                'state_number' => 'sometimes|string|max:20',
                'brand' => 'sometimes|string|max:50',
                'model' => 'sometimes|string|max:50',
                'manufacture_year' => 'nullable|integer|min:1900|max:' . date('Y'),
                'power_hp' => 'nullable|integer|min:1|max:2000',
                'category' => 'nullable|string|max:10',
                'vin' => 'nullable|string|max:17',
                'purchase_price' => 'nullable|numeric|min:0',
                'has_tracker' => 'boolean',
                'parking_type' => 'nullable|string|max:50'
            ]);
            
            if (isset($validated['state_number'])) {
                if (!$this->validateLicensePlateFormat($validated['state_number'])) {
                    return response()->json([
                        'message' => 'Неверный формат госномера',
                        'errors' => [
                            'state_number' => ['Неверный формат госномера. Примеры: А123АА123 или A123AA123']
                        ]
                    ], 422);
                }
                $validated['state_number'] = $this->normalizeLicensePlate($validated['state_number']);
            }
            
            $vehicle->update($validated);
            
            return response()->json([
                'message' => 'Автомобиль успешно обновлён',
                'vehicle' => $vehicle
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);
        }
    }

    /**
     * Удалить автомобиль
     */
    public function destroy($id)
    {
        $clientProfile = Auth::user()->clientProfile;
        
        $vehicle = Vehicle::where('id', $id)
            ->where('client_id', $clientProfile->id)
            ->firstOrFail();
        
        if ($vehicle->policies()->whereIn('status', ['draft', 'active'])->exists()) {
            return response()->json([
                'message' => 'Невозможно удалить автомобиль, на который оформлены активные полисы'
            ], 422);
        }
        
        $vehicle->delete();
        
        return response()->json([
            'message' => 'Автомобиль успешно удалён'
        ]);
    }
}