# Landing Motion System

**Refs:** → [00_index](./00_index.md) · [Design System](../design-system/01_design_system.md#design-tokens-conceptual) · [Landing Experiment Strategy](../context/07_landing_experiment_strategy.md) · [Animation Plan](./planning/07_animation_plan.md) · [Motion Design System (prototype-phase)](./planning/08_motion_design_system.md) · [Design Principles](./improvement/00_design_principles.md)

## Relationship to the Landing Experiment Strategy — A Conflict This Promotion Resolves

**This section is the most important one in this document — read it before the token tables below.**

[Landing Experiment Strategy](../context/07_landing_experiment_strategy.md#non-goals) is canonical and predates the prototype phase. Its Non-Goals state, explicitly: *"Not a visual design test. Every structural and presentational element (Design System, components, layout, navigation, typography, colors, spacing, **animations**, section order, screenshots, CTA placement) is identical across every variant. Only what the copy says differs."*

The prototype phase's [Animation Plan](./planning/07_animation_plan.md) and [Motion Design System](./planning/08_motion_design_system.md) tuned motion pacing *differently per concept* (A calmer, B more energetic, C more decisive) — appropriate and correctly scoped **for prototype-stage visual comparison**, where the point was letting stakeholders compare narrative strategies side by side. It is **not** appropriate for production: carrying per-concept motion pacing forward would make Landing's animation a fourth, undocumented experiment dimension, directly contradicting the rule quoted above.

**Resolution:** this document defines **one production Motion Token configuration**, used identically regardless of which A/B/C content variant a visitor sees. The values adopted are Concept A's slowed pacing (the calmest of the three prototype configurations) — not because Concept A "won" the narrative-strategy comparison (no such comparison is being made; see [01_architecture.md](./01_architecture.md#final-design-direction-shared-across-all-variants)), but because:
1. It is the configuration most consistent with this project's own repeated instruction to "favor calm, deliberate motion... reflecting Hypora's philosophy of structured thinking" — a product-level, not narrative-strategy-level, directive.
2. Choosing the calmest of three already-validated configurations, rather than inventing a fourth new value set, keeps this decision traceable to real, reviewed prototype evidence.

No prior document was wrong: [Landing Experiment Strategy](../context/07_landing_experiment_strategy.md) already correctly anticipated this exact situation, and the prototype phase's per-concept tuning was correctly scoped to its own stated purpose (design validation, not production). This document is where the two meet.

## Production Decision Criteria

Choosing Concept A's values isn't only a "calmest of three" traceability argument — the resulting configuration was checked against the same constraints any production motion decision should be:

- **Readability:** entrance durations (≤880ms) and stagger gaps never delay a visitor from reading a section's content past what a single unhurried glance already tolerates — no section's full reveal exceeds roughly one second end to end, per [Motion Principles](#motion-principles)'s entrance-timing cap below.
- **Accessibility:** every value is gated behind `prefers-reduced-motion` (see Reduced Motion Strategy below), and no duration is long enough on its own to risk disorienting a vestibular-sensitive visitor — one-shot, non-looping entrance motion at sub-second durations is well within general motion-accessibility guidance.
- **Consistency:** checked against `app/src/design-system/tokens.css`'s existing Motion category (`--motion-duration-fast: 0.25s`, `--motion-duration-base: 0.3s`, `--motion-duration-slow: 0.7s`) and found to exceed its slowest existing value (`--m-dur: 880ms` vs. `--motion-duration-slow: 700ms`). This is treated as an intentional exception, not an oversight — see below for why the values are not reduced to fit the existing ceiling.
- **CTA focus:** the primary CTA's own motion (hover-only, never auto-playing — see CTA Motion below) is unaffected by entrance pacing either way; slower section entrances do not compete with or delay the CTA's own emphasis.

### Why This Is an Application-Level Exception, Not an Independent Motion System

The 25% gap between `--m-dur` (880ms) and the existing `--motion-duration-slow` (700ms) is deliberate and is documented here explicitly rather than left for an implementer to notice and question later:

- **Landing is a narrative/storytelling experience, not an interaction-heavy application surface.** The rest of the app's Motion tokens were tuned for Workspace's task-oriented interactions (loading spinners, transitions, progress fills, per [Design System](../design-system/01_design_system.md#design-tokens-conceptual)'s Motion token category) — a fundamentally different pacing need than a visitor reading a structured argument section by section.
- **The slower pacing is intentional, not accidental slowness** — it exists to support comprehension and give the visitor's own structured thinking room to happen, the same value [Design Principles](./improvement/00_design_principles.md) already establishes for Landing's content and narrative pacing, now extended to its motion.
- **The current shared Motion Token scale has no Presentation tier.** `fast`/`base`/`slow` were defined for Workspace's interaction feedback, not for a narrative entrance sequence — Landing's need doesn't fit an existing category, it exposes a gap in the category set itself.
- **This is therefore an Application-level exception, scoped to Landing, not a second or independent motion system.** Landing's Motion Tokens (this document) still compose the same architectural role ([Design System](../design-system/01_design_system.md#design-tokens-conceptual)'s Motion category) — they simply aren't forced to fit inside its current three named tiers.
- **Promotion of a fourth, Presentation-tier token into the shared scale is deferred, not proposed now** — per this project's standing "minimum abstraction until a concrete second consumer exists" discipline (already applied to Landing's own new components in [03_component_model.md](./03_component_model.md#promotion-watch-list-not-promoted-now)), a shared Presentation tier is only added once a second real consumer (Workspace, or a future Application) is found to need the same slower, narrative-paced entrance behavior — not speculatively, ahead of that need.

## Motion Principles

Permanent architecture, promoted unchanged from [Animation Plan](./planning/07_animation_plan.md#global-motion-principles) and [Design Principles](./improvement/00_design_principles.md#visual-communication-principles):

- **Every animation answers a specific communication question** (what deserves attention first, what to read next, how the eye should move, what's interactive, what belongs together, which action matters most) — an animation that answers none of these does not exist on Landing. See [Animation Plan](./planning/07_animation_plan.md)'s Self-Review for two ideas rejected on this exact basis.
- **Motion rhythm:** every scroll-triggered animation plays once per page load, the first time its section enters the viewport — never replays.
- **Entrance timing:** no single element's entrance exceeds `--m-dur` (880ms in the production configuration below — see Production Decision Criteria above for why this intentionally exceeds the shared Design System's existing `--motion-duration-slow` ceiling) — motion never becomes the slowest thing on the page relative to the reading pace it's supporting.
- **Scroll rhythm:** one animated "beat" per section — never more than one distinct animated idea competing for attention within a section.
- **No component defines its own animation values** — every duration, delay, easing, and distance is read from the Motion Tokens below via the Motion Utilities; this is a permanent architectural rule, not a prototype-phase convenience (see [Motion Design System](./planning/08_motion_design_system.md) for why this refactor happened and what it prevents).
- **Reduced motion is a core motion-language decision, not accessibility polish bolted on afterward** — restated from [Motion Design System](./planning/08_motion_design_system.md#global-motion-principles); see Reduced Motion Strategy below.

## Motion Tokens (Production Configuration)

One configuration, used identically across every A/B/C content variant — adopted from the prototype phase's Concept A values (see Relationship section above), which is itself the production baseline `sdd/design-system/01_design_system.md`'s existing **Motion** token category should adopt when these values are implemented as real design tokens.

| Token | Value | Governs |
|---|---|---|
| `--m-dur` | 880ms | Base entrance duration |
| `--m-dur-fast` | 460ms | Micro-interaction duration |
| `--m-stagger` | 200ms | Standard stagger gap |
| `--m-stagger-fast` | 150ms | Fast stagger gap (dense row groups) |
| `--m-stagger-lg` | 520ms | Large sequential gap (a deliberate "this, then that" pair) |
| `--m-ease` | `cubic-bezier(.22, .61, .36, 1)` | Primary easing — soft deceleration, low initial velocity |
| `--m-distance` | 28px | Entrance travel distance |
| `--m-pulse-spread` | 16px | Emphasis pulse's maximum spread |
| `--m-highlight-delay-offset` | 200ms | Extra delay after `--m-dur` before a highlight fires |
| `--m-sequence-gap` | 260ms | Gap between chained micro-interaction beats |
| `--m-hover-duration` | 260ms | Hover/focus transition duration |
| `--m-hover-lift` | 3px | Hover lift distance |
| `--m-header-duration` | 260ms | Sticky-chrome scroll transition duration |

Full token contract (what each governs, in detail) and the reasoning behind each value is owned by [Motion Design System](./planning/08_motion_design_system.md#token-contract) and its Pacing Change table — not restated here beyond the production values themselves.

## Motion Utilities

Promoted unchanged from [Motion Design System](./planning/08_motion_design_system.md#utility-class-catalog) — the utility *names* and *behaviors* are now official Landing architecture; their prototype-phase CSS implementation (`planning/prototype/motion-system.css`/`.js`) is reference evidence for [07_implementation_plan.md](./07_implementation_plan.md)'s real implementation, not itself production code.

| Utility | Behavior |
|---|---|
| Entrance reveal (full / half distance) | Fade + travel-distance entrance, gated by a section's first viewport intersection |
| Stagger steps (standard / fast / large) | Delay steps derived from the stagger tokens above |
| Emphasis pulse | One-shot attention pulse on a Contrast Panel's emphasized item |
| Delayed highlight | Delayed color/border transition to a component-declared "highlighted" state (the Guided Question Preview's chosen chip) |
| Chained second-beat entrance | A second entrance timed to start only after a highlight completes (the Guided Question Preview's confirmation) |
| Hover lift / hover fade | Interaction-gated (never auto-playing) hover/focus emphasis |
| Scroll chrome | Sticky header's scroll-triggered background/border/blur transition |

## Section Motion Guidelines

Owned in full by [Animation Plan](./planning/07_animation_plan.md)'s per-section tables (Communication Goal, Animation Goal, Trigger, Type, Priority per section) for Sections 1–5 and 7 — every decision there stands, with only the timing *values* now drawn from the single production configuration above instead of per-concept values.

**Section 6 is the one exception, stated here because it postdates that historical document.** [Animation Plan](./planning/07_animation_plan.md) specified Section 6 as "Today vs. Tomorrow" — a sequential, two-card reveal using the `d-lg` large-gap stagger step specifically to embody "this comes first, chronologically; this comes after." That section no longer exists ([02_information_architecture.md](./02_information_architecture.md#vision-section-specification)); Section 6 is now Vision, a single centered text block with no sequential-time claim to embody motion-wise. Vision's motion is therefore the same simple, single-beat entrance reveal used by Hero and Closing (a `.reveal` fade + travel-distance entrance, one beat, no stagger group) — not a redesign of Motion Principles, just this one section no longer needing the `d-lg` pattern `planning/07_animation_plan.md` describes for the section it used to be. `d-lg` remains a valid utility (unused today, not removed — see [Motion Utilities](#motion-utilities)), available again if a future section needs the same "this, then that" sequencing.

## CTA Motion

**Permanent, non-negotiable rule:** the primary CTA never receives auto-playing or looping motion emphasis, on any variant, at any pacing. It responds to hover/focus only (Hover Motion below). This was already true in every prototype concept, including B (Loss Aversion), where — per [Animation Plan](./planning/07_animation_plan.md#section-7--closing)'s own explicit rejection — the temptation to add exactly this kind of device is highest. Promoting per-concept motion out of scope (see Relationship section above) makes this rule easier to enforce, not harder: there is now exactly one CTA motion behavior to audit, not three.

## Hover Motion

- **`hover-lift`** (primary CTA): small elevation (lift + soft shadow) on hover/focus, `--m-hover-duration`/`--m-hover-lift`.
- **`hover-fade`** (secondary CTA, secondary buttons generally): color-only transition, no lift — a deliberately calmer treatment than the primary CTA's, reinforcing which action matters more per [Design Principles](./improvement/00_design_principles.md#conversion-principles).
- No hover transform is large enough to shift surrounding layout.

## Reduced Motion Strategy

A single `prefers-reduced-motion: reduce` check gates every Motion Utility above at once. When set: all entrance/stagger/pulse/highlight animation is skipped (content renders at its final state immediately), and hover emphasis is limited to color/opacity only (no transform). This is implemented once, centrally (per [Motion Design System](./planning/08_motion_design_system.md#reduced-motion)'s architecture), not per component — the same "single shared configuration" principle applies to the reduced-motion gate as to the tokens themselves.

## What This Document Does Not Cover

- The actual CSS/JS implementation — `planning/prototype/motion-system.css`/`.js` is reference evidence only, per [00_index](./00_index.md)'s "Historical Evidence" rule; real implementation is tracked in [07_implementation_plan.md](./07_implementation_plan.md)'s Phase 3.
- Whether the Design System's own token file (`app/src/design-system/tokens.css`, per the shared [Design System](../design-system/01_design_system.md#design-tokens-conceptual)'s existing Motion category) is the eventual home for these values, or whether Landing's Motion tokens stay Landing-scoped until Workspace has a real motion need of its own — an implementation-time decision, not resolved here, consistent with [05_design_system.md](./05_design_system.md)'s promotion-boundary reasoning.
