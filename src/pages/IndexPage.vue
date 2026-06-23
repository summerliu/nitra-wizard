<script setup>
import { ref, computed } from 'vue'
import { useValidation } from '../composables/useValidation.js'
import WizardStepper from '../components/WizardStepper.vue'
import OrderSummary from '../components/OrderSummary.vue'
import StepAttendeeInfo from '../components/steps/StepAttendeeInfo.vue'
import StepSessionSelect from '../components/steps/StepSessionSelect.vue'
import StepAddons from '../components/steps/StepAddons.vue'
import StepReview from '../components/steps/StepReview.vue'
import SuccessScreen from '../components/SuccessScreen.vue'

const currentStep = ref(1)
const submitted = ref(false)
const validationAttempted = ref(false)
const direction = ref('forward')

const { hasStep1Errors, hasStep2Errors, hasStep3Errors, hasAnyErrors } = useValidation()

const steps = [
  { id: 1, label: 'Attendee Info' },
  { id: 2, label: 'Session Selection' },
  { id: 3, label: 'Add-ons' },
  { id: 4, label: 'Review & Submit' },
]

/**
 * Navigate to a specific step, tracking direction for transition animation.
 * @param {number} step
 */
function goToStep(step) {
  direction.value = step > currentStep.value ? 'forward' : 'back'
  currentStep.value = step
}

function nextStep() {
  goToStep(Math.min(currentStep.value + 1, 4))
}

function prevStep() {
  goToStep(Math.max(currentStep.value - 1, 1))
}

/**
 * Validate all steps. On success, show the success screen.
 * On failure, stay on Step 4 so the error summary is visible — the user
 * clicks the per-step "Edit" links in the summary to jump to the offending step.
 */
function handleSubmit() {
  validationAttempted.value = true
  if (!hasAnyErrors.value) {
    submitted.value = true
  }
  // Errors are shown inline in StepReview via the error-summary block.
}

/**
 * @param {number} stepNum
 * @returns {boolean}
 */
function stepHasError(stepNum) {
  if (!validationAttempted.value) return false
  if (stepNum === 1) return hasStep1Errors.value
  if (stepNum === 2) return hasStep2Errors.value
  if (stepNum === 3) return hasStep3Errors.value
  return false
}

const transitionName = computed(() => direction.value === 'forward' ? 'slide-left' : 'slide-right')

const continueLabel = computed(() => {
  const labels = { 1: 'Next: Sessions', 2: 'Next: Add-ons', 3: 'Next: Review' }
  return labels[currentStep.value] ?? 'Continue'
})
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page>
        <div class="wizard-layout">
          <!-- Event header (always visible) -->
          <header class="event-header">
            <img src="../assets/Logo.svg" alt="Nitra logo" class="header-logo" />
            <span class="event-title">WebDev Summit 2028</span>
          </header>

          <!-- Success screen -->
          <SuccessScreen v-if="submitted" />

          <!-- Wizard steps -->
          <template v-else>
            <!-- Step navigation -->
            <div class="stepper-bar">
              <div class="container">
                <WizardStepper
                  :steps="steps"
                  :current-step="currentStep"
                  :step-has-error="stepHasError"
                  @navigate="goToStep"
                />
              </div>
            </div>

            <!-- Body: step content + sidebar -->
            <main class="wizard-body">
              <div class="container">
                <div class="wizard-columns">
                  <!-- Main step content -->
                  <div class="wizard-main">
                    <Transition :name="transitionName" mode="out-in">
                      <StepAttendeeInfo
                        v-if="currentStep === 1"
                        key="step-1"
                        :validation-attempted="validationAttempted"
                      />
                      <StepSessionSelect
                        v-else-if="currentStep === 2"
                        key="step-2"
                        :validation-attempted="validationAttempted"
                      />
                      <StepAddons
                        v-else-if="currentStep === 3"
                        key="step-3"
                        :validation-attempted="validationAttempted"
                      />
                      <StepReview
                        v-else-if="currentStep === 4"
                        key="step-4"
                        :validation-attempted="validationAttempted"
                        @edit="goToStep"
                        @submit="handleSubmit"
                      />
                    </Transition>
                  </div>

                  <!-- Order summary sidebar (hidden on review step) -->
                  <aside v-if="currentStep < 4" class="wizard-sidebar">
                    <div class="sidebar-sticky">
                      <OrderSummary />
                    </div>
                  </aside>
                </div>
              </div>
            </main>

            <!-- Navigation footer -->
            <footer class="wizard-footer">
              <div class="container">
                <div class="nav-bar">
                  <button
                    v-if="currentStep > 1"
                    class="btn btn--secondary"
                    type="button"
                    @click="prevStep"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9 2L3 7l6 5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Back
                  </button>
                  <span v-else />

                  <div class="nav-center">
                    <span class="step-indicator">Step {{ currentStep }} of {{ steps.length }}</span>
                  </div>

                  <button
                    v-if="currentStep < 4"
                    class="btn btn--primary"
                    type="button"
                    @click="nextStep"
                  >
                    {{ continueLabel }}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 2l6 5-6 5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button
                    v-else
                    class="btn btn--primary"
                    type="button"
                    @click="handleSubmit"
                  >
                    Submit Registration
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 2l6 5-6 5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </footer>
          </template>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="scss">
