<script setup>
import { computed } from 'vue'
import { useRegistration } from '../../composables/useRegistration.js'
import { useValidation } from '../../composables/useValidation.js'
import { formatCurrency, formatTimeRange } from '../../utils/format.js'
import QuantityPicker from '../QuantityPicker.vue'

const props = defineProps({
  validationAttempted: { type: Boolean, default: false },
})

const {
  addonsByCategory,
  isVip,
  hasMerchandise,
  isWorkshopConflicting,
  isAddonSelected,
  toggleAddon,
  updateAddon,
  selectedAddons,
} = useRegistration()

const { step3Errors } = useValidation()

/** Fast lookup for selected addon items by ID. */
const selectedAddonMap = computed(() =>
  Object.fromEntries(selectedAddons.value.map(item => [item.id, item]))
)

/**
 * Return workshop pricing label, factoring in VIP discount.
 * @param {{ price: number }} workshop
 * @returns {{ original: number, discounted: number | null }}
 */
function workshopPricing(workshop) {
  return {
    original: workshop.price,
    discounted: isVip.value ? workshop.price * 0.9 : null,
  }
}
</script>

<template>
  <div class="step-content">
    <h2 class="step-title">Add-ons</h2>
    <p class="step-subtitle">Enhance your experience with workshops, meals, and merchandise.</p>

    <!-- Merchandise shipping banner -->
    <div v-if="hasMerchandise" class="info-banner">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
        <path d="M8 7v5M8 5v.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
      </svg>
      Merchandise items will be shipped to your address one week before the conference. Please ensure your shipping address in Step 1 is correct.
    </div>

    <!-- ── Workshops ── -->
    <section class="addon-section">
      <div class="section-header">
        <h3 class="section-title">Workshops</h3>
        <span v-if="isVip" class="vip-badge">VIP: 10% off all workshops</span>
      </div>

      <div class="addon-grid">
        <div
          v-for="ws in addonsByCategory.workshop"
          :key="ws.id"
          class="addon-card"
          :class="{
            'addon-card--selected': isAddonSelected(ws.id),
            'addon-card--disabled': ws.registered >= ws.capacity || isWorkshopConflicting(ws),
          }"
        >
          <div class="addon-body">
            <div class="addon-header">
              <div>
                <h4 class="addon-name">{{ ws.name }}</h4>
                <p class="addon-desc">{{ ws.description }}</p>
                <p class="addon-time">{{ formatTimeRange(ws.date, ws.endDate) }}</p>
              </div>
              <div class="addon-price-block">
                <span v-if="workshopPricing(ws).discounted" class="price-original">
                  {{ formatCurrency(workshopPricing(ws).original) }}
                </span>
                <span class="addon-price">
                  {{ formatCurrency(workshopPricing(ws).discounted ?? workshopPricing(ws).original) }}
                </span>
              </div>
            </div>

            <div class="addon-status">
              <span v-if="ws.registered >= ws.capacity" class="status-badge status-badge--full">
                Full ({{ ws.capacity }}/{{ ws.capacity }})
              </span>
              <span v-else-if="isWorkshopConflicting(ws)" class="status-badge status-badge--conflict">
                Conflicts with a selected session
              </span>
              <span v-else class="spots-text">
                {{ ws.capacity - ws.registered }} spot{{ ws.capacity - ws.registered !== 1 ? 's' : '' }} left
              </span>
            </div>
          </div>

          <div class="addon-actions">
            <button
              v-if="!isAddonSelected(ws.id)"
              class="btn-add"
              :disabled="ws.registered >= ws.capacity || isWorkshopConflicting(ws)"
              type="button"
              @click="toggleAddon(ws.id)"
            >Add</button>
            <button
              v-else
              class="btn-remove"
              type="button"
              @click="toggleAddon(ws.id)"
            >Remove</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Meal Packages ── -->
    <section class="addon-section">
      <h3 class="section-title">Meal Packages</h3>

      <div class="addon-grid">
        <div
          v-for="meal in addonsByCategory.meal"
          :key="meal.id"
          class="addon-card addon-card--row"
          :class="{ 'addon-card--selected': isAddonSelected(meal.id) }"
          @click="toggleAddon(meal.id)"
          style="cursor: pointer"
        >
          <div class="addon-body">
            <div class="addon-header">
              <div>
                <h4 class="addon-name">{{ meal.name }}</h4>
                <p class="addon-desc">{{ meal.description }}</p>
              </div>
              <span class="addon-price">{{ formatCurrency(meal.price) }}</span>
            </div>
          </div>
          <div class="addon-actions">
            <div class="check-toggle" :class="{ active: isAddonSelected(meal.id) }">
              <svg v-if="isAddonSelected(meal.id)" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l3.5 3.5L12 3" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Merchandise ── -->
    <section class="addon-section">
      <h3 class="section-title">Merchandise</h3>

      <div class="addon-grid">
        <div
          v-for="item in addonsByCategory.merchandise"
          :key="item.id"
          class="addon-card"
          :class="{ 'addon-card--selected': isAddonSelected(item.id) }"
        >
          <div class="addon-body">
            <div class="addon-header">
              <div>
                <h4 class="addon-name">{{ item.name }}</h4>
                <p class="addon-desc">{{ item.description }}</p>
              </div>
              <span class="addon-price">{{ formatCurrency(item.price) }}</span>
            </div>

            <!-- Size selector -->
            <div v-if="isAddonSelected(item.id) && item.sizes" class="size-selector">
              <label class="control-label">Size</label>
              <div class="size-options">
                <button
                  v-for="size in item.sizes"
                  :key="size"
                  class="size-btn"
                  :class="{ 'size-btn--active': selectedAddonMap[item.id]?.size === size }"
                  type="button"
                  @click="updateAddon(item.id, { size })"
                >{{ size }}</button>
              </div>
              <p
                v-if="props.validationAttempted && step3Errors[item.id]"
                class="field-error"
              >{{ step3Errors[item.id] }}</p>
            </div>

            <!-- Quantity picker -->
            <div v-if="isAddonSelected(item.id)" class="qty-row">
              <label class="control-label">Quantity</label>
              <QuantityPicker
                :model-value="selectedAddonMap[item.id]?.quantity ?? 1"
                :max="item.maxQuantity"
                @update:model-value="updateAddon(item.id, { quantity: $event })"
              />
              <span class="qty-subtotal">
                = {{ formatCurrency((selectedAddonMap[item.id]?.quantity ?? 1) * item.price) }}
              </span>
            </div>
          </div>

          <div class="addon-actions">
            <button
              v-if="!isAddonSelected(item.id)"
              class="btn-add"
              type="button"
              @click="toggleAddon(item.id)"
            >Add</button>
            <button
              v-else
              class="btn-remove"
              type="button"
              @click="toggleAddon(item.id)"
            >Remove</button>
          </div>
        </div>
      </div>
    </section>
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

