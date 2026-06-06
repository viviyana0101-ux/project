import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import './Navbar.css'

const API = 'http://localhost:5000/api'

function Navbar() {
  const { user, token, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const isLanding = location.pathname === '/'
  const [pendingCount, setPendingCount] = useState(0)

 
  useEffect(() => {
    if (!user || !token) return
    function fetchPending() {
      fetch(`${API}/connections`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            const pending = data.connections.filter(
              c => c.status === 'pending' && (c.receiver?._id || c.receiver) === user.id
            ).length
            setPendingCount(pending)
          }
        })
        .catch(() => {})
    }
    fetchPending()
    const interval = setInterval(fetchPending, 10000)
    return () => clearInterval(interval)
  }, [user, token])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <span className="logo-icon">⬡</span>
        <span className="logo-text">TeamUp <strong>AI</strong></span>
      </Link>

      {isLanding && (
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How It Works</a></li>
          <li><a href="#team">Team Roles</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      )}

      {!isLanding && user && (
        <ul className="nav-links">
          <li><Link to="/dashboard"   className={location.pathname==='/dashboard'?'active':''}>Tasks</Link></li>
          <li><Link to="/explore"     className={location.pathname==='/explore'?'active':''}>Explore</Link></li>
          <li>
            <Link to="/connections" className={`nav-conn-link${location.pathname==='/connections'?'active':''}`}>
              Connections
              {pendingCount > 0 && <span className="nav-badge">{pendingCount}</span>}
            </Link>
          </li>
          <li><Link to="/profile"     className={location.pathname==='/profile'?'active':''}>Profile</Link></li>
        </ul>
      )}

      <div className="nav-actions">
        {user ? (
          <>
            <div className="nav-user">
              <img src={user.avatar} alt={user.name} className="nav-avatar" />
              <span>{user.name}</span>
            </div>
            <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"    className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-outline btn-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
