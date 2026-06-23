# PLAN.md — Event Registration Wizard

## How I Planned and Broke Down the Task

I started by reading both the spec doc and README in full before writing a line of code. The key insight from that pass was that "validation runs at submit time, not inline" — this shaped the entire architecture decision to keep a `validationAttempted` flag in the top-level orchestrator and pass it down to steps as a prop.

**Breakdown order:**
1. Read all mock data (`sessions.js`, `addons.js`, `event.js`) and understand the business rules (VIP discount, time-conflict detection, capacity, merchandise → shipping)
2. Design the module-level singleton composable (`useRegistration`) as the single source of truth
3. Wire validation as a separate composable (`useValidation`) so it stays pure computed state
4. Build the four steps as isolated components that only read from composables — no prop-drilling of data
5. Wire `IndexPage.vue` as a thin orchestrator: step routing, submit handler, transitions
6. Match each Figma frame using Playwright screenshots for rapid iteration
7. Audit all scoped styles and replace every hardcoded value with a semantic token

---

## File Structure

```
src/
├── assets/
│   ├── Logo.svg              # Nitra brand logo (teal 40×40 rounded square)
│   └── Success Icon.svg      # Green circle checkmark (80×80)
├── components/
│   ├── steps/
│   │   ├── StepAttendeeInfo.vue   # Step 1 — ticket selection + personal details form
│   │   ├── StepSessionSelect.vue  # Step 2 — date-tabbed 2-column session grid
│   │   ├── StepAddons.vue         # Step 3 — category-tabbed workshop/meal/merch cards
│   │   └── StepReview.vue         # Step 4 — label/value section cards, no submit button
│   ├── OrderSummary.vue           # Sticky sidebar (hidden on step 4)
│   ├── QuantityPicker.vue         # Reusable +/− quantity control
│   ├── SuccessScreen.vue          # Full-page success state (no card wrapper)
│   └── WizardStepper.vue          # Step progress indicator
├── composables/
│   ├── useRegistration.js    # Module-level singleton: all form state + derived values
│   └── useValidation.js      # Pure computed validation errors per step
├── css/
│   ├── app.scss              # Entry point — imports colors + typography
│   ├── colors.scss           # Brand CSS vars (--bg-brand-*, --border-brand-*, --text-brand-*)
│   └── typography.scss       # Font size + line height CSS vars (--font-size-*, --line-height-*)
├── pages/
│   └── IndexPage.vue         # Wizard orchestrator: routing, header, footer, layout
├── unocss/
│   ├── colors.js             # Raw color palette (teal, gray, orange, green, red, blue, …)
│   ├── semantic.js           # Semantic token map → generates CSS vars + UnoCSS shortcuts
│   └── index.js              # UnoCSS theme, font config, typography + semantic shortcuts
└── utils/
    └── format.js             # formatCurrency, formatTimeRange
```

---

## Key Architecture Decisions

### Module-level singleton composable
All reactive state (`attendeeInfo`, `ticketTypeId`, `selectedSessionIds`, `selectedAddons`) lives at module scope in `useRegistration.js`. Any component calling `useRegistration()` gets the same reactive references. This avoids provide/inject boilerplate while keeping state naturally shared across all four steps.

### Computed-first, no watchers
Every derived value (pricing totals, conflict sets, grouped sessions, grouped addons) is a `computed`. There is not a single `watch` in the codebase — state flows in one direction and Vue's reactivity handles the rest.

### Submit stays on step 4
On failed submit, `validationAttempted` flips to `true` and we stay on the Review step. The error summary renders inline with per-step "Edit → Step X" links. This is more legible than auto-navigating away on failure.

### `defineModel` in QuantityPicker
Uses Vue 3.4's `defineModel()` for clean two-way binding. Parent components pass `:model-value` + `@update:model-value` when they need to route the update through `updateAddon()`.

### Semantic token system — how it works
The design system has three layers:

