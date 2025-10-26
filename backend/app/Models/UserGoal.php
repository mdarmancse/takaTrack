<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserGoal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'goal_name',
        'description',
        'target_amount',
        'current_amount',
        'start_date',
        'target_date',
        'goal_type',
        'status',
        'milestones',
    ];

    protected $casts = [
        'target_amount' => 'decimal:2',
        'current_amount' => 'decimal:2',
        'start_date' => 'date',
        'target_date' => 'date',
        'milestones' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get progress percentage
     */
    public function getProgressPercentageAttribute()
    {
        if ($this->target_amount <= 0) return 0;
        return min(100, round(($this->current_amount / $this->target_amount) * 100, 2));
    }

    /**
     * Get days remaining
     */
    public function getDaysRemainingAttribute()
    {
        return max(0, now()->diffInDays($this->target_date, false));
    }

    /**
     * Check if goal is completed
     */
    public function isCompleted()
    {
        return $this->current_amount >= $this->target_amount;
    }

    /**
     * Update goal progress
     */
    public function updateProgress($amount)
    {
        $this->current_amount += $amount;
        
        // Check if goal is completed
        if ($this->isCompleted() && $this->status === 'active') {
            $this->status = 'completed';
            $this->awardGoalCompletion();
        }
        
        $this->save();
        
        // Check milestones
        $this->checkMilestones();
    }

    /**
     * Award coins for goal completion
     */
    private function awardGoalCompletion()
    {
        $coins = $this->calculateGoalCoins();
        
        UserReward::create([
            'user_id' => $this->user_id,
            'reward_type' => 'goal_completion',
            'reward_name' => 'Goal Achieved: ' . $this->goal_name,
            'description' => "Congratulations! You've achieved your goal of {$this->target_amount}.",
            'coins_earned' => $coins,
            'claimed_at' => now(),
        ]);

        UserLevel::updateUserLevel($this->user_id);
    }

    /**
     * Calculate coins for goal completion
     */
    private function calculateGoalCoins()
    {
        $baseCoins = 100;
        $amountMultiplier = $this->target_amount / 1000; // 1 coin per 1000 units
        $timeMultiplier = $this->getDaysRemainingAttribute() > 0 ? 1.5 : 1; // Bonus for early completion
        
        return (int) ($baseCoins + ($amountMultiplier * $timeMultiplier));
    }

    /**
     * Check and award milestone badges
     */
    private function checkMilestones()
    {
        $progress = $this->progress_percentage;
        $milestones = $this->milestones ?? [];
        
        // 25% milestone
        if ($progress >= 25 && !in_array('25_percent', $milestones)) {
            $this->awardMilestone('25% Progress', 25);
            $milestones[] = '25_percent';
        }
        
        // 50% milestone
        if ($progress >= 50 && !in_array('50_percent', $milestones)) {
            $this->awardMilestone('50% Progress', 50);
            $milestones[] = '50_percent';
        }
        
        // 75% milestone
        if ($progress >= 75 && !in_array('75_percent', $milestones)) {
            $this->awardMilestone('75% Progress', 75);
            $milestones[] = '75_percent';
        }
        
        $this->update(['milestones' => $milestones]);
    }

    /**
     * Award milestone reward
     */
    private function awardMilestone($milestoneName, $percentage)
    {
        UserReward::create([
            'user_id' => $this->user_id,
            'reward_type' => 'milestone',
            'reward_name' => $milestoneName,
            'description' => "Great progress! You've reached {$percentage}% of your goal.",
            'coins_earned' => $percentage, // Coins equal to percentage
            'claimed_at' => now(),
        ]);
    }

    /**
     * Get active goals for user
     */
    public static function getActiveGoals($userId)
    {
        return self::where('user_id', $userId)
            ->where('status', 'active')
            ->orderBy('target_date')
            ->get();
    }

    /**
     * Get completed goals for user
     */
    public static function getCompletedGoals($userId)
    {
        return self::where('user_id', $userId)
            ->where('status', 'completed')
            ->orderBy('updated_at', 'desc')
            ->get();
    }
}