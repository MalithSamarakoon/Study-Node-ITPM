import { useState, useEffect } from 'react'
import { getToken } from '../utils/auth'
import '../styles/Dashboard.css'
import '../styles/Modules.css'

function AdminModulesPage() {
  const [modules, setModules] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    year: '3',
    semester: '1',
    category: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    fetchModules()
  }, [])

  useEffect(() => {
    if (!success && !error) return

    const dismissTimer = setTimeout(() => {
      setSuccess('')
      setError('')
    }, 3000)

    return () => clearTimeout(dismissTimer)
  }, [success, error])

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
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}

    // Module name validation
    if (!formData.name.trim()) {
      errors.name = 'Module name is required'
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Module name must be at least 3 characters'
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Module name must not exceed 100 characters'
    }

    // Module code validation (if provided)
    if (formData.code.trim()) {
      if (formData.code.trim().length < 3) {
        errors.code = 'Module code must be at least 3 characters'
      } else if (formData.code.trim().length > 20) {
        errors.code = 'Module code must not exceed 20 characters'
      } else if (!/^[A-Z0-9]+$/.test(formData.code.trim())) {
        errors.code = 'Module code must contain only uppercase letters and numbers'
      }
    }

    // Description validation (if provided)
    if (formData.description.trim()) {
      if (formData.description.trim().length < 10) {
        errors.description = 'Description must be at least 10 characters'
      } else if (formData.description.trim().length > 500) {
        errors.description = 'Description must not exceed 500 characters'
      }
    }

    // Category validation (if provided)
    if (formData.category.trim()) {
      if (formData.category.trim().length > 50) {
        errors.category = 'Category must not exceed 50 characters'
      }
    }

    // Check for duplicate module name (only if creating new)
    if (!editingId && modules.length > 0) {
      const isDuplicate = modules.some(m =>
        m.name.toLowerCase() === formData.name.trim().toLowerCase() &&
        m.year === parseInt(formData.year) &&
        m.semester === parseInt(formData.semester)
      )
      if (isDuplicate) {
        errors.name = 'A module with this name already exists for this year and semester'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate form before submission
    if (!validateForm()) {
      setError('Please fix the validation errors below')
      return
    }

    setLoading(true)

    try {
      const moduleData = {
        name: formData.name,
        code: formData.code || null,
        description: formData.description || null,
        year: parseInt(formData.year),
        semester: parseInt(formData.semester),
        category: formData.category || null
      }

      const token = getToken()

      if (editingId) {
        // Update existing module
        const response = await fetch(`http://localhost:8080/api/admin/modules/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(moduleData)
        })

        if (!response.ok) {
          const contentType = response.headers.get('content-type')
          let errorMessage = 'Failed to update module'
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } else {
            const errorText = await response.text()
            if (response.status === 403) {
              errorMessage = 'Access Denied: You need ADMIN privileges to update modules.'
            } else if (response.status === 401) {
              errorMessage = 'Unauthorized: Please login again'
            } else {
              errorMessage = errorText || errorMessage
            }
          }
          throw new Error(errorMessage)
        }

        const updatedModule = await response.json()
        setSuccess(`Module "${updatedModule.name}" updated successfully!`)
        setEditingId(null)
        setFormData({ name: '', code: '', description: '', year: '3', semester: '1', category: '' })
        fetchModules()
      } else {
        // Create new module
        const response = await fetch('http://localhost:8080/api/admin/modules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(moduleData)
        })

        if (!response.ok) {
          const contentType = response.headers.get('content-type')
          let errorMessage = 'Failed to create module'
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            errorMessage = errorData.message || errorMessage
          } else {
            const errorText = await response.text()
            if (response.status === 403) {
              errorMessage = 'Access Denied: You need ADMIN privileges to create modules.'
            } else if (response.status === 401) {
              errorMessage = 'Unauthorized: Please login again'
            } else {
              errorMessage = errorText || errorMessage
            }
          }
          throw new Error(errorMessage)
        }

        const newModule = await response.json()
        setSuccess(`Module "${newModule.name}" created successfully!`)
        setFormData({ name: '', code: '', description: '', year: '3', semester: '1', category: '' })
        fetchModules()
      }
    } catch (err) {
      setError(err.message || 'Failed to process module')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (moduleId, moduleName) => {
    if (!window.confirm(`Are you sure you want to delete "${moduleName}"?`)) return

    try {
      const token = getToken()
      const response = await fetch(`http://localhost:8080/api/admin/modules/${moduleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error('Failed to delete module')

      setSuccess(`Module "${moduleName}" deleted successfully!`)
      fetchModules()
    } catch (err) {
      setError(err.message || 'Failed to delete module')
    }
  }

  const handleEdit = (module) => {
    setEditingId(module.id)
    setFormData({
      name: module.name,
      code: module.code || '',
      description: module.description || '',
      year: module.year.toString(),
      semester: module.semester.toString(),
      category: module.category || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({ name: '', code: '', description: '', year: '3', semester: '1', category: '' })
    setValidationErrors({})
  }

  const groupedModules = modules.reduce((acc, module) => {
    const key = `Year ${module.year} - Semester ${module.semester}`
    if (!acc[key]) acc[key] = []
    acc[key].push(module)
    return acc
  }, {})

  const totalModules = modules.length
  const year3Modules = modules.filter(m => m.year === 3).length
  const year4Modules = modules.filter(m => m.year === 4).length

  return (
    <div className="dashboard-content modules-theme" style={{minHeight: '100vh', padding: '2rem'}}>
      <div className="admin-section">
          <h1>Manage Modules</h1>
          <p className="subtitle">Create and manage course modules</p>

          <div className="dashboard-cards">
            <div className="dash-card">
              <div className="card-icon">📚</div>
              <h3>Total Modules</h3>
              <p>{totalModules} modules available</p>
            </div>
            <div className="dash-card">
              <div className="card-icon">🎓</div>
              <h3>Year 3</h3>
              <p>{year3Modules} modules for 3rd year</p>
            </div>
            <div className="dash-card">
              <div className="card-icon">🧭</div>
              <h3>Year 4</h3>
              <p>{year4Modules} modules for 4th year</p>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="admin-container">
            <div className="admin-card">
              <h2>{editingId ? 'Edit Module' : 'Create New Module'}</h2>
              <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                  <label htmlFor="name">Module Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Information Technology Project Management"
                    required
                    className={validationErrors.name ? 'input-error' : ''}
                  />
                  {validationErrors.name && <span className="error-text">{validationErrors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="code">Module Code</label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="e.g., IT3010"
                    className={validationErrors.code ? 'input-error' : ''}
                  />
                  {validationErrors.code && <span className="error-text">{validationErrors.code}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of the module..."
                    rows="3"
                    className={validationErrors.description ? 'input-error' : ''}
                  />
                  <span className="helper-text">{formData.description.length}/500 characters</span>
                  {validationErrors.description && <span className="error-text">{validationErrors.description}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="year">Year *</label>
                    <select id="year" name="year" value={formData.year} onChange={handleChange} required>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="semester">Semester *</label>
                    <select id="semester" name="semester" value={formData.semester} onChange={handleChange} required>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="e.g., Core, Elective"
                    className={validationErrors.category ? 'input-error' : ''}
                  />
                  {validationErrors.category && <span className="error-text">{validationErrors.category}</span>}
                </div>

                <button type="submit" className="primary-button" disabled={loading}>
                  {loading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Module' : 'Create Module')}
                </button>
                {editingId && (
                  <button type="button" className="secondary-button" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                )}
              </form>
            </div>

            <div className="admin-card">
              <h2>Existing Modules ({modules.length})</h2>
              {modules.length === 0 ? (
                <div className="empty-state">
                  <p>No modules created yet. Create your first module above!</p>
                </div>
              ) : (
                <div className="modules-list">
                  {Object.keys(groupedModules).sort().map(group => (
                    <div key={group} className="module-group">
                      <h3 className="group-header">{group}</h3>
                      <div className="module-items">
                        {groupedModules[group].map(module => (
                          <div key={module.id} className="module-item">
                            <div className="module-info">
                              <span className="module-name">
                                {module.code ? `${module.code} - ` : ''}{module.name}
                              </span>
                              <span className="module-meta">
                                ID: {module.id} {module.category ? `• ${module.category}` : ''}
                              </span>
                            </div>
                            <div className="module-actions">
                              <button
                                onClick={() => handleEdit(module)}
                                className="edit-button"
                                title="Edit module"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(module.id, module.name)}
                                className="delete-button"
                                title="Delete module"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  )
}

export default AdminModulesPage
