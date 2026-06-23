<script setup>
/** Reusable increment/decrement quantity control using Vue 3.4 defineModel. */
const model = defineModel({ type: Number, default: 1 })

const props = defineProps({
  min: { type: Number, default: 1 },
  max: { type: Number, default: 99 },
})

function decrement() {
  if (model.value > props.min) model.value--
}
function increment() {
  if (model.value < props.max) model.value++
}
</script>

<template>
  <div class="qty-picker">
    <button class="qty-btn" :disabled="model <= props.min" @click="decrement" type="button">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    <span class="qty-value">{{ model }}</span>
    <button class="qty-btn" :disabled="model >= props.max" @click="increment" type="button">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<style scoped lang="scss">
.qty-picker {
  display: inline-flex;
  align-items: center;
  gap: 0;
  border: 1.5px solid var(--border-neutral-muted);
  border-radius: 8px;
  overflow: hidden;
}

.qty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--bg-surface-l0);
  border: none;
  cursor: pointer;
  color: var(--text-neutral-default);
  transition: background 0.12s;

  &:hover:not(:disabled) {
    background: var(--bg-neutral-subtle-hover);
  }

  &:disabled {
    color: var(--text-neutral-disabled);
    cursor: not-allowed;
  }
}

.qty-value {
  min-width: 36px;
  text-align: center;
  font-size: var(--font-size-md);
  font-weight: 570;
  color: var(--text-neutral-default);
  border-left: 1.5px solid var(--border-neutral-muted);
  border-right: 1.5px solid var(--border-neutral-muted);
  padding: 0 4px;
  line-height: 30px;
}
</style>
