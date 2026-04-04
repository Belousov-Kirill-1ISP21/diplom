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
            ['name' => 'Зеленая карта'],
            ['name' => 'ДСАГО'],
            ['name' => 'Страхование жизни'],
        ];

        foreach ($types as $type) {
            PolicyType::firstOrCreate(['name' => $type['name']], $type);
        }
    }
}