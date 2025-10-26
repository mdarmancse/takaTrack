import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  Bell, 
  Check, 
  AlertCircle, 
  Info, 
  Trophy, 
  Calendar,
  Trash2,
  Filter,
  Search,
  CheckCheck,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Notification {
  id: number
  type: 'info' | 'success' | 'warning' | 'achievement' | 'reminder'
  title: string
  message: string
  is_read: boolean
  created_at: string
  read_at?: string
  data?: any
}

const Notifications: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all')
  const [filterCategory, setFilterCategory] = useState<'all' | 'info' | 'success' | 'warning' | 'achievement' | 'reminder'>('all')
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([])

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
  })

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
      toast.success('Notification marked as read')
    },
  })

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
      toast.success('All notifications marked as read')
    },
  })

  // Delete notification
  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
      toast.success('Notification deleted')
    },
  })

  // Delete selected notifications
  const deleteSelectedMutation = useMutation({
    mutationFn: async () => {
      const promises = selectedNotifications.map(id => notificationApi.deleteNotification(id))
      await Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
      setSelectedNotifications([])
      toast.success(`${selectedNotifications.length} notifications deleted`)
    },
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'achievement':
        return <Trophy className="w-5 h-5 text-purple-500" />
      case 'reminder':
        return <Calendar className="w-5 h-5 text-blue-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'achievement':
        return 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20'
      case 'reminder':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id)
    }
  }

  const handleSelectNotification = (id: number) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notificationId => notificationId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id))
    }
  }

  const handleDeleteSelected = () => {
    if (selectedNotifications.length > 0) {
      deleteSelectedMutation.mutate()
    }
  }

  // Filter notifications
  const filteredNotifications = (notificationsData?.data || []).filter((notification: Notification) => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'unread' && !notification.is_read) ||
                         (filterType === 'read' && notification.is_read)
    
    const matchesCategory = filterCategory === 'all' || notification.type === filterCategory
    
    return matchesSearch && matchesFilter && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your notifications and stay updated</p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedNotifications.length > 0 && (
            <>
              <button
                onClick={handleDeleteSelected}
                disabled={deleteSelectedMutation.isPending}
                className="btn btn-danger btn-md"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedNotifications.length})
              </button>
            </>
          )}
          <button
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            className="btn btn-primary btn-md"
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                placeholder="Search notifications..."
                className="input pl-10"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'unread' | 'read')}
              className="input"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as 'all' | 'info' | 'success' | 'warning' | 'achievement' | 'reminder')}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="achievement">Achievement</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSelectAll}
              className="btn btn-outline btn-md w-full"
            >
              {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification: Notification) => (
            <div
              key={notification.id}
              className={`card border-l-4 ${
                notification.is_read 
                  ? 'border-l-gray-300 bg-gray-50 dark:bg-gray-700' 
                  : getNotificationColor(notification.type)
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Checkbox for selection */}
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => handleSelectNotification(notification.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                {/* Notification Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Notification Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                      <button
                        onClick={() => deleteMutation.mutate(notification.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {notification.message}
                  </p>

                  {notification.is_read && notification.read_at && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      Read {formatTimeAgo(notification.read_at)}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 mt-3">
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsReadMutation.mutate(notification.id)}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Mark as read
                      </button>
                    )}
                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                      {notification.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all' 
                ? 'No notifications match your current filters.'
                : 'You\'re all caught up! No notifications to show.'
              }
            </p>
            {(searchTerm || filterType !== 'all' || filterCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterType('all')
                  setFilterCategory('all')
                }}
                className="mt-4 btn btn-outline btn-md"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination Info */}
      {notificationsData?.pagination && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredNotifications.length} of {notificationsData.pagination.total} notifications
        </div>
      )}
    </div>
  )
}

export default Notifications
