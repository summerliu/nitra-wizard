<script setup>
import { useRegistration } from '../../composables/useRegistration.js'
import { useValidation } from '../../composables/useValidation.js'
import { formatCurrency } from '../../utils/format.js'

const props = defineProps({
  validationAttempted: { type: Boolean, default: false },
})

const { attendeeInfo, ticketTypeId, hasMerchandise, event } = useRegistration()
const { step1Errors } = useValidation()

const TICKET_HIGHLIGHT = {
  general: '',
  vip: 'card--vip',
  student: '',
}
</script>

<template>
  <div class="step-content">
    <h2 class="step-title">Attendee Information</h2>
    <p class="step-subtitle">Please provide your details and select a ticket type.</p>

    <!-- Personal info -->
    <div class="form-grid">
      <div class="field">
        <label class="field-label">Full Name <span class="req">*</span></label>
        <input
          v-model="attendeeInfo.fullName"
          type="text"
          class="field-input"
          :class="{ 'has-error': props.validationAttempted && step1Errors.fullName }"
          placeholder="Jane Smith"
        />
        <p v-if="props.validationAttempted && step1Errors.fullName" class="field-error">{{ step1Errors.fullName }}</p>
      </div>

      <div class="field">
        <label class="field-label">Email Address <span class="req">*</span></label>
        <input
          v-model="attendeeInfo.email"
          type="email"
          class="field-input"
          :class="{ 'has-error': props.validationAttempted && step1Errors.email }"
          placeholder="jane@example.com"
        />
        <p v-if="props.validationAttempted && step1Errors.email" class="field-error">{{ step1Errors.email }}</p>
      </div>

      <div class="field">
        <label class="field-label">Phone Number <span class="req">*</span></label>
        <input
          v-model="attendeeInfo.phone"
          type="tel"
          class="field-input"
          :class="{ 'has-error': props.validationAttempted && step1Errors.phone }"
          placeholder="+1 (555) 000-0000"
        />
        <p v-if="props.validationAttempted && step1Errors.phone" class="field-error">{{ step1Errors.phone }}</p>
      </div>

      <div class="field">
        <label class="field-label">Company <span class="req">*</span></label>
        <input
          v-model="attendeeInfo.company"
          type="text"
          class="field-input"
          :class="{ 'has-error': props.validationAttempted && step1Errors.company }"
          placeholder="Acme Inc."
        />
        <p v-if="props.validationAttempted && step1Errors.company" class="field-error">{{ step1Errors.company }}</p>
      </div>

      <div class="field">
        <label class="field-label">Job Title <span class="req">*</span></label>
        <input
          v-model="attendeeInfo.jobTitle"
          type="text"
          class="field-input"
          :class="{ 'has-error': props.validationAttempted && step1Errors.jobTitle }"
          placeholder="Senior Engineer"
        />
        <p v-if="props.validationAttempted && step1Errors.jobTitle" class="field-error">{{ step1Errors.jobTitle }}</p>
      </div>

      <div class="field field--full">
        <label class="field-label">
          Shipping Address
          <span v-if="hasMerchandise" class="req">*</span>
          <span v-else class="optional">(optional — required if merchandise selected)</span>
        </label>
        <input
          v-model="attendeeInfo.shippingAddress"
          type="text"
          class="field-input"
          :class="{ 'has-error': props.validationAttempted && step1Errors.shippingAddress }"
          placeholder="123 Main St, San Francisco, CA 94105"
        />
        <p v-if="props.validationAttempted && step1Errors.shippingAddress" class="field-error">{{ step1Errors.shippingAddress }}</p>
      </div>
    </div>

    <!-- Ticket type selection -->
    <div class="ticket-section">
      <h3 class="section-title">Select Ticket Type</h3>
      <div v-if="props.validationAttempted && step1Errors.ticketType" class="field-error mb-3">{{ step1Errors.ticketType }}</div>
      <div class="ticket-grid">
        <div
          v-for="ticket in event.ticketTypes"
          :key="ticket.id"
          class="ticket-card"
          :class="[TICKET_HIGHLIGHT[ticket.id], { 'ticket-card--selected': ticketTypeId === ticket.id }]"
          @click="ticketTypeId = ticket.id"
          role="radio"
          :aria-checked="ticketTypeId === ticket.id"
          tabindex="0"
          @keydown.enter.space.prevent="ticketTypeId = ticket.id"
        >
          <div class="ticket-header">
            <div class="ticket-name">{{ ticket.name }}</div>
            <div class="ticket-price">{{ formatCurrency(ticket.price) }}</div>
          </div>
          <p class="ticket-desc">{{ ticket.description }}</p>
          <ul class="ticket-perks">
            <li v-for="perk in ticket.perks" :key="perk">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="perk-icon">
                <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ perk }}
            </li>
          </ul>
          <div class="ticket-radio">
            <div class="radio-circle" :class="{ active: ticketTypeId === ticket.id }">
              <div v-if="ticketTypeId === ticket.id" class="radio-dot" />
            </div>
          </div>
        </div>
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.field {
  display: flex;
  flex-direction: column;

  &--full {
    grid-column: 1 / -1;
  }
}

