<script setup>
import { useRegistration } from '../composables/useRegistration.js'

const { attendeeInfo, ticketType, event } = useRegistration()

const confirmationNumber = `WDS-2028-${Math.floor(10000 + Math.random() * 90000)}`

function reload() {
  window.location.reload()
}
</script>

<template>
  <div class="success-screen">
    <div class="success-content">
      <img src="../assets/Success Icon.svg" alt="Success" class="success-icon" />

      <h1 class="success-title">Registration Complete!</h1>

      <p class="confirmation-num">Confirmation #{{ confirmationNumber }}</p>

      <p class="success-msg">
        Thank you, {{ attendeeInfo.fullName || 'attendee' }}! Your {{ ticketType?.name ?? '' }} registration
        for {{ event.name }} is confirmed.<br />
        You will receive a confirmation email at {{ attendeeInfo.email }}.
      </p>

      <button class="btn-home" type="button" @click="reload">
        Back to Home
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.success-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-surface-l0);
  padding: 40px 24px;
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 480px;
  width: 100%;
  gap: 16px;
}

.success-icon {
  width: 80px;
  height: 80px;
}

.success-title {
  font-size: var(--font-size-h2);
  font-weight: 700;
  color: var(--bg-success-emphasis-rest);
  margin: 0;
}

.confirmation-num {
  font-size: var(--font-size-md);
  font-weight: 570;
  color: var(--text-neutral-default);
  margin: 0;
}

.success-msg {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-muted);
  line-height: 1.6;
  margin: 0;
}

.btn-home {
  margin-top: 4px;
  padding: 10px 28px;
  border-radius: 24px;
  font-size: var(--font-size-md);
  font-weight: 570;
  border: none;
  background: var(--bg-accent-emphasis-rest);
  color: white;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: var(--bg-accent-emphasis-hover); }
  &:active { background: var(--bg-accent-emphasis-active); }
}
</style>
