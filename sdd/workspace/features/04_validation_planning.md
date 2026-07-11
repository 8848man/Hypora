# Feature: Validation Planning

**Refs:** → [Features Index](./000_index.md) · [Workspace Architecture](../01_architecture.md) · [Workspace Data & State](../02_data_and_state.md) · [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) · [Business Structuring](./02_business_structuring.md) · [Product Scope](../../context/02_product_scope.md) · [AI Ownership Model](../../ai/03_ownership_model.md) · [Future Expansion Strategy](../../context/06_future_expansion_strategy.md)

*(Explicit — the brief names Assumptions, Validation Methods, and Success Criteria directly.)*

## Purpose

Let a user turn their hypothesis into a set of testable assumptions — each with a way to check it and a definition of what "confirmed" looks like — so that "validated" means something specific and checkable, not a feeling.

## Responsibilities

**In Scope:**
- Authoring Validation Checklist items (Assumptions), each with: the assumption statement, an intended validation method, and a success criterion for that specific assumption.
- Resolving each item's status (validated / invalidated / open).
- Driving the Project's Validating lifecycle stage and its transition to Validated once every item is resolved (see [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)).

**Out of Scope:**
- Actually running the validation method (e.g., conducting a customer interview) — Hypora records the plan and its outcome; it does not execute external validation activities.
- The product's own success metrics (North Star / Supporting Metrics in [Product Scope](../../context/02_product_scope.md#success-metrics)) — those measure whether *Hypora* is succeeding as a product; this Feature's "success criteria" are per-assumption, user-authored, and about the *user's business idea*, never conflated with the product's own metrics.
- Business Structuring's Risk Notes (see [Business Structuring](./02_business_structuring.md)) — this Feature does not automatically import or convert them; a user may draw on their own Risk Notes when authoring an Assumption, but that's a manual, not automatic, connection in V1.
- Any AI-suggested assumption, method, or criterion — out of scope until V2+ (Market Intelligence / Go-to-Market stages may inform this later; see Future Expansion below).

## User Stories

- As the **Primary Persona (Solo Founder)**, I want to write down what I'm assuming and how I'll check it, so that "I think this will work" becomes something I can actually test.
- As the **Primary Persona**, I want to mark an assumption as validated or invalidated, so that I have an honest record of what's confirmed versus still a guess.
- As the **Secondary Persona (Early-Stage Team Lead)**, I want the team to see which assumptions are still open, so that we don't start building on an unconfirmed premise.

## Acceptance Criteria

