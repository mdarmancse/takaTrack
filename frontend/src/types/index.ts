export interface User {
  id: number
  name: string
  email: string
  settings: {
    currency: string
    language: string
    timezone: string
  }
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  user_id?: number
  name: string
  type: 'income' | 'expense'
  color?: string
  icon?: string
  budget_limit?: number | null
  description?: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: number
  user_id: number
  type: 'income' | 'expense'
  category_id: number
  amount: number
  currency: string
  date: string
  note?: string
  source: 'manual' | 'sms'
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  category?: Category
}

export interface Budget {
  id: number
  user_id: number
  category_id: number
  month: string
  limit_amount: number
  spent_amount: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface Goal {
  id: number
  user_id: number
  name: string
  target_amount: number
  saved_amount: number
  target_date: string
  status: 'active' | 'completed' | 'paused'
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface TransactionSummary {
  income: number
  expenses: number
  net: number
}

export interface CategoryBreakdown {
  [categoryId: string]: {
    category: string
    income: number
    expenses: number
    net: number
  }
}

export interface MonthlyReport {
  month: string
  summary: TransactionSummary
  category_breakdown: CategoryBreakdown
  transactions: Transaction[]
}
