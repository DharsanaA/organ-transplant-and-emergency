import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useHospital } from '../../context/HospitalContext'
import { useData } from '../../context/DataContext'
import { rankRecipientsForOrgan, calculateEmergencyScore, daysWaiting } from '../../services/matchingService'
import { createRequest } from '../../models/request'
import RequireHospital from './RequireHospital'
import EmptyState from '../common/EmptyState'
import OrganCountdown from '../common/OrganCountdown'
import EmergencyScoreBadge from '../common/EmergencyScoreBadge'

export default function CoordinatorMatching() {
  const { currentUser } = useAuth()
  const { selectedHospitalId } = useHospital()
  const { organs, recipients, requests, setRequests, setOrgans, setRecipients, logAction, notify } = useData()
  const [selectedOrganId, setSelectedOrganId] = useState('')

  const availableOrgans = organs.filter(o => o.hospitalId === selectedHospitalId && o.status === 'Available')
  const selectedOrgan = organs.find(o => o.id === selectedOrganId)
  const ranked = selectedOrgan ? rankRecipientsForOrgan(selectedOrgan, recipients) : []

  function sendRequest(recipientId) {
    const recipient = recipients.find(r => r.id === recipientId)
    const { tier } = calculateEmergencyScore({
      severity: recipient.severity ?? 1,
      waitingDays: daysWaiting(recipient),
      urgency: recipient.urgency,
      bloodGroup: recipient.bloodGroup,
    })

    const request = createRequest({
      organId: selectedOrgan.id,
      organType: selectedOrgan.organType,
      recipientId,
      recipientName: recipient.fullName,
      donorId: selectedOrgan.donorId,
      hospitalId: selectedOrgan.hospitalId,
      priority: tier,
      createdBy: currentUser.id,
    })

    setRequests([...requests, request])
    setOrgans(organs.map(o => o.id === selectedOrgan.id ? { ...o, status: 'Reserved', reservedForRecipientId: recipientId } : o))
    setRecipients(recipients.map(r => r.id === recipientId ? { ...r, status: 'Matched' } : r))
    logAction({ user: currentUser, action: `Sent match request for ${selectedOrgan.organType} to ${recipient.fullName}`, entityType: 'request', entityId: request.id, hospitalId: selectedHospitalId })
    if (recipient.userId) {
      notify({ userId: recipient.userId, message: `A ${selectedOrgan.organType} match request has been sent for review (priority: ${tier}).` })
    }
    setSelectedOrganId('')
  }

  return (
    <RequireHospital>
      <div className="page-header" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Matching</h2>
        <p className="page-subtitle">Rule-based decision support — ranks candidates, a coordinator still decides</p>
      </div>

      <div className="alert-banner alert-banner-info">
        ✅ Only recipients with a verified compatible blood group and the matching organ/tissue type appear below — incompatible candidates are never shown.
      </div>

      <div className="panel">
        {availableOrgans.length === 0 ? (
          <EmptyState message="No available organs at this hospital to match." />
        ) : (
          <>
            <label className="field-label">Available organ</label>
            <select className="field-input" value={selectedOrganId} onChange={e => setSelectedOrganId(e.target.value)}>
              <option value="">— select an organ —</option>
              {availableOrgans.map(o => (
                <option key={o.id} value={o.id}>{o.organType} · {o.bloodGroup}</option>
              ))}
            </select>

            {selectedOrgan && (
              <p className="form-hint" style={{ marginTop: '0.5rem' }}>
                Safe transport window remaining: <OrganCountdown organ={selectedOrgan} />
              </p>
            )}

            {selectedOrgan && (
              ranked.length === 0 ? (
                <EmptyState message="No compatible waiting recipients for this organ yet." />
              ) : (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {ranked.map(({ recipient, score, label, reasons }) => {
                    const emergency = calculateEmergencyScore({
                      severity: recipient.severity ?? 1, waitingDays: daysWaiting(recipient),
                      urgency: recipient.urgency, bloodGroup: recipient.bloodGroup,
                    })
                    return (
                      <div key={recipient.id} className="match-card">
                        <div className="match-card-header">
                          <div>
                            <strong>{recipient.fullName}</strong>
                            <span className="match-score"> · Match Score: {score}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <EmergencyScoreBadge tier={emergency.tier} score={emergency.score} />
                            <span className={`status-pill compat-${label.split(' ')[0].toLowerCase()}`}>{label}</span>
                          </div>
                        </div>
                        <ul className="match-reasons">
                          {reasons.map((r, i) => <li key={i}>✓ {r}</li>)}
                        </ul>
                        <button className="btn-secondary btn-compact" onClick={() => sendRequest(recipient.id)}>Send request</button>
                      </div>
                    )
                  })}
                </div>
              )
            )}
          </>
        )}
      </div>
    </RequireHospital>
  )
}
