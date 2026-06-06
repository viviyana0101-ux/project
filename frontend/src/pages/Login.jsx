import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Auth.css'

function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading]   = useState(false)

  function validate() {
    const e = {}
    if (!form.email.trim())    e.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.'
    if (!form.password.trim()) e.password = 'Password is required.'
    return e
  }

  function handleChange(ev) {
    const { name, value } = ev.target
    setForm(f => ({...f, [name]: value}))
    setErrors(prev => ({...prev, [name]: ''}))
    setApiError('')
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    const result = await login(form.email, form.password)
    setLoading(false)
    if (result.success) navigate('/dashboard')
    else setApiError(result.message)
  }

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-wrap">
        <div className="auth-box">
          <div className="auth-logo"><span>⬡</span></div>
          <h2>Welcome back</h2>
          <p className="auth-sub">Sign in to your TeamUp AI account</p>

          {apiError && <div className="api-error">⚠ {apiError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className={`form-input${errors.email?' error':''}`} type="email" name="email" placeholder="you@college.edu" value={form.email} onChange={handleChange}/>
              {errors.email && <span className="error-msg">⚠ {errors.email}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className={`form-input${errors.password?' error':''}`} type="password" name="password" placeholder="Your password" value={form.password} onChange={handleChange}/>
              {errors.password && <span className="error-msg">⚠ {errors.password}</span>}
            </div>
            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">Don't have an account? <Link to="/register">Sign Up</Link></p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Login
