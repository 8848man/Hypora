# Feature: MVP Planning

**Refs:** → [Features Index](./000_index.md) · [Workspace Architecture](../01_architecture.md) · [Workspace Data & State](../02_data_and_state.md) · [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) · [Business Structuring](./02_business_structuring.md)

*(Explicit — the brief names Feature List, Priorities, and Scope directly.)*

## Purpose

Let a user decide the smallest valuable version of their idea worth building — drawing a scope boundary and breaking it into concrete, prioritized features — so that "what to build first" is an explicit decision, not an assumption carried silently into execution.

## Responsibilities

**In Scope:**
- Authoring an MVP Scope statement: the boundary of what counts as the first version.
- Feature Planning: creating discrete Features, each describing one planned capability.
- Assigning a priority to each Feature (e.g., an explicit ranking or tier), and optionally tagging a Feature as in/out of the MVP Scope boundary.
- Driving the Project's Scoped lifecycle stage and its transition to Validating once MVP Scope and Feature Planning are both marked complete (see [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)).

**Out of Scope:**
- Task/ticket management (assignees, due dates, sprints) — explicitly rejected by [Product Positioning](../../context/01_product_vision.md#product-positioning); MVP Planning stops at "what and in what order," not "who and by when."
- Validating whether a Feature or the Scope itself is actually correct — that is Validation Planning's responsibility, operating on the Validating stage this Feature transitions the Project into.
- Any AI-generated feature suggestion or prioritization — out of scope until V2+.

## User Stories

- As the **Primary Persona (Solo Founder)**, I want to state what's in and out of my first version, so that I don't try to build everything at once.
- As the **Secondary Persona (Early-Stage Team Lead)**, I want a prioritized feature list my team can treat as the source of truth, so that "what are we building first" isn't re-litigated informally.
- As any persona, I want to mark a Feature's priority, so that I know what to tackle first without needing a separate planning tool.

## Acceptance Criteria

- MVP Scope is authored as a single boundary statement per Project (see [Workspace Data & State](../02_data_and_state.md)).
- A Project may hold any number of Features, each with a priority and an optional in/out-of-scope tag.
- The Project transitions from Scoped to Validating only once both MVP Scope and Feature Planning are explicitly marked complete by the user — never inferred automatically from "at least one Feature exists."
- Reopening MVP Scope or Feature Planning after entering Validating is possible (per [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s Validating → Scoped transition) if the user explicitly chooses to.

## Relationships with Other Features

| Feature | Relationship |
|---|---|
| Business Structuring | Precedes MVP Planning — a Project must have a complete Canvas (Scoped stage reached) before Feature Planning is meaningful, though this Feature does not read Canvas content directly |
| Validation Planning | Follows MVP Planning — operates on the Features and Scope this Feature produces, once the Project enters Validating |
| Project Summary | Reads Scope/Feature Planning completion state and each Feature's priority to report planning progress |

## Dependencies on Product Lifecycle

Owns the **Scoped** stage's MVP Scope/Feature Planning authoring and the **Scoped → Validating** transition guard (both marked complete) — see [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md). Also participates in the **Validating → Scoped** reopening transition when the user revises Scope/Planning after invalidating an assumption elsewhere. Does not alter either guard.

## Dependencies on Workspace

Depends on the MVP Scope and Feature Planning screens owned by [Workspace Architecture](../01_architecture.md); depends on the MVP Scope and Feature data ownership (including the Feature priority attribute) defined in [Workspace Data & State](../02_data_and_state.md). Does not redefine either.

## Future Expansion (V2–V5)

- V3 (Market Intelligence) may surface competitor feature comparisons alongside Feature Planning — additive context, not a change to how Features/Scope/Priority are structured.
- V4 (Go-to-Market Planning) consumes the completed Scope/Feature list as input for channel and experiment suggestions — read-only consumption, no change to this Feature's data shape.
- V5 (AI Product Builder) consumes prioritized Features as requirement-generation input once a Project reaches Build-Ready.

## Risks and Constraints

- Risk: if Feature priority is left too loosely defined (e.g., no fixed tier vocabulary), cross-project comparison (a Future capability) becomes harder later — noted here as a forward-compatibility consideration, not resolved by this specification.
- Constraint: must not silently treat "the Feature list is non-empty" as equivalent to "Feature Planning is complete" — the user's explicit completion action is required, consistent with the domain lifecycle's guard.
