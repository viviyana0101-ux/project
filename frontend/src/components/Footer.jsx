import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="nav-logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">TeamUp <strong>AI</strong></span>
          </div>
          <p>Find the right teammates.<br />Build better projects.</p>
        </div>
        <div className="footer-links">
          <h5>Platform</h5>
          <Link to="/dashboard">Task Manager</Link>
          <Link to="/explore">Explore Teams</Link>
          <Link to="/profile">My Profile</Link>
        </div>
        <div className="footer-links">
          <h5>Account</h5>
          <Link to="/register">Sign Up</Link>
          <Link to="/login">Login</Link>
          <a href="mailto:hello@teamupai.com">Email Us</a>
          <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 TeamUp AI. Built with ❤️ for students, by students.</p>
      </div>
    </footer>
  )
}

export default Footer