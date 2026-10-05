// Every access-control decision in the app goes through this file.
// Components should call hasPermission(role, 'organ.manage') rather than
// checking role strings directly, so the rules live in exactly one place.

const ROLE_PERMISSIONS = {
  Donor: [
    'donor.viewOwn',
    'donor.updateOwn',
  ],
  Recipient: [
    'recipient.viewOwn',
    'recipient.updateOwn',
    'organ.viewAvailable',   // limited, read-only matching view
    'request.createOwn',
    'request.viewOwn',
  ],
  'Hospital Coordinator': [
    'hospital.select',
    'donor.manage',
    'recipient.manage',
    'organ.manage',
    'matching.run',
    'request.manageHospital',
    'transport.manage',
    'emergency.manage',
  ],
  Admin: [
    'hospital.select',
    'hospital.manage',
    'users.manage',
    'audit.view',
    // Admin can also see/operate every operational module, same as a
    // coordinator, per the project's role-permission matrix.
    'donor.manage',
    'recipient.manage',
    'organ.manage',
    'matching.run',
    'request.manageHospital',
    'transport.manage',
    'emergency.manage',
  ],
}

export function hasPermission(role, permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function permissionsFor(role) {
  return ROLE_PERMISSIONS[role] ?? []
}

// Which top-level route prefix a role lands on / is confined to.
export const ROLE_HOME = {
  Donor: '/donor/dashboard',
  Recipient: '/recipient/dashboard',
  'Hospital Coordinator': '/coordinator/dashboard',
  Admin: '/admin/dashboard',
}
