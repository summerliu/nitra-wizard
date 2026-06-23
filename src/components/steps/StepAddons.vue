<script setup>
import { ref, computed } from 'vue'
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

const activeTab = ref('workshop')

const tabs = [
  { key: 'workshop', label: 'Workshops' },
  { key: 'meal', label: 'Meal Packages' },
  { key: 'merchandise', label: 'Merchandise' },
]

const selectedAddonMap = computed(() =>
  Object.fromEntries(selectedAddons.value.map(item => [item.id, item]))
)

function workshopPrice(ws) {
  return isVip.value ? ws.price * 0.9 : ws.price
}

function isWorkshopDisabled(ws) {
  return ws.registered >= ws.capacity || isWorkshopConflicting(ws)
}

function formatWorkshopDate(ws) {
  const d = new Date(ws.date + (ws.date.includes('T') ? '' : 'T00:00:00Z'))
  const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
  const day = d.toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' })
  return `${month} ${day}, ${formatTimeRange(ws.date, ws.endDate)}`
}

function spotsLabel(ws) {
  const remaining = ws.capacity - ws.registered
  if (remaining <= 0) return null
  return `${remaining} spot${remaining !== 1 ? 's' : ''} remaining`
}
</script>

<template>
  <div class="step-content">
    <h2 class="step-title">Select Add-ons</h2>
    <p class="step-subtitle">Enhance your experience with workshops, meals, and merchandise.</p>

    <!-- Category tabs -->
    <div class="category-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="category-tab"
        :class="{ 'category-tab--active': activeTab === tab.key }"
        type="button"
        @click="activeTab = tab.key"
      >{{ tab.label }}</button>
    </div>

    <!-- ── Workshops ── -->
    <div v-if="activeTab === 'workshop'" class="addon-list">
      <div v-if="isVip" class="vip-notice">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0">
          <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.5"/>
          <path d="M7 4v4M7 9.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        VIP discount: 10% off all workshops
      </div>

      <div
        v-for="ws in addonsByCategory.workshop"
        :key="ws.id"
        class="addon-card"
        :class="{
          'addon-card--selected': isAddonSelected(ws.id),
          'addon-card--disabled': isWorkshopDisabled(ws),
        }"
        @click="!isWorkshopDisabled(ws) && toggleAddon(ws.id)"
      >
        <div class="addon-row-top">
          <h4 class="addon-name">{{ ws.name }}</h4>
          <div class="addon-price-group">
            <span v-if="isVip" class="price-original">{{ formatCurrency(ws.price) }}</span>
            <span class="addon-price">{{ formatCurrency(workshopPrice(ws)) }}</span>
          </div>
        </div>
        <p class="addon-desc">{{ ws.description }}</p>
        <p class="addon-meta">{{ formatWorkshopDate(ws) }}</p>
        <p v-if="ws.registered >= ws.capacity" class="sold-out-text">Sold Out</p>
        <p v-else-if="isWorkshopConflicting(ws)" class="conflict-text">Conflicts with a selected session</p>
        <p v-else class="spots-text">{{ spotsLabel(ws) }}</p>
      </div>
    </div>

    <!-- ── Meal Packages ── -->
    <div v-else-if="activeTab === 'meal'" class="addon-list">
      <div
        v-for="meal in addonsByCategory.meal"
        :key="meal.id"
        class="addon-card"
        :class="{ 'addon-card--selected': isAddonSelected(meal.id) }"
        @click="toggleAddon(meal.id)"
      >
        <div class="addon-row-top">
          <h4 class="addon-name">{{ meal.name }}</h4>
          <span class="addon-price">{{ formatCurrency(meal.price) }}</span>
        </div>
        <p class="addon-desc">{{ meal.description }}</p>
      </div>
    </div>

    <!-- ── Merchandise ── -->
    <div v-else-if="activeTab === 'merchandise'" class="addon-list">
      <div v-if="hasMerchandise" class="shipping-notice">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0">
          <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.5"/>
          <path d="M7 6v4M7 4v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        Merchandise items will be shipped to your address one week before the conference. Please ensure your shipping address in Step 1 is correct.
      </div>

      <div
        v-for="item in addonsByCategory.merchandise"
        :key="item.id"
        class="addon-card"
        :class="{ 'addon-card--selected': isAddonSelected(item.id) }"
        @click="!isAddonSelected(item.id) && toggleAddon(item.id)"
      >
        <div class="addon-row-top">
          <h4 class="addon-name">{{ item.name }}</h4>
          <span class="addon-price">{{ formatCurrency(item.price) }}</span>
        </div>
        <p class="addon-desc">{{ item.description }}</p>

        <template v-if="isAddonSelected(item.id)">
          <!-- Size selector -->
          <div v-if="item.sizes" class="merch-controls">
            <div class="control-row">
              <label class="control-label">Size</label>
              <div class="size-options">
                <button
                  v-for="size in item.sizes"
                  :key="size"
                  class="size-btn"
                  :class="{ 'size-btn--active': selectedAddonMap[item.id]?.size === size }"
                  type="button"
                  @click.stop="updateAddon(item.id, { size })"
                >{{ size }}</button>
              </div>
            </div>
            <p v-if="props.validationAttempted && step3Errors[item.id]" class="field-error">{{ step3Errors[item.id] }}</p>
          </div>

          <!-- Quantity + remove -->
          <div class="merch-controls">
            <div class="control-row">
              <label class="control-label">Quantity</label>
              <QuantityPicker
                :model-value="selectedAddonMap[item.id]?.quantity ?? 1"
                :max="item.maxQuantity"
                @update:model-value="updateAddon(item.id, { quantity: $event })"
              />
              <span class="qty-subtotal">= {{ formatCurrency((selectedAddonMap[item.id]?.quantity ?? 1) * item.price) }}</span>
            </div>
            <button class="btn-remove" type="button" @click.stop="toggleAddon(item.id)">Remove</button>
          </div>
        </template>
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
  margin: 0 0 20px;
}

