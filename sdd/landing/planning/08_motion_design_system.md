# Motion Design System — Token Architecture

**Refs:** → [00_index](../../00_index.md) · [00_design_principles](../improvement/00_design_principles.md) · [07_animation_plan](./07_animation_plan.md)

## Scope and Status

**Planning artifact — a refactor of `07_animation_plan.md`'s implementation, not a change to its per-section motion decisions.** Every Communication Goal, Animation Goal, Trigger, and Priority in [07_animation_plan.md](./07_animation_plan.md) is unchanged. What changes here is *only* how motion is authored: from per-component hardcoded values to a shared token system, and a slower overall pace across all three concepts. No section, narrative, or copy changed as a result of this pass.

## Why This Refactor

The prior implementation (per the previous planning pass) worked, but every animated component declared its own `transition`/`animation` values directly — `.btn-primary` had its own hardcoded `180ms`, `.mech-chip.selected` its own hardcoded `150ms` delay, `header.site` its own hardcoded `200ms`. Changing the Landing's motion language meant hunting through every component rule individually. This document defines the replacement: a small set of **motion tokens** (CSS custom properties) and **motion utility classes**, so that:

- No component rule (`.btn-primary`, `.mech-chip`, `header.site`, `.gap-card`) contains a duration, delay, easing function, or travel distance itself.
- Every animated behavior is expressed as a utility class (`.reveal`, `.hover-lift`, `.pulse-emphasis`, `.reveal-highlight`, `.scroll-chrome`) applied in markup, sourcing all timing from tokens.
- The utility classes and their underlying keyframes/transitions live in **one shared file** (`planning/prototype/motion-system.css` + `motion-system.js`), linked by all three concept prototypes — editing that one file changes the Landing's motion *mechanics* everywhere at once.
- Each concept prototype keeps a small, clearly-isolated **Motion Configuration** block (a `:root { --m-*: … }` declaration) — the only place any concept-specific *pacing value* lives. Editing that one block changes that concept's entire motion *feel* — this is the "single shared motion configuration" per prototype the task asked for; the shared file above is the single shared *system* across all three.

## Token Contract

Every token below is required by `motion-system.css`'s utility classes. Each has a safe fallback (`var(--token, fallback)`) so a missing token degrades gracefully rather than breaking, but a real Motion Configuration block defines all of them explicitly — no production Design System motion token set should rely on the fallbacks.

| Token | Governs | Used by |
|---|---|---|
| `--m-dur` | Base entrance duration | `.reveal`, `.reveal-sm`, delay math for `.reveal-highlight`/`.pulse-emphasis` |
| `--m-dur-fast` | Micro-interaction duration | `.reveal-highlight`, `.pulse-emphasis` |
| `--m-stagger` | Standard stagger gap | `.d0`–`.d3`, and `.pulse-emphasis`'s default delay |
| `--m-stagger-fast` | Fast stagger gap (dense row groups) | `.f0`–`.f3` |
| `--m-stagger-lg` | Large sequential gap (a "this, then that" pair) | `.d-lg` |
| `--m-ease` | Primary easing function | every transition/animation below |
| `--m-distance` | Entrance travel distance | `.reveal` (full), `.reveal-sm` (half, via `calc()`) |
| `--m-pulse-spread` | Emphasis pulse's maximum spread | `.pulse-emphasis` |
| `--m-highlight-delay-offset` | Extra delay added after `--m-dur` before a highlight fires | `.reveal-highlight` |
| `--m-sequence-gap` | Gap between chained micro-interaction beats (e.g., a highlight, then its confirmation) | `.reveal-after-highlight` |
| `--m-hover-duration` | Hover/focus transition duration | `.hover-lift`, `.hover-fade` |
| `--m-hover-lift` | Hover lift distance | `.hover-lift` |
| `--m-header-duration` | Sticky-chrome scroll transition duration | `.scroll-chrome` |

