# Landing Implementation Plan

**Refs:** → [00_index](./00_index.md) · [01_architecture](./01_architecture.md) · [02_information_architecture](./02_information_architecture.md) · [03_component_model](./03_component_model.md) · [05_design_system](./05_design_system.md) · [06_motion_system](./06_motion_system.md) · [Analytics Event Catalog](../analytics/04_event_catalog.md) · [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md) · [Workflow — Implementation Lifecycle](../workflow/00_implementation_lifecycle.md)

**This document is planning only — no application code changes as part of producing it**, per this task's explicit instruction. It identifies what remains before real implementation begins and sequences that work; it does not perform it.

## Part 1 — Production Gap Analysis

Prototype (`planning/prototype/concept_*.html`) → Production Landing (`app/src/pages/landing/*`, `app/src/layout/LandingLayout.tsx`). Every row below is a real, unresolved gap — none are hypothetical.

| Area | Prototype state | Production requirement | Gap |
|---|---|---|---|
| **Section structure** | 7 fixed sections, hardcoded per concept file | The single structural sequence per [02_information_architecture.md](./02_information_architecture.md) | Current `HomePage.tsx` has one Hero + three value cards — none of the 7 sections exist in code yet |
| **Component integration** | Bespoke HTML/CSS per prototype (`.gap-card`, `.mech-visual`, `.sv-panel`, `.not-table`, `.roadmap-track`) | Real components per [03_component_model.md](./03_component_model.md): existing Design System primitives + 3 new Landing-owned components (Contrast Panel, Guided Question Preview, Comparison Table) | None of the 3 new components exist in the real codebase; existing primitives (Hero Section, Card, Status Badge, Button) exist but aren't composed into the new sections |
| **Design System integration** | Hardcoded hex/rgba values, a prototype-only `:root` token block per file | Real tokens from `app/src/design-system/tokens.css`, consumed via the existing Design System entry point (`app/src/design-system/index.ts`), per [Design System](../design-system/01_design_system.md#design-system-entry-point) | Prototype colors approximate but do not exactly match real token values; new components must be built as real, importable Design System-consuming components, not standalone HTML/CSS |
| **Motion refactoring** | `motion-system.css`/`.js`, plain CSS custom properties + vanilla `IntersectionObserver`, linked via `<link>`/`<script src>` | Real Motion tokens (per [06_motion_system.md](./06_motion_system.md)) added to `tokens.css`'s existing Motion category; the reveal/scroll-chrome engine reimplemented as a real React hook or utility module, respecting [Frontend Architecture](../frontend/01_architecture.md#component-ownership)'s ownership tiers | The entire motion engine is prototype-only JS today; no equivalent exists in `app/src/` |
| **Localization** | Korean-only, hardcoded directly in HTML, explicitly out of scope for the disposable prototype (see each concept file's own header comment) | Every string resolved through the Localization Layer, dual-authored (Korean-first, English dual-localized) per [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md), and variant-resolved per [Landing Experiment Strategy](../context/07_landing_experiment_strategy.md) | All new section copy (Gap, Mechanism, Structuring vs. Validating, What Hypora Is Not, Today vs. Tomorrow, Closing) needs Korean + English authorship for all three A/B/C variants — none exists yet; existing `landingVariants` resource shape covers only Hero + 3 value cards today |
| **Responsive behavior** | One `max-width: 800px` breakpoint per file, grid-to-single-column only; explicitly out of scope for the prototype | Full responsive behavior across the real breakpoint set already used elsewhere in the codebase, including the 3 new components' own reflow rules | Not started — the prototype's single breakpoint is a placeholder, not a real responsive spec |
| **Accessibility** | None — explicitly deferred (see [04_component_contracts.md](./04_component_contracts.md#accessibility-non-goals-deferred-not-solved-here)) | Semantic HTML, focus order, ARIA roles where needed, keyboard operability of the header nav and both CTAs, `prefers-reduced-motion` support (motion-layer version already specified in [06_motion_system.md](./06_motion_system.md); DOM/ARIA layer not yet) | Entirely unaddressed beyond the reduced-motion CSS gate |
| **SEO** | A single `<title>` per prototype file, no meta description, no structured data | Real `<title>`/meta description per route (Home/Features), Open Graph tags, semantic heading structure matching the real section hierarchy | Not started |
| **Performance** | No image assets, no lazy-loading, no bundle consideration — a static HTML file | Real asset strategy (if any imagery is added for the Guided Question Preview or elsewhere), code-splitting consistent with the existing app's bundling, motion engine implemented without layout-thrashing | Not evaluated — nothing to measure yet since no real implementation exists |
| **Analytics instrumentation** | None in the prototype | `landing_page_view` and `cta_clicked` events already exist and already carry `variant`/`assignmentSource` ([Landing Experiment Strategy](../context/07_landing_experiment_strategy.md#analytics)) — the Closing section's secondary CTA and Features' CTA need `cta_clicked` calls with a `placement` value distinguishing them, additive to the existing event per [Analytics Event Model](../analytics/02_event_model.md#extensibility-of-properties)'s rule; no new event name is invented | Wiring work only — the event/property model already supports this, nothing new to design |

## Part 2 — Phased Implementation Roadmap

Each phase's Completion Criteria gates the next phase per [Implementation Lifecycle](../workflow/00_implementation_lifecycle.md)'s phase-sequence discipline — no phase begins before its dependencies close.

### Phase 1 — Layout, Section Structure, Routing

- **Objective:** Real, empty (or minimally-content-stubbed) section shells exist in code, in the correct order, at the correct routes.
- **Scope:** Build the 7 Home sections as real components (structure only — no final copy, no motion, no new Landing-owned components yet, plain placeholder content); confirm the `/features` route exists with the CTA-per-route requirement from [02_information_architecture.md](./02_information_architecture.md#navigation-model).
- **Dependencies:** [02_information_architecture.md](./02_information_architecture.md) (this phase implements it directly); no dependency on Phases 2+.
- **Completion criteria:** All 7 sections render in the correct order at `/`; Features has a CTA; no visual polish, motion, or final copy required yet.

### Phase 2 — Component Implementation, Design System Adoption

- **Objective:** The 3 new Landing-owned components (Contrast Panel, Guided Question Preview, Comparison Table) exist as real, Design-System-consuming components matching their [04_component_contracts.md](./04_component_contracts.md) contracts.
- **Scope:** Build each component against its documented contract; wire existing primitives (Hero Section, Card, Status Badge, Buttons) into the Phase 1 section shells; author real Korean-first + English copy for every new section, across all 3 A/B/C variants, extending the existing `landingVariants` resource shape.
- **Dependencies:** Phase 1 (section shells to compose into); [03_component_model.md](./03_component_model.md) and [04_component_contracts.md](./04_component_contracts.md).
- **Completion criteria:** Every section renders its real, localized, variant-correct content with no remaining placeholder text; the Guided Question Preview provably reads no real Workspace/Project state (per its contract's non-goal); a Localization Readiness Gate check (per [Release Specification](../analysis/01_v1_release_specification.md#localization-readiness-gate)) passes for all new content.

### Phase 3 — Motion System Integration

- **Objective:** [06_motion_system.md](./06_motion_system.md)'s production Motion Tokens and Utilities are implemented as real code, applied uniformly (never per-variant).
- **Scope:** Add the Motion token category's real values to `tokens.css`; implement the reveal/scroll-chrome engine as a real hook or utility (replacing `motion-system.js`'s prototype logic); apply the Motion Utilities to Phase 2's components; implement the reduced-motion gate as real, tested behavior (not just a CSS rule).
- **Dependencies:** Phase 2 (components must exist before motion can be applied to them).
- **Completion criteria:** Every animation traces to a row in [Animation Plan](./planning/07_animation_plan.md)'s per-section table; `prefers-reduced-motion: reduce` is verified to disable all entrance/hover/pulse motion in a real browser; no component contains a hardcoded animation value (spot-checked against [06_motion_system.md](./06_motion_system.md)'s "no component defines its own animation values" rule).

### Phase 4 — Responsive Refinement

- **Objective:** All 7 sections and 3 new components reflow correctly across the real breakpoint set the rest of the app already uses.
- **Scope:** Define and implement responsive rules per new component (not just the prototype's single 800px collapse); verify Korean/English text reflow per [Design System](../design-system/01_design_system.md#localization-requirements)'s existing requirement, now applied to genuinely new content.
- **Dependencies:** Phase 2 (real components must exist).
- **Completion criteria:** No layout break at any breakpoint already supported elsewhere in the app, in either language.

### Phase 5 — Accessibility

- **Objective:** Landing meets the same accessibility bar the rest of the app is held to (bar itself owned elsewhere — this phase does not invent a new standard).
- **Scope:** Semantic HTML audit of all 7 sections; focus order and keyboard operability for both CTA tiers and the header nav; ARIA labeling where a visual-only cue (e.g., the emphasized Contrast Panel item) needs a non-visual equivalent.
- **Dependencies:** Phases 1–4 (structure, components, motion, and responsive behavior should be stable before an accessibility pass, to avoid rework).
- **Completion criteria:** Keyboard-only navigation can reach and activate both CTA tiers and both deep-page links; no motion-only information (e.g., the pulse emphasis) is the sole signal of meaning.

### Phase 6 — SEO

- **Objective:** Home and Features are each discoverable and correctly represented in search/social previews.
- **Scope:** Per-route `<title>`/meta description (localized), Open Graph tags, heading structure audit against [02_information_architecture.md](./02_information_architecture.md)'s section hierarchy.
- **Dependencies:** Phase 2 (final copy must exist to write accurate metadata).
- **Completion criteria:** Each of the 3 routes has correct, localized metadata; heading levels (`h1`/`h2`/`h3`) match the documented information hierarchy, not an arbitrary visual size choice.

### Phase 7 — Analytics Instrumentation

- **Objective:** Every CTA and page view on the new Landing is measurable using the existing event model — no new event invented.
- **Scope:** Confirm `landing_page_view` fires correctly on Features (already true per existing `LandingLayout.tsx`); add `cta_clicked` calls with a `placement` value for the Closing section's secondary CTA and Features' CTA, additive properties only.
- **Dependencies:** Phase 1 (routes/CTAs must exist to instrument).
- **Completion criteria:** Every CTA on every Landing route fires a correctly-propertied `cta_clicked` event, verified against [Analytics Event Catalog](../analytics/04_event_catalog.md) — no `eventName` invented inline, per that document's own rule.

## Migration & Rollback Considerations

**Migration:**
- Landing owns no persistent state of its own — per [Application Responsibilities](../context/05_application_responsibilities.md#landing)'s hard boundary ("no concept of a 'project,' no persistence"), there is no data to migrate when the section structure changes.
- Existing analytics remain compatible — `landing_page_view` and `cta_clicked` gain only additive `placement`/route-scoped properties (Part 1's Analytics row above); no existing property or event is renamed or removed.
- Existing experiment assignment remains unchanged — the A/B/C variant-assignment mechanism ([Landing Experiment Strategy](../context/07_landing_experiment_strategy.md)) is untouched by this redesign; a visitor's existing assignment continues to resolve the same way after the new sections ship.
- Existing localization remains unchanged in mechanism — the same Localization Layer and `(contentKey, variant, language)` resolution apply; only new content keys are added, none renamed or removed.
- **No data migration is required.**

**Rollback:**
- Rollback is a standard code revert — no database rollback, since none exists.
- No analytics migration is required to roll back — the event/property model is additive, so reverting the code does not orphan or corrupt any already-collected data.
- No storage migration is required to roll back, for the same reason state ownership makes migration unnecessary above.
- Whether the redesign ships atomically or via a staged/flagged rollout remains an open implementation-time decision (noted under Phase 1), not resolved here — but whichever is chosen, reverting is not blocked by any data or schema dependency.

## Final Validation

- **The Landing SDD no longer depends on prototype HTML files** — every fact in `sdd/landing/01_architecture.md` through `06_motion_system.md` is stated as this directory's own authority; `planning/prototype/*.html` is cited only as historical evidence, never as a live dependency (confirmed by re-reading each document's references above).
- **The Planning documents remain historical references only** — [00_index.md](./00_index.md)'s "Historical Evidence" section states this explicitly, and no document above requires reading `planning/` or `improvement/` to be understood on its own.
- **Every production component is defined by specification rather than implementation** — [03_component_model.md](./03_component_model.md) and [04_component_contracts.md](./04_component_contracts.md) define all 3 new components conceptually; none has real code yet, tracked as this document's own Phase 2.
- **The Motion System is reusable across the entire Landing** — [06_motion_system.md](./06_motion_system.md) defines one production configuration, not per-route or per-component values, resolving the per-concept conflict found during promotion.
- **The implementation roadmap can be executed without additional architectural decisions** — every phase above cites the specification document it implements; the one still-open implementation-time decision (Motion tokens' eventual home in `tokens.css` vs. staying Landing-scoped) is explicitly flagged in [06_motion_system.md](./06_motion_system.md#what-this-document-does-not-cover) as non-blocking, not left ambiguous.

## SDD Drift Check (per `sdd-framework/05_validation_and_review.md`)

1. **Implementation ↔ Specification** — real Landing code (`app/src/pages/landing/*`, `LandingLayout.tsx`) still implements the pre-promotion, three-route, one-section-Home structure; every document in this directory specifies the *target*, not current code. This is the entire, explicit subject of Part 1's Gap Analysis above — not a drift left unaddressed, but the reason this document exists. `CLAUDE.md` and `README.md` were corrected in this same task (their "no Application has real code yet" claim was stale, predating both Workspace's and Landing's real implementations) so this specific check no longer silently repeats a false premise going forward.
2. **Architecture ↔ ADR** — no ADR is contradicted. [ADR-0001](../architecture/decisions/ADR-0001-one-product-multiple-applications.md) (Landing remains an Application, not a separate product) and every ADR cited across the promoted documents (ADR-0004, ADR-0005, ADR-0012) are referenced for their existing Decisions only.
3. **Release ↔ Current state** — no `release/` directory exists yet; not applicable.
4. **Folder ownership** — `sdd/rules/ownership.md` was updated in this task: the "Landing (future)" row is now "Landing," owning `sdd/landing/**`; the note on `landing/improvement/`/`landing/planning/` was updated to reflect their new ownership under the promoted Landing area while remaining frozen historical evidence.
5. **Obsolete documentation** — nothing was deleted. `context/04_information_architecture.md` and `context/05_application_responsibilities.md` had their Landing-specific detail *relocated* (not deleted) with explicit relocation notes, mirroring exactly how Workspace's own promotion was handled — the correct application of the framework's "Relocated" pattern (`14_evolution_rules.md`), not an archival case (nothing here was superseded as *wrong*, it simply now has a more specific home).

## Artifact Decision Matrix (per `sdd-framework/05_validation_and_review.md`)

| Artifact | Change? | Reasoning |
|---|---|---|
| Specification | Yes | `sdd/landing/00_index.md` through `07_implementation_plan.md` created; `sdd/00_index.md`, `sdd/rules/ownership.md`, `sdd/context/04_information_architecture.md`, `sdd/context/05_application_responsibilities.md`, `README.md`, and `CLAUDE.md` updated to keep the promotion internally consistent and reachable |
| ADR | No | Landing's promotion follows an already-established pattern (Workspace's own prior promotion) rather than introducing a new architectural decision; no Product Architecture change, no new cross-Application boundary |
| Release | No | Nothing deployed; `release/`'s creation trigger has not fired |
| Validation | None of L1–L5 | No application code changed — this task is Specification-tier only, per its own explicit "do not implement" instruction |
| Version | No | No component version bump applies to specification-only content |
| Git Commit | Not yet — pending user review | Should reference this as the Landing SDD promotion, and note that `app/src/` itself is unchanged — the gap between this specification and current code is [07_implementation_plan.md](#part-1--production-gap-analysis)'s own subject, not something this commit resolves |
