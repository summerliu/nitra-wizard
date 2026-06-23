<script setup>
import { computed } from 'vue'
import { useRegistration } from '../../composables/useRegistration.js'
import { useValidation } from '../../composables/useValidation.js'
import { formatDate, formatTimeRange } from '../../utils/format.js'

const props = defineProps({
  validationAttempted: { type: Boolean, default: false },
})

const {
  sessionsByDate,
  selectedSessionIds,
  conflictingSessionIds,
  toggleSession,
  sessions,
} = useRegistration()

const { step2Errors } = useValidation()

const TRACK_CLASSES = {
  main: 'track-main',
  frontend: 'track-frontend',
  backend: 'track-backend',
  devops: 'track-devops',
}

/**
 * Compute the remaining capacity label for a session.
 * @param {{ capacity: number, registered: number }} session
 * @returns {{ text: string, urgent: boolean }}
 */
function spotsInfo(session) {
  const remaining = session.capacity - session.registered
  return {
    text: remaining <= 0 ? 'Full' : remaining === 1 ? '1 spot left' : `${remaining} spots left`,
    urgent: remaining > 0 && remaining <= 10,
  }
}
</script>

<template>
  <div class="step-content">
    <h2 class="step-title">Session Selection</h2>
    <p class="step-subtitle">Choose sessions to attend. Time conflicts will be flagged at submission.</p>

    <!-- Conflict warning -->
    <div v-if="props.validationAttempted && step2Errors.conflicts" class="alert alert--danger">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
        <path d="M8 5v4M8 11v.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
      </svg>
      {{ step2Errors.conflicts }}
    </div>

    <!-- Sessions by day -->
    <div v-for="([date, daySessions]) in sessionsByDate" :key="date" class="day-group">
      <div class="day-header">
        <h3 class="day-title">{{ formatDate(date) }}</h3>
        <span class="day-count">{{ daySessions.length }} sessions</span>
      </div>

      <div class="sessions-grid">
        <div
          v-for="session in daySessions"
          :key="session.id"
          class="session-card"
          :class="{
            'session-card--selected': selectedSessionIds.includes(session.id),
            'session-card--full': session.registered >= session.capacity,
            'session-card--conflict': conflictingSessionIds.has(session.id),
          }"
          @click="session.registered < session.capacity && toggleSession(session.id)"
          :style="session.registered >= session.capacity ? 'cursor: not-allowed' : 'cursor: pointer'"
          :aria-disabled="session.registered >= session.capacity"
        >
          <div class="session-meta">
            <span class="track-badge" :class="TRACK_CLASSES[session.track]">
              {{ session.track }}
            </span>
            <span class="session-time">{{ formatTimeRange(session.date, session.endDate) }}</span>
          </div>

          <h4 class="session-title">{{ session.title }}</h4>
          <p class="session-speaker">{{ session.speaker }} · {{ session.speakerTitle }}</p>

          <div class="session-footer">
            <div class="spots-info">
              <span
                v-if="session.registered >= session.capacity"
                class="full-badge"
              >Full</span>
              <span
                v-else
                class="spots-text"
                :class="{ 'spots-text--urgent': spotsInfo(session).urgent }"
              >{{ spotsInfo(session).text }}</span>
            </div>

            <div v-if="conflictingSessionIds.has(session.id)" class="conflict-badge">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v5M6 9v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              Time conflict
            </div>

            <button
              v-if="session.registered < session.capacity"
              class="select-btn"
              :class="{ 'select-btn--selected': selectedSessionIds.includes(session.id) }"
              type="button"
              @click.stop="toggleSession(session.id)"
            >
              <svg v-if="selectedSessionIds.includes(session.id)" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ selectedSessionIds.includes(session.id) ? 'Selected' : 'Select' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-if="selectedSessionIds.length === 0" class="no-selection-hint">
      No sessions selected yet. Select at least one session to attend.
    </p>
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
  margin: 0 0 20px;
}

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

.day-group {
  margin-bottom: 28px;

  &:last-child { margin-bottom: 0; }
}

.day-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0,0,0,0.07);
}

.day-title {
  font-size: var(--font-size-subtitle1);
  font-weight: 610;
  color: var(--text-neutral-default);
  margin: 0;
}

.day-count {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-quiet);
}

.sessions-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.session-card {
  border: 1.5px solid var(--border-neutral-muted);
  border-radius: 10px;
  padding: 14px 16px;
  background: var(--bg-surface-l0);
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  position: relative;

  &:hover:not(.session-card--full) {
    border-color: var(--border-brand-muted);
    background: var(--bg-brand-quiet-hover);
  }

  &--selected {
    border-color: var(--border-brand-emphasis);
    background: var(--bg-brand-subtle-rest);

    &:hover {
      border-color: var(--border-brand-emphasis);
      background: var(--bg-brand-subtle-hover);
    }
  }

  &--full {
    background: var(--bg-surface-l1);
    opacity: 0.65;
  }

  &--conflict {
    border-color: var(--border-warning-muted);
    background: var(--bg-warning-subtle-rest);

    &.session-card--selected {
      border-color: var(--border-warning-emphasis);
    }
  }
}

.session-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.track-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 610;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: capitalize;
  border: 1px solid;

  &.track-main {
    background: var(--bg-brand-muted-rest);
    color: var(--text-brand-emphasis);
    border-color: var(--border-brand-muted);
  }
  &.track-frontend {
    background: var(--bg-info-muted-rest);
    color: var(--text-info-emphasis);
    border-color: var(--border-info-muted);
  }
  &.track-backend {
    background: var(--bg-accent-muted-rest);
    color: var(--text-accent-emphasis);
    border-color: var(--border-accent-muted);
  }
  &.track-devops {
    background: var(--bg-success-muted-rest);
    color: var(--text-success-emphasis);
    border-color: var(--border-success-muted);
  }
}

.session-time {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-muted);
}

.session-title {
  font-size: var(--font-size-md);
  font-weight: 610;
  color: var(--text-neutral-default);
  margin: 0 0 4px;
}

.session-speaker {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-muted);
  margin: 0 0 10px;
}

.session-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.spots-info { flex: 1; }

.full-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 610;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--bg-neutral-muted-rest);
  color: var(--text-neutral-muted);
}

.spots-text {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-muted);

  &--urgent { color: var(--text-warning-emphasis); font-weight: 570; }
}

.conflict-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 570;
  color: var(--text-warning-emphasis);
  background: var(--bg-warning-muted-rest);
  padding: 2px 8px;
  border-radius: 4px;
}

.select-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: var(--font-size-sm);
  font-weight: 570;
  border: 1.5px solid var(--border-neutral-muted);
  background: var(--bg-surface-l0);
  color: var(--text-neutral-default);
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(.select-btn--selected) {
    border-color: var(--border-brand-emphasis);
    color: var(--text-brand-emphasis);
    background: var(--bg-brand-subtle-rest);
  }

  &--selected {
    background: var(--bg-brand-emphasis-rest);
    border-color: var(--bg-brand-emphasis-rest);
    color: white;

    &:hover {
      background: var(--bg-brand-emphasis-hover);
    }
  }
}

.no-selection-hint {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-quiet);
  text-align: center;
  padding: 20px;
  border: 1px dashed var(--border-neutral-muted);
  border-radius: 8px;
  margin-top: 16px;
}

@media (max-width: 767px) {
  .step-content { padding: 16px; }
}
</style>
