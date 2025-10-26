import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gamificationApi } from '../services/api'
import { 
  RotateCcw, 
  Gift, 
  Coins,
  Star,
  Trophy,
  Sparkles,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SpinResult {
  success: boolean
  reward: {
    type: string
    value: string
    name: string
    description: string
    coins: number
  }
  message: string
}

interface CanSpinResponse {
  can_spin: boolean
  message: string
}

const SpinWheel: React.FC = () => {
  const queryClient = useQueryClient()
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Check if user can spin today
  const { data: canSpinData, isLoading: canSpinLoading } = useQuery({
    queryKey: ['gamification', 'can-spin'],
    queryFn: () => gamificationApi.canSpinToday(),
  })

  // Perform spin mutation
  const spinMutation = useMutation({
    mutationFn: () => gamificationApi.performDailySpin(),
    onSuccess: (data: SpinResult) => {
      setSpinResult(data)
      setShowResult(true)
      queryClient.invalidateQueries({ queryKey: ['gamification'] })
      toast.success(`You won: ${data.reward.name}! 🎉`)
    },
    onError: () => {
      toast.error('Failed to spin the wheel')
    },
  })

  const handleSpin = () => {
    if (isSpinning || !canSpinData?.can_spin) return
    
    setIsSpinning(true)
    spinMutation.mutate()
    
    // Simulate spinning animation
    setTimeout(() => {
      setIsSpinning(false)
    }, 3000)
  }

  const closeResult = () => {
    setShowResult(false)
    setSpinResult(null)
  }

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'coins': return Coins
      case 'badge': return Trophy
      case 'bonus': return Star
      default: return Gift
    }
  }

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'coins': return 'text-yellow-600'
      case 'badge': return 'text-purple-600'
      case 'bonus': return 'text-blue-600'
      default: return 'text-green-600'
    }
  }

  if (canSpinLoading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const canSpin = canSpinData?.can_spin || false

  return (
    <>
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Daily Spin Wheel
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Spin to win rewards every day!
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              🎰
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {canSpin ? 'Ready to spin!' : 'Already spun today'}
            </div>
          </div>
        </div>

        {/* Spin Wheel Visual */}
        <div className="mb-6">
          <div className="relative w-48 h-48 mx-auto">
            {/* Wheel Background */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg">
              <div className="absolute inset-2 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isSpinning ? '🎯' : '🎰'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {isSpinning ? 'Spinning...' : 'Daily Spin'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Spinning Animation */}
            {isSpinning && (
              <div className="absolute inset-0 rounded-full border-4 border-yellow-400 animate-spin"></div>
            )}
            
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
            </div>
          </div>
        </div>

        {/* Spin Button */}
        <div className="text-center">
          <button
            onClick={handleSpin}
            disabled={!canSpin || isSpinning}
            className={`btn btn-lg w-full ${
              canSpin && !isSpinning
                ? 'btn-primary' 
                : 'btn-secondary opacity-50 cursor-not-allowed'
            }`}
          >
            {isSpinning ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Spinning...
              </div>
            ) : canSpin ? (
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Spin the Wheel!
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <X className="w-5 h-5" />
                Already Spun Today
              </div>
            )}
          </button>
        </div>

        {/* Rewards Info */}
        <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Possible Rewards
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1 text-yellow-600">
              <Coins className="w-3 h-3" />
              10-100 Coins
            </div>
            <div className="flex items-center gap-1 text-purple-600">
              <Trophy className="w-3 h-3" />
              Special Badges
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <Star className="w-3 h-3" />
              Bonus Rewards
            </div>
            <div className="flex items-center gap-1 text-green-600">
              <Gift className="w-3 h-3" />
              Daily Surprises
            </div>
          </div>
        </div>
      </div>

      {/* Spin Result Modal */}
      {showResult && spinResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Congratulations! 🎉
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {spinResult.reward.description}
              </p>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                {React.createElement(getRewardIcon(spinResult.reward.type), {
                  className: `w-6 h-6 ${getRewardColor(spinResult.reward.type)}`
                })}
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {spinResult.reward.name}
                </span>
              </div>
              {spinResult.reward.coins > 0 && (
                <div className="text-2xl font-bold text-yellow-600">
                  +{spinResult.reward.coins} Coins
                </div>
              )}
            </div>

            <button
              onClick={closeResult}
              className="btn btn-primary w-full"
            >
              Awesome! Let's Continue
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default SpinWheel
