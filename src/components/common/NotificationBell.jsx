import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

export default function NotificationBell() {
  const { currentUser } = useAuth()
  const { notifications, markNotificationRead } = useData()
  const [open, setOpen] = useState(false)

  // Mine = sent directly to me, OR broadcast to everyone with my role.
  const mine = notifications
    .filter(n => n.userId === currentUser.id || (n.role && n.role === currentUser.role && !n.userId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const unreadCount = mine.filter(n => !n.read).length

  return (
    <div className="bell-wrap">
      <button className="bell-btn" onClick={() => setOpen(o => !o)}>
        🔔 Notifications
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="bell-dropdown">
          <div className="bell-dropdown-header">
            <span>Notifications</span>
            <button className="link-btn" style={{ fontSize: '0.72rem' }} onClick={() => setOpen(false)}>Close</button>
          </div>
          {mine.length === 0 ? (
            <p className="empty-state" style={{ padding: '0.5rem' }}>No notifications yet.</p>
          ) : (
            mine.slice(0, 20).map(n => (
              <div key={n.id} className={`bell-dropdown-item ${n.read ? '' : 'unread'}`}>
                <div>{n.message}</div>
                {!n.read && (
                  <button className="bell-mark-read" onClick={() => markNotificationRead(n.id)}>Mark read</button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
