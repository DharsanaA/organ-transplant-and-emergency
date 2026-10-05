import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useHospital } from '../../context/HospitalContext'
import { useData } from '../../context/DataContext'
import { createDonor } from '../../models/donor'
import { BLOOD_GROUPS, ALL_DONATABLE_TYPES } from '../../config/constants'
import RequireHospital from './RequireHospital'
import EmptyState from '../common/EmptyState'

const EMPTY_FORM = { fullName: '', age: '', bloodGroup: BLOOD_GROUPS[0], organsToDonate: [], contactNumber: '' }

export default function CoordinatorDonors() {
  const { currentUser } = useAuth()
  const { selectedHospitalId } = useHospital()
  const { donors, setDonors, logAction } = useData()
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')

  const hospitalDonors = donors
    .filter(d => d.hospitalId === selectedHospitalId)
    .filter(d => d.fullName.toLowerCase().includes(search.toLowerCase()))

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
    const donor = createDonor({ ...form, hospitalId: selectedHospitalId })
    setDonors([...donors, donor])
    logAction({ user: currentUser, action: 'Added donor', entityType: 'donor', entityId: donor.id, hospitalId: selectedHospitalId })
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  function updateConsent(id, consentStatus) {
    setDonors(donors.map(d => (d.id === id ? { ...d, consentStatus } : d)))
    logAction({ user: currentUser, action: `Set donor consent to ${consentStatus}`, entityType: 'donor', entityId: id, hospitalId: selectedHospitalId })
  }

  return (
    <RequireHospital>
      <div className="page-header page-header-row" style={{ marginTop: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Donors</h2>
          <p className="page-subtitle">Registered donors at this hospital</p>
        </div>
        <button className="btn-primary btn-compact" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Donor'}
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
              <label className="field-label">Contact number</label>
              <input className="field-input" required value={form.contactNumber}
                onChange={e => setForm({ ...form, contactNumber: e.target.value })} />
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

          <button className="btn-primary" type="submit">Save donor</button>
        </form>
      )}

      <div className="panel">
        {hospitalDonors.length === 0 ? (
          <EmptyState message="No donors found for this hospital." />
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Age</th><th>Blood Group</th><th>Organs/Tissues</th><th>Consent</th></tr>
            </thead>
            <tbody>
              {hospitalDonors.map(d => (
                <tr key={d.id}>
                  <td>{d.fullName}</td>
                  <td>{d.age}</td>
                  <td>{d.bloodGroup}</td>
                  <td>{d.organsToDonate.join(', ')}</td>
                  <td>
                    <select className="inline-select" value={d.consentStatus}
                      onChange={e => updateConsent(d.id, e.target.value)}>
                      <option>Pending</option>
                      <option>Consented</option>
                      <option>Withdrawn</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </RequireHospital>
  )
}
