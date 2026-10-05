import { useAuth } from '../../context/AuthContext'
import { useHospital } from '../../context/HospitalContext'
import { useData } from '../../context/DataContext'
import { isBloodGroupCompatible, calculateEmergencyScore, daysWaiting } from '../../services/matchingService'
import { createRequest } from '../../models/request'
import EmptyState from '../common/EmptyState'

export default function AvailableOrgans() {
  const { currentUser, users } = useAuth()
  const { hospitals } = useHospital()
  const { organs, recipients, setRecipients, requests, setRequests, logAction, notify } = useData()

  const mine = recipients.find(r => r.userId === currentUser.id)

  if (!mine) {
    return (
      <div className="page">
        <div className="page-header"><h1>Available Organs</h1></div>
        <p className="empty-state">Create your recipient profile first so we know what you need.</p>
      </div>
    )
  }

  // Only organs that match this recipient's own required type and blood
  // compatibility are shown — never the full hospital inventory.
  const matches = organs.filter(o =>
    o.status === 'Available' &&
    o.organType === mine.requiredOrgan &&
    isBloodGroupCompatible(o.bloodGroup, mine.bloodGroup)
  )

  const alreadyRequestedOrganIds = requests
    .filter(r => r.recipientId === mine.id && r.status === 'Pending')
    .map(r => r.organId)

  function requestOrgan(organ) {
    const { tier } = calculateEmergencyScore({
      severity: mine.severity ?? 1,
      waitingDays: daysWaiting(mine),
      urgency: mine.urgency,
      bloodGroup: mine.bloodGroup,
    })
    const request = createRequest({
      organId: organ.id,
      organType: organ.organType,
      recipientId: mine.id,
      recipientName: mine.fullName,
      donorId: organ.donorId,
      hospitalId: organ.hospitalId,
      priority: tier,
      createdBy: currentUser.id,
    })
    setRequests([...requests, request])
    setRecipients(recipients.map(r => r.id === mine.id ? { ...r, status: 'Matched' } : r))
    logAction({ user: currentUser, action: `Requested ${organ.organType}`, entityType: 'request', entityId: request.id, hospitalId: organ.hospitalId })

    // The coordinator must be told directly — this doesn't wait for them
    // to happen to check the Requests page.
    const coordinator = users.find(u => u.role === 'Hospital Coordinator' && u.hospitalId === organ.hospitalId)
    if (coordinator) {
      notify({ userId: coordinator.id, message: `${mine.fullName} requested the ${organ.organType} (${organ.bloodGroup}) in your inventory — review it in Requests & Transport.` })
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Available Organs</h1>
        <p className="page-subtitle">Organs matching your required type and blood group</p>
      </div>

      <div className="alert-banner alert-banner-info">
        ✅ Only organs compatible with your blood group ({mine.bloodGroup}) and required {mine.requiredOrgan} are shown here — this is checked automatically.
      </div>

      <div className="panel">
        {matches.length === 0 ? (
          <EmptyState message="No matching organs are currently available." />
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Type</th><th>Blood Group</th><th>Hospital</th><th></th></tr>
            </thead>
            <tbody>
              {matches.map(o => (
                <tr key={o.id}>
                  <td>{o.organType}</td>
                  <td>{o.bloodGroup}</td>
                  <td>{hospitals.find(h => h.id === o.hospitalId)?.name || '—'}</td>
                  <td>
                    {alreadyRequestedOrganIds.includes(o.id) ? (
                      <span className="status-pill status-reserved">Requested</span>
                    ) : (
                      <button className="btn-secondary btn-compact" onClick={() => requestOrgan(o)}>Request this organ</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
