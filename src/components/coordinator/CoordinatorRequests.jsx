import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useHospital } from '../../context/HospitalContext'
import { useData } from '../../context/DataContext'
import { rankRecipientsForOrgan, calculateEmergencyScore, daysWaiting } from '../../services/matchingService'
import { createRequest } from '../../models/request'
import RequireHospital from './RequireHospital'
import EmptyState from '../common/EmptyState'
import OrganCountdown from '../common/OrganCountdown'

const TRANSPORT_FLOW = {
  'Pickup': 'In Transit',
  'In Transit': 'Reached Hospital',
  'Reached Hospital': 'Received',
  'Received': null,
}

export default function CoordinatorRequests() {
  const { currentUser } = useAuth()
  const { selectedHospitalId } = useHospital()
  const { requests, setRequests, organs, setOrgans, recipients, setRecipients, logAction, notify } = useData()

  // { request, candidate } of the backup recipient suggested after a
  // rejection frees up an organ — the coordinator still has to confirm it,
  // nothing is sent automatically.
  const [backupSuggestion, setBackupSuggestion] = useState(null)

  const hospitalRequests = requests.filter(r => r.hospitalId === selectedHospitalId)

  function decide(requestId, decision) {
    const request = requests.find(r => r.id === requestId)
    setRequests(requests.map(r => r.id === requestId
      ? { ...r, status: decision, transportStatus: decision === 'Approved' ? 'Pickup' : null, updatedAt: new Date().toISOString() }
      : r))

    if (decision === 'Rejected') {
      // free the organ and put the recipient back in the pool
      setOrgans(organs.map(o => o.id === request.organId ? { ...o, status: 'Available', reservedForRecipientId: null } : o))
      setRecipients(recipients.map(rc => rc.id === request.recipientId ? { ...rc, status: 'Waiting' } : rc))

      // Backup Recipient System: immediately check if another compatible,
      // waiting recipient exists for the same organ so it doesn't sit idle.
      const organ = organs.find(o => o.id === request.organId)
      if (organ) {
        const nextBest = rankRecipientsForOrgan(organ, recipients, request.recipientId)[0]
        if (nextBest) setBackupSuggestion({ request, organ, candidate: nextBest })
      }
    }

    logAction({ user: currentUser, action: `${decision} request for ${request.organType} → ${request.recipientName}`, entityType: 'request', entityId: requestId, hospitalId: selectedHospitalId })
    const recipient = recipients.find(rc => rc.id === request.recipientId)
    if (recipient?.userId) {
      notify({ userId: recipient.userId, message: `Your ${request.organType} request was ${decision.toLowerCase()}.` })
    }
  }

  function sendBackupRequest() {
    const { organ, candidate } = backupSuggestion
    const recipient = candidate.recipient
    const { tier } = calculateEmergencyScore({
      severity: recipient.severity ?? 1, waitingDays: daysWaiting(recipient),
      urgency: recipient.urgency, bloodGroup: recipient.bloodGroup,
    })
    const request = createRequest({
      organId: organ.id, organType: organ.organType, recipientId: recipient.id,
      recipientName: recipient.fullName, donorId: organ.donorId, hospitalId: organ.hospitalId,
      priority: tier, createdBy: currentUser.id,
    })
    setRequests(prev => [...prev, request])
    setOrgans(prev => prev.map(o => o.id === organ.id ? { ...o, status: 'Reserved', reservedForRecipientId: recipient.id } : o))
    setRecipients(prev => prev.map(r => r.id === recipient.id ? { ...r, status: 'Matched' } : r))
    logAction({ user: currentUser, action: `Sent backup match request for ${organ.organType} to ${recipient.fullName}`, entityType: 'request', entityId: request.id, hospitalId: selectedHospitalId })
    if (recipient.userId) {
      notify({ userId: recipient.userId, message: `A ${organ.organType} match request has been sent for review (priority: ${tier}).` })
    }
    setBackupSuggestion(null)
  }

  function advanceTransport(requestId) {
    const request = requests.find(r => r.id === requestId)
    const next = TRANSPORT_FLOW[request.transportStatus]
    if (!next) return

    setRequests(requests.map(r => r.id === requestId ? { ...r, transportStatus: next, updatedAt: new Date().toISOString() } : r))

    if (next === 'Received') {
      setOrgans(organs.map(o => o.id === request.organId ? { ...o, status: 'Transplanted' } : o))
      setRecipients(recipients.map(rc => rc.id === request.recipientId ? { ...rc, status: 'Transplanted' } : rc))
      logAction({ user: currentUser, action: `Completed transplant for ${request.recipientName}`, entityType: 'request', entityId: requestId, hospitalId: selectedHospitalId })
    } else {
      logAction({ user: currentUser, action: `Transport marked ${next} for ${request.organType}`, entityType: 'request', entityId: requestId, hospitalId: selectedHospitalId })
    }

    const recipient = recipients.find(rc => rc.id === request.recipientId)
    if (recipient?.userId) {
      notify({ userId: recipient.userId, message: `Transport update: your ${request.organType} is now "${next}".` })
    }
  }

  return (
    <RequireHospital>
      <div className="page-header" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Requests &amp; Transport</h2>
        <p className="page-subtitle">Review matches, then track transport through to delivery</p>
      </div>

      {backupSuggestion && (
        <div className="suggestion-card">
          <span className="suggestion-text">
            🔄 Backup available for the rejected {backupSuggestion.organ.organType}: <strong>{backupSuggestion.candidate.recipient.fullName}</strong> (match score {backupSuggestion.candidate.score})
          </span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button className="btn-secondary btn-compact" onClick={sendBackupRequest}>Send request</button>
            <button className="btn-logout btn-compact" onClick={() => setBackupSuggestion(null)}>Dismiss</button>
          </div>
        </div>
      )}

      <div className="panel">
        {hospitalRequests.length === 0 ? (
          <EmptyState message="No requests found for this hospital." />
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Organ</th><th>Recipient</th><th>Priority</th><th>Status</th><th>Time Left</th><th>Transport</th><th></th></tr>
            </thead>
            <tbody>
              {hospitalRequests.map(req => {
                const organ = organs.find(o => o.id === req.organId)
                return (
                  <tr key={req.id}>
                    <td>{req.organType}</td>
                    <td>{req.recipientName}</td>
                    <td><span className={`status-pill priority-${req.priority.toLowerCase()}`}>{req.priority}</span></td>
                    <td>
                      {req.status}
                      {req.escalated && req.status === 'Pending' && (
                        <div className="escalation-banner" style={{ marginTop: '0.35rem' }}>⚠️ Escalated — awaiting review too long</div>
                      )}
                    </td>
                    <td>{organ && req.status !== 'Rejected' ? <OrganCountdown organ={organ} /> : '—'}</td>
                    <td>{req.transportStatus || '—'}</td>
                    <td style={{ display: 'flex', gap: '0.4rem' }}>
                      {req.status === 'Pending' && (
                        <>
                          <button className="btn-secondary btn-compact" onClick={() => decide(req.id, 'Approved')}>Approve</button>
                          <button className="btn-logout btn-compact" onClick={() => decide(req.id, 'Rejected')}>Reject</button>
                        </>
                      )}
                      {req.status === 'Approved' && TRANSPORT_FLOW[req.transportStatus] && (
                        <button className="btn-secondary btn-compact" onClick={() => advanceTransport(req.id)}>
                          Mark {TRANSPORT_FLOW[req.transportStatus]}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </RequireHospital>
  )
}
