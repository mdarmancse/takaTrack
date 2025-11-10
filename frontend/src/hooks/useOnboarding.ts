import { useState, useEffect } from 'react'

const ONBOARDING_COMPLETED_KEY = 'takatrack_onboarding_completed'
const ONBOARDING_SKIPPED_KEY = 'takatrack_onboarding_skipped'

export const useOnboarding = () => {
  const [showTour, setShowTour] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)

  useEffect(() => {
    // Check if user has completed or skipped onboarding
    const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true'
    const skipped = localStorage.getItem(ONBOARDING_SKIPPED_KEY) === 'true'
    
    if (!completed && !skipped) {
      // Show tour after a short delay
      const timer = setTimeout(() => {
        setShowTour(true)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setHasCompleted(true)
    }
  }, [])

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true')
    setShowTour(false)
    setHasCompleted(true)
  }

  const skipOnboarding = () => {
    localStorage.setItem(ONBOARDING_SKIPPED_KEY, 'true')
    setShowTour(false)
    setHasCompleted(true)
  }

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY)
    localStorage.removeItem(ONBOARDING_SKIPPED_KEY)
    setHasCompleted(false)
    setShowTour(true)
  }

  return {
    showTour,
    hasCompleted,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  }
}

