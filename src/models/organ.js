// Module 4 — Organ / Tissue Inventory
import { categoryOf } from '../config/constants'

export function createOrgan({ organType, bloodGroup, hospitalId, donorId }) {
  return {
    id: crypto.randomUUID(),
    organType,
    category: categoryOf(organType), // 'Organ' | 'Tissue'
    bloodGroup,
    hospitalId,
    donorId: donorId || null,
    status: 'Available', // 'Available' -> 'Reserved' -> 'Transplanted'
    reservedForRecipientId: null,
    addedAt: new Date().toISOString(),
  }
}
