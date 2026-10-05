import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useHospital } from '../../context/HospitalContext'
import { useData } from '../../context/DataContext'
import { createRecipient } from '../../models/recipient'
import { BLOOD_GROUPS, ALL_DONATABLE_TYPES, URGENCY_LEVELS } from '../../config/constants'

export default function MyRecipientProfile() {
  const { currentUser } = useAuth()
  const { hospitals } = useHospital()
  const { recipients, setRecipients, logAction } = useData()

  const mine = recipients.find(r => r.userId === currentUser.id)
  const [editing, setEditing] = useState(!mine)
  const [form, setForm] = useState(mine || {
    fullName: currentUser.fullName, age: '', bloodGroup: BLOOD_GROUPS[0],
    requiredOrgan: ALL_DONATABLE_TYPES[0], urgency: 'Normal', medicalNotes: '', hospitalId: '',
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (mine) {
      setRecipients(recipients.map(r => (r.id === mine.id ? { ...r, ...form } : r)))
      logAction({ user: currentUser, action: 'Updated own recipient profile', entityType: 'recipient', entityId: mine.id, hospitalId: form.hospitalId })
    } else {
      const recipient = createRecipient({ ...form, userId: currentUser.id })
      setRecipients([...recipients, recipient])
      logAction({ user: currentUser, action: 'Created recipient profile', entityType: 'recipient', entityId: recipient.id, hospitalId: form.hospitalId })
    }
    setEditing(false)
  }

  if (!editing && mine) {
    return (
      <div className="page">
        <div className="page-header page-header-row">
          <div>
            <h1>My Recipient Profile</h1>
            <p className="page-subtitle">Your medical and priority information</p>
          </div>
          <button className="btn-secondary btn-compact" onClick={() => { setForm(mine); setEditing(true) }}>Edit</button>
        </div>
        <div className="panel">
          <table className="data-table">
            <tbody>
              <tr><td>Full name</td><td>{mine.fullName}</td></tr>
              <tr><td>Age</td><td>{mine.age}</td></tr>
              <tr><td>Blood group</td><td>{mine.bloodGroup}</td></tr>
              <tr><td>Required organ/tissue</td><td>{mine.requiredOrgan}</td></tr>
              <tr><td>Urgency</td><td><span className={`status-pill urgency-${mine.urgency.toLowerCase()}`}>{mine.urgency}</span></td></tr>
              <tr><td>Clinical severity (set by hospital)</td><td>{mine.severity ?? 1} / 5</td></tr>
              <tr><td>Hospital</td><td>{hospitals.find(h => h.id === mine.hospitalId)?.name || '—'}</td></tr>
              <tr><td>Status</td><td>{mine.status}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{mine ? 'Edit Recipient Profile' : 'Create Recipient Profile'}</h1>
        <p className="page-subtitle">Only you and authorized hospital staff can see this</p>
      </div>
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
            <label className="field-label">Urgency</label>
            <select className="field-input" value={form.urgency}
              onChange={e => setForm({ ...form, urgency: e.target.value })}>
              {URGENCY_LEVELS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Hospital</label>
            <select className="field-input" required value={form.hospitalId}
              onChange={e => setForm({ ...form, hospitalId: e.target.value })}>
              <option value="">— select a hospital —</option>
              {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            {hospitals.length === 0 && <p className="form-hint">No hospitals registered yet — check back once one is added.</p>}
          </div>
        </div>

        <label className="field-label">Medical notes</label>
        <textarea className="field-input" rows="3" value={form.medicalNotes}
          onChange={e => setForm({ ...form, medicalNotes: e.target.value })} />

        <button className="btn-primary" type="submit">Save profile</button>
        {mine && <button type="button" className="btn-secondary btn-compact" style={{ marginTop: '0.75rem' }} onClick={() => setEditing(false)}>Cancel</button>}
      </form>
    </div>
  )
}