.wizard-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface-l1);
}

.container {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
  box-sizing: border-box;
}

// Header
.event-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px 48px;
  gap: 12px;
  height: 72px;
  background: var(--bg-surface-l0);
  border-bottom: 1px solid var(--divider-default);
  box-sizing: border-box;
  flex-shrink: 0;
}

.header-logo {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: block;
}

.event-title {
  font-size: var(--font-size-subtitle1);
  font-weight: 630;
  color: var(--text-neutral-default);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: auto;
}

// Stepper bar
.stepper-bar {
  background: var(--bg-surface-l0);
  border-bottom: 1px solid var(--divider-muted);
  flex-shrink: 0;
}

// Body
.wizard-body {
  flex: 1;
  padding: 24px 0 32px;
}

.wizard-columns {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.wizard-main {
  flex: 1;
  min-width: 0;
}

.wizard-sidebar {
  width: 288px;
  flex-shrink: 0;
}

.sidebar-sticky {
  position: sticky;
  top: 24px;
}

// Footer
.wizard-footer {
  background: var(--bg-surface-l0);
  border-top: 1px solid var(--divider-muted);
  padding: 16px 0;
  flex-shrink: 0;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-center {
  flex: 1;
  text-align: center;
}

.step-indicator {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-quiet);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: var(--font-size-md);
  font-weight: 570;
  border: none;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &--primary {
    background: var(--bg-accent-emphasis-rest);
    color: white;

    &:hover { background: var(--bg-accent-emphasis-hover); }
    &:active { background: var(--bg-accent-emphasis-active); }
  }

  &--secondary {
    background: transparent;
    border: 1.5px solid var(--border-neutral-muted);
    color: var(--text-neutral-default);

    &:hover {
      background: var(--bg-neutral-subtle-hover);
      border-color: var(--border-neutral-emphasis);
    }
  }
}

// Transitions
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.22s ease;
}

.slide-left-enter-from { opacity: 0; transform: translateX(18px); }
.slide-left-leave-to  { opacity: 0; transform: translateX(-18px); }
.slide-right-enter-from { opacity: 0; transform: translateX(-18px); }
.slide-right-leave-to  { opacity: 0; transform: translateX(18px); }

// Responsive
@media (max-width: 900px) {
  .wizard-sidebar { display: none; }
}

@media (max-width: 600px) {
  .container { padding: 0 16px; }
  .event-header { padding: 12px 16px; height: auto; }
  .event-badge { display: none; }
  .nav-center { display: none; }
}
</style>
