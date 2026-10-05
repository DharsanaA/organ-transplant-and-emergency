import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'

export default function DonorDashboard() {
  const { currentUser } = useAuth()
  const { donors, organs, notifications } = useData()

  const myDonor = donors.find(d => d.userId === currentUser.id)
  const myOrgans = organs.filter(o => o.donorId === myDonor?.id)
  const myNotifications = notifications.filter(n => n.userId === currentUser.id)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome, {currentUser.fullName}</h1>
        <p className="page-subtitle">Your donation profile and status</p>
      </div>

      {!myDonor ? (
        <div className="panel">
          <p className="empty-state">You haven't created a donor profile yet.</p>
          <Link className="btn-primary btn-compact" to="/donor/profile">Create donor profile</Link>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{myDonor.consentStatus}</div>
              <div className="stat-label">Consent Status</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{myDonor.organsToDonate.length}</div>
              <div className="stat-label">Organs/Tissues Registered</div>
            </div>
            <div className="stat-card stat-good">
              <div className="stat-value">{myOrgans.filter(o => o.status === 'Transplanted').length}</div>
              <div className="stat-label">Successful Donations</div>
            </div>
          </div>

          <div className="panel">
            <h2>Donation preference</h2>
            <p>{myDonor.organsToDonate.join(', ')}</p>
          </div>
        </>
      )}

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
