import axios from 'axios'
import { AuthResponse, User, Transaction, Category, Budget, Goal, MonthlyReport } from '../types'
import { convertApiData } from '../utils/format'

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (email: string, password: string): Promise<AuthResponse> =>
    api.post('/auth/login', { email, password }).then(res => res.data),
  
  register: (name: string, email: string, password: string, password_confirmation: string): Promise<AuthResponse> =>
    api.post('/auth/register', { name, email, password, password_confirmation }).then(res => res.data),
  
  logout: (): Promise<void> =>
    api.post('/auth/logout').then(() => {}),
  
  me: (): Promise<User> =>
    api.get('/auth/me').then(res => res.data),
  
  refresh: (): Promise<AuthResponse> =>
    api.post('/auth/refresh').then(res => res.data),
  
  updateProfile: (data: { name: string; email: string }): Promise<User> =>
    api.put('/auth/profile', data).then(res => res.data),
  
  changePassword: (data: { current_password: string; password: string; password_confirmation: string }): Promise<void> =>
    api.put('/auth/password', data).then(() => {}),
}

// Transactions API
export const transactionsApi = {
  list: (params?: Record<string, any>): Promise<{ data: Transaction[]; meta: any }> =>
    api.get('/transactions', { params }).then(res => convertApiData(res.data)),
  
  get: (id: number): Promise<Transaction> =>
    api.get(`/transactions/${id}`).then(res => convertApiData(res.data)),
  
  create: (data: Partial<Transaction>): Promise<Transaction> =>
    api.post('/transactions', data).then(res => convertApiData(res.data)),
  
  update: (id: number, data: Partial<Transaction>): Promise<Transaction> =>
    api.put(`/transactions/${id}`, data).then(res => convertApiData(res.data)),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/transactions/${id}`).then(() => {}),
  
  summary: (params?: Record<string, any>): Promise<{ summary: any; category_breakdown: any }> =>
    api.get('/transactions/summary', { params }).then(res => convertApiData(res.data)),
}

// Accounts API
export const accountsApi = {
  list: (): Promise<{ data: any[] }> =>
    api.get('/accounts').then(res => res.data),
  
  create: (data: any): Promise<any> =>
    api.post('/accounts', data).then(res => res.data),
  
  update: (id: number, data: any): Promise<any> =>
    api.put(`/accounts/${id}`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/accounts/${id}`).then(() => {}),
}

// Categories API
export const categoriesApi = {
  list: (): Promise<Category[]> =>
    api.get('/categories').then(res => res.data),
  
  create: (data: Partial<Category>): Promise<Category> =>
    api.post('/categories', data).then(res => res.data),
  
  update: (id: number, data: Partial<Category>): Promise<Category> =>
    api.put(`/categories/${id}`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/categories/${id}`).then(() => {}),
}

// Budgets API
export const budgetsApi = {
  list: (): Promise<Budget[]> =>
    api.get('/budgets').then(res => convertApiData(res.data)),
  
  create: (data: Partial<Budget>): Promise<Budget> =>
    api.post('/budgets', data).then(res => convertApiData(res.data)),
  
  update: (id: number, data: Partial<Budget>): Promise<Budget> =>
    api.put(`/budgets/${id}`, data).then(res => convertApiData(res.data)),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/budgets/${id}`).then(() => {}),
}

// Goals API
export const goalsApi = {
  list: (): Promise<Goal[]> =>
    api.get('/goals').then(res => convertApiData(res.data)),
  
  create: (data: Partial<Goal>): Promise<Goal> =>
    api.post('/goals', data).then(res => convertApiData(res.data)),
  
  update: (id: number, data: Partial<Goal>): Promise<Goal> =>
    api.put(`/goals/${id}`, data).then(res => convertApiData(res.data)),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/goals/${id}`).then(() => {}),
}

// Reports API
export const reportsApi = {
  monthly: (month?: string): Promise<MonthlyReport> =>
    api.get('/reports/monthly', { params: { month } }).then(res => res.data),
  
  export: (format: string, fromDate?: string, toDate?: string): Promise<any> =>
    api.get('/reports/export', { params: { format, from_date: fromDate, to_date: toDate } }).then(res => res.data),
}

// AI API
export const aiApi = {
  insights: (summary: any): Promise<{ insights: string; request_id: number }> =>
    api.post('/ai/insights', { summary }).then(res => res.data),
  
  advice: (question: string): Promise<{ answer: string; context_used: boolean }> =>
    api.post('/ai/advice', { question }).then(res => res.data),
  
  spendingInsights: (expenses: any[]): Promise<{ insights: any; summary: any }> =>
    api.post('/ai/spending-insights', { expenses }).then(res => res.data),
  
  classifyExpense: (description: string): Promise<{ category: string; confidence: string; method: string }> =>
    api.post('/ai/classify-expense', { description }).then(res => res.data),
  
  conversations: (): Promise<{ conversations: any[] }> =>
    api.get('/ai/conversations').then(res => res.data),
}

// Gamification API
export const gamificationApi = {
  // Streaks
  getStreak: (): Promise<any> =>
    api.get('/gamification/streak').then(res => res.data),
  
  updateStreak: (): Promise<any> =>
    api.post('/gamification/streak/update').then(res => res.data),
  
  // Goals
  getGoals: (): Promise<any> =>
    api.get('/gamification/goals').then(res => res.data),
  
  createGoal: (data: any): Promise<any> =>
    api.post('/gamification/goals', data).then(res => res.data),
  
  updateGoalProgress: (goalId: number, amount: number): Promise<any> =>
    api.post(`/gamification/goals/${goalId}/progress`, { amount }).then(res => res.data),
  
  // User Level
  getUserLevel: (): Promise<any> =>
    api.get('/gamification/level').then(res => res.data),
  
  // Daily Spin
  performDailySpin: (): Promise<any> =>
    api.post('/gamification/daily-spin').then(res => res.data),
  
  canSpinToday: (): Promise<any> =>
    api.get('/gamification/daily-spin/can-spin').then(res => res.data),
  
  getSpinHistory: (): Promise<any> =>
    api.get('/gamification/daily-spin/history').then(res => res.data),
  
  // Rewards
  getUserRewards: (): Promise<any> =>
    api.get('/gamification/rewards').then(res => res.data),
  
  claimReward: (rewardId: number): Promise<any> =>
    api.post(`/gamification/rewards/${rewardId}/claim`).then(res => res.data),
  
  // Dashboard
  getDashboard: (): Promise<any> =>
    api.get('/gamification/dashboard').then(res => res.data),
}

// Notification API
export const notificationApi = {
  // Get all notifications
  getNotifications: (): Promise<any> =>
    api.get('/notifications').then(res => res.data),
  
  // Get unread count
  getUnreadCount: (): Promise<any> =>
    api.get('/notifications/unread-count').then(res => res.data),
  
  // Mark notification as read
  markAsRead: (id: number): Promise<any> =>
    api.post(`/notifications/${id}/read`).then(res => res.data),
  
  // Mark all as read
  markAllAsRead: (): Promise<any> =>
    api.post('/notifications/mark-all-read').then(res => res.data),
  
  // Delete notification
  deleteNotification: (id: number): Promise<any> =>
    api.delete(`/notifications/${id}`).then(res => res.data),
  
  // Create test notification (for development)
  createTest: (): Promise<any> =>
    api.post('/notifications/test').then(res => res.data),
}

export { api }
export default api