.field-label {
  font-size: var(--font-size-sm);
  font-weight: 570;
  color: var(--text-neutral-muted);
  margin-bottom: 6px;
}

.req {
  color: var(--text-danger-default);
  margin-left: 2px;
}

.optional {
  font-weight: 485;
  color: var(--text-neutral-quiet);
  font-size: 12px;
  margin-left: 4px;
}

.field-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border-neutral-muted);
  border-radius: 8px;
  font-size: var(--font-size-md);
  background: var(--bg-surface-l0);
  color: var(--text-neutral-default);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;

  &::placeholder { color: var(--text-neutral-quiet); }

  &:focus {
    border-color: var(--border-brand-emphasis);
    box-shadow: 0 0 0 3px var(--border-brand-opacity);
  }

  &.has-error {
    border-color: var(--border-danger-emphasis);
    &:focus { box-shadow: 0 0 0 3px var(--border-danger-opacity); }
  }
}

.field-error {
  font-size: var(--font-size-sm);
  color: var(--text-danger-default);
  margin-top: 4px;
}

.mb-3 { margin-bottom: 12px; }

// Ticket section
.ticket-section {
  border-top: 1px solid rgba(0,0,0,0.07);
  padding-top: 24px;
}

.section-title {
  font-size: var(--font-size-subtitle1);
  font-weight: 610;
  color: var(--text-neutral-default);
  margin: 0 0 16px;
}

.ticket-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.ticket-card {
  position: relative;
  border: 2px solid var(--border-neutral-muted);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  background: var(--bg-surface-l0);
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;

  &:hover {
    border-color: var(--border-brand-muted);
    background: var(--bg-brand-quiet-hover);
  }

  &--selected {
    border-color: var(--border-brand-emphasis);
    background: var(--bg-brand-subtle-rest);
    box-shadow: 0 0 0 3px var(--border-brand-opacity);
  }

  &--vip {
    &.ticket-card--selected {
      background: linear-gradient(135deg, var(--bg-brand-subtle-rest) 0%, var(--bg-brand-muted-rest) 100%);
    }
  }
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.ticket-name {
  font-size: var(--font-size-subtitle1);
  font-weight: 610;
  color: var(--text-neutral-default);

  .ticket-card--selected & { color: var(--text-brand-emphasis); }
}

.ticket-price {
  font-size: var(--font-size-subtitle1);
  font-weight: 630;
  color: var(--text-neutral-default);

  .ticket-card--selected & { color: var(--text-brand-emphasis); }
}

.ticket-desc {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-muted);
  margin: 0 0 12px;
  line-height: 1.4;
}

.ticket-perks {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  li {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--font-size-sm);
    color: var(--text-neutral-muted);
  }
}

.perk-icon {
  color: var(--text-success-default);
  flex-shrink: 0;

  .ticket-card--selected & { color: var(--text-brand-default); }
}

.ticket-radio {
  display: flex;
  justify-content: flex-end;
}

.radio-circle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--border-neutral-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s;

  &.active {
    border-color: var(--border-brand-emphasis);
  }
}

.radio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--bg-brand-emphasis-rest);
}

@media (max-width: 767px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .ticket-grid {
    grid-template-columns: 1fr;
  }
}
</style>
