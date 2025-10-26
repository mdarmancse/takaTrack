import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi, categoriesApi, aiApi } from '../services/api'
import { Transaction, Category } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  Tag,
  Sparkles,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

const Transactions: React.FC = () => {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [isClassifying, setIsClassifying] = useState(false)

  // Fetch transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionsApi.list(),
  })

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  })

  // Create transaction mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Transaction>) => transactionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transactions-summary'] })
      resetForm()
      toast.success('Transaction created successfully')
    },
    onError: () => {
      toast.error('Failed to create transaction')
    },
  })

  // Update transaction mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Transaction> }) => 
      transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transactions-summary'] })
      resetForm()
      toast.success('Transaction updated successfully')
    },
    onError: () => {
      toast.error('Failed to update transaction')
    },
  })

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transactions-summary'] })
      toast.success('Transaction deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete transaction')
    },
  })

  // Auto-categorization mutation
  const classifyMutation = useMutation({
    mutationFn: (description: string) => aiApi.classifyExpense(description),
    onSuccess: (data) => {
      // Find the category by name and set it
      const category = categories?.find(cat => cat.name === data.category)
      if (category) {
        setFormData(prev => ({ ...prev, category_id: category.id.toString() }))
        toast.success(`AI suggested category: ${data.category}`, {
          icon: '🤖',
        })
      }
      setIsClassifying(false)
    },
    onError: () => {
      toast.error('Failed to classify expense')
      setIsClassifying(false)
    },
  })

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category_id: '',
    amount: '',
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    note: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...formData,
      amount: parseFloat(formData.amount),
      category_id: parseInt(formData.category_id),
    }

    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      type: transaction.type,
      category_id: transaction.category_id.toString(),
      amount: transaction.amount.toString(),
      currency: transaction.currency || 'USD',
      date: transaction.date.split('T')[0],
      note: transaction.note || '',
    })
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteMutation.mutate(id)
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'expense',
      category_id: '',
      amount: '',
      currency: 'USD',
      date: new Date().toISOString().split('T')[0],
      note: '',
    })
    setEditingTransaction(null)
    setShowForm(false)
  }

  const handleAutoCategorize = () => {
    if (!formData.note.trim()) {
      toast.error('Please enter a description first')
      return
    }
    
    setIsClassifying(true)
    classifyMutation.mutate(formData.note)
  }

  // Filter transactions
  const filteredTransactions = transactionsData?.data?.filter((transaction: Transaction) => {
    const matchesSearch = transaction.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.amount.toString().includes(searchTerm)
    const matchesType = filterType === 'all' || transaction.type === filterType
    const matchesCategory = filterCategory === 'all' || transaction.category_id.toString() === filterCategory
    
    return matchesSearch && matchesType && matchesCategory
  }) || []

  if (transactionsLoading || categoriesLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="p-6">
      <div className="card-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your income and expenses</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="font-bold">Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="input pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input"
            >
              <option value="all">All Categories</option>
              {categories?.map((category: Category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    editingTransaction 
                      ? 'bg-green-100 dark:bg-green-900' 
                      : 'bg-blue-100 dark:bg-blue-900'
                  }`}>
                    {editingTransaction ? (
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {editingTransaction ? 'Update transaction details' : 'Create a new transaction'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="btn btn-secondary btn-md"
                >
                  <div className="w-5 h-5 rounded-full bg-slate-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="p-6">
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  className="input"
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

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
                  {categories?.map((category: Category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="input"
                  required
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="BDT">BDT - Bangladeshi Taka</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <div className="relative">
                  <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="input pr-12"
                    rows={3}
                    placeholder="Enter expense description (e.g., 'Coffee at Starbucks', 'Uber ride to airport')..."
                  />
                  <button
                    type="button"
                    onClick={handleAutoCategorize}
                    disabled={!formData.note.trim() || isClassifying}
                    className="absolute top-2 right-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="AI Auto-Categorize"
                  >
                    {isClassifying ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  💡 Enter a description and click the sparkle icon for AI-powered category suggestion
                </p>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  className={`btn btn-md flex-1 ${
                    editingTransaction 
                      ? 'btn-success' 
                      : 'btn-primary'
                  }`}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span className="font-semibold">{editingTransaction ? 'Updating...' : 'Creating...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {editingTransaction ? (
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
        </div>
      )}

      {/* Transactions List */}
      <div className="card">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction: Transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${Number(transaction.amount).toFixed(2)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Tag className="w-3 h-3" />
                      <span>{transaction.category?.name}</span>
                      <Calendar className="w-3 h-3 ml-2" />
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    </div>
                    {transaction.note && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {transaction.note}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="btn btn-outline btn-sm"
                    title="Edit transaction"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="btn btn-danger btn-sm"
                    title="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Transactions