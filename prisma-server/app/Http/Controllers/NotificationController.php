<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $limit = $request->integer('per_page', 20);
        $offset = ($request->integer('page', 1) - 1) * $limit;
        $filter = $request->query('filter');

        $notifications = NotificationService::getForUser(
            userId: $request->user()->id,
            limit: $limit,
            offset: $offset,
            filter: $filter,
        );

        $totalQuery = \App\Models\Notification::where('user_id', $request->user()->id);
        if ($filter === 'unread') {
            $totalQuery->whereNull('read_at');
        } elseif ($filter === 'read') {
            $totalQuery->whereNotNull('read_at');
        }
        $total = $totalQuery->count();

        return ApiResponse::success([
            'notifications' => $notifications->map(function ($n) {
                return [
                    'notification_id' => $n->notification_id,
                    'type'            => $n->type,
                    'title'           => $n->title,
                    'message'         => $n->message,
                    'data'            => $n->data,
                    'action_url'      => $n->action_url,
                    'is_read'         => $n->isRead(),
                    'created_at'      => $n->created_at->toISOString(),
                ];
            }),
            'total' => $total,
            'page'  => $request->integer('page', 1),
            'per_page' => $limit,
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = NotificationService::unreadCount($request->user()->id);
        return ApiResponse::success(['count' => $count]);
    }

    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $success = NotificationService::markAsRead($id, $request->user()->id);
        if (!$success) {
            return ApiResponse::failed('Notifikasi tidak ditemukan.', 404);
        }
        return ApiResponse::success(message: 'Notifikasi ditandai sudah dibaca.');
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        NotificationService::markAllAsRead($request->user()->id);
        return ApiResponse::success(message: 'Semua notifikasi ditandai sudah dibaca.');
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $success = NotificationService::deleteNotification($id, $request->user()->id);
        if (!$success) {
            return ApiResponse::failed('Notifikasi tidak ditemukan.', 404);
        }
        return ApiResponse::success(message: 'Notifikasi dihapus.');
    }
}
