<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserTypeSeeder::class,
            DocumentTypeSeeder::class,
            PolicyTypeSeeder::class,
            VehicleCategorySeeder::class,
            LocationSeeder::class,
            TariffSeeder::class,
            UserSeeder::class,
            VehicleSeeder::class, 
        ]);
    }
}