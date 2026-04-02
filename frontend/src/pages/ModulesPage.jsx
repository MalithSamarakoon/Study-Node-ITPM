import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { getUserDisplayName } from '../utils/userDisplay'
import { getToken, isLoggedIn } from '../utils/auth'
import '../styles/Dashboard.css'
import '../styles/Modules.css'
import studentsImage from '../assets/images/students.jpg'

function ModulesPage() {
  const navigate = useNavigate()
  const [selectedYear, setSelectedYear] = useState('3')
  const [selectedSemester, setSelectedSemester] = useState('1')
  const [selectedModule, setSelectedModule] = useState('')
  const [resources, setResources] = useState([])
  const [playingResource, setPlayingResource] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedResolution, setSelectedResolution] = useState('720p')
  const [modules, setModules] = useState([])
  const [filteredModules, setFilteredModules] = useState([])
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
    if (!resource) return null
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

  useEffect(() => {
    fetchModules()
  }, [])

  useEffect(() => {
    const filtered = modules.filter(
      m => m.year === parseInt(selectedYear) && m.semester === parseInt(selectedSemester)
    )
    setFilteredModules(filtered)
  }, [selectedYear, selectedSemester, modules])

  useEffect(() => {
    if (selectedModule) fetchResources()
  }, [selectedModule, selectedYear, selectedSemester])

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

  const fetchModules = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/public/modules')
      if (response.ok) {
        const data = await response.json()
        setModules(data)
      }
    } catch (err) {
      console.error('Failed to fetch modules:', err)
    }
  }

  const fetchResources = async () => {
    setLoading(true)
    setError('')
    try {
      const module = modules.find(m => m.id === parseInt(selectedModule))
      if (!module) { setError('Invalid module selected'); setLoading(false); return }

      const params = new URLSearchParams({
        moduleId: module.id.toString(),
        year: selectedYear,
        semester: selectedSemester,
        page: '0',
        size: '20'
      })

      const headers = {}
      const token = getToken()
      if (token) headers['Authorization'] = `Bearer ${token}`

      const response = await fetch(`http://localhost:8080/api/public/resources?${params}`, { headers })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to fetch resources')
      }
      const data = await response.json()
      setResources(data.content || [])
    } catch (err) {
      setError(err.message || 'Failed to load resources')
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-container modules-theme">
      <div className="dashboard-content">
        <div className="modules-section">
          <h1>Browse Resources</h1>
          <p className="subtitle">Select year, semester, and module to view resources</p>

          <div className="filter-section">
            <div className="filter-group">
              <label htmlFor="year-filter">Year</label>
              <select
                id="year-filter"
                value={selectedYear}
                onChange={(e) => { setSelectedYear(e.target.value); setSelectedModule('') }}
              >
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="semester-filter">Semester</label>
              <select
                id="semester-filter"
                value={selectedSemester}
                onChange={(e) => { setSelectedSemester(e.target.value); setSelectedModule('') }}
              >
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="module-filter">Module</label>
              <select
                id="module-filter"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
              >
                <option value="">Select a module</option>
                {filteredModules.map(module => (
                  <option key={module.id} value={module.id}>{module.name}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {selectedModule && (
            <div className="resources-container">
              <h2>{modules.find(m => m.id === parseInt(selectedModule))?.name || 'Module'} - Resources</h2>
              {loading ? (
                <div className="loading-state">Loading resources...</div>
              ) : resources.length === 0 ? (
                <div className="empty-state">
                  <p>📚 No resources available for this module yet.</p>
                  {isLoggedIn() && (
                    <button className="primary-button" onClick={() => navigate('/resources/upload')}>
                      Be the first to upload!
                    </button>
                  )}
                </div>
              ) : (
                <div className="resources-grid">
                  {resources.map(resource => {
                    const uploaderDisplay = getUserDisplayName(resource.uploadedBy || resource.uploaderName)
                    const isVideo = (resource.fileType || '').toLowerCase() === 'video'
                    const thumbnailUrl = getThumbnailUrl(resource)
                    const videoMaterialUrl = getVideoMaterialUrl(resource)

                    return (
                      <div key={resource.id} className="resource-card">
                        <div className="resource-media">
                          <div className="resource-thumbnail">
                            {isVideo ? (
                              <img
                                src={thumbnailUrl}
                                alt={resource.title}
                                onError={(e) => { e.target.onerror = null; e.target.src = studentsImage }}
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
                            <div className="resource-type-badge">
                              {(resource.fileType || '').toUpperCase()}
                            </div>
                          </div>

                          <div className="resource-stats">
                            <span className="stat-badge">📅 {new Date(resource.createdAt).toLocaleDateString()}</span>
                          </div>

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
                                      View Material PDF
                                    </a>
                                  )}
                                </>
                              ) : (
                                <a
                                  href={`http://localhost:8080${resource.fileUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="action-button view"
                                >
                                  View PDF
                                </a>
                              )}
                              <a
                                href={`http://localhost:8080${resource.fileUrl}`}
                                download
                                className="action-button download"
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {!selectedModule && (
            <div className="empty-state">
              <p>👆 Select a module to view available resources</p>
            </div>
          )}

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

export default ModulesPage
