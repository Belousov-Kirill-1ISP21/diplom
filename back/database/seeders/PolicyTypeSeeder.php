<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PolicyType;

class PolicyTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'ОСАГО'],
            ['name' => 'КАСКО'],
        ];

        foreach ($types as $type) {
            PolicyType::firstOrCreate(['name' => $type['name']], $type);
        }
    }
}