- Each Validation Checklist item requires an assumption statement to exist before a validation method or success criterion is meaningful — but this Feature does not block partial authoring (a user may draft an assumption before filling in its method/criterion).
- A Project transitions from Validating to Validated only when every Validation Checklist item has an explicit resolution (validated or invalidated) — an empty checklist does not satisfy this guard, per [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s Invalid Transitions.
- An "invalidated" resolution does not delete the item — it remains as a recorded, resolved fact (per the domain model's guard: "every item must be explicitly validated or explicitly invalidated").
- This Feature never marks an item's status automatically — every resolution is an explicit user action.

## Relationships with Other Features

| Feature | Relationship |
|---|---|
| Business Structuring | May inform an Assumption's content via Risk Notes, but no automatic conversion exists (see [Business Structuring](./02_business_structuring.md)'s boundary section) |
| MVP Planning | Precedes Validation Planning — a Project must reach Validating (Scope + Feature Planning complete) before this Feature's transition-driving role applies, though items may be drafted earlier |
| Project Summary | Reads Validation Checklist resolution state to report validation progress and to gate the Build-Ready confirmation it owns |

## Dependencies on Product Lifecycle

Owns the **Validating** stage and the **Validating → Validated** transition guard (every item resolved) — see [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md). Does not own the Validated → Build-Ready transition — see [Project Summary](./05_project_summary.md).

## Dependencies on Workspace

Depends on the Validation Checklist screen owned by [Workspace Architecture](../01_architecture.md); depends on the Validation item data ownership (assumption / method / criterion / status) defined in [Workspace Data & State](../02_data_and_state.md). Does not redefine either.

## Future Expansion (V2–V5)

- V3 (Market Intelligence) may surface external market/competitor data as supporting evidence for an assumption's resolution — additive context, not a change to the checklist item's own shape.
- **Two coexisting, non-conflicting sources may populate a Validation Checklist item's suggested content over time**, per [Future Expansion Strategy](../../context/06_future_expansion_strategy.md#future-ready-architecture-principle)'s "AI stages add a *source*... rather than introducing new field types": (1) this Feature's own direct, field-level AI Assist (Business Canvas + this Feature's own current values, per the generalized structured-feature AI architecture — see [AI Ownership Model](../../ai/03_ownership_model.md#context-representation-pipeline)), and (2) V4 (Go-to-Market Planning) supplying AI-suggested experiment ideas as a cross-Feature output, per [Future Expansion Strategy](../../context/06_future_expansion_strategy.md). Neither supersedes the other — a Validation Checklist item's shape does not distinguish which source suggested it, only whether it is suggested or user-authored (per the same principle).

## Risks and Constraints

- Constraint: must never conflate a per-assumption "success criterion" (this Feature) with the product-level Success Metrics owned by [Product Scope](../../context/02_product_scope.md#success-metrics) — any future UI or copy referencing "success criteria" must make clear which one is meant.
- Risk: a user could mark items validated without genuinely testing them, since Hypora cannot verify real-world validation occurred — accepted as a V1 limitation consistent with the product's manual, trust-the-user model; not solved by this specification.

## User Journey

| Stage | Description |
|---|---|
| Beginning | Project has reached Validating (Scope + Feature Planning complete); user opens the Validation Checklist for the first time or resumes it |
| Normal Flow | User adds Assumptions (statement, method, criterion) and resolves each as validated or invalidated |
| Alternative Flow | User reopens MVP Scope or Feature Planning after invalidating an assumption, triggering the Validating → Scoped transition (per [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)) |
| Completion | Every Checklist item is explicitly resolved; Project transitions Validating → Validated |
| Cancellation | User leaves an Assumption partially authored (statement only, no method/criterion yet) — not an error, simply unresolved |
| Recovery | Same persistence-failure handling as every other authoring Feature (per [Workspace Data & State](../02_data_and_state.md)) |

## User Interaction

| Aspect | Definition |
|---|---|
| Primary Actions | Add an Assumption; edit its method or criterion; mark it validated or invalidated |
| Secondary Actions | Reopen MVP Scope / Feature Planning |
| Empty State | No Assumptions yet — this is a **blocking** empty state: an empty checklist cannot satisfy the Validating → Validated guard (per [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s Invalid Transitions), so the prompt to add a first Assumption is more than a convenience |
| Loading State | Checklist items loading when the section opens |
| Error State | Persistence failure on read or write (per [Workspace Data & State](../02_data_and_state.md)) |
| Validation State | An Assumption's statement must be non-empty to exist at all; resolving it (validated/invalidated) requires its method and criterion to be filled first — a statement alone cannot be resolved |
| Success State | An item is resolved; once every item is resolved, the Project reaches Validated |

## Navigation

| Aspect | Definition |
|---|---|
| Entry Point | From [MVP Planning](./03_mvp_planning.md) once Scope + Feature Planning are complete, or directly from the Dashboard for a resumed Project |
| Exit Point | To [Project Summary](./05_project_summary.md) to review readiness |
| Previous Screen | MVP Scope / Feature Planning |
| Next Screen | Project Summary |
| Cross-Feature Navigation | Back to MVP Planning (reopening Scope/Planning); across to Business Structuring at any time |
| Browser Back Behavior | Returns to whichever section was previously open |
| Deep Link Considerations | Applicable — the Validation Checklist should be addressable within the Project |

## Persistence

| Aspect | Definition |
|---|---|
| Becomes dirty | Editing an Assumption's statement, method, or criterion |
| Automatically saved | Field-level edits save on leaving the field; a resolution (validated/invalidated) is immediately committed as a deliberate action, not a draft |
| Restored | On reopening, the full checklist (every item's statement, method, criterion, and status) is restored |
| Discarded | Unsaved keystroke-level edits not yet auto-saved may be lost on abrupt navigation, same limitation as other authoring Features |
