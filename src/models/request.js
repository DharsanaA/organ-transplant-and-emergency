// A request links one organ to one recipient and carries it through
// review, transport, and completion.

export function createRequest({
  organId,
  organType,
  recipientId,
  recipientName,
  donorId,
  hospitalId,
  priority,
  createdBy, // userId of whoever initiated it (coordinator or the recipient themself)
}) {
  return {
    id: crypto.randomUUID(),
    organId,
    organType,
    recipientId,
    recipientName,
    donorId: donorId || null,
    hospitalId,
    priority, // 'Normal' | 'High' | 'Emergency'
    status: 'Pending', // 'Pending' -> 'Approved' | 'Rejected' -> ...
    transportStatus: null, // set once approved: 'Pickup' -> 'In Transit' -> 'Reached Hospital' -> 'Received'
    escalated: false, // auto-flagged if left Pending too long — see config/emergency.js
    createdBy: createdBy || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
