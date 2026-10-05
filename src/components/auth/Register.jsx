import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useHospital } from '../../context/HospitalContext'
import { ROLES } from '../../config/constants'

export default function Register() {
  const { register, users } = useAuth()
  const { hospitals } = useHospital()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', role: ROLES[0], hospitalId: '',
  })
  const [error, setError] = useState('')

  const isCoordinator = form.role === 'Hospital Coordinator'

  // One coordinator per hospital: a hospital already claimed by an active
  // coordinator account drops out of the list for everyone registering after.
  const claimedHospitalIds = new Set(
    users.filter(u => u.role === 'Hospital Coordinator' && u.active !== false).map(u => u.hospitalId)
  )
  const availableHospitals = hospitals.filter(h => !claimedHospitalIds.has(h.id))

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 4) {
      setError('Password must be at least 4 characters.')
      return
    }
    if (users.some(u => u.email === form.email)) {
      setError('An account with that email already exists.')
      return
    }
    if (isCoordinator && !form.hospitalId) {
      setError('Select the hospital you are coordinating for.')
      return
    }
    if (isCoordinator && claimedHospitalIds.has(form.hospitalId)) {
      setError('That hospital already has a coordinator assigned. Please choose another.')
      return
    }

    const user = {
      id: crypto.randomUUID(),
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      role: form.role,
      // Only Hospital Coordinators are tied to one hospital — this is
      // permanent once set, the same way it would be in a real hospital.
      hospitalId: isCoordinator ? form.hospitalId : null,
      active: true,
      createdAt: new Date().toISOString(),
    }
    register(user)
    navigate('/login', { replace: true, state: { justRegistered: true } })
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-badge">🫀</div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Register to coordinate transplants</p>

        <label className="field-label">Full name</label>
        <input className="field-input" required value={form.fullName}
          onChange={(e) => update('fullName', e.target.value)} placeholder="Dr. Veera Kumar" />

        <label className="field-label">Email address</label>
        <input className="field-input" type="email" value={form.email} required
          onChange={(e) => update('email', e.target.value)} placeholder="you@hospital.org" />

        <label className="field-label">Password</label>
        <input className="field-input" type="password" value={form.password} required
          onChange={(e) => update('password', e.target.value)} placeholder="••••••••" />

        <label className="field-label">Confirm password</label>
        <input className="field-input" type="password" value={form.confirmPassword} required
          onChange={(e) => update('confirmPassword', e.target.value)} placeholder="••••••••" />

        <label className="field-label">Role</label>
        <select className="field-input" value={form.role} onChange={(e) => update('role', e.target.value)}>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        {isCoordinator && (
          <>
            <label className="field-label">Hospital you're coordinating for</label>
            <select className="field-input" required value={form.hospitalId}
              disabled={availableHospitals.length === 0}
              onChange={(e) => update('hospitalId', e.target.value)}>
              <option value="">
                {availableHospitals.length === 0 ? 'No hospitals available' : '— select a hospital —'}
              </option>
              {availableHospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
            {availableHospitals.length === 0 ? (
              <p className="form-hint">Every hospital already has a coordinator assigned. Contact an Admin.</p>
            ) : (
              <p className="form-hint">This is permanent — you'll only ever manage this hospital's data, and no one else can claim it after you.</p>
            )}
          </>
        )}

        {error && <p className="form-error">{error}</p>}

        <button className="btn-primary" type="submit">Create account</button>
        <p className="auth-switch">
          Already have an account? <Link className="link-btn" to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
