import { useState, useEffect } from 'react'
import { ORGAN_SAFE_WINDOW_HOURS } from '../../config/emergency'

function formatRemaining(ms) {
  if (ms <= 0) return 'EXPIRED'
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m left`
}

/**
 * Shows a live-ticking countdown of how much of an organ's safe transport
 * window remains, counted from when it was added to inventory. Tissues
 * (and any type without a defined window) show a static "long shelf life"
 * note instead — a countdown clock isn't meaningful for them.
 */
export default function OrganCountdown({ organ }) {
  const [now, setNow] = useState(Date.now())
  const safeHours = ORGAN_SAFE_WINDOW_HOURS[organ.organType]

  useEffect(() => {
    if (!safeHours) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [safeHours])

  if (!safeHours) {
    return <span className="countdown countdown-safe">Long shelf life</span>
  }

  const deadline = new Date(organ.addedAt).getTime() + safeHours * 3600000
  const remaining = deadline - now
  const pctRemaining = remaining / (safeHours * 3600000)

  const tone = remaining <= 0 ? 'critical' : pctRemaining < 0.25 ? 'critical' : pctRemaining < 0.5 ? 'warn' : 'safe'

  return <span className={`countdown countdown-${tone}`}>{formatRemaining(remaining)}</span>
}
