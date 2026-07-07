# Frontend Architecture

**Refs:** → [00_index](../00_index.md) · [Workspace Architecture](../workspace/01_architecture.md) · [Workspace Data & State](../workspace/02_data_and_state.md) · [Feature Specifications](../workspace/features/000_index.md) · [Design System](../design-system/01_design_system.md) · [Deployment Strategy](../infra/01_deployment.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md)

Created now, at the point real frontend code is about to be written — per `10_bootstrap_guide.md` Step 3 ("as soon as that layer exists as real code, even a skeleton"). This is the technical realization layer: `sdd/context/`, `sdd/workspace/` and Landing's spec define *what* each Application does; this document defines *how one shared codebase* implements both, per the Development Target's explicit "one React application, one Router, one Design System" constraint. Conceptual only — no component code, no file trees with real paths, per this task's instruction.

## React Router Structure

*(Explicit that Landing and Workspace share one Router; the route grouping below is Inferred.)*

One Router, two top-level route groups — this grouping is the primary mechanism enforcing Landing/Workspace separation at the routing layer:

| Route group | Screens | Owned by |
|---|---|---|
| Public (Landing) | Home, Features, Roadmap, Call-to-Action | Landing (per [Application Responsibilities](../context/05_application_responsibilities.md)) |
| Workspace | Dashboard/Project List, and per-Project: Business Structuring, MVP Scope/Feature Planning, Validation Checklist, Project Summary | Workspace (per [Workspace Architecture](../workspace/01_architecture.md)) |

Each Project's screens are addressable under that Project's own identity (per each Feature Specification's Deep Link Considerations) — consistent with [Workspace Architecture](../workspace/01_architecture.md)'s non-linear navigation model: every section is directly reachable, not nested behind a forced sequence.

**Business Structuring's guided questions are not separate routes.** Per [ADR-0004](../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md) and [Business Structuring](../workspace/features/02_business_structuring.md)'s Deep Link Considerations, the entire guided flow (five questions + Review) lives under the one Business Structuring route already listed above; which question is currently shown is local view state (see State Ownership below), not a router concept. This keeps the "no unnecessary routes" instruction satisfied and matches [Workspace Data & State](../workspace/02_data_and_state.md)'s rule against persisting a separate question-position pointer.

## Localization Layer

*(Explicit — this task's product decision; see [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md).)*

A dedicated layer sits between the Application shell and Feature Modules — the single place that resolves a `localizationKey` (per [Question Model](../workspace/features/02_1_question_model.md#localization)) or any other UI-text identifier into displayed text for the currently selected `language` ([Data & State](../workspace/02_data_and_state.md#application-level-state-non-project)):

```
Application
    │
    ▼
Localization Layer      ← resolves text identifiers into displayed strings, per current language
    │
    ▼
Feature Modules          ← consume resolved text; own no localization logic of their own
    │
    ▼
UI Components            ← render whatever text they're given; never hardcode it
```

This layer serves **both** Landing and Workspace — it sits above the Landing/Workspace route-group split (per React Router Structure above), not inside either one, consistent with Landing and Workspace already sharing one Design System and one Router. Landing's own UI text (Home/Features/Roadmap copy, CTA labels) is equally in scope for this layer; nothing about Landing/Workspace separation exempts Landing's copy from localization.

**Rules:**
- **UI components must not contain hardcoded user-facing strings.** A component receives text as data (via the Localization Layer, ultimately), the same way it receives any other prop — this is the same Shared Component Boundaries discipline already stated below, applied specifically to display text.
- **Features access text through localization resources, never by embedding strings directly in Feature-owned components or logic.** A Feature module composing a Design System primitive supplies a text identifier (or already-resolved text obtained from the Localization Layer), never a raw literal string meant for the user to read.
- **The localization implementation itself must be replaceable** — mirroring the Preset Provider seam already established for presets ([Preset Strategy](../workspace/features/02_1_question_model.md#preset-strategy)), the mechanism that resolves a key into text (V1: a static resource lookup for `ko`/`en`) must be swappable for a richer implementation later (e.g., additional languages, a remote resource source) without every Feature or component changing.

**Ownership boundary:** this section owns *where in the architecture localization lives and how Feature Modules/UI Components consume it*. It does not own the component-level contract for what a compliant component looks like (that's [Design System](../design-system/01_design_system.md#localization-requirements)), nor the Question/Preset content schema (that's [Question Model](../workspace/features/02_1_question_model.md#localization)), nor the persisted `language` fact itself (that's [Data & State](../workspace/02_data_and_state.md#application-level-state-non-project)).

## Feature Boundaries

Each of the five Workspace Feature Specifications ([000_index](../workspace/features/000_index.md)) maps to one frontend module. **A Feature module must never import another Feature module's internals directly** — cross-Feature interaction happens only through the shared Project-level state (see State Ownership below) or through navigation, never a direct component/logic import. This is the frontend-code enforcement of each Feature Specification's own "Relationships with Other Features" table — it must not be possible in code to accidentally couple two Features that spec explicitly kept independent.

## Component Ownership

Three tiers, in order of how broadly a component may be reused:

| Tier | Scope | Owned by |
|---|---|---|
| Design System primitives | Purely presentational, stateless UI building blocks (inputs, buttons, cards, status indicators, layout primitives) | [Design System](../design-system/01_design_system.md) |
| Feature-owned components | Specific to one Feature's own screens (e.g., an Assumption row) | The owning Feature module |
| App-shell components | Cross-Feature but Workspace- or Landing-internal (Workspace's persistent Project navigation, Landing's page chrome) | The frontend layer itself — not any single Feature, not the Design System |

**Promotion rule:** a component moves from Feature-owned to Design System only when a second Feature (or Landing) needs the identical pattern — mirroring the framework's "a cross-cutting capability is created only when a second consumer needs the contract" rule, applied at component granularity rather than document granularity.

## Shared Component Boundaries

The Design System must never contain business logic, Feature-specific copy, or direct persistence calls — it renders what it's given and emits events; it does not know what a "Validation Checklist" or "Canvas" is. Feature modules compose Design System primitives and supply all business meaning. This boundary is what lets Landing and Workspace share the Design System safely without either leaking into the other.

## State Ownership

| State tier | Scope | Written by |
|---|---|---|
| Local/transient | In-progress edits before a save fires (the Draft state, per [Workspace Data & State](../workspace/02_data_and_state.md)); Business Structuring's current-question-index within its guided flow | The component currently being edited, only — the current-question-index is derived at load time from Canvas field completeness (per [Workspace Data & State](../workspace/02_data_and_state.md)) and only overridden locally by explicit forward/back navigation within the same session, never persisted |
| Project-level | The currently-open Project's full data (Canvas, Risk Notes, MVP Scope, Features, Validation items) | Only the owning Feature module for its own slice — e.g., MVP Planning writes Scope/Features, never Validation items |
| App-level | The Project list (Dashboard) and each listed Project's current lifecycle stage; the current `language` ([Data & State](../workspace/02_data_and_state.md#application-level-state-non-project)) | Project Management (list membership) and the derivation described in [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md) (stage); the Localization Layer (language) |

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
3. **Components:** Landing never imports a Workspace Feature's components, and no Workspace Feature imports Landing's page components; both may import Design System primitives and both consume the shared Localization Layer (above) — sharing the Localization Layer, like sharing the Design System, is not a boundary violation, since neither carries Feature-specific business logic.

Any code review or implementation that violates one of these three points is treated as a Landing/Workspace boundary defect, not a stylistic preference.
