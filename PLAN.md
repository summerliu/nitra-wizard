# PLAN.md — Event Registration Wizard

## How I Planned and Broke Down the Task

I started by reading both the spec doc and README in full before writing a line of code. The key insight from that pass was that "validation runs at submit time, not inline" — this shaped the entire architecture decision to keep a `validationAttempted` flag in the top-level orchestrator and pass it down to steps as a prop.

**Breakdown order:**
1. Read all mock data (`sessions.js`, `addons.js`, `event.js`) and understand the business rules (VIP discount, time-conflict detection, capacity, merchandise → shipping)
2. Design the module-level singleton composable (`useRegistration`) as the single source of truth
3. Wire validation as a separate composable (`useValidation`) so it stays pure computed state
4. Build the four steps as isolated components that only read from composables — no prop-drilling of data
5. Wire `IndexPage.vue` as a thin orchestrator: step routing, submit handler, transitions

## Key Decisions

### Module-level singleton composable
All reactive state (`attendeeInfo`, `ticketTypeId`, `selectedSessionIds`, `selectedAddons`) lives at module scope in `useRegistration.js`. Any component calling `useRegistration()` gets the same reactive references. This avoids provide/inject boilerplate while keeping the state naturally shared across all four steps.

### Computed-first, no watchers
Every derived value (pricing totals, conflict sets, grouped sessions, grouped addons) is a `computed`. There is not a single `watch` in the codebase — state flows in one direction and Vue's reactivity handles the rest.

### Submit stays on step 4
On failed submit, `validationAttempted` flips to `true` and we stay on the Review step. The error summary renders inline with per-step "Edit →" links. This is more legible than auto-navigating away, which was the first instinct but felt jarring in testing.

### `defineModel` in QuantityPicker
The quantity picker uses Vue 3.4's `defineModel()` for clean two-way binding. Parent components pass `:model-value` + `@update:model-value` when they need to route the update through `updateAddon()` rather than mutating directly.

### Semantic CSS vars everywhere
All colors use the provided token system (`var(--bg-brand-emphasis-rest)`, `var(--border-neutral-muted)`, etc.). No hardcoded hex values. Typography uses the provided CSS custom properties for font sizes and line heights.

## Additional Dependencies

No additional npm packages were added. The project ships with everything needed: Vue 3.5, Quasar 2.18, UnoCSS 66.x. `Intl.NumberFormat` covers currency formatting natively; `Date` covers all time parsing and formatting with `timeZone: 'UTC'` to match the mock data's UTC-formatted timestamps.

## How I Used AI Tools

This project was built with Claude Code (claude-sonnet-4-6) as the primary coding assistant.

**What worked well:**
- Upfront planning pass: asking Claude to read all mock data and specs before writing any code avoided architecture mismatches
- Iterative screenshot-driven review: taking Playwright screenshots after each major step let me catch visual issues (e.g. the error summary was scrolled out of view on first test) before they compounded
- Business logic correctness: Claude correctly implemented the VIP 10% workshop discount, time-overlap detection using half-open intervals, and the conditional shipping address requirement

**Where I pushed back / corrected:**
- First draft had `handleSubmit` auto-navigating to the first step with errors. After seeing the screenshot, this felt jarring — the user loses context of the full error list. Changed to stay on step 4 with the inline error summary
- The initial test script selected sessions S5+S6, which don't actually conflict (S5 ends at 3PM, S6 starts at 3:30PM). Caught this by logging session titles/times before selecting, then targeted S4+S5 (1PM–2:30 vs 1:30PM–3PM), which do overlap

**Prompts that were particularly effective:**
- "Read all mock data files and the README in full before writing any code" — prevented rebuilding the same mental model multiple times
- "Take a Playwright screenshot and log the H1 and step-title" as a lightweight smoke test before writing deeper interaction tests

## Challenges

**Time zones in mock data:** Sessions use ISO strings with `Z` suffix but represent conference-local times (San Francisco). Displaying them with `timeZone: 'UTC'` preserves the intended conference schedule (9:00 AM shows as 9:00 AM, not 1:00 AM PST).

**Workshop conflict vs session conflict:** Two separate conflict detection paths — `conflictingSessionIds` (session↔session) and `isWorkshopConflicting(ws)` (workshop↔session). Workshop conflicts disable the card in real time (Step 3); session conflicts are deferred to submit validation per spec.

**Reactive quantity picker:** `v-model` on `selectedAddonMap[item.id].quantity` requires the map to return the actual reactive proxy from the array (not a copy). Using `Object.fromEntries(selectedAddons.value.map(...))` in a `computed` ensures the values are reactive references, so mutations flow back to the source array.

## What I Would Improve Given More Time

1. **Internationalization (i18n):** The spec lists it as a bonus. All user-facing strings are currently hardcoded in English. Swapping in `vue-i18n` and extracting to a locale file would be straightforward given the component structure.
2. **Optimistic registration:** Real submit would hit an API. Adding a loading state on the button (`isSubmitting` ref) and handling network errors gracefully would be the next step.
3. **Workshop capacity decrement UX:** The workshop cards show "8 spots left" statically from the mock. After selecting a workshop, the displayed count should decrement to reflect the pending reservation.
4. **Session description expansion:** Session cards show title, speaker, and time but hide the `description` field. A subtle expand/collapse would let users make more informed selections.
5. **Mobile order summary:** The sidebar hides below 900px. A collapsible bottom sheet or an "Order summary" accordion above the nav buttons would restore that context on mobile.
