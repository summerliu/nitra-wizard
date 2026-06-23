<script setup>
import { computed } from 'vue'
import { useRegistration } from '../../composables/useRegistration.js'
import { useValidation } from '../../composables/useValidation.js'
import { formatCurrency, formatTimeRange } from '../../utils/format.js'

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
  addonTotal,
  grandTotal,
  sessions,
  addons,
  event,
} = useRegistration()

const {
  hasStep1Errors,
  hasStep2Errors,
  hasStep3Errors,
  hasAnyErrors,
  step1Errors,
  step2Errors,
  step3Errors,
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
</script>

<template>
  <div class="step-content">
    <h2 class="step-title">Review & Submit</h2>
    <p class="step-subtitle">Please review your registration before submitting.</p>

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

    <!-- ── Attendee Info ── -->
    <div class="review-section">
      <div class="review-header">
        <h3 class="review-section-title">Attendee Information</h3>
        <button class="edit-btn" type="button" @click="emit('edit', 1)">Edit</button>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Name</span>
          <span class="info-value">{{ attendeeInfo.fullName || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Email</span>
          <span class="info-value">{{ attendeeInfo.email || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Phone</span>
          <span class="info-value">{{ attendeeInfo.phone || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Company</span>
          <span class="info-value">{{ attendeeInfo.company || '—' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Job Title</span>
          <span class="info-value">{{ attendeeInfo.jobTitle || '—' }}</span>
        </div>
        <div v-if="attendeeInfo.shippingAddress" class="info-item info-item--full">
          <span class="info-label">Shipping Address</span>
          <span class="info-value">{{ attendeeInfo.shippingAddress }}</span>
        </div>
      </div>

      <!-- Ticket type -->
      <div v-if="ticketType" class="ticket-summary">
        <div class="ticket-summary__name">{{ ticketType.name }} Ticket</div>
        <div class="ticket-summary__perks">
          <span v-for="perk in ticketType.perks" :key="perk" class="perk-chip">{{ perk }}</span>
        </div>
      </div>
    </div>

    <!-- ── Sessions ── -->
    <div class="review-section">
      <div class="review-header">
        <h3 class="review-section-title">Sessions</h3>
        <button class="edit-btn" type="button" @click="emit('edit', 2)">Edit</button>
      </div>
      <p v-if="selectedSessions.length === 0" class="empty-msg">No sessions selected.</p>
      <div v-else class="sessions-list">
        <div v-for="session in selectedSessions" :key="session.id" class="session-row">
          <div>
            <div class="session-row__title">{{ session.title }}</div>
            <div class="session-row__meta">
              {{ session.speaker }} · {{ formatTimeRange(session.date, session.endDate) }}
            </div>
          </div>
          <span class="included-badge">Included</span>
        </div>
      </div>
    </div>

    <!-- ── Add-ons ── -->
    <div class="review-section">
      <div class="review-header">
        <h3 class="review-section-title">Add-ons</h3>
        <button class="edit-btn" type="button" @click="emit('edit', 3)">Edit</button>
      </div>
      <p v-if="addonLineItems.length === 0" class="empty-msg">No add-ons selected.</p>
      <div v-else class="addon-list">
        <div v-for="item in addonLineItems" :key="item.id" class="addon-row">
          <div>
            <span class="addon-row__name">{{ item.name }}</span>
            <span v-if="item.size" class="addon-row__detail"> ({{ item.size }})</span>
            <span v-if="item.quantity > 1" class="addon-row__detail"> ×{{ item.quantity }}</span>
            <span v-if="item.isDiscounted" class="discount-chip">VIP -10%</span>
          </div>
          <div class="addon-row__price">
            <span v-if="item.isDiscounted" class="original-price">
              {{ formatCurrency(item.originalUnitPrice * item.quantity) }}
            </span>
            {{ formatCurrency(item.total) }}
          </div>
        </div>
      </div>
    </div>

    <!-- ── Price Breakdown ── -->
    <div class="review-section pricing-section">
      <h3 class="review-section-title">Price Breakdown</h3>

      <div class="price-rows">
        <div class="price-row">
          <span>{{ ticketType?.name ?? 'Ticket' }} Ticket</span>
          <span>{{ formatCurrency(ticketPrice) }}</span>
        </div>

        <div v-for="item in addonLineItems" :key="item.id + '-price'" class="price-row">
          <span>
            {{ item.name }}
            <span v-if="item.size" class="detail-text">({{ item.size }})</span>
            <span v-if="item.quantity > 1" class="detail-text">×{{ item.quantity }}</span>
          </span>
          <span>{{ formatCurrency(item.total) }}</span>
        </div>

        <div v-if="workshopDiscount > 0" class="price-row price-row--discount">
          <span>VIP workshop discount (10%)</span>
          <span>-{{ formatCurrency(workshopDiscount) }}</span>
        </div>
      </div>

      <div class="price-divider" />

      <div class="price-total">
        <span>Total</span>
        <span>{{ formatCurrency(grandTotal) }}</span>
      </div>
    </div>

    <!-- Submit button -->
    <div class="submit-row">
      <button class="btn-submit" type="button" @click="emit('submit')">
        Complete Registration
      </button>
      <p class="submit-note">
        By completing registration, you agree to the terms and conditions of WebDev Summit 2028.
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.step-content {
  background: var(--bg-surface-l0);
  border-radius: 12px;
  padding: 28px;
  border: 1.5px solid var(--border-neutral-muted);
}

.step-title {
  font-size: var(--font-size-h3);
  font-weight: 630;
  color: var(--text-neutral-default);
  margin: 0 0 6px;
}

.step-subtitle {
  font-size: var(--font-size-md);
  color: var(--text-neutral-muted);
  margin: 0 0 24px;
}

// Error summary
.error-summary {
  padding: 16px;
  background: var(--bg-danger-subtle-rest);
  border: 1px solid var(--border-danger-muted);
  border-radius: 10px;
  margin-bottom: 24px;
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

// Review sections
.review-section {
  padding: 20px 0;
  border-top: 1px solid rgba(0,0,0,0.07);

  &:first-of-type { border-top: none; padding-top: 0; }
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.review-section-title {
  font-size: var(--font-size-subtitle1);
  font-weight: 610;
  color: var(--text-neutral-default);
  margin: 0;
}

.edit-btn {
  font-size: var(--font-size-sm);
  font-weight: 570;
  color: var(--text-brand-default);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.12s;

  &:hover { background: var(--bg-brand-quiet-hover); }
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 20px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;

  &--full { grid-column: 1 / -1; }
}

.info-label {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-quiet);
}

.info-value {
  font-size: var(--font-size-md);
  color: var(--text-neutral-default);
  font-weight: 570;
}

.ticket-summary {
  padding: 12px 14px;
  background: var(--bg-brand-subtle-rest);
  border: 1px solid var(--border-brand-quiet);
  border-radius: 8px;
}

.ticket-summary__name {
  font-size: var(--font-size-md);
  font-weight: 610;
  color: var(--text-brand-emphasis);
  margin-bottom: 6px;
}

.ticket-summary__perks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.perk-chip {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--bg-brand-muted-rest);
  color: var(--text-brand-default);
}

.empty-msg {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-quiet);
  margin: 0;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-surface-l1);
  border-radius: 8px;
}

.session-row__title {
  font-size: var(--font-size-sm);
  font-weight: 570;
  color: var(--text-neutral-default);
}

.session-row__meta {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-muted);
  margin-top: 2px;
}

.included-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--bg-success-subtle-rest);
  color: var(--text-success-emphasis);
  white-space: nowrap;
  flex-shrink: 0;
}

.addon-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.addon-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0,0,0,0.05);
  font-size: var(--font-size-sm);

  &:last-child { border-bottom: none; }
}

.addon-row__name {
  color: var(--text-neutral-default);
  font-weight: 570;
}

.addon-row__detail {
  color: var(--text-neutral-muted);
}

.discount-chip {
  display: inline-block;
  font-size: 10px;
  font-weight: 610;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--bg-success-subtle-rest);
  color: var(--text-success-emphasis);
  margin-left: 6px;
}

.addon-row__price {
  white-space: nowrap;
  color: var(--text-neutral-default);
  font-weight: 570;
}

.original-price {
  text-decoration: line-through;
  color: var(--text-neutral-quiet);
  margin-right: 4px;
}

// Pricing
.pricing-section { background: var(--bg-surface-l1); border-radius: 10px; padding: 20px; margin: 0 -4px; }

.price-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  color: var(--text-neutral-muted);

  &--discount { color: var(--text-success-default); }
}

.detail-text {
  color: var(--text-neutral-quiet);
  margin-left: 4px;
}

.price-divider {
  height: 1px;
  background: rgba(0,0,0,0.1);
  margin: 14px 0;
}

.price-total {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-subtitle1);
  font-weight: 630;
  color: var(--text-neutral-default);
}

// Submit
.submit-row {
  padding-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.btn-submit {
  width: 100%;
  padding: 14px 24px;
  border-radius: 10px;
  font-size: var(--font-size-subtitle1);
  font-weight: 610;
  border: none;
  background: var(--bg-brand-emphasis-rest);
  color: white;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: var(--bg-brand-emphasis-hover); }
  &:active { background: var(--bg-brand-emphasis-active); }
}

.submit-note {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-quiet);
  text-align: center;
  margin: 0;
}

@media (max-width: 767px) {
  .step-content { padding: 16px; }
  .info-grid { grid-template-columns: 1fr; }
}
</style>
