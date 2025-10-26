import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { budgetsApi, categoriesApi, transactionsApi } from '../services/api'
import { Budget, Category } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Target,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'

const Budgets: React.FC = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  // Fetch budgets
  const { data: budgets, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.list(),
  })

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  })

  // Fetch transactions for spending calculation
  const { data: transactionsData } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionsApi.list(),
  })

  // Create budget mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Budget>) => budgetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      setShowForm(false)
      toast.success('Budget created successfully')
    },
    onError: () => {
      toast.error('Failed to create budget')
    },
  })

  // Update budget mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Budget> }) => 
      budgetsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      setEditingBudget(null)
      toast.success('Budget updated successfully')
    },
    onError: () => {
      toast.error('Failed to update budget')
    },
  })

  // Delete budget mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => budgetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Budget deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete budget')
    },
  })

  const [formData, setFormData] = useState({
    category_id: '',
    limit_amount: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM format
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...formData,
      limit_amount: parseFloat(formData.limit_amount),
      spent_amount: 0, // Will be calculated by backend
    }

    if (editingBudget) {
      updateMutation.mutate({ id: editingBudget.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setFormData({
      category_id: budget.category_id.toString(),
      limit_amount: budget.limit_amount.toString(),
      month: budget.month,
    })
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteMutation.mutate(id)
    }
  }

  const resetForm = () => {
    setFormData({
      category_id: '',
      limit_amount: '',
      month: new Date().toISOString().slice(0, 7),
    })
    setEditingBudget(null)
    setShowForm(false)
  }

  // Calculate spending for each budget
  const calculateSpending = (budget: Budget) => {
    if (!transactionsData?.data) return 0
    
    const budgetDate = new Date(budget.month)
    const startOfMonth = new Date(budgetDate.getFullYear(), budgetDate.getMonth(), 1)
    const endOfMonth = new Date(budgetDate.getFullYear(), budgetDate.getMonth() + 1, 0)
    
    return transactionsData.data
      .filter((transaction: any) => {
        const transactionDate = new Date(transaction.date)
        return (
          transaction.category_id === budget.category_id &&
          transaction.type === 'expense' &&
          transactionDate >= startOfMonth &&
          transactionDate <= endOfMonth
        )
      })
      .reduce((sum: number, transaction: any) => sum + transaction.amount, 0)
  }

  const getBudgetStatus = (budget: Budget) => {
    const spent = calculateSpending(budget)
    const percentage = (spent / budget.limit_amount) * 100
    
    if (percentage >= 100) return 'exceeded'
    if (percentage >= 80) return 'warning'
    return 'good'
  }

  if (budgetsLoading || categoriesLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6">
      <div className="card-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budgets</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Set and track your spending limits</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="font-bold">Create Budget</span>
          </button>
        </div>
      </div>

      {/* Budget Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingBudget ? 'Edit Budget' : 'Create Budget'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Category</option>
                  {categories?.filter((cat: Category) => cat.type === 'expense').map((category: Category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.limit_amount}
                  onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
                  className="input"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Month
                </label>
                <input
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  className={`btn btn-md flex-1 ${
                    editingBudget 
                      ? 'btn-success' 
                      : 'btn-primary'
                  }`}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span className="font-semibold">{editingBudget ? 'Updating...' : 'Creating...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {editingBudget ? (
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

      {/* Budgets List */}
      <div className="space-y-6">
        {budgets?.length === 0 ? (
          <div className="card text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No budgets created yet</p>
            <p className="text-sm text-gray-400 mt-2">Create your first budget to start tracking your spending</p>
          </div>
        ) : (
          budgets?.map((budget: Budget) => {
            const spent = calculateSpending(budget)
            const remaining = budget.limit_amount - spent
            const percentage = (spent / budget.limit_amount) * 100
            const status = getBudgetStatus(budget)
            const category = categories?.find((cat: Category) => cat.id === budget.category_id)

            return (
              <div key={budget.id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(budget.month).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
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
                        Spent: ${Number(spent).toFixed(2)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Budget: ${Number(budget.limit_amount).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          status === 'exceeded' 
                            ? 'bg-red-500' 
                            : status === 'warning' 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-xs mt-1">
                      <span className={`${
                        status === 'exceeded' 
                          ? 'text-red-600' 
                          : status === 'warning' 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                      }`}>
                        {percentage.toFixed(1)}% used
                      </span>
                      <span className={`${
                        remaining < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {remaining < 0 
                          ? `Over by $${Number(Math.abs(remaining)).toFixed(2)}` 
                          : `$${Number(remaining).toFixed(2)} remaining`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    {status === 'exceeded' ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600">Budget exceeded</span>
                      </>
                    ) : status === 'warning' ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-yellow-600">Approaching limit</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">On track</span>
                      </>
                    )}
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

export default Budgets