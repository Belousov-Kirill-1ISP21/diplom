<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Policy;
use App\Models\ClientProfile;
use App\Models\Vehicle;
use App\Models\Tariff;
use App\Models\PolicyType;
use Illuminate\Support\Str;

class PolicySeeder extends Seeder
{
    public function run(): void
    {
        $clients = ClientProfile::all();
        $osagoType = PolicyType::where('name', 'ОСАГО')->first();
        $kaskoType = PolicyType::where('name', 'КАСКО')->first();
        
        if (!$osagoType || !$kaskoType) {
            return;
        }
        
        $osagoTariff = Tariff::where('policy_type_id', $osagoType->id)->where('vehicle_category', 'B')->first();
        $kaskoTariff = Tariff::where('policy_type_id', $kaskoType->id)->where('vehicle_category', 'B')->first();
        
        if (!$osagoTariff) {
            return;
        }
        
        foreach ($clients as $client) {
            $vehicles = $client->vehicles;
            
            foreach ($vehicles as $vehicle) {
                $policyNumber = $this->generatePolicyNumber();
                $startDate = now()->subDays(rand(0, 30));
                $endDate = (clone $startDate)->addDays(365);
                
                Policy::create([
                    'policy_number' => $policyNumber,
                    'policy_type_id' => $osagoType->id,
                    'client_id' => $client->id,
                    'vehicle_id' => $vehicle->id,
                    'tariff_id' => $osagoTariff->id,
                    'base_price' => $osagoTariff->base_rate,
                    'final_price' => $osagoTariff->base_rate,
                    'discount_amount' => 0,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'status' => 'active',
                    'franchise_amount' => 0,
                    'coverage_amount' => 400000,
                ]);
                
                if (rand(0, 1) && $kaskoTariff) {
                    $policyNumber2 = $this->generatePolicyNumber();
                    $startDate2 = now()->subDays(rand(0, 30));
                    $endDate2 = (clone $startDate2)->addDays(365);
                    
                    Policy::create([
                        'policy_number' => $policyNumber2,
                        'policy_type_id' => $kaskoType->id,
                        'client_id' => $client->id,
                        'vehicle_id' => $vehicle->id,
                        'tariff_id' => $kaskoTariff->id,
                        'base_price' => $kaskoTariff->base_rate,
                        'final_price' => $kaskoTariff->base_rate,
                        'discount_amount' => 0,
                        'start_date' => $startDate2,
                        'end_date' => $endDate2,
                        'status' => 'active',
                        'franchise_amount' => 5000,
                        'coverage_amount' => 1500000,
                    ]);
                }
            }
        }
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
}