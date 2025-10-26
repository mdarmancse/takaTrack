import React, { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Lightbulb, 
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { aiApi } from '../services/api'
import LoadingSpinner from './LoadingSpinner'

interface SpendingInsightsProps {
  expenses: Array<{
    amount: number
    category: string
    description?: string
  }>
  onClose?: () => void
}

interface InsightsData {
  top_categories: Record<string, number>
  saving_suggestions: string[]
  forecast: number
  recommendations: string[]
}

const SpendingInsights: React.FC<SpendingInsightsProps> = ({ expenses, onClose }) => {
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analysisMutation = useMutation({
    mutationFn: (expenseData: typeof expenses) => aiApi.spendingInsights(expenseData),
    onSuccess: (data) => {
      // Handle the new API response structure
      const insightsData = {
        top_categories: data.top_categories || {},
        saving_suggestions: data.saving_suggestions || [],
        forecast: data.forecasted_spending || 0,
        recommendations: data.recommendations || []
      }
      setInsights(insightsData)
      setIsAnalyzing(false)
    },
    onError: (error) => {
      console.error('Analysis failed:', error)
      setIsAnalyzing(false)
    },
  })

  const handleAnalyze = () => {
    if (expenses.length === 0) return
    
    setIsAnalyzing(true)
    analysisMutation.mutate(expenses)
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const topCategories = insights?.top_categories ? Object.entries(insights.top_categories).map(([category, data]: [string, any]) => [
    category, 
    data.total_amount || data
  ]) : []

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Spending Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {expenses.length} transactions • ${totalAmount.toFixed(2)} total
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!insights && !isAnalyzing && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Get AI-Powered Insights
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Analyze your spending patterns and get personalized recommendations
          </p>
          <button
            onClick={handleAnalyze}
            className="btn btn-primary btn-md"
            disabled={expenses.length === 0}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analyze Spending
          </button>
        </div>
      )}

      {isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="flex items-center justify-center mb-4">
            <LoadingSpinner size="lg" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Analyzing Your Spending...
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Our AI is analyzing your financial patterns
          </p>
        </div>
      )}

      {insights && (
        <div className="space-y-6">
          {/* Top Categories */}
          {topCategories.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Top Spending Categories
              </h4>
              <div className="space-y-3">
                {topCategories.slice(0, 3).map(([category, amount], index) => {
                  const percentage = ((amount / totalAmount) * 100).toFixed(1)
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{category}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{percentage}% of total</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${amount.toFixed(2)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Saving Suggestions */}
          {insights.saving_suggestions && insights.saving_suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                Saving Opportunities
              </h4>
              <div className="space-y-2">
                {insights.saving_suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forecast */}
          {insights.forecast && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-orange-600" />
                Spending Forecast
              </h4>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Next Month Prediction</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ${insights.forecast.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">vs Current</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations && insights.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                AI Recommendations
              </h4>
              <div className="space-y-2">
                {insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Re-analyze button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleAnalyze}
              className="btn btn-outline btn-md w-full"
              disabled={isAnalyzing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              Re-analyze Spending
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpendingInsights
