# Design System

**Refs:** → [00_index](../00_index.md) · [Frontend Architecture](../frontend/01_architecture.md) · [Workspace Feature Specifications](../workspace/features/000_index.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [ADR-0004](../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md) · [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md)

Created because a second consumer needs this shared contract — Landing and Workspace both consume one Design System per the Development Target's explicit "one Design System" constraint, meeting the framework's cross-cutting-capability trigger (`02_directory_structure.md`: created "as soon as a second layer needs to agree on a shared contract"). Originally defined reusable UI concepts only, ahead of any real code; real components now exist at `app/src/design-system/` — this document owns the architectural contract and inventory, never a duplicate listing of the implementation itself; the code is the single source of truth for exact props/markup, this document is the single source of truth for what belongs here and why.

## Purpose

A single set of presentational, stateless UI primitives that Landing and Workspace both compose, so that shared visual language doesn't have to be reinvented per Application, and so that [Frontend Architecture](../frontend/01_architecture.md)'s Shared Component Boundaries (no business logic in shared components) has something concrete to point at.

## Design Tokens (Conceptual)

*(Inferred — no visual identity is specified anywhere in prior passes; this defines the token *categories* every component below needs, not their values.)*

| Token category | Purpose |
|---|---|
| Color roles | Semantic roles (e.g., primary, neutral, success, warning, danger) — never a component hardcoding a raw color; components reference a role |
| Spacing scale | A consistent step scale for padding/gaps, so every component's spacing is drawn from the same scale rather than ad hoc values |
| Typography scale | A small set of named text styles (e.g., heading tiers, body, caption) shared by both Applications |
| Motion | A small set of named durations/easings for animated primitives (loading spinners, transitions, progress fills) — added after an audit found three components hardcoding raw duration/easing values in their own CSS instead of a shared token, the same category of gap already forbidden for color/spacing/typography |

Actual values (hex codes, pixel sizes, durations) are implementation detail, out of scope for this document. **Elevation is deliberately not yet a token category** — no component currently uses a shadow/elevation effect; adding one now would have zero real consumers, exactly the speculative abstraction this project's promotion rule exists to prevent. Add it the first time a real component needs it.

## Component Inventory

*(Inferred from every UI need surfaced across the Feature Specifications' User Interaction sections and Workspace Architecture — see Coverage Check below for the derivation.)*

| Component | Purpose | Used by |
|---|---|---|
| Text Field (single-line) | Short text entry | Project Name |
| Text Area (multi-line) | Long-form text entry | Canvas fields, Risk Notes, MVP Scope statement, Assumption statement/method/criterion |
| Primary Button | The one deliberate, forward-moving action on a screen | Create Project, mark section complete, add Feature/Assumption, confirm Build-Ready |
| Secondary Button | A supporting, non-primary action | Archive, reopen Scope/Planning, reorder |
| Text Button | A low-emphasis, inline-link-styled action — consolidated from a duplicate ad hoc styled-button pattern found during the Coverage Check's consolidation audit below | Show/hide archived Projects, dismiss an inline panel |
| Checkbox | A binary selection control — consolidated from a duplicate raw `<input type="checkbox">` found during the same audit | Feature Suggestion Assistant's per-row accept/reject selection |
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
| Progress Indicator | A compact "step N of M" presentation, generic to any sequential flow | Business Structuring's guided question flow ([ADR-0004](../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md)) |
| Choice List | A set of 3–5 selectable preset options plus an always-available custom-input path, generic to any select-or-customize interaction | Business Structuring's per-question preset selection ([Question Model](../workspace/features/02_1_question_model.md)) |
| Transition Wrapper | A generic enter/exit transition between two sequential views | Business Structuring's question-to-question advancement |

**Progress Indicator, Choice List, and Transition Wrapper are generic interaction primitives, not Business Structuring-specific business logic** — added directly to the Design System rather than staying Feature-owned first, on the same basis as Stepper and Chip already were: a sequential-progress presentation and a pick-one-or-customize interaction are patterns any future guided flow could reuse, unlike a component that would need to know what a "Validation Checklist" is. This does not relax the [Frontend Architecture](../frontend/01_architecture.md) promotion rule for genuinely Feature-specific patterns — it recognizes that these three aren't one.

## Composition Rules

- A primitive never contains business logic, Feature-specific copy, or a persistence call — it receives content and emits interaction events; it does not know what a "Validation Checklist" is. (Restates [Frontend Architecture](../frontend/01_architecture.md)'s Shared Component Boundaries — canonically owned there; this document owns the primitive inventory itself.)
- Landing composes these primitives for marketing-oriented layouts (Hero, Feature Showcase Card, Roadmap Stepper); Workspace composes the same primitives for functional, data-dense layouts (List Item/Card, Status Badge, Text Area) — same primitives, different composition, consistent with Landing/Workspace separation.
- A new Feature-specific visual pattern is added to this inventory only once a second Feature (or Landing) needs the identical pattern — per [Frontend Architecture](../frontend/01_architecture.md)'s promotion rule; until then it stays owned by the single Feature that needs it.

## Localization Requirements

*(Explicit — this task's product decision; see [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md). This section owns the component-level contract every primitive must honor; the layer that resolves text and the persisted language fact are owned elsewhere — see [Frontend Architecture](../frontend/01_architecture.md#localization-layer) and [Data & State](../workspace/02_data_and_state.md#application-level-state-non-project) respectively.)*

- **Every visible string a primitive renders must come from localization resources, passed in as data** — no primitive (Button, Page Header, Empty State Pattern, etc.) hardcodes label text, placeholder text, or copy of any kind. This extends the existing Composition Rule ("a primitive never contains business logic, Feature-specific copy...") to cover language as well as business meaning.
- **Every primitive must support both Korean and English content without a layout break.** Korean and English differ substantially in character width and line-wrapping behavior — a primitive validated only against English text is not considered complete.
- **Layout must tolerate English expansion.** Korean UI text is frequently more compact than its English equivalent for the same meaning; no primitive may assume a fixed width or a fixed number of lines sized to Korean content. Buttons, badges, chips, and navigation labels in particular must reflow or resize rather than clip when English text is longer.
- **Text truncation rules must be defined wherever a primitive has a genuine space constraint** (e.g., a Status Badge or List Item/Card title in a fixed-width layout) — the primitive's own documentation must state whether it wraps, truncates with an ellipsis, or reflows the surrounding layout; "it happens to fit in English" is not an acceptable de facto rule.

## Coverage Check Against V1 Needs

Every row in every Feature Specification's User Interaction section, plus Workspace Architecture's screen needs, was checked against the inventory above:

| Source | UI need | Covered by |
|---|---|---|
| All 5 Features | Empty / Loading / Error states | Empty State Pattern, Loading Indicator, Inline Alert |
| Project Management | Project Name entry, list display | Text Field, List Item/Card |
| Business Structuring | One question at a time, preset-or-custom answer, visible progress, Review step, question-to-question transition | Text Area (custom answers, Risk Notes), Choice List (presets), Progress Indicator, Transition Wrapper, Page Header (Review) |
| MVP Planning | Scope entry, Feature list, priority, scope tag | Text Area, List Item/Card, Priority Indicator, Tag/Chip |
| Validation Planning | Assumption entry, status | Text Area, Status Badge |
| Project Summary | Lifecycle stage, blocking-artifact pointer, Build-Ready confirmation | Status Badge, Readiness Callout, Confirmation Prompt, Primary Button |
| Workspace Architecture | Persistent Project navigation | Section Navigation Shell |
| Landing (context/05) | Home, Features, Roadmap, CTA | Hero Section, Feature Showcase Card, Roadmap Stepper, Primary Button |

**Result (original pass): no gap found** for the form-based Business Structuring UI. **Result (this pass, guided-flow re-check):** three gaps found and closed — Progress Indicator, Choice List, and Transition Wrapper did not exist in the original inventory because the form-based Canvas had no sequential, one-at-a-time interaction to support. Added above, per [ADR-0004](../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md). Every other UI need from the original Coverage Check still holds unchanged.

**Result (this pass, component consolidation audit):** three duplicate ad hoc implementations found outside this boundary and consolidated into it — a text-link-styled raw `<button>` (Project Management's show/hide archived control), a second raw `<button>` pair (the internal Analytics Dashboard's sign-out and close controls), and a raw `<input type="checkbox">` (Feature Suggestion Assistant's per-row selection). All three now consume the Button (`text` variant, newly added) and Checkbox (new) primitives above, with no visible behavior change. No Icon component exists in the current implementation — a few inline unicode glyphs (×, →, ↓) are used ad hoc where one is needed; not consolidated into a dedicated primitive, since nothing today justifies more than what those glyphs already do, per the promotion rule above (a component is added once a real need, not a hypothetical one, exists).

## Architectural Boundary — Not Just a Component Library

The Design System is a **consumption boundary**, not merely a convenient library to borrow from. Every other layer (Workspace Features, AI Capabilities, Landing pages, internal tooling like the Analytics Dashboard) consumes it only through its public component contract (props in, rendered markup and interaction events out) — never a concrete CSS value, a raw HTML element duplicating what a primitive already provides, or an implementation detail of *how* a primitive renders. [Frontend Architecture](../frontend/01_architecture.md#shared-component-boundaries) already established the reverse direction of this same rule (the Design System must never leak business logic outward); this states the other direction explicitly, since the consolidation audit above found three real violations of it in practice, not just a hypothetical risk. If a UI need turns out to be genuinely reusable rather than truly Feature-specific, the Composition Rules above and [Frontend Architecture](../frontend/01_architecture.md#component-ownership)'s Promotion Rule already govern how it enters this boundary — this section does not restate that rule, only closes the loop on why nothing is permitted to sit permanently outside it once it qualifies.

**Only one Default Design System is implemented today.** This section states the boundary the architecture already enforces for that one implementation; it does not build a second one, a runtime theme switcher, or a plugin system ahead of a real need for one — consistent with this project's "minimum abstraction until a concrete second consumer exists" discipline, applied elsewhere to Platform Services' Admission Criteria and the AI/Analytics Provider Interfaces.

## Design System Entry Point

`app/src/design-system/index.ts` is the **sole enforced public boundary** — every consuming layer imports components only from this one module (`import { Button, Card, ... } from "../../design-system"`), never from an individual component file inside the directory directly. This was already true in practice for all existing consumers before being stated as a rule here; stating it explicitly turns an accidental-so-far convention into an enforced one.

This single seam is also the entire replaceability mechanism — deliberately nothing more. Replacing the Default Design System with a future alternate one means changing what `index.ts` re-exports; no registry, factory, plugin loader, or dependency-injection layer sits on top of it, because none would do anything a plain re-export doesn't already do with exactly one active implementation and no runtime selection (explicitly out of scope — see Theme/Design-System Replaceability above). Where a second implementation's own files would physically live is a decision deferred to when one actually exists, per this project's "decide real structure only once the real thing exists" discipline (the same discipline already applied to deferring Search's actual architecture to V3 planning) — not decided speculatively here.

## Design Tokens, Theme, and Design System — Three Distinct Concepts

These three terms are easy to conflate and are given one precise meaning each, since they imply different swap mechanisms with different blast radii:

- **Design Tokens** are the parameterized values themselves (Color roles, Spacing scale, Typography scale, per Design Tokens above) — realized in the real implementation as CSS custom properties (`app/src/design-system/tokens.css`). A component never hardcodes a raw color, spacing, or font value; it only ever references a token.
- **A Theme is an alternate set of Design Token values, consumed by the same, unchanged component implementations.** This is the lightweight case, and it is not hypothetical — it already exists today: `tokens.css`'s `@media (prefers-color-scheme: dark)` block is a real, working theme (dark mode), swapping every color token without touching a single component. A future named theme (not just an OS-preference-driven one) follows the identical mechanism: a new set of token values, zero component changes.
- **An alternate Design System is a different component implementation entirely** (different markup, potentially a different underlying library) satisfying the same consumption contract Architectural Boundary above defines. This is a heavier replacement than a Theme — swapping token values alone cannot achieve it, since it requires replacing the component modules themselves, not just the values they read. No alternate Design System exists or is concretely planned; if one is ever built, it is admitted the same way every other cross-cutting capability in this project is — once a real, concrete need exists, never speculatively ahead of one.

Swapping either a Theme or an alternate Design System touches zero consuming Feature code either way — only the mechanism and blast radius inside this boundary differ, which is exactly why keeping the two concepts distinct matters.

## Adding a Second Design System — What Would Actually Change

Not built here — this is a proof of the boundary's separation, not a second implementation. To introduce a genuinely alternate Design System (different components, not just different tokens):

**Would change:**
- `app/src/design-system/index.ts` — its exports would point at the new implementation's components instead of (or alongside, behind a selection point not built here) the current ones.
- A new set of component files implementing the same contract each current primitive already satisfies (same props-in/events-out shape Composition Rules above requires) — their physical location is an implementation decision made at that time, not fixed in advance.

**Would remain untouched:**
- Every one of the 20+ files across Landing, Workspace Features, the AI Platform's UI, and the internal Analytics Dashboard that import from `../../design-system` — none reference an individual component file or any implementation detail, per the Entry Point rule above.
- `sdd/frontend/01_architecture.md`'s Component Ownership tiers and Shared Component Boundaries — unaffected, since they govern the contract, not which implementation satisfies it.
- Localization, routing, state ownership, and every other architectural layer this document does not own.

This is verifiable today, not just asserted: every consumer already goes through `index.ts` (confirmed by inspection — zero files reach past it), so the "only `index.ts` and the new component files change" claim is a direct consequence of an already-true fact, not a forward-looking hope.

## Design System HTML Catalog

A living, human-readable catalog of every primitive above — its variants and interactive states — lives at the `/design-system` route in the real application (`app/src/pages/design-system-catalog/DesignSystemCatalogPage.tsx`), rendering the actual imported primitives directly rather than a separately hand-authored mock-up. This is a deliberate choice over a static, hand-written HTML file: a hand-authored file would drift from the real components' markup and CSS the moment either changes, which would directly contradict the Maintenance Rules below; a route composing the real components cannot drift, by construction, since it *is* the real implementation. **This means the Catalog is client-rendered** — its content is produced by React executing in a browser, not present in the raw HTTP response or a plain `view-source`; viewing it requires a JS-executing browser at the route itself, the same way every other screen in this application does.

## Maintenance Rules

- **Every newly introduced shared UI component is added to this Design System** (`app/src/design-system/`) and to this document's Component Inventory, in the same task that introduces it — never left as a one-off in a Feature module once a second consumer is known to need it, per the existing promotion rule.
- **Whenever the Design System changes, the HTML Catalog (`/design-system` route) is updated in the same change** — since the Catalog renders the real components, most changes require no catalog edit at all; a change is required only when a *new* primitive, variant, or state is added and should be demonstrated.
- **The Catalog is living documentation, not a point-in-time snapshot** — it must always represent the current implementation; an outdated Catalog is treated as a defect in the same change that caused the drift, not a separate cleanup task.
