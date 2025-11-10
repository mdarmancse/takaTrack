import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, X, ArrowLeft } from 'lucide-react'
import { cmsUsersApi, cmsRolesApi } from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'

const UserForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    roles: [] as number[],
  })

  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['cms-user', id],
    queryFn: () => cmsUsersApi.get(Number(id!)),
    enabled: isEdit,
  })

  const { data: rolesData } = useQuery({
    queryKey: ['cms-roles'],
    queryFn: () => cmsRolesApi.list(),
  })

  useEffect(() => {
    if (user && isEdit) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        roles: Array.isArray(user.roles) ? user.roles.map((r: any) => r.id || r) : [],
      })
    }
  }, [user, isEdit])

  const createMutation = useMutation({
    mutationFn: cmsUsersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-users'] })
      toast.success('User created successfully')
      navigate('/admin/users')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create user')
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => cmsUsersApi.update(Number(id!), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-users'] })
      queryClient.invalidateQueries({ queryKey: ['cms-user', id] })
      toast.success('User updated successfully')
      navigate('/admin/users')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update user')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData: any = {
      name: formData.name,
      email: formData.email,
      roles: formData.roles,
    }

    if (!isEdit || formData.password) {
      submitData.password = formData.password
      submitData.password_confirmation = formData.password_confirmation
    }

    if (isEdit) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  const toggleRole = (roleId: number) => {
    if (formData.roles.includes(roleId)) {
      setFormData({ ...formData, roles: formData.roles.filter(id => id !== roleId) })
    } else {
      setFormData({ ...formData, roles: [...formData.roles, roleId] })
    }
  }

  if (isEdit && loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  const roles = Array.isArray(rolesData) ? rolesData : []

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/users')}
          className="btn btn-outline btn-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Edit User' : 'Create New User'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password {isEdit ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input"
                  required={!isEdit}
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password {isEdit ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  className="input"
                  required={!isEdit}
                  minLength={8}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Roles
              </label>
              <div className="space-y-2">
                {roles.map((role: any) => (
                  <label key={role.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.roles.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                      className="rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{role.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="btn btn-outline btn-md"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="btn btn-primary btn-md"
          >
            {createMutation.isPending || updateMutation.isPending ? (
              <>
                <LoadingSpinner />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? 'Update User' : 'Create User'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserForm

