export default function EmergencyScoreBadge({ tier, score }) {
  return (
    <span className={`status-pill priority-${tier.toLowerCase()}`}>
      {tier} ({score})
    </span>
  )
}