.info-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: var(--bg-info-muted-rest);
  border: 1px solid var(--border-info-muted);
  border-radius: 8px;
  font-size: var(--font-size-sm);
  color: var(--text-info-emphasis);
  margin-bottom: 20px;

  svg { flex-shrink: 0; margin-top: 1px; }
}

.addon-section {
  margin-bottom: 28px;

  &:last-child { margin-bottom: 0; }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.section-title {
  font-size: var(--font-size-subtitle1);
  font-weight: 610;
  color: var(--text-neutral-default);
  margin: 0 0 14px;
}

.section-header .section-title { margin-bottom: 0; }

.vip-badge {
  font-size: 11px;
  font-weight: 610;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--bg-brand-muted-rest);
  color: var(--text-brand-emphasis);
}

.addon-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.addon-card {
  display: flex;
  align-items: stretch;
  border: 1.5px solid var(--border-neutral-muted);
  border-radius: 10px;
  background: var(--bg-surface-l0);
  overflow: hidden;
  transition: border-color 0.15s, background 0.15s;

  &:hover:not(.addon-card--disabled) {
    border-color: var(--border-brand-muted);
  }

  &--selected {
    border-color: var(--border-brand-emphasis);
    background: var(--bg-brand-subtle-rest);
  }

  &--disabled {
    background: var(--bg-surface-l1);
    opacity: 0.55;
  }

  &--row {
    &:hover { background: var(--bg-brand-quiet-hover); }
  }
}

.addon-body {
  flex: 1;
  padding: 14px 16px;
}

.addon-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.addon-name {
  font-size: var(--font-size-md);
  font-weight: 610;
  color: var(--text-neutral-default);
  margin: 0 0 4px;
}

.addon-desc {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-muted);
  margin: 0;
  line-height: 1.4;
}

.addon-time {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-quiet);
  margin: 4px 0 0;
}

.addon-price-block {
  text-align: right;
  flex-shrink: 0;
}

.price-original {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-neutral-quiet);
  text-decoration: line-through;
}

.addon-price {
  font-size: var(--font-size-subtitle2);
  font-weight: 610;
  color: var(--text-neutral-default);
  white-space: nowrap;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 2px;
}

.addon-status {
  margin-top: 6px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 570;
  padding: 2px 8px;
  border-radius: 4px;

  &--full {
    background: var(--bg-neutral-muted-rest);
    color: var(--text-neutral-muted);
  }

  &--conflict {
    background: var(--bg-warning-subtle-rest);
    color: var(--text-warning-emphasis);
  }
}

.spots-text {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-quiet);
}

.addon-actions {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 14px 14px 14px 8px;
  border-left: 1px solid rgba(0,0,0,0.06);
  flex-shrink: 0;
}

.btn-add {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: var(--font-size-sm);
  font-weight: 570;
  border: 1.5px solid var(--border-brand-emphasis);
  background: transparent;
  color: var(--text-brand-default);
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: var(--bg-brand-subtle-rest);
  }

  &:disabled {
    border-color: var(--border-neutral-muted);
    color: var(--text-neutral-disabled);
    cursor: not-allowed;
  }
}

.btn-remove {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: var(--font-size-sm);
  font-weight: 570;
  border: 1.5px solid var(--border-danger-muted);
  background: transparent;
  color: var(--text-danger-default);
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--bg-danger-subtle-rest);
  }
}

.check-toggle {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid var(--border-neutral-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &.active {
    background: var(--bg-brand-emphasis-rest);
    border-color: var(--bg-brand-emphasis-rest);
  }
}

.size-selector {
  margin-top: 10px;
}

.control-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 570;
  color: var(--text-neutral-muted);
  margin-bottom: 6px;
}

.size-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
}

.size-btn {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: var(--font-size-sm);
  font-weight: 570;
  border: 1.5px solid var(--border-neutral-muted);
  background: var(--bg-surface-l0);
  color: var(--text-neutral-muted);
  cursor: pointer;
  transition: all 0.12s;

  &:hover { border-color: var(--border-brand-muted); color: var(--text-brand-default); }

  &--active {
    border-color: var(--border-brand-emphasis);
    background: var(--bg-brand-subtle-rest);
    color: var(--text-brand-emphasis);
  }
}

.qty-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;

  .control-label { margin-bottom: 0; }
}

.qty-subtotal {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-muted);
}

.field-error {
  font-size: var(--font-size-sm);
  color: var(--text-danger-default);
  margin-top: 4px;
}

@media (max-width: 767px) {
  .step-content { padding: 16px; }
}
</style>
