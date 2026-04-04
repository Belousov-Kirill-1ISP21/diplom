<?php

namespace App\Http\Controllers;

use App\Models\Accident;
use App\Models\Policy;
use App\Models\ClientProfile;
use Illuminate\Http\Request;

class AccidentController extends Controller
{
    // Список всех страховых случаев (агент/админ)
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $clientId = $request->get('client_id');
        $policyId = $request->get('policy_id');
        
        $query = Accident::with(['client.user', 'policy']);
        
        if ($clientId) {
            $query->where('client_id', $clientId);
        }
        
        if ($policyId) {
            $query->where('policy_id', $policyId);
        }
        
        $accidents = $query->orderBy('accident_date', 'desc')->paginate($perPage);
        
        return response()->json($accidents);
    }

    // Мои страховые случаи (клиент)
    public function myAccidents(Request $request)
    {
        $user = $request->user();
        $profile = $user->clientProfile;
        
        if (!$profile) {
            return response()->json([]);
        }
        
        $accidents = Accident::where('client_id', $profile->id)
            ->with(['policy'])
            ->orderBy('accident_date', 'desc')
            ->get();
        
        return response()->json($accidents);
    }

    // Показать конкретный страховой случай
    public function show($id)
    {
        $accident = Accident::with(['client.user', 'policy'])->findOrFail($id);
        
        $user = request()->user();
        if ($user->userType->name === 'client') {
            $profile = $user->clientProfile;
            if (!$profile || $accident->client_id !== $profile->id) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        }
        
        return response()->json($accident);
    }

    // Создать страховой случай (клиент)
    public function store(Request $request, $policyId)
{
    \Log::info('=== ACCIDENT STORE DEBUG ===');
    \Log::info('user_id: ' . $request->user()->id);
    \Log::info('policy_id: ' . $policyId);
    
    $profile = ClientProfile::where('user_id', $request->user()->id)->first();
    \Log::info('profile found: ' . ($profile ? $profile->id : 'null'));

    $user = $request->user();

    \Log::info('DEBUG: user_id = ' . $user->id);
    \Log::info('DEBUG: user_email = ' . $user->email);
    
    $profile = ClientProfile::where('user_id', $user->id)->first();
    \Log::info('DEBUG: profile = ' . ($profile ? $profile->id : 'null'));
    
    // ВРЕМЕННОЕ РЕШЕНИЕ - напрямую через Query Builder
    $profile = \App\Models\ClientProfile::where('user_id', $user->id)->first();
    
    if (!$profile) {
        return response()->json(['message' => 'Client profile not found'], 404);
    }
    
    $policy = Policy::where('id', $policyId)
        ->where('client_id', $profile->id)
        ->where('status', 'active')
        ->first();
        
    if (!$policy) {
        return response()->json(['message' => 'Active policy not found'], 404);
    }
    
    $request->validate([
        'accident_date' => 'required|date|before_or_equal:today',
        'damage_amount' => 'nullable|numeric|min:0',
        'is_client_fault' => 'required|boolean',
        'description' => 'nullable|string',
    ]);
    
    $accident = Accident::create([
        'client_id' => $profile->id,
        'policy_id' => $policyId,
        'accident_date' => $request->accident_date,
        'damage_amount' => $request->damage_amount,
        'is_client_fault' => $request->is_client_fault,
        'description' => $request->description,
    ]);
    
    if ($request->is_client_fault) {
        $this->updateBonusMalus($profile, true);
    }
    
    return response()->json([
        'message' => 'Accident reported successfully',
        'accident' => $accident->load('policy')
    ], 201);
}

    // Обновить страховой случай (агент)
    public function update(Request $request, $id)
    {
        $accident = Accident::findOrFail($id);
        
        $request->validate([
            'damage_amount' => 'nullable|numeric|min:0',
            'is_client_fault' => 'sometimes|boolean',
            'description' => 'nullable|string',
            'status' => 'sometimes|string|in:pending,approved,rejected,paid',
        ]);
        
        $accident->update($request->all());
        
        return response()->json([
            'message' => 'Accident updated successfully',
            'accident' => $accident->load(['client.user', 'policy'])
        ]);
    }

    // Выплата по страховому случаю (агент)
    public function pay($id)
    {
        $accident = Accident::findOrFail($id);
        
        if ($accident->is_client_fault) {
            return response()->json(['message' => 'Cannot pay for at-fault accident'], 422);
        }
        
        $accident->update(['status' => 'paid']);
        
        return response()->json([
            'message' => 'Insurance payment processed successfully',
            'amount' => $accident->damage_amount
        ]);
    }

    // Обновление бонус-малус класса
    private function updateBonusMalus($profile, $hasAccident)
    {
        $currentClass = $profile->bonus_malus_class ?? '3';
        
        $transitions = [
            'M' => ['no_accident' => '0', 'accident' => 'M'],
            '0' => ['no_accident' => '1', 'accident' => 'M'],
            '1' => ['no_accident' => '2', 'accident' => 'M'],
            '2' => ['no_accident' => '3', 'accident' => '1'],
            '3' => ['no_accident' => '4', 'accident' => '2'],
            '4' => ['no_accident' => '5', 'accident' => '3'],
            '5' => ['no_accident' => '6', 'accident' => '4'],
            '6' => ['no_accident' => '7', 'accident' => '5'],
            '7' => ['no_accident' => '8', 'accident' => '6'],
            '8' => ['no_accident' => '9', 'accident' => '7'],
            '9' => ['no_accident' => '10', 'accident' => '8'],
            '10' => ['no_accident' => '11', 'accident' => '9'],
            '11' => ['no_accident' => '12', 'accident' => '10'],
            '12' => ['no_accident' => '13', 'accident' => '11'],
            '13' => ['no_accident' => '13', 'accident' => '12'],
        ];
        
        $key = $hasAccident ? 'accident' : 'no_accident';
        $newClass = $transitions[$currentClass][$key] ?? '3';
        
        $profile->bonus_malus_class = $newClass;
        $profile->has_accidents_last_year = $hasAccident;
        $profile->save();
        
        return $newClass;
    }
}