<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\UserType;

class UserTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'admin'],
            ['name' => 'agent'],
            ['name' => 'client'],
        ];

        foreach ($types as $type) {
            UserType::firstOrCreate(['name' => $type['name']], $type);
        }
    }
}