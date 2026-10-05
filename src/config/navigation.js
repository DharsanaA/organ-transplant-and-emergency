export const NAV_BY_ROLE = {
  Donor: [
    { to: '/donor/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/donor/profile', label: 'My Profile', icon: '🩸' },
  ],
  Recipient: [
    { to: '/recipient/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/recipient/profile', label: 'My Profile', icon: '📋' },
    { to: '/recipient/organs', label: 'Available Organs', icon: '🫀' },
  ],
  'Hospital Coordinator': [
    { to: '/coordinator/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/coordinator/donors', label: 'Donors', icon: '🩸' },
    { to: '/coordinator/recipients', label: 'Recipients', icon: '📋' },
    { to: '/coordinator/organs', label: 'Organ Inventory', icon: '🫀' },
    { to: '/coordinator/matching', label: 'Matching', icon: '🤝' },
    { to: '/coordinator/requests', label: 'Requests & Transport', icon: '🚨' },
  ],
  Admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/admin/hospitals', label: 'Hospitals', icon: '🏥' },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/audit', label: 'Audit Log', icon: '🗂️' },
  ],
}

// Short lines shown in the sidebar footer — rotates gently so the panel
// doesn't feel static during a demo.
export const SIDEBAR_QUOTES = [
  'One donor can save up to eight lives.',
  'A gift of life needs no return address.',
  'Somewhere, a heartbeat is waiting for yours.',
  'Kindness, transplanted, keeps beating.',
]
