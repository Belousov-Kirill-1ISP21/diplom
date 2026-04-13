<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // Получить все уведомления пользователя
    public function index(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($notifications);
    }

    // Получить непрочитанные уведомления
    public function unread(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->unread()
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($notifications);
    }

    // Получить количество непрочитанных
    public function unreadCount(Request $request)
    {
        $count = $request->user()
            ->notifications()
            ->unread()
            ->count();
        
        return response()->json(['count' => $count]);
    }

    // Отметить как прочитанное
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);
        
        $notification->update(['is_read' => true]);
        
        return response()->json(['message' => 'Marked as read']);
    }

    // Отметить все как прочитанные
    public function markAllAsRead(Request $request)
    {
        $request->user()
            ->notifications()
            ->unread()
            ->update(['is_read' => true]);
        
        return response()->json(['message' => 'All marked as read']);
    }

    // Создать уведомление (для админов/системы)
    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'message' => 'required|string|max:500',
            'type' => 'nullable|string|max:50',
            'data' => 'nullable|array'
        ]);

        $notification = Notification::create([
            'user_id' => $request->user_id,
            'message' => $request->message,
            'type' => $request->type,
            'data' => $request->data
        ]);

        return response()->json($notification, 201);
    }

    // Удалить уведомление
    public function destroy(Request $request, $id)
    {
        $notification = $request->user()
            ->notifications()
            ->findOrFail($id);
        
        $notification->delete();
        
        return response()->json(['message' => 'Deleted']);
    }
}