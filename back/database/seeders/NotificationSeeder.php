<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Notification;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        // Получаем всех клиентов
        $clients = User::whereHas('userType', function($query) {
            $query->where('name', 'client');
        })->get();

        // Уведомления для каждого клиента
        foreach ($clients as $client) {
            // Приветственное уведомление
            Notification::create([
                'user_id' => $client->id,
                'message' => 'Добро пожаловать в систему страхования! Оформите свой первый полис прямо сейчас.',
                'is_read' => false,
                'type' => 'welcome',
                'data' => json_encode(['priority' => 'high'])
            ]);

            // Уведомление о скором истечении полиса (демо)
            Notification::create([
                'user_id' => $client->id,
                'message' => 'Срок действия вашего полиса ОСАГО под номером ' . rand(1000, 9999) . ' истекает через 30 дней. Продлите полис вовремя!',
                'is_read' => false,
                'type' => 'policy_expiring',
                'data' => json_encode(['days_left' => 30, 'policy_type' => 'osago'])
            ]);

            // Уведомление о специальном предложении
            Notification::create([
                'user_id' => $client->id,
                'message' => 'Специальное предложение! Скидка 15% на КАСКО при оформлении онлайн до конца месяца.',
                'is_read' => rand(0, 1) ? true : false, // некоторые прочитаны, некоторые нет
                'type' => 'promotion',
                'data' => json_encode(['discount' => 15, 'expires_at' => now()->addDays(15)])
            ]);

            // Уведомление об успешной оплате (демо)
            if ($client->id % 2 == 0) {
                Notification::create([
                    'user_id' => $client->id,
                    'message' => 'Оплата полиса №' . rand(10000, 99999) . ' прошла успешно. Спасибо, что выбираете нас!',
                    'is_read' => true,
                    'type' => 'payment_success',
                    'data' => json_encode(['amount' => rand(5000, 20000)])
                ]);
            }

            // Уведомление о необходимости обновить данные
            Notification::create([
                'user_id' => $client->id,
                'message' => 'Пожалуйста, проверьте и обновите свои персональные данные в профиле для корректного расчета страховки.',
                'is_read' => false,
                'type' => 'profile_update',
                'data' => null
            ]);
        }

        // Уведомления для первого клиента (Иванов)
        $ivanov = User::where('email', 'ivanov@example.com')->first();
        if ($ivanov) {
            Notification::create([
                'user_id' => $ivanov->id,
                'message' => 'Ваш бонус-малус класс обновлен до 7. Ваша скидка на следующий полис составит 15%!',
                'is_read' => false,
                'type' => 'bonus_malus_update',
                'data' => json_encode(['old_class' => '5', 'new_class' => '7', 'discount' => 15])
            ]);
        }

        // Уведомления для второго клиента (Петров)
        $petrov = User::where('email', 'petrov@example.com')->first();
        if ($petrov) {
            Notification::create([
                'user_id' => $petrov->id,
                'message' => 'Зафиксирован страховой случай по полису №12345. Статус заявления: на рассмотрении.',
                'is_read' => false,
                'type' => 'accident_status',
                'data' => json_encode(['policy_number' => '12345', 'status' => 'reviewing'])
            ]);
        }

        // Уведомления для агента
        $agent = User::where('email', 'agent@insurancesystem.com')->first();
        if ($agent) {
            Notification::create([
                'user_id' => $agent->id,
                'message' => 'У вас 3 новых заявки от клиентов на оформление полисов. Требуется обработка.',
                'is_read' => false,
                'type' => 'new_applications',
                'data' => json_encode(['count' => 3])
            ]);
        }

        // Уведомления для админа
        $admin = User::where('email', 'admin@insurancesystem.com')->first();
        if ($admin) {
            Notification::create([
                'user_id' => $admin->id,
                'message' => 'За последние 24 часа зарегистрировано 5 новых пользователей.',
                'is_read' => false,
                'type' => 'user_statistics',
                'data' => json_encode(['new_users' => 5, 'period' => '24h'])
            ]);
        }
    }
}