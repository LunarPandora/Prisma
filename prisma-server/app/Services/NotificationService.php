<?php

namespace App\Services;

use App\Models\Notification;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    public static function create(
        int $userId,
        string $type,
        string $title,
        string $message,
        ?array $data = null,
        ?string $actionUrl = null,
        ?string $key = null,
    ): ?Notification {
        if ($key) {
            $exists = Notification::where('key', $key)->exists();
            if ($exists) {
                return null;
            }
        }

        return Notification::create([
            'user_id'    => $userId,
            'type'       => $type,
            'title'      => $title,
            'message'    => $message,
            'data'       => $data,
            'action_url' => $actionUrl,
            'key'        => $key,
        ]);
    }

    public static function markAsRead(int $notificationId, int $userId): bool
    {
        $notification = Notification::where('notification_id', $notificationId)
            ->where('user_id', $userId)
            ->first();

        if (!$notification) {
            return false;
        }

        $notification->markAsRead();
        return true;
    }

    public static function markAllAsRead(int $userId): void
    {
        Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public static function unreadCount(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }

    public static function getForUser(int $userId, int $limit = 20, int $offset = 0, ?string $filter = null)
    {
        $query = Notification::where('user_id', $userId);

        if ($filter === 'unread') {
            $query->whereNull('read_at');
        } elseif ($filter === 'read') {
            $query->whereNotNull('read_at');
        }

        return $query->orderByDesc('created_at')
            ->skip($offset)
            ->take($limit)
            ->get();
    }

    public static function deleteNotification(int $notificationId, int $userId): bool
    {
        $notification = Notification::where('notification_id', $notificationId)
            ->where('user_id', $userId)
            ->first();

        if (!$notification) {
            return false;
        }

        $notification->delete();
        return true;
    }

    public static function createForRole(
        string $role,
        string $type,
        string $title,
        string $message,
        ?array $data = null,
        ?string $actionUrl = null,
        ?string $key = null,
    ): void {
        $users = \App\Models\User::where('role', $role)->pluck('id');
        foreach ($users as $userId) {
            static::create(
                userId: $userId,
                type: $type,
                title: $title,
                message: $message,
                data: $data,
                actionUrl: $actionUrl,
                key: $key ? "{$key}.{$userId}" : null,
            );
        }
    }

    public static function createForUsers(
        array $userIds,
        string $type,
        string $title,
        string $message,
        ?array $data = null,
        ?string $actionUrl = null,
        ?string $key = null,
    ): void {
        foreach ($userIds as $userId) {
            static::create(
                userId: $userId,
                type: $type,
                title: $title,
                message: $message,
                data: $data,
                actionUrl: $actionUrl,
                key: $key ? "{$key}.{$userId}" : null,
            );
        }
    }
}
