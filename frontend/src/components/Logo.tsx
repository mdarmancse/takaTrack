import React from 'react'
import { DollarSign, TrendingUp, Target } from 'lucide-react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        {/* Main circle */}
        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
          <DollarSign className="w-3/5 h-3/5 text-white" />
        </div>
        
        {/* Trending up indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
          <TrendingUp className="w-2 h-2 text-white" />
        </div>
        
        {/* Target ring */}
        <div className="absolute inset-0 border-2 border-blue-300 rounded-full animate-pulse"></div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
            TakaTrack
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
            Personal Finance
          </span>
        </div>
      )}
    </div>
  )
}

export default Logo
