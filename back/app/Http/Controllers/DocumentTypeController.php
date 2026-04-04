<?php

namespace App\Http\Controllers;

use App\Models\DocumentType;
use Illuminate\Http\Request;

class DocumentTypeController extends Controller
{
    // Список всех типов документов
    public function index()
    {
        $types = DocumentType::all();
        
        return response()->json($types);
    }

    // Показать конкретный тип документа
    public function show($id)
    {
        $type = DocumentType::findOrFail($id);
        
        return response()->json($type);
    }

    // Создать тип документа (админ)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:document_types',
        ]);
        
        $type = DocumentType::create($request->all());
        
        return response()->json([
            'message' => 'Document type created successfully',
            'document_type' => $type
        ], 201);
    }

    // Обновить тип документа (админ)
    public function update(Request $request, $id)
    {
        $type = DocumentType::findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|string|max:50|unique:document_types,name,' . $id,
        ]);
        
        $type->update($request->all());
        
        return response()->json([
            'message' => 'Document type updated successfully',
            'document_type' => $type
        ]);
    }

    // Удалить тип документа (админ)
    public function destroy($id)
    {
        $type = DocumentType::findOrFail($id);
        
        // Проверяем, есть ли клиенты с этим типом документа
        if ($type->clientProfiles()->exists()) {
            return response()->json(['message' => 'Cannot delete document type with existing clients'], 422);
        }
        
        $type->delete();
        
        return response()->json(['message' => 'Document type deleted successfully']);
    }
}