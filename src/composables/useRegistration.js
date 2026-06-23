import { reactive, ref, computed } from 'vue'
import { sessions as allSessions } from '../mocks/sessions.js'
import { addons as allAddons } from '../mocks/addons.js'
import { event } from '../mocks/event.js'

// Module-level singleton — all components share the same state instance.
const attendeeInfo = reactive({
  fullName: '',
  email: '',
  phone: '',
  company: '',
  jobTitle: '',
  shippingAddress: '',
})

const ticketTypeId = ref('general')
const selectedSessionIds = ref(/** @type {string[]} */ ([]))
/** @type {import('vue').Ref<Array<{id: string, quantity: number, size?: string}>>} */
const selectedAddons = ref([])

/**
 * Determine whether two half-open time intervals overlap.
 * @param {string} s1 - start of first interval (ISO 8601)
 * @param {string} e1 - end of first interval (ISO 8601)
 * @param {string} s2 - start of second interval (ISO 8601)
 * @param {string} e2 - end of second interval (ISO 8601)
 * @returns {boolean}
 */
export function timesOverlap(s1, e1, s2, e2) {
  return new Date(s1) < new Date(e2) && new Date(s2) < new Date(e1)
}

const ticketType = computed(() =>
  event.ticketTypes.find(t => t.id === ticketTypeId.value) ?? null
)

const isVip = computed(() => ticketTypeId.value === 'vip')

/** Sessions grouped by date (YYYY-MM-DD), sorted chronologically. */
const sessionsByDate = computed(() => {
  /** @type {Record<string, typeof allSessions>} */
  const groups = {}
  for (const session of allSessions) {
    const date = session.date.slice(0, 10)
    ;(groups[date] ??= []).push(session)
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
})

/** Add-ons grouped by category. */
const addonsByCategory = computed(() => ({
  workshop: allAddons.filter(a => a.category === 'workshop'),
  meal: allAddons.filter(a => a.category === 'meal'),
  merchandise: allAddons.filter(a => a.category === 'merchandise'),
}))

const hasMerchandise = computed(() =>
  selectedAddons.value.some(item => {
    const addon = allAddons.find(a => a.id === item.id)
    return addon?.category === 'merchandise'
  })
)

/**
 * Set of session IDs that are in time conflict with another selected session.
 * Recomputes whenever selectedSessionIds changes.
 */
const conflictingSessionIds = computed(() => {
  const selected = allSessions.filter(s => selectedSessionIds.value.includes(s.id))
  const conflicts = new Set()
  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      if (timesOverlap(selected[i].date, selected[i].endDate, selected[j].date, selected[j].endDate)) {
        conflicts.add(selected[i].id)
        conflicts.add(selected[j].id)
      }
    }
  }
  return conflicts
})

/**
 * Check whether a workshop's time slot conflicts with any currently selected session.
 * @param {{ date: string, endDate: string }} workshop
 * @returns {boolean}
 */
function isWorkshopConflicting(workshop) {
  return allSessions
    .filter(s => selectedSessionIds.value.includes(s.id))
    .some(s => timesOverlap(workshop.date, workshop.endDate, s.date, s.endDate))
}

// ── Pricing ────────────────────────────────────────────────────────────────

const ticketPrice = computed(() => ticketType.value?.price ?? 0)

/** Total VIP workshop discount (10% off each workshop). */
const workshopDiscount = computed(() => {
  if (!isVip.value) return 0
  return selectedAddons.value.reduce((sum, item) => {
    const addon = allAddons.find(a => a.id === item.id)
    if (addon?.category !== 'workshop') return sum
    return sum + addon.price * 0.1 * (item.quantity ?? 1)
  }, 0)
})

/** Total price for all selected add-ons (VIP discount applied to workshops). */
const addonTotal = computed(() =>
  selectedAddons.value.reduce((sum, item) => {
    const addon = allAddons.find(a => a.id === item.id)
    if (!addon) return sum
    const price = addon.category === 'workshop' && isVip.value
      ? addon.price * 0.9
      : addon.price
    return sum + price * (item.quantity ?? 1)
  }, 0)
)

const grandTotal = computed(() => ticketPrice.value + addonTotal.value)

// ── Mutation helpers ────────────────────────────────────────────────────────

/** Toggle a session's selected state. */
function toggleSession(id) {
  const idx = selectedSessionIds.value.indexOf(id)
  if (idx >= 0) selectedSessionIds.value.splice(idx, 1)
  else selectedSessionIds.value.push(id)
}

/** Toggle an add-on's selected state, defaulting to quantity 1 and first available size. */
function toggleAddon(id) {
  const idx = selectedAddons.value.findIndex(a => a.id === id)
  if (idx >= 0) {
    selectedAddons.value.splice(idx, 1)
  } else {
    const addon = allAddons.find(a => a.id === id)
    selectedAddons.value.push({
      id,
      quantity: 1,
      ...(addon?.sizes ? { size: addon.sizes[0] } : {}),
    })
  }
}

/**
 * Update properties of an already-selected add-on item.
 * @param {string} id - add-on ID
 * @param {Partial<{quantity: number, size: string}>} updates
 */
function updateAddon(id, updates) {
  const item = selectedAddons.value.find(a => a.id === id)
  if (item) Object.assign(item, updates)
}

/** @param {string} id @returns {boolean} */
function isAddonSelected(id) {
  return selectedAddons.value.some(a => a.id === id)
}

/**
 * Return the selection entry for a given add-on, or undefined.
 * @param {string} id
 * @returns {{id: string, quantity: number, size?: string} | undefined}
 */
function getAddonItem(id) {
  return selectedAddons.value.find(a => a.id === id)
}

export function useRegistration() {
  return {
    attendeeInfo,
    ticketTypeId,
    selectedSessionIds,
    selectedAddons,
    ticketType,
    isVip,
    sessionsByDate,
    addonsByCategory,
    hasMerchandise,
    conflictingSessionIds,
    ticketPrice,
    workshopDiscount,
    addonTotal,
    grandTotal,
    isWorkshopConflicting,
    toggleSession,
    toggleAddon,
    updateAddon,
    isAddonSelected,
    getAddonItem,
    sessions: allSessions,
    addons: allAddons,
    event,
  }
}
