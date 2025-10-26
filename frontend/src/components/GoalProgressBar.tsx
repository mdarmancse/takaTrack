import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gamificationApi } from '../services/api'
import { 
  Target, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Plus,
  CheckCircle,
  Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Goal {
  id: number
  goal_name: string
  description: string
  target_amount: number
  current_amount: number
  start_date: string
  target_date: string
  goal_type: string
  status: string
}

interface GoalProgressBarProps {
  goal: Goal
  onUpdate?: () => void
}

const GoalProgressBar: React.FC<GoalProgressBarProps> = ({ goal, onUpdate }) => {
  const queryClient = useQueryClient()
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [updateAmount, setUpdateAmount] = useState('')

  // Calculate progress percentage and days remaining
  const progressPercentage = goal.target_amount > 0 ? 
    Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100 * 100) / 100) : 0
  
  const daysRemaining = Math.max(0, Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
  
  const isCompleted = goal.status === 'completed'
  const isOverdue = daysRemaining < 0 && !isCompleted

  // Update goal progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: (amount: number) => gamificationApi.updateGoalProgress(goal.id, amount),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gamification', 'goals'] })
      const newProgressPercentage = data.goal.target_amount > 0 ? 
        Math.min(100, Math.round((data.goal.current_amount / data.goal.target_amount) * 100 * 100) / 100) : 0
      toast.success(`Goal progress updated! ${newProgressPercentage.toFixed(1)}% complete!`)
      setShowUpdateForm(false)
      setUpdateAmount('')
      onUpdate?.()
    },
    onError: () => {
      toast.error('Failed to update goal progress')
    },
  })

  const handleUpdateProgress = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(updateAmount)
    if (amount > 0) {
      updateProgressMutation.mutate(amount)
    }
  }

  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'savings': return DollarSign
      case 'investment': return TrendingUp
      case 'debt_payoff': return Target
      default: return Target
    }
  }

  const getGoalColor = (type: string) => {
    switch (type) {
      case 'savings': return 'text-green-600'
      case 'investment': return 'text-blue-600'
      case 'debt_payoff': return 'text-red-600'
      default: return 'text-purple-600'
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'from-green-400 to-green-600'
    if (percentage >= 75) return 'from-blue-400 to-blue-600'
    if (percentage >= 50) return 'from-yellow-400 to-yellow-600'
    return 'from-orange-400 to-red-500'
  }

  const GoalIcon = getGoalIcon(goal.goal_type)
  const goalColor = getGoalColor(goal.goal_type)
  const progressColor = getProgressColor(progressPercentage)

  return (
    <div className="card bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center`}>
            <GoalIcon className={`w-5 h-5 ${goalColor}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {goal.goal_name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {goal.description || 'No description provided'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {progressPercentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isCompleted ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                Completed
              </div>
            ) : isOverdue ? (
              <div className="flex items-center gap-1 text-red-600">
                <Clock className="w-4 h-4" />
                Overdue
              </div>
            ) : (
              <div className="flex items-center gap-1 text-blue-600">
                <Calendar className="w-4 h-4" />
                {daysRemaining} days left
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            ${goal.current_amount.toLocaleString()} / ${goal.target_amount.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={`bg-gradient-to-r ${progressColor} h-3 rounded-full transition-all duration-500 relative overflow-hidden`}
            style={{ width: `${Math.min(100, progressPercentage)}%` }}
          >
            {progressPercentage >= 100 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            )}
          </div>
        </div>
      </div>

      {/* Goal Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${goal.target_amount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Target Amount
          </div>
        </div>
        <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${(goal.target_amount - goal.current_amount).toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Remaining
          </div>
        </div>
      </div>

      {/* Update Progress Form */}
      {!isCompleted && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          {!showUpdateForm ? (
            <button
              onClick={() => setShowUpdateForm(true)}
              className="btn btn-outline btn-md w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Update Progress
            </button>
          ) : (
            <form onSubmit={handleUpdateProgress} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount to Add
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={updateAmount}
                  onChange={(e) => setUpdateAmount(e.target.value)}
                  className="input"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={updateProgressMutation.isPending}
                  className="btn btn-primary btn-md flex-1"
                >
                  {updateProgressMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Updating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Update Progress
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateForm(false)
                    setUpdateAmount('')
                  }}
                  className="btn btn-secondary btn-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Completion Celebration */}
      {isCompleted && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="text-sm text-green-700 dark:text-green-300">
              <strong>Congratulations!</strong> You've achieved your goal! 🎉
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoalProgressBar
