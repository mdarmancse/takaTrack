<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserLevel extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'current_level',
        'total_coins',
        'total_badges',
        'current_title',
        'achievements',
        'level_milestones',
    ];

    protected $casts = [
        'achievements' => 'array',
        'level_milestones' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Level titles based on level
     */
    public static function getLevelTitles()
    {
        return [
            1 => 'Saver',
            2 => 'Budgeter',
            3 => 'Smart Spender',
            4 => 'Financial Planner',
            5 => 'Money Manager',
            6 => 'Investment Starter',
            7 => 'Wealth Builder',
            8 => 'Financial Expert',
            9 => 'Money Master',
            10 => 'Finance Guru',
        ];
    }

    /**
     * Coins required for each level
     */
    public static function getLevelRequirements()
    {
        return [
            1 => 0,      // Starting level
            2 => 100,    // 100 coins
            3 => 300,    // 300 coins
            4 => 600,    // 600 coins
            5 => 1000,   // 1000 coins
            6 => 1500,   // 1500 coins
            7 => 2200,   // 2200 coins
            8 => 3000,   // 3000 coins
            9 => 4000,   // 4000 coins
            10 => 5000,  // 5000 coins
        ];
    }

    /**
     * Update user level based on total coins
     */
    public static function updateUserLevel($userId)
    {
        $userLevel = self::where('user_id', $userId)->first();
        
        if (!$userLevel) {
            $userLevel = self::create([
                'user_id' => $userId,
                'current_level' => 1,
                'total_coins' => 0,
                'total_badges' => 0,
                'current_title' => 'Saver',
                'achievements' => [],
                'level_milestones' => [],
            ]);
        }

        // Calculate total coins from rewards
        $totalCoins = UserReward::where('user_id', $userId)
            ->whereNotNull('claimed_at')
            ->sum('coins_earned');

        // Calculate total badges
        $totalBadges = UserReward::where('user_id', $userId)
            ->whereNotNull('claimed_at')
            ->whereNotNull('badge_name')
            ->count();

        // Determine new level
        $newLevel = 1;
        $levelRequirements = self::getLevelRequirements();
        
        foreach ($levelRequirements as $level => $requiredCoins) {
            if ($totalCoins >= $requiredCoins) {
                $newLevel = $level;
            }
        }

        // Check if level increased
        $levelIncreased = $newLevel > $userLevel->current_level;
        
        if ($levelIncreased) {
            $userLevel->awardLevelUp($newLevel);
        }

        // Update user level
        $userLevel->update([
            'current_level' => $newLevel,
            'total_coins' => $totalCoins,
            'total_badges' => $totalBadges,
            'current_title' => self::getLevelTitles()[$newLevel],
        ]);

        return $userLevel;
    }

    /**
     * Award level up rewards
     */
    private function awardLevelUp($newLevel)
    {
        $levelTitles = self::getLevelTitles();
        $title = $levelTitles[$newLevel];
        
        // Award level up coins
        $levelUpCoins = $newLevel * 50; // 50 coins per level
        
        UserReward::create([
            'user_id' => $this->user_id,
            'reward_type' => 'level_up',
            'reward_name' => "Level Up to {$title}",
            'description' => "Congratulations! You've reached level {$newLevel} and earned the title '{$title}'!",
            'coins_earned' => $levelUpCoins,
            'claimed_at' => now(),
        ]);

        // Add to achievements
        $achievements = $this->achievements ?? [];
        $achievements[] = [
            'type' => 'level_up',
            'level' => $newLevel,
            'title' => $title,
            'earned_at' => now()->toISOString(),
        ];
        
        $this->update(['achievements' => $achievements]);
    }

    /**
     * Get user's level progress
     */
    public function getLevelProgress()
    {
        $levelRequirements = self::getLevelRequirements();
        $currentLevel = $this->current_level;
        $nextLevel = $currentLevel + 1;
        
        $currentRequirement = $levelRequirements[$currentLevel] ?? 0;
        $nextRequirement = $levelRequirements[$nextLevel] ?? $currentRequirement;
        
        $progress = 0;
        if ($nextRequirement > $currentRequirement) {
            $progress = (($this->total_coins - $currentRequirement) / ($nextRequirement - $currentRequirement)) * 100;
        }
        
        return [
            'current_level' => $currentLevel,
            'next_level' => $nextLevel,
            'current_coins' => $this->total_coins,
            'coins_needed' => max(0, $nextRequirement - $this->total_coins),
            'progress_percentage' => min(100, max(0, $progress)),
            'current_title' => $this->current_title,
            'next_title' => self::getLevelTitles()[$nextLevel] ?? $this->current_title,
        ];
    }

    /**
     * Get user's recent achievements
     */
    public function getRecentAchievements($limit = 5)
    {
        $achievements = $this->achievements ?? [];
        return array_slice(array_reverse($achievements), 0, $limit);
    }
}