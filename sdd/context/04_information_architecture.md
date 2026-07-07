# Information Architecture and Navigation Model

**Refs:** → [00_index](../00_index.md) · [Core User Journey](./03_personas_and_journey.md) · [Application Responsibilities](./05_application_responsibilities.md)

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

**Ownership note:** this document owns the screen inventory and navigation structure. [Application Responsibilities](./05_application_responsibilities.md) owns *which Application* is responsible for each part of this tree — this document does not restate those responsibility boundaries, only the navigable shape within them.
