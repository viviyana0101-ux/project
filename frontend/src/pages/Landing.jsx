import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Landing.css'

const FEATURES = [
  { icon: '🤖', title: 'AI Team Matching', desc: 'Our AI analyzes your skills, interests, and work style to recommend the most compatible teammates.', items: ['Skill-based compatibility scores','Role gap analysis','Instant team suggestions'], accent: 'card-accent-1' },
  { icon: '📊', title: 'Skill Gap Analysis', desc: "AI scans your team's combined profile and highlights exactly what expertise you're missing.", items: ['Real-time skill map','Missing role alerts','Suggested additions'], accent: 'card-accent-2' },
  { icon: '💬', title: 'Real-Time Chat', desc: 'Built-in team chat keeps all project conversations in one place with AI meeting summaries.', items: ['Team chat rooms','Online status','AI chat assistant'], accent: 'card-accent-3' },
  { icon: '✅', title: 'Task Management', desc: 'Assign tasks, set deadlines, and track progress with a visual Kanban board.', items: ['Kanban board','Deadline reminders','Progress tracking'], accent: 'card-accent-4' },
  { icon: '💡', title: 'Project Idea Generator', desc: "AI analyzes your team's skills and suggests the most impactful project ideas.", items: ['Skill-based suggestions','Hackathon-ready ideas','Tech stack recommendations'], accent: 'card-accent-5' },
  { icon: '🏆', title: 'Project Showcase', desc: 'Publish your completed projects with demo links and GitHub repos.', items: ['Public project pages','GitHub integration','Demo video links'], accent: 'card-accent-6' },
]

const ROLES = [
  { seed: 'frontend', title: 'Frontend Dev',     sub: 'React, Vue, UI/UX' },
  { seed: 'backend',  title: 'Backend Dev',      sub: 'Node, Python, APIs' },
  { seed: 'ml',       title: 'ML Engineer',      sub: 'AI, Data, Models' },
  { seed: 'design',   title: 'UI Designer',      sub: 'Figma, Branding' },
  { seed: 'pm',       title: 'Project Manager',  sub: 'Planning, Docs' },
  { seed: 'presenter',title: 'Presenter',        sub: 'Pitch, Slides, Demo' },
]

function Landing() {
  return (
    <div className="landing-wrap">
      <Navbar />

      <header className="hero">
        <div className="hero-badge">🚀 AI-Powered Collaboration</div>
        <h1 className="hero-title">Find the Right<br/><span className="highlight">Teammates.</span><br/>Build Better Projects.</h1>
        <p className="hero-sub">TeamUp AI matches you with the perfect collaborators based on skills, interests, and working style — so you can stop searching and start building.</p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary">Find My Team</Link>
          <a href="#how" className="btn btn-ghost">See How It Works →</a>
        </div>
        <div className="hero-stats">
          <div className="stat"><span className="stat-num">2,400+</span><span className="stat-label">Students Matched</span></div>
          <div className="stat-divider"></div>
          <div className="stat"><span className="stat-num">380+</span><span className="stat-label">Projects Launched</span></div>
          <div className="stat-divider"></div>
          <div className="stat"><span className="stat-num">94%</span><span className="stat-label">Match Satisfaction</span></div>
        </div>
      </header>

      <section className="features" id="features">
        <div className="section-label">Core Features</div>
        <h2 className="section-title">Everything you need to<br/>collaborate smarter</h2>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className={`feature-card ${f.accent}`}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
              <ul>{f.items.map(i => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      <section className="how" id="how">
        <div className="section-label">How It Works</div>
        <h2 className="section-title">From profile to team<br/>in minutes</h2>
        <ol className="steps">
          {[
            { num:'01', title:'Create Your Profile', desc:"Add your skills, interests, experience level, and the role you're looking for." },
            { num:'02', title:'Get AI Recommendations', desc:'Our matching engine surfaces your most compatible teammates instantly.' },
            { num:'03', title:'Form Your Team', desc:'Send join requests, accept invitations, and build a balanced team.' },
            { num:'04', title:'Build & Ship', desc:'Use built-in chat, task board, and AI assistant to deliver your best work.' },
          ].map(s => (
            <li key={s.num} className="step">
              <span className="step-num">{s.num}</span>
              <div className="step-content"><h3>{s.title}</h3><p>{s.desc}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section className="roles" id="team">
        <div className="section-label">Team Roles</div>
        <h2 className="section-title">We match every kind of builder</h2>
        <div className="roles-grid">
          {ROLES.map(r => (
            <div key={r.seed} className="role-card">
              <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${r.seed}`} alt={r.title} className="role-avatar"/>
              <h4>{r.title}</h4>
              <p>{r.sub}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="signup-section" id="signup">
        <div className="signup-box">
          <h2>Ready to find your dream team?</h2>
          <p>Join thousands of students already building together on TeamUp AI.</p>
          <div className="signup-btns">
            <Link to="/register" className="btn btn-primary">Create Free Account</Link>
            <Link to="/login"    className="btn btn-outline">Sign In</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Landing