1. **Raw palette** (`src/unocss/colors.js`) — plain color objects: `teal`, `gray`, `orange`, `green`, etc.
2. **Semantic map** (`src/unocss/semantic.js`) — maps intent to palette values, e.g. `bg.success.emphasis.rest = green[500]`. UnoCSS's `uno.config.js` runs `flattenToCssVars()` over this map at build time and injects all entries as `:root` CSS variables (e.g. `--bg-success-emphasis-rest: #15B471`). Values that already contain `var(` are skipped — those are defined in `src/css/colors.scss` instead (brand tokens that depend on runtime theming).
3. **Shortcuts** (`semanticTextShortcut`, `semanticBgShortcut`, `semanticBorderShortcut`) — atomic UnoCSS class aliases like `text-success` → `text-[var(--text-success-default)]`.

All scoped SCSS in components uses only CSS variables from this system. No hardcoded hex values appear in component styles — the full audit is documented in the Challenges section below.

---


## Additional Dependencies

No additional npm packages were added. The project ships with everything needed: Vue 3.5, Quasar 2.18, UnoCSS 66.x. `Intl.NumberFormat` covers currency formatting natively; `Date` covers all time parsing and formatting with `timeZone: 'UTC'` to match the mock data's UTC-formatted timestamps.

---

## How I Used AI Tools

This project was built with Claude Code (claude-sonnet-4-6) as the primary coding assistant.

**What worked well:**
- Upfront planning pass: asking Claude to read all mock data and specs before writing any code avoided architecture mismatches
- Screenshot-driven design iteration: Playwright screenshots after each major step let me catch visual issues before they compounded
- Business logic correctness: VIP 10% workshop discount, time-overlap detection using half-open intervals, conditional shipping address requirement
- Semantic token audit: Claude read all three token layers (`colors.js`, `semantic.js`, `uno.config.js`) before touching any CSS, which let it correctly map every hardcoded value to the right semantic variable

**Where I pushed back / corrected:**
- First draft had `handleSubmit` auto-navigating to the first step with errors — changed to stay on step 4 with the inline error summary (less jarring UX)
- Initial header used a `header-info` wrapper div containing title + meta text; `align-items: center` centered the wrapper block (not the title) against the logo, causing visible misalignment. Fixed by making logo and title direct flex siblings

**Figma matching approach:**
- Figma MCP was unavailable; Figma web requires authentication — resolved by working from user-shared screenshots
- Each step's design was matched iteratively: screenshot → compare → adjust CSS → re-screenshot

---

## Challenges

**Time zones in mock data:** Sessions use ISO strings with `Z` suffix but represent conference-local times. Displaying with `timeZone: 'UTC'` preserves the intended schedule (9:00 AM shows as 9:00 AM).

**Workshop conflict vs session conflict:** Two separate conflict detection paths — `conflictingSessionIds` (session↔session) and `isWorkshopConflicting(ws)` (workshop↔session). Workshop conflicts disable the card in real time (Step 3); session conflicts are deferred to submit validation per spec.

**Reactive quantity picker:** `v-model` on `selectedAddonMap[item.id].quantity` requires the map to return the actual reactive proxy from the array (not a copy). Using `Object.fromEntries(selectedAddons.value.map(...))` in a `computed` ensures the values are reactive references, so mutations flow back to the source array.

## What I Would Improve Given More Time

1. **Internationalization (i18n):** All user-facing strings are currently hardcoded in English. Swapping in `vue-i18n` and extracting to a locale file would be straightforward given the component structure.
2. **Optimistic registration:** Real submit would hit an API. Adding a loading state on the button (`isSubmitting` ref) and handling network errors gracefully would be the next step.
3. **Workshop capacity decrement UX:** Workshop cards show static remaining spots. After selecting, the count should decrement to reflect the pending reservation.
4. **Session description expansion:** Cards show title, speaker, and time but hide the `description` field. A subtle expand/collapse would let users make more informed selections.
5. **Mobile order summary:** The sidebar hides below 900px. A collapsible bottom sheet or an "Order summary" accordion above the nav buttons would restore that context on mobile.
