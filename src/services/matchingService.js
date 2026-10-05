// Module 5 — Rule-Based Matching (decision support only)
// Module 6 — Emergency Severity Scoring
//
// Everything here is a transparent, rule-based scorer — not an automated
// medical decision-maker. Every point is explainable, and both functions
// return a breakdown so the UI can show *why* a number is what it is.
// A human coordinator always makes the final call.

import { BLOOD_GROUP_RARITY_BONUS } from '../config/emergency'

const DONOR_COMPATIBILITY = {
  'O-':  ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+':  ['O+', 'A+', 'B+', 'AB+'],
  'A-':  ['A-', 'A+', 'AB-', 'AB+'],
  'A+':  ['A+', 'AB+'],
  'B-':  ['B-', 'B+', 'AB-', 'AB+'],
  'B+':  ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
}

const URGENCY_WEIGHT = { Critical: 40, High: 25, Normal: 10 }

export function isBloodGroupCompatible(donorBloodGroup, recipientBloodGroup) {
  return DONOR_COMPATIBILITY[donorBloodGroup]?.includes(recipientBloodGroup) ?? false
}

export function daysWaiting(recipient) {
  return Math.floor((Date.now() - new Date(recipient.createdAt).getTime()) / 86400000)
}

/**
 * Ranks waiting recipients against one available organ — this is the
 * "which recipient fits THIS organ" question.
 * Returns { recipient, score, label, reasons[] }, sorted by score (desc).
 */
export function rankRecipientsForOrgan(organ, recipients, excludeRecipientId = null) {
  return recipients
    .filter(r => r.id !== excludeRecipientId && r.status === 'Waiting' && r.requiredOrgan === organ.organType)
    .map(r => {
      const compatible = isBloodGroupCompatible(organ.bloodGroup, r.bloodGroup)
      if (!compatible) return null

      const reasons = []
      let score = 50
      reasons.push(`Blood group ${organ.bloodGroup} is compatible with recipient's ${r.bloodGroup}`)
      reasons.push(`Required organ (${r.requiredOrgan}) matches the available ${organ.organType}`)

      const urgencyPoints = URGENCY_WEIGHT[r.urgency] ?? 0
      score += urgencyPoints
      if (r.urgency !== 'Normal') reasons.push(`${r.urgency} urgency (+${urgencyPoints} pts)`)

      const waited = daysWaiting(r)
      if (waited > 0) {
        const waitPoints = Math.min(waited, 30)
        score += waitPoints
        reasons.push(`Waiting ${waited} day${waited === 1 ? '' : 's'} (+${waitPoints} pts)`)
      }

      if (r.hospitalId && organ.hospitalId && r.hospitalId === organ.hospitalId) {
        score += 10
        reasons.push('Same hospital as the organ — simpler logistics (+10 pts)')
      }

      const label = score >= 85 ? 'High compatibility'
        : score >= 65 ? 'Medium compatibility'
        : 'Low compatibility'

      return { recipient: r, score, label, reasons }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
}

/**
 * Module 6 — "how urgent is THIS recipient overall", independent of any
 * specific organ. Combines clinical severity (set by the coordinator),
 * self-reported urgency, waiting time, and blood-group rarity (rarer
 * groups are harder to re-match if a request falls through, so they
 * carry a small added urgency).
 *
 * Returns { score, tier, breakdown[] } — tier is 'Normal' | 'High' | 'Emergency'.
 */
export function calculateEmergencyScore({ severity = 1, waitingDays = 0, urgency = 'Normal', bloodGroup }) {
  const breakdown = []

  const severityPoints = severity * 10
  breakdown.push({ label: `Clinical severity ${severity}/5`, points: severityPoints })

  const urgencyPoints = URGENCY_WEIGHT[urgency] ?? 10
  breakdown.push({ label: `${urgency} urgency`, points: urgencyPoints })

  const waitingPoints = Math.round(Math.min(waitingDays / 30, 1) * 15)
  breakdown.push({ label: `Waiting ${waitingDays} day${waitingDays === 1 ? '' : 's'}`, points: waitingPoints })

  const rarityPoints = BLOOD_GROUP_RARITY_BONUS[bloodGroup] ?? 0
  if (rarityPoints > 0) {
    breakdown.push({ label: `${bloodGroup} is a rarer blood group`, points: rarityPoints })
  }

  const score = severityPoints + urgencyPoints + waitingPoints + rarityPoints
  const tier = score >= 70 ? 'Emergency' : score >= 45 ? 'High' : 'Normal'

  return { score, tier, breakdown }
}
