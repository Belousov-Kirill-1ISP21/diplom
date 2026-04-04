<?php

namespace App\Http\Controllers;

use App\Models\PolicyType;
use Illuminate\Http\Request;

class PolicyTypeController extends Controller
{
    // Список всех типов полисов
    public function index()
    {
        $types = PolicyType::all();
        
        return response()->json($types);
    }

    // Показать конкретный тип полиса
    public function show($id)
    {
        $type = PolicyType::with(['tariffs'])->findOrFail($id);
        
        return response()->json($type);
    }

    // Создать тип полиса (админ)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:policy_types',
        ]);
        
        $type = PolicyType::create($request->all());
        
        return response()->json([
            'message' => 'Policy type created successfully',
            'policy_type' => $type
        ], 201);
    }

    // Обновить тип полиса (админ)
    public function update(Request $request, $id)
    {
        $type = PolicyType::findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|string|max:50|unique:policy_types,name,' . $id,
        ]);
        
        $type->update($request->all());
        
        return response()->json([
            'message' => 'Policy type updated successfully',
            'policy_type' => $type
        ]);
    }

    // Удалить тип полиса (админ)
    public function destroy($id)
    {
        $type = PolicyType::findOrFail($id);
        
        // Проверяем, есть ли тарифы и полисы этого типа
        if ($type->tariffs()->exists() || $type->policies()->exists()) {
            return response()->json(['message' => 'Cannot delete policy type with existing tariffs or policies'], 422);
        }
        
        $type->delete();
        
        return response()->json(['message' => 'Policy type deleted successfully']);
    }
}