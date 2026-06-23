<script setup>
import { computed } from 'vue'
import { useRegistration } from '../composables/useRegistration.js'
import { formatCurrency } from '../utils/format.js'

const {
  ticketType,
  ticketPrice,
  isVip,
  workshopDiscount,
  addonTotal,
  grandTotal,
  selectedAddons,
  addons,
  selectedSessionIds,
} = useRegistration()

const lineItems = computed(() => {
  const items = []
  for (const entry of selectedAddons.value) {
    const addon = addons.find(a => a.id === entry.id)
    if (!addon) continue

    let price = addon.price
    const isWorkshop = addon.category === 'workshop'
    if (isWorkshop && isVip.value) price *= 0.9

    const label = entry.size
      ? `${addon.name} (${entry.size})`
      : addon.name

    items.push({
      id: entry.id,
      label,
      qty: entry.quantity,
      unitPrice: price,
      total: price * entry.quantity,
      isDiscounted: isWorkshop && isVip.value,
      originalPrice: isWorkshop && isVip.value ? addon.price : null,
    })
  }
  return items
})
</script>

<template>
  <div class="order-summary">
    <h3 class="summary-title">Order Summary</h3>

    <!-- Ticket -->
    <div class="summary-section">
      <div v-if="ticketType" class="line-item">
        <span>{{ ticketType.name }} Ticket</span>
        <span>{{ formatCurrency(ticketPrice) }}</span>
      </div>
      <div v-else class="empty-line">No ticket selected</div>
    </div>

    <!-- Sessions -->
    <div class="summary-section" v-if="selectedSessionIds.length">
      <div class="section-label">Sessions</div>
      <div class="line-item text-sm">
        <span class="text-neutral-muted">{{ selectedSessionIds.length }} session{{ selectedSessionIds.length !== 1 ? 's' : '' }} selected</span>
        <span class="text-neutral-muted">Included</span>
      </div>
    </div>

    <!-- Add-ons -->
    <div class="summary-section" v-if="lineItems.length">
      <div class="section-label">Add-ons</div>
      <div v-for="item in lineItems" :key="item.id" class="line-item text-sm">
        <span>
          {{ item.label }}
          <span v-if="item.qty > 1" class="qty-badge">×{{ item.qty }}</span>
          <span v-if="item.isDiscounted" class="discount-badge">VIP</span>
        </span>
        <span>
          <span v-if="item.isDiscounted" class="original-price">{{ formatCurrency(item.originalPrice * item.qty) }}</span>
          {{ formatCurrency(item.total) }}
        </span>
      </div>
    </div>

    <!-- VIP discount subtotal line -->
    <div v-if="workshopDiscount > 0" class="summary-section">
      <div class="line-item discount-line text-sm">
        <span>Workshop discount (10%)</span>
        <span>-{{ formatCurrency(workshopDiscount) }}</span>
      </div>
    </div>

    <div class="summary-divider" />

    <!-- Total -->
    <div class="total-line">
      <span>Total</span>
      <span>{{ formatCurrency(grandTotal) }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.order-summary {
  background: var(--bg-surface-l0);
  border: 1.5px solid var(--border-neutral-muted);
  border-radius: 12px;
  padding: 20px;
}

.summary-title {
  font-size: var(--font-size-subtitle1);
  font-weight: 610;
  color: var(--text-neutral-default);
  margin: 0 0 16px;
}

.summary-section {
  margin-bottom: 12px;
}

.section-label {
  font-size: var(--font-size-sm);
  font-weight: 610;
  color: var(--text-neutral-quiet);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 6px;
}

.line-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  font-size: var(--font-size-md);
  color: var(--text-neutral-default);
  padding: 3px 0;

  &.text-sm {
    font-size: var(--font-size-sm);
  }

  &.discount-line {
    color: var(--text-success-default);
  }
}

.empty-line {
  font-size: var(--font-size-sm);
  color: var(--text-neutral-quiet);
}

.qty-badge {
  font-size: 11px;
  color: var(--text-neutral-muted);
  margin-left: 4px;
}

.discount-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 610;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--bg-brand-muted-rest);
  color: var(--text-brand-emphasis);
  margin-left: 4px;
  vertical-align: middle;
}

.original-price {
  text-decoration: line-through;
  color: var(--text-neutral-quiet);
  margin-right: 4px;
  font-size: 11px;
}

.summary-divider {
  height: 1px;
  background: var(--divider-default);
  margin: 12px 0;
}

.total-line {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-subtitle1);
  font-weight: 610;
  color: var(--text-neutral-default);
}
</style>
