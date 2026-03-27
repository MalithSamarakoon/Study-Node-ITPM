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

  useEffect(() => {
    fetchModules()
  }, [])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
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
    } catch (err) {
      setError(err.message || 'Failed to create module')
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
    <div className="dashboard-content" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', padding: '2rem'}}>
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
              <h2>Create New Module</h2>
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
                  />
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
                  />
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
                  />
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
                  />
                </div>

                <button type="submit" className="primary-button" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Module'}
                </button>
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
                            <button
                              onClick={() => handleDelete(module.id, module.name)}
                              className="delete-button"
                              title="Delete module"
                            >
                              🗑️
                            </button>
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
