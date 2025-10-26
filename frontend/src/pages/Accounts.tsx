import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountsApi } from '../services/api'
import { Account } from '../types'
import LoadingSpinner from '../components/LoadingSpinner'
import { Plus, Edit, Trash2, Search, CreditCard, Wallet, Building2, PiggyBank } from 'lucide-react'
import toast from 'react-hot-toast'

const Accounts: React.FC = () => {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    type: 'checking' as 'checking' | 'savings' | 'credit' | 'investment' | 'cash',
    balance: 0,
    currency: 'USD',
    description: '',
    is_active: true
  })

  // Fetch accounts
  const { data: accountsData, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list(),
  })

  const accounts = accountsData?.data || []

  // Create account mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Account>) => accountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      resetForm()
      toast.success('Account created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create account')
    }
  })

  // Update account mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Account> }) => 
      accountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      resetForm()
      toast.success('Account updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update account')
    }
  })

  // Delete account mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => accountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('Account deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete account')
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'checking',
      balance: 0,
      currency: 'USD',
      description: '',
      is_active: true
    })
    setShowForm(false)
    setEditingAccount(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (account: Account) => {
    setFormData({
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency || 'USD',
      description: account.description || '',
      is_active: account.is_active
    })
    setEditingAccount(account)
    setShowForm(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      deleteMutation.mutate(id)
    }
  }

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return <Building2 className="w-5 h-5" />
      case 'savings': return <PiggyBank className="w-5 h-5" />
      case 'credit': return <CreditCard className="w-5 h-5" />
      case 'investment': return <Wallet className="w-5 h-5" />
      case 'cash': return <Wallet className="w-5 h-5" />
      default: return <Wallet className="w-5 h-5" />
    }
  }

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'checking': return 'text-blue-600'
      case 'savings': return 'text-green-600'
      case 'credit': return 'text-red-600'
      case 'investment': return 'text-purple-600'
      case 'cash': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  // Filter accounts
  const filteredAccounts = accounts.filter((account: Account) => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((account: Account) => (
          <div key={account.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`${getAccountColor(account.type)} mr-3`}>
                  {getAccountIcon(account.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{account.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(account)}
                    className="btn btn-outline btn-sm"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-2xl font-bold text-gray-900">
                ${account.balance.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">{account.currency}</p>
            </div>

            {account.description && (
              <p className="text-sm text-gray-600 mb-4">{account.description}</p>
            )}

            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs ${
                account.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {account.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredAccounts.length === 0 && (
        <div className="text-center py-12">
          <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
          <p className="text-gray-500">Get started by adding your first account</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingAccount ? 'Edit Account' : 'Add Account'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Name
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
                  Account Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="input"
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="credit">Credit Card</option>
                  <option value="investment">Investment</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Balance
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="input"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  Active Account
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingAccount ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-outline"
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

export default Accounts
