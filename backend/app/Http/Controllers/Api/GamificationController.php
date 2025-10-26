<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserStreak;
use App\Models\UserGoal;
use App\Models\UserChallenge;
use App\Models\UserReward;
use App\Models\UserLevel;
use App\Models\DailySpin;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class GamificationController extends Controller
{
    /**
     * Get user's streak information
     */
    public function getStreak(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        
        $streak = UserStreak::where('user_id', $userId)
            ->where('streak_type', 'expense_logging')
            ->first();

        if (!$streak) {
            $streak = UserStreak::create([
                'user_id' => $userId,
                'streak_count' => 0,
                'streak_type' => 'expense_logging',
                'badges_earned' => [],
            ]);
        }

        return response()->json([
            'streak_count' => $streak->streak_count,
            'last_logged_date' => $streak->last_logged_date,
            'badges_earned' => $streak->badges_earned ?? [],
            'can_log_today' => $streak->last_logged_date !== now()->toDateString(),
        ]);
    }

    /**
     * Update user streak (called when user logs an expense)
     */
    public function updateStreak(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $streakType = $request->input('streak_type', 'expense_logging');
        
        $streak = UserStreak::updateStreak($userId, $streakType);
        
        return response()->json([
            'success' => true,
            'streak_count' => $streak->streak_count,
            'last_logged_date' => $streak->last_logged_date,
            'badges_earned' => $streak->badges_earned ?? [],
        ]);
    }

    /**
     * Get user's goals
     */
    public function getGoals(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        
        $activeGoals = UserGoal::getActiveGoals($userId);
        $completedGoals = UserGoal::getCompletedGoals($userId);
        
        return response()->json([
            'active_goals' => $activeGoals,
            'completed_goals' => $completedGoals,
        ]);
    }

    /**
     * Create a new goal
     */
    public function createGoal(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'goal_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_amount' => 'required|numeric|min:0.01',
            'target_date' => 'required|date|after_or_equal:today',
            'goal_type' => 'required|in:savings,spending_limit,investment,debt_payoff',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $userId = $request->user()->id;
        
        $goal = UserGoal::create([
            'user_id' => $userId,
            'goal_name' => $request->goal_name,
            'description' => $request->description,
            'target_amount' => $request->target_amount,
            'current_amount' => 0,
            'start_date' => now()->toDateString(),
            'target_date' => $request->target_date,
            'goal_type' => $request->goal_type,
            'status' => 'active',
            'milestones' => [],
        ]);

        return response()->json([
            'success' => true,
            'goal' => $goal,
        ]);
    }

    /**
     * Update goal progress
     */
    public function updateGoalProgress(Request $request, $goalId): JsonResponse
    {
        $userId = $request->user()->id;
        
        $goal = UserGoal::where('user_id', $userId)
            ->where('id', $goalId)
            ->first();

        if (!$goal) {
            return response()->json([
                'success' => false,
                'message' => 'Goal not found',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $goal->updateProgress($request->amount);
        
        return response()->json([
            'success' => true,
            'goal' => $goal->fresh(),
            'progress_percentage' => $goal->progress_percentage,
            'is_completed' => $goal->isCompleted(),
        ]);
    }

    /**
     * Get user's level information
     */
    public function getUserLevel(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        
        $userLevel = UserLevel::where('user_id', $userId)->first();
        
        if (!$userLevel) {
            $userLevel = UserLevel::updateUserLevel($userId);
        }

        $levelProgress = $userLevel->getLevelProgress();
        $recentAchievements = $userLevel->getRecentAchievements();
        
        return response()->json([
            'current_level' => $userLevel->current_level,
            'current_title' => $userLevel->current_title,
            'total_coins' => $userLevel->total_coins,
            'total_badges' => $userLevel->total_badges,
            'level_progress' => $levelProgress,
            'recent_achievements' => $recentAchievements,
        ]);
    }

    /**
     * Perform daily spin
     */
    public function performDailySpin(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        
        $result = DailySpin::performSpin($userId);
        
        if (!$result['success']) {
            return response()->json($result, 400);
        }

        // Update user level
        UserLevel::updateUserLevel($userId);
        
        return response()->json([
            'success' => true,
            'reward' => $result['reward'],
            'message' => 'Spin completed successfully!',
        ]);
    }

    /**
     * Check if user can spin today
     */
    public function canSpinToday(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        
        $canSpin = DailySpin::canSpinToday($userId);
        
        return response()->json([
            'can_spin' => $canSpin,
            'message' => $canSpin ? 'You can spin today!' : 'You have already spun today!',
        ]);
    }

    /**
     * Get user's spin history
     */
    public function getSpinHistory(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        
        $spinHistory = DailySpin::getUserSpinHistory($userId, 30);
        $spinStats = DailySpin::getUserSpinStats($userId);
        
        return response()->json([
            'spin_history' => $spinHistory,
            'spin_stats' => $spinStats,
        ]);
    }

    /**
     * Get user's rewards
     */
    public function getUserRewards(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        
        $recentRewards = UserReward::getUserRecentRewards($userId, 20);
        $rewardStats = UserReward::getUserRewardStats($userId);
        $unclaimedRewards = UserReward::getUnclaimedRewards($userId);
        
        return response()->json([
            'recent_rewards' => $recentRewards,
            'reward_stats' => $rewardStats,
            'unclaimed_rewards' => $unclaimedRewards,
        ]);
    }

    /**
     * Claim a reward
     */
    public function claimReward(Request $request, $rewardId): JsonResponse
    {
        $userId = $request->user()->id;
        
        $reward = UserReward::where('user_id', $userId)
            ->where('id', $rewardId)
            ->first();

        if (!$reward) {
            return response()->json([
                'success' => false,
                'message' => 'Reward not found',
            ], 404);
        }

        if ($reward->claimed_at) {
            return response()->json([
                'success' => false,
                'message' => 'Reward already claimed',
            ], 400);
        }

        $reward->claim();
        
        return response()->json([
            'success' => true,
            'message' => 'Reward claimed successfully!',
            'reward' => $reward->fresh(),
        ]);
    }

    /**
     * Get gamification dashboard data
     */
    public function getDashboard(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        
        // Get all gamification data
        $streak = UserStreak::where('user_id', $userId)
            ->where('streak_type', 'expense_logging')
            ->first();
            
        $userLevel = UserLevel::where('user_id', $userId)->first();
        if (!$userLevel) {
            $userLevel = UserLevel::updateUserLevel($userId);
        }
        
        $activeGoals = UserGoal::getActiveGoals($userId);
        $canSpin = DailySpin::canSpinToday($userId);
        $recentRewards = UserReward::getUserRecentRewards($userId, 5);
        
        return response()->json([
            'streak' => [
                'count' => $streak?->streak_count ?? 0,
                'last_logged' => $streak?->last_logged_date,
                'badges' => $streak?->badges_earned ?? [],
            ],
            'level' => [
                'current_level' => $userLevel->current_level,
                'current_title' => $userLevel->current_title,
                'total_coins' => $userLevel->total_coins,
                'total_badges' => $userLevel->total_badges,
                'progress' => $userLevel->getLevelProgress(),
            ],
            'goals' => [
                'active_count' => $activeGoals->count(),
                'active_goals' => $activeGoals,
            ],
            'daily_spin' => [
                'can_spin' => $canSpin,
            ],
            'recent_rewards' => $recentRewards,
        ]);
    }
}