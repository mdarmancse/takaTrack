import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { transactionsApi, categoriesApi } from '../services/api'
import { Search, X, CreditCard, Tag } from 'lucide-react'
import { Transaction, Category } from '../types'

interface SearchResult {
  type: 'transaction' | 'category'
  id: number
  title: string
  subtitle: string
  amount?: number
  date?: string
  icon: React.ReactNode
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch transactions and categories for search
  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionsApi.list(),
    enabled: isOpen && searchTerm.length > 0,
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
    enabled: isOpen && searchTerm.length > 0,
  })

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    
    const results: SearchResult[] = []

    // Search transactions
    if (transactions?.data) {
      transactions.data.forEach((transaction: Transaction) => {
        const matchesNote = transaction.note?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false
        
        // Handle category - it could be a string or an object
        const categoryName = typeof transaction.category === 'string' 
          ? transaction.category 
          : transaction.category?.name || ''
        const matchesCategory = categoryName?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false
        
        const matchesAmount = transaction.amount?.toString()?.includes(searchTerm) || false
        const matchesType = transaction.type?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false

        if (matchesNote || matchesCategory || matchesAmount || matchesType) {
          results.push({
            type: 'transaction',
            id: transaction.id,
            title: transaction.note || 'No description',
            subtitle: `${categoryName} • ${transaction.type} • ${new Date(transaction.date).toLocaleDateString()}`,
            amount: transaction.amount,
            date: transaction.date,
            icon: <CreditCard className="w-4 h-4" />
          })
        }
      })
    }

    // Search categories
    if (categories) {
      const categoriesArray = Array.isArray(categories) ? categories : (categories as any)?.data || []
      categoriesArray.forEach((category: Category) => {
        const matchesName = category.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false
        const matchesType = category.type?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false

        if (matchesName || matchesType) {
          results.push({
            type: 'category',
            id: category.id,
            title: category.name || 'Unnamed Category',
            subtitle: `${category.type} category`,
            icon: <Tag className="w-4 h-4" />
          })
        }
      })
    }

    setSearchResults(results.slice(0, 10)) // Limit to 10 results
    setIsSearching(false)
  }, [searchTerm, transactions, categories])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'transaction') {
      // Navigate to transactions page with filter
      window.location.href = '/transactions'
    } else if (result.type === 'category') {
      // Navigate to transactions page with category filter
      window.location.href = '/transactions'
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center px-4 pt-16 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Search
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions, categories..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {result.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {result.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {result.subtitle}
                          </p>
                          {result.amount && (
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(result.amount)}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="text-center py-8">
                  <Search className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No results found for "{searchTerm}"
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Start typing to search transactions and categories
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GlobalSearch
