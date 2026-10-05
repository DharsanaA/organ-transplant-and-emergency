import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useHospital } from '../../context/HospitalContext'
import { useData } from '../../context/DataContext'
import { createOrgan } from '../../models/organ'
import { BLOOD_GROUPS, ALL_DONATABLE_TYPES, categoryOf } from '../../config/constants'
import RequireHospital from './RequireHospital'
import EmptyState from '../common/EmptyState'
import OrganCountdown from '../common/OrganCountdown'

const EMPTY_FORM = { organType: ALL_DONATABLE_TYPES[0], bloodGroup: BLOOD_GROUPS[0], donorId: '' }
const STATUS_FLOW = { Available: 'Reserved', Reserved: 'Transplanted', Transplanted: null }

export default function CoordinatorOrgans() {
  const { currentUser } = useAuth()
  const { selectedHospitalId } = useHospital()
  const { organs, setOrgans, donors, logAction } = useData()
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)
  const [typeFilter, setTypeFilter] = useState('All')

  const hospitalOrgans = organs
    .filter(o => o.hospitalId === selectedHospitalId)
    .filter(o => typeFilter === 'All' || o.category === typeFilter)

  const consentedDonors = donors.filter(d => d.hospitalId === selectedHospitalId && d.consentStatus === 'Consented')

  function handleSubmit(e) {
    e.preventDefault()
    const organ = createOrgan({ ...form, hospitalId: selectedHospitalId })
    setOrgans([...organs, organ])
    logAction({ user: currentUser, action: `Added ${organ.category.toLowerCase()} (${organ.organType})`, entityType: 'organ', entityId: organ.id, hospitalId: selectedHospitalId })
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  function advanceStatus(id) {
    const organ = organs.find(o => o.id === id)
    const next = STATUS_FLOW[organ.status]
    if (!next) return
    setOrgans(organs.map(o => (o.id === id ? { ...o, status: next } : o)))
    logAction({ user: currentUser, action: `Marked ${organ.organType} as ${next}`, entityType: 'organ', entityId: id, hospitalId: selectedHospitalId })
  }

  function deleteOrgan(id) {
    const organ = organs.find(o => o.id === id)
    if (organ.status !== 'Available') return // don't allow deleting reserved/transplanted records
    setOrgans(organs.filter(o => o.id !== id))
    logAction({ user: currentUser, action: `Removed ${organ.organType} from inventory`, entityType: 'organ', entityId: id, hospitalId: selectedHospitalId })
  }

  return (
    <RequireHospital>
      <div className="page-header page-header-row" style={{ marginTop: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>Organ &amp; Tissue Inventory</h2>
          <p className="page-subtitle">Available → Reserved → Transplanted</p>
        </div>
        <button className="btn-primary btn-compact" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Organ'}
        </button>
      </div>

      <div className="chip-row" style={{ marginBottom: '1rem' }}>
        {['All', 'Organ', 'Tissue'].map(f => (
          <button key={f} type="button" className={`chip ${typeFilter === f ? 'chip-active' : ''}`} onClick={() => setTypeFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {showForm && (
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <label className="field-label">Organ / tissue type</label>
              <select className="field-input" value={form.organType}
                onChange={e => setForm({ ...form, organType: e.target.value })}>
                {ALL_DONATABLE_TYPES.map(o => <option key={o}>{o}</option>)}
              </select>
              <p className="form-hint">Category: {categoryOf(form.organType)}</p>
            </div>
            <div>
              <label className="field-label">Blood group</label>
              <select className="field-input" value={form.bloodGroup}
                onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                {BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Source donor (optional)</label>
              <select className="field-input" value={form.donorId}
                onChange={e => setForm({ ...form, donorId: e.target.value })}>
                <option value="">— none linked —</option>
                {consentedDonors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
              </select>
            </div>
          </div>
          <button className="btn-primary" type="submit">Add to inventory</button>
        </form>
      )}

      <div className="panel">
        {hospitalOrgans.length === 0 ? (
          <EmptyState message="No organs available for this hospital." />
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Type</th><th>Category</th><th>Blood Group</th><th>Status</th><th>Time Left</th><th></th></tr>
            </thead>
            <tbody>
              {hospitalOrgans.map(o => (
                <tr key={o.id}>
                  <td>{o.organType}</td>
                  <td>{o.category}</td>
                  <td>{o.bloodGroup}</td>
                  <td><span className={`status-pill status-${o.status.toLowerCase()}`}>{o.status}</span></td>
                  <td>{o.status !== 'Transplanted' ? <OrganCountdown organ={o} /> : '—'}</td>
                  <td style={{ display: 'flex', gap: '0.4rem' }}>
                    {STATUS_FLOW[o.status] && (
                      <button className="btn-secondary btn-compact" onClick={() => advanceStatus(o.id)}>
                        Mark {STATUS_FLOW[o.status]}
                      </button>
                    )}
                    {o.status === 'Available' && (
                      <button className="btn-logout btn-compact" onClick={() => deleteOrgan(o.id)}>Delete</button>
                    )}
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
