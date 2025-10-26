import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Search, Shield, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'

// Mock API functions - replace with actual API calls
const rolesApi = {
  list: () => Promise.resolve({
    data: [
      {
        id: 1,
        name: 'super-admin',
        display_name: 'Super Admin',
        description: 'Full system access',
        permissions: [
          { id: 1, name: 'cms.pages.view' },
          { id: 2, name: 'cms.pages.create' },
          { id: 3, name: 'cms.pages.edit' },
          { id: 4, name: 'cms.pages.delete' },
          { id: 5, name: 'cms.pages.publish' }
        ],
        users_count: 1,
        created_at: '2024-01-01'
      },
      {
        id: 2,
        name: 'admin',
        display_name: 'Administrator',
        description: 'Administrative access',
        permissions: [
          { id: 1, name: 'cms.pages.view' },
          { id: 2, name: 'cms.pages.create' },
          { id: 3, name: 'cms.pages.edit' },
          { id: 5, name: 'cms.pages.publish' }
        ],
        users_count: 2,
        created_at: '2024-01-01'
      },
      {
        id: 3,
        name: 'editor',
        display_name: 'Editor',
        description: 'Content editing access',
        permissions: [
          { id: 1, name: 'cms.pages.view' },
          { id: 2, name: 'cms.pages.create' },
          { id: 3, name: 'cms.pages.edit' }
        ],
        users_count: 3,
        created_at: '2024-01-01'
      },
      {
        id: 4,
        name: 'author',
        display_name: 'Author',
        description: 'Content creation access',
        permissions: [
          { id: 1, name: 'cms.pages.view' },
          { id: 2, name: 'cms.pages.create' }
        ],
        users_count: 5,
        created_at: '2024-01-01'
      },
      {
        id: 5,
        name: 'user',
        display_name: 'User',
        description: 'Basic user access',
        permissions: [
          { id: 1, name: 'cms.pages.view' }
        ],
        users_count: 15,
        created_at: '2024-01-01'
      }
    ]
  }),
  permissions: () => Promise.resolve({
    data: [
      { id: 1, name: 'cms.pages.view', description: 'View pages' },
      { id: 2, name: 'cms.pages.create', description: 'Create pages' },
      { id: 3, name: 'cms.pages.edit', description: 'Edit pages' },
      { id: 4, name: 'cms.pages.delete', description: 'Delete pages' },
      { id: 5, name: 'cms.pages.publish', description: 'Publish pages' },
      { id: 6, name: 'cms.posts.view', description: 'View posts' },
      { id: 7, name: 'cms.posts.create', description: 'Create posts' },
      { id: 8, name: 'cms.posts.edit', description: 'Edit posts' },
      { id: 9, name: 'cms.posts.delete', description: 'Delete posts' },
      { id: 10, name: 'cms.posts.publish', description: 'Publish posts' },
      { id: 11, name: 'cms.media.view', description: 'View media' },
      { id: 12, name: 'cms.media.upload', description: 'Upload media' },
      { id: 13, name: 'cms.media.edit', description: 'Edit media' },
      { id: 14, name: 'cms.media.delete', description: 'Delete media' },
      { id: 15, name: 'cms.users.view', description: 'View users' },
      { id: 16, name: 'cms.users.create', description: 'Create users' },
      { id: 17, name: 'cms.users.edit', description: 'Edit users' },
      { id: 18, name: 'cms.users.delete', description: 'Delete users' },
      { id: 19, name: 'cms.roles.view', description: 'View roles' },
      { id: 20, name: 'cms.roles.create', description: 'Create roles' },
      { id: 21, name: 'cms.roles.edit', description: 'Edit roles' },
      { id: 22, name: 'cms.roles.delete', description: 'Delete roles' },
      { id: 23, name: 'cms.roles.assign', description: 'Assign roles' }
    ]
  }),
  delete: (id: number) => Promise.resolve({ message: 'Role deleted successfully' })
}

const Roles: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.list
  })

  const { data: permissionsData } = useQuery({
    queryKey: ['permissions'],
    queryFn: rolesApi.permissions
  })

  const deleteMutation = useMutation({
    mutationFn: rolesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Role deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete role')
    }
  })

  const roles = rolesData?.data || []
  const permissions = permissionsData?.data || []
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleEdit = (role: any) => {
    setSelectedRole(role)
    setShowEditModal(true)
  }

  const getRoleBadge = (roleName: string) => {
    const roleClasses = {
      'super-admin': 'bg-red-100 text-red-800',
      'admin': 'bg-purple-100 text-purple-800',
      'editor': 'bg-blue-100 text-blue-800',
      'author': 'bg-green-100 text-green-800',
      'user': 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleClasses[roleName as keyof typeof roleClasses]}`}>
        {roleName}
      </span>
    )
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600 mt-2">Manage user roles and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => (
          <div key={role.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{role.display_name}</h3>
                  <p className="text-sm text-gray-500">{role.name}</p>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(role)}
                  className="btn btn-outline btn-sm"
                  title="Edit role"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(role.id)}
                  className="btn btn-danger btn-sm"
                  title="Delete role"
                  disabled={deleteMutation.isPending || role.name === 'super-admin'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{role.description}</p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                {role.users_count} users
              </div>
              {getRoleBadge(role.name)}
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Permissions ({role.permissions.length})</h4>
              <div className="flex flex-wrap gap-1">
                {role.permissions.slice(0, 3).map((permission) => (
                  <span key={permission.id} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                    {permission.name}
                  </span>
                ))}
                {role.permissions.length > 3 && (
                  <span className="text-xs text-gray-500">+{role.permissions.length - 3} more</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRoles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm ? 'No roles found matching your search' : 'No roles created yet'}
          </div>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary btn-md mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Role
            </button>
          )}
        </div>
      )}

      {/* Permissions Overview */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {permissions.map((permission) => (
            <div key={permission.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                <p className="text-xs text-gray-500">{permission.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Role</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="role-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Role Display Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Role description"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary btn-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-md"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && selectedRole && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Role: {selectedRole.display_name}</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    className="input"
                    value={selectedRole.name}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    className="input"
                    defaultValue={selectedRole.display_name}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="input"
                  rows={3}
                  defaultValue={selectedRole.description}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {permissions.map((permission) => (
                    <label key={permission.id} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        defaultChecked={selectedRole.permissions.some((p: any) => p.id === permission.id)}
                      />
                      <span className="ml-2 text-sm text-gray-700">{permission.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary btn-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-md"
                >
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Roles
