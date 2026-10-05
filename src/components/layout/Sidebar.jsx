import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { NAV_BY_ROLE, SIDEBAR_QUOTES } from '../../config/navigation'
import NotificationBell from '../common/NotificationBell'

// A simple heart-in-hand illustration, drawn with CSS variables so it always
// matches the app's palette instead of shipping a separate image asset.
function DonationGlyph() {
  return (
    <svg className="sidebar-glyph" viewBox="0 0 120 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M60 20 C50 5, 25 8, 25 30 C25 48, 60 68, 60 68 C60 68, 95 48, 95 30 C95 8, 70 5, 60 20 Z"
        fill="var(--accent)" opacity="0.9" />
      <path d="M10 78 L38 62 L52 68 C58 70, 58 78, 50 79 L34 80 L60 92 L100 78 L112 84"
        fill="none" stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  )
}

export default function Sidebar() {
  const { currentUser, logout } = useAuth()
  const [quoteIndex, setQuoteIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex(i => (i + 1) % SIDEBAR_QUOTES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  if (!currentUser) return null
  const navItems = NAV_BY_ROLE[currentUser.role] || []

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">🫀</span>
        <span className="brand-name">OrganLink</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-decoration">
        <DonationGlyph />
        <p className="sidebar-quote">"{SIDEBAR_QUOTES[quoteIndex]}"</p>
      </div>

      <div className="sidebar-footer">
        <NotificationBell />
        <div className="user-chip">
          <div className="user-avatar">{currentUser.fullName?.[0]?.toUpperCase() ?? '?'}</div>
          <div>
            <div className="user-name">{currentUser.fullName}</div>
            <div className="user-role">{currentUser.role}</div>
          </div>
        </div>
        <button className="btn-logout" onClick={logout}>Log out</button>
      </div>
    </aside>
  )
}
