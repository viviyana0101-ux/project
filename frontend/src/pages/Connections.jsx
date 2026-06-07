import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { io } from 'socket.io-client'
import './Connections.css'

const API = 'https://project-1-ih77.onrender.com/api'

function Connections() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [connections, setConnections] = useState([])
  const [loading, setLoading]         = useState(true)
  const [toast, setToast]             = useState(null)
  const [tab, setTab]                 = useState('accepted')
  const socketRef = useRef(null)

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  useEffect(() => {
    if (!user || !token) return
    loadConnections()

    const socket = io('https://project-1-ih77.onrender.com')
    socketRef.current = socket
    socket.emit('join:user', user.id)

    socket.on('connection:request', ({ connection }) => {
      setConnections(prev => {
        const exists = prev.find(c => c._id === connection._id)
        return exists ? prev : [connection, ...prev]
      })
      showToast(`📨 New request from ${connection.sender?.name}`)
    })

    socket.on('connection:updated', ({ connection }) => {
      setConnections(prev => prev.map(c => c._id === connection._id ? connection : c))
      if (connection.status === 'accepted') showToast(`✓ ${connection.receiver?.name || connection.sender?.name} accepted your request!`)
    })

    return () => socket.disconnect()
  }, [user, token])

  async function loadConnections() {
    try {
      const res  = await fetch(`${API}/connections`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) setConnections(data.connections)
    } catch {}
    setLoading(false)
  }

  async function handleRespond(connectionId, status) {
    try {
      const res  = await fetch(`${API}/connections/${connectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (data.success) {
        setConnections(prev => prev.map(c => c._id === connectionId ? data.connection : c))
        showToast(status === 'accepted' ? '✓ Connection accepted! Workspace ready.' : 'Request declined.')
      }
    } catch { showToast('⚠ Error responding.') }
  }

  function getOther(conn) {
    if (!user) return null
    const sid = conn.sender?._id?.toString() || conn.sender?.toString()
    return sid === user.id ? conn.receiver : conn.sender
  }

  function isSender(conn) {
    const sid = conn.sender?._id?.toString() || conn.sender?.toString()
    return sid === user.id
  }

  const accepted = connections.filter(c => c.status === 'accepted')
  const incoming = connections.filter(c => c.status === 'pending' && !isSender(c))
  const sent     = connections.filter(c => c.status === 'pending' &&  isSender(c))

  const tabs = [
    { key: 'accepted', label: `✓ Connected (${accepted.length})` },
    { key: 'pending',  label: `📨 Incoming (${incoming.length})` },
    { key: 'sent',     label: `⏳ Sent (${sent.length})` },
  ]

  let display = tab === 'accepted' ? accepted : tab === 'pending' ? incoming : sent

  return (
    <div className="page-wrap">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div className="section-label">Network</div>
          <h1 className="page-title">Your Connections</h1>
          <p className="page-sub">Manage requests and open collaboration workspaces with accepted connections.</p>
        </div>

        <div className="conn-tabs">
          {tabs.map(t => (
            <button key={t.key} className={`conn-tab${tab===t.key?' active':''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">Loading connections...</div>
        ) : display.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{tab==='accepted'?'🤝':tab==='pending'?'📨':'⏳'}</div>
            <p>
              {tab === 'accepted' ? 'No accepted connections yet. Go to Explore to send requests!' :
               tab === 'pending'  ? 'No incoming requests right now.' :
               'No sent requests. Go to Explore to connect with people!'}
            </p>
          </div>
        ) : (
          <div className="conn-list">
            {display.map(conn => {
              const other = getOther(conn)
              return (
                <div key={conn._id} className="conn-card">
                  <img src={other?.avatar} alt={other?.name} className="conn-avatar" />
                  <div className="conn-info">
                    <h3>{other?.name}</h3>
                    <span className="conn-role">{other?.role || 'No role set'}</span>
                    {other?.skills?.length > 0 && (
                      <div className="conn-skills">
                        {other.skills.slice(0,4).map(s => <span key={s} className="skill-pill">{s}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="conn-actions">
                    {conn.status === 'accepted' && (
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/workspace/${conn._id}`)}
                      >
                        🚀 Open Workspace
                      </button>
                    )}
                    {conn.status === 'pending' && !isSender(conn) && (
                      <>
                        <button className="btn btn-primary" onClick={() => handleRespond(conn._id, 'accepted')}>Accept</button>
                        <button className="btn btn-ghost"   onClick={() => handleRespond(conn._id, 'rejected')}>Decline</button>
                      </>
                    )}
                    {conn.status === 'pending' && isSender(conn) && (
                      <span className="pending-label">⏳ Awaiting response</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default Connections
