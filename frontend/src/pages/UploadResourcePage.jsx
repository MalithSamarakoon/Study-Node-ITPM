import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../utils/auth'
import '../styles/Dashboard.css'
import '../styles/Modules.css'

function UploadResourcePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    year: '',
    semester: '',
    module: '',
    title: '',
    description: '',
    resourceType: ''
  })
  const [file, setFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [videoMaterialPdf, setVideoMaterialPdf] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [modules, setModules] = useState([])
  const [filteredModules, setFilteredModules] = useState([])

  useEffect(() => {
    fetchModules()
  }, [])

  useEffect(() => {
    if (formData.year && formData.semester) {
      const filtered = modules.filter(
        m => m.year === parseInt(formData.year) && m.semester === parseInt(formData.semester)
      )
      setFilteredModules(filtered)
    } else {
      setFilteredModules([])
    }
  }, [formData.year, formData.semester, modules])

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const fileType = selectedFile.type
      const fileSize = selectedFile.size / 1024 / 1024
      if (!fileType.includes('pdf') && !fileType.includes('video')) {
        setError('Only PDF and video files are allowed')
        e.target.value = ''
        return
      }
      if (fileSize > 100) {
        setError('File size must be less than 100MB')
        e.target.value = ''
        return
      }
      setFile(selectedFile)
      setError('')
      if (fileType.includes('pdf')) {
        setFormData(prev => ({ ...prev, resourceType: 'pdf' }))
      } else if (fileType.includes('video')) {
        setFormData(prev => ({ ...prev, resourceType: 'video' }))
      }
    }
  }

  const handleThumbnailChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const fileType = selectedFile.type
      const fileSize = selectedFile.size / 1024 / 1024
      if (!fileType.includes('image/jpeg') && !fileType.includes('image/png') && !fileType.includes('image/webp')) {
        setError('Thumbnail must be a JPG, PNG, or WebP image')
        e.target.value = ''
        return
      }
      if (fileSize > 5) {
        setError('Thumbnail size must be less than 5MB')
        e.target.value = ''
        return
      }
      setThumbnail(selectedFile)
      setError('')
    }
  }

  const handleVideoMaterialPdfChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      const fileType = selectedFile.type
      const fileSize = selectedFile.size / 1024 / 1024
      if (!fileType.includes('pdf')) {
        setError('Video material must be a PDF file')
        e.target.value = ''
        return
      }
      if (fileSize > 50) {
        setError('Video material PDF must be less than 50MB')
        e.target.value = ''
        return
      }
      setVideoMaterialPdf(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!file) {
      setError('Please select a file to upload')
      setLoading(false)
      return
    }

    if (formData.resourceType === 'video' && !thumbnail) {
      setError('Please upload a thumbnail image for the video')
      setLoading(false)
      return
    }

    if (formData.resourceType === 'video' && !videoMaterialPdf) {
      setError('Please upload the PDF material for this video')
      setLoading(false)
      return
    }

    try {
      const selectedModule = modules.find(m => m.id === parseInt(formData.module))
      if (!selectedModule) {
        setError('Please select a valid module')
        setLoading(false)
        return
      }

      const metadata = {
        title: formData.title,
        description: formData.description,
        moduleId: selectedModule.id,
        year: parseInt(formData.year),
        semester: parseInt(formData.semester),
        fileType: formData.resourceType.toUpperCase()
      }

      const uploadData = new FormData()
      uploadData.append('meta', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
      uploadData.append('file', file)

      if (formData.resourceType === 'video' && thumbnail) {
        uploadData.append('thumbnail', thumbnail)
      }
      if (formData.resourceType === 'video' && videoMaterialPdf) {
        uploadData.append('videoMaterialPdf', videoMaterialPdf)
      }

      const token = getToken()
      const response = await fetch('http://localhost:8080/api/student/resources', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadData
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Upload failed'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      setSuccess('Resource uploaded successfully! Waiting for admin approval.')
      setFormData({ year: '', semester: '', module: '', title: '', description: '', resourceType: '' })
      setFile(null)
      setThumbnail(null)
      setVideoMaterialPdf(null)
      document.getElementById('file-input').value = ''
      const thumbnailInput = document.getElementById('thumbnail-input')
      if (thumbnailInput) thumbnailInput.value = ''
      const materialInput = document.getElementById('video-material-input')
      if (materialInput) materialInput.value = ''

      setTimeout(() => navigate('/resources/modules'), 2000)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload resource')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-container modules-theme">
      <div className="dashboard-content">
        <div className="upload-section">
          <h1>Upload Resource</h1>
          <p className="subtitle">Share your learning materials with other students</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="year">Year *</label>
                <select id="year" name="year" value={formData.year} onChange={handleChange} required>
                  <option value="">Select Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="semester">Semester *</label>
                <select id="semester" name="semester" value={formData.semester} onChange={handleChange} required disabled={!formData.year}>
                  <option value="">Select Semester</option>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="module">Module / Subject *</label>
              <select id="module" name="module" value={formData.module} onChange={handleChange} required disabled={!formData.semester}>
                <option value="">Select Module</option>
                {filteredModules.map(module => (
                  <option key={module.id} value={module.id}>{module.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="title">Resource Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Lecture Notes Chapter 5"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the resource..."
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="file-input">Upload File (PDF or Video) *</label>
              <input
                type="file"
                id="file-input"
                accept=".pdf,video/*"
                onChange={handleFileChange}
                required
              />
              <small className="file-hint">Maximum file size: 100MB</small>
            </div>

            {formData.resourceType === 'video' && (
              <>
                <div className="form-group">
                  <label htmlFor="thumbnail-input">Upload Thumbnail (JPG, PNG, or WebP) *</label>
                  <input
                    type="file"
                    id="thumbnail-input"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleThumbnailChange}
                    required
                  />
                  <small className="file-hint">Maximum file size: 5MB</small>
                </div>

                <div className="form-group">
                  <label htmlFor="video-material-input">Upload PDF Material For This Video *</label>
                  <input
                    type="file"
                    id="video-material-input"
                    accept=".pdf,application/pdf"
                    onChange={handleVideoMaterialPdfChange}
                    required
                  />
                  <small className="file-hint">Maximum file size: 50MB</small>
                </div>
              </>
            )}

            {file && (
              <div className="file-preview">
                <p><strong>Selected file:</strong> {file.name}</p>
                <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>Type:</strong> {formData.resourceType.toUpperCase()}</p>
                {thumbnail && <p><strong>Thumbnail:</strong> {thumbnail.name}</p>}
                {videoMaterialPdf && <p><strong>Video Material PDF:</strong> {videoMaterialPdf.name}</p>}
              </div>
            )}

            <button type="submit" className="upload-button" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Resource'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UploadResourcePage
