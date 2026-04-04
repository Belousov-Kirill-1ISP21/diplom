<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Location;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            // Москва
            [
                'citizenship_name' => 'Россия',
                'region_name' => 'Москва',
                'city_name' => 'Москва',
                'region_code' => '77'
            ],
            [
                'citizenship_name' => 'Россия',
                'region_name' => 'Московская область',
                'city_name' => 'Красногорск',
                'region_code' => '50'
            ],
            [
                'citizenship_name' => 'Россия',
                'region_name' => 'Московская область',
                'city_name' => 'Химки',
                'region_code' => '50'
            ],
            // Санкт-Петербург
            [
                'citizenship_name' => 'Россия',
                'region_name' => 'Санкт-Петербург',
                'city_name' => 'Санкт-Петербург',
                'region_code' => '78'
            ],
            [
                'citizenship_name' => 'Россия',
                'region_name' => 'Ленинградская область',
                'city_name' => 'Гатчина',
                'region_code' => '47'
            ],
            // Другие регионы
            [
                'citizenship_name' => 'Россия',
                'region_name' => 'Республика Татарстан',
                'city_name' => 'Казань',
                'region_code' => '16'
            ],
            [
                'citizenship_name' => 'Россия',
                'region_name' => 'Свердловская область',
                'city_name' => 'Екатеринбург',
                'region_code' => '66'
            ],
            [
                'citizenship_name' => 'Россия',
                'region_name' => 'Новосибирская область',
                'city_name' => 'Новосибирск',
                'region_code' => '54'
            ],
            [
                'citizenship_name' => 'Россия',
                'region_name' => 'Краснодарский край',
                'city_name' => 'Краснодар',
                'region_code' => '23'
            ],
            [
                'citizenship_name' => 'Россия',
                'region_name' => 'Краснодарский край',
                'city_name' => 'Сочи',
                'region_code' => '23'
            ],
        ];

        foreach ($locations as $location) {
            Location::firstOrCreate(
                [
                    'citizenship_name' => $location['citizenship_name'],
                    'region_name' => $location['region_name'],
                    'city_name' => $location['city_name']
                ],
                $location
            );
        }
    }
}