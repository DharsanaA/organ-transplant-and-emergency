import { NavLink } from 'react-router-dom'
import { useHospital } from '../../context/HospitalContext'

/**
 * locked mode (Hospital Coordinator): no dropdown at all — the hospital
 * was fixed at registration, so this just shows which one and the tabs.
 * selectable mode (kept for future Admin use): a real dropdown, with an
 * optional "All Hospitals" option.
 */
export default function HospitalBar({ tabs, mode = 'selectable', allowAll = false }) {
  const { hospitals, selectedHospitalId, setSelectedHospitalId, selectedHospital } = useHospital()

  if (mode === 'locked') {
    if (!selectedHospital) {
      return (
        <div className="hospital-bar">
          <p className="empty-state">
            Your account isn't linked to a valid hospital. This can happen if the hospital was
            deactivated — contact an Admin to resolve it.
          </p>
        </div>
      )
    }
    return (
      <div className="hospital-bar">
        <p className="hospital-current" style={{ margin: 0 }}>
          Coordinating: <strong>{selectedHospital.name}</strong>
        </p>
        <div className="tab-row">
          {tabs.map(tab => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) => `tab-btn ${isActive ? 'tab-btn-active' : ''}`}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="hospital-bar">
      <div className="hospital-select-row">
        <label className="field-label" style={{ margin: 0 }}>Select Hospital</label>
        <select
          className="field-input hospital-select"
          value={selectedHospitalId}
          onChange={(e) => setSelectedHospitalId(e.target.value)}
        >
          <option value="">
            {hospitals.length === 0 ? 'No hospitals available' : 'Select Hospital'}
          </option>
          {allowAll && hospitals.length > 0 && <option value="__all__">All Hospitals</option>}
          {hospitals.map(h => (
            <option key={h.id} value={h.id}>{h.name}</option>
          ))}
        </select>
      </div>

      {hospitals.length === 0 && (
        <p className="empty-state">No hospitals have been created yet.</p>
      )}

      {(selectedHospitalId || (allowAll && selectedHospitalId === '__all__')) && (
        <div className="tab-row">
          {tabs.map(tab => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) => `tab-btn ${isActive ? 'tab-btn-active' : ''}`}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      )}

      {selectedHospital && (
        <p className="hospital-current">Viewing: <strong>{selectedHospital.name}</strong></p>
      )}
      {selectedHospitalId === '__all__' && (
        <p className="hospital-current">Viewing: <strong>All Hospitals</strong></p>
      )}
    </div>
  )
}
