import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Explore.css'

const API = 'https://project-1-ih77.onrender.com/api'

const ALL_ROLES = [
  'All Roles',
  'Frontend Developer',
  'Backend Developer',
  'ML / AI Engineer',
  'UI/UX Designer',
  'Project Manager',
  'Presenter / Strategist',
  'DevOps Engineer',
  'Full Stack Developer',
]

function scoreUser(person) {
  const base  = 70
  const bonus = Math.min((person.skills?.length || 0) * 4, 28)
  const extra = ((person.name?.length || 0) * 3) % 10
  return Math.min(base + bonus + extra, 98)
}

function Explore() {
  const { user, token } = useAuth()
  const [allUsers, setAllUsers]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [connMap, setConnMap]       = useState({})
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError]           = useState('')

  useEffect(() => {
    if (!user || !token) return
    fetch(`${API}/connections`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const map = {}
          data.connections.forEach(c => {
            const otherId = (c.sender?._id === user.id || c.sender?._id?.toString() === user.id)
              ? (c.receiver?._id || c.receiver)
              : (c.sender?._id || c.sender)
            map[otherId] = { status: c.status, id: c._id, isSender: (c.sender?._id?.toString() === user.id || c.sender === user.id) }
          })
          setConnMap(map)
        }
      })
      .catch(() => {})
  }, [user, token])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (roleFilter !== 'All Roles') params.set('role', roleFilter)
    if (search.trim()) params.set('search', search.trim())

    fetch(`${API}/users?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setAllUsers(data.users.filter(u => (u._id || u.id) !== user?.id))
        else setError('Could not load users.')
      })
      .catch(() => setError('Server error. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [roleFilter])

  const filtered = allUsers.filter(p => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.name?.toLowerCase().includes(q) ||
      p.skills?.some(s => s.toLowerCase().includes(q)) ||
      p.role?.toLowerCase().includes(q) ||
      p.bio?.toLowerCase().includes(q)
    )
  })

  async function handleConnect(receiverId) {
    if (!token) return
    setActionLoading(receiverId)
    try {
      const res  = await fetch(`${API}/connections/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiverId }),
      })
      const data = await res.json()
      if (data.success) {
        setConnMap(prev => ({ ...prev, [receiverId]: { status: 'pending', id: data.connection._id, isSender: true } }))
      } else if (data.connection) {
        setConnMap(prev => ({ ...prev, [receiverId]: { status: data.connection.status, id: data.connection._id, isSender: true } }))
      }
    } catch {}
    setActionLoading(null)
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') {
      setLoading(true)
      const params = new URLSearchParams()
      if (roleFilter !== 'All Roles') params.set('role', roleFilter)
      if (search.trim()) params.set('search', search.trim())
      fetch(`${API}/users?${params.toString()}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) setAllUsers(data.users.filter(u => (u._id || u.id) !== user?.id))
        })
        .finally(() => setLoading(false))
    }
  }

  function getButtonState(id) {
    const c = connMap[id]
    if (!c) return { label: 'Connect', disabled: false, cls: 'btn-primary' }
    if (c.status === 'pending' && c.isSender)  return { label: '⏳ Request Sent', disabled: true,  cls: 'btn-ghost' }
    if (c.status === 'pending' && !c.isSender) return { label: '📨 Respond', disabled: false, cls: 'btn-outline', link: '/connections' }
    if (c.status === 'accepted') return { label: '✓ Connected', disabled: true, cls: 'btn-ghost' }
    if (c.status === 'rejected') return { label: 'Connect Again', disabled: false, cls: 'btn-primary' }
    return { label: 'Connect', disabled: false, cls: 'btn-primary' }
  }

  return (
    <div className="page-wrap">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div className="section-label">Find Teammates</div>
          <h1 className="page-title">Explore Potential Partners</h1>
          <p className="page-sub">Search and connect with students based on skills and roles. Press Enter to search server-side.</p>
        </div>

        <div className="explore-controls">
          <input
            className="search-input"
            type="text"
            placeholder="🔍  Search by name, skill, or role... (Enter to search)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <div className="role-filters">
            {ALL_ROLES.map(r => (
              <button key={r} className={`filter-btn${roleFilter===r?' active':''}`} onClick={() => setRoleFilter(r)}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="api-error" style={{marginBottom:'16px'}}>⚠ {error}</div>}

        {loading ? (
          <div className="loading-state">Loading teammates from database...</div>
        ) : (
          <>
            <p className="results-count">{filtered.length} teammate{filtered.length!==1?'s':''} found</p>

            <div className="explore-grid">
              {filtered.map(person => {
                const score = scoreUser(person)
                const id    = person._id || person.id
                const btn   = getButtonState(id)
                return (
                  <div key={id} className="person-card">
                    <div className="person-top">
                      <img src={person.avatar} alt={person.name} className="person-avatar"/>
                      <div className="person-info">
                        <h3>{person.name}</h3>
                        <span className="person-role">{person.role || 'No role set'}</span>
                      </div>
                      <div className="compatibility-score">
                        <span className="score-num">{score}%</span>
                        <span className="score-label">match</span>
                      </div>
                    </div>

                    {person.bio && <p className="person-bio">{person.bio}</p>}

                    <div className="person-skills">
                      {person.skills?.map(s => <span key={s} className="skill-pill">{s}</span>)}
                    </div>

                    {person.github && (
                      <a
                        href={person.github.startsWith('http') ? person.github : `https://${person.github}`}
                        target="_blank"
                        rel="noopener"
                        className="github-link"
                      >
                        ⬡ {person.github.replace('https://','').replace('http://','')}
                      </a>
                    )}

                    {btn.link ? (
                      <a href={btn.link} className={`btn ${btn.cls} connect-btn`} style={{textAlign:'center',display:'block'}}>
                        {btn.label}
                      </a>
                    ) : (
                      <button
                        className={`btn ${btn.cls} connect-btn`}
                        onClick={() => handleConnect(id)}
                        disabled={btn.disabled || actionLoading === id}
                      >
                        {actionLoading === id ? 'Sending...' : btn.label}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p>No teammates found. Try a different search or role filter.</p>
                <p style={{fontSize:'0.85rem',color:'var(--text-muted)',marginTop:'8px'}}>
                  Tip: Run <code>node seed.js</code> in the backend to load sample users.
                </p>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default Explore
