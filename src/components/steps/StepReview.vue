<script setup>
import { computed } from 'vue'
import { useRegistration } from '../../composables/useRegistration.js'
import { useValidation } from '../../composables/useValidation.js'
import { formatCurrency } from '../../utils/format.js'

const props = defineProps({
  validationAttempted: { type: Boolean, default: false },
})

const emit = defineEmits(['edit', 'submit'])

const {
  attendeeInfo,
  ticketType,
  ticketPrice,
  isVip,
  selectedSessionIds,
  selectedAddons,
  workshopDiscount,
  grandTotal,
  sessions,
  addons,
} = useRegistration()

const {
  hasStep1Errors, hasStep2Errors, hasStep3Errors, hasAnyErrors,
  step1Errors, step2Errors, step3Errors,
} = useValidation()

const selectedSessions = computed(() =>
  sessions.filter(s => selectedSessionIds.value.includes(s.id))
)

const addonLineItems = computed(() =>
  selectedAddons.value.map(entry => {
    const addon = addons.find(a => a.id === entry.id)
    if (!addon) return null
    const isWorkshop = addon.category === 'workshop'
    const unitPrice = isWorkshop && isVip.value ? addon.price * 0.9 : addon.price
    return {
      id: entry.id,
      name: addon.name,
      category: addon.category,
      size: entry.size,
      quantity: entry.quantity,
      unitPrice,
      total: unitPrice * entry.quantity,
      isDiscounted: isWorkshop && isVip.value,
      originalUnitPrice: addon.price,
    }
  }).filter(Boolean)
)

const errorSteps = computed(() => {
  const steps = []
  if (hasStep1Errors.value) steps.push({ num: 1, label: 'Attendee Info' })
  if (hasStep2Errors.value) steps.push({ num: 2, label: 'Session Selection' })
  if (hasStep3Errors.value) steps.push({ num: 3, label: 'Add-ons' })
  return steps
})

function formatSessionDateTime(session) {
  const d = new Date(session.date)
  const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' })
  return `${datePart}, ${timePart}`
}

function categoryLabel(cat) {
  if (cat === 'workshop') return 'Workshop'
  if (cat === 'meal') return 'Meal Package'
  if (cat === 'merchandise') return 'Merchandise'
  return cat
}
</script>

