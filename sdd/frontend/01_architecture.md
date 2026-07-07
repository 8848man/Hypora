# Frontend Architecture

**Refs:** → [00_index](../00_index.md) · [Workspace Architecture](../workspace/01_architecture.md) · [Workspace Data & State](../workspace/02_data_and_state.md) · [Feature Specifications](../workspace/features/000_index.md) · [Design System](../design-system/01_design_system.md) · [Deployment Strategy](../infra/01_deployment.md) · [Application Responsibilities](../context/05_application_responsibilities.md)

Created now, at the point real frontend code is about to be written — per `10_bootstrap_guide.md` Step 3 ("as soon as that layer exists as real code, even a skeleton"). This is the technical realization layer: `sdd/context/`, `sdd/workspace/` and Landing's spec define *what* each Application does; this document defines *how one shared codebase* implements both, per the Development Target's explicit "one React application, one Router, one Design System" constraint. Conceptual only — no component code, no file trees with real paths, per this task's instruction.

## React Router Structure

*(Explicit that Landing and Workspace share one Router; the route grouping below is Inferred.)*

One Router, two top-level route groups — this grouping is the primary mechanism enforcing Landing/Workspace separation at the routing layer:

| Route group | Screens | Owned by |
|---|---|---|
| Public (Landing) | Home, Features, Roadmap, Call-to-Action | Landing (per [Application Responsibilities](../context/05_application_responsibilities.md)) |
| Workspace | Dashboard/Project List, and per-Project: Business Canvas, MVP Scope/Feature Planning, Validation Checklist, Project Summary | Workspace (per [Workspace Architecture](../workspace/01_architecture.md)) |

Each Project's screens are addressable under that Project's own identity (per each Feature Specification's Deep Link Considerations) — consistent with [Workspace Architecture](../workspace/01_architecture.md)'s non-linear navigation model: every section is directly reachable, not nested behind a forced sequence.

## Feature Boundaries

Each of the five Workspace Feature Specifications ([000_index](../workspace/features/000_index.md)) maps to one frontend module. **A Feature module must never import another Feature module's internals directly** — cross-Feature interaction happens only through the shared Project-level state (see State Ownership below) or through navigation, never a direct component/logic import. This is the frontend-code enforcement of each Feature Specification's own "Relationships with Other Features" table — it must not be possible in code to accidentally couple two Features that spec explicitly kept independent.

## Component Ownership

Three tiers, in order of how broadly a component may be reused:

| Tier | Scope | Owned by |
|---|---|---|
| Design System primitives | Purely presentational, stateless UI building blocks (inputs, buttons, cards, status indicators, layout primitives) | [Design System](../design-system/01_design_system.md) |
| Feature-owned components | Specific to one Feature's own screens (e.g., an Assumption row, a Canvas field editor) | The owning Feature module |
| App-shell components | Cross-Feature but Workspace- or Landing-internal (Workspace's persistent Project navigation, Landing's page chrome) | The frontend layer itself — not any single Feature, not the Design System |

**Promotion rule:** a component moves from Feature-owned to Design System only when a second Feature (or Landing) needs the identical pattern — mirroring the framework's "a cross-cutting capability is created only when a second consumer needs the contract" rule, applied at component granularity rather than document granularity.

## Shared Component Boundaries

The Design System must never contain business logic, Feature-specific copy, or direct persistence calls — it renders what it's given and emits events; it does not know what a "Validation Checklist" or "Canvas" is. Feature modules compose Design System primitives and supply all business meaning. This boundary is what lets Landing and Workspace share the Design System safely without either leaking into the other.

## State Ownership

| State tier | Scope | Written by |
|---|---|---|
| Local/transient | In-progress edits before a save fires (the Draft state, per [Workspace Data & State](../workspace/02_data_and_state.md)) | The component currently being edited, only |
| Project-level | The currently-open Project's full data (Canvas, Risk Notes, MVP Scope, Features, Validation items) | Only the owning Feature module for its own slice — e.g., MVP Planning writes Scope/Features, never Validation items |
| App-level | The Project list (Dashboard) and each listed Project's current lifecycle stage | Project Management (list membership) and the derivation described in [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md) (stage) |

**No state container crosses the Landing/Workspace boundary.** Landing holds no Project-level or app-level state at all — consistent with it having no persisted data of its own (per [Application Responsibilities](../context/05_application_responsibilities.md)).

## LocalStorage Ownership

A single, dedicated persistence-access module is the **only** code permitted to call LocalStorage directly — conceptually, this module is where Platform API's V1 implementation lives inside the shared codebase (see [Application Responsibilities](../context/05_application_responsibilities.md) and [Workspace Data & State](../workspace/02_data_and_state.md)). Every Feature module and every state container calls this module's read/write operations; none call LocalStorage itself. This boundary is what lets a future real Platform API backend replace this module later without requiring every Feature to change (see [Future Expansion Strategy](../context/06_future_expansion_strategy.md)).

## Workspace Layout

- **Dashboard:** a list layout (one row/card per Project, each showing Name and current lifecycle stage) plus the create-Project action — per [Project Management](../workspace/features/01_project_management.md).
- **Project view:** a persistent Project-level navigation exposing all four non-linear sections plus Summary, with the current lifecycle stage displayed prominently — per the [Workspace Mental Model Review](../workspace/01_architecture.md#workspace-mental-model-review). Only the content area changes between sections; the navigation shell persists.

## Responsive Behavior

*(Inferred — no viewport/breakpoint requirement is stated anywhere in prior specs; this states the minimum bar without prescribing pixel breakpoints, per this task's "no implementation details" instruction.)*

- Landing must be fully responsive — it is a public marketing surface with no assumed device.
- Workspace must remain usable across mobile, tablet, and desktop viewports — a Solo Founder (Primary Persona) may check a Project's status on the go. No capability may become completely inaccessible on a small viewport; long-form Canvas/Assumption authoring may be optimized for larger screens, but must still be reachable, not hidden, on small ones.
- Exact breakpoints and layout mechanics are implementation detail, out of scope for this document.

## Landing / Workspace Separation (Enforcement)

Restates [Application Responsibilities](../context/05_application_responsibilities.md)'s boundary as three concrete frontend enforcement points, since a policy statement alone is not self-enforcing in a single shared codebase:

1. **Routing:** two top-level route groups (above) — no shared route serves both.
2. **State:** Landing holds no Project-level or app-level state (above).
3. **Components:** Landing never imports a Workspace Feature's components, and no Workspace Feature imports Landing's page components; both may import Design System primitives.

Any code review or implementation that violates one of these three points is treated as a Landing/Workspace boundary defect, not a stylistic preference.
