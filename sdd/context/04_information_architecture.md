# Information Architecture and Navigation Model

**Refs:** → [00_index](../00_index.md) · [Core User Journey](./03_personas_and_journey.md) · [Application Responsibilities](./05_application_responsibilities.md) · [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md)

*(Inferred — structures the V1 feature list from the brief into a navigable information hierarchy; no screen list or nav model is given explicitly.)*

## Information Architecture

```
Hypora (Product)
│
├── Landing (Application — public, unauthenticated)
│   ├── Home                — value proposition, core pitch
│   ├── Features             — feature showcase
│   ├── Roadmap               — V1–V5 stages, future AI vision
│   └── Call-to-Action        — entry point into the Workspace
│
└── Workspace (Application — the product itself)
    ├── Project List           — every project the user has created
    └── Project (one per idea)
        ├── Canvas
        │   ├── Business Idea
        │   ├── Problem
        │   ├── Target Customer
        │   ├── Solution
        │   └── Value Proposition
        ├── MVP Scope
        ├── Feature Planning
        ├── Validation Checklist
        └── Project Summary     — read view of the full structured plan
```

Platform API is not a navigable surface — it is the backend responsibility layer described in [Application Responsibilities](./05_application_responsibilities.md), currently realized as LocalStorage calls made from within Workspace rather than a separate navigable Application.

## Navigation Model

| Level | Model |
|---|---|
| Landing ↔ Workspace | One-directional entry point: Landing's Call-to-Action leads into the Workspace. Workspace never links back into Landing's marketing pages as part of its own flow (a user could navigate there manually, but Workspace doesn't route through Landing). |
| Within Workspace | Project List is the root; selecting a project enters that project's own navigation scope. |
| Within a Project | The five Canvas sections, MVP Scope, Feature Planning, and Validation Checklist are siblings under one project — reachable in any order (non-linear), with Project Summary as a read-only aggregate view, not a step in the sequence. |
| Canvas internal order | The five Canvas fields are presented in the fixed order given in [Core User Journey](./03_personas_and_journey.md) (Business Idea → Problem → Target Customer → Solution → Value Proposition) as the suggested-but-not-enforced completion order. |

## Workspace Mental Model Review

*(Inferred — the brief gives a feature list, not a navigation philosophy; this review evaluates the existing IA above against the newly-introduced [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md) (ADR-0002) and states a recommendation with reasoning, since the two were designed at different times and must be reconciled explicitly rather than left to coincidentally agree.)*

**Question evaluated:** should Workspace navigation revolve around **Projects** (the current model — Canvas/MVP Scope/Feature Planning/Validation Checklist as sibling screens under a project), or around the **lifecycle stages** themselves (e.g., a "Validating" view listing all projects currently in that stage, a "Build-Ready" view, etc.)?

**Recommendation: keep navigation organized around Projects and their artifacts (the existing IA above); do not restructure navigation around lifecycle stages as top-level screens.** Reasoning:

- The lifecycle (Captured → Structuring → Scoped → Validating → Validated → Build-Ready → Archived) is a **derived status**, not a distinct body of content — there is nothing to "open" inside a lifecycle stage that isn't already one of the four existing artifacts (Canvas, Scope, Planning, Checklist). Restructuring navigation around stages would either duplicate the existing screens under a new grouping, or hide them behind an extra layer with no added content — both violate the [Progressive Disclosure](./01_product_vision.md#product-principles) and simplicity principles.
- A Solo Founder (the Primary Persona, see [Personas](./03_personas_and_journey.md)) works on one project at a time; a stage-first navigation model (e.g., "show me everything in Validating, across projects") primarily serves the Idea Explorer's cross-project comparison need — which is explicitly a **Future Persona**, not Primary or Secondary. Optimizing V1's core navigation for a not-yet-prioritized persona would be premature.
- The lifecycle's actual value to navigation is as a **status indicator layered onto the existing Project List and Project screens** — not a replacement structure. This keeps the existing IA fully intact while still making lifecycle state visible.

**Concrete adjustment to the IA above:** the Project List (per the tree at the top of this document) should display each project's current lifecycle stage as a visible attribute per list item, and a Project's own navigation should indicate which of its four artifacts (Canvas/Scope/Planning/Checklist) are blocking its next lifecycle transition (per the guards in the [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md)). This is a display/labeling addition to the existing tree, not a structural change to it — no new top-level screen is introduced, and the IA diagram above remains accurate as written.

**When this recommendation should be revisited:** if the Idea Explorer persona is ever promoted from Future to Secondary or Primary (see [Personas](./03_personas_and_journey.md)), a cross-project, stage-grouped view becomes justified — at that point, re-evaluate this section rather than assuming the conclusion still holds.

**Ownership note:** this document owns the screen inventory and navigation structure. [Application Responsibilities](./05_application_responsibilities.md) owns *which Application* is responsible for each part of this tree — this document does not restate those responsibility boundaries, only the navigable shape within them. [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md) owns the lifecycle states/transitions themselves — this document treats lifecycle stage only as a display concern on top of that canonical model, never redefining a state or guard.
