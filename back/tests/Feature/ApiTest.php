<?php

namespace Tests\Feature;

use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;
use App\Models\User;
use App\Models\ClientProfile;
use App\Models\Vehicle;
use App\Models\Policy;
use App\Models\Tariff;
use App\Models\Location;
use App\Models\PolicyType;
use App\Models\Accident;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    protected $userToken;
    protected $agentToken;
    protected $adminToken;
    protected $testUser;
    protected $testAgent;
    protected $testAdmin;
    protected $vehicleId;
    protected $policyId;
    protected $clientId;
    protected $accidentId;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->seed();
        
        $this->testUser = User::where('email', 'ivanov@example.com')->first();
        $this->testAgent = User::where('email', 'agent@insurancesystem.com')->first();
        $this->testAdmin = User::where('email', 'admin@insurancesystem.com')->first();
    }

    protected function getUserToken()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'ivanov@example.com',
            'password' => 'client123'
        ]);
        return $response->json('token');
    }

    protected function getAgentToken()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'agent@insurancesystem.com',
            'password' => 'agent123'
        ]);
        return $response->json('token');
    }

    protected function getAdminToken()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@insurancesystem.com',
            'password' => 'admin123'
        ]);
        return $response->json('token');
    }

    // ==================== 1. АУТЕНТИФИКАЦИЯ (8 тестов) ====================

    #[Test]
    public function test_1_user_can_register()
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'newuser@test.com',
            'phone' => '9991234500',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'last_name' => 'Новый',
            'first_name' => 'Пользователь',
            'middle_name' => 'Тестович',
            'birth_date' => '1990-01-01'
        ]);

        $response->assertStatus(201);
        $this->assertArrayHasKey('token', $response->json());
        
        echo "\n✅ Регистрация пользователя - OK\n";
    }

    #[Test]
    public function test_2_user_can_login()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'ivanov@example.com',
            'password' => 'client123'
        ]);

        $response->assertStatus(200);
        $this->assertArrayHasKey('token', $response->json());
        
        echo "✅ Логин пользователя - OK\n";
    }

    #[Test]
    public function test_3_user_can_get_own_profile()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/auth/me');

        $response->assertStatus(200);
        $this->assertEquals('ivanov@example.com', $response->json('email'));
        
        echo "✅ Получение своего профиля - OK\n";
    }

    #[Test]
    public function test_4_user_can_change_password()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/auth/change-password', [
                'current_password' => 'client123',
                'new_password' => 'newpass123',
                'new_password_confirmation' => 'newpass123'
            ]);

        $response->assertStatus(200);
        
        echo "✅ Смена пароля - OK\n";
    }

    #[Test]
    public function test_5_user_can_logout()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/auth/logout');

        $response->assertStatus(200);
        
        echo "✅ Выход из системы - OK\n";
    }

    #[Test]
    public function test_6_user_can_request_password_reset()
    {
        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'ivanov@example.com'
        ]);

        $response->assertStatus(200);
        
        echo "✅ Запрос сброса пароля - OK\n";
    }

    #[Test]
    public function test_7_user_can_reset_password()
    {
        $response = $this->postJson('/api/auth/reset-password', [
            'email' => 'ivanov@example.com',
            'token' => 'test-token',
            'password' => 'newpass123',
            'password_confirmation' => 'newpass123'
        ]);

        $response->assertStatus(200);
        
        echo "✅ Сброс пароля - OK\n";
    }

    // ==================== 2. ПРОФИЛЬ (2 теста) ====================

    #[Test]
    public function test_8_user_can_get_profile()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/profile');

        $response->assertStatus(200);
        
        echo "✅ Получение профиля - OK\n";
    }

    #[Test]
    public function test_9_user_can_update_profile()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/profile', [
                'last_name' => 'Обновленный',
                'first_name' => 'Профиль'
            ]);

        $response->assertStatus(200);
        
        echo "✅ Обновление профиля - OK\n";
    }

    // ==================== 3. КЛИЕНТ - ТРАНСПОРТ (5 тестов) ====================

    #[Test]
    public function test_10_client_can_create_vehicle()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/client/vehicles', [
                'state_number' => 'A777AA77',
                'brand' => 'Toyota',
                'model' => 'Camry',
                'manufacture_year' => 2020,
                'power_hp' => 200,
                'category' => 'B',
                'vin' => substr('JTDKW3D3X051234' . rand(100, 999), 0, 17),
                'engine_volume' => 2.5,
                'purchase_price' => 2500000,
                'mileage' => 50000,
                'has_tracker' => true,
                'parking_type' => 'garage'
            ]);

        $response->assertStatus(201);
        $this->vehicleId = $response->json('vehicle.id');
        
        echo "✅ Создание ТС клиентом - OK\n";
    }

    #[Test]
    public function test_11_client_can_get_my_vehicles()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/client/vehicles');

        $response->assertStatus(200);
        
        echo "✅ Получение моих ТС - OK\n";
    }

    #[Test]
    public function test_12_client_can_get_single_vehicle()
    {
        $token = $this->getUserToken();
        
        $createResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/client/vehicles', [
                'state_number' => 'B888BB88',
                'brand' => 'Honda',
                'model' => 'Accord',
                'manufacture_year' => 2021,
                'power_hp' => 190,
                'category' => 'B',
                'vin' => substr('HONDA' . rand(100000, 999999), 0, 17),
                'engine_volume' => 2.0
            ]);
        
        $vehicleId = $createResponse->json('vehicle.id');
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/client/vehicles/{$vehicleId}");

        $response->assertStatus(200);
        
        echo "✅ Получение одного ТС - OK\n";
    }

    #[Test]
    public function test_13_client_can_update_vehicle()
    {
        $token = $this->getUserToken();
        
        $createResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/client/vehicles', [
                'state_number' => 'C999CC99',
                'brand' => 'BMW',
                'model' => 'X5',
                'manufacture_year' => 2022,
                'power_hp' => 300,
                'category' => 'B',
                'vin' => substr('BMW' . rand(100000, 999999), 0, 17),
                'engine_volume' => 3.0
            ]);
        
        $vehicleId = $createResponse->json('vehicle.id');
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/client/vehicles/{$vehicleId}", [
                'model' => 'X5 Updated',
                'mileage' => 60000
            ]);

        $response->assertStatus(200);
        
        echo "✅ Обновление ТС клиентом - OK\n";
    }

    #[Test]
    public function test_14_client_can_delete_vehicle()
    {
        $token = $this->getUserToken();
        
        $createResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/client/vehicles', [
                'state_number' => 'D000DD00',
                'brand' => 'Audi',
                'model' => 'A6',
                'manufacture_year' => 2021,
                'power_hp' => 250,
                'category' => 'B',
                'vin' => substr('AUDI' . rand(100000, 999999), 0, 17),
                'engine_volume' => 2.0
            ]);
        
        $vehicleId = $createResponse->json('vehicle.id');
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/client/vehicles/{$vehicleId}");

        $response->assertStatus(200);
        
        echo "✅ Удаление ТС клиентом - OK\n";
    }

    // ==================== 4. КЛИЕНТ - ПОЛИСЫ (4 теста) ====================

    #[Test]
    public function test_15_client_can_calculate_policy_price()
    {
        $token = $this->getUserToken();
        
        $vehicleResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/client/vehicles', [
                'state_number' => 'E111EE11',
                'brand' => 'Mercedes',
                'model' => 'E-class',
                'manufacture_year' => 2022,
                'power_hp' => 250,
                'category' => 'B',
                'vin' => substr('MERC' . rand(100000, 999999), 0, 17),
                'engine_volume' => 2.0
            ]);
        
        $vehicleId = $vehicleResponse->json('vehicle.id');
        
        $policyType = PolicyType::first();
        $tariff = Tariff::first();
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/client/policies/calculate', [
                'policy_type_id' => $policyType->id,
                'vehicle_id' => $vehicleId,
                'tariff_id' => $tariff->id,
                'start_date' => date('Y-m-d', strtotime('+1 day')),
                'end_date' => date('Y-m-d', strtotime('+1 year'))
            ]);

        $response->assertStatus(200);
        $this->assertArrayHasKey('calculated_price', $response->json());
        
        echo "✅ Расчет стоимости полиса - OK\n";
    }

    #[Test]
    public function test_16_client_can_get_my_policies()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/client/policies');

        $response->assertStatus(200);
        
        echo "✅ Получение моих полисов - OK\n";
    }

    #[Test]
    public function test_17_client_can_get_single_policy()
    {
        $token = $this->getUserToken();
        
        $policies = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/client/policies');
        
        if (count($policies->json()) > 0) {
            $policyId = $policies->json()[0]['id'];
            $response = $this->withHeader('Authorization', "Bearer $token")
                ->getJson("/api/client/policies/{$policyId}");
            $response->assertStatus(200);
        } else {
            $agentToken = $this->getAgentToken();
            $client = ClientProfile::first();
            $vehicle = Vehicle::first();
            $tariff = Tariff::first();
            $policyType = PolicyType::first();
            
            if ($client && $vehicle) {
                $createResponse = $this->withHeader('Authorization', "Bearer $agentToken")
                    ->postJson('/api/agent/policies', [
                        'policy_type_id' => $policyType->id,
                        'client_id' => $client->id,
                        'vehicle_id' => $vehicle->id,
                        'tariff_id' => $tariff->id,
                        'base_price' => 10000,
                        'final_price' => 8500,
                        'start_date' => date('Y-m-d'),
                        'end_date' => date('Y-m-d', strtotime('+1 year'))
                    ]);
                
                $policyId = $createResponse->json('policy.id');
                
                $response = $this->withHeader('Authorization', "Bearer $token")
                    ->getJson("/api/client/policies/{$policyId}");
                $response->assertStatus(200);
            } else {
                $this->markTestSkipped('Нет данных для создания полиса');
            }
        }
        
        echo "✅ Получение одного полиса - OK\n";
    }

    #[Test]
    public function test_18_client_can_pay_policy()
    {
        $token = $this->getUserToken();
        
        $agentToken = $this->getAgentToken();
        $client = ClientProfile::first();
        $vehicle = Vehicle::first();
        $tariff = Tariff::first();
        $policyType = PolicyType::first();
        
        if ($client && $vehicle) {
            $createResponse = $this->withHeader('Authorization', "Bearer $agentToken")
                ->postJson('/api/agent/policies', [
                    'policy_type_id' => $policyType->id,
                    'client_id' => $client->id,
                    'vehicle_id' => $vehicle->id,
                    'tariff_id' => $tariff->id,
                    'base_price' => 10000,
                    'final_price' => 8500,
                    'start_date' => date('Y-m-d'),
                    'end_date' => date('Y-m-d', strtotime('+1 year'))
                ]);
            
            $policyId = $createResponse->json('policy.id');
            
            $response = $this->withHeader('Authorization', "Bearer $token")
                ->postJson("/api/client/policies/{$policyId}/pay");
            
            $response->assertStatus(200);
        } else {
            $response = $this->withHeader('Authorization', "Bearer $token")
                ->postJson('/api/client/policies/1/pay');
            $this->assertTrue(in_array($response->status(), [200, 404, 422]));
        }
        
        echo "✅ Оплата полиса - OK\n";
    }

    // ==================== 5. КЛИЕНТ - СТРАХОВЫЕ СЛУЧАИ (1 тест) ====================

    #[Test]
    public function test_19_client_can_get_my_accidents()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/client/accidents');

        $response->assertStatus(200);
        
        echo "✅ Получение моих страховых случаев - OK\n";
    }

    // ==================== 6. АГЕНТ - КЛИЕНТЫ (4 теста) ====================

    #[Test]
    public function test_20_agent_can_get_clients()
    {
        $token = $this->getAgentToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/agent/clients');

        $response->assertStatus(200);
        
        echo "✅ Агент: получение списка клиентов - OK\n";
    }

    #[Test]
    public function test_21_agent_can_get_single_client()
    {
        $token = $this->getAgentToken();
        
        $client = ClientProfile::first();
        
        if (!$client) {
            $this->markTestSkipped('Нет клиентов');
        }
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/agent/clients/{$client->user_id}");

        $response->assertStatus(200);
        
        echo "✅ Агент: получение одного клиента - OK\n";
    }

    #[Test]
    public function test_22_agent_can_create_client()
    {
        $token = $this->getAgentToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/agent/clients', [
                'email' => 'agentcreated@test.com',
                'phone' => '9991234501',
                'password' => 'password123',
                'last_name' => 'Созданный',
                'first_name' => 'Агентом',
                'middle_name' => 'Клиентович',
                'birth_date' => '1995-05-05'
            ]);

        $response->assertStatus(201);
        $this->clientId = $response->json('client.id');
        
        echo "✅ Агент: создание клиента - OK\n";
    }

    #[Test]
    public function test_23_agent_can_update_client()
    {
        $token = $this->getAgentToken();
        
        $client = User::where('email', 'agentcreated@test.com')->first();
        
        if (!$client) {
            $createResponse = $this->withHeader('Authorization', "Bearer $token")
                ->postJson('/api/agent/clients', [
                    'email' => 'agentcreated2@test.com',
                    'phone' => '9991234599',
                    'password' => 'password123',
                    'last_name' => 'ДляОбновления',
                    'first_name' => 'Тест'
                ]);
            $clientId = $createResponse->json('client.id');
            $client = User::find($clientId);
        }
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/agent/clients/{$client->id}", [
                'last_name' => 'ОбновленныйАгентом'
            ]);

        $response->assertStatus(200);
        
        echo "✅ Агент: обновление клиента - OK\n";
    }

    // ==================== 7. АГЕНТ - ПОЛИСЫ (4 теста) ====================

    #[Test]
    public function test_24_agent_can_get_policies()
    {
        $token = $this->getAgentToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/agent/policies');

        $response->assertStatus(200);
        
        echo "✅ Агент: получение списка полисов - OK\n";
    }

    #[Test]
    public function test_25_agent_can_create_policy()
    {
        $token = $this->getAgentToken();
        
        $client = ClientProfile::first();
        $vehicle = Vehicle::first();
        $tariff = Tariff::first();
        $policyType = PolicyType::first();
        
        if (!$client || !$vehicle) {
            $userToken = $this->getUserToken();
            $vehicleResponse = $this->withHeader('Authorization', "Bearer $userToken")
                ->postJson('/api/client/vehicles', [
                    'state_number' => 'TEST999',
                    'brand' => 'Test',
                    'model' => 'Test',
                    'manufacture_year' => 2020,
                    'power_hp' => 100,
                    'category' => 'B',
                    'vin' => substr('TEST' . rand(100000, 999999), 0, 17)
                ]);
            $vehicle = Vehicle::where('vin', 'like', 'TEST%')->first();
            $client = ClientProfile::first();
        }
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/agent/policies', [
                'policy_type_id' => $policyType->id,
                'client_id' => $client->id,
                'vehicle_id' => $vehicle->id,
                'tariff_id' => $tariff->id,
                'base_price' => 10000,
                'final_price' => 8500,
                'start_date' => date('Y-m-d'),
                'end_date' => date('Y-m-d', strtotime('+1 year'))
            ]);

        $response->assertStatus(201);
        $this->policyId = $response->json('policy.id');
        
        echo "✅ Агент: создание полиса - OK\n";
    }

    #[Test]
    public function test_26_agent_can_activate_policy()
    {
        $token = $this->getAgentToken();
        
        $client = ClientProfile::first();
        $vehicle = Vehicle::first();
        $tariff = Tariff::first();
        $policyType = PolicyType::first();
        
        if (!$client || !$vehicle) {
            $this->markTestSkipped('Нет клиента или ТС');
        }
        
        $createResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/agent/policies', [
                'policy_type_id' => $policyType->id,
                'client_id' => $client->id,
                'vehicle_id' => $vehicle->id,
                'tariff_id' => $tariff->id,
                'base_price' => 10000,
                'final_price' => 8500,
                'start_date' => date('Y-m-d'),
                'end_date' => date('Y-m-d', strtotime('+1 year'))
            ]);
        
        $policyId = $createResponse->json('policy.id');
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/agent/policies/{$policyId}/activate");

        $response->assertStatus(200);
        
        echo "✅ Агент: активация полиса - OK\n";
    }

    #[Test]
    public function test_27_agent_can_get_accidents()
    {
        $token = $this->getAgentToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/agent/accidents');

        $response->assertStatus(200);
        
        echo "✅ Агент: получение страховых случаев - OK\n";
    }

    // ==================== 8. АГЕНТ - ОТЧЕТЫ (2 теста) ====================

    #[Test]
    public function test_28_agent_can_get_daily_report()
    {
        $token = $this->getAgentToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/agent/reports/daily');

        $response->assertStatus(200);
        
        echo "✅ Агент: ежедневный отчет - OK\n";
    }

    #[Test]
    public function test_29_agent_can_get_monthly_report()
    {
        $token = $this->getAgentToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/agent/reports/monthly');

        $response->assertStatus(200);
        
        echo "✅ Агент: ежемесячный отчет - OK\n";
    }

    // ==================== 9. АДМИН - ПОЛЬЗОВАТЕЛИ (6 тестов) ====================

    #[Test]
    public function test_30_admin_can_get_users()
    {
        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/admin/users');

        $response->assertStatus(200);
        
        echo "✅ Админ: получение списка пользователей - OK\n";
    }

    #[Test]
    public function test_31_admin_can_get_single_user()
    {
        $token = $this->getAdminToken();
        
        $user = User::first();
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/admin/users/{$user->id}");

        $response->assertStatus(200);
        
        echo "✅ Админ: получение одного пользователя - OK\n";
    }

    #[Test]
    public function test_32_admin_can_create_user()
    {
        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/admin/users', [
                'email' => 'admincreated@test.com',
                'phone' => '9991234502',
                'password' => 'password123',
                'user_type' => 'agent'
            ]);

        $response->assertStatus(201);
        
        echo "✅ Админ: создание пользователя - OK\n";
    }

    #[Test]
    public function test_33_admin_can_update_user()
    {
        $token = $this->getAdminToken();
        
        $user = User::where('email', 'admincreated@test.com')->first();
        
        if (!$user) {
            $createResponse = $this->withHeader('Authorization', "Bearer $token")
                ->postJson('/api/admin/users', [
                    'email' => 'adminupdate@test.com',
                    'phone' => '9991234598',
                    'password' => 'password123',
                    'user_type' => 'agent'
                ]);
            $user = User::where('email', 'adminupdate@test.com')->first();
        }
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/admin/users/{$user->id}", [
                'email' => 'adminupdated@test.com'
            ]);

        $response->assertStatus(200);
        
        echo "✅ Админ: обновление пользователя - OK\n";
    }

    #[Test]
    public function test_34_admin_can_block_user()
    {
        $token = $this->getAdminToken();
        
        $user = User::where('email', 'agent@insurancesystem.com')->first();
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/admin/users/{$user->id}/block");

        $response->assertStatus(200);
        
        echo "✅ Админ: блокировка пользователя - OK\n";
    }

    #[Test]
    public function test_35_admin_can_unblock_user()
    {
        $token = $this->getAdminToken();
        
        $user = User::where('email', 'agent@insurancesystem.com')->first();
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/admin/users/{$user->id}/unblock");

        $response->assertStatus(200);
        
        echo "✅ Админ: разблокировка пользователя - OK\n";
    }

    // ==================== 10. АДМИН - ТАРИФЫ (5 тестов) ====================

    #[Test]
    public function test_36_admin_can_get_tariffs()
    {
        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/admin/tariffs');

        $response->assertStatus(200);
        
        echo "✅ Админ: получение тарифов - OK\n";
    }

    #[Test]
    public function test_37_admin_can_get_single_tariff()
    {
        $token = $this->getAdminToken();
        
        $tariff = Tariff::first();
        
        if (!$tariff) {
            $this->markTestSkipped('Тариф не найден');
        }
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson("/api/admin/tariffs/{$tariff->id}");

        $response->assertStatus(200);
        
        echo "✅ Админ: получение одного тарифа - OK\n";
    }

    #[Test]
    public function test_38_admin_can_create_tariff()
    {
        $token = $this->getAdminToken();
        
        $policyType = PolicyType::first();
        
        $existingTariff = Tariff::where('policy_type_id', $policyType->id)
            ->where('vehicle_category', 'M')
            ->first();
        
        if ($existingTariff) {
            $existingTariff->delete();
        }

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/admin/tariffs', [
                'policy_type_id' => $policyType->id,
                'vehicle_category' => 'M',
                'base_rate' => 5000,
                'min_rate' => 3000,
                'max_rate' => 8000,
                'calculation_method' => 'basic'
            ]);

        $response->assertStatus(201);
        
        echo "✅ Админ: создание тарифа - OK\n";
    }

    #[Test]
    public function test_39_admin_can_update_tariff()
    {
        $token = $this->getAdminToken();
        
        $tariff = Tariff::first();
        
        if (!$tariff) {
            $this->markTestSkipped('Тариф не найден');
        }
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/admin/tariffs/{$tariff->id}", [
                'base_rate' => 6000
            ]);

        $response->assertStatus(200);
        
        echo "✅ Админ: обновление тарифа - OK\n";
    }

    #[Test]
    public function test_40_admin_can_delete_tariff()
    {
        $token = $this->getAdminToken();
        
        $policyType = PolicyType::first();
        
        $createResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/admin/tariffs', [
                'policy_type_id' => $policyType->id,
                'vehicle_category' => 'T',
                'base_rate' => 3000,
                'min_rate' => 2000,
                'max_rate' => 5000,
                'calculation_method' => 'basic'
            ]);
        
        $tariffId = $createResponse->json('tariff.id');
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/admin/tariffs/{$tariffId}");

        $response->assertStatus(200);
        
        echo "✅ Админ: удаление тарифа - OK\n";
    }

    // ==================== 11. АДМИН - ОТЧЕТЫ (4 теста) ====================

    #[Test]
    public function test_41_admin_can_get_dashboard()
    {
        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/admin/dashboard');

        $response->assertStatus(200);
        
        echo "✅ Админ: получение дашборда - OK\n";
    }

    #[Test]
    public function test_42_admin_can_get_statistics()
    {
        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/admin/statistics?type=overview');

        $response->assertStatus(200);
        
        echo "✅ Админ: получение статистики - OK\n";
    }

    #[Test]
    public function test_43_admin_can_get_sales_report()
    {
        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/admin/reports/sales?period=month');

        $response->assertStatus(200);
        
        echo "✅ Админ: отчет по продажам - OK\n";
    }

    #[Test]
    public function test_44_admin_can_get_financial_report()
    {
        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/admin/reports/financial?year=' . date('Y'));

        $response->assertStatus(200);
        
        echo "✅ Админ: финансовый отчет - OK\n";
    }

    // ==================== 12. ПУБЛИЧНЫЕ ЭНДПОИНТЫ (3 теста) ====================

    #[Test]
    public function test_45_public_can_get_locations()
    {
        $response = $this->getJson('/api/locations');
        
        $response->assertStatus(200);
        
        echo "✅ Публичные локации - OK\n";
    }

    #[Test]
    public function test_46_public_can_get_policy_types()
    {
        $response = $this->getJson('/api/policy-types');
        
        $response->assertStatus(200);
        
        echo "✅ Публичные типы полисов - OK\n";
    }

    #[Test]
    public function test_47_public_can_get_vehicle_categories()
    {
        $response = $this->getJson('/api/vehicle-categories');
        
        $response->assertStatus(200);
        
        echo "✅ Публичные категории ТС - OK\n";
    }
}