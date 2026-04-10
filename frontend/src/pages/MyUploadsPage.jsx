import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getToken, getUser } from '../utils/auth'
import { getUserDisplayName } from '../utils/userDisplay'
import '../styles/Dashboard.css'
import '../styles/Modules.css'
import studentsImage from '../assets/images/students.jpg'

function MyUploadsPage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [playingResource, setPlayingResource] = useState(null)
  const [selectedResolution, setSelectedResolution] = useState('720p')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: ''
  })
  const modalRef = useRef(null)

  const backendOrigin = 'http://localhost:8080'

  const closeVideoModal = () => setPlayingResource(null)

  const getResourceFileUrl = (resource) => {
    if (!resource) return null
    if (resource.fileUrl) {
      if (resource.fileUrl.startsWith('http://') || resource.fileUrl.startsWith('https://')) return resource.fileUrl
      if (resource.fileUrl.startsWith('/')) return `${backendOrigin}${resource.fileUrl}`
      return `${backendOrigin}/${resource.fileUrl}`
    }
    return `${backendOrigin}/api/resources/download/${resource.id}`
  }

  const getThumbnailUrl = (resource) => {
    if (!resource) return studentsImage
    const thumbnailPath = resource.thumbnailUrl || resource.thumbnail || resource.thumbnailPath
    if (thumbnailPath) {
      if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) return thumbnailPath
      if (thumbnailPath.startsWith('/')) return `${backendOrigin}${thumbnailPath}`
      return `${backendOrigin}/${thumbnailPath}`
    }
    return studentsImage
  }

  const getVideoMaterialUrl = (resource) => {
    if (!resource) return null
    const materialPath =
      resource.videoMaterialPdfUrl ||
      resource.videoMaterialUrl ||
      resource.materialPdfUrl ||
      resource.materialUrl ||
      resource.pdfMaterialUrl ||
      resource.notesPdfUrl
    if (!materialPath) return null
    if (materialPath.startsWith('http://') || materialPath.startsWith('https://')) return materialPath
    if (materialPath.startsWith('/')) return `${backendOrigin}${materialPath}`
    return `${backendOrigin}/${materialPath}`
  }

  const getTimeAgo = (uploadDate) => {
    const now = new Date()
    const upload = new Date(uploadDate)
    const diffMs = now - upload
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    const diffWeeks = Math.floor(diffMs / 604800000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffWeeks < 4) return `${diffWeeks}w ago`
    return upload.toLocaleDateString()
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getAvatarBgColor = (name) => {
    const colors = [
      'rgba(102, 126, 234, 0.8)',
      'rgba(118, 75, 162, 0.8)',
      'rgba(52, 199, 89, 0.8)',
      'rgba(255, 149, 0, 0.8)',
      'rgba(0, 122, 255, 0.8)',
      'rgba(255, 59, 48, 0.8)'
    ]
    const hash = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const isApprovedResource = (resource) => {
    if (!resource) return false
    if (typeof resource.approved === 'boolean') return resource.approved

    const status = String(resource.approvalStatus || resource.status || resource.resourceStatus || '').toUpperCase()
    if (status.includes('PENDING') || status.includes('REJECT')) return false
    if (status.includes('APPROVED')) return true

    return true
  }

  const isOwnedByCurrentUser = (resource, user) => {
    if (!resource || !user) return false

    const uploader = resource.uploadedBy || resource.uploader
    const userId = String(user.id || user.userId || '')
    const username = String(user.username || '').toLowerCase()
    const email = String(user.email || '').toLowerCase()

    if (uploader && typeof uploader === 'object') {
      const uploaderId = String(uploader.id || uploader.userId || '')
      const uploaderUsername = String(uploader.username || uploader.name || '').toLowerCase()
      const uploaderEmail = String(uploader.email || '').toLowerCase()

      if (uploaderId && userId && uploaderId === userId) return true
      if (uploaderUsername && username && uploaderUsername === username) return true
      if (uploaderEmail && email && uploaderEmail === email) return true
    }

    const fallbackUploader = String(resource.uploaderName || '').toLowerCase()
    if (fallbackUploader && username && fallbackUploader === username) return true
    if (fallbackUploader && email && fallbackUploader === email) return true

    return false
  }

  const fetchMyUploads = async () => {
    setLoading(true)
    setError('')

    try {
      const token = getToken()
      const currentUser = getUser()
      const response = await fetch('http://localhost:8080/api/student/resources/me', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        let errorMessage = errorText || 'Failed to fetch your uploads'

        try {
          const parsed = JSON.parse(errorText)
          if (parsed?.message) errorMessage = parsed.message
        } catch {
          // Keep original text if response is not JSON
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      const list = Array.isArray(data) ? data : (data.content || [])

      const filteredList = list.filter(resource => (
        isApprovedResource(resource) && isOwnedByCurrentUser(resource, currentUser)
      ))

      setResources(filteredList)
    } catch (err) {
      setError(err.message || 'Failed to load resources')
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyUploads()
  }, [])

  useEffect(() => {
    if (!playingResource) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeVideoModal()
      }
    }

    document.addEventListener('keydown', handleEscape)

    requestAnimationFrame(() => {
      if (modalRef.current) {
        modalRef.current.scrollTo({ top: 0, behavior: 'auto' })
      }
    })

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [playingResource])

  const handleStartEdit = (resource) => {
    setEditingId(resource.id)
    setEditForm({
      title: resource.title || '',
      description: resource.description || ''
    })
    setError('')
    setSuccess('')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ title: '', description: '' })
  }

  const handleUpdate = async (resourceId) => {
    setError('')
    setSuccess('')

    if (!editForm.title.trim()) {
      setError('Title is required')
      return
    }

    try {
      const token = getToken()
      const response = await fetch(`http://localhost:8080/api/student/resources/${resourceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editForm.title.trim(),
          description: editForm.description.trim()
        })
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        let errorMessage = errorText || 'Failed to update resource'

        try {
          const parsed = JSON.parse(errorText)
          if (parsed?.message) errorMessage = parsed.message
        } catch {
          // Keep original text if response is not JSON
        }

        throw new Error(errorMessage)
      }

      setSuccess('Resource updated successfully.')
      setEditingId(null)
      setEditForm({ title: '', description: '' })
      fetchMyUploads()
    } catch (err) {
      setError(err.message || 'Failed to update resource')
    }
  }

  const handleDelete = async (resourceId, title) => {
    if (!window.confirm(`Delete "${title}"? This action cannot be undone.`)) return

    setError('')
    setSuccess('')

    try {
      const token = getToken()
      const response = await fetch(`http://localhost:8080/api/student/resources/${resourceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        let errorMessage = errorText || 'Failed to delete resource'

        try {
          const parsed = JSON.parse(errorText)
          if (parsed?.message) errorMessage = parsed.message
        } catch {
          // Keep original text if response is not JSON
        }

        throw new Error(errorMessage)
      }

      setSuccess('Resource deleted successfully.')
      fetchMyUploads()
    } catch (err) {
      setError(err.message || 'Failed to delete resource')
    }
  }

  return (
    <div className="dashboard-container modules-theme">
      <div className="dashboard-content">
        <div className="modules-section">
          <div className="my-uploads-header">
            <div className="my-uploads-title-group">
              <h1>My Uploads</h1>
              <p className="subtitle">Manage your admin approved resources</p>
            </div>
            <button className="action-button view" onClick={fetchMyUploads} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="resources-container my-uploads-container">
            {loading ? (
              <div className="loading-state">Loading your approved resources...</div>
            ) : resources.length === 0 ? (
              <div className="empty-state">
                <p>No approved resources available yet.</p>
              </div>
            ) : (
              <div className="resources-grid">
                {resources.map(resource => {
                  const uploaderDisplay = getUserDisplayName(resource.uploadedBy || resource.uploaderName)
                  const isVideo = (resource.fileType || '').toLowerCase() === 'video'
                  const thumbnailUrl = getThumbnailUrl(resource)
                  const fileUrl = getResourceFileUrl(resource)
                  const videoMaterialUrl = getVideoMaterialUrl(resource)

                  return (
                    <div key={resource.id} className="resource-card">
                      <div className="resource-media">
                        <div className="resource-thumbnail">
                          {isVideo ? (
                            <img
                              src={thumbnailUrl}
                              alt={resource.title}
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = studentsImage
                              }}
                            />
                          ) : (
                            '📄'
                          )}
                        </div>
                      </div>

                      <div className="resource-content">
                        <div className="resource-header">
                          <div className="resource-header-left">
                            <h3>{resource.title}</h3>
                            <p className="resource-description">{resource.description}</p>
                          </div>
                          <div className="resource-header-right">
                            <div className="resource-type-badge">{(resource.fileType || '').toUpperCase()}</div>
                            <div className="status-badge approved">Approved</div>
                          </div>
                        </div>

                        <div className="resource-stats">
                          <span className="stat-badge">📅 {new Date(resource.createdAt).toLocaleDateString()}</span>
                          <span className="stat-badge">#{resource.id}</span>
                        </div>

                        {editingId === resource.id ? (
                          <div className="my-uploads-inline-edit">
                            <div className="form-group">
                              <label htmlFor={`title-${resource.id}`}>Title</label>
                              <input
                                id={`title-${resource.id}`}
                                type="text"
                                value={editForm.title}
                                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor={`description-${resource.id}`}>Description</label>
                              <textarea
                                id={`description-${resource.id}`}
                                rows="3"
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                              />
                            </div>
                            <div className="my-uploads-edit-actions">
                              <button className="action-button view" onClick={() => handleUpdate(resource.id)}>Save</button>
                              <button className="action-button material" onClick={handleCancelEdit}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="resource-footer">
                            <div className="uploader-info">
                              <div className="uploader-avatar" style={{ background: getAvatarBgColor(uploaderDisplay) }}>
                                {getInitials(uploaderDisplay)}
                              </div>
                              <div className="uploader-details">
                                <div className="uploader-name">{uploaderDisplay}</div>
                                <div className="uploader-time">{getTimeAgo(resource.createdAt)}</div>
                              </div>
                            </div>

                            <div className="resource-actions">
                              {isVideo ? (
                                <>
                                  <button className="action-button view" onClick={() => setPlayingResource(resource)}>
                                    Watch Video
                                  </button>
                                  {videoMaterialUrl && (
                                    <a href={videoMaterialUrl} target="_blank" rel="noopener noreferrer" className="action-button material">
                                      View Material
                                    </a>
                                  )}
                                </>
                              ) : (
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="action-button view">
                                  View PDF
                                </a>
                              )}
                              <a href={fileUrl} download className="action-button download">
                                Download
                              </a>

                              <div className="resource-actions-management">
                                <button className="edit-button" title="Edit" onClick={() => handleStartEdit(resource)}>
                                  ✏️
                                </button>
                                <button className="delete-button" title="Delete" onClick={() => handleDelete(resource.id, resource.title)}>
                                  🗑️
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {playingResource && createPortal(
            <div className="modules-video-modal" ref={modalRef} onClick={closeVideoModal}>
              <div className="modules-video-modal-content" onClick={e => e.stopPropagation()}>
                <button type="button" className="modules-video-close" onClick={closeVideoModal} aria-label="Close video modal">✕</button>
                <div className="video-player-section">
                  <div className="video-player-container">
                    <video controls autoPlay playsInline preload="metadata">
                      <source src={getResourceFileUrl(playingResource)} />
                      Your browser does not support the video tag.
                    </video>
                  </div>

                  <div className="video-controls">
                    <div className="resolution-selector">
                      <span className="control-label">Resolution:</span>
                      <div className="resolution-buttons">
                        {['360p', '480p', '720p', '1080p'].map(res => (
                          <button
                            key={res}
                            className={`resolution-btn ${selectedResolution === res ? 'active' : ''}`}
                            onClick={() => setSelectedResolution(res)}
                          >
                            {res}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="video-info-section">
                    <h2 className="video-title">{playingResource.title}</h2>
                    {getVideoMaterialUrl(playingResource) && (
                      <div className="video-material-panel">
                        <div className="video-material-title">Study Material</div>
                        <a
                          href={getVideoMaterialUrl(playingResource)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="video-material-link"
                        >
                          Open Attached PDF
                        </a>
                      </div>
                    )}

                    <div className="video-channel">
                      <div className="channel-avatar">👤</div>
                      <div className="channel-info">
                        <div className="channel-name">{getUserDisplayName(playingResource.uploadedBy)}</div>
                      </div>
                    </div>

                    {playingResource.description && (
                      <div className="video-description">{playingResource.description}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </div>
  )
}

export default MyUploadsPage
