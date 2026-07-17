# Landing — Specification Index

**Refs:** → [00_index](../00_index.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [Information Architecture (Product-Level)](../context/04_information_architecture.md) · [Design System](../design-system/01_design_system.md) · [Frontend Architecture](../frontend/01_architecture.md) · [Landing Experiment Strategy](../context/07_landing_experiment_strategy.md)

## Provenance

Created 2026-07-17, promoting the `sdd/landing/planning/` and `sdd/landing/improvement/` work into Landing's own dedicated specification directory — the trigger `sdd/00_index.md`'s "Not Yet Created" table names ("an architecture doc + a contract doc," once the Application has real code) had already fired before this promotion: real Landing code exists (`app/src/pages/landing/*`, `app/src/layout/LandingLayout.tsx`) and predates this directory. This promotion is therefore **not** "spec leads implementation" (the pattern Workspace's own promotion used) — it is spec catching up to, and now formalizing, a validated design direction for code that already exists and is about to be substantially revised. See [01_architecture.md](./01_architecture.md)'s Provenance section for the full reasoning.

## Documents

| Doc | Purpose |
|---|---|
| [01_architecture.md](./01_architecture.md) | Purpose, Responsibilities (by reference), Final Design Direction, relationship to the A/B/C storytelling experiment |
| [02_information_architecture.md](./02_information_architecture.md) | The finalized 7-section visitor journey (Section 6 is Vision, not Today vs. Tomorrow — Roadmap was removed), route model, navigation strategy — relocated from `context/04_information_architecture.md` |
| [03_component_model.md](./03_component_model.md) | Every prototype-phase component reviewed and classified: Promote / Merge / Remove / Replace; the resulting production component inventory |
| [04_component_contracts.md](./04_component_contracts.md) | Conceptual contract (purpose, content requirements, states, non-goals) for every Landing-owned component named in 03 |
| [05_design_system.md](./05_design_system.md) | How Landing's component inventory consumes the shared [Design System](../design-system/01_design_system.md) — never a duplicate of its token catalog or component inventory |
| [06_motion_system.md](./06_motion_system.md) | The production Motion System — principles, tokens, utilities, per-section guidance, promoted from the prototype phase as a single configuration (see that document for a real conflict this promotion resolved against the Landing Experiment Strategy) |
| [07_implementation_plan.md](./07_implementation_plan.md) | Production gap analysis (prototype → production) and a phased implementation roadmap |

## Historical Evidence (Not Specification)

| Directory | Status |
|---|---|
| [`planning/`](./planning/) | The design-validation pass that produced the target IA, the three concept prototypes, and the animation/motion-token refactor. Retained per the framework's "never delete historical documentation" rule — every fact promoted into the documents above traces back to something here, but this directory itself is no longer read as authoritative. |
| [`improvement/`](./improvement/) | The earlier reference-analysis and improvement-planning pass (Sentinel comparison, current-state gap analysis, initial improvement proposals) that preceded and informed `planning/`. Same status: historical evidence, not specification. |
| `planning/prototype/` (repo root, `planning/`, outside `sdd/`) | The disposable HTML/CSS/JS prototypes themselves — never specification, per `planning/README.md`; referenced here only as the visual evidence this promotion is based on. |

**Rule going forward:** no document under `sdd/landing/` (this directory) may be edited by copying prose out of `planning/` or `improvement/` without re-deriving it against Hypora's own philosophy — the same discipline [00_design_principles.md](./improvement/00_design_principles.md) already established for the planning phase applies permanently to this directory too. Conversely, `planning/` and `improvement/` are frozen: they describe what was true *during* the planning phase and are not updated to track this directory's future changes.

## Prototype → Production, At a Glance

A navigation aid only — full reasoning lives in the linked document, never restated here.

| Prototype | Production | Owning document |
|---|---|---|
| Per-concept motion pacing (A/B/C each tuned differently) | One shared Motion Token configuration, identical across all variants | [06_motion_system.md](./06_motion_system.md) |
| Three-card contrast group + two-panel contrast group (two separate patterns) | Merged into one **Contrast Panel** component | [03_component_model.md](./03_component_model.md) |
| Closing panel (bespoke container) | Removed as a named component — composed from existing Hero/Button primitives | [03_component_model.md](./03_component_model.md) |
| Guided-question mechanism visual, four-row comparison table | Promoted as two new Landing-owned components (**Guided Question Preview**, **Comparison Table**) | [03_component_model.md](./03_component_model.md) |
| Home as 3 separate routes (Home/Features/Roadmap, no forced order) | Home as one continuous 7-section narrative; Features remains an optional deep page | [02_information_architecture.md](./02_information_architecture.md) |
| Today/Tomorrow roadmap-style section (Home) + `/roadmap` deep page | Both removed — replaced by a single Vision section (Home Section 6), no roadmap presentation anywhere in Landing | [02_information_architecture.md](./02_information_architecture.md) |
| Header: logo/nav/actions in a simple two-sided flex split | Three-region layout — nav true-centered across the full header row | [05_design_system.md](./05_design_system.md#header-navigation-centering) |

## Ownership

Per `sdd/rules/ownership.md`, `sdd/landing/**` (this entire directory, including `planning/` and `improvement/`) is now owned by the **Landing** area — see that document's Areas table for the full cross-boundary rules this implies.
