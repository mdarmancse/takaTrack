<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'is_read',
        'data',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    /**
     * Get the user that owns the notification.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark the notification as read.
     */
    public function markAsRead(): void
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    /**
     * Scope to get unread notifications.
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope to get read notifications.
     */
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    /**
     * Create a notification for a user.
     */
    public static function createForUser(int $userId, string $type, string $title, string $message, array $data = []): self
    {
        return self::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Create achievement notification.
     */
    public static function createAchievement(int $userId, string $title, string $message, array $data = []): self
    {
        return self::createForUser($userId, 'achievement', $title, $message, $data);
    }

    /**
     * Create reminder notification.
     */
    public static function createReminder(int $userId, string $title, string $message, array $data = []): self
    {
        return self::createForUser($userId, 'reminder', $title, $message, $data);
    }

    /**
     * Create success notification.
     */
    public static function createSuccess(int $userId, string $title, string $message, array $data = []): self
    {
        return self::createForUser($userId, 'success', $title, $message, $data);
    }

    /**
     * Create warning notification.
     */
    public static function createWarning(int $userId, string $title, string $message, array $data = []): self
    {
        return self::createForUser($userId, 'warning', $title, $message, $data);
    }
}