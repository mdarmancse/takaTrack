import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Search, Shield, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import { cmsRolesApi } from '../../services/api'

const Roles: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)

  const { data: rolesData, isLoading, error } = useQuery({
    queryKey: ['cms-roles'],
    queryFn: () => cmsRolesApi.list()
  })

  const { data: permissionsData } = useQuery({
    queryKey: ['cms-permissions'],
    queryFn: () => cmsRolesApi.getPermissions()
  })

  const deleteMutation = useMutation({
    mutationFn: cmsRolesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-roles'] })
      toast.success('Role deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete role')
    }
  })

  const roles = Array.isArray(rolesData) ? rolesData : []
  const permissions = Array.isArray(permissionsData) ? permissionsData : []
  const filteredRoles = roles.filter(role => 
    !searchTerm ||
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.display_name && role.display_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleEdit = (role: any) => {
    // Navigate to edit page instead of showing modal
    navigate(`/admin/roles/${role.id}/edit`)
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
          <p className="text-red-800">Error loading roles: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600 mt-2">Manage user roles and permissions</p>
        </div>
        <Link
          to="/admin/roles/new"
          className="btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Link>
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
            <Link
              to="/admin/roles/new"
              className="btn btn-primary btn-md mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Role
            </Link>
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
