<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VehicleCategory;

class VehicleCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['code' => 'A', 'name' => 'Мотоциклы'],
            ['code' => 'B', 'name' => 'Легковые автомобили'],
            ['code' => 'C', 'name' => 'Грузовые автомобили'],
            ['code' => 'D', 'name' => 'Автобусы'],
            ['code' => 'E', 'name' => 'Прицепы'],
            ['code' => 'M', 'name' => 'Мопеды'],
            ['code' => 'T', 'name' => 'Трамваи'],
            ['code' => 'Tb', 'name' => 'Троллейбусы'],
        ];

        foreach ($categories as $category) {
            VehicleCategory::firstOrCreate(
                ['code' => $category['code']], 
                ['name' => $category['name']]
            );
        }
    }
}