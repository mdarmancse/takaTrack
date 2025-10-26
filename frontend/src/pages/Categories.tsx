import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '../services/api'
import { Category } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import { Plus, Edit, Trash2, Search, Tag, DollarSign, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const Categories: React.FC = () => {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    color: '#3B82F6',
    icon: 'tag',
    budget_limit: null as number | null,
    description: ''
  })

  // Fetch categories
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  })

  const categories = categoriesData?.data || []

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Category>) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      resetForm()
      toast.success('Category created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create category')
    }
  })

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) => 
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      resetForm()
      toast.success('Category updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update category')
    }
  })

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Category deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete category')
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      color: '#3B82F6',
      icon: 'tag',
      budget_limit: null,
      description: ''
    })
    setShowForm(false)
    setEditingCategory(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || '#3B82F6',
      icon: category.icon || 'tag',
      budget_limit: category.budget_limit,
      description: category.description || ''
    })
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteMutation.mutate(id)
    }
  }

  // Filter categories
  const filteredCategories = categories.filter((category: Category) => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const incomeCategories = filteredCategories.filter((cat: Category) => cat.type === 'income')
  const expenseCategories = filteredCategories.filter((cat: Category) => cat.type === 'expense')

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowUpRight className="w-5 h-5 text-green-600 mr-2" />
            Income Categories
          </h2>
          <div className="space-y-3">
            {incomeCategories.map((category: Category) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    {category.budget_limit && (
                      <p className="text-sm text-gray-500">
                        Limit: ${category.budget_limit.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="btn btn-outline btn-sm"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="btn btn-danger btn-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
            {incomeCategories.length === 0 && (
              <p className="text-gray-500 text-center py-4">No income categories found</p>
            )}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowDownRight className="w-5 h-5 text-red-600 mr-2" />
            Expense Categories
          </h2>
          <div className="space-y-3">
            {expenseCategories.map((category: Category) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    {category.budget_limit && (
                      <p className="text-sm text-gray-500">
                        Limit: ${category.budget_limit.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="btn btn-outline btn-sm"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="btn btn-danger btn-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
            ))}
            {expenseCategories.length === 0 && (
              <p className="text-gray-500 text-center py-4">No expense categories found</p>
            )}
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                  className="input"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Limit (optional)
                </label>
                <input
                  type="number"
                  value={formData.budget_limit || ''}
                  onChange={(e) => setFormData({ ...formData, budget_limit: e.target.value ? Number(e.target.value) : null })}
                  className="input"
                  placeholder="Enter budget limit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="btn btn-primary btn-md flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="font-semibold">{editingCategory ? 'Updating...' : 'Creating...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      {editingCategory ? (
                        <>
                          <ArrowUpRight className="w-4 h-4" />
                          <span className="font-semibold">Update Category</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span className="font-semibold">Create Category</span>
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
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories
