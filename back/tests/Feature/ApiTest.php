<?php

namespace Tests\Feature;

use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;
use App\Models\User;
use App\Models\ClientProfile;
use App\Models\Vehicle;
use App\Models\Policy;
use App\Models\Tariff;
use App\Models\PolicyType;
use App\Models\Accident;
use App\Models\Notification;
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
    protected $testVehicleId;
    protected $testPolicyId;
    protected $testAccidentId;
    protected $testNotificationId;
    protected $testClientUserId;

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

    // ==================== АУТЕНТИФИКАЦИЯ (8 тестов) ====================

    #[Test]
    public function test_01_auth_register()
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'newuser@test.com',
            'phone' => '+79991234500',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'last_name' => 'Новый',
            'first_name' => 'Пользователь',
            'middle_name' => 'Тестович',
            'birth_date' => '1990-01-01',
            'passport_series' => '1234',
            'passport_number' => '123456',
            'passport_issued_by' => 'ОВД г. Москвы',
            'passport_issue_date' => '2010-01-01',
            'driver_license_series' => '1234',
            'driver_license_number' => '123456',
            'driver_license_issued_by' => 'ГИБДД г. Москвы',
            'driver_license_issue_date' => '2015-01-01',
            'driver_license_expiry_date' => '2025-01-01'
        ]);

        $response->assertStatus(201);
        $this->assertArrayHasKey('token', $response->json());
        
        echo "\n✅ 01. POST /auth/register - OK\n";
    }

    #[Test]
    public function test_02_auth_login()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'ivanov@example.com',
            'password' => 'client123'
        ]);

        $response->assertStatus(200);
        $this->assertArrayHasKey('token', $response->json());
        
        echo "✅ 02. POST /auth/login - OK\n";
    }

    #[Test]
    public function test_03_auth_forgot_password()
    {
        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'ivanov@example.com'
        ]);

        $response->assertStatus(200);
        
        echo "✅ 03. POST /auth/forgot-password - OK\n";
    }

    #[Test]
    public function test_04_auth_reset_password()
    {
        $response = $this->postJson('/api/auth/reset-password', [
            'email' => 'ivanov@example.com',
            'token' => '4444',
            'password' => 'newpass123',
            'password_confirmation' => 'newpass123'
        ]);

        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'ivanov@example.com',
            'password' => 'newpass123'
        ]);
        
        if ($loginResponse->status() === 200) {
            $token = $loginResponse->json('token');
            $this->withHeader('Authorization', "Bearer $token")
                ->putJson('/api/auth/change-password', [
                    'current_password' => 'newpass123',
                    'new_password' => 'client123',
                    'new_password_confirmation' => 'client123'
                ]);
        }

        $response->assertStatus(200);
        
        echo "✅ 04. POST /auth/reset-password - OK\n";
    }

    #[Test]
    public function test_05_auth_me()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/auth/me');

        $response->assertStatus(200);
        $this->assertEquals('ivanov@example.com', $response->json('email'));
        
        echo "✅ 05. GET /auth/me - OK\n";
    }

    #[Test]
    public function test_06_auth_logout()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/auth/logout');

        $response->assertStatus(200);
        
        echo "✅ 06. POST /auth/logout - OK\n";
    }

    #[Test]
    public function test_07_auth_change_password()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/auth/change-password', [
                'current_password' => 'client123',
                'new_password' => 'newpass123',
                'new_password_confirmation' => 'newpass123'
            ]);

        $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/auth/change-password', [
                'current_password' => 'newpass123',
                'new_password' => 'client123',
                'new_password_confirmation' => 'client123'
            ]);

        $response->assertStatus(200);
        
        echo "✅ 07. PUT /auth/change-password - OK\n";
    }

    #[Test]
    public function test_08_profile_update()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/profile', [
                'last_name' => 'Обновленный',
                'first_name' => 'Профиль'
            ]);

        $response->assertStatus(200);
        
        echo "✅ 08. PUT /profile - OK\n";
    }

    // ==================== УВЕДОМЛЕНИЯ (5 тестов) ====================

    #[Test]
    public function test_09_notifications_index()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/notifications');

        $response->assertStatus(200);
        
        echo "✅ 09. GET /notifications - OK\n";
    }

    #[Test]
    public function test_10_notifications_store()
    {
        $token = $this->getAdminToken();
        
        $user = User::first();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/notifications', [
                'user_id' => $user->id,
                'message' => 'Тестовое уведомление'
            ]);

        $response->assertStatus(201);
        $this->testNotificationId = $response->json('notification.id');
        
        echo "✅ 10. POST /notifications - OK\n";
    }

    #[Test]
    public function test_11_notifications_mark_as_read()
    {
        $token = $this->getAdminToken();
        
        $user = User::first();
        
        $createResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/notifications', [
                'user_id' => $user->id,
                'message' => 'Тестовое уведомление для прочтения'
            ]);
        
        $notificationId = $createResponse->json('notification.id');

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/notifications/{$notificationId}/read");

        $response->assertStatus(200);
        
        echo "✅ 11. PUT /notifications/{id}/read - OK\n";
    }

    #[Test]
    public function test_12_notifications_mark_all_as_read()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson('/api/notifications/read-all');

        $this->assertTrue(in_array($response->status(), [200, 422]));
        
        echo "✅ 12. PUT /notifications/read-all - OK\n";
    }

    #[Test]
    public function test_13_notifications_destroy()
    {
        $token = $this->getAdminToken();
        
        $user = User::first();
        
        $createResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/notifications', [
                'user_id' => $user->id,
                'message' => 'Тестовое уведомление для удаления'
            ]);
        
        $notificationId = $createResponse->json('notification.id');

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/notifications/{$notificationId}");

        $response->assertStatus(200);
        
        echo "✅ 13. DELETE /notifications/{id} - OK\n";
    }

    // ==================== КЛИЕНТ - ПОЛИСЫ (5 тестов) ====================

    #[Test]
    public function test_14_client_policies_index()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/client/policies');

        $response->assertStatus(200);
        
        echo "✅ 14. GET /client/policies - OK\n";
    }

    #[Test]
    public function test_15_client_policies_show()
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
            $this->markTestSkipped('Нет полисов для тестирования');
        }
        
        echo "✅ 15. GET /client/policies/{policy} - OK\n";
    }

    #[Test]
    public function test_16_client_policies_store()
    {
        $token = $this->getUserToken();
        
        $clientProfile = ClientProfile::where('user_id', $this->testUser->id)->first();
        
        $vehicleResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/client/vehicles', [
                'state_number' => 'P001PP77',
                'brand' => 'Test',
                'model' => 'Test',
                'manufacture_year' => 2020,
                'power_hp' => 150,
                'category' => 'B',
                'vin' => substr('TESTPOLICY' . rand(100, 999), 0, 17),
            ]);
        
        $vehicleId = $vehicleResponse->json('vehicle.id');
        
        $tariff = Tariff::where('vehicle_category', 'B')->first();
        
        $calculateResponse = $this->postJson('/api/policies/calculate', [
            'policy_type_id' => 1,
            'vehicle_id' => $vehicleId,
            'tariff_id' => $tariff->id,
            'start_date' => date('Y-m-d', strtotime('+1 day')),
            'end_date' => date('Y-m-d', strtotime('+1 year')),
            'power_hp' => 150,
            'manufacture_year' => 2020
        ]);
        
        $calculatedPrice = $calculateResponse->json('calculated_price');

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/client/policies', [
                'policy_type_id' => 1,
                'client_id' => $clientProfile->id,
                'vehicle_id' => $vehicleId,
                'tariff_id' => $tariff->id,
                'base_price' => $calculatedPrice,
                'final_price' => $calculatedPrice,
                'start_date' => date('Y-m-d', strtotime('+1 day')),
                'end_date' => date('Y-m-d', strtotime('+1 year'))
            ]);

        $response->assertStatus(201);
        $this->testPolicyId = $response->json('policy.id');
        
        echo "✅ 16. POST /client/policies - OK\n";
    }

    #[Test]
    public function test_17_client_policies_pay()
    {
        $token = $this->getUserToken();
        
        $clientProfile = ClientProfile::where('user_id', $this->testUser->id)->first();
        
        $vehicleResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/client/vehicles', [
                'state_number' => 'P002PP77',
                'brand' => 'Pay',
                'model' => 'Test',
                'manufacture_year' => 2020,
                'power_hp' => 150,
                'category' => 'B',
                'vin' => substr('PAYTEST' . rand(100, 999), 0, 17),
            ]);
        
        $vehicleId = $vehicleResponse->json('vehicle.id');
        $tariff = Tariff::where('vehicle_category', 'B')->first();
        
        $createResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/client/policies', [
                'policy_type_id' => 1,
                'client_id' => $clientProfile->id,
                'vehicle_id' => $vehicleId,
                'tariff_id' => $tariff->id,
                'base_price' => 10000,
                'final_price' => 8500,
                'start_date' => date('Y-m-d', strtotime('+1 day')),
                'end_date' => date('Y-m-d', strtotime('+1 year'))
            ]);
        
        $policyId = $createResponse->json('policy.id');

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/client/policies/{$policyId}/pay");

        $response->assertStatus(200);
        
        echo "✅ 17. POST /client/policies/{policy}/pay - OK\n";
    }

    #[Test]
    public function test_18_client_policies_cancel()
    {
        $token = $this->getUserToken();
        
        $clientProfile = ClientProfile::where('user_id', $this->testUser->id)->first();
        
        $vehicleResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/client/vehicles', [
                'state_number' => 'P003PP77',
                'brand' => 'Cancel',
                'model' => 'Test',
                'manufacture_year' => 2020,
                'power_hp' => 150,
                'category' => 'B',
                'vin' => substr('CANCELTEST' . rand(100, 999), 0, 17),
            ]);
        
        $vehicleId = $vehicleResponse->json('vehicle.id');
        $tariff = Tariff::where('vehicle_category', 'B')->first();
        
        $createResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/client/policies', [
                'policy_type_id' => 1,
                'client_id' => $clientProfile->id,
                'vehicle_id' => $vehicleId,
                'tariff_id' => $tariff->id,
                'base_price' => 10000,
                'final_price' => 8500,
                'start_date' => date('Y-m-d', strtotime('+1 day')),
                'end_date' => date('Y-m-d', strtotime('+1 year'))
            ]);
        
        $policyId = $createResponse->json('policy.id');
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/client/policies/{$policyId}/cancel");
        
        $response->assertStatus(200);
        
        echo "✅ 18. POST /client/policies/{policy}/cancel - OK\n";
    }

    // ==================== КЛИЕНТ - ТРАНСПОРТ (3 теста) ====================

    #[Test]
    public function test_19_client_vehicles_index()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/client/vehicles');

        $response->assertStatus(200);
        
        echo "✅ 19. GET /client/vehicles - OK\n";
    }

    #[Test]
    public function test_20_client_vehicles_store()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/client/vehicles', [
                'state_number' => 'V001VV77',
                'brand' => 'Toyota',
                'model' => 'Camry',
                'manufacture_year' => 2020,
                'power_hp' => 200,
                'category' => 'B',
                'vin' => substr('VEHICLETEST' . rand(100, 999), 0, 17),
                'purchase_price' => 2500000,
                'has_tracker' => true,
                'parking_type' => 'garage'
            ]);

        $response->assertStatus(201);
        $this->testVehicleId = $response->json('vehicle.id');
        
        echo "✅ 20. POST /client/vehicles - OK\n";
    }

    #[Test]
    public function test_21_client_vehicles_destroy()
    {
        $token = $this->getUserToken();
        
        $createResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/client/vehicles', [
                'state_number' => 'V002VV77',
                'brand' => 'Audi',
                'model' => 'A6',
                'manufacture_year' => 2021,
                'power_hp' => 250,
                'category' => 'B',
                'vin' => substr('DELETETEST' . rand(100, 999), 0, 17),
            ]);
        
        $vehicleId = $createResponse->json('vehicle.id');
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/client/vehicles/{$vehicleId}");

        $response->assertStatus(200);
        
        echo "✅ 21. DELETE /client/vehicles/{vehicle} - OK\n";
    }

    // ==================== КЛИЕНТ - СТРАХОВЫЕ СЛУЧАИ (2 теста) ====================

    #[Test]
    public function test_22_client_accidents_index()
    {
        $token = $this->getUserToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/client/accidents');

        $response->assertStatus(200);
        
        echo "✅ 22. GET /client/accidents - OK\n";
    }

    #[Test]
    public function test_23_client_accidents_store()
    {
        $token = $this->getUserToken();
        
        $policies = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/client/policies');
        
        if (count($policies->json()) > 0) {
            $policyId = $policies->json()[0]['id'];
            
            $response = $this->withHeader('Authorization', "Bearer $token")
                ->postJson("/api/client/accidents/{$policyId}", [
                    'accident_date' => date('Y-m-d', strtotime('-1 day')),
                    'damage_amount' => 50000,
                    'is_client_fault' => false,
                    'description' => 'Тестовое ДТП'
                ]);
            
            $response->assertStatus(201);
            $this->testAccidentId = $response->json('accident.id');
        } else {
            $this->markTestSkipped('Нет активных полисов для тестирования');
        }
        
        echo "✅ 23. POST /client/accidents/{policy} - OK\n";
    }

    // ==================== ПУБЛИЧНЫЕ ЭНДПОИНТЫ (2 теста) ====================

    #[Test]
    public function test_24_policies_calculate_public()
    {
        $userToken = $this->getUserToken();
        
        $letters = ['А', 'В', 'Е', 'К', 'М', 'Н', 'О', 'Р', 'С', 'Т', 'У', 'Х'];
        $stateNumber = $letters[array_rand($letters)] . rand(100, 999) . $letters[array_rand($letters)] . $letters[array_rand($letters)] . rand(10, 99);
        
        $vehicleResponse = $this->withHeader('Authorization', "Bearer $userToken")
            ->postJson('/api/client/vehicles', [
                'state_number' => $stateNumber,
                'brand' => 'Calc',
                'model' => 'Test',
                'manufacture_year' => 2020,
                'power_hp' => 150,
                'category' => 'B',
                'vin' => substr('CALCTEST' . rand(100000, 999999), 0, 17),
            ]);
        
        $vehicleId = $vehicleResponse->json('vehicle.id');
        $tariff = Tariff::where('vehicle_category', 'B')->first();

        $response = $this->postJson('/api/policies/calculate', [
            'policy_type_id' => 1,
            'vehicle_id' => $vehicleId,
            'tariff_id' => $tariff->id,
            'start_date' => date('Y-m-d', strtotime('+1 day')),
            'end_date' => date('Y-m-d', strtotime('+1 year')),
            'power_hp' => 150,
            'manufacture_year' => 2020
        ]);

        $response->assertStatus(200);
        $this->assertArrayHasKey('calculated_price', $response->json());
        
        echo "✅ 24. POST /policies/calculate (public) - OK\n";
    }

    #[Test]
    public function test_25_tariffs_public()
    {
        $response = $this->getJson('/api/tariffs/public');
        
        $response->assertStatus(200);
        
        echo "✅ 25. GET /tariffs/public - OK\n";
    }

    // ==================== АГЕНТ - КЛИЕНТЫ (4 теста) ====================

    #[Test]
    public function test_26_agent_clients_index()
    {
        $token = $this->getAgentToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/agent/clients');

        $response->assertStatus(200);
        
        echo "✅ 26. GET /agent/clients - OK\n";
    }

    #[Test]
    public function test_27_agent_clients_store()
    {
        $token = $this->getAgentToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/agent/clients', [
                'email' => 'agentclient@test.com',
                'phone' => '+79991234999',
                'password' => 'password123',
                'last_name' => 'Агентский',
                'first_name' => 'Клиент'
            ]);

        $response->assertStatus(201);
        $this->testClientUserId = $response->json('client.id');
        
        echo "✅ 27. POST /agent/clients - OK\n";
    }

    #[Test]
    public function test_28_agent_clients_update()
    {
        $token = $this->getAgentToken();
        
        $uniqueNum = rand(1000000000, 9999999999);
        $workingPhone = '+7' . substr($uniqueNum, 0, 10);
        
        $createResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/agent/clients', [
                'email' => 'agentclientupdate' . rand(1, 999) . '@test.com',
                'phone' => $workingPhone,
                'password' => 'password123',
                'last_name' => 'Тестов',
                'first_name' => 'Тест',
                'middle_name' => 'Тестович',
                'birth_date' => '1990-01-01'
            ]);
        
        $userId = $createResponse->json('client.id');
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/agent/clients/{$userId}", [
                'last_name' => 'Обновлен'
            ]);

        $response->assertStatus(200);
        
        echo "✅ 28. PUT /agent/clients/{client} - OK\n";
    }

    #[Test]
    public function test_29_agent_clients_destroy()
    {
        $token = $this->getAgentToken();
        
        $uniqueNum = rand(1000000000, 9999999999);
        $workingPhone = '+7' . substr($uniqueNum, 0, 10);
        
        $createResponse = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/agent/clients', [
                'email' => 'todelete' . rand(1, 999) . '@test.com',
                'phone' => $workingPhone,
                'password' => 'password123',
                'last_name' => 'Удалов',
                'first_name' => 'Тест',
                'middle_name' => 'Тестович',
                'birth_date' => '1990-01-01'
            ]);
        
        $userId = $createResponse->json('client.id');
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/agent/clients/{$userId}");

        $response->assertStatus(200);
        
        echo "✅ 29. DELETE /agent/clients/{client} - OK\n";
    }

    // ==================== АГЕНТ - ПОЛИСЫ (5 тестов) ====================

    #[Test]
    public function test_30_agent_policies_index()
    {
        $token = $this->getAgentToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/agent/policies');

        $response->assertStatus(200);
        
        echo "✅ 30. GET /agent/policies - OK\n";
    }

    #[Test]
    public function test_31_agent_policies_update()
    {
        $token = $this->getAgentToken();
        
        $policy = Policy::first();
        
        if (!$policy) {
            $this->markTestSkipped('Нет полисов для обновления');
        }

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/agent/policies/{$policy->id}", [
                'discount_amount' => 10
            ]);

        $response->assertStatus(200);
        
        echo "✅ 31. PUT /agent/policies/{policy} - OK\n";
    }

    #[Test]
    public function test_32_agent_policies_activate()
    {
        // Проверим, какой пользователь получается
        $token = $this->getAgentToken();
        
        $meResponse = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/auth/me');
        
        // Берем существующего клиента и его ТС
        $client = ClientProfile::where('last_name', 'Иванов')->first();
        $this->assertNotNull($client, 'Клиент Иванов не найден');
        
        $vehicle = Vehicle::where('client_id', $client->id)->first();
        $this->assertNotNull($vehicle, 'ТС клиента не найдено');
        
        $tariff = Tariff::where('vehicle_category', 'B')->first();
        $this->assertNotNull($tariff, 'Тариф не найден');
        
        // Логинимся под клиентом
        $user = User::find($client->user_id);
        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'client123'
        ]);
        
        $clientToken = $loginResponse->json('token');
        
        // Создаем полис
        $createResponse = $this->withHeader('Authorization', "Bearer $clientToken")
            ->postJson('/api/client/policies', [
                'policy_type_id' => 1,
                'client_id' => $client->id,
                'vehicle_id' => $vehicle->id,
                'tariff_id' => $tariff->id,
                'base_price' => 10000,
                'final_price' => 8500,
                'start_date' => date('Y-m-d'),
                'end_date' => date('Y-m-d', strtotime('+1 year'))
            ]);
        
        $policyId = $createResponse->json('policy.id');
        
        // Агент активирует полис
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/agent/policies/{$policyId}/activate");
        
        $response->assertStatus(200);
        $this->assertEquals('active', $response->json('policy.status'));
        
        echo "✅ 32. POST /agent/policies/{policy}/activate - OK\n";
    }

    #[Test]
    public function test_33_agent_policies_renew()
    {
        $token = $this->getAgentToken();
        
        $policy = Policy::where('status', 'active')->first();
        
        if (!$policy) {
            $this->markTestSkipped('Нет активных полисов для продления');
        }

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/agent/policies/{$policy->id}/renew", [
                'days' => 30
            ]);

        $response->assertStatus(200);
        
        echo "✅ 33. POST /agent/policies/{policy}/renew - OK\n";
    }

    #[Test]
    public function test_34_agent_policies_cancel()
    {
        $token = $this->getAgentToken();
        
        $policy = Policy::where('status', 'active')->first();
        
        if (!$policy) {
            $this->markTestSkipped('Нет активных полисов для отмены');
        }

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/agent/policies/{$policy->id}/cancel");

        $response->assertStatus(200);
        
        echo "✅ 34. POST /agent/policies/{policy}/cancel - OK\n";
    }

    // ==================== АГЕНТ - СТРАХОВЫЕ СЛУЧАИ (2 теста) ====================

    #[Test]
    public function test_35_agent_accidents_index()
    {
        $token = $this->getAgentToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/agent/accidents');

        $response->assertStatus(200);
        
        echo "✅ 35. GET /agent/accidents - OK\n";
    }

    #[Test]
    public function test_36_agent_accidents_update()
    {
        $token = $this->getAgentToken();
        
        $accident = Accident::first();
        
        if (!$accident) {
            $this->markTestSkipped('Нет страховых случаев для обновления');
        }

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/agent/accidents/{$accident->id}", [
                'status' => 'approved'
            ]);

        $response->assertStatus(200);
        
        echo "✅ 36. PUT /agent/accidents/{accident} - OK\n";
    }

    // ==================== АГЕНТ - УВЕДОМЛЕНИЯ (1 тест) ====================

    #[Test]
    public function test_37_agent_notifications_all()
    {
        $token = $this->getAgentToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/agent/notifications/all');

        $response->assertStatus(200);
        
        echo "✅ 37. GET /agent/notifications/all - OK\n";
    }

    // ==================== АДМИН - ПОЛЬЗОВАТЕЛИ (2 теста) ====================

    #[Test]
    public function test_38_admin_users_index()
    {
        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/admin/users');

        $response->assertStatus(200);
        
        echo "✅ 38. GET /admin/users - OK\n";
    }

    #[Test]
    public function test_39_admin_users_update()
    {
        $token = $this->getAdminToken();
        
        $user = User::where('email', 'agent@insurancesystem.com')->first();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/admin/users/{$user->id}", [
                'email' => 'agent@insurancesystem.com'
            ]);

        $response->assertStatus(200);
        
        echo "✅ 39. PUT /admin/users/{user} - OK\n";
    }

    // ==================== АДМИН - ПОЛИСЫ (2 теста) ====================

    #[Test]
    public function test_40_admin_policies_index()
    {
        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/admin/policies');

        $response->assertStatus(200);
        
        echo "✅ 40. GET /admin/policies - OK\n";
    }

    #[Test]
    public function test_41_admin_policies_cancel()
    {
        $token = $this->getAdminToken();
        
        $policy = Policy::where('status', 'active')->first();
        
        if (!$policy) {
            $this->markTestSkipped('Нет активных полисов для отмены');
        }

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson("/api/admin/policies/{$policy->id}/cancel");

        $response->assertStatus(200);
        
        echo "✅ 41. POST /admin/policies/{policy}/cancel - OK\n";
    }

    // ==================== АДМИН - СТРАХОВЫЕ СЛУЧАИ (2 теста) ====================

    #[Test]
    public function test_42_admin_accidents_index()
    {
        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/admin/accidents');

        $response->assertStatus(200);
        
        echo "✅ 42. GET /admin/accidents - OK\n";
    }

    #[Test]
    public function test_43_admin_accidents_update()
    {
        $adminToken = $this->getAdminToken();
        
        // Сначала проверим, что админ может получить список ДТП
        $indexResponse = $this->withHeader('Authorization', "Bearer $adminToken")
            ->getJson('/api/admin/accidents');
        
        if ($indexResponse->status() === 200) {
            $accidents = $indexResponse->json();
            if (!empty($accidents['data'])) {
                $accidentId = $accidents['data'][0]['id'];
                
                // Пробуем обновить
                $response = $this->withHeader('Authorization', "Bearer $adminToken")
                    ->putJson("/api/admin/accidents/{$accidentId}", [
                        'status' => 'approved'
                    ]);
                
                $response->assertStatus(200);
            } else {
                $this->markTestSkipped('Нет ДТП для обновления');
            }
        } else {
            $this->fail('Админ не может получить список ДТП');
        }
        
        echo "✅ 43. PUT /admin/accidents/{accident} - OK\n";
    }

    // ==================== АДМИН - ТАРИФЫ (4 теста) ====================

    #[Test]
    public function test_44_admin_tariffs_index()
    {
        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/admin/tariffs');

        $response->assertStatus(200);
        
        echo "✅ 44. GET /admin/tariffs - OK\n";
    }

    #[Test]
    public function test_45_admin_tariffs_store()
    {
        $token = $this->getAdminToken();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/admin/tariffs', [
                'policy_type_id' => 1,
                'vehicle_category' => 'A',
                'base_rate' => 5000,
                'min_rate' => 3000,
                'max_rate' => 8000,
                'calculation_method' => 'basic'
            ]);

        $this->assertTrue(in_array($response->status(), [201, 422]));
        
        echo "✅ 45. POST /admin/tariffs - OK (или уже существует)\n";
    }

    #[Test]
    public function test_46_admin_tariffs_update()
    {
        $token = $this->getAdminToken();
        
        $tariff = Tariff::first();

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->putJson("/api/admin/tariffs/{$tariff->id}", [
                'base_rate' => 6000
            ]);

        $response->assertStatus(200);
        
        echo "✅ 46. PUT /admin/tariffs/{tariff} - OK\n";
    }

    #[Test]
    public function test_47_admin_tariffs_destroy()
    {
        $token = $this->getAdminToken();
        
        $tariff = Tariff::first();
        
        if (!$tariff) {
            $this->markTestSkipped('Нет тарифов для удаления');
            return;
        }
        
        $response = $this->withHeader('Authorization', "Bearer $token")
            ->deleteJson("/api/admin/tariffs/{$tariff->id}");
        
        $response->assertStatus(200);
        
        echo "✅ 47. DELETE /admin/tariffs/{tariff} - OK\n";
    }
}