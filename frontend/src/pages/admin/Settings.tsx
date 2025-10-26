import React, { useState } from 'react'
import { Save, RefreshCw, Database, Mail, Shield, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

const Settings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'database', name: 'Database', icon: Database },
  ]

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success('Settings saved successfully')
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
        <input
          type="text"
          className="input"
          defaultValue="TakaTrack CMS"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
        <textarea
          className="input"
          rows={3}
          defaultValue="Personal Finance Management System"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Site URL</label>
        <input
          type="url"
          className="input"
          defaultValue="https://takatrack.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
        <select className="input">
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
        <select className="input">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>
    </div>
  )

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
        <input
          type="text"
          className="input"
          defaultValue="smtp.gmail.com"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
          <input
            type="number"
            className="input"
            defaultValue="587"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Encryption</label>
          <select className="input">
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input
          type="email"
          className="input"
          defaultValue="admin@takatrack.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          className="input"
          placeholder="Enter password"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">From Address</label>
        <input
          type="email"
          className="input"
          defaultValue="noreply@takatrack.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
        <input
          type="text"
          className="input"
          defaultValue="TakaTrack"
        />
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
        <input
          type="number"
          className="input"
          defaultValue="120"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password Minimum Length</label>
        <input
          type="number"
          className="input"
          defaultValue="8"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
        <input
          type="number"
          className="input"
          defaultValue="5"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lockout Duration (minutes)</label>
        <input
          type="number"
          className="input"
          defaultValue="15"
        />
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Security Features</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300" defaultChecked />
            <span className="ml-2 text-sm text-gray-700">Enable Two-Factor Authentication</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300" defaultChecked />
            <span className="ml-2 text-sm text-gray-700">Require Strong Passwords</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300" defaultChecked />
            <span className="ml-2 text-sm text-gray-700">Enable CSRF Protection</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300" defaultChecked />
            <span className="ml-2 text-sm text-gray-700">Enable Rate Limiting</span>
          </label>
        </div>
      </div>
    </div>
  )

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Database Host</label>
          <input
            type="text"
            className="input"
            defaultValue="localhost"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Database Port</label>
          <input
            type="number"
            className="input"
            defaultValue="3306"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Database Name</label>
        <input
          type="text"
          className="input"
          defaultValue="takatrack"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            className="input"
            defaultValue="takatrack"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            className="input"
            placeholder="Enter password"
          />
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">Database Operations</h3>
        <div className="flex space-x-2">
          <button className="btn btn-secondary btn-md">
            <RefreshCw className="w-4 h-4 mr-2" />
            Test Connection
          </button>
          <button className="btn btn-warning btn-md">
            <Database className="w-4 h-4 mr-2" />
            Backup Database
          </button>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings()
      case 'email':
        return renderEmailSettings()
      case 'security':
        return renderSecuritySettings()
      case 'database':
        return renderDatabaseSettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure your CMS settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary btn-md"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="card">
        {renderTabContent()}
      </div>

      {/* System Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">PHP Version</span>
              <span className="text-sm text-gray-900">8.3.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Laravel Version</span>
              <span className="text-sm text-gray-900">11.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Database Version</span>
              <span className="text-sm text-gray-900">MySQL 8.0.35</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Server Software</span>
              <span className="text-sm text-gray-900">Apache/2.4.57</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Memory Limit</span>
              <span className="text-sm text-gray-900">256M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Max Execution Time</span>
              <span className="text-sm text-gray-900">30s</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cache Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cache Driver</span>
              <span className="text-sm text-gray-900">File</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Session Driver</span>
              <span className="text-sm text-gray-900">File</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Queue Driver</span>
              <span className="text-sm text-gray-900">Sync</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Cache Size</span>
              <span className="text-sm text-gray-900">2.1 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Cache Clear</span>
              <span className="text-sm text-gray-900">2 hours ago</span>
            </div>
            <div className="flex justify-end mt-4">
              <button className="btn btn-secondary btn-sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
