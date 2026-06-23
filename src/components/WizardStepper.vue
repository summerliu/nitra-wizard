<script setup>
defineProps({
  steps: { type: Array, required: true },
  currentStep: { type: Number, required: true },
  /** @type {(stepNum: number) => boolean} */
  stepHasError: { type: Function, required: true },
})

const emit = defineEmits(['navigate'])
</script>

<template>
  <div class="stepper" role="navigation" aria-label="Registration steps">
    <template v-for="(step, i) in steps" :key="step.id">
      <button
        class="step"
        :class="{
          'step--active': currentStep === step.id,
          'step--done': currentStep > step.id && !stepHasError(step.id),
          'step--error': stepHasError(step.id),
          'step--upcoming': currentStep < step.id,
        }"
        @click="emit('navigate', step.id)"
        type="button"
        :aria-current="currentStep === step.id ? 'step' : undefined"
      >
        <div class="step__circle">
          <svg v-if="currentStep > step.id && !stepHasError(step.id)" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7l3.5 3.5L12 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else-if="stepHasError(step.id)" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 3v5M7 10.5v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span v-else>{{ step.id }}</span>
        </div>
        <span class="step__label">{{ step.label }}</span>
      </button>

      <div v-if="i < steps.length - 1" class="step-connector" :class="{ 'step-connector--done': currentStep > step.id }" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.stepper {
  display: flex;
  align-items: center;
  padding: 20px 0;
  gap: 0;
  overflow-x: auto;
}

.step {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.15s;
  flex-shrink: 0;
  white-space: nowrap;

  &:hover {
    background: var(--bg-neutral-quiet-hover);
  }
}

.step__circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 610;
  flex-shrink: 0;
  transition: all 0.2s;

  .step--upcoming & {
    background: var(--bg-surface-l2);
    color: var(--text-neutral-quiet);
    border: 1.5px solid var(--border-neutral-muted);
  }

  .step--active & {
    background: var(--bg-brand-emphasis-rest);
    color: white;
    border: 1.5px solid var(--bg-brand-emphasis-rest);
    box-shadow: 0 0 0 3px var(--border-brand-opacity);
  }

  .step--done & {
    background: var(--bg-success-subtle-rest);
    color: var(--text-success-default);
    border: 1.5px solid var(--border-success-muted);
  }

  .step--error & {
    background: var(--bg-danger-subtle-rest);
    color: var(--text-danger-default);
    border: 1.5px solid var(--border-danger-emphasis);
  }
}

.step__label {
  font-size: var(--font-size-sm);
  font-weight: 570;

  .step--active & { color: var(--text-brand-emphasis); }
  .step--done & { color: var(--text-neutral-muted); }
  .step--error & { color: var(--text-danger-default); }
  .step--upcoming & { color: var(--text-neutral-quiet); }
}

.step-connector {
  flex: 1;
  height: 1.5px;
  background: var(--border-neutral-muted);
  min-width: 16px;
  max-width: 48px;
  transition: background 0.3s;

  &--done {
    background: var(--border-success-muted);
  }
}

@media (max-width: 600px) {
  .step__label {
    display: none;
  }

  .step-connector {
    min-width: 8px;
    max-width: 24px;
  }
}
</style>
