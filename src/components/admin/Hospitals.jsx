import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useHospital } from '../../context/HospitalContext'
import { useData } from '../../context/DataContext'
import EmptyState from '../common/EmptyState'

const EMPTY_FORM = { name: '', location: '', contact: '' }

export default function Hospitals() {
  const { currentUser } = useAuth()
  const { hospitals, addHospital, updateHospitalStatus } = useHospital()
  const { logAction } = useData()
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const hospital = addHospital(form)
    logAction({ user: currentUser, action: `Created hospital ${hospital.name}`, entityType: 'hospital', entityId: hospital.id, hospitalId: hospital.id })
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  function toggleStatus(h) {
    const next = h.status === 'Active' ? 'Inactive' : 'Active'
    updateHospitalStatus(h.id, next)
    logAction({ user: currentUser, action: `Set ${h.name} to ${next}`, entityType: 'hospital', entityId: h.id, hospitalId: h.id })
  }

  return (
    <div className="page">
      <div className="page-header page-header-row">
        <div>
          <h1>Hospitals</h1>
          <p className="page-subtitle">Coordinators can only select hospitals created here</p>
        </div>
        <button className="btn-primary btn-compact" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Hospital'}
        </button>
      </div>

      {showForm && (
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label className="field-label">Hospital name</label>
              <input className="field-input" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Madurai Government Hospital" />
            </div>
            <div>
              <label className="field-label">Location</label>
              <input className="field-input" required value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Contact number</label>
              <input className="field-input" required value={form.contact}
                onChange={e => setForm({ ...form, contact: e.target.value })} />
            </div>
          </div>
          <button className="btn-primary" type="submit">Add hospital</button>
        </form>
      )}

      <div className="panel">
        {hospitals.length === 0 ? (
          <EmptyState message="No hospitals available. Add one above." />
        ) : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Location</th><th>Contact</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {hospitals.map(h => (
                <tr key={h.id}>
                  <td>{h.name}</td>
                  <td>{h.location}</td>
                  <td>{h.contact}</td>
                  <td><span className={`status-pill ${h.status === 'Active' ? 'status-available' : 'status-transplanted'}`}>{h.status}</span></td>
                  <td>
                    <button className="btn-secondary btn-compact" onClick={() => toggleStatus(h)}>
                      {h.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
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
