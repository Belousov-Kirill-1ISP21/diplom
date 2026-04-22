<?php

namespace App\Http\Controllers;

use App\Models\Policy;
use App\Models\Vehicle;
use App\Models\Tariff;
use App\Models\ClientProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PolicyController extends Controller
{
    private $validationMessages = [
        'policy_type_id.required' => 'Тип полиса обязателен',
        'policy_type_id.exists' => 'Тип полиса не найден',
        'vehicle_id.required' => 'Транспортное средство обязательно',
        'vehicle_id.exists' => 'Транспортное средство не найдено',
        'client_id.required' => 'Клиент обязателен',
        'client_id.exists' => 'Клиент не найден',
        'tariff_id.required' => 'Тариф обязателен',
        'tariff_id.exists' => 'Тариф не найден',
        'base_price.required' => 'Базовая цена обязательна',
        'base_price.min' => 'Базовая цена не может быть отрицательной',
        'final_price.required' => 'Итоговая цена обязательна',
        'final_price.min' => 'Итоговая цена не может быть отрицательной',
        'start_date.required' => 'Дата начала обязательна',
        'start_date.after_or_equal' => 'Дата начала должна быть не раньше сегодняшнего дня',
        'end_date.required' => 'Дата окончания обязательна',
        'end_date.after' => 'Дата окончания должна быть позже даты начала',
        'discount_amount.numeric' => 'Скидка должна быть числом',
        'discount_amount.min' => 'Скидка не может быть отрицательной',
        'discount_amount.max' => 'Скидка не может превышать 100%',
        'franchise_amount.numeric' => 'Франшиза должна быть числом',
        'franchise_amount.min' => 'Франшиза не может быть отрицательной',
        'coverage_amount.numeric' => 'Сумма покрытия должна быть числом',
        'coverage_amount.min' => 'Сумма покрытия не может быть отрицательной',
        'days.required' => 'Количество дней обязательно',
        'days.integer' => 'Количество дней должно быть целым числом',
        'days.min' => 'Минимальное количество дней - :min',
        'days.max' => 'Максимальное количество дней - :max',
    ];

    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $status = $request->get('status');
        
        $query = Policy::with(['policyType', 'client.user', 'vehicle', 'tariff']);
        
        if ($status) {
            $query->where('status', $status);
        }
        
        $policies = $query->paginate($perPage);
        
        return response()->json($policies);
    }

    public function myPolicies(Request $request)
    {
        $user = $request->user();
        $profile = $user->clientProfile;
        
        if (!$profile) {
            return response()->json([]);
        }
        
        $policies = Policy::where('client_id', $profile->id)
            ->with(['policyType', 'vehicle', 'tariff'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($policies);
    }

    public function showMyPolicy($id, Request $request)
    {
        $user = $request->user();
        $profile = $user->clientProfile;
        
        $policy = Policy::where('id', $id)
            ->where('client_id', $profile->id)
            ->with(['policyType', 'vehicle', 'tariff', 'accidents'])
            ->firstOrFail();
        
        return response()->json($policy);
    }

    public function calculate(Request $request)
    {
        try {
            $validated = $request->validate([
                'policy_type_id' => 'required|exists:policy_types,id',
                'vehicle_id' => 'required',
                'tariff_id' => 'required|exists:tariffs,id',
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after:start_date',
            ], $this->validationMessages);
            
            $tariff = Tariff::findOrFail($validated['tariff_id']);
            
            $powerHp = $request->get('power_hp', 100);
            $manufactureYear = $request->get('manufacture_year', date('Y') - 5);
            
            $coefficients = [
                'power_coefficient' => $this->getPowerCoefficient($powerHp),
                'vehicle_age_coefficient' => $this->getVehicleAgeCoefficient($manufactureYear),
            ];
            
            if ($request->user() && $request->user()->clientProfile) {
                $client = $request->user()->clientProfile;
                $coefficients['experience_coefficient'] = $this->getExperienceCoefficient($client->driver_experience_years);
                $coefficients['bonus_malus_coefficient'] = $this->getBonusMalusCoefficient($client->bonus_malus_class);
            }
            
            $finalPrice = $tariff->calculatePrice($coefficients);
            
            $startDate = new \DateTime($validated['start_date']);
            $endDate = new \DateTime($validated['end_date']);
            $daysDiff = $startDate->diff($endDate)->days;
            
            if ($daysDiff < 30) {
                return response()->json(['message' => 'Минимальный срок страхования — 30 дней'], 422);
            }
            
            if ($daysDiff > 365) {
                return response()->json(['message' => 'Максимальный срок страхования — 365 дней'], 422);
            }
            
            if ($daysDiff < 365) {
                $finalPrice = $finalPrice * ($daysDiff / 365);
            }
            
            return response()->json([
                'calculated_price' => round($finalPrice, 2),
                'coefficients' => $coefficients,
                'tariff' => $tariff
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'policy_type_id' => 'required|exists:policy_types,id',
                'client_id' => 'required|exists:client_profiles,id',
                'vehicle_id' => 'required|exists:vehicles,id',
                'tariff_id' => 'required|exists:tariffs,id',
                'base_price' => 'required|numeric|min:0',
                'final_price' => 'required|numeric|min:0',
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after:start_date',
                'discount_amount' => 'nullable|numeric|min:0|max:100',
                'franchise_amount' => 'nullable|numeric|min:0',
                'coverage_amount' => 'nullable|numeric|min:0',
            ], $this->validationMessages);
            
            $startDate = new \DateTime($validated['start_date']);
            $endDate = new \DateTime($validated['end_date']);
            $daysDiff = $startDate->diff($endDate)->days;
            
            if ($daysDiff < 30) {
                return response()->json(['message' => 'Минимальный срок страхования — 30 дней'], 422);
            }
            
            if ($daysDiff > 365) {
                return response()->json(['message' => 'Максимальный срок страхования — 365 дней'], 422);
            }
            
            $policyNumber = $this->generatePolicyNumber();
            $discountAmount = $validated['discount_amount'] ?? 0;
            $finalPrice = $validated['final_price'];
            
            if ($discountAmount > 0) {
                $finalPrice = $validated['final_price'] * (1 - $discountAmount / 100);
            }
            
            $policy = Policy::create([
                'policy_number' => $policyNumber,
                'policy_type_id' => $validated['policy_type_id'],
                'client_id' => $validated['client_id'],
                'vehicle_id' => $validated['vehicle_id'],
                'tariff_id' => $validated['tariff_id'],
                'base_price' => $validated['base_price'],
                'final_price' => $finalPrice,
                'discount_amount' => $discountAmount,
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'status' => 'draft',
                'franchise_amount' => $validated['franchise_amount'] ?? 0,
                'coverage_amount' => $validated['coverage_amount'] ?? null,
            ]);
            
            return response()->json([
                'message' => 'Полис создан',
                'policy' => $policy->load(['policyType', 'client.user', 'vehicle'])
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $policy = Policy::findOrFail($id);
            
            if ($policy->status === 'cancelled') {
                return response()->json(['message' => 'Нельзя редактировать отменённый полис'], 422);
            }
            
            if ($request->has('discount_amount')) {
                $discount = (int)$request->discount_amount;
                if ($discount < 0 || $discount > 100) {
                    return response()->json(['message' => 'Скидка должна быть от 0 до 100'], 422);
                }
                $policy->discount_amount = $discount;
                $policy->final_price = $policy->base_price * (1 - $discount / 100);
                $policy->save();
                
                return response()->json([
                    'message' => 'Скидка обновлена',
                    'policy' => $policy->fresh()
                ]);
            }
            
            return response()->json(['message' => 'Нет изменений']);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function activate($id)
    {
        $policy = Policy::findOrFail($id);
        
        if ($policy->status !== 'draft') {
            return response()->json(['message' => 'Только черновики можно активировать'], 422);
        }
        
        $policy->status = 'active';
        $policy->save();
        
        return response()->json(['message' => 'Полис активирован', 'policy' => $policy]);
    }

    public function renew($id, Request $request)
    {
        try {
            $policy = Policy::findOrFail($id);
            
            if ($policy->status !== 'active' && $policy->status !== 'expired') {
                return response()->json(['message' => 'Только активные или просроченные полисы можно продлить'], 422);
            }
            
            $validated = $request->validate([
                'days' => 'required|integer|min:1|max:365',
            ], $this->validationMessages);
            
            $newEndDate = new \DateTime($policy->end_date);
            $newEndDate->modify('+' . $validated['days'] . ' days');
            
            $oldEndDate = new \DateTime($policy->end_date);
            $extraDays = $oldEndDate->diff($newEndDate)->days;
            
            $pricePerDay = $policy->final_price / 365;
            $additionalPrice = $pricePerDay * $extraDays;
            
            $policy->end_date = $newEndDate;
            $policy->final_price += $additionalPrice;
            $policy->save();
            
            return response()->json([
                'message' => 'Полис продлён на ' . $validated['days'] . ' дней',
                'policy' => $policy,
                'additional_price' => round($additionalPrice, 2)
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function pay($id)
    {
        $policy = Policy::findOrFail($id);
        
        if ($policy->status !== 'draft') {
            return response()->json(['message' => 'Только черновики можно оплатить'], 422);
        }
        
        $policy->status = 'active';
        $policy->save();
        
        return response()->json(['message' => 'Полис оплачен и активирован', 'policy' => $policy]);
    }

    public function cancel($id)
    {
        $policy = Policy::findOrFail($id);
        
        if ($policy->status === 'cancelled') {
            return response()->json(['message' => 'Полис уже отменён'], 422);
        }
        
        if ($policy->status === 'expired') {
            return response()->json(['message' => 'Нельзя отменить просроченный полис'], 422);
        }
        
        $policy->status = 'cancelled';
        $policy->save();
        
        return response()->json(['message' => 'Полис отменён', 'policy' => $policy]);
    }

    private function generatePolicyNumber()
    {
        $prefix = date('Y') . date('m');
        $random = Str::upper(Str::random(6));
        $number = $prefix . $random;
        
        while (Policy::where('policy_number', $number)->exists()) {
            $random = Str::upper(Str::random(6));
            $number = $prefix . $random;
        }
        
        return $number;
    }

    private function getPowerCoefficient($power)
    {
        if ($power <= 50) return 0.6;
        if ($power <= 70) return 0.8;
        if ($power <= 100) return 1.0;
        if ($power <= 120) return 1.2;
        if ($power <= 150) return 1.4;
        if ($power <= 200) return 1.6;
        return 1.8;
    }

    private function getVehicleAgeCoefficient($year)
    {
        $age = date('Y') - $year;
        if ($age <= 1) return 1.0;
        if ($age <= 3) return 1.1;
        if ($age <= 5) return 1.2;
        if ($age <= 7) return 1.3;
        return 1.4;
    }

    private function getExperienceCoefficient($years)
    {
        if ($years <= 1) return 1.8;
        if ($years <= 3) return 1.4;
        if ($years <= 5) return 1.2;
        if ($years <= 10) return 1.0;
        return 0.9;
    }

    private function getBonusMalusCoefficient($class)
    {
        $coefficients = [
            'M' => 2.45, '0' => 2.30, '1' => 1.55, '2' => 1.40,
            '3' => 1.00, '4' => 0.95, '5' => 0.90, '6' => 0.85,
            '7' => 0.80, '8' => 0.75, '9' => 0.70, '10' => 0.65,
            '11' => 0.60, '12' => 0.55, '13' => 0.50
        ];
        
        return $coefficients[$class] ?? 1.0;
    }
}