import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useHospital } from '../../context/HospitalContext'
import { useData } from '../../context/DataContext'
import { createDonor } from '../../models/donor'
import { BLOOD_GROUPS, ALL_DONATABLE_TYPES } from '../../config/constants'

export default function MyDonorProfile() {
  const { currentUser } = useAuth()
  const { hospitals } = useHospital()
  const { donors, setDonors, logAction } = useData()

  const myDonor = donors.find(d => d.userId === currentUser.id)
  const [editing, setEditing] = useState(!myDonor)
  const [form, setForm] = useState(myDonor || {
    fullName: currentUser.fullName, age: '', bloodGroup: BLOOD_GROUPS[0],
    organsToDonate: [], contactNumber: '', hospitalId: '',
  })

  function toggleOrgan(organ) {
    setForm(prev => ({
      ...prev,
      organsToDonate: prev.organsToDonate.includes(organ)
        ? prev.organsToDonate.filter(o => o !== organ)
        : [...prev.organsToDonate, organ],
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (form.organsToDonate.length === 0) return

    if (myDonor) {
      setDonors(donors.map(d => (d.id === myDonor.id ? { ...d, ...form } : d)))
      logAction({ user: currentUser, action: 'Updated own donor profile', entityType: 'donor', entityId: myDonor.id, hospitalId: form.hospitalId })
    } else {
      const donor = createDonor({ ...form, userId: currentUser.id })
      setDonors([...donors, donor])
      logAction({ user: currentUser, action: 'Created donor profile', entityType: 'donor', entityId: donor.id, hospitalId: form.hospitalId })
    }
    setEditing(false)
  }

  if (!editing && myDonor) {
    return (
      <div className="page">
        <div className="page-header page-header-row">
          <div>
            <h1>My Donor Profile</h1>
            <p className="page-subtitle">Your donation preferences and consent status</p>
          </div>
          <button className="btn-secondary btn-compact" onClick={() => { setForm(myDonor); setEditing(true) }}>Edit</button>
        </div>
        <div className="panel">
          <table className="data-table">
            <tbody>
              <tr><td>Full name</td><td>{myDonor.fullName}</td></tr>
              <tr><td>Age</td><td>{myDonor.age}</td></tr>
              <tr><td>Blood group</td><td>{myDonor.bloodGroup}</td></tr>
              <tr><td>Willing to donate</td><td>{myDonor.organsToDonate.join(', ')}</td></tr>
              <tr><td>Contact number</td><td>{myDonor.contactNumber}</td></tr>
              <tr><td>Hospital</td><td>{hospitals.find(h => h.id === myDonor.hospitalId)?.name || '—'}</td></tr>
              <tr><td>Consent status</td><td><span className={`status-pill status-${myDonor.consentStatus.toLowerCase()}`}>{myDonor.consentStatus}</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{myDonor ? 'Edit Donor Profile' : 'Create Donor Profile'}</h1>
        <p className="page-subtitle">Only you can see and edit this information</p>
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
            <label className="field-label">Contact number</label>
            <input className="field-input" required value={form.contactNumber}
              onChange={e => setForm({ ...form, contactNumber: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Preferred hospital</label>
            <select className="field-input" required value={form.hospitalId}
              onChange={e => setForm({ ...form, hospitalId: e.target.value })}>
              <option value="">— select a hospital —</option>
              {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            {hospitals.length === 0 && <p className="form-hint">No hospitals registered yet — check back once one is added.</p>}
          </div>
        </div>

        <label className="field-label">Organs / tissues willing to donate</label>
        <div className="chip-row">
          {ALL_DONATABLE_TYPES.map(type => (
            <button type="button" key={type}
              className={`chip ${form.organsToDonate.includes(type) ? 'chip-active' : ''}`}
              onClick={() => toggleOrgan(type)}>
              {type}
            </button>
          ))}
        </div>
        {form.organsToDonate.length === 0 && <p className="form-hint">Select at least one.</p>}

        <button className="btn-primary" type="submit">Save profile</button>
        {myDonor && <button type="button" className="btn-secondary btn-compact" style={{ marginTop: '0.75rem' }} onClick={() => setEditing(false)}>Cancel</button>}
      </form>
    </div>
  )
}
