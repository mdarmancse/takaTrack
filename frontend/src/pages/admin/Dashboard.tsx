import React from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  Newspaper, 
  Image, 
  Users, 
  Shield, 
  TrendingUp,
  Eye,
  Edit,
  Plus
} from 'lucide-react'

const AdminDashboard: React.FC = () => {
  const stats = [
    {
      name: 'Total Pages',
      value: '12',
      change: '+2',
      changeType: 'positive',
      icon: FileText,
      href: '/admin/pages'
    },
    {
      name: 'Total Posts',
      value: '45',
      change: '+8',
      changeType: 'positive',
      icon: Newspaper,
      href: '/admin/posts'
    },
    {
      name: 'Media Files',
      value: '128',
      change: '+12',
      changeType: 'positive',
      icon: Image,
      href: '/admin/media'
    },
    {
      name: 'Users',
      value: '24',
      change: '+3',
      changeType: 'positive',
      icon: Users,
      href: '/admin/users'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'page',
      title: 'About Us Page Updated',
      user: 'John Doe',
      time: '2 hours ago',
      icon: Edit
    },
    {
      id: 2,
      type: 'post',
      title: 'New Blog Post Published',
      user: 'Jane Smith',
      time: '4 hours ago',
      icon: Plus
    },
    {
      id: 3,
      type: 'media',
      title: 'New Image Uploaded',
      user: 'Mike Johnson',
      time: '6 hours ago',
      icon: Image
    },
    {
      id: 4,
      type: 'user',
      title: 'New User Registered',
      user: 'Sarah Wilson',
      time: '1 day ago',
      icon: Users
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">CMS Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your content and users</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/pages/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="h-5 w-5 text-blue-600 mr-3" />
            <span className="font-medium">Create Page</span>
          </Link>
          <Link
            to="/admin/posts/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Newspaper className="h-5 w-5 text-green-600 mr-3" />
            <span className="font-medium">Create Post</span>
          </Link>
          <Link
            to="/admin/media/upload"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Image className="h-5 w-5 text-purple-600 mr-3" />
            <span className="font-medium">Upload Media</span>
          </Link>
          <Link
            to="/admin/users/new"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 text-orange-600 mr-3" />
            <span className="font-medium">Add User</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Link
            to="/admin/activity"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View all
          </Link>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <activity.icon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                <Eye className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Storage</span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                2.1 GB / 10 GB
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm text-gray-900">2 hours ago</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Response Time</span>
              <span className="text-sm text-gray-900">45ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="text-sm text-gray-900">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="text-sm text-gray-900">12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
