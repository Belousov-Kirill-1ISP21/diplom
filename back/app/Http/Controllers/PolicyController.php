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
    // Список всех полисов (для агента/админа)
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

    // Мои полисы (для клиента)
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

    // Показать конкретный полис
    public function show($id)
    {
        $policy = Policy::with(['policyType', 'client.user', 'vehicle', 'tariff', 'accidents'])->findOrFail($id);
        
        // Проверка прав
        $user = request()->user();
        if ($user->userType->name === 'client') {
            $profile = $user->clientProfile;
            if (!$profile || $policy->client_id !== $profile->id) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        }
        
        return response()->json($policy);
    }

    // Показать мой полис (для клиента)
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

    // Рассчитать стоимость полиса
    public function calculate(Request $request)
    {
        $request->validate([
            'policy_type_id' => 'required|exists:policy_types,id',
            'vehicle_id' => 'required|exists:vehicles,id',
            'tariff_id' => 'required|exists:tariffs,id',
            'start_date' => 'required|date|after:today',
            'end_date' => 'required|date|after:start_date',
        ]);
        
        $tariff = Tariff::findOrFail($request->tariff_id);
        $vehicle = Vehicle::findOrFail($request->vehicle_id);
        
        // Базовые коэффициенты
        $coefficients = [
            'power_coefficient' => $this->getPowerCoefficient($vehicle->power_hp),
            'vehicle_age_coefficient' => $this->getVehicleAgeCoefficient($vehicle->manufacture_year),
        ];
        
        // Если есть клиент, добавляем его коэффициенты
        if ($request->user()->clientProfile) {
            $client = $request->user()->clientProfile;
            $coefficients['experience_coefficient'] = $this->getExperienceCoefficient($client->driver_experience_years);
            $coefficients['bonus_malus_coefficient'] = $this->getBonusMalusCoefficient($client->bonus_malus_class);
        }
        
        $finalPrice = $tariff->calculatePrice($coefficients);
        
        // Расчет срока действия
        $startDate = new \DateTime($request->start_date);
        $endDate = new \DateTime($request->end_date);
        $daysDiff = $startDate->diff($endDate)->days;
        
        if ($daysDiff < 365) {
            $finalPrice = $finalPrice * ($daysDiff / 365);
        }
        
        return response()->json([
            'calculated_price' => round($finalPrice, 2),
            'coefficients' => $coefficients,
            'tariff' => $tariff
        ]);
    }

    // Создать полис
    public function store(Request $request)
    {
        $request->validate([
            'policy_type_id' => 'required|exists:policy_types,id',
            'client_id' => 'required|exists:client_profiles,id',
            'vehicle_id' => 'required|exists:vehicles,id',
            'tariff_id' => 'required|exists:tariffs,id',
            'base_price' => 'required|numeric|min:0',
            'final_price' => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'franchise_amount' => 'nullable|numeric|min:0',
            'coverage_amount' => 'nullable|numeric|min:0',
        ]);
        
        // Генерируем номер полиса
        $policyNumber = $this->generatePolicyNumber();
        
        $policy = Policy::create([
            'policy_number' => $policyNumber,
            'policy_type_id' => $request->policy_type_id,
            'client_id' => $request->client_id,
            'vehicle_id' => $request->vehicle_id,
            'tariff_id' => $request->tariff_id,
            'base_price' => $request->base_price,
            'final_price' => $request->final_price,
            'discount_amount' => $request->base_price - $request->final_price,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'status' => 'draft',
            'franchise_amount' => $request->franchise_amount ?? 0,
            'coverage_amount' => $request->coverage_amount,
        ]);
        
        return response()->json([
            'message' => 'Policy created successfully',
            'policy' => $policy->load(['policyType', 'client.user', 'vehicle'])
        ], 201);
    }

    // Обновить полис
    public function update(Request $request, $id)
    {
        $policy = Policy::findOrFail($id);
        
        // Нельзя редактировать активные полисы
        if ($policy->status === 'active') {
            return response()->json(['message' => 'Cannot edit active policy'], 422);
        }
        
        $request->validate([
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
            'franchise_amount' => 'nullable|numeric|min:0',
            'coverage_amount' => 'nullable|numeric|min:0',
        ]);
        
        $policy->update($request->only([
            'start_date', 'end_date', 'franchise_amount', 'coverage_amount'
        ]));
        
        return response()->json([
            'message' => 'Policy updated successfully',
            'policy' => $policy
        ]);
    }

    // Активировать полис
    public function activate($id)
    {
        $policy = Policy::findOrFail($id);
        
        if ($policy->status !== 'draft') {
            return response()->json(['message' => 'Only draft policies can be activated'], 422);
        }
        
        $policy->status = 'active';
        $policy->save();
        
        return response()->json([
            'message' => 'Policy activated successfully',
            'policy' => $policy
        ]);
    }

    // Продлить полис
    public function renew($id, Request $request)
    {
        $policy = Policy::findOrFail($id);
        
        if ($policy->status !== 'active' && $policy->status !== 'expired') {
            return response()->json(['message' => 'Only active or expired policies can be renewed'], 422);
        }
        
        $request->validate([
            'new_end_date' => 'required|date|after:' . $policy->end_date,
        ]);
        
        $newEndDate = new \DateTime($request->new_end_date);
        $oldEndDate = new \DateTime($policy->end_date);
        $extraDays = $oldEndDate->diff($newEndDate)->days;
        
        // Пересчитываем стоимость
        $pricePerDay = $policy->final_price / 365;
        $additionalPrice = $pricePerDay * $extraDays;
        
        $policy->end_date = $request->new_end_date;
        $policy->final_price += $additionalPrice;
        $policy->save();
        
        return response()->json([
            'message' => 'Policy renewed successfully',
            'policy' => $policy,
            'additional_price' => round($additionalPrice, 2)
        ]);
    }

    // Оплатить полис
    public function pay($id)
    {
        $policy = Policy::findOrFail($id);
        
        if ($policy->status !== 'draft') {
            return response()->json(['message' => 'Only draft policies can be paid'], 422);
        }
        
        // Здесь логика оплаты через платежную систему
        $policy->status = 'active';
        $policy->save();
        
        return response()->json([
            'message' => 'Policy paid and activated successfully',
            'policy' => $policy
        ]);
    }

    // Отменить полис
    public function cancel($id)
    {
        $policy = Policy::findOrFail($id);
        
        if ($policy->status === 'cancelled') {
            return response()->json(['message' => 'Policy already cancelled'], 422);
        }
        
        $policy->status = 'cancelled';
        $policy->save();
        
        return response()->json([
            'message' => 'Policy cancelled successfully',
            'policy' => $policy
        ]);
    }

    // Удалить полис
    public function destroy($id)
    {
        $policy = Policy::findOrFail($id);
        
        if ($policy->status === 'active') {
            return response()->json(['message' => 'Cannot delete active policy'], 422);
        }
        
        $policy->delete();
        
        return response()->json(['message' => 'Policy deleted successfully']);
    }

    // Генератор номера полиса
    private function generatePolicyNumber()
    {
        $prefix = date('Y') . date('m');
        $random = Str::upper(Str::random(6));
        $number = $prefix . $random;
        
        // Проверка на уникальность
        while (Policy::where('policy_number', $number)->exists()) {
            $random = Str::upper(Str::random(6));
            $number = $prefix . $random;
        }
        
        return $number;
    }

    // Вспомогательные методы для коэффициентов
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