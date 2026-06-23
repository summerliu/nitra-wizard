<script setup>
import { useRegistration } from '../composables/useRegistration.js'
import { formatCurrency } from '../utils/format.js'

const { attendeeInfo, ticketType, grandTotal, event } = useRegistration()
</script>

<template>
  <div class="success-wrapper">
    <div class="success-card">
      <div class="success-icon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="20" fill="var(--bg-success-subtle-rest)"/>
          <path d="M10 20l7 7L30 13" stroke="var(--text-success-emphasis)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <h1 class="success-title">You're registered!</h1>
      <p class="success-msg">
        Thank you, <strong>{{ attendeeInfo.fullName || 'attendee' }}</strong>. Your registration for
        <strong>{{ event.name }}</strong> is confirmed.
      </p>

      <div class="confirmation-details">
        <div class="detail-row">
          <span class="detail-label">Confirmation sent to</span>
          <span class="detail-value">{{ attendeeInfo.email }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ticket type</span>
          <span class="detail-value">{{ ticketType?.name }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total charged</span>
          <span class="detail-value total">{{ formatCurrency(grandTotal) }}</span>
        </div>
      </div>

      <div class="event-info">
        <div class="event-info__dates">📅 November 15–16, 2028</div>
        <div class="event-info__venue">📍 {{ event.venue.name }}, San Francisco</div>
      </div>

      <p class="success-footer">
        A confirmation email with your ticket details has been sent to your registered address.
        See you at WebDev Summit 2028!
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.success-wrapper {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.success-card {
  max-width: 480px;
  width: 100%;
  background: var(--bg-surface-l0);
  border: 1.5px solid var(--border-neutral-muted);
  border-radius: 16px;
  padding: 40px 36px;
  text-align: center;
}

.success-icon {
  margin-bottom: 20px;
}

.success-title {
  font-size: var(--font-size-h2);
  font-weight: 630;
  color: var(--text-neutral-default);
  margin: 0 0 12px;
}

.success-msg {
  font-size: var(--font-size-md);
  color: var(--text-neutral-muted);
  margin: 0 0 28px;
  line-height: 1.5;
}

.confirmation-details {
  background: var(--bg-surface-l1);
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 20px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.detail-label {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-quiet);
}

.detail-value {
  font-size: var(--font-size-sm);
  font-weight: 570;
  color: var(--text-neutral-default);
  text-align: right;

  &.total {
    font-size: var(--font-size-md);
    font-weight: 630;
    color: var(--text-brand-emphasis);
  }
}

.event-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 24px;
  font-size: var(--font-size-sm);
  color: var(--text-neutral-muted);
}

.success-footer {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-quiet);
  margin: 0;
  line-height: 1.5;
}
</style>
