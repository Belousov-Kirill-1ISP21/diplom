<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserType;
use App\Models\ClientProfile;
use App\Models\Location;
use App\Models\DocumentType;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminType = UserType::where('name', 'admin')->first()->id;
        $agentType = UserType::where('name', 'agent')->first()->id;
        $clientType = UserType::where('name', 'client')->first()->id;
        
        $locationId = Location::first()->id;
        $docTypeId = DocumentType::where('name', 'Паспорт РФ')->first()->id;

        // Админ
        $admin = User::firstOrCreate(
            ['email' => 'admin@insurancesystem.com'],
            [
                'phone' => '1111111111',
                'password_hash' => Hash::make('admin123'),
                'user_type_id' => $adminType
            ]
        );

        // Агент
        $agent = User::firstOrCreate(
            ['email' => 'agent@insurancesystem.com'],
            [
                'phone' => '2222222222',
                'password_hash' => Hash::make('agent123'),
                'user_type_id' => $agentType
            ]
        );

        // Клиент 1
        $client1 = User::firstOrCreate(
            ['email' => 'ivanov@example.com'],
            [
                'phone' => '7777777777',
                'password_hash' => Hash::make('client123'),
                'user_type_id' => $clientType
            ]
        );

        ClientProfile::firstOrCreate(
            ['user_id' => $client1->id],
            [
                'last_name' => 'Иванов',
                'first_name' => 'Иван',
                'middle_name' => 'Иванович',
                'birth_date' => '1985-05-15',
                'location_id' => $locationId,
                'document_type_id' => $docTypeId,
                'passport_series' => '4501',
                'passport_number' => '123456',
                'passport_issued_by' => 'ОВД г. Москвы',
                'passport_issue_date' => '2010-06-20',
                'passport_expiry_date' => '2030-06-20',
                'driver_license_series' => '99',
                'driver_license_number' => '1234567890',
                'driver_license_issued_by' => 'ГИБДД г. Москвы',
                'driver_license_issue_date' => '2015-03-10',
                'driver_license_expiry_date' => '2025-03-10',
                'driver_categories' => 'B',
                'driver_experience_years' => 10,
                'bonus_malus_class' => '5',
                'has_accidents_last_year' => false
            ]
        );

        // Клиент 2
        $client2 = User::firstOrCreate(
            ['email' => 'petrov@example.com'],
            [
                'phone' => '8888888888',
                'password_hash' => Hash::make('client123'),
                'user_type_id' => $clientType
            ]
        );

        ClientProfile::firstOrCreate(
            ['user_id' => $client2->id],
            [
                'last_name' => 'Петров',
                'first_name' => 'Петр',
                'middle_name' => 'Петрович',
                'birth_date' => '1992-11-23',
                'location_id' => $locationId,
                'document_type_id' => $docTypeId,
                'passport_series' => '4502',
                'passport_number' => '654321',
                'passport_issued_by' => 'ОВД г. Москвы',
                'passport_issue_date' => '2012-08-15',
                'passport_expiry_date' => '2032-08-15',
                'driver_license_series' => '77',
                'driver_license_number' => '0987654321',
                'driver_license_issued_by' => 'ГИБДД г. Москвы',
                'driver_license_issue_date' => '2018-01-20',
                'driver_license_expiry_date' => '2028-01-20',
                'driver_categories' => 'B',
                'driver_experience_years' => 5,
                'bonus_malus_class' => '3',
                'has_accidents_last_year' => true
            ]
        );
    }
}