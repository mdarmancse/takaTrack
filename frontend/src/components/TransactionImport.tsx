import React, { useState, useRef } from 'react'
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-react'
import { transactionsApi } from '../services/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import LoadingSpinner from './LoadingSpinner'

interface TransactionImportProps {
  isOpen: boolean
  onClose: () => void
}

interface ParsedTransaction {
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category?: string
}

const TransactionImport: React.FC<TransactionImportProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null)
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([])
  const [importing, setImporting] = useState(false)
  const [preview, setPreview] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const importMutation = useMutation({
    mutationFn: async (transactions: ParsedTransaction[]) => {
      const results = []
      for (const transaction of transactions) {
        try {
          const result = await transactionsApi.create({
            date: transaction.date,
            description: transaction.description,
            amount: Math.abs(transaction.amount),
            type: transaction.type,
            note: `Imported from file`,
          })
          results.push({ success: true, transaction: result })
        } catch (error) {
          results.push({ success: false, transaction, error })
        }
      }
      return results
    },
    onSuccess: (results) => {
      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      
      if (failCount === 0) {
        toast.success(`Successfully imported ${successCount} transactions`)
      } else {
        toast.success(`Imported ${successCount} transactions. ${failCount} failed.`)
      }
      
      handleClose()
    },
    onError: () => {
      toast.error('Failed to import transactions')
    },
  })

  const parseCSV = (text: string): ParsedTransaction[] => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) return []

    // Try to detect headers
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const transactions: ParsedTransaction[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length < 2) continue

      // Try to find date, description, amount columns
      const dateIndex = headers.findIndex(h => h.includes('date'))
      const descIndex = headers.findIndex(h => h.includes('description') || h.includes('note') || h.includes('memo'))
      const amountIndex = headers.findIndex(h => h.includes('amount') || h.includes('value'))
      const typeIndex = headers.findIndex(h => h.includes('type'))

      if (dateIndex === -1 || amountIndex === -1) continue

      const date = values[dateIndex] || new Date().toISOString().split('T')[0]
      const description = values[descIndex] || 'Imported transaction'
      const amount = parseFloat(values[amountIndex]) || 0
      const type = values[typeIndex]?.toLowerCase() || (amount >= 0 ? 'income' : 'expense')

      transactions.push({
        date,
        description,
        amount: Math.abs(amount),
        type: type === 'income' || amount >= 0 ? 'income' : 'expense',
        category: undefined,
      })
    }

    return transactions
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (selectedFile.name.endsWith('.csv')) {
        const parsed = parseCSV(text)
        setParsedTransactions(parsed)
        setPreview(true)
      } else {
        toast.error('Only CSV files are supported at the moment')
        setFile(null)
      }
    }
    reader.readAsText(selectedFile)
  }

  const handleImport = () => {
    if (parsedTransactions.length === 0) return
    
    setImporting(true)
    importMutation.mutate(parsedTransactions)
  }

  const handleClose = () => {
    setFile(null)
    setParsedTransactions([])
    setPreview(false)
    setImporting(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Import Transactions</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {!preview ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Upload a CSV file with your transactions
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn btn-primary btn-md cursor-pointer"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Choose CSV File
                  </label>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    CSV Format Requirements
                  </h3>
                  <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• First row should contain headers: Date, Description, Amount, Type</li>
                    <li>• Date format: YYYY-MM-DD or MM/DD/YYYY</li>
                    <li>• Amount: Positive numbers (will be auto-detected as income/expense)</li>
                    <li>• Type: "income" or "expense" (optional)</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      File: {file?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {parsedTransactions.length} transactions found
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setPreview(false)
                      setFile(null)
                      setParsedTransactions([])
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    Change File
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Type
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {parsedTransactions.slice(0, 20).map((transaction, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {transaction.date}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">
                            {transaction.description}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                            ${transaction.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              transaction.type === 'income'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedTransactions.length > 20 && (
                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      ... and {parsedTransactions.length - 20} more transactions
                    </div>
                  )}
                </div>

                {parsedTransactions.length === 0 && (
                  <div className="flex items-center justify-center p-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      No transactions found in file. Please check the format.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {preview && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleClose}
                className="btn btn-outline btn-md"
                disabled={importing}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={importing || parsedTransactions.length === 0}
                className="btn btn-primary btn-md"
              >
                {importing ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Importing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Import {parsedTransactions.length} Transactions
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionImport

