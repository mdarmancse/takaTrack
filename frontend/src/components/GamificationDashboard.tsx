import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gamificationApi } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import StreakTracker from './StreakTracker'
import GoalProgressBar from './GoalProgressBar'
import SpinWheel from './SpinWheel'
import { 
  Trophy, 
  Target, 
  Star,
  Coins,
  Award,
  TrendingUp,
  Calendar,
  Plus,
  X
} from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

interface GamificationData {
  streak: {
    count: number
    last_logged: string | null
    badges: string[]
  }
  level: {
    current_level: number
    current_title: string
    total_coins: number
    total_badges: number
    progress: {
      current_level: number
      next_level: number
      current_coins: number
      coins_needed: number
      progress_percentage: number
      current_title: string
      next_title: string
    }
  }
  goals: {
    active_count: number
    active_goals: any[]
  }
  daily_spin: {
    can_spin: boolean
  }
  recent_rewards: any[]
}

const GamificationDashboard: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'rewards'>('overview')
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [goalFormData, setGoalFormData] = useState({
    goal_name: '',
    description: '',
    target_amount: '',
    target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    goal_type: 'savings'
  })


  // Fetch gamification dashboard data
  const { data: gamificationData, isLoading } = useQuery({
    queryKey: ['gamification', 'dashboard'],
    queryFn: () => gamificationApi.getDashboard(),
  })

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: (data: any) => gamificationApi.createGoal(data),
    onSuccess: (response) => {
      // Close form and show success message
      setShowGoalForm(false)
      toast.success('Goal created successfully! 🎯')
      
      // Reset form data
      setGoalFormData({
        goal_name: '',
        description: '',
        target_amount: '',
        target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        goal_type: 'savings'
      })
      
      // Use refetch instead of invalidate to avoid state update issues
      setTimeout(() => {
        try {
          queryClient.refetchQueries({ queryKey: ['gamification'] })
        } catch (error) {
          console.error('Error refetching queries:', error)
        }
      }, 200)
    },
    onError: (error: any) => {
      console.error('Goal creation error:', error)
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.errors || 
                          'Failed to create goal. Please try again.'
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to create goal. Please try again.')
    },
  })

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (goalFormData.goal_name && goalFormData.target_amount && goalFormData.target_date) {
      createGoalMutation.mutate(goalFormData)
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  const data = gamificationData as GamificationData

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            🎮 Gamification Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your progress, earn rewards, and level up your financial journey!
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {data?.level?.total_coins || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Coins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {data?.level?.current_level || 1}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Level</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: Trophy },
          { id: 'goals', label: 'Goals', icon: Target },
          { id: 'rewards', label: 'Rewards', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Level Progress */}
          <div className="card bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {data?.level?.current_title || 'Saver'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Level {data?.level?.current_level || 1}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {data?.level?.total_coins || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Coins
                </div>
              </div>
            </div>

            {/* Level Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress to Next Level
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {data?.level?.progress?.current_coins || 0} / {data?.level?.progress?.coins_needed || 0} coins
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${data?.level?.progress?.progress_percentage || 0}%` }}
                ></div>
              </div>
              <div className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                Next: {data?.level?.progress?.next_title || 'Budgeter'}
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.streak?.count || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Day Streak
              </div>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.goals?.active_count || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Goals
              </div>
            </div>

            <div className="card text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {data?.level?.total_badges || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Badges Earned
              </div>
            </div>
          </div>

          {/* Streak Tracker */}
          <StreakTracker />

          {/* Daily Spin */}
          <SpinWheel />
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Goals
            </h2>
            <button 
              onClick={() => setShowGoalForm(true)}
              className="btn btn-primary btn-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </button>
          </div>

          {data?.goals?.active_goals?.length > 0 ? (
            <div className="space-y-4">
              {data.goals.active_goals.map((goal: any) => (
                <GoalProgressBar key={goal.id} goal={goal} />
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Active Goals
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first financial goal to start tracking your progress!
              </p>
              <button 
                onClick={() => setShowGoalForm(true)}
                className="btn btn-primary btn-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </button>
            </div>
          )}
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recent Rewards
          </h2>

          {data?.recent_rewards?.length > 0 ? (
            <div className="space-y-4">
              {data.recent_rewards.map((reward: any, index: number) => (
                <div key={index} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                        <Coins className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {reward.reward_name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {reward.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-600">
                        +{reward.coins_earned}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Coins
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Rewards Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start logging expenses and completing goals to earn your first rewards!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Goal Creation Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Create New Goal
              </h3>
              <button
                onClick={() => setShowGoalForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Name *
                </label>
                <input
                  type="text"
                  value={goalFormData.goal_name}
                  onChange={(e) => setGoalFormData({...goalFormData, goal_name: e.target.value})}
                  className="input"
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={goalFormData.description}
                  onChange={(e) => setGoalFormData({...goalFormData, description: e.target.value})}
                  className="input min-h-[80px] resize-none"
                  placeholder="Describe your goal..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={goalFormData.target_amount}
                    onChange={(e) => setGoalFormData({...goalFormData, target_amount: e.target.value})}
                    className="input"
                    placeholder="1000.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Date *
                  </label>
                  <input
                    type="date"
                    value={goalFormData.target_date}
                    onChange={(e) => setGoalFormData({...goalFormData, target_date: e.target.value})}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Type
                </label>
                <select
                  value={goalFormData.goal_type}
                  onChange={(e) => setGoalFormData({...goalFormData, goal_type: e.target.value})}
                  className="input"
                >
                  <option value="savings">Savings</option>
                  <option value="spending_limit">Spending Limit</option>
                  <option value="investment">Investment</option>
                  <option value="debt_payoff">Debt Payoff</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={createGoalMutation.isPending}
                  className="btn btn-primary btn-md flex-1"
                >
                  {createGoalMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Creating...
                    </div>
                  ) : createGoalMutation.isError ? (
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Try Again
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Create Goal
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGoalForm(false)}
                  className="btn btn-secondary btn-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GamificationDashboard
