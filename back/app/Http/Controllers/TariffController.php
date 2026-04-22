<?php

namespace App\Http\Controllers;

use App\Models\Tariff;
use Illuminate\Http\Request;

class TariffController extends Controller
{
    private $validationMessages = [
        'policy_type_id.required' => 'Тип полиса обязателен',
        'policy_type_id.exists' => 'Тип полиса не найден',
        'vehicle_category.required' => 'Категория ТС обязательна',
        'vehicle_category.exists' => 'Категория ТС не найдена',
        'base_rate.required' => 'Базовая ставка обязательна',
        'base_rate.numeric' => 'Базовая ставка должна быть числом',
        'base_rate.min' => 'Базовая ставка не может быть отрицательной',
        'min_rate.required' => 'Минимальная ставка обязательна',
        'min_rate.numeric' => 'Минимальная ставка должна быть числом',
        'min_rate.min' => 'Минимальная ставка не может быть отрицательной',
        'max_rate.required' => 'Максимальная ставка обязательна',
        'max_rate.numeric' => 'Максимальная ставка должна быть числом',
        'max_rate.min' => 'Максимальная ставка не может быть отрицательной',
        'max_rate.gte' => 'Максимальная ставка должна быть больше или равна минимальной',
        'calculation_method.required' => 'Метод расчёта обязателен',
        'calculation_method.in' => 'Метод расчёта должен быть basic или coefficient',
    ];

    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $policyTypeId = $request->get('policy_type_id');
        $vehicleCategory = $request->get('vehicle_category');
        
        $query = Tariff::with(['policyType', 'vehicleCategory']);
        
        if ($policyTypeId) {
            $query->where('policy_type_id', $policyTypeId);
        }
        
        if ($vehicleCategory) {
            $query->where('vehicle_category', $vehicleCategory);
        }
        
        $tariffs = $query->paginate($perPage);
        
        return response()->json($tariffs);
    }

    public function publicIndex(Request $request)
    {
        $policyTypeId = $request->get('policy_type_id');
        
        $query = Tariff::with(['policyType', 'vehicleCategory']);
        
        if ($policyTypeId) {
            $query->where('policy_type_id', $policyTypeId);
        }
        
        $tariffs = $query->get();
        
        return response()->json($tariffs);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'policy_type_id' => 'required|exists:policy_types,id',
                'vehicle_category' => 'required|exists:vehicle_categories,code',
                'base_rate' => 'required|numeric|min:0',
                'min_rate' => 'required|numeric|min:0',
                'max_rate' => 'required|numeric|min:0|gte:min_rate',
                'calculation_method' => 'required|string|in:basic,coefficient',
            ], $this->validationMessages);

            $exists = Tariff::where('policy_type_id', $validated['policy_type_id'])
                ->where('vehicle_category', $validated['vehicle_category'])
                ->exists();
                
            if ($exists) {
                return response()->json(['message' => 'Тариф для этого типа и категории уже существует'], 422);
            }

            $tariff = Tariff::create($validated);

            return response()->json([
                'message' => 'Тариф создан',
                'tariff' => $tariff->load(['policyType', 'vehicleCategory'])
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $tariff = Tariff::findOrFail($id);
            
            $validated = $request->validate([
                'base_rate' => 'sometimes|numeric|min:0',
                'min_rate' => 'sometimes|numeric|min:0',
                'max_rate' => 'sometimes|numeric|min:0|gte:min_rate',
                'calculation_method' => 'sometimes|string|in:basic,coefficient',
            ], $this->validationMessages);

            $tariff->update($validated);

            return response()->json([
                'message' => 'Тариф обновлён',
                'tariff' => $tariff->load(['policyType', 'vehicleCategory'])
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function destroy($id)
    {
        $tariff = Tariff::findOrFail($id);
        
        if ($tariff->policies()->exists()) {
            return response()->json(['message' => 'Нельзя удалить тариф, есть связанные полисы'], 422);
        }
        
        $tariff->delete();
        
        return response()->json(['message' => 'Тариф удалён']);
    }
}