import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLE_HOME } from '../../config/permissions'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const result = login(email, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(ROLE_HOME[result.user.role] || '/login', { replace: true })
  }

  return (
    <div className="auth-screen">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-badge">🫀</div>
        <h1 className="auth-title">OrganLink</h1>
        <p className="auth-subtitle">Multi-hospital transplant coordination</p>

        {location.state?.justRegistered && (
          <p className="form-success">Account created — sign in below to continue.</p>
        )}

        <label className="field-label">Email address</label>
        <input className="field-input" type="email" value={email} required
          onChange={(e) => setEmail(e.target.value)} placeholder="you@hospital.org" />

        <label className="field-label">Password</label>
        <input className="field-input" type="password" value={password} required
          onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

        {error && <p className="form-error">{error}</p>}

        <button className="btn-primary" type="submit">Sign in</button>
        <p className="auth-switch">
          Don't have an account? <Link className="link-btn" to="/register">Create one</Link>
        </p>
      </form>
    </div>
  )
}
