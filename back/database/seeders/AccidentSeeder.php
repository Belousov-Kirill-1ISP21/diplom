<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Accident;
use App\Models\Policy;

class AccidentSeeder extends Seeder
{
    public function run(): void
    {
        $policies = Policy::where('status', 'active')->get();
        
        if ($policies->isEmpty()) {
            return;
        }
        
        $accidentsData = [
            [
                'accident_date' => '2026-03-15',
                'damage_amount' => 25000.00,
                'is_client_fault' => false,
                'description' => 'ДТП на перекрестке, поврежден бампер и фара',
                'status' => 'paid'
            ],
            [
                'accident_date' => '2026-03-20',
                'damage_amount' => 50000.00,
                'is_client_fault' => true,
                'description' => 'Наезд на бордюр, повреждена подвеска',
                'status' => 'approved'
            ],
            [
                'accident_date' => '2026-04-01',
                'damage_amount' => 12000.00,
                'is_client_fault' => false,
                'description' => 'Скол на лобовом стекле от камня',
                'status' => 'pending'
            ],
            [
                'accident_date' => '2026-04-05',
                'damage_amount' => 80000.00,
                'is_client_fault' => true,
                'description' => 'ДТП с участием двух автомобилей',
                'status' => 'rejected'
            ],
        ];
        
        // Берем 30% полисов и добавляем им страховые случаи
        $selectedPolicies = $policies->random(max(1, (int)($policies->count() * 0.3)));
        
        foreach ($selectedPolicies as $policy) {
            $accidentCount = rand(1, 2);
            $selectedAccidents = array_rand($accidentsData, $accidentCount);
            
            if (!is_array($selectedAccidents)) {
                $selectedAccidents = [$selectedAccidents];
            }
            
            foreach ($selectedAccidents as $index) {
                $accident = $accidentsData[$index];
                
                Accident::create([
                    'client_id' => $policy->client_id,
                    'policy_id' => $policy->id,
                    'accident_date' => $accident['accident_date'],
                    'damage_amount' => $accident['damage_amount'],
                    'is_client_fault' => $accident['is_client_fault'],
                    'description' => $accident['description'],
                    'status' => $accident['status']
                ]);
            }
        }
    }
}