import { createContext, useContext, useEffect, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ESCALATION_THRESHOLD_MINUTES, ESCALATION_CHECK_INTERVAL_MS } from '../config/emergency'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [donors, setDonors] = useLocalStorage('oc_donors', [])
  const [recipients, setRecipients] = useLocalStorage('oc_recipients', [])
  const [organs, setOrgans] = useLocalStorage('oc_organs', [])
  const [requests, setRequests] = useLocalStorage('oc_requests', [])
  const [notifications, setNotifications] = useLocalStorage('oc_notifications', [])
  const [auditLog, setAuditLog] = useLocalStorage('oc_audit', [])

  function logAction({ user, action, entityType, entityId, hospitalId }) {
    setAuditLog(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        userId: user?.id,
        userName: user?.fullName,
        role: user?.role,
        action,
        entityType,
        entityId,
        hospitalId: hospitalId || null,
        timestamp: new Date().toISOString(),
      },
    ])
  }

  /**
   * notify({ userId, message })         -> one specific person
   * notify({ role, message })           -> broadcast to everyone with that role
   * (Used for the multi-hospital emergency broadcast and for escalation
   * alerts to Admin — every Hospital Coordinator or every Admin sees it,
   * without looking up individual user IDs one by one.)
   */
  function notify({ userId = null, role = null, message }) {
    setNotifications(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        userId,
        role,
        message,
        read: false,
        createdAt: new Date().toISOString(),
      },
    ])
  }

  function markNotificationRead(id) {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }

  // ---- Emergency Escalation watcher ----
  // A Pending request left un-reviewed for too long auto-flags itself and
  // alerts every Admin — nobody has to remember to check on it manually.
  // Kept in DataProvider (not a single page) so it keeps working no matter
  // which screen a coordinator happens to be looking at.
  const requestsRef = useRef(requests)
  requestsRef.current = requests

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      const thresholdMs = ESCALATION_THRESHOLD_MINUTES * 60 * 1000
      const current = requestsRef.current
      const toEscalate = current.filter(r =>
        r.status === 'Pending' && !r.escalated && (now - new Date(r.createdAt).getTime()) > thresholdMs
      )
      if (toEscalate.length === 0) return

      setRequests(prev => prev.map(r =>
        toEscalate.some(e => e.id === r.id) ? { ...r, escalated: true } : r
      ))
      toEscalate.forEach(r => {
        notify({
          role: 'Admin',
          message: `⏱️ Escalated: a ${r.organType} request for ${r.recipientName} has been pending review for over ${ESCALATION_THRESHOLD_MINUTES} minutes.`,
        })
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, ESCALATION_CHECK_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  const value = {
    donors, setDonors,
    recipients, setRecipients,
    organs, setOrgans,
    requests, setRequests,
    notifications, setNotifications,
    auditLog,
    logAction,
    notify,
    markNotificationRead,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}
