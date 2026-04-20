<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClientProfile;
use App\Models\VehicleCategory;

class ClientDriverCategorySeeder extends Seeder
{
    public function run(): void
    {
        $clients = ClientProfile::all();
        $categories = VehicleCategory::all();
        
        foreach ($clients as $client) {
            // Получаем автомобили клиента
            $vehicles = $client->vehicles;
            
            // Собираем уникальные категории из автомобилей
            $categoryCodes = $vehicles->pluck('category')->unique()->toArray();
            
            // Добавляем категории в driverCategories
            if (!empty($categoryCodes)) {
                $client->driverCategories()->sync($categoryCodes);
            }
        }
    }
}