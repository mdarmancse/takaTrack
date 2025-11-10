import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, X, ArrowLeft } from 'lucide-react'
import { cmsPagesApi } from '../../services/api'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'

const PageForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    template: '',
    parent_id: null as number | null,
    featured: false,
    published_at: '',
  })

  const { data: page, isLoading: loadingPage } = useQuery({
    queryKey: ['cms-page', id],
    queryFn: () => cmsPagesApi.get(Number(id!)),
    enabled: isEdit,
  })

  const { data: pagesData } = useQuery({
    queryKey: ['cms-pages'],
    queryFn: () => cmsPagesApi.list(),
  })

  useEffect(() => {
    if (page && isEdit) {
      setFormData({
        title: page.title || '',
        content: typeof page.content === 'string' ? page.content : JSON.stringify(page.content || {}),
        excerpt: page.excerpt || '',
        status: page.status || 'draft',
        template: page.template || '',
        parent_id: page.parent_id || null,
        featured: page.featured || false,
        published_at: page.published_at ? new Date(page.published_at).toISOString().slice(0, 16) : '',
      })
    }
  }, [page, isEdit])

  const createMutation = useMutation({
    mutationFn: cmsPagesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] })
      toast.success('Page created successfully')
      navigate('/admin/pages')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create page')
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => cmsPagesApi.update(Number(id!), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-pages'] })
      queryClient.invalidateQueries({ queryKey: ['cms-page', id] })
      toast.success('Page updated successfully')
      navigate('/admin/pages')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update page')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      content: formData.content ? JSON.parse(formData.content) : null,
      published_at: formData.published_at || null,
    }

    if (isEdit) {
      updateMutation.mutate(submitData)
    } else {
      createMutation.mutate(submitData)
    }
  }

  if (isEdit && loadingPage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  const pages = pagesData?.data || []

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/pages')}
          className="btn btn-outline btn-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pages
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Edit Page' : 'Create New Page'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="input"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content (JSON)
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="input font-mono text-sm"
                rows={10}
                placeholder='{"blocks": []}'
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="input"
                  required
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parent Page
                </label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : null })}
                  className="input"
                >
                  <option value="">None</option>
                  {pages.filter((p: any) => p.id !== Number(id || 0)).map((page: any) => (
                    <option key={page.id} value={page.id}>{page.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template
                </label>
                <input
                  type="text"
                  value={formData.template}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Published At
                </label>
                <input
                  type="datetime-local"
                  value={formData.published_at}
                  onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured Page</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/pages')}
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
                {isEdit ? 'Update Page' : 'Create Page'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PageForm

