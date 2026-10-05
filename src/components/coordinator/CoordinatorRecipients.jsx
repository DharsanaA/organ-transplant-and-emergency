import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useHospital } from '../../context/HospitalContext'
import { useData } from '../../context/DataContext'
import { createRecipient } from '../../models/recipient'
import { BLOOD_GROUPS, ALL_DONATABLE_TYPES, URGENCY_LEVELS } from '../../config/constants'
import { calculateEmergencyScore, daysWaiting, isBloodGroupCompatible } from '../../services/matchingService'
import RequireHospital from './RequireHospital'
import EmptyState from '../common/EmptyState'
import EmergencyScoreBadge from '../common/EmergencyScoreBadge'

const SEVERITY_LABELS = { 1: '1 · Stable', 2: '2 · Mild', 3: '3 · Moderate', 4: '4 · Severe', 5: '5 · Life-threatening' }

const EMPTY_FORM = {
  fullName: '', age: '', bloodGroup: BLOOD_GROUPS[0], requiredOrgan: ALL_DONATABLE_TYPES[0],
  urgency: 'Normal', severity: 1, medicalNotes: '',
}

export default function CoordinatorRecipients() {
  const { currentUser } = useAuth()
  const { selectedHospitalId } = useHospital()
  const { recipients, setRecipients, organs, logAction, notify } = useData()
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const hospitalRecipients = recipients
    .filter(r => r.hospitalId === selectedHospitalId)
    .filter(r => r.fullName.toLowerCase().includes(search.toLowerCase()))

  function handleSubmit(e) {
    e.preventDefault()
    const recipient = createRecipient({ ...form, hospitalId: selectedHospitalId })
    setRecipients([...recipients, recipient])
    logAction({ user: currentUser, action: 'Added recipient', entityType: 'recipient', entityId: recipient.id, hospitalId: selectedHospitalId })
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  // A coordinator can re-assess severity at any time — e.g. if a patient's
  // condition suddenly worsens — and the Emergency Score below recalculates
  // immediately since it's derived straight from this field on every render.
  function updateSeverity(id, severity) {
    setRecipients(recipients.map(r => (r.id === id ? { ...r, severity: Number(severity) } : r)))
    logAction({ user: currentUser, action: `Updated severity to ${severity}/5`, entityType: 'recipient', entityId: id, hospitalId: selectedHospitalId })
  }

  function hasCompatibleOrganHere(recipient) {
    return organs.some(o =>
      o.hospitalId === selectedHospitalId && o.status === 'Available' &&
      o.organType === recipient.requiredOrgan && isBloodGroupCompatible(o.bloodGroup, recipient.bloodGroup)
    )
  }

  function broadcastEmergency(recipient) {
    const message = `🚨 EMERGENCY: ${recipient.fullName} needs a compatible ${recipient.requiredOrgan} (${recipient.bloodGroup}) — no match available at their current hospital.`
    notify({ role: 'Hospital Coordinator', message })
    notify({ role: 'Admin', message })
    logAction({ user: currentUser, action: `Broadcast emergency for ${recipient.fullName}`, entityType: 'recipient', entityId: recipient.id, hospitalId: selectedHospitalId })
  }

  return (
    <RequireHospital>
      <div className="page-header page-header-row" style={{ marginTop: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Recipients</h2>
          <p className="page-subtitle">Waiting recipients at this hospital</p>
        </div>
        <button className="btn-primary btn-compact" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Recipient'}
        </button>
      </div>

      <input className="field-input" style={{ maxWidth: 280, marginBottom: '1rem' }}
        placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />

      {showForm && (
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label className="field-label">Full name</label>
              <input className="field-input" required value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Age</label>
              <input className="field-input" type="number" min="0" required value={form.age}
                onChange={e => setForm({ ...form, age: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Blood group</label>
              <select className="field-input" value={form.bloodGroup}
                onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Required organ/tissue</label>
              <select className="field-input" value={form.requiredOrgan}
                onChange={e => setForm({ ...form, requiredOrgan: e.target.value })}>
                {ALL_DONATABLE_TYPES.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Self-reported urgency</label>
              <select className="field-input" value={form.urgency}
                onChange={e => setForm({ ...form, urgency: e.target.value })}>
                {URGENCY_LEVELS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Clinical severity</label>
              <select className="field-input" value={form.severity}
                onChange={e => setForm({ ...form, severity: Number(e.target.value) })}>
                {Object.entries(SEVERITY_LABELS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
              </select>
              <p className="form-hint">Clinical assessment — can be updated later as the patient's condition changes.</p>
            </div>
          </div>

          <label className="field-label">Medical notes</label>
          <textarea className="field-input" rows="3" value={form.medicalNotes}
            onChange={e => setForm({ ...form, medicalNotes: e.target.value })} />

          <button className="btn-primary" type="submit">Save recipient</button>
        </form>
      )}

      <div className="panel">
        {hospitalRecipients.length === 0 ? (
          <EmptyState message="No recipients found for this hospital." />
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Blood Group</th><th>Needed</th><th>Severity</th><th>Emergency Score</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {hospitalRecipients.map(r => {
                const { score, tier } = calculateEmergencyScore({
                  severity: r.severity ?? 1, waitingDays: daysWaiting(r), urgency: r.urgency, bloodGroup: r.bloodGroup,
                })
                const canBroadcast = tier === 'Emergency' && r.status === 'Waiting' && !hasCompatibleOrganHere(r)
                return (
                  <tr key={r.id}>
                    <td>{r.fullName}</td>
                    <td>{r.bloodGroup}</td>
                    <td>{r.requiredOrgan}</td>
                    <td>
                      <select className="inline-select" value={r.severity ?? 1} onChange={e => updateSeverity(r.id, e.target.value)}>
                        {Object.entries(SEVERITY_LABELS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
                      </select>
                    </td>
                    <td><EmergencyScoreBadge tier={tier} score={score} /></td>
                    <td>{r.status}</td>
                    <td>
                      {canBroadcast && (
                        <button className="btn-secondary btn-compact" onClick={() => broadcastEmergency(r)}>
                          📢 Broadcast
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
