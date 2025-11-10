import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  BarChart3,
  PieChart,
  FileText
} from 'lucide-react'
import { reportsApi } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Reports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const [exportDateRange, setExportDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  })

  const { data: monthlyReport, isLoading, error } = useQuery({
    queryKey: ['reports', 'monthly', selectedMonth],
    queryFn: () => reportsApi.monthly(selectedMonth),
  })

  const handleExport = async () => {
    try {
      if (exportFormat === 'csv') {
        // For CSV, use direct download
        const token = localStorage.getItem('auth_token')
        const params = new URLSearchParams({
          format: exportFormat,
          from_date: exportDateRange.from,
          to_date: exportDateRange.to,
        })
        
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/reports/export?${params.toString()}`
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/csv',
          },
        })
        
        if (!response.ok) throw new Error('Export failed')
        
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = `takatrack-report-${exportDateRange.from}-to-${exportDateRange.to}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(downloadUrl)
      } else {
        // For JSON, use existing method
        const data = await reportsApi.export(exportFormat, exportDateRange.from, exportDateRange.to)
        const blob = new Blob([JSON.stringify(data.transactions, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `takatrack-report-${exportDateRange.from}-to-${exportDateRange.to}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
      
      toast.success('Report exported successfully')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to export report')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatMonth = (month: string) => {
    const date = new Date(month + '-01')
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-800">Error loading report: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    )
  }

  const report = monthlyReport || {
    month: selectedMonth,
    summary: { income: 0, expenses: 0, net: 0 },
    category_breakdown: {},
    transactions: []
  }

  const categoryBreakdown = Object.values(report.category_breakdown || {})
  const sortedCategories = categoryBreakdown.sort((a: any, b: any) => 
    (b.expenses || 0) - (a.expenses || 0)
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View and export your financial reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExport}
            className="btn btn-primary btn-md"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Month:
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatMonth(selectedMonth)}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-200">Total Income</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                {formatCurrency(report.summary?.income || 0)}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-600 dark:text-green-300" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900 dark:to-red-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-200">Total Expenses</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                {formatCurrency(report.summary?.expenses || 0)}
              </p>
            </div>
            <TrendingDown className="w-12 h-12 text-red-600 dark:text-red-300" />
          </div>
        </div>

        <div className={`card bg-gradient-to-br ${
          (report.summary?.net || 0) >= 0 
            ? 'from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800' 
            : 'from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${
                (report.summary?.net || 0) >= 0 
                  ? 'text-blue-700 dark:text-blue-200' 
                  : 'text-orange-700 dark:text-orange-200'
              }`}>
                Net Amount
              </p>
              <p className={`text-2xl font-bold mt-1 ${
                (report.summary?.net || 0) >= 0 
                  ? 'text-blue-900 dark:text-blue-100' 
                  : 'text-orange-900 dark:text-orange-100'
              }`}>
                {formatCurrency(report.summary?.net || 0)}
              </p>
            </div>
            <DollarSign className={`w-12 h-12 ${
              (report.summary?.net || 0) >= 0 
                ? 'text-blue-600 dark:text-blue-300' 
                : 'text-orange-600 dark:text-orange-300'
            }`} />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <PieChart className="w-5 h-5 mr-2" />
            Category Breakdown
          </h2>
        </div>
        
        {sortedCategories.length > 0 ? (
          <div className="space-y-4">
            {sortedCategories.map((category: any, index: number) => {
              const total = (category.expenses || 0) + (category.income || 0)
              const maxAmount = Math.max(...sortedCategories.map((c: any) => 
                (c.expenses || 0) + (c.income || 0)
              ))
              const percentage = maxAmount > 0 ? (total / maxAmount) * 100 : 0
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.category || 'Uncategorized'}
                    </span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Income: {formatCurrency(category.income || 0)}</span>
                    <span>Expenses: {formatCurrency(category.expenses || 0)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No transactions found for this month
          </p>
        )}
      </div>

      {/* Export Settings Modal */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Export Settings
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                className="input"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={exportDateRange.from}
                onChange={(e) => setExportDateRange({ ...exportDateRange, from: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={exportDateRange.to}
                onChange={(e) => setExportDateRange({ ...exportDateRange, to: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {report.transactions && report.transactions.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Transactions ({report.transactions.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {report.transactions.slice(0, 10).map((transaction: any) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {transaction.category?.name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      transaction.type === 'income'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports

