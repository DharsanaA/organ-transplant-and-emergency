export const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']

// Organs and tissues are kept as separate categories throughout the app —
// a "Cornea" is never matched or tracked the same way as a "Kidney".
export const ORGAN_TYPES = ['Kidney', 'Liver', 'Heart', 'Lung', 'Pancreas', 'Small Intestine']

export const TISSUE_TYPES = ['Cornea', 'Bone', 'Skin', 'Heart Valve', 'Blood Vessel', 'Tendon', 'Ligament']

export const ALL_DONATABLE_TYPES = [...ORGAN_TYPES, ...TISSUE_TYPES]

export function categoryOf(type) {
  return ORGAN_TYPES.includes(type) ? 'Organ' : 'Tissue'
}

export const URGENCY_LEVELS = ['Normal', 'High', 'Critical']

export const ROLES = ['Donor', 'Recipient', 'Hospital Coordinator', 'Admin']

// A fixed starting list of real hospitals for the "Select Hospital" dropdown.
// Admin can still add more later from the Hospitals page.
export const SEED_HOSPITALS = [
  { name: 'Apollo Hospitals', location: 'Chennai' },
  { name: 'MIOT International', location: 'Chennai' },
  { name: 'Kauvery Hospital', location: 'Trichy' },
  { name: 'PSG Hospitals', location: 'Coimbatore' },
  { name: 'Meenakshi Mission Hospital', location: 'Madurai' },
  { name: 'Government Rajaji Hospital', location: 'Madurai' },
  { name: 'Sri Ramachandra Medical Centre', location: 'Chennai' },
  { name: 'Fortis Malar Hospital', location: 'Chennai' },
  { name: 'KMCH', location: 'Coimbatore' },
  { name: 'Government Medical College Hospital', location: 'Tirunelveli' },
].map(h => ({
  id: crypto.randomUUID(),
  name: h.name,
  location: h.location,
  contact: '',
  status: 'Active',
  createdAt: new Date().toISOString(),
}))
