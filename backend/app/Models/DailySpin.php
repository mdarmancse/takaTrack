<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailySpin extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'spin_date',
        'reward_type',
        'reward_value',
        'coins_earned',
        'is_claimed',
    ];

    protected $casts = [
        'spin_date' => 'date',
        'is_claimed' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if user can spin today
     */
    public static function canSpinToday($userId)
    {
        $today = now()->toDateString();
        return !self::where('user_id', $userId)
            ->where('spin_date', $today)
            ->exists();
    }

    /**
     * Perform daily spin
     */
    public static function performSpin($userId)
    {
        if (!self::canSpinToday($userId)) {
            return [
                'success' => false,
                'message' => 'You have already spun today!',
            ];
        }

        $reward = self::generateReward();
        
        $dailySpin = self::create([
            'user_id' => $userId,
            'spin_date' => now()->toDateString(),
            'reward_type' => $reward['type'],
            'reward_value' => $reward['value'],
            'coins_earned' => $reward['coins'],
            'is_claimed' => false,
        ]);

        // Create reward record
        UserReward::create([
            'user_id' => $userId,
            'reward_type' => 'daily_spin',
            'reward_name' => $reward['name'],
            'description' => $reward['description'],
            'coins_earned' => $reward['coins'],
            'claimed_at' => now(),
        ]);

        return [
            'success' => true,
            'reward' => $reward,
            'daily_spin' => $dailySpin,
        ];
    }

    /**
     * Generate random reward
     */
    private static function generateReward()
    {
        $rewards = [
            // Common rewards (70% chance)
            [
                'type' => 'coins',
                'value' => '10',
                'name' => 'Small Coin Bonus',
                'description' => 'You earned 10 coins!',
                'coins' => 10,
                'probability' => 40,
            ],
            [
                'type' => 'coins',
                'value' => '25',
                'name' => 'Coin Bonus',
                'description' => 'You earned 25 coins!',
                'coins' => 25,
                'probability' => 30,
            ],
            
            // Uncommon rewards (25% chance)
            [
                'type' => 'coins',
                'value' => '50',
                'name' => 'Big Coin Bonus',
                'description' => 'You earned 50 coins!',
                'coins' => 50,
                'probability' => 15,
            ],
            [
                'type' => 'badge',
                'value' => 'lucky_spinner',
                'name' => 'Lucky Spinner Badge',
                'description' => 'You earned a Lucky Spinner badge!',
                'coins' => 30,
                'probability' => 10,
            ],
            
            // Rare rewards (5% chance)
            [
                'type' => 'coins',
                'value' => '100',
                'name' => 'Mega Coin Bonus',
                'description' => 'You earned 100 coins!',
                'coins' => 100,
                'probability' => 3,
            ],
            [
                'type' => 'bonus',
                'value' => 'double_coins',
                'name' => 'Double Coins Bonus',
                'description' => 'Your next 3 transactions will earn double coins!',
                'coins' => 0,
                'probability' => 2,
            ],
        ];

        // Calculate weighted random selection
        $totalProbability = array_sum(array_column($rewards, 'probability'));
        $random = mt_rand(1, $totalProbability);
        
        $currentProbability = 0;
        foreach ($rewards as $reward) {
            $currentProbability += $reward['probability'];
            if ($random <= $currentProbability) {
                unset($reward['probability']); // Remove probability from result
                return $reward;
            }
        }

        // Fallback to first reward
        $fallback = $rewards[0];
        unset($fallback['probability']);
        return $fallback;
    }

    /**
     * Get user's spin history
     */
    public static function getUserSpinHistory($userId, $limit = 30)
    {
        return self::where('user_id', $userId)
            ->orderBy('spin_date', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get user's spin statistics
     */
    public static function getUserSpinStats($userId)
    {
        $totalSpins = self::where('user_id', $userId)->count();
        $totalCoinsEarned = self::where('user_id', $userId)->sum('coins_earned');
        $badgeSpins = self::where('user_id', $userId)->where('reward_type', 'badge')->count();
        
        return [
            'total_spins' => $totalSpins,
            'total_coins_earned' => $totalCoinsEarned,
            'badge_spins' => $badgeSpins,
            'average_coins_per_spin' => $totalSpins > 0 ? round($totalCoinsEarned / $totalSpins, 2) : 0,
        ];
    }
}