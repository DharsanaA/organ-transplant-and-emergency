// Backing numbers for the emergency features. Kept in one file so a real
// backend can later serve these same numbers from a database table
// instead of a hardcoded object — nothing else in the code would change.

// How many hours an organ stays viable after it's added to inventory
// (used as a stand-in for "retrieval time" since there's no separate
// retrieval step yet). Tissues are omitted on purpose — they're
// preserved for weeks/months in real life, so a countdown clock isn't
// meaningful for them.
export const ORGAN_SAFE_WINDOW_HOURS = {
  Heart: 6,
  Lung: 6,
  Liver: 12,
  Pancreas: 12,
  'Small Intestine': 8,
  Kidney: 36,
}

// Rarer blood groups are harder to re-match if a request falls through,
// so they add a small urgency bonus to the emergency score.
export const BLOOD_GROUP_RARITY_BONUS = {
  'O+': 0, 'A+': 0,
  'B+': 4, 'AB+': 6,
  'O-': 8, 'A-': 8, 'B-': 10, 'AB-': 14,
}

// If a Pending request sits without a coordinator decision for longer
// than this, it auto-escalates (flagged + Admin notified). Short on
// purpose so it's demonstrable in a live review.
export const ESCALATION_THRESHOLD_MINUTES = 3

// How often the escalation watcher re-checks pending requests.
export const ESCALATION_CHECK_INTERVAL_MS = 15000
