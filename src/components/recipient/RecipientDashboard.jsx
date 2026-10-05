import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { calculateEmergencyScore, daysWaiting } from '../../services/matchingService'
import EmergencyScorePanel from '../common/EmergencyScorePanel'

export default function RecipientDashboard() {
  const { currentUser } = useAuth()
  const { recipients, requests, notifications } = useData()

  const mine = recipients.find(r => r.userId === currentUser.id)
  const myRequests = requests.filter(r => r.recipientId === mine?.id)
  const myNotifications = notifications.filter(n => n.userId === currentUser.id)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome, {currentUser.fullName}</h1>
        <p className="page-subtitle">Your priority, requests, and matching status</p>
      </div>

      {!mine ? (
        <div className="panel">
          <p className="empty-state">You haven't created a recipient profile yet.</p>
          <Link className="btn-primary btn-compact" to="/recipient/profile">Create recipient profile</Link>
        </div>
      ) : (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{mine.urgency}</div>
            <div className="stat-label">My Urgency</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{mine.status}</div>
            <div className="stat-label">Matching Status</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{myRequests.length}</div>
            <div className="stat-label">My Requests</div>
          </div>
        </div>
      )}

      {mine && (
        <div className="panel">
          <h2>My emergency score</h2>
          <p className="page-subtitle" style={{ marginBottom: '0.75rem' }}>
            This is exactly how the hospital ranks urgency — clinical severity, self-reported urgency, waiting time, and blood-group rarity.
          </p>
          <EmergencyScorePanel {...calculateEmergencyScore({
            severity: mine.severity ?? 1, waitingDays: daysWaiting(mine), urgency: mine.urgency, bloodGroup: mine.bloodGroup,
          })} />
        </div>
      )}

      <div className="panel">
        <h2>My requests</h2>
        {myRequests.length === 0 ? (
          <p className="empty-state">No requests yet.</p>
        ) : (
          <table className="data-table">
            <thead><tr><th>Organ</th><th>Priority</th><th>Status</th><th>Transport</th></tr></thead>
            <tbody>
              {myRequests.map(r => (
                <tr key={r.id}>
                  <td>{r.organType}</td>
                  <td><span className={`status-pill priority-${r.priority.toLowerCase()}`}>{r.priority}</span></td>
                  <td>{r.status}</td>
                  <td>{r.transportStatus || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <h2>Notifications</h2>
        {myNotifications.length === 0 ? (
          <p className="empty-state">No notifications.</p>
        ) : (
          <ul className="notification-list">
            {[...myNotifications].reverse().map(n => <li key={n.id}>{n.message}</li>)}
          </ul>
        )}
      </div>
    </div>
  )
}
