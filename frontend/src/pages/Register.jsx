import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Auth.css'

const ROLES  = ['Frontend Developer','Backend Developer','ML / AI Engineer','UI/UX Designer','Project Manager','Presenter / Strategist','DevOps Engineer','Full Stack Developer']
const SKILLS = ['React','Node.js','Python','MongoDB','Figma','Machine Learning','DevOps','UI Design','Express','SQL','Vue','TypeScript','Docker','AWS','TensorFlow','PyTorch','GraphQL','Java','Angular','Redis']

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', role:'', skills:[], github:'', bio:'' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading]   = useState(false)

  function validate() {
    const e = {}
    if (!form.name.trim())      e.name    = 'Name is required.'
    if (!form.email.trim())     e.email   = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.'
    if (!form.password)         e.password = 'Password is required.'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters.'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.'
    if (!form.role)             e.role    = 'Please select your role.'
    if (form.skills.length === 0) e.skills = 'Select at least one skill.'
    return e
  }

  function handleChange(ev) {
    const { name, value } = ev.target
    setForm(f => ({...f, [name]: value}))
    setErrors(prev => ({...prev, [name]: ''}))
    setApiError('')
  }

  function toggleSkill(skill) {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill]
    }))
    setErrors(prev => ({...prev, skills: ''}))
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    const result = await register(form)
    setLoading(false)
    if (result.success) navigate('/dashboard')
    else setApiError(result.message)
  }

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-wrap">
        <div className="auth-box auth-box-wide">
          <div className="auth-logo"><span>⬡</span></div>
          <h2>Join TeamUp AI</h2>
          <p className="auth-sub">Create your account and start finding teammates</p>

          {apiError && <div className="api-error">⚠ {apiError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className={`form-input${errors.name?' error':''}`} type="text" name="name" placeholder="Your full name" value={form.name} onChange={handleChange}/>
                {errors.name && <span className="error-msg">⚠ {errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className={`form-input${errors.email?' error':''}`} type="email" name="email" placeholder="you@college.edu" value={form.email} onChange={handleChange}/>
                {errors.email && <span className="error-msg">⚠ {errors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className={`form-input${errors.password?' error':''}`} type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange}/>
                {errors.password && <span className="error-msg">⚠ {errors.password}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input className={`form-input${errors.confirmPassword?' error':''}`} type="password" name="confirmPassword" placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange}/>
                {errors.confirmPassword && <span className="error-msg">⚠ {errors.confirmPassword}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Primary Role *</label>
                <select className={`form-select${errors.role?' error':''}`} name="role" value={form.role} onChange={handleChange}>
                  <option value="">Select your role</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {errors.role && <span className="error-msg">⚠ {errors.role}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">GitHub Profile</label>
                <input className="form-input" type="text" name="github" placeholder="https://github.com/username" value={form.github} onChange={handleChange}/>
              </div>
            </div>

            <div className="form-group" style={{marginTop:'16px'}}>
              <label className="form-label">Bio (optional)</label>
              <textarea className="form-textarea" name="bio" placeholder="Tell your future teammates about yourself..." value={form.bio} onChange={handleChange} rows={2}/>
            </div>

            <div className="form-group" style={{marginTop:'16px'}}>
              <label className="form-label">Skills * {errors.skills && <span className="error-msg"> ⚠ {errors.skills}</span>}</label>
              <div className="skills-grid">
                {SKILLS.map(s => (
                  <button type="button" key={s} className={`skill-tag${form.skills.includes(s)?' selected':''}`} onClick={() => toggleSkill(s)}>{s}</button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-btn" style={{marginTop:'24px'}} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login">Sign In</Link></p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Register
