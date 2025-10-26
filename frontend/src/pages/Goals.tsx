import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { goalsApi } from '../services/api'
import { Goal } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target,
  PiggyBank,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const Goals: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  // Fetch goals
  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsApi.list(),
  })

  // Create goal mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Goal>) => goalsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      setShowForm(false)
      toast.success('Goal created successfully')
    },
    onError: () => {
      toast.error('Failed to create goal')
    },
  })

  // Update goal mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Goal> }) => 
      goalsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      setEditingGoal(null)
      toast.success('Goal updated successfully')
    },
    onError: () => {
      toast.error('Failed to update goal')
    },
  })

  // Delete goal mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => goalsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      toast.success('Goal deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete goal')
    },
  })

  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    saved_amount: '0',
    target_date: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      saved_amount: parseFloat(formData.saved_amount),
      status: 'active',
    }

    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      saved_amount: goal.saved_amount.toString(),
      target_date: goal.target_date,
    })
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteMutation.mutate(id)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      target_amount: '',
      saved_amount: '0',
      target_date: '',
    })
    setEditingGoal(null)
    setShowForm(false)
  }

  const getGoalStatus = (goal: Goal) => {
    const now = new Date()
    const targetDate = new Date(goal.target_date)
    const progress = (goal.saved_amount / goal.target_amount) * 100
    const daysRemaining = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (progress >= 100) return 'completed'
    if (daysRemaining < 0) return 'overdue'
    if (daysRemaining < 30) return 'urgent'
    return 'active'
  }

  const getGoalProgress = (goal: Goal) => {
    return (goal.saved_amount / goal.target_amount) * 100
  }

  const getDaysRemaining = (goal: Goal) => {
    const now = new Date()
    const targetDate = new Date(goal.target_date)
    return Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (goalsLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6">
      <div className="card-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Goals</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Set and track your financial objectives</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="font-bold">Create Goal</span>
          </button>
        </div>
      </div>

      {/* Goal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingGoal ? 'Edit Goal' : 'Create Goal'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.target_amount}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                  className="input"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount Saved
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.saved_amount}
                  onChange={(e) => setFormData({ ...formData, saved_amount: e.target.value })}
                  className="input"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Date
                </label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  className={`btn btn-md flex-1 ${
                    editingGoal 
                      ? 'btn-success' 
                      : 'btn-primary'
                  }`}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span className="font-semibold">{editingGoal ? 'Updating...' : 'Creating...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {editingGoal ? (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-semibold">Update</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="font-semibold">Create</span>
                        </>
                      )}
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary btn-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="font-semibold">Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-6">
        {goals?.length === 0 ? (
          <div className="card text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No goals created yet</p>
            <p className="text-sm text-gray-400 mt-2">Create your first financial goal to start saving</p>
          </div>
        ) : (
          goals?.map((goal: Goal) => {
            const progress = getGoalProgress(goal)
            const daysRemaining = getDaysRemaining(goal)
            const status = getGoalStatus(goal)
            const remaining = goal.target_amount - goal.saved_amount

            return (
              <div key={goal.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      status === 'completed' 
                        ? 'bg-green-100 text-green-600' 
                        : status === 'overdue' 
                        ? 'bg-red-100 text-red-600'
                        : status === 'urgent'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Target className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {goal.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Target: ${Number(goal.target_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Saved: ${Number(goal.saved_amount).toFixed(2)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {progress.toFixed(1)}% complete
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          status === 'completed' 
                            ? 'bg-green-500' 
                            : status === 'overdue' 
                            ? 'bg-red-500'
                            : status === 'urgent'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Status and Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Remaining: ${Number(remaining).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Target: {new Date(goal.target_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className={`text-sm ${
                          daysRemaining < 0 
                            ? 'text-red-600' 
                            : daysRemaining < 30 
                            ? 'text-yellow-600' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {daysRemaining < 0 
                            ? `${Math.abs(daysRemaining)} days overdue` 
                            : `${daysRemaining} days remaining`
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {status === 'completed' ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">Goal achieved!</span>
                          </>
                        ) : status === 'overdue' ? (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600">Overdue</span>
                          </>
                        ) : status === 'urgent' ? (
                          <>
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600">Urgent</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-blue-600">On track</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Goals