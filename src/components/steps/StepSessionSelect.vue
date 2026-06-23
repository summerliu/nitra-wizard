<script setup>
import { ref, computed } from 'vue'
import { useRegistration } from '../../composables/useRegistration.js'
import { useValidation } from '../../composables/useValidation.js'
import { formatTimeRange } from '../../utils/format.js'

const props = defineProps({
  validationAttempted: { type: Boolean, default: false },
})

const {
  sessionsByDate,
  selectedSessionIds,
  conflictingSessionIds,
  toggleSession,
} = useRegistration()

const { step2Errors } = useValidation()

const activeDateKey = ref(null)
const activeDate = computed({
  get: () => activeDateKey.value ?? sessionsByDate.value[0]?.[0] ?? null,
  set: (v) => { activeDateKey.value = v },
})

const currentSessions = computed(() => {
  const entry = sessionsByDate.value.find(([date]) => date === activeDate.value)
  return entry?.[1] ?? []
})

function formatTabDate(dateStr) {
  return new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', timeZone: 'UTC',
  })
}

function capacityBarWidth(session) {
  return Math.min(100, Math.round((session.registered / session.capacity) * 100)) + '%'
}

function capacityBarClass(session) {
  const pct = (session.capacity - session.registered) / session.capacity
  if (pct <= 0) return 'bar--full'
  if (pct < 0.2) return 'bar--low'
  if (pct < 0.5) return 'bar--medium'
  return 'bar--high'
}

function spotsInfo(session) {
  const remaining = session.capacity - session.registered
  if (remaining <= 0) return { text: 'Sold Out', cls: 'spots--sold-out' }
  const pct = remaining / session.capacity
  if (pct < 0.2) return { text: `${remaining} spots left`, cls: 'spots--low' }
  if (pct < 0.5) return { text: `${remaining} spots left`, cls: 'spots--medium' }
  return { text: `${remaining} spots left`, cls: 'spots--high' }
}

const TRACK_BADGE_CLASS = {
  main: 'track-main',
  frontend: 'track-frontend',
  backend: 'track-backend',
  devops: 'track-devops',
}
</script>

<template>
  <div class="step-content">
    <!-- Conflict warning -->
    <div v-if="props.validationAttempted && step2Errors.conflicts" class="alert alert--danger">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0">
        <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
        <path d="M8 5v4M8 11v.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
      </svg>
      {{ step2Errors.conflicts }}
    </div>

    <h2 class="step-title">Select Sessions</h2>

    <!-- Date tabs -->
    <div class="date-tabs">
      <button
        v-for="([date]) in sessionsByDate"
        :key="date"
        class="date-tab"
        :class="{ 'date-tab--active': activeDate === date }"
        type="button"
        @click="activeDate = date"
      >{{ formatTabDate(date) }}</button>
    </div>

    <!-- Selection count -->
    <p class="selection-count">
      {{ selectedSessionIds.length }} session{{ selectedSessionIds.length !== 1 ? 's' : '' }} selected
    </p>

    <!-- 2-column session grid -->
    <div class="sessions-grid">
      <div
        v-for="session in currentSessions"
        :key="session.id"
        class="session-card"
        :class="{
          'session-card--selected': selectedSessionIds.includes(session.id),
          'session-card--full': session.registered >= session.capacity,
          'session-card--conflict': conflictingSessionIds.has(session.id),
        }"
        @click="session.registered < session.capacity && toggleSession(session.id)"
        :aria-disabled="session.registered >= session.capacity"
      >
        <div class="card-top">
          <span class="track-badge" :class="TRACK_BADGE_CLASS[session.track]">{{ session.track }}</span>
          <div
            class="card-checkbox"
            :class="{ 'card-checkbox--checked': selectedSessionIds.includes(session.id) }"
          >
            <svg v-if="selectedSessionIds.includes(session.id)" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <h4 class="session-title">{{ session.title }}</h4>
        <p class="session-speaker">{{ session.speaker }}, {{ session.speakerTitle }}</p>
        <p class="session-time">{{ formatTimeRange(session.date, session.endDate) }}</p>

        <div class="capacity-bar">
          <div
            class="capacity-fill"
            :class="capacityBarClass(session)"
            :style="{ width: capacityBarWidth(session) }"
          />
        </div>

        <div class="card-footer">
          <p class="spots-text" :class="spotsInfo(session).cls">{{ spotsInfo(session).text }}</p>
          <span v-if="conflictingSessionIds.has(session.id)" class="conflict-badge">Time conflict</span>
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
  margin: 0 0 20px;
}

