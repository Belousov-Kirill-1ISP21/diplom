<?php

namespace App\Http\Controllers;

use App\Models\Accident;
use App\Models\Policy;
use App\Models\ClientProfile;
use Illuminate\Http\Request;

class AccidentController extends Controller
{
    /**
     * Кастомные сообщения для валидации
     */
    private $validationMessages = [
        // Поля для создания/обновления ДТП
        'accident_date.required' => 'Дата ДТП обязательна для заполнения',
        'accident_date.date' => 'Дата ДТП должна быть корректной датой',
        'accident_date.before_or_equal' => 'Дата ДТП не может быть в будущем',
        
        'damage_amount.numeric' => 'Сумма ущерба должна быть числом',
        'damage_amount.min' => 'Сумма ущерба не может быть отрицательной',
        
        'is_client_fault.required' => 'Укажите, является ли клиент виновником ДТП',
        'is_client_fault.boolean' => 'Поле "вина клиента" должно быть true или false',
        
        'description.string' => 'Описание ДТП должно быть строкой',
        
        'status.string' => 'Статус должен быть строкой',
        'status.in' => 'Статус должен быть одним из: pending (на рассмотрении), approved (одобрено), rejected (отказано), paid (оплачено)',
    ];

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

    public function show($id)
    {
        $accident = Accident::with(['client.user', 'policy'])->findOrFail($id);
        
        $user = request()->user();
        if ($user->userType->name === 'client') {
            $profile = $user->clientProfile;
            if (!$profile || $accident->client_id !== $profile->id) {
                return response()->json(['message' => 'Доступ запрещён'], 403);
            }
        }
        
        return response()->json($accident);
    }

    public function store(Request $request, $policyId)
    {
        try {
            $user = $request->user();
            
            $profile = ClientProfile::where('user_id', $user->id)->first();
            
            if (!$profile) {
                return response()->json(['message' => 'Профиль клиента не найден. Заполните личные данные'], 404);
            }
            
            $policy = Policy::where('id', $policyId)
                ->where('client_id', $profile->id)
                ->where('status', 'active')
                ->first();
                
            if (!$policy) {
                return response()->json(['message' => 'Активный полис не найден. Проверьте номер полиса и его статус'], 404);
            }
            
            $validated = $request->validate([
                'accident_date' => 'required|date|before_or_equal:today',
                'damage_amount' => 'nullable|numeric|min:0',
                'is_client_fault' => 'required|boolean',
                'description' => 'nullable|string',
            ], $this->validationMessages);
            
            // Проверка, что дата ДТП не раньше даты начала полиса
            if ($validated['accident_date'] < $policy->start_date) {
                return response()->json([
                    'message' => 'Дата ДТП не может быть раньше даты начала действия полиса (' . $policy->start_date . ')'
                ], 422);
            }
            
            // Проверка, что дата ДТП не позже даты окончания полиса
            if ($validated['accident_date'] > $policy->end_date) {
                return response()->json([
                    'message' => 'Дата ДТП не может быть позже даты окончания действия полиса (' . $policy->end_date . ')'
                ], 422);
            }
            
            $accident = Accident::create([
                'client_id' => $profile->id,
                'policy_id' => $policyId,
                'accident_date' => $validated['accident_date'],
                'damage_amount' => $validated['damage_amount'] ?? null,
                'is_client_fault' => $validated['is_client_fault'],
                'description' => $validated['description'] ?? null,
                'status' => 'pending'
            ]);
            
            if ($validated['is_client_fault']) {
                $newClass = $this->updateBonusMalus($profile, true);
                \Log::info("Bonus Malus updated for client {$profile->id}: {$newClass}");
            }
            
            return response()->json([
                'message' => 'Информация о ДТП успешно отправлена и принята на рассмотрение',
                'accident' => $accident->load('policy')
            ], 201);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации данных',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Accident store error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Произошла ошибка при создании заявления о ДТП'
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $accident = Accident::findOrFail($id);
            
            $validated = $request->validate([
                'damage_amount' => 'nullable|numeric|min:0',
                'is_client_fault' => 'sometimes|boolean',
                'description' => 'nullable|string',
                'status' => 'sometimes|string|in:pending,approved,rejected,paid',
            ], $this->validationMessages);
            
            // Если статус меняется на paid, проверяем, что нет вины клиента
            if (isset($validated['status']) && $validated['status'] === 'paid') {
                $currentFault = $validated['is_client_fault'] ?? $accident->is_client_fault;
                if ($currentFault) {
                    return response()->json([
                        'message' => 'Невозможно установить статус "оплачено" для ДТП, где клиент является виновником'
                    ], 422);
                }
            }
            
            $oldFault = $accident->is_client_fault;
            $accident->update($validated);
            
            // Если виновность клиента изменилась с false на true, обновляем бонус-малус
            if ($request->has('is_client_fault') && $request->is_client_fault && !$oldFault) {
                $profile = ClientProfile::find($accident->client_id);
                if ($profile) {
                    $newClass = $this->updateBonusMalus($profile, true);
                    \Log::info("Bonus Malus updated for client {$profile->id} after accident {$id}: {$newClass}");
                }
            }
            
            return response()->json([
                'message' => 'Информация о ДТП успешно обновлена',
                'accident' => $accident->load(['client.user', 'policy'])
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации данных',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function pay($id)
    {
        try {
            $accident = Accident::findOrFail($id);
            
            if ($accident->is_client_fault) {
                return response()->json([
                    'message' => 'Невозможно произвести страховую выплату, так как клиент является виновником ДТП'
                ], 422);
            }
            
            if ($accident->status === 'paid') {
                return response()->json([
                    'message' => 'Страховая выплата по данному ДТП уже была произведена'
                ], 422);
            }
            
            if ($accident->status !== 'approved') {
                return response()->json([
                    'message' => 'Страховая выплата может быть произведена только после одобрения заявления. Текущий статус: ' . $accident->status
                ], 422);
            }
            
            if (!$accident->damage_amount || $accident->damage_amount <= 0) {
                return response()->json([
                    'message' => 'Невозможно произвести выплату: сумма ущерба не указана или равна нулю'
                ], 422);
            }
            
            $accident->update(['status' => 'paid']);
            
            return response()->json([
                'message' => 'Страховая выплата успешно обработана',
                'amount' => $accident->damage_amount,
                'currency' => 'RUB'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Accident pay error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Произошла ошибка при обработке выплаты'
            ], 500);
        }
    }

    public function approve($id)
    {
        try {
            $accident = Accident::findOrFail($id);
            
            if ($accident->status !== 'pending') {
                return response()->json([
                    'message' => 'Заявление о ДТП уже обработано. Текущий статус: ' . $accident->status
                ], 422);
            }
            
            $accident->update(['status' => 'approved']);
            
            return response()->json([
                'message' => 'Заявление о ДТП одобрено',
                'accident' => $accident
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Произошла ошибка при одобрении заявления'
            ], 500);
        }
    }

    public function reject($id, Request $request)
    {
        try {
            $accident = Accident::findOrFail($id);
            
            if ($accident->status !== 'pending') {
                return response()->json([
                    'message' => 'Заявление о ДТП уже обработано. Текущий статус: ' . $accident->status
                ], 422);
            }
            
            $reason = $request->get('reason', 'Не указана причина отказа');
            
            $accident->update([
                'status' => 'rejected',
                'description' => $accident->description . "\nПричина отказа: " . $reason
            ]);
            
            return response()->json([
                'message' => 'Заявление о ДТП отклонено',
                'reason' => $reason,
                'accident' => $accident
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Произошла ошибка при отклонении заявления'
            ], 500);
        }
    }

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