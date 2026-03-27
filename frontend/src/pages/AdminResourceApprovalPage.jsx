import { useState, useEffect } from 'react'
import { getUserDisplayName } from '../utils/userDisplay'
import { getToken } from '../utils/auth'
import '../styles/AdminApproval.css'

function AdminResourceApprovalPage() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [view, setView] = useState('pending')
  const [modules, setModules] = useState([])
  const [selectedYear, setSelectedYear] = useState('3')
  const [selectedSemester, setSelectedSemester] = useState('1')
  const [selectedModule, setSelectedModule] = useState('')

  useEffect(() => {
    fetchModules()
    fetchResources('pending')
  }, [])

  const fetchModules = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/public/modules')
      if (!res.ok) return
      const data = await res.json()
      setModules(data || [])
    } catch (err) {
      console.warn('Failed to load modules', err)
    }
  }

  const fetchResources = async (requestedView = 'pending', token = null) => {
    try {
      setLoading(true)
      setError('')
      const authToken = token || getToken()
      let url = ''
      if (requestedView === 'pending') {
        url = 'http://localhost:8080/api/admin/resources/queue'
      } else if (selectedModule) {
        url = `http://localhost:8080/api/public/resources?moduleId=${selectedModule}&year=${selectedYear}&semester=${selectedSemester}&page=0&size=50`
      } else {
        url = 'http://localhost:8080/api/admin/resources/approved'
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })

      if (!response.ok) {
        const txt = await response.text().catch(() => '')
        throw new Error(txt || 'Failed to fetch resources')
      }

      const data = await response.json()
      const resourceList = Array.isArray(data) ? data : (data.content || [])
      setResources(resourceList)
    } catch (err) {
      setError(err.message || 'Failed to fetch resources')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (resourceId) => {
    if (!window.confirm('Approve this resource?')) return
    try {
      const token = getToken()
      const response = await fetch(`http://localhost:8080/api/admin/resources/${resourceId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approve: true, rejectionReason: null })
      })
      if (!response.ok) throw new Error('Approve failed')
      setSuccess('Resource approved!')
      fetchResources(view)
    } catch (err) {
      setError(err.message || 'Failed to approve')
    }
  }

  const handleReject = async (resourceId) => {
    const reason = window.prompt('Rejection reason (optional):')
    if (reason === null) return
    if (!window.confirm('Reject this resource?')) return

    try {
      const token = getToken()
      const response = await fetch(`http://localhost:8080/api/admin/resources/${resourceId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approve: false, rejectionReason: reason || null })
      })
      if (!response.ok) throw new Error('Reject failed')
      setSuccess('Resource rejected!')
      fetchResources(view)
    } catch (err) {
      setError(err.message || 'Failed to reject')
    }
  }

  const selectedModuleName = selectedModule
    ? (modules.find(m => String(m.id) === String(selectedModule))?.name || 'Selected module')
    : 'All modules'

  return (
    <div className="approval-shell approval-theme">
      <main className="approval-content">
        <section className="approval-hero">
          <div>
            <p className="approval-kicker">Admin workspace</p>
            <h1>Resource Approval</h1>
            <p className="approval-subtitle">Review, verify, and publish student-uploaded resources.</p>
          </div>
          <div className="approval-stats">
            <div className="approval-stat">
              <span className="stat-label">View</span>
              <span className="stat-value">{view === 'pending' ? 'Pending' : 'Approved'}</span>
            </div>
            <div className="approval-stat">
              <span className="stat-label">Items</span>
              <span className="stat-value">{resources.length}</span>
            </div>
            <div className="approval-stat">
              <span className="stat-label">Term</span>
              <span className="stat-value">Y{selectedYear} / S{selectedSemester}</span>
            </div>
            <div className="approval-stat wide">
              <span className="stat-label">Module</span>
              <span className="stat-value">{selectedModuleName}</span>
            </div>
          </div>
        </section>

        {error && <div className="notice error">{error}</div>}
        {success && <div className="notice success">{success}</div>}

        <section className="approval-toolbar">
          <div className="approval-panel">
            <h2>Filter resources</h2>
            <div className="approval-filters">
              <div className="approval-filter">
                <label>Year</label>
                <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div className="approval-filter">
                <label>Semester</label>
                <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}>
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>

              <div className="approval-filter">
                <label>Module</label>
                <select value={selectedModule} onChange={e => setSelectedModule(e.target.value)}>
                  <option value="">All / select a module</option>
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="approval-panel action-panel">
            <h2>Queues</h2>
            <div className="approval-actions">
              <button
                className={`queue-button ${view === 'pending' ? 'active' : ''}`}
                onClick={() => { setView('pending'); fetchResources('pending') }}
                disabled={view === 'pending'}
              >
                Pending queue
              </button>

              <button
                className={`queue-button ${view === 'approved' ? 'active' : ''}`}
                onClick={() => { setView('approved'); fetchResources('approved') }}
                disabled={view === 'approved'}
              >
                Approved archive
              </button>

              <button className="queue-button ghost" onClick={() => fetchResources(view)} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh list'}
              </button>
            </div>
          </div>
        </section>

        <section className="approval-list">
          {loading && <div className="state-card">Loading resources...</div>}
          {!loading && resources.length === 0 && (
            <div className="state-card">
              {view === 'pending' ? 'No pending resources right now.' : 'No approved resources match the current filters.'}
            </div>
          )}
          {!loading && resources.length > 0 && (
            <div className="approval-grid">
              {resources.map(resource => {
                const uploadedByDisplay = resource.uploadedBy
                  ? getUserDisplayName(resource.uploadedBy)
                  : 'Unknown'

                return (
                  <article key={resource.id} className="approval-card">
                    <div className="card-header">
                      <div>
                        <span className="card-kicker">{resource.fileType || 'Resource'}</span>
                        <h3>{resource.title}</h3>
                      </div>
                      <span className="card-id">ID {resource.id}</span>
                    </div>
                    <div className="card-meta">
                      <div>
                        <span className="meta-label">Uploaded by</span>
                        <span className="meta-value">{uploadedByDisplay}</span>
                      </div>
                      <div>
                        <span className="meta-label">Module</span>
                        <span className="meta-value">{resource.module?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="meta-label">Type</span>
                        <span className="meta-value">{resource.fileType || 'Unknown'}</span>
                      </div>
                    </div>
                    {resource.description && <p className="card-desc">{resource.description}</p>}
                    {view === 'pending' && (
                      <div className="card-actions">
                        <button className="approve-button" onClick={() => handleApprove(resource.id)}>Approve</button>
                        <button className="reject-button" onClick={() => handleReject(resource.id)}>Reject</button>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default AdminResourceApprovalPage
