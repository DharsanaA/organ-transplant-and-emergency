import { useAuth } from '../../context/AuthContext'
import { useHospital } from '../../context/HospitalContext'
import { useData } from '../../context/DataContext'

export default function AdminDashboard() {
  const { currentUser, users } = useAuth()
  const { hospitals } = useHospital()
  const { donors, recipients, organs, requests, auditLog } = useData()

  const stats = [
    { label: 'Total Users', value: users.length },
    { label: 'Total Hospitals', value: hospitals.length },
    { label: 'Total Donors', value: donors.length },
    { label: 'Total Recipients', value: recipients.length },
    { label: 'Total Organs/Tissues', value: organs.length },
    { label: 'Total Requests', value: requests.length },
    { label: 'Emergency Requests', value: requests.filter(r => r.priority === 'Emergency').length, tone: 'urgent' },
    { label: 'Escalated', value: requests.filter(r => r.escalated && r.status === 'Pending').length, tone: 'urgent' },
    { label: 'Active Transports', value: requests.filter(r => r.status === 'Approved' && r.transportStatus !== 'Received').length },
    { label: 'Audit Entries', value: auditLog.length },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome, {currentUser.fullName}</h1>
        <p className="page-subtitle">System-wide overview across all hospitals</p>
      </div>
      <div className="stat-grid">
        {stats.map(s => (
          <div key={s.label} className={`stat-card stat-${s.tone || 'neutral'}`}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
