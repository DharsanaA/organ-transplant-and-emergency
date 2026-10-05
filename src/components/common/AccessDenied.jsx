import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLE_HOME } from '../../config/permissions'

export default function AccessDenied() {
  const { currentUser } = useAuth()
  const home = currentUser ? ROLE_HOME[currentUser.role] : '/login'

  return (
    <div className="page access-denied">
      <div className="panel access-denied-panel">
        <div className="access-denied-icon">🚫</div>
        <h1>Access Denied</h1>
        <p className="page-subtitle">You don't have permission to access this page.</p>
        <Link className="btn-primary btn-compact" to={home}>Go to Dashboard</Link>
      </div>
    </div>
  )
}
