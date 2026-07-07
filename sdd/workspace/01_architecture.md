# Workspace Architecture

**Refs:** → [00_index](../00_index.md) · [Product Vision](../context/01_product_vision.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [Core User Journey](../context/03_personas_and_journey.md) · [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md) · [Data & State](./02_data_and_state.md) · [Feature Specifications](./features/000_index.md)

Created ahead of any real Workspace code, per the SDD Framework's "spec leads implementation" principle (`03_document_lifecycle.md`, Type 3: a contract document is created "before or alongside the first real implementation ... spec leads implementation"). This is the point at which Workspace has enough definition to warrant its own architecture document rather than remaining a subsection of the shared context layer.

## Purpose

*(Explicit, by reference)* — Workspace is the primary MVP: the actual web application in which a user structures and validates a business idea (see [Product Vision](../context/01_product_vision.md) and [Application Responsibilities](../context/05_application_responsibilities.md)). This document does not restate *why* Hypora exists — see Product Vision/Positioning for that — it defines *what the Workspace application itself is built to do*.

## Responsibilities

**In scope for Workspace** *(Explicit, per [Application Responsibilities](../context/05_application_responsibilities.md))*:
- Project management (create, list, select, archive a Project)
- Business Canvas authoring
- MVP Scope definition
- Feature Planning
- Validation Checklist
- Project Summary (read view)

**Explicitly NOT part of Workspace:**
- Marketing content, value-proposition messaging, or roadmap presentation — owned entirely by Landing; Workspace never renders Landing's pages or duplicates its copy (see [Application Responsibilities](../context/05_application_responsibilities.md)'s Cross-Application Boundaries).
- Any AI-generated suggestion, assistance, or auto-completion — out of scope until V2 (see [Product Roadmap](../context/01_product_vision.md#product-roadmap)); V1 Workspace is 100% manual authorship.
- Authentication, multi-user accounts, or session management — not part of V1 scope (see [Product Scope](../context/02_product_scope.md)).
- Cross-project comparison views — this would serve the Idea Explorer Future Persona specifically; deferred per the [Workspace Mental Model Review](#workspace-mental-model-review) below.
- Persistence implementation details — Workspace consumes Platform API's conceptual contract; it does not define its own independent storage mechanism (see [Data & State](./02_data_and_state.md)).

## Information Architecture

*(Relocated from `context/04_information_architecture.md` — Workspace's information architecture is now canonically owned here. `context/04` retains a pointer rather than the full subtree; see that document's note.)*

```
Workspace (Application)
├── Dashboard / Project List     — every Project the user has created, each showing its current
│                                   lifecycle stage (see Business Idea Lifecycle)
└── Project (one per business idea)
    ├── Business Canvas
    │   ├── Business Idea
    │   ├── Problem
    │   ├── Target Customer
    │   ├── Solution
    │   └── Value Proposition
    ├── MVP Scope
    ├── Feature Planning
    ├── Validation Checklist
    └── Project Summary            — read-only aggregate view; not a separately stored artifact
                                      (see Data & State)
```

**On "Dashboard" vs. "Project List":** these are the same screen, not two — the Project List already fulfills a Dashboard's role once it displays each Project's lifecycle stage, per the [Workspace Mental Model Review](#workspace-mental-model-review) carried over from the prior specification pass. No separate Dashboard screen is introduced; the existing name is kept rather than renamed without cause.

## Navigation Model (Workspace-internal)

*(Relocated from `context/04_information_architecture.md`.)*

| Level | Model |
|---|---|
| Entry | Landing's call-to-action leads into the Dashboard / Project List — see [Application Responsibilities](../context/05_application_responsibilities.md) for the cross-Application rule; this document does not restate it. |
| Dashboard / Project List → Project | Selecting a Project enters that Project's own navigation scope. |
| Within a Project | Business Canvas, MVP Scope, Feature Planning, and Validation Checklist are siblings — reachable in any order (non-linear), with Project Summary as a read-only aggregate, not a step in the sequence. |
| Canvas internal order | The five Canvas fields follow the fixed suggested order from [Core User Journey](../context/03_personas_and_journey.md): Business Idea → Problem → Target Customer → Solution → Value Proposition. |

## Workspace Mental Model Review

*(Relocated from `context/04_information_architecture.md`, unchanged in substance — restated here because it is now Workspace-internal reasoning, not cross-Application IA.)*

Navigation remains organized around **Projects and their artifacts**, not around lifecycle stages as top-level screens. The [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md)'s stages are a derived status, layered onto the Dashboard/Project List and each Project's own view (showing which artifact is blocking the next transition) — not a parallel navigation structure. See the [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md) document for the state/transition model this status is derived from. Revisit this recommendation only if the Idea Explorer persona is promoted from Future to Secondary/Primary (see [Personas](../context/03_personas_and_journey.md)).

## Feature Inventory (V1)

*(Inferred — the brief and prior specification passes establish the artifact list; this inventory sorts them into build-priority tiers, which is new.)*

### Core Features (required for V1 to ship)

| Feature | Why core | Feature Specification |
|---|---|---|
| Project create / list / select / archive | Without this, no Project exists to structure — the entry point to every other feature | [Project Management](./features/01_project_management.md) |
| Business Canvas authoring (5 fields) + Risk Notes | The Primary Persona's core need; directly implements the Structuring lifecycle stage | [Business Structuring](./features/02_business_structuring.md) |
| MVP Scope + Feature Planning | Required to reach the Scoped lifecycle stage; a named V1 deliverable per the product brief | [MVP Planning](./features/03_mvp_planning.md) |
| Validation Checklist | Required to reach Validating/Validated; the product's differentiating "validation as first-class" principle | [Validation Planning](./features/04_validation_planning.md) |
| Project Summary (read view) + Build-Ready confirmation | A named V1 deliverable; the aggregate view a Solo Founder reviews before treating a plan as Build-Ready | [Project Summary](./features/05_project_summary.md) |
| Lifecycle stage display on Dashboard/Project | Required for the Workspace Mental Model Review's recommendation to hold — without it, lifecycle exists only in the domain model with no user-visible surface | Cross-cutting — see [Project Summary](./features/05_project_summary.md) and [Project Management](./features/01_project_management.md) |

**This table only categorizes** (core vs. optional vs. future); each row's Purpose, Responsibilities, User Stories, and Acceptance Criteria are owned by its linked Feature Specification under [`features/`](./features/000_index.md) — this table must not be extended with that level of detail.

### Optional Features (valuable, not release-blocking)

| Feature | Why optional, not core |
|---|---|
| Export/print a completed Project Summary | Named as an open question in [Product Scope](../context/02_product_scope.md#open-questions) — not yet resolved as required; ship V1 without it unless resolved before release |
| Freeform notes attached to a Canvas field | Not named in the brief; a plausible convenience, not required to reach any lifecycle transition |

### Future Features (explicitly deferred, V2+)

| Feature | Roadmap stage |
|---|---|
| AI-assisted Canvas suggestions | V2 |
| Market/competitor discovery surfaced in Workspace | V3 |
| Go-to-market recommendations against a Validated project | V4 |
| Requirement/SDD/development-plan generation from a Build-Ready project | V5 |
| Cross-project comparison view | Not yet scheduled — tied to the Idea Explorer persona's promotion (see [Personas](../context/03_personas_and_journey.md)) |

## User Flow (Workspace View)

*(Extends, does not duplicate, the canonical [Core User Journey](../context/03_personas_and_journey.md) — that document owns the step sequence itself; this section only maps those steps onto Workspace's own screens.)*

| Journey step (canonical) | Workspace screen |
|---|---|
| Enter the Workspace, create a project | Dashboard / Project List → "new Project" action |
| Structure the idea across the Canvas | Project → Business Canvas |
| Define MVP Scope | Project → MVP Scope |
| Feature Planning | Project → Feature Planning |
| Validation Checklist | Project → Validation Checklist |
| Review the Project Summary | Project → Project Summary |

No new step is introduced beyond what [Core User Journey](../context/03_personas_and_journey.md) already defines; this table exists only to remove any ambiguity about which screen serves which journey step.
