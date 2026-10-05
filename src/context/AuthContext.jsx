import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { hasPermission } from '../config/permissions'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // No seeded accounts — this list only grows as people register.
  const [users, setUsers] = useLocalStorage('oc_users', [])
  const [currentUser, setCurrentUser] = useLocalStorage('oc_current_user', null)

  function register(user) {
    setUsers(prev => [...prev, user])
  }

  function login(email, password) {
    const match = users.find(u => u.email === email && u.password === password)
    if (!match) return { ok: false, error: 'No account matches that email and password.' }
    if (match.active === false) return { ok: false, error: 'This account has been deactivated. Contact an admin.' }
    setCurrentUser(match)
    return { ok: true, user: match }
  }

  function logout() {
    setCurrentUser(null)
  }

  function updateUser(userId, changes) {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...changes } : u)))
    setCurrentUser(prev => (prev && prev.id === userId ? { ...prev, ...changes } : prev))
  }

  const adminExists = users.some(u => u.role === 'Admin')

  const value = {
    users,
    setUsers,
    currentUser,
    isAuthenticated: !!currentUser,
    register,
    login,
    logout,
    updateUser,
    adminExists,
    hasPermission: (permission) => (currentUser ? hasPermission(currentUser.role, permission) : false),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