**Explicitly not tokenized:** colors (`--highlight-border-to`, `--pulse-color`, `--hover-shadow`) and the static endpoint of a non-eased property (e.g., a chip's `font-weight` swap). The task's instruction covers *timing, easing, delay, and distance* — color and other non-motion endpoint values remain ordinary component styling, set locally by the component that needs them, since tokenizing color would conflate the Motion Design System with the (separate, untouched) visual Design System.

## Utility Class Catalog

| Class | Behavior | Replaces (previously hardcoded on) |
|---|---|---|
| `.reveal` | Fade + translateY(`--m-distance`) entrance, gated by an ancestor `.reveal-section.in-view` | Every top-level entrance (cards, panels, hero elements) |
| `.reveal-sm` | Same, at half `--m-distance` — for nested/smaller elements | Validation checklist rows |
| `.d0`–`.d3`, `.d-lg` | Transition-delay steps derived from `--m-stagger` / `--m-stagger-lg` | Per-element stagger, Section 6's deliberate today→tomorrow gap |
| `.f0`–`.f3` | Transition-delay steps derived from `--m-stagger-fast` | Section 5's dense row group |
| `.pulse-emphasis` | One-shot box-shadow pulse, delayed to fire after its element's own entrance completes | The Gap section's callout card |
| `.reveal-highlight` | Delayed color/border transition to a component-declared "highlighted" state | The mechanism's selected-answer chip |
| `.reveal-after-highlight` | A second entrance, timed to start after a `.reveal-highlight` sibling's transition completes | The mechanism's "saved" confirmation |
| `.hover-lift` | Hover/focus elevation (lift + shadow) | The primary CTA |
| `.hover-fade` | Hover/focus color-only transition (no lift) | The secondary CTA |
| `.scroll-chrome` | Sticky header's scroll-triggered background/border/blur transition | The site header |

Every one of these lives in `motion-system.css`; no component selector in any concept file declares a `transition`, `animation`, or keyframe of its own.

## Pacing Change — 30–50% Slower

Per the task's instruction ("favor calm, deliberate motion... reflecting Hypora's philosophy of structured thinking" — consistent with [00_design_principles.md](../improvement/00_design_principles.md)'s own "thinking happens in questions, not blank forms" and progressive-disclosure principles), every concept's core timing tokens were slowed by roughly 35–45%, preserving each concept's *relative* pacing identity (A remains calmest, C remains most immediate) while raising the floor everywhere — even Concept C's "decisive" pacing should read as confident, not rushed.

| Token | A — before → after | B — before → after | C — before → after |
|---|---|---|---|
| `--m-dur` | 650ms → 880ms | 400ms → 560ms | 340ms → 490ms |
| `--m-dur-fast` | 340ms → 460ms | 260ms → 360ms | 220ms → 320ms |
| `--m-stagger` | 150ms → 200ms | 80ms → 110ms | 50ms → 75ms |
| `--m-stagger-fast` | 110ms → 150ms | 60ms → 85ms | 40ms → 60ms |
| `--m-stagger-lg` | 380ms → 520ms | 300ms → 420ms | 260ms → 380ms |

New tokens (`--m-distance`, `--m-pulse-spread`, hover/header timings) were set following the same relative ordering — larger travel distance and slower hover response for the calmer concepts, tighter and quicker for the more immediate ones — never introducing a fourth, uncoordinated pacing scale.

## What Did Not Change

- Section count, order, copy, and layout — untouched, per this task's own scope.
- Which elements animate, on what trigger, and why — [07_animation_plan.md](./07_animation_plan.md)'s per-section table is still the authority on *what* to animate; this document only changes *how* that's authored.
- The permanent, cross-concept rule that the primary CTA never receives auto-playing or looping emphasis — `.hover-lift` is interaction-gated (hover/focus) only, in the shared file, so this rule is now enforced structurally (one file), not just by convention across three separate copies.
- `prefers-reduced-motion` handling — still a single check in the shared JS, still disables every utility class's motion, unchanged in behavior from the prior pass.

## Architecture Note — Two Levels of "Shared"

This task asked for both "a shared Motion Design System" and "a single shared motion configuration." These are two different, intentionally separate things:

1. **The System** (`motion-system.css` + `motion-system.js`, one physical file each, linked by all three concept prototypes) — the engine: utility classes, keyframes, the `IntersectionObserver` reveal trigger, the reduced-motion gate. Editing this changes the Landing's motion *mechanics* everywhere at once.
2. **The Configuration** (a `:root { --m-*: … }` block, one per concept prototype, clearly isolated at the top of each file's `<style>`) — the tuning: this is the "single shared motion configuration" that determines *that concept's* entire motion feel from one place. It stays per-concept, not merged into one cross-concept value set, because per-concept pacing differentiation was an explicit, still-standing requirement from the prior planning pass ([07_animation_plan.md](./07_animation_plan.md)'s Per-Concept Motion Tuning) that this task did not rescind.

If a future decision merges the three concepts into one shipped Landing (post-promotion), the Configuration block collapses to a single instance — the System requires no change at all, which is the entire point of separating the two.
