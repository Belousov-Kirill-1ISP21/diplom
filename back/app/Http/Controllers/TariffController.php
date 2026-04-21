<?php

namespace App\Http\Controllers;

use App\Models\Tariff;
use App\Models\PolicyType;
use App\Models\VehicleCategory;
use Illuminate\Http\Request;

class TariffController extends Controller
{
    /**
     * Кастомные сообщения для валидации
     */
    private $validationMessages = [
        // Policy type
        'policy_type_id.required' => 'Тип полиса обязателен для заполнения',
        'policy_type_id.exists' => 'Выбранный тип полиса не существует',
        
        // Vehicle category
        'vehicle_category.required' => 'Категория транспортного средства обязательна для заполнения',
        'vehicle_category.exists' => 'Выбранная категория ТС не существует',
        
        // Rates
        'base_rate.required' => 'Базовая ставка обязательна для заполнения',
        'base_rate.numeric' => 'Базовая ставка должна быть числом',
        'base_rate.min' => 'Базовая ставка не может быть отрицательной',
        
        'min_rate.required' => 'Минимальная ставка обязательна для заполнения',
        'min_rate.numeric' => 'Минимальная ставка должна быть числом',
        'min_rate.min' => 'Минимальная ставка не может быть отрицательной',
        
        'max_rate.required' => 'Максимальная ставка обязательна для заполнения',
        'max_rate.numeric' => 'Максимальная ставка должна быть числом',
        'max_rate.min' => 'Максимальная ставка не может быть отрицательной',
        'max_rate.gte' => 'Максимальная ставка должна быть больше или равна минимальной ставке',
        
        // Coefficients
        'power_coefficient.numeric' => 'Коэффициент мощности должен быть числом',
        'power_coefficient.min' => 'Коэффициент мощности не может быть отрицательным',
        
        'experience_coefficient.numeric' => 'Коэффициент стажа должен быть числом',
        'experience_coefficient.min' => 'Коэффициент стажа не может быть отрицательным',
        
        'age_coefficient.numeric' => 'Возрастной коэффициент должен быть числом',
        'age_coefficient.min' => 'Возрастной коэффициент не может быть отрицательным',
        
        'bonus_malus_coefficient.numeric' => 'Коэффициент бонус-малус должен быть числом',
        'bonus_malus_coefficient.min' => 'Коэффициент бонус-малус не может быть отрицательным',
        
        'region_coefficient.numeric' => 'Региональный коэффициент должен быть числом',
        'region_coefficient.min' => 'Региональный коэффициент не может быть отрицательным',
        
        'vehicle_age_coefficient.numeric' => 'Коэффициент возраста ТС должен быть числом',
        'vehicle_age_coefficient.min' => 'Коэффициент возраста ТС не может быть отрицательным',
        
        'security_coefficient.numeric' => 'Коэффициент безопасности должен быть числом',
        'security_coefficient.min' => 'Коэффициент безопасности не может быть отрицательным',
        
        'franchise_coefficient.numeric' => 'Коэффициент франшизы должен быть числом',
        'franchise_coefficient.min' => 'Коэффициент франшизы не может быть отрицательным',
        
        // Calculation method
        'calculation_method.required' => 'Метод расчёта обязателен для заполнения',
        'calculation_method.string' => 'Метод расчёта должен быть строкой',
        'calculation_method.in' => 'Метод расчёта должен быть одним из: basic (базовый) или coefficient (коэффициентный)',
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

    public function show($id)
    {
        $tariff = Tariff::with(['policyType', 'vehicleCategory'])->findOrFail($id);
        
        return response()->json($tariff);
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
                'power_coefficient' => 'sometimes|numeric|min:0',
                'experience_coefficient' => 'sometimes|numeric|min:0',
                'age_coefficient' => 'sometimes|numeric|min:0',
                'bonus_malus_coefficient' => 'sometimes|numeric|min:0',
                'region_coefficient' => 'sometimes|numeric|min:0',
                'vehicle_age_coefficient' => 'sometimes|numeric|min:0',
                'security_coefficient' => 'sometimes|numeric|min:0',
                'franchise_coefficient' => 'sometimes|numeric|min:0',
                'calculation_method' => 'required|string|in:basic,coefficient',
            ], $this->validationMessages);

            $exists = Tariff::where('policy_type_id', $validated['policy_type_id'])
                ->where('vehicle_category', $validated['vehicle_category'])
                ->exists();
                
            if ($exists) {
                return response()->json([
                    'message' => 'Тариф для данного типа полиса и категории ТС уже существует'
                ], 422);
            }

            $tariff = Tariff::create($validated);

            return response()->json([
                'message' => 'Тариф успешно создан',
                'tariff' => $tariff->load(['policyType', 'vehicleCategory'])
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
            $tariff = Tariff::findOrFail($id);
            
            $validated = $request->validate([
                'base_rate' => 'sometimes|numeric|min:0',
                'min_rate' => 'sometimes|numeric|min:0',
                'max_rate' => 'sometimes|numeric|min:0|gte:min_rate',
                'power_coefficient' => 'sometimes|numeric|min:0',
                'experience_coefficient' => 'sometimes|numeric|min:0',
                'age_coefficient' => 'sometimes|numeric|min:0',
                'bonus_malus_coefficient' => 'sometimes|numeric|min:0',
                'region_coefficient' => 'sometimes|numeric|min:0',
                'vehicle_age_coefficient' => 'sometimes|numeric|min:0',
                'security_coefficient' => 'sometimes|numeric|min:0',
                'franchise_coefficient' => 'sometimes|numeric|min:0',
                'calculation_method' => 'sometimes|string|in:basic,coefficient',
            ], $this->validationMessages);

            $tariff->update($validated);

            return response()->json([
                'message' => 'Тариф успешно обновлён',
                'tariff' => $tariff->load(['policyType', 'vehicleCategory'])
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
        $tariff = Tariff::findOrFail($id);
        
        if ($tariff->policies()->exists()) {
            return response()->json([
                'message' => 'Невозможно удалить тариф, так как существуют связанные с ним полисы. Сначала удалите или измените эти полисы.'
            ], 422);
        }
        
        $tariff->delete();
        
        return response()->json(['message' => 'Тариф успешно удалён']);
    }
}