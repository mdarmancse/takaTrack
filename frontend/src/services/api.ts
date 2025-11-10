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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    // Handle different error types
    if (status === 401) {
      localStorage.removeItem('auth_token')
      // Don't redirect if already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    } else if (status === 403) {
      console.error('Forbidden:', message)
    } else if (status === 404) {
      console.error('Not Found:', message)
    } else if (status === 422) {
      // Validation errors - handled by components
      console.error('Validation Error:', error.response?.data?.errors)
    } else if (status >= 500) {
      console.error('Server Error:', message)
    } else if (!error.response) {
      // Network error
      console.error('Network Error:', 'Please check your internet connection')
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

// CMS Pages API
export const cmsPagesApi = {
  list: (params?: Record<string, any>): Promise<{ data: any[]; meta?: any }> =>
    api.get('/cms/pages', { params }).then(res => {
      const data = res.data.data || res.data;
      return Array.isArray(data) ? { data, meta: res.data.meta } : { data: [data], meta: res.data.meta };
    }),
  
  get: (id: number): Promise<any> =>
    api.get(`/cms/pages/${id}`).then(res => res.data),
  
  create: (data: any): Promise<any> =>
    api.post('/cms/pages', data).then(res => res.data),
  
  update: (id: number, data: any): Promise<any> =>
    api.put(`/cms/pages/${id}`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/cms/pages/${id}`).then(() => {}),
  
  published: (params?: Record<string, any>): Promise<any> =>
    api.get('/cms/pages/published', { params }).then(res => res.data),
  
  getBySlug: (slug: string): Promise<any> =>
    api.get(`/cms/pages/slug/${slug}`).then(res => res.data),
}

// CMS Posts API
export const cmsPostsApi = {
  list: (params?: Record<string, any>): Promise<{ data: any[]; meta?: any }> =>
    api.get('/cms/posts', { params }).then(res => {
      const data = res.data.data || res.data;
      return Array.isArray(data) ? { data, meta: res.data.meta } : { data: [data], meta: res.data.meta };
    }),
  
  get: (id: number): Promise<any> =>
    api.get(`/cms/posts/${id}`).then(res => res.data),
  
  create: (data: any): Promise<any> =>
    api.post('/cms/posts', data).then(res => res.data),
  
  update: (id: number, data: any): Promise<any> =>
    api.put(`/cms/posts/${id}`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/cms/posts/${id}`).then(() => {}),
  
  published: (params?: Record<string, any>): Promise<any> =>
    api.get('/cms/posts/published', { params }).then(res => res.data),
  
  getBySlug: (slug: string): Promise<any> =>
    api.get(`/cms/posts/slug/${slug}`).then(res => res.data),
  
  getTags: (): Promise<string[]> =>
    api.get('/cms/posts/tags').then(res => res.data),
  
  getCategories: (): Promise<string[]> =>
    api.get('/cms/posts/categories').then(res => res.data),
}

// CMS Media API
export const cmsMediaApi = {
  list: (params?: Record<string, any>): Promise<{ data: any[]; meta?: any }> =>
    api.get('/cms/media', { params }).then(res => {
      const data = res.data.data || res.data;
      return Array.isArray(data) ? { data, meta: res.data.meta } : { data: [data], meta: res.data.meta };
    }),
  
  get: (id: number): Promise<any> =>
    api.get(`/cms/media/${id}`).then(res => res.data),
  
  upload: (file: File, data?: { folder?: string; alt_text?: string; title?: string; description?: string; is_public?: boolean }): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    if (data?.folder) formData.append('folder', data.folder);
    if (data?.alt_text) formData.append('alt_text', data.alt_text);
    if (data?.title) formData.append('title', data.title);
    if (data?.description) formData.append('description', data.description);
    if (data?.is_public !== undefined) formData.append('is_public', data.is_public.toString());
    
    return api.post('/cms/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  
  uploadMultiple: (files: File[], data?: { folder?: string; is_public?: boolean }): Promise<any[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('files[]', file));
    if (data?.folder) formData.append('folder', data.folder);
    if (data?.is_public !== undefined) formData.append('is_public', data.is_public.toString());
    
    return api.post('/cms/media/upload-multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
  },
  
  update: (id: number, data: { alt_text?: string; title?: string; description?: string; is_public?: boolean }): Promise<any> =>
    api.put(`/cms/media/${id}`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/cms/media/${id}`).then(() => {}),
  
  getFolders: (): Promise<string[]> =>
    api.get('/cms/media/folders').then(res => res.data),
  
  getTypes: (): Promise<string[]> =>
    api.get('/cms/media/types').then(res => res.data),
}

// CMS Roles API
export const cmsRolesApi = {
  list: (): Promise<any[]> =>
    api.get('/cms/roles').then(res => Array.isArray(res.data) ? res.data : res.data.data || []),
  
  get: (id: number): Promise<any> =>
    api.get(`/cms/roles/${id}`).then(res => res.data),
  
  create: (data: { name: string; permissions?: number[] }): Promise<any> =>
    api.post('/cms/roles', data).then(res => res.data),
  
  update: (id: number, data: { name?: string; permissions?: number[] }): Promise<any> =>
    api.put(`/cms/roles/${id}`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/cms/roles/${id}`).then(() => {}),
  
  getPermissions: (): Promise<any[]> =>
    api.get('/cms/roles/permissions').then(res => Array.isArray(res.data) ? res.data : res.data.data || []),
  
  assignToUser: (userId: number, roleId: number): Promise<any> =>
    api.post('/cms/roles/assign-user', { user_id: userId, role_id: roleId }).then(res => res.data),
  
  removeFromUser: (userId: number, roleId: number): Promise<any> =>
    api.post('/cms/roles/remove-user', { user_id: userId, role_id: roleId }).then(res => res.data),
}

// CMS Users API
export const cmsUsersApi = {
  list: (params?: Record<string, any>): Promise<{ data: any[]; meta?: any }> =>
    api.get('/cms/users', { params }).then(res => {
      const data = res.data.data || res.data;
      return Array.isArray(data) ? { data, meta: res.data.meta } : { data: [data], meta: res.data.meta };
    }),
  
  get: (id: number): Promise<any> =>
    api.get(`/cms/users/${id}`).then(res => res.data),
  
  create: (data: { name: string; email: string; password: string; password_confirmation: string; roles?: number[] }): Promise<any> =>
    api.post('/cms/users', data).then(res => res.data),
  
  update: (id: number, data: { name?: string; email?: string; password?: string; password_confirmation?: string; roles?: number[] }): Promise<any> =>
    api.put(`/cms/users/${id}`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/cms/users/${id}`).then(() => {}),
}

export { api }
export default api