// Category tabs
.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.category-tab {
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

  &:hover:not(.category-tab--active) {
    background: var(--bg-neutral-subtle-hover);
    border-color: var(--border-neutral-emphasis);
  }
}

// Notices
.vip-notice,
.shipping-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: var(--font-size-sm);
  margin-bottom: 14px;
}

.vip-notice {
  background: var(--bg-brand-subtle-rest);
  color: var(--text-brand-emphasis);
  border: 1px solid var(--border-brand-quiet);
}

.shipping-notice {
  background: var(--bg-info-muted-rest);
  color: var(--text-info-emphasis);
  border: 1px solid var(--border-info-muted);
}

// Add-on list + cards
.addon-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.addon-card {
  border: 1.5px solid var(--border-neutral-muted);
  border-radius: 10px;
  padding: 16px;
  background: var(--bg-surface-l0);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;

  &:hover:not(.addon-card--disabled) {
    border-color: var(--border-brand-muted);
    background: var(--bg-brand-quiet-hover);
  }

  &--selected {
    border-color: var(--border-brand-emphasis);
    background: var(--bg-brand-subtle-rest);
    box-shadow: 0 0 0 3px var(--border-brand-opacity);

    &:hover { background: var(--bg-brand-subtle-hover); }
  }

  &--disabled {
    opacity: 0.55;
    cursor: not-allowed;
    background: var(--bg-surface-l1);

    &:hover {
      border-color: var(--border-neutral-muted);
      background: var(--bg-surface-l1);
    }
  }
}

.addon-row-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 6px;
}

.addon-name {
  font-size: var(--font-size-md);
  font-weight: 630;
  color: var(--text-neutral-default);
  margin: 0;

  .addon-card--disabled & { color: var(--text-neutral-quiet); }
}

.addon-price-group {
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
  font-weight: 630;
  color: var(--text-neutral-default);
  white-space: nowrap;
  flex-shrink: 0;

  .addon-card--disabled & { color: var(--text-neutral-quiet); }
}

.addon-desc {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-muted);
  margin: 0 0 4px;
  line-height: 1.4;

  .addon-card--disabled & { color: var(--text-neutral-quiet); }
}

.addon-meta {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-quiet);
  margin: 0 0 4px;
}

.sold-out-text {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-muted);
  font-weight: 570;
  margin: 0;
}

.conflict-text {
  font-size: var(--font-size-sm);
  color: var(--text-warning-emphasis);
  font-weight: 570;
  margin: 0;
}

.spots-text {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-quiet);
  margin: 0;
}

// Merchandise controls
.merch-controls {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.control-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.control-label {
  font-size: var(--font-size-sm);
  font-weight: 570;
  color: var(--text-neutral-muted);
  min-width: 52px;
}

.size-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
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

.qty-subtotal {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-muted);
}

.btn-remove {
  margin-top: 10px;
  padding: 5px 14px;
  border-radius: 6px;
  font-size: var(--font-size-sm);
  font-weight: 570;
  border: 1.5px solid var(--border-danger-muted);
  background: transparent;
  color: var(--text-danger-default);
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: var(--bg-danger-subtle-rest); }
}

.field-error {
  font-size: var(--font-size-sm);
  color: var(--text-danger-default);
  margin: 4px 0 0;
}

@media (max-width: 767px) {
  .step-content { padding: 16px; }
  .category-tabs { flex-wrap: wrap; }
}
</style>
