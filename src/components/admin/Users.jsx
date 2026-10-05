import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import EmptyState from '../common/EmptyState'

export default function Users() {
  const { users, updateUser, currentUser } = useAuth()
  const { logAction } = useData()

  function toggleActive(u) {
    const next = u.active === false
    updateUser(u.id, { active: next })
    logAction({ user: currentUser, action: `${next ? 'Activated' : 'Deactivated'} user ${u.fullName}`, entityType: 'user', entityId: u.id })
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Users</h1>
        <p className="page-subtitle">All accounts registered in the system</p>
      </div>
      <div className="panel">
        {users.length === 0 ? (
          <EmptyState message="No users registered yet." />
        ) : (
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className={`status-pill ${u.active === false ? 'status-transplanted' : 'status-available'}`}>
                      {u.active === false ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td>
                    {u.id !== currentUser.id && (
                      <button className="btn-secondary btn-compact" onClick={() => toggleActive(u)}>
                        {u.active === false ? 'Activate' : 'Deactivate'}
                      </button>
                    )}
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
