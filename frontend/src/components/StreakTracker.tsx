import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gamificationApi } from '../services/api'
import { 
  Flame, 
  Trophy, 
  Calendar,
  Star,
  Award,
  Target
} from 'lucide-react'
import toast from 'react-hot-toast'

interface StreakData {
  streak_count: number
  last_logged_date: string | null
  badges_earned: string[]
  can_log_today: boolean
}

const StreakTracker: React.FC = () => {
  const queryClient = useQueryClient()
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch streak data
  const { data: streakData, isLoading } = useQuery({
    queryKey: ['gamification', 'streak'],
    queryFn: () => gamificationApi.getStreak(),
  })

  // Update streak mutation
  const updateStreakMutation = useMutation({
    mutationFn: () => gamificationApi.updateStreak(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gamification'] })
      toast.success(`Streak updated! You're on day ${data.streak_count}! 🔥`)
    },
    onError: () => {
      toast.error('Failed to update streak')
    },
  })

  const handleUpdateStreak = () => {
    if (isUpdating) return
    setIsUpdating(true)
    updateStreakMutation.mutate()
    setTimeout(() => setIsUpdating(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const streak = streakData as StreakData
  const streakCount = streak?.streak_count || 0
  const badges = streak?.badges_earned || []

  // Get streak badge info
  const getStreakBadge = (count: number) => {
    if (count >= 100) return { icon: Trophy, color: 'text-yellow-500', name: 'Streak Master' }
    if (count >= 30) return { icon: Star, color: 'text-purple-500', name: 'Streak Champion' }
    if (count >= 7) return { icon: Award, color: 'text-blue-500', name: 'Streak Keeper' }
    return { icon: Flame, color: 'text-orange-500', name: 'Getting Started' }
  }

  const badgeInfo = getStreakBadge(streakCount)
  const BadgeIcon = badgeInfo.icon

  return (
    <div className="card bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
            <BadgeIcon className={`w-5 h-5 ${badgeInfo.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {badgeInfo.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Keep your streak alive!
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {streakCount}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            day{streakCount !== 1 ? 's' : ''} streak
          </div>
        </div>
      </div>

      {/* Streak Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Streak Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {streakCount} / 30 days
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (streakCount / 30) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Badges Earned */}
      {badges.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Badges Earned
          </h4>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <div 
                key={index}
                className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full text-xs font-medium text-orange-700 dark:text-orange-300"
              >
                <Award className="w-3 h-3" />
                {badge.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {streak?.can_log_today ? (
            <span className="text-green-600 dark:text-green-400">
              ✓ Ready to log today's expense
            </span>
          ) : (
            <span className="text-gray-500">
              Last logged: {streak?.last_logged_date ? new Date(streak.last_logged_date).toLocaleDateString() : 'Never'}
            </span>
          )}
        </div>
        <button
          onClick={handleUpdateStreak}
          disabled={!streak?.can_log_today || isUpdating}
          className={`btn btn-md ${
            streak?.can_log_today 
              ? 'btn-primary' 
              : 'btn-secondary opacity-50 cursor-not-allowed'
          }`}
        >
          {isUpdating ? (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Updating...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Log Today
            </div>
          )}
        </button>
      </div>

      {/* Streak Tips */}
      <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Target className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-orange-700 dark:text-orange-300">
            <strong>Tip:</strong> Log your expenses daily to maintain your streak and earn badges!
          </div>
        </div>
      </div>
    </div>
  )
}

export default StreakTracker
