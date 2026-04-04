<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DocumentType;

class DocumentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Паспорт РФ'],
            ['name' => 'Загранпаспорт'],
            ['name' => 'Водительское удостоверение'],
            ['name' => 'Свидетельство о рождении'],
            ['name' => 'Временное удостоверение личности'],
        ];

        foreach ($types as $type) {
            DocumentType::firstOrCreate(['name' => $type['name']], $type);
        }
    }
}