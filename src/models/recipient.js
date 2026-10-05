// Module 3 — Recipient Management
// Owned by the user account that created it (userId).

export function createRecipient({
  userId,
  fullName,
  age,
  bloodGroup,
  requiredOrgan,
  urgency = 'Normal',
  severity = 1,       // clinical severity 1 (stable) – 5 (life-threatening), set by a coordinator
  medicalNotes,
  hospitalId,
}) {
  return {
    id: crypto.randomUUID(),
    userId: userId || null,
    fullName,
    age,
    bloodGroup,
    requiredOrgan,
    urgency, // 'Normal' | 'High' | 'Critical'
    severity: Number(severity),
    medicalNotes,
    hospitalId: hospitalId || null,
    status: 'Waiting', // 'Waiting' | 'Matched' | 'Transplanted'
    createdAt: new Date().toISOString(),
  }
}
