import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const API = 'http://localhost:5000/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('teamup-user')) || null }
    catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('teamup-token') || null)
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (user) localStorage.setItem('teamup-user', JSON.stringify(user))
    else localStorage.removeItem('teamup-user')
  }, [user])

  useEffect(() => {
    if (token) localStorage.setItem('teamup-token', token)
    else localStorage.removeItem('teamup-token')
  }, [token])

  function refreshUsers() {
    fetch(`${API}/users`)
      .then(r => r.json())
      .then(data => { if (data.success) setUsers(data.users) })
      .catch(() => {})
  }

  useEffect(() => { refreshUsers() }, [])

  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }

  async function register(data) {
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        const u = { ...json.user, id: json.user.id || json.user._id }
        setUser(u)
        setToken(json.token)
        refreshUsers()
        return { success: true }
      }
      return { success: false, message: json.message }
    } catch {
      return { success: false, message: 'Server error. Is the backend running?' }
    }
  }

  async function login(email, password) {
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      if (json.success) {
        const u = { ...json.user, id: json.user.id || json.user._id }
        setUser(u)
        setToken(json.token)
        refreshUsers()
        return { success: true }
      }
      return { success: false, message: json.message }
    } catch {
      return { success: false, message: 'Server error. Is the backend running?' }
    }
  }

  async function updateProfile(id, data) {
    try {
      const res  = await fetch(`${API}/auth/users/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (json.success) {
        const updated = { ...json.user, id: json.user._id }
        setUser(updated)
        return { success: true }
      }
      return { success: false, message: json.message }
    } catch {
      return { success: false, message: 'Server error.' }
    }
  }

  function logout() {
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, users, register, login, logout, updateProfile, authHeaders, refreshUsers }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() { return useContext(AuthContext) }
