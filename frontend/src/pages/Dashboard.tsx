import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { transactionsApi } from '../services/api'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  PiggyBank,
  MessageCircle,
  BarChart3,
  Bot
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import ChatAssistant from '../components/ChatAssistant'
import SpendingInsights from '../components/SpendingInsights'
import StreakTracker from '../components/StreakTracker'
import SpinWheel from '../components/SpinWheel'
import { useNavigate } from 'react-router-dom'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [showSpendingInsights, setShowSpendingInsights] = useState(false)

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['transactions', 'summary'],
    queryFn: () => transactionsApi.summary(),
  })

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => transactionsApi.list({ per_page: 5, sort_by: 'date', sort_order: 'desc' }),
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (summaryLoading || transactionsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's your financial overview
          </p>
        </div>
        <button 
          onClick={() => navigate('/transactions')}
          className="btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="font-bold">Add Transaction</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-md flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(summary?.summary?.income || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-md flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatCurrency(summary?.summary?.expenses || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-md flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Balance</p>
              <p className={`text-2xl font-semibold ${
                (summary?.summary?.net || 0) >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(summary?.summary?.net || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-md flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {recentTransactions?.data?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
            <button className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions?.data?.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 dark:bg-green-900' 
                      : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.category?.name || 'Unknown Category'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    transaction.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => navigate('/transactions')}
              className="btn btn-primary btn-md w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="font-semibold">Add Income</span>
            </button>
            <button 
              onClick={() => navigate('/transactions')}
              className="btn btn-outline btn-md w-full"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              <span className="font-semibold">Add Expense</span>
            </button>
            <button 
              onClick={() => navigate('/budgets')}
              className="btn btn-success btn-md w-full"
            >
              <Target className="w-4 h-4 mr-2" />
              <span className="font-semibold">Set Budget</span>
            </button>
            <button 
              onClick={() => navigate('/goals')}
              className="btn btn-warning btn-md w-full"
            >
              <PiggyBank className="w-4 h-4 mr-2" />
              <span className="font-semibold">Create Goal</span>
            </button>
            <button 
              onClick={() => setIsChatOpen(true)}
              className="btn btn-primary btn-md w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <span className="font-semibold">AI Finance Advisor</span>
            </button>
            <button 
              onClick={() => setShowSpendingInsights(true)}
              className="btn btn-outline btn-md w-full"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="font-semibold">Spending Analysis</span>
            </button>
          </div>
        </div>

        {/* Gamification Features Section */}
        <div className="card bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <span className="text-xl">🎮</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gamification Hub</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Earn rewards, track streaks, and level up!</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/gamification')}
              className="btn btn-primary btn-md w-full"
            >
              <span className="text-lg mr-2">🏆</span>
              <span className="font-semibold">View Progress</span>
            </button>
            <button 
              onClick={() => navigate('/gamification')}
              className="btn btn-outline btn-md w-full"
            >
              <span className="text-lg mr-2">🎯</span>
              <span className="font-semibold">Set Goals</span>
            </button>
          </div>
        </div>

        {/* AI Features Section */}
        <div className="card bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Powered Insights</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized financial advice</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => setIsChatOpen(true)}
              className="btn btn-primary btn-md w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <span className="font-semibold">Chat with AI</span>
            </button>
            <button 
              onClick={() => setShowSpendingInsights(true)}
              className="btn btn-outline btn-md w-full"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="font-semibold">Analyze Spending</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gamification Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StreakTracker />
        <SpinWheel />
      </div>

      {/* AI Components */}
      <ChatAssistant 
        isOpen={isChatOpen} 
        onToggle={() => setIsChatOpen(!isChatOpen)} 
      />
      
      {showSpendingInsights && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <SpendingInsights 
              expenses={recentTransactions?.data?.map(t => ({
                amount: Number(t.amount),
                category: t.category?.name || 'Other',
                description: t.description
              })) || []}
              onClose={() => setShowSpendingInsights(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