<template>
  <div class="step-content">
    <h2 class="step-title">Review Your Registration</h2>

    <!-- Validation error summary -->
    <div v-if="props.validationAttempted && hasAnyErrors" class="error-summary">
      <div class="error-summary__title">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
          <path d="M8 5v4M8 11v.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
        </svg>
        Please fix the following before submitting:
      </div>
      <ul class="error-summary__list">
        <li v-for="step in errorSteps" :key="step.num">
          <button class="error-step-link" type="button" @click="emit('edit', step.num)">
            Step {{ step.num }}: {{ step.label }}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <ul class="error-detail-list">
            <template v-if="step.num === 1">
              <li v-for="(msg, field) in step1Errors" :key="field">{{ msg }}</li>
            </template>
            <template v-if="step.num === 2">
              <li v-for="(msg, key) in step2Errors" :key="key">{{ msg }}</li>
            </template>
            <template v-if="step.num === 3">
              <li v-for="(msg, key) in step3Errors" :key="key">{{ msg }}</li>
            </template>
          </ul>
        </li>
      </ul>
    </div>

    <!-- ── Attendee Information ── -->
    <div class="review-card">
      <div class="card-header">
        <h3 class="card-title">Attendee Information</h3>
        <button class="edit-link" type="button" @click="emit('edit', 1)">Edit → Step 1</button>
      </div>
      <div class="data-rows">
        <div class="data-row">
          <span class="data-label">Name</span>
          <span class="data-value">{{ attendeeInfo.fullName || '—' }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Email</span>
          <span class="data-value">{{ attendeeInfo.email || '—' }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Phone</span>
          <span class="data-value">{{ attendeeInfo.phone || '—' }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Company</span>
          <span class="data-value">{{ attendeeInfo.company || '—' }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Job Title</span>
          <span class="data-value">{{ attendeeInfo.jobTitle || '—' }}</span>
        </div>
        <div class="data-row">
          <span class="data-label">Ticket Type</span>
          <span class="data-value">
            {{ ticketType?.name ?? '—' }}
            <span v-if="ticketType" class="data-meta">({{ formatCurrency(ticketType.price) }})</span>
          </span>
        </div>
        <div v-if="attendeeInfo.shippingAddress" class="data-row">
          <span class="data-label">Shipping Address</span>
          <span class="data-value">{{ attendeeInfo.shippingAddress }}</span>
        </div>
      </div>
    </div>

    <!-- ── Selected Sessions ── -->
    <div class="review-card">
      <div class="card-header">
        <h3 class="card-title">Selected Sessions</h3>
        <button class="edit-link" type="button" @click="emit('edit', 2)">Edit → Step 2</button>
      </div>
      <div class="data-rows">
        <p v-if="selectedSessions.length === 0" class="empty-msg">No sessions selected.</p>
        <div v-for="session in selectedSessions" :key="session.id" class="data-row">
          <span class="data-label">{{ formatSessionDateTime(session) }}</span>
          <span class="data-value">{{ session.title }}</span>
        </div>
      </div>
    </div>

    <!-- ── Add-ons ── -->
    <div class="review-card">
      <div class="card-header">
        <h3 class="card-title">Add-ons</h3>
        <button class="edit-link" type="button" @click="emit('edit', 3)">Edit → Step 3</button>
      </div>
      <div class="data-rows">
        <p v-if="addonLineItems.length === 0" class="empty-msg">No add-ons selected.</p>
        <div v-for="item in addonLineItems" :key="item.id" class="data-row">
          <span class="data-label">{{ categoryLabel(item.category) }}</span>
          <span class="data-value">
            {{ item.name }}
            <span v-if="item.size" class="data-meta">({{ item.size }})</span>
            <span v-if="item.quantity > 1" class="data-meta"> ×{{ item.quantity }}</span>
            — {{ formatCurrency(item.total) }}
          </span>
        </div>
      </div>
    </div>

    <!-- ── Pricing Summary ── -->
    <div class="review-card">
      <div class="card-header">
        <h3 class="card-title">Pricing Summary</h3>
      </div>
      <div class="data-rows">
        <div class="data-row">
          <span class="data-label">{{ ticketType?.name ?? 'Ticket' }} Ticket</span>
          <span class="data-value">{{ formatCurrency(ticketPrice) }}</span>
        </div>
        <div v-for="item in addonLineItems" :key="item.id + '-price'" class="data-row">
          <span class="data-label">
            {{ item.name }}
            <span v-if="item.size" class="data-meta">({{ item.size }})</span>
            <span v-if="item.quantity > 1" class="data-meta"> ×{{ item.quantity }}</span>
          </span>
          <span class="data-value">{{ formatCurrency(item.total) }}</span>
        </div>
        <div v-if="workshopDiscount > 0" class="data-row data-row--discount">
          <span class="data-label">VIP workshop discount (10%)</span>
          <span class="data-value">-{{ formatCurrency(workshopDiscount) }}</span>
        </div>
      </div>
      <div class="total-divider" />
      <div class="grand-total-row">
        <span class="grand-total-label">Grand Total</span>
        <span class="grand-total-value">{{ formatCurrency(grandTotal) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.step-content {
  background: var(--bg-surface-l0);
  border-radius: 12px;
  padding: 28px;
  border: 1.5px solid var(--border-neutral-muted);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-title {
  font-size: var(--font-size-h3);
  font-weight: 630;
  color: var(--text-neutral-default);
  margin: 0 0 4px;
}

// Error summary
.error-summary {
  padding: 16px;
  background: var(--bg-danger-subtle-rest);
  border: 1px solid var(--border-danger-muted);
  border-radius: 10px;
}

.error-summary__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-md);
  font-weight: 610;
  color: var(--text-danger-emphasis);
  margin-bottom: 12px;
}

.error-summary__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.error-step-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-sm);
  font-weight: 610;
  color: var(--text-danger-default);
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;

  &:hover { color: var(--text-danger-emphasis); }
}

.error-detail-list {
  list-style: disc;
  padding-left: 20px;
  margin: 4px 0 0;
  font-size: var(--font-size-sm);
  color: var(--text-danger-default);
}

// Review cards
.review-card {
  background: var(--bg-surface-l1);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--divider-muted);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--divider-muted);
}

.card-title {
  font-size: var(--font-size-md);
  font-weight: 630;
  color: var(--text-neutral-default);
  margin: 0;
}

.edit-link {
  font-size: var(--font-size-sm);
  font-weight: 570;
  color: var(--text-brand-default);
  text-decoration: underline;
  text-underline-offset: 2px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  white-space: nowrap;

  &:hover { color: var(--text-brand-emphasis); }
}

// Data rows
.data-rows {
  display: flex;
  flex-direction: column;
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding: 10px 18px;
  border-bottom: 1px solid var(--divider-muted);

  &:last-child { border-bottom: none; }

  &--discount .data-label,
  &--discount .data-value {
    color: var(--text-success-default);
  }
}

.data-label {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-muted);
  flex-shrink: 0;
  min-width: 110px;
}

.data-value {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-default);
  font-weight: 500;
  text-align: right;
  flex: 1;
}

.data-meta {
  color: var(--text-neutral-muted);
  font-weight: 400;
}

.empty-msg {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-quiet);
  margin: 0;
  padding: 12px 18px;
}

// Grand total
.total-divider {
  height: 1px;
  background: var(--divider-default);
  margin: 0 18px;
}

.grand-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
}

.grand-total-label {
  font-size: var(--font-size-md);
  font-weight: 630;
  color: var(--text-neutral-default);
}

.grand-total-value {
  font-size: var(--font-size-subtitle1);
  font-weight: 630;
  color: var(--text-neutral-default);
}

@media (max-width: 767px) {
  .step-content { padding: 16px; }

  .data-row {
    flex-direction: column;
    gap: 2px;
  }

  .data-label { min-width: unset; }
  .data-value { text-align: left; }
}
</style>
