import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Wrap any route element with this. If nobody is logged in, bounce to
 * /login. If someone IS logged in but their role isn't in `roles`,
 * show Access Denied instead of silently redirecting — the person should
 * see clearly that the page exists and they're not allowed in.
 */
export default function ProtectedRoute({ roles, children }) {
  const { currentUser, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to="/access-denied" replace />
  }

  return children
}
