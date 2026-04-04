<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\ClientProfile;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    // Список всех ТС (для агента/админа)
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $vehicles = Vehicle::with(['client.user', 'category'])->paginate($perPage);
        
        return response()->json($vehicles);
    }

    // Мои ТС (для клиента)
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

    // Показать конкретное ТС
    public function show($id)
    {
        $vehicle = Vehicle::with(['client.user', 'category', 'policies'])->findOrFail($id);
        
        // Проверка прав
        $user = request()->user();
        if ($user->userType->name === 'client') {
            $profile = $user->clientProfile;
            if (!$profile || $vehicle->client_id !== $profile->id) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        }
        
        return response()->json($vehicle);
    }

    // Создать ТС
    public function store(Request $request)
    {
        $request->validate([
            'state_number' => 'required|string|max:15|unique:vehicles',
            'brand' => 'nullable|string|max:30',
            'model' => 'nullable|string|max:30',
            'manufacture_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'power_hp' => 'nullable|integer|min:1',
            'category' => 'nullable|string|exists:vehicle_categories,code',
            'vin' => 'required|string|max:17|unique:vehicles',
            'engine_volume' => 'nullable|numeric|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'mileage' => 'nullable|integer|min:0',
            'has_tracker' => 'boolean',
            'parking_type' => 'nullable|in:garage,street,parking_lot,other',
        ]);

        // Определяем client_id
        $clientId = $request->client_id;
        
        if (!$clientId && $request->user()->userType->name === 'client') {
            $profile = $request->user()->clientProfile;
            if ($profile) {
                $clientId = $profile->id;
            }
        }
        
        if (!$clientId) {
            return response()->json(['message' => 'Client ID is required'], 422);
        }

        $vehicle = Vehicle::create(array_merge(
            $request->all(),
            ['client_id' => $clientId]
        ));

        return response()->json([
            'message' => 'Vehicle created successfully',
            'vehicle' => $vehicle->load('category')
        ], 201);
    }

    // Обновить ТС
    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        
        // Проверка прав
        $user = $request->user();
        if ($user->userType->name === 'client') {
            $profile = $user->clientProfile;
            if (!$profile || $vehicle->client_id !== $profile->id) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        }
        
        $request->validate([
            'state_number' => 'sometimes|string|max:15|unique:vehicles,state_number,' . $id,
            'brand' => 'nullable|string|max:30',
            'model' => 'nullable|string|max:30',
            'manufacture_year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'power_hp' => 'nullable|integer|min:1',
            'category' => 'nullable|string|exists:vehicle_categories,code',
            'vin' => 'sometimes|string|max:17|unique:vehicles,vin,' . $id,
            'engine_volume' => 'nullable|numeric|min:0',
            'purchase_price' => 'nullable|numeric|min:0',
            'mileage' => 'nullable|integer|min:0',
            'has_tracker' => 'boolean',
            'parking_type' => 'nullable|in:garage,street,parking_lot,other',
        ]);

        $vehicle->update($request->all());

        return response()->json([
            'message' => 'Vehicle updated successfully',
            'vehicle' => $vehicle->load('category')
        ]);
    }

    // Удалить ТС
    public function destroy(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        
        // Проверка прав
        $user = $request->user();
        if ($user->userType->name === 'client') {
            $profile = $user->clientProfile;
            if (!$profile || $vehicle->client_id !== $profile->id) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        }
        
        // Проверяем, есть ли активные полисы
        if ($vehicle->policies()->where('status', 'active')->exists()) {
            return response()->json(['message' => 'Cannot delete vehicle with active policies'], 422);
        }
        
        $vehicle->delete();
        
        return response()->json(['message' => 'Vehicle deleted successfully']);
    }
}