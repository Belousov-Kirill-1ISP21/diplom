<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tariff;
use App\Models\PolicyType;
use App\Models\VehicleCategory;

class TariffSeeder extends Seeder
{
    public function run(): void
    {
        // Получаем ID типов полисов
        $osagoId = PolicyType::where('name', 'ОСАГО')->first()->id;
        $kaskoId = PolicyType::where('name', 'КАСКО')->first()->id;
        
        // ОСАГО для легковых авто (категория B)
        $tariffs = [
            // ОСАГО
            [
                'policy_type_id' => $osagoId,
                'vehicle_category' => 'B',
                'base_rate' => 4118.00,
                'min_rate' => 2746.00,
                'max_rate' => 4942.00,
                'power_coefficient' => 1.0,
                'experience_coefficient' => 1.0,
                'age_coefficient' => 1.0,
                'bonus_malus_coefficient' => 1.0,
                'region_coefficient' => 1.0,
                'vehicle_age_coefficient' => 1.0,
                'security_coefficient' => 1.0,
                'franchise_coefficient' => 1.0,
                'calculation_method' => 'basic'
            ],
            // ОСАГО для мотоциклов
            [
                'policy_type_id' => $osagoId,
                'vehicle_category' => 'A',
                'base_rate' => 1500.00,
                'min_rate' => 1000.00,
                'max_rate' => 2000.00,
                'power_coefficient' => 1.0,
                'experience_coefficient' => 1.0,
                'age_coefficient' => 1.0,
                'bonus_malus_coefficient' => 1.0,
                'region_coefficient' => 1.0,
                'vehicle_age_coefficient' => 1.0,
                'security_coefficient' => 1.0,
                'franchise_coefficient' => 1.0,
                'calculation_method' => 'basic'
            ],
            // КАСКО
            [
                'policy_type_id' => $kaskoId,
                'vehicle_category' => 'B',
                'base_rate' => 50000.00,
                'min_rate' => 25000.00,
                'max_rate' => 150000.00,
                'power_coefficient' => 1.2,
                'experience_coefficient' => 0.9,
                'age_coefficient' => 0.85,
                'bonus_malus_coefficient' => 1.0,
                'region_coefficient' => 1.1,
                'vehicle_age_coefficient' => 0.95,
                'security_coefficient' => 0.8,
                'franchise_coefficient' => 0.7,
                'calculation_method' => 'coefficient'
            ],
        ];

        foreach ($tariffs as $tariff) {
            Tariff::firstOrCreate(
                [
                    'policy_type_id' => $tariff['policy_type_id'],
                    'vehicle_category' => $tariff['vehicle_category']
                ],
                $tariff
            );
        }
    }
}