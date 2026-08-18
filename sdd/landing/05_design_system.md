# Landing's Design System Consumption

**Refs:** → [00_index](./00_index.md) · [03_component_model](./03_component_model.md) · [Design System](../design-system/01_design_system.md) · [Frontend Architecture](../frontend/01_architecture.md#component-ownership)

## Scope Note — Not a Second Design System

**This document does not define, redefine, or fork any Design Token, component inventory entry, or composition rule.** [Design System](../design-system/01_design_system.md) is Hypora's single, shared Design System — Landing and Workspace both consume it, and per that document's own "Architectural Boundary" section, "only one Default Design System is implemented today," a boundary this document does not touch. Everything below states *how Landing composes* the existing system and *where Landing's own new components sit relative to its boundary* — never a duplicate listing of tokens or primitives already fully specified there.

## What Landing Consumes, Unchanged

Per [03_component_model.md](./03_component_model.md)'s review, Landing composes these existing primitives with no changes to their contracts: Hero Section, Primary Button, Secondary Button, Status Badge, Card, Page Header, Stack/Grid layout primitives. Their purpose, props, and composition rules are owned entirely by [Design System](../design-system/01_design_system.md#component-inventory) — this document does not restate them. **Roadmap Stepper is no longer a Landing consumer** as of the Roadmap route's removal (see [02_information_architecture.md](./02_information_architecture.md#route-model)) — the primitive itself remains part of the shared Design System's inventory, still demonstrated on the internal `/design-system` catalog route, independent of this change.

## Where Landing's New Components Sit

[03_component_model.md](./03_component_model.md)'s three new components (Contrast Panel, Guided Question Preview, Comparison Table) are **Landing-owned, section-specific components** — the middle tier of [Frontend Architecture](../frontend/01_architecture.md#component-ownership)'s three-tier ownership model, realized for Landing (which has no Feature subdivision) as components owned by Landing itself rather than any single Feature. They are:

- Composed *from* Design System primitives and tokens (color roles, spacing scale, typography scale) — never introducing a parallel visual language, per [Design Principles](./improvement/00_design_principles.md#visual-communication-principles) Principle 13.
- **Not** part of the shared Design System's own component inventory, and not proposed to become part of it by this document — per [Design System](../design-system/01_design_system.md#composition-rules)'s promotion rule, that happens only once a second real consumer (Workspace, or a future Application) needs an identical pattern. None does today.
- Bound by the same [Composition Rules](../design-system/01_design_system.md#composition-rules) as every Design System primitive: no business logic, no Feature-specific copy, no persistence call — restated per-component in [04_component_contracts.md](./04_component_contracts.md)'s Non-Goals sections.

## Shared Layout Container

**Canonically owned by [Design System — Shared Layout Container](../design-system/01_design_system.md#shared-layout-container)**, promoted there once Workspace's app bar independently hit the identical gap this section originally found for Landing (the header had no width constraint at all, and several Home sections applied a `max-width` without the centering margin needed to actually center within it) — two Applications hitting the same defect independently is exactly the evidence this project's concept-ownership discipline treats as "promote to the shared root," per [Ownership Map](../rules/ownership.md). This document does not restate that rule; every Landing surface (header, the 7 Home sections, Features, Footer) is bound by it exactly as stated there.

### Header Navigation Centering

A Landing-specific instantiation, not a restatement, of the shared rule above: **the in-page navigation must be visually centered across the entire header row — the full shared container width — not merely centered within whatever space happens to remain between the logo and the right-side actions.** A three-region layout (logo fixed left, navigation centered on the row, language switcher + primary CTA grouped right) is required rather than a simple two-sided flex split, specifically because the logo and the right-side group are different widths — a naive "space-between with a centered middle child" approach visually skews the navigation away from true center by exactly that width difference. The navigation's visual center must coincide with the shared container's own center, regardless of how wide the logo or the right-side group are. This rule governs Landing's header only — Workspace's app bar has no equivalent in-page navigation to center, so it has no analogous rule.

This section is the canonical source for Landing's header-navigation-centering detail specifically — no other Landing document restates it; [06_motion_system.md](./06_motion_system.md) and [04_component_contracts.md](./04_component_contracts.md) reference it rather than defining their own layout rules. The general container/centering discipline itself is owned at [Design System — Shared Layout Container](../design-system/01_design_system.md#shared-layout-container), not here.

## Token Usage

Landing's new components reference the existing [Design Tokens](../design-system/01_design_system.md#design-tokens-conceptual) categories (Color roles, Spacing scale, Typography scale) exactly as every Design System primitive does — no new token category is introduced for visual (non-motion) styling. **Motion** is the one category [Design System](../design-system/01_design_system.md#design-tokens-conceptual) already lists but treats as out of this document's scope — [06_motion_system.md](./06_motion_system.md) is where Landing's Motion tokens are specified, promoted from the prototype phase's token system into this Design System's existing Motion token category rather than a new, separate one.

## Localization Requirements

Landing's new components are bound by [Design System](../design-system/01_design_system.md#localization-requirements)'s existing component-level contract in full — restated per-component (not re-derived) in [04_component_contracts.md](./04_component_contracts.md#localization-requirements-all-three-components).

## Coverage Check — What This Promotion Adds

Extending [Design System](../design-system/01_design_system.md#coverage-check-against-v1-needs)'s own existing Coverage Check table, without restating its prior rows:

| Source | UI need | Covered by |
|---|---|---|
| Landing (this promotion) | N-item side-by-side comparison, one optionally emphasized | Contrast Panel (Landing-owned) |
| Landing (this promotion) | A demonstrable, non-live guided-question mechanism preview | Guided Question Preview (Landing-owned) |
| Landing (this promotion) | Fixed label/description row comparison | Comparison Table (Landing-owned) |
| Landing (this promotion) | Section-scroll entrance, hover emphasis, sticky-chrome transition, reduced-motion | Motion System — see [06_motion_system.md](./06_motion_system.md) |

**Result:** no gap found requiring a change to the shared Design System's own component inventory or token categories — every new need is met either by existing shared primitives (unchanged) or by Landing-owned composition (this document and [03_component_model.md](./03_component_model.md)), consistent with the "minimum abstraction until a concrete second consumer exists" discipline [Design System](../design-system/01_design_system.md#architectural-boundary--not-just-a-component-library) already applies project-wide.
