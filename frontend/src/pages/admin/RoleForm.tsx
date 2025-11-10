import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, X, ArrowLeft } from 'lucide-react'
import { cmsRolesApi } from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'

const RoleForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as number[],
  })

  const { data: role, isLoading: loadingRole } = useQuery({
    queryKey: ['cms-role', id],
    queryFn: () => cmsRolesApi.get(Number(id!)),
    enabled: isEdit,
  })

  const { data: permissionsData } = useQuery({
    queryKey: ['cms-permissions'],
    queryFn: () => cmsRolesApi.getPermissions(),
  })

  useEffect(() => {
    if (role && isEdit) {
      setFormData({
        name: role.name || '',
        permissions: Array.isArray(role.permissions) ? role.permissions.map((p: any) => p.id || p) : [],
      })
    }
  }, [role, isEdit])

  const createMutation = useMutation({
    mutationFn: cmsRolesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-roles'] })
      toast.success('Role created successfully')
      navigate('/admin/roles')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create role')
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => cmsRolesApi.update(Number(id!), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-roles'] })
      queryClient.invalidateQueries({ queryKey: ['cms-role', id] })
      toast.success('Role updated successfully')
      navigate('/admin/roles')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update role')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      name: formData.name,
      permissions: formData.permissions,
    }

    if (isEdit) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  const togglePermission = (permissionId: number) => {
    if (formData.permissions.includes(permissionId)) {
      setFormData({ ...formData, permissions: formData.permissions.filter(id => id !== permissionId) })
    } else {
      setFormData({ ...formData, permissions: [...formData.permissions, permissionId] })
    }
  }

  if (isEdit && loadingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  const permissions = Array.isArray(permissionsData) ? permissionsData : []
  const groupedPermissions = permissions.reduce((acc: any, perm: any) => {
    const group = perm.name.split(' ')[0] || 'Other'
    if (!acc[group]) acc[group] = []
    acc[group].push(perm)
    return acc
  }, {})

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/roles')}
          className="btn btn-outline btn-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Roles
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Edit Role' : 'Create New Role'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
                placeholder="e.g., editor, author"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permissions
              </label>
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([group, perms]: [string, any]) => (
                  <div key={group}>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{group}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {perms.map((perm: any) => (
                        <label key={perm.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="rounded border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{perm.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/roles')}
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
                {isEdit ? 'Update Role' : 'Create Role'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default RoleForm

