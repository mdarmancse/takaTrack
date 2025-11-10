import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Filter, Save, Clock, Tag, Calendar, DollarSign } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface SearchFilter {
  id: string
  name: string
  type: 'transactions' | 'categories' | 'accounts' | 'budgets' | 'goals' | 'all'
  query: string
  filters?: {
    dateFrom?: string
    dateTo?: string
    category?: string
    type?: 'income' | 'expense'
    amountMin?: number
    amountMax?: number
  }
  createdAt: string
}

interface AdvancedSearchProps {
  isOpen: boolean
  onClose: () => void
  onSearch?: (query: string, filters?: any) => void
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ isOpen, onClose, onSearch }) => {
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [savedFilters, setSavedFilters] = useState<SearchFilter[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    category: '',
    type: '' as 'income' | 'expense' | '',
    amountMin: '',
    amountMax: '',
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Load saved filters and recent searches
    const saved = localStorage.getItem('takatrack_saved_filters')
    const recent = localStorage.getItem('takatrack_recent_searches')
    if (saved) setSavedFilters(JSON.parse(saved))
    if (recent) setRecentSearches(JSON.parse(recent))
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSearch = () => {
    if (!query.trim() && !hasActiveFilters()) return

    // Save to recent searches
    if (query.trim()) {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10)
      setRecentSearches(updated)
      localStorage.setItem('takatrack_recent_searches', JSON.stringify(updated))
    }

    // Navigate to appropriate page or call callback
    if (onSearch) {
      onSearch(query, filters)
    } else {
      // Default: navigate to transactions with search params
      const params = new URLSearchParams()
      if (query) params.set('search', query)
      if (filters.dateFrom) params.set('date_from', filters.dateFrom)
      if (filters.dateTo) params.set('date_to', filters.dateTo)
      if (filters.category) params.set('category', filters.category)
      if (filters.type) params.set('type', filters.type)
      if (filters.amountMin) params.set('amount_min', filters.amountMin)
      if (filters.amountMax) params.set('amount_max', filters.amountMax)
      
      navigate(`/transactions?${params.toString()}`)
    }

    onClose()
  }

  const handleSaveFilter = () => {
    if (!query.trim() && !hasActiveFilters()) return

    const newFilter: SearchFilter = {
      id: Date.now().toString(),
      name: query || 'Saved Filter',
      type: 'transactions',
      query,
      filters,
      createdAt: new Date().toISOString(),
    }

    const updated = [newFilter, ...savedFilters].slice(0, 10)
    setSavedFilters(updated)
    localStorage.setItem('takatrack_saved_filters', JSON.stringify(updated))
    setQuery('')
    setFilters({
      dateFrom: '',
      dateTo: '',
      category: '',
      type: '',
      amountMin: '',
      amountMax: '',
    })
  }

  const handleLoadFilter = (filter: SearchFilter) => {
    setQuery(filter.query)
    if (filter.filters) {
      setFilters(filter.filters)
    }
    setShowFilters(true)
  }

  const handleDeleteFilter = (id: string) => {
    const updated = savedFilters.filter(f => f.id !== id)
    setSavedFilters(updated)
    localStorage.setItem('takatrack_saved_filters', JSON.stringify(updated))
  }

  const hasActiveFilters = () => {
    return !!(
      filters.dateFrom ||
      filters.dateTo ||
      filters.category ||
      filters.type ||
      filters.amountMin ||
      filters.amountMax
    )
  }

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      category: '',
      type: '',
      amountMin: '',
      amountMax: '',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
          {/* Search Input */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search transactions, categories, accounts..."
                className="input pl-10 pr-10 w-full"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filters Toggle */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide' : 'Show'} Advanced Filters
              {hasActiveFilters() && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                  {Object.values(filters).filter(v => v).length}
                </span>
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Tag className="h-3 w-3 inline mr-1" />
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                    className="input text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <DollarSign className="h-3 w-3 inline mr-1" />
                    Min Amount
                  </label>
                  <input
                    type="number"
                    value={filters.amountMin}
                    onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
                    placeholder="0.00"
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <DollarSign className="h-3 w-3 inline mr-1" />
                    Max Amount
                  </label>
                  <input
                    type="number"
                    value={filters.amountMax}
                    onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
                    placeholder="0.00"
                    className="input text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="btn btn-outline btn-sm w-full"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Searches & Saved Filters */}
          <div className="max-h-64 overflow-y-auto">
            {recentSearches.length > 0 && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Recent Searches
                </h3>
                <div className="space-y-1">
                  {recentSearches.slice(0, 5).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(search)
                        handleSearch()
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {savedFilters.length > 0 && (
              <div className="p-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center">
                  <Save className="h-3 w-3 mr-1" />
                  Saved Filters
                </h3>
                <div className="space-y-1">
                  {savedFilters.map((filter) => (
                    <div
                      key={filter.id}
                      className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <button
                        onClick={() => handleLoadFilter(filter)}
                        className="flex-1 text-left"
                      >
                        {filter.name}
                      </button>
                      <button
                        onClick={() => handleDeleteFilter(filter.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="btn btn-outline btn-sm"
            >
              Cancel
            </button>
            <div className="flex space-x-2">
              {hasActiveFilters() && (
                <button
                  onClick={handleSaveFilter}
                  className="btn btn-outline btn-sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Filter
                </button>
              )}
              <button
                onClick={handleSearch}
                className="btn btn-primary btn-sm"
                disabled={!query.trim() && !hasActiveFilters()}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdvancedSearch

