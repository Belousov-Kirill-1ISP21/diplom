<?php

namespace App\Http\Controllers;

use App\Models\Tariff;
use App\Models\PolicyType;
use App\Models\VehicleCategory;
use Illuminate\Http\Request;

class TariffController extends Controller
{
    // Список всех тарифов (админ)
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

    // Публичный список тарифов (без авторизации)
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

    // Показать конкретный тариф
    public function show($id)
    {
        $tariff = Tariff::with(['policyType', 'vehicleCategory'])->findOrFail($id);
        
        return response()->json($tariff);
    }

    // Создать тариф
    public function store(Request $request)
    {
        $request->validate([
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
        ]);

        // Проверка на дубликат
        $exists = Tariff::where('policy_type_id', $request->policy_type_id)
            ->where('vehicle_category', $request->vehicle_category)
            ->exists();
            
        if ($exists) {
            return response()->json(['message' => 'Tariff for this policy type and vehicle category already exists'], 422);
        }

        $tariff = Tariff::create($request->all());

        return response()->json([
            'message' => 'Tariff created successfully',
            'tariff' => $tariff->load(['policyType', 'vehicleCategory'])
        ], 201);
    }

    // Обновить тариф
    public function update(Request $request, $id)
    {
        $tariff = Tariff::findOrFail($id);
        
        $request->validate([
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
        ]);

        $tariff->update($request->all());

        return response()->json([
            'message' => 'Tariff updated successfully',
            'tariff' => $tariff->load(['policyType', 'vehicleCategory'])
        ]);
    }

    // Удалить тариф
    public function destroy($id)
    {
        $tariff = Tariff::findOrFail($id);
        
        // Проверяем, есть ли полисы с этим тарифом
        if ($tariff->policies()->exists()) {
            return response()->json(['message' => 'Cannot delete tariff with existing policies'], 422);
        }
        
        $tariff->delete();
        
        return response()->json(['message' => 'Tariff deleted successfully']);
    }
}