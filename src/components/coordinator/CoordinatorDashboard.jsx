import { useHospital } from '../../context/HospitalContext'
import { useData } from '../../context/DataContext'
import RequireHospital from './RequireHospital'

export default function CoordinatorDashboard() {
  const { selectedHospitalId } = useHospital()
  const { donors, recipients, organs, requests } = useData()

  const h = { donors, recipients, organs, requests }
  const scoped = {
    donors: h.donors.filter(d => d.hospitalId === selectedHospitalId),
    recipients: h.recipients.filter(r => r.hospitalId === selectedHospitalId),
    organs: h.organs.filter(o => o.hospitalId === selectedHospitalId),
    requests: h.requests.filter(r => r.hospitalId === selectedHospitalId),
  }

  const stats = [
    { label: 'Total Donors', value: scoped.donors.length },
    { label: 'Total Recipients', value: scoped.recipients.length },
    { label: 'Available Organs', value: scoped.organs.filter(o => o.status === 'Available').length, tone: 'good' },
    { label: 'Reserved Organs', value: scoped.organs.filter(o => o.status === 'Reserved').length, tone: 'warn' },
    { label: 'Transplanted', value: scoped.organs.filter(o => o.status === 'Transplanted').length, tone: 'good' },
    { label: 'Pending Requests', value: scoped.requests.filter(r => r.status === 'Pending').length, tone: 'warn' },
    { label: 'Escalated', value: scoped.requests.filter(r => r.escalated && r.status === 'Pending').length, tone: 'urgent' },
    { label: 'Emergency Priority', value: scoped.requests.filter(r => r.priority === 'Emergency').length, tone: 'urgent' },
    { label: 'Active Transports', value: scoped.requests.filter(r => r.status === 'Approved' && r.transportStatus !== 'Received').length },
  ]

  return (
    <RequireHospital>
      <div className="stat-grid" style={{ marginTop: '1.5rem' }}>
        {stats.map(s => (
          <div key={s.label} className={`stat-card stat-${s.tone || 'neutral'}`}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
    </RequireHospital>
  )
}
