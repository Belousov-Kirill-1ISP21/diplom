<?php

namespace App\Http\Controllers;

use App\Models\PolicyType;
use Illuminate\Http\Request;

class PolicyTypeController extends Controller
{
    public function index()
    {
        $types = PolicyType::all();
        
        return response()->json($types);
    }

    public function show($id)
    {
        $type = PolicyType::with(['tariffs'])->findOrFail($id);
        
        return response()->json($type);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:policy_types',
        ]);
        
        $type = PolicyType::create($request->all());
        
        return response()->json([
            'message' => 'Тип полиса успешно создан',
            'policy_type' => $type
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $type = PolicyType::findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|string|max:50|unique:policy_types,name,' . $id,
        ]);
        
        $type->update($request->all());
        
        return response()->json([
            'message' => 'Тип полиса успешно обновлён',
            'policy_type' => $type
        ]);
    }

    public function destroy($id)
    {
        $type = PolicyType::findOrFail($id);
        
        if ($type->tariffs()->exists() || $type->policies()->exists()) {
            return response()->json(['message' => 'Невозможно удалить тип полиса, так как существуют связанные тарифы или полисы'], 422);
        }
        
        $type->delete();
        
        return response()->json(['message' => 'Тип полиса успешно удалён']);
    }
}