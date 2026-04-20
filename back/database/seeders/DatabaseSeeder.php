<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserTypeSeeder::class,
            PolicyTypeSeeder::class,
            VehicleCategorySeeder::class,
            TariffSeeder::class,
            UserSeeder::class,
            VehicleSeeder::class,
            ClientDriverCategorySeeder::class, 
            PolicySeeder::class, 
            AccidentSeeder::class,            
            NotificationSeeder::class,
        ]);
    }
}