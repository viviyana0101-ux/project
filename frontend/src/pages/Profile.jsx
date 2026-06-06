import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Profile.css'

const SKILLS_LIST = ['React','Node.js','Python','MongoDB','Figma','Machine Learning','DevOps','UI Design','Express','SQL','Vue','TypeScript']

function Profile() {
  const { user, users, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({ name: user?.name||'', role: user?.role||'', github: user?.github||'', skills: user?.skills||[] })
  const [saved, setSaved]     = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({...f, [name]: value}))
  }

  function toggleSkill(skill) {
    setForm(f => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill]
    }))
  }

  async function handleSave() {
    const result = await updateProfile(user.id, form)
    if (result.success) {
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      alert(result.message)
    }
  }

  const taskCount = (() => {
    try { return (JSON.parse(localStorage.getItem(`teamup-tasks-${user?.id}`)) || []).length }
    catch { return 0 }
  })()

  return (
    <div className="page-wrap">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div className="section-label">My Account</div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-sub">Your TeamUp AI identity — skills, role, and contributions.</p>
        </div>

        <div className="profile-layout">
          <div className="profile-sidebar">
            <div className="card profile-card">
              <img src={user?.avatar} alt={user?.name} className="profile-avatar"/>
              <h3>{user?.name}</h3>
              <span className="profile-role-tag">{user?.role || 'No role set'}</span>
              <div className="profile-stats">
                <div className="profile-stat"><strong>{taskCount}</strong><span>Tasks</span></div>
                <div className="profile-stat"><strong>{user?.skills?.length||0}</strong><span>Skills</span></div>
              </div>
              {user?.github && (
                <a href={user.github.startsWith('http')?user.github:`https://${user.github}`} target="_blank" rel="noopener" className="github-link-btn">
                  ⬡ GitHub Profile
                </a>
              )}
              <button className="btn btn-outline" style={{width:'100%',marginTop:'12px'}} onClick={() => setEditing(!editing)}>
                {editing ? 'Cancel Edit' : '✏ Edit Profile'}
              </button>
            </div>
          </div>

          <div className="profile-main">
            {editing ? (
              <div className="card">
                <div className="card-title"><div className="icon">✏️</div>Edit Profile</div>
                <div className="form-group" style={{marginBottom:'16px'}}>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text" name="name" value={form.name} onChange={handleChange}/>
                </div>
                <div className="form-group" style={{marginBottom:'16px'}}>
                  <label className="form-label">Primary Role</label>
                  <input className="form-input" type="text" name="role" value={form.role} onChange={handleChange}/>
                </div>
                <div className="form-group" style={{marginBottom:'16px'}}>
                  <label className="form-label">GitHub Profile</label>
                  <input className="form-input" type="text" name="github" value={form.github} onChange={handleChange} placeholder="https://github.com/username"/>
                </div>
                <div className="form-group" style={{marginBottom:'24px'}}>
                  <label className="form-label">Skills</label>
                  <div className="skills-grid-profile">
                    {SKILLS_LIST.map(s => (
                      <button type="button" key={s} className={`skill-tag${form.skills.includes(s)?' selected':''}`} onClick={() => toggleSkill(s)}>{s}</button>
                    ))}
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
              </div>
            ) : (
              <>
                <div className="card">
                  <div className="card-title"><div className="icon">👤</div>Account Info</div>
                  <div className="info-rows">
                    <div className="info-row"><span className="info-key">Name</span><span>{user?.name}</span></div>
                    <div className="info-row"><span className="info-key">Email</span><span>{user?.email}</span></div>
                    <div className="info-row"><span className="info-key">Role</span><span>{user?.role||'—'}</span></div>
                    <div className="info-row"><span className="info-key">GitHub</span>
                      {user?.github ? <a href={user.github.startsWith('http')?user.github:`https://${user.github}`} target="_blank" rel="noopener" style={{color:'var(--accent)'}}>{user.github}</a> : <span>—</span>}
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-title"><div className="icon">🛠</div>My Skills</div>
                  {user?.skills?.length > 0 ? (
                    <div className="skills-display">
                      {user.skills.map(s => <span key={s} className="skill-pill-profile">{s}</span>)}
                    </div>
                  ) : (
                    <p style={{color:'var(--text-muted)',fontSize:'0.9rem'}}>No skills added yet. Edit your profile to add skills.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
      {saved && <div className="toast">✓ Profile updated!</div>}
    </div>
  )
}

export default Profile
