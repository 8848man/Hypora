# Design System

**Refs:** → [00_index](../00_index.md) · [Frontend Architecture](../frontend/01_architecture.md) · [Workspace Feature Specifications](../workspace/features/000_index.md) · [Application Responsibilities](../context/05_application_responsibilities.md)

Created now because a second consumer needs this shared contract — Landing and Workspace both consume one Design System per the Development Target's explicit "one Design System" constraint, meeting the framework's cross-cutting-capability trigger (`02_directory_structure.md`: created "as soon as a second layer needs to agree on a shared contract"). Defines reusable UI concepts only — no pixel values, no color codes, no component code, per this task's instruction.

## Purpose

A single set of presentational, stateless UI primitives that Landing and Workspace both compose, so that shared visual language doesn't have to be reinvented per Application, and so that [Frontend Architecture](../frontend/01_architecture.md)'s Shared Component Boundaries (no business logic in shared components) has something concrete to point at.

## Design Tokens (Conceptual)

*(Inferred — no visual identity is specified anywhere in prior passes; this defines the token *categories* every component below needs, not their values.)*

| Token category | Purpose |
|---|---|
| Color roles | Semantic roles (e.g., primary, neutral, success, warning, danger) — never a component hardcoding a raw color; components reference a role |
| Spacing scale | A consistent step scale for padding/gaps, so every component's spacing is drawn from the same scale rather than ad hoc values |
| Typography scale | A small set of named text styles (e.g., heading tiers, body, caption) shared by both Applications |

Actual values (hex codes, pixel sizes) are implementation detail, out of scope for this document.

## Component Inventory

*(Inferred from every UI need surfaced across the Feature Specifications' User Interaction sections and Workspace Architecture — see Coverage Check below for the derivation.)*

| Component | Purpose | Used by |
|---|---|---|
| Text Field (single-line) | Short text entry | Project Name |
| Text Area (multi-line) | Long-form text entry | Canvas fields, Risk Notes, MVP Scope statement, Assumption statement/method/criterion |
| Primary Button | The one deliberate, forward-moving action on a screen | Create Project, mark section complete, add Feature/Assumption, confirm Build-Ready |
| Secondary Button | A supporting, non-primary action | Archive, reopen Scope/Planning, reorder |
| List Item / Card | One row representing one entity | Project List rows, Feature rows, Validation Checklist rows |
| Status Badge | A compact label representing current state | Lifecycle stage display, Section-Complete indicator, Validation item status (validated/invalidated/open) |
| Priority Indicator | A compact representation of a Feature's priority/tier | Feature Planning |
| Tag / Chip | A small, removable or toggleable label | Feature in/out-of-scope tag |
| Empty State Pattern | A consistent "nothing here yet" presentation with a call to action | Every Feature's Empty State (Dashboard, Canvas, Feature list, Checklist, Summary) |
| Loading Indicator | A consistent in-progress presentation | Every Feature's Loading State |
| Inline Alert / Error Banner | A consistent failure presentation | Every Feature's Error State (persistence read/write failures) |
| Confirmation Prompt | A deliberate yes/no gate before an irreversible or significant action | Archive confirmation, Build-Ready confirmation |
| Readiness Callout | A pattern for surfacing "what's blocking progress" with a link to the blocking section | Project Summary |
| Section Navigation Shell | A persistent navigation surface within a Project | Workspace's Project-level navigation ([Frontend Architecture](../frontend/01_architecture.md)) |
| Page Header | Consistent titling across screens | Every screen, both Applications |
| Hero Section | Large introductory composition | Landing Home |
| Feature Showcase Card | A card presenting one product capability | Landing Features page |
| Roadmap Stepper | A sequential-stages presentation | Landing Roadmap page |
| Responsive Layout Primitives (Stack / Grid) | Reflow building blocks | Every screen, both Applications |

## Composition Rules

- A primitive never contains business logic, Feature-specific copy, or a persistence call — it receives content and emits interaction events; it does not know what a "Validation Checklist" is. (Restates [Frontend Architecture](../frontend/01_architecture.md)'s Shared Component Boundaries — canonically owned there; this document owns the primitive inventory itself.)
- Landing composes these primitives for marketing-oriented layouts (Hero, Feature Showcase Card, Roadmap Stepper); Workspace composes the same primitives for functional, data-dense layouts (List Item/Card, Status Badge, Text Area) — same primitives, different composition, consistent with Landing/Workspace separation.
- A new Feature-specific visual pattern is added to this inventory only once a second Feature (or Landing) needs the identical pattern — per [Frontend Architecture](../frontend/01_architecture.md)'s promotion rule; until then it stays owned by the single Feature that needs it.

## Coverage Check Against V1 Needs

Every row in every Feature Specification's User Interaction section, plus Workspace Architecture's screen needs, was checked against the inventory above:

| Source | UI need | Covered by |
|---|---|---|
| All 5 Features | Empty / Loading / Error states | Empty State Pattern, Loading Indicator, Inline Alert |
| Project Management | Project Name entry, list display | Text Field, List Item/Card |
| Business Structuring | Canvas/Risk Notes entry | Text Area |
| MVP Planning | Scope entry, Feature list, priority, scope tag | Text Area, List Item/Card, Priority Indicator, Tag/Chip |
| Validation Planning | Assumption entry, status | Text Area, Status Badge |
| Project Summary | Lifecycle stage, blocking-artifact pointer, Build-Ready confirmation | Status Badge, Readiness Callout, Confirmation Prompt, Primary Button |
| Workspace Architecture | Persistent Project navigation | Section Navigation Shell |
| Landing (context/05) | Home, Features, Roadmap, CTA | Hero Section, Feature Showcase Card, Roadmap Stepper, Primary Button |

**Result: no gap found.** Every UI need surfaced through Phase 2's UX Specification and the existing Workspace/Landing screen inventories maps to a component already in this inventory — stated explicitly per the framework's Principle 5 ("no change required" is a valid, non-silent result), not omitted because nothing was found wanting.
