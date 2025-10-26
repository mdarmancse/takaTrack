import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Search, Eye, Download, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'

// Mock API functions - replace with actual API calls
const mediaApi = {
  list: () => Promise.resolve({
    data: [
      {
        id: 1,
        filename: 'hero-image.jpg',
        original_filename: 'hero-image.jpg',
        mime_type: 'image/jpeg',
        url: '/images/hero-image.jpg',
        size: 245760,
        width: 1920,
        height: 1080,
        alt_text: 'Hero image for homepage',
        title: 'Homepage Hero',
        folder: 'images',
        is_public: true,
        uploaded_by: 1,
        created_at: '2024-01-20',
        uploader: { name: 'John Doe' }
      },
      {
        id: 2,
        filename: 'document.pdf',
        original_filename: 'user-guide.pdf',
        mime_type: 'application/pdf',
        url: '/documents/document.pdf',
        size: 1024000,
        width: null,
        height: null,
        alt_text: null,
        title: 'User Guide',
        folder: 'documents',
        is_public: true,
        uploaded_by: 2,
        created_at: '2024-01-18',
        uploader: { name: 'Jane Smith' }
      },
      {
        id: 3,
        filename: 'video.mp4',
        original_filename: 'tutorial.mp4',
        mime_type: 'video/mp4',
        url: '/videos/video.mp4',
        size: 15728640,
        width: 1280,
        height: 720,
        alt_text: null,
        title: 'Tutorial Video',
        folder: 'videos',
        is_public: false,
        uploaded_by: 1,
        created_at: '2024-01-15',
        uploader: { name: 'John Doe' }
      }
    ]
  }),
  delete: (id: number) => Promise.resolve({ message: 'Media deleted successfully' })
}

const Media: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [folderFilter, setFolderFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: mediaData, isLoading } = useQuery({
    queryKey: ['media'],
    queryFn: mediaApi.list
  })

  const deleteMutation = useMutation({
    mutationFn: mediaApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      toast.success('Media deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete media')
    }
  })

  const media = mediaData?.data || []
  const filteredMedia = media.filter(item => {
    const matchesSearch = item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFolder = folderFilter === 'all' || item.folder === folderFilter
    const matchesType = typeFilter === 'all' || item.mime_type.startsWith(typeFilter)
    return matchesSearch && matchesFolder && matchesType
  })

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this media file?')) {
      deleteMutation.mutate(id)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('video/')) return '🎥'
    if (mimeType.startsWith('audio/')) return '🎵'
    if (mimeType === 'application/pdf') return '📄'
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
    return '📁'
  }

  const folders = [...new Set(media.map(item => item.folder))].filter(Boolean)
  const types = [...new Set(media.map(item => item.mime_type.split('/')[0]))].filter(Boolean)

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-2">Manage your media files</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn btn-secondary btn-md">
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </button>
          <button className="btn btn-primary btn-md">
            <Plus className="w-4 h-4 mr-2" />
            Add Media
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={folderFilter}
              onChange={(e) => setFolderFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Folders</option>
              {folders.map(folder => (
                <option key={folder} value={folder}>{folder}</option>
              ))}
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredMedia.map((item) => (
            <div key={item.id} className="card hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                {item.mime_type.startsWith('image/') ? (
                  <img
                    src={item.url}
                    alt={item.alt_text || item.title || item.filename}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-4xl">{getFileIcon(item.mime_type)}</div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900 truncate" title={item.title || item.filename}>
                  {item.title || item.filename}
                </h3>
                <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
                <p className="text-xs text-gray-500">{item.folder}</p>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.is_public ? 'Public' : 'Private'}
                  </span>
                  <div className="flex space-x-1">
                    <button className="btn btn-outline btn-xs" title="View">
                      <Eye className="w-3 h-3" />
                    </button>
                    <button className="btn btn-outline btn-xs" title="Download">
                      <Download className="w-3 h-3" />
                    </button>
                    <button className="btn btn-outline btn-xs" title="Edit">
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-danger btn-xs"
                      title="Delete"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Folder
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedia.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                        {item.mime_type.startsWith('image/') ? (
                          <img
                            src={item.url}
                            alt={item.alt_text || item.title || item.filename}
                            className="h-12 w-12 object-cover rounded"
                          />
                        ) : (
                          <div className="text-lg">{getFileIcon(item.mime_type)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.title || item.filename}</div>
                      <div className="text-sm text-gray-500">{item.original_filename}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.mime_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatFileSize(item.size)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.folder}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.uploader.name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="btn btn-outline btn-sm" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="btn btn-outline btn-sm" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="btn btn-outline btn-sm" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn btn-danger btn-sm"
                          title="Delete"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredMedia.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm || folderFilter !== 'all' || typeFilter !== 'all'
              ? 'No media files found matching your criteria'
              : 'No media files uploaded yet'
            }
          </div>
          {!searchTerm && folderFilter === 'all' && typeFilter === 'all' && (
            <button className="btn btn-primary btn-md mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Upload Your First File
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Media
