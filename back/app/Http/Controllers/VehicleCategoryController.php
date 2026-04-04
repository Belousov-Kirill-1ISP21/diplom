<?php

namespace App\Http\Controllers;

use App\Models\VehicleCategory;
use Illuminate\Http\Request;

class VehicleCategoryController extends Controller
{
    // Список всех категорий ТС
    public function index()
    {
        $categories = VehicleCategory::all();
        
        return response()->json($categories);
    }

    // Показать конкретную категорию
    public function show($code)
    {
        $category = VehicleCategory::with(['vehicles', 'tariffs'])->findOrFail($code);
        
        return response()->json($category);
    }

    // Создать категорию ТС (админ)
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:10|unique:vehicle_categories',
            'name' => 'required|string|max:50',
        ]);
        
        $category = VehicleCategory::create($request->all());
        
        return response()->json([
            'message' => 'Vehicle category created successfully',
            'vehicle_category' => $category
        ], 201);
    }

    // Обновить категорию ТС (админ)
    public function update(Request $request, $code)
    {
        $category = VehicleCategory::findOrFail($code);
        
        $request->validate([
            'name' => 'sometimes|string|max:50',
        ]);
        
        $category->update($request->all());
        
        return response()->json([
            'message' => 'Vehicle category updated successfully',
            'vehicle_category' => $category
        ]);
    }

    // Удалить категорию ТС (админ)
    public function destroy($code)
    {
        $category = VehicleCategory::findOrFail($code);
        
        // Проверяем, есть ли ТС или тарифы этой категории
        if ($category->vehicles()->exists() || $category->tariffs()->exists()) {
            return response()->json(['message' => 'Cannot delete category with existing vehicles or tariffs'], 422);
        }
        
        $category->delete();
        
        return response()->json(['message' => 'Vehicle category deleted successfully']);
    }
}