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
                'data' => json_encode(['priority' => 'high'])
            ]);

            // Уведомление о скором истечении полиса
            Notification::create([
                'user_id' => $client->id,
                'message' => 'Срок действия вашего полиса ОСАГО под номером ' . rand(1000, 9999) . ' истекает через 30 дней. Продлите полис вовремя!',
                'is_read' => false,
                'data' => json_encode(['days_left' => 30, 'policy_type' => 'osago'])
            ]);

            // Уведомление о специальном предложении
            Notification::create([
                'user_id' => $client->id,
                'message' => 'Специальное предложение! Скидка 15% на КАСКО при оформлении онлайн до конца месяца.',
                'is_read' => rand(0, 1) ? true : false,
                'data' => json_encode(['discount' => 15, 'expires_at' => now()->addDays(15)])
            ]);

            // Уведомление об успешной оплате
            if ($client->id % 2 == 0) {
                Notification::create([
                    'user_id' => $client->id,
                    'message' => 'Оплата полиса №' . rand(10000, 99999) . ' прошла успешно. Спасибо, что выбираете нас!',
                    'is_read' => true,
                    'data' => json_encode(['amount' => rand(5000, 20000)])
                ]);
            }

            // Уведомление о необходимости обновить данные
            Notification::create([
                'user_id' => $client->id,
                'message' => 'Пожалуйста, проверьте и обновите свои персональные данные в профиле для корректного расчета страховки.',
                'is_read' => false,
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
                'data' => json_encode(['policy_number' => '12345', 'status' => 'reviewing'])
            ]);
        }
    }
}