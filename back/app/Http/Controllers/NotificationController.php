<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    private $validationMessages = [
        'user_id.required' => 'ID пользователя обязателен',
        'user_id.exists' => 'Пользователь не найден',
        'message.required' => 'Текст уведомления обязателен',
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

    public function allForAgent(Request $request)
    {
        $notifications = Notification::with('user.clientProfile')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($notifications);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);
        
        if ($notification->is_read) {
            return response()->json(['message' => 'Уведомление уже прочитано'], 422);
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
            return response()->json(['message' => 'Нет непрочитанных уведомлений'], 422);
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
                'message' => 'Уведомление создано',
                'notification' => $notification->load('user.clientProfile')
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Ошибка валидации',
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
        
        return response()->json(['message' => 'Уведомление удалено']);
    }
}