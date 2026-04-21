<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Кастомные сообщения для валидации
     */
    private $validationMessages = [
        'user_id.required' => 'ID пользователя обязателен для заполнения',
        'user_id.exists' => 'Выбранный пользователь не существует',
        
        'message.required' => 'Текст уведомления обязателен для заполнения',
        'message.string' => 'Текст уведомления должен быть строкой',
        'message.max' => 'Текст уведомления не может превышать :max символов',
        
        'data.array' => 'Дополнительные данные должны быть в формате массива',
    ];

    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->with('user.clientProfile')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($notifications);
    }

    // Для агента - все уведомления всех клиентов
    public function allForAgent(Request $request)
    {
        $notifications = Notification::with('user.clientProfile')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($notifications);
    }

    public function unread(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->unread()
            ->with('user.clientProfile')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($notifications);
    }

    public function unreadCount(Request $request)
    {
        $count = $request->user()
            ->notifications()
            ->unread()
            ->count();
        
        return response()->json(['count' => $count]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);
        
        if ($notification->is_read) {
            return response()->json(['message' => 'Уведомление уже было прочитано'], 422);
        }
        
        $notification->update(['is_read' => true]);
        
        return response()->json(['message' => 'Уведомление отмечено как прочитанное']);
    }

    public function markAllAsRead(Request $request)
    {
        $unreadCount = $request->user()
            ->notifications()
            ->unread()
            ->count();
        
        if ($unreadCount === 0) {
            return response()->json(['message' => 'Непрочитанных уведомлений нет'], 422);
        }
        
        $request->user()
            ->notifications()
            ->unread()
            ->update(['is_read' => true]);
        
        return response()->json([
            'message' => 'Все уведомления отмечены как прочитанные',
            'marked_count' => $unreadCount
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'message' => 'required|string|max:500',
                'data' => 'nullable|array'
            ], $this->validationMessages);

            $notification = Notification::create([
                'user_id' => $validated['user_id'],
                'message' => $validated['message'],
                'data' => $validated['data'] ?? null,
                'is_read' => false
            ]);

            return response()->json([
                'message' => 'Уведомление успешно создано',
                'notification' => $notification->load('user.clientProfile')
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации данных',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function destroy(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);
        
        $notification->delete();
        
        return response()->json(['message' => 'Уведомление успешно удалено']);
    }

    /**
     * Дополнительный метод: удалить все прочитанные уведомления
     */
    public function deleteRead(Request $request)
    {
        $readCount = $request->user()
            ->notifications()
            ->where('is_read', true)
            ->count();
        
        if ($readCount === 0) {
            return response()->json(['message' => 'Нет прочитанных уведомлений для удаления'], 422);
        }
        
        $request->user()
            ->notifications()
            ->where('is_read', true)
            ->delete();
        
        return response()->json([
            'message' => 'Все прочитанные уведомления удалены',
            'deleted_count' => $readCount
        ]);
    }

    /**
     * Дополнительный метод: удалить все уведомления
     */
    public function deleteAll(Request $request)
    {
        $totalCount = $request->user()
            ->notifications()
            ->count();
        
        if ($totalCount === 0) {
            return response()->json(['message' => 'Нет уведомлений для удаления'], 422);
        }
        
        $request->user()
            ->notifications()
            ->delete();
        
        return response()->json([
            'message' => 'Все уведомления удалены',
            'deleted_count' => $totalCount
        ]);
    }
}