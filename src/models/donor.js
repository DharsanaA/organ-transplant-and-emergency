// Module 2 — Donor Management
// A donor record is owned by the user account that created it (userId).
// createDonor() only builds an object from what was actually typed into
// a form — nothing is pre-filled.

export function createDonor({
  userId,
  fullName,
  age,
  bloodGroup,
  organsToDonate,
  contactNumber,
  hospitalId,
  consentStatus = 'Pending',
}) {
  return {
    id: crypto.randomUUID(),
    userId: userId || null,
    fullName,
    age,
    bloodGroup,
    organsToDonate, // array of organ/tissue type strings
    contactNumber,
    hospitalId: hospitalId || null,
    consentStatus, // 'Pending' | 'Consented' | 'Withdrawn'
    createdAt: new Date().toISOString(),
  }
}
