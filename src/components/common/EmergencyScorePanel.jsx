const TIER_COLOR = { Normal: 'var(--accent)', High: 'var(--amber)', Emergency: 'var(--urgent)' }

export default function EmergencyScorePanel({ score, tier, breakdown }) {
  const pct = Math.min(score, 100)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
        <span className={`status-pill priority-${tier.toLowerCase()}`}>{tier}</span>
        <strong style={{ fontFamily: 'var(--font-mono)' }}>{score} pts</strong>
      </div>
      <div className="severity-bar-track">
        <div className="severity-bar-fill" style={{ width: `${pct}%`, background: TIER_COLOR[tier] }} />
      </div>
      <ul className="severity-breakdown">
        {breakdown.map((b, i) => <li key={i}>+{b.points} — {b.label}</li>)}
      </ul>
    </div>
  )
}
