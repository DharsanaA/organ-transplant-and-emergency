import { useHospital } from '../../context/HospitalContext'
import { useData } from '../../context/DataContext'
import EmptyState from '../common/EmptyState'

export default function AuditLog() {
  const { hospitals } = useHospital()
  const { auditLog } = useData()

  return (
    <div className="page">
      <div className="page-header">
        <h1>Audit Log</h1>
        <p className="page-subtitle">Every significant action, system-wide — visible only to Admin</p>
      </div>
      <div className="panel">
        {auditLog.length === 0 ? (
          <EmptyState message="No actions logged yet." />
        ) : (
          <table className="data-table">
            <thead><tr><th>When</th><th>Who</th><th>Role</th><th>Action</th><th>Hospital</th></tr></thead>
            <tbody>
              {[...auditLog].reverse().map(a => (
                <tr key={a.id}>
                  <td>{new Date(a.timestamp).toLocaleString()}</td>
                  <td>{a.userName}</td>
                  <td>{a.role}</td>
                  <td>{a.action}</td>
                  <td>{hospitals.find(h => h.id === a.hospitalId)?.name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
