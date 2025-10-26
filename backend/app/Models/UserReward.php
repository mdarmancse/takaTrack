<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserReward extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'reward_type',
        'reward_name',
        'description',
        'coins_earned',
        'badge_name',
        'metadata',
        'claimed_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'claimed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get user's total coins
     */
    public static function getUserTotalCoins($userId)
    {
        return self::where('user_id', $userId)
            ->whereNotNull('claimed_at')
            ->sum('coins_earned');
    }

    /**
     * Get user's recent rewards
     */
    public static function getUserRecentRewards($userId, $limit = 10)
    {
        return self::where('user_id', $userId)
            ->whereNotNull('claimed_at')
            ->orderBy('claimed_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get rewards by type
     */
    public static function getRewardsByType($userId, $rewardType, $limit = 10)
    {
        return self::where('user_id', $userId)
            ->where('reward_type', $rewardType)
            ->whereNotNull('claimed_at')
            ->orderBy('claimed_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get unclaimed rewards
     */
    public static function getUnclaimedRewards($userId)
    {
        return self::where('user_id', $userId)
            ->whereNull('claimed_at')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Claim a reward
     */
    public function claim()
    {
        if ($this->claimed_at) {
            return false; // Already claimed
        }

        $this->update(['claimed_at' => now()]);
        
        // Update user level
        UserLevel::updateUserLevel($this->user_id);
        
        return true;
    }

    /**
     * Get reward statistics for user
     */
    public static function getUserRewardStats($userId)
    {
        $totalCoins = self::getUserTotalCoins($userId);
        $totalRewards = self::where('user_id', $userId)->whereNotNull('claimed_at')->count();
        $badgeCount = self::where('user_id', $userId)->whereNotNull('badge_name')->whereNotNull('claimed_at')->count();
        
        $rewardsByType = self::where('user_id', $userId)
            ->whereNotNull('claimed_at')
            ->selectRaw('reward_type, COUNT(*) as count, SUM(coins_earned) as total_coins')
            ->groupBy('reward_type')
            ->get();

        return [
            'total_coins' => $totalCoins,
            'total_rewards' => $totalRewards,
            'badge_count' => $badgeCount,
            'rewards_by_type' => $rewardsByType,
        ];
    }
}