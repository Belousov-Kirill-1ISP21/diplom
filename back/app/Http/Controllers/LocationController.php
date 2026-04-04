<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    // Список всех локаций
    public function index(Request $request)
    {
        $regionCode = $request->get('region_code');
        $cityName = $request->get('city_name');
        
        $query = Location::query();
        
        if ($regionCode) {
            $query->where('region_code', $regionCode);
        }
        
        if ($cityName) {
            $query->where('city_name', 'like', "%{$cityName}%");
        }
        
        $locations = $query->orderBy('region_name')->orderBy('city_name')->get();
        
        return response()->json($locations);
    }

    // Показать конкретную локацию
    public function show($id)
    {
        $location = Location::findOrFail($id);
        
        return response()->json($location);
    }

    // Создать локацию (админ)
    public function store(Request $request)
    {
        $request->validate([
            'citizenship_name' => 'required|string|max:100',
            'region_name' => 'required|string|max:100',
            'city_name' => 'required|string|max:100',
            'region_code' => 'nullable|string|max:10',
        ]);
        
        $location = Location::create($request->all());
        
        return response()->json([
            'message' => 'Location created successfully',
            'location' => $location
        ], 201);
    }

    // Обновить локацию (админ)
    public function update(Request $request, $id)
    {
        $location = Location::findOrFail($id);
        
        $request->validate([
            'citizenship_name' => 'sometimes|string|max:100',
            'region_name' => 'sometimes|string|max:100',
            'city_name' => 'sometimes|string|max:100',
            'region_code' => 'nullable|string|max:10',
        ]);
        
        $location->update($request->all());
        
        return response()->json([
            'message' => 'Location updated successfully',
            'location' => $location
        ]);
    }

    // Удалить локацию (админ)
    public function destroy($id)
    {
        $location = Location::findOrFail($id);
        
        // Проверяем, есть ли клиенты с этой локацией
        if ($location->clientProfiles()->exists()) {
            return response()->json(['message' => 'Cannot delete location with existing clients'], 422);
        }
        
        $location->delete();
        
        return response()->json(['message' => 'Location deleted successfully']);
    }
}