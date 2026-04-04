<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\ClientProfile;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $client1 = ClientProfile::first();
        $client2 = ClientProfile::skip(1)->first();

        $vehicles = [
            [
                'client_id' => $client1->id,
                'state_number' => 'А123ВС77',
                'brand' => 'Toyota',
                'model' => 'Camry',
                'manufacture_year' => 2020,
                'power_hp' => 200,
                'category' => 'B',
                'vin' => 'JTDKW3D3X05123456',
                'engine_volume' => 2.5,
                'purchase_price' => 2500000.00,
                'mileage' => 35000,
                'has_tracker' => true,
                'parking_type' => 'garage'
            ],
            [
                'client_id' => $client2->id,
                'state_number' => 'В456ЕО77',
                'brand' => 'Hyundai',
                'model' => 'Solaris',
                'manufacture_year' => 2021,
                'power_hp' => 123,
                'category' => 'B',
                'vin' => 'KMHD3513LGU123456',
                'engine_volume' => 1.6,
                'purchase_price' => 1500000.00,
                'mileage' => 15000,
                'has_tracker' => false,
                'parking_type' => 'street'
            ],
        ];

        foreach ($vehicles as $vehicle) {
            Vehicle::firstOrCreate(
                ['vin' => $vehicle['vin']],
                $vehicle
            );
        }
    }
}