// Alert
.alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: var(--font-size-sm);
  margin-bottom: 20px;

  &--danger {
    background: var(--bg-danger-subtle-rest);
    color: var(--text-danger-default);
    border: 1px solid var(--border-danger-muted);
  }
}

// Date tabs
.date-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.date-tab {
  padding: 7px 20px;
  border-radius: 20px;
  font-size: var(--font-size-sm);
  font-weight: 610;
  border: 1.5px solid var(--border-neutral-muted);
  background: var(--bg-surface-l0);
  color: var(--text-neutral-muted);
  cursor: pointer;
  transition: all 0.15s;

  &--active {
    background: var(--bg-brand-emphasis-rest);
    color: white;
    border-color: var(--bg-brand-emphasis-rest);
  }

  &:hover:not(.date-tab--active) {
    background: var(--bg-neutral-subtle-hover);
    border-color: var(--border-neutral-emphasis);
  }
}

.selection-count {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-muted);
  margin: 0 0 16px;
}

// 2-column grid
.sessions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.session-card {
  border: 1.5px solid var(--border-neutral-muted);
  border-radius: 10px;
  padding: 16px;
  background: var(--bg-surface-l0);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;

  &:hover:not(.session-card--full) {
    border-color: var(--border-brand-muted);
    background: var(--bg-brand-quiet-hover);
  }

  &--selected {
    border-color: var(--border-brand-emphasis);
    background: var(--bg-brand-subtle-rest);
    box-shadow: 0 0 0 3px var(--border-brand-opacity);

    &:hover {
      border-color: var(--border-brand-emphasis);
      background: var(--bg-brand-subtle-hover);
    }
  }

  &--full {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--bg-surface-l1);

    &:hover {
      border-color: var(--border-neutral-muted);
      background: var(--bg-surface-l1);
    }
  }

  &--conflict:not(.session-card--full) {
    border-color: var(--border-warning-muted);
    background: var(--bg-warning-subtle-rest);
  }
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.track-badge {
  font-size: 10px;
  font-weight: 630;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;

  &.track-main {
    background: var(--bg-brand-emphasis-rest);
    color: white;
  }

  &.track-frontend {
    background: var(--bg-accent-emphasis-rest);
    color: white;
  }

  &.track-backend {
    background: var(--bg-info-muted-rest);
    color: var(--text-info-emphasis);
    border: 1px solid var(--border-info-muted);
  }

  &.track-devops {
    background: var(--bg-warning-muted-rest);
    color: var(--text-warning-emphasis);
    border: 1px solid var(--border-warning-muted);
  }
}

.card-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1.5px solid var(--border-neutral-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;

  &--checked {
    background: var(--bg-brand-emphasis-rest);
    border-color: var(--bg-brand-emphasis-rest);
  }
}

.session-title {
  font-size: var(--font-size-md);
  font-weight: 630;
  color: var(--text-neutral-default);
  margin: 0 0 4px;
  line-height: 1.3;

  .session-card--full & { color: var(--text-neutral-quiet); }
}

.session-speaker {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-muted);
  margin: 0 0 4px;

  .session-card--full & { color: var(--text-neutral-quiet); }
}

.session-time {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-quiet);
  margin: 0 0 12px;
}

.capacity-bar {
  height: 4px;
  background: var(--bg-surface-l2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.capacity-fill {
  height: 100%;
  border-radius: 2px;

  &.bar--high   { background: var(--bg-brand-emphasis-rest); }
  &.bar--medium { background: var(--bg-warning-emphasis-rest); }
  &.bar--low    { background: var(--bg-accent-emphasis-rest); }
  &.bar--full   { background: var(--bg-danger-emphasis-rest); }
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spots-text {
  font-size: var(--font-size-sm);
  font-weight: 570;
  margin: 0;

  &.spots--high     { color: var(--text-neutral-muted); }
  &.spots--medium   { color: var(--text-warning-emphasis); }
  &.spots--low      { color: var(--text-accent-default); }
  &.spots--sold-out { color: var(--text-neutral-muted); }
}

.conflict-badge {
  font-size: 11px;
  font-weight: 570;
  color: var(--text-warning-emphasis);
  background: var(--bg-warning-muted-rest);
  padding: 2px 8px;
  border-radius: 4px;
}

@media (max-width: 767px) {
  .step-content { padding: 16px; }
  .sessions-grid { grid-template-columns: 1fr; }
}
</style>
