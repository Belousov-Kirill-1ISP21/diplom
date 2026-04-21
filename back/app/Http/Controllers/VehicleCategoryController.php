<?php

namespace App\Http\Controllers;

use App\Models\VehicleCategory;
use Illuminate\Http\Request;

class VehicleCategoryController extends Controller
{
    public function index()
    {
        $categories = VehicleCategory::all();
        
        return response()->json($categories);
    }

    public function show($code)
    {
        $category = VehicleCategory::with(['vehicles', 'tariffs'])->findOrFail($code);
        
        return response()->json($category);
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:10|unique:vehicle_categories',
            'name' => 'required|string|max:50',
        ]);
        
        $category = VehicleCategory::create($request->all());
        
        return response()->json([
            'message' => 'Категория ТС успешно создана',
            'vehicle_category' => $category
        ], 201);
    }

    public function update(Request $request, $code)
    {
        $category = VehicleCategory::findOrFail($code);
        
        $request->validate([
            'name' => 'sometimes|string|max:50',
        ]);
        
        $category->update($request->all());
        
        return response()->json([
            'message' => 'Категория ТС успешно обновлена',
            'vehicle_category' => $category
        ]);
    }

    public function destroy($code)
    {
        $category = VehicleCategory::findOrFail($code);
        
        if ($category->vehicles()->exists() || $category->tariffs()->exists()) {
            return response()->json(['message' => 'Невозможно удалить категорию с существующими ТС или тарифами'], 422);
        }
        
        $category->delete();
        
        return response()->json(['message' => 'Категория ТС успешно удалена']);
    }
}