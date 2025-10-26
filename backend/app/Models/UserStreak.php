<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserStreak extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'streak_count',
        'last_logged_date',
        'streak_type',
        'badges_earned',
    ];

    protected $casts = [
        'last_logged_date' => 'date',
        'badges_earned' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Update streak when user logs an expense
     */
    public static function updateStreak($userId, $streakType = 'expense_logging')
    {
        $streak = self::where('user_id', $userId)
            ->where('streak_type', $streakType)
            ->first();

        $today = now()->toDateString();

        if (!$streak) {
            // Create new streak
            $streak = self::create([
                'user_id' => $userId,
                'streak_count' => 1,
                'last_logged_date' => $today,
                'streak_type' => $streakType,
                'badges_earned' => [],
            ]);
        } else {
            $lastLogged = $streak->last_logged_date;
            
            if ($lastLogged && $lastLogged->toDateString() === $today) {
                // Already logged today, no change
                return $streak;
            } elseif ($lastLogged && $lastLogged->diffInDays($today) === 1) {
                // Consecutive day, increment streak
                $streak->update([
                    'streak_count' => $streak->streak_count + 1,
                    'last_logged_date' => $today,
                ]);
            } else {
                // Streak broken, reset to 1
                $streak->update([
                    'streak_count' => 1,
                    'last_logged_date' => $today,
                ]);
            }
        }

        // Check for streak badges
        $streak->checkStreakBadges();

        return $streak;
    }

    /**
     * Check and award streak badges
     */
    public function checkStreakBadges()
    {
        $badges = [];
        $currentBadges = $this->badges_earned ?? [];

        // 7-day streak badge
        if ($this->streak_count >= 7 && !in_array('7_day_streak', $currentBadges)) {
            $badges[] = '7_day_streak';
            $this->awardBadge('7 Day Streak', 'Keep it up! You\'ve logged expenses for 7 consecutive days.');
        }

        // 30-day streak badge
        if ($this->streak_count >= 30 && !in_array('30_day_streak', $currentBadges)) {
            $badges[] = '30_day_streak';
            $this->awardBadge('30 Day Streak', 'Amazing! You\'ve maintained your streak for 30 days.');
        }

        // 100-day streak badge
        if ($this->streak_count >= 100 && !in_array('100_day_streak', $currentBadges)) {
            $badges[] = '100_day_streak';
            $this->awardBadge('100 Day Streak', 'Incredible! You\'re a streak master!');
        }

        if (!empty($badges)) {
            $this->update([
                'badges_earned' => array_merge($currentBadges, $badges)
            ]);
        }
    }

    /**
     * Award a badge to the user
     */
    private function awardBadge($badgeName, $description)
    {
        UserReward::create([
            'user_id' => $this->user_id,
            'reward_type' => 'streak_badge',
            'reward_name' => $badgeName,
            'description' => $description,
            'coins_earned' => $this->getBadgeCoins($badgeName),
            'badge_name' => $badgeName,
            'claimed_at' => now(),
        ]);

        // Update user level
        UserLevel::updateUserLevel($this->user_id);
    }

    /**
     * Get coins for badge
     */
    private function getBadgeCoins($badgeName)
    {
        return match($badgeName) {
            '7 Day Streak' => 50,
            '30 Day Streak' => 200,
            '100 Day Streak' => 1000,
            default => 10,
        };
    }
}