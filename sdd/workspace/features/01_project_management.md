# Feature: Project Management

**Refs:** → [Features Index](./000_index.md) · [Workspace Architecture](../01_architecture.md) · [Workspace Data & State](../02_data_and_state.md) · [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) · [Personas](../../context/03_personas_and_journey.md)

*(Inferred — the brief names "Project management" as a Workspace responsibility; this document operationalizes it as a capability, per the Feature Philosophy: a user goal, not a screen.)*

## Purpose

Let a user create, resume, and retire a business idea as a Project, so that every other capability (Business Structuring, MVP Planning, Validation Planning, Project Summary) has a durable home to operate within. This is the capability that makes "holding more than one idea at once" possible — it is not itself the Dashboard/Project List screen; that screen is one surface this capability is exposed through (see [Workspace Architecture](../01_architecture.md)).

## Responsibilities

**In Scope:**
- Creating a new Project (entering the Captured lifecycle stage).
- Listing every Project the user has created, each showing its current lifecycle stage.
- Selecting a Project to resume work on it.
- Archiving a Project (the Archived lifecycle stage, reachable from any non-Captured state per [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)).

**Out of Scope:**
- Permanently deleting a Project — not defined anywhere in the domain model ([Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) has no such transition); archiving is the only V1 retirement action. Introducing deletion would require extending the domain model first, not silently adding it here.
- Renaming, duplicating, or exporting a Project — not named in any prior specification pass; not assumed into scope.
- Any content *within* a Project (Canvas, Scope, Features, Validation) — owned by the other four Features, not this one.
- Cross-project comparison — tied to the Idea Explorer Future Persona (see [Personas](../../context/03_personas_and_journey.md)), not in V1.

## User Stories

- As the **Primary Persona (Solo Founder)**, I want to create a new Project for my idea, so that I have a dedicated place to structure it.
- As the **Primary Persona**, I want to see all my Projects and their current status at a glance, so that I know which ones need attention.
- As the **Secondary Persona (Early-Stage Team Lead)**, I want to resume a Project I started earlier, so that I don't lose structuring work between sessions.
- As any persona, I want to archive a Project I'm no longer pursuing, so that my active list stays focused on ideas I'm actually working on.

## Acceptance Criteria

- Creating a Project results in a Project in the Captured lifecycle stage, with all content Empty (see [Workspace Data & State](../02_data_and_state.md)).
- The Project List shows every non-Archived Project by default, each labeled with its current lifecycle stage.
- Selecting a Project from the list opens that Project's own scope, with no data from any other Project visible.
- Archiving a Project is available from any lifecycle stage except Archived itself; once archived, no further transition is available in V1 (per [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s Invalid Transitions).
- Archiving requires explicit user confirmation — a Project must never move to Archived as a side effect of another action.

## Relationships with Other Features

| Feature | Relationship |
|---|---|
| Business Structuring | Cannot begin until a Project exists — Project Management is a hard prerequisite |
| MVP Planning | Same — operates only within a Project already created here |
| Validation Planning | Same |
| Project Summary | Reads the Project's lifecycle stage, which Project Management's create/archive actions bookend (Captured at one end, Archived at the other) |

No other Feature may create, list, or archive a Project — this is Project Management's exclusive responsibility.

## Dependencies on Product Lifecycle

Owns the **Captured** stage (a Project's starting point) and the **Archived** transition (available from any state) — see [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md). Does not own or alter any guard for Structuring, Scoped, Validating, Validated, or Build-Ready — those belong to the other four Features.

## Dependencies on Workspace

Depends on the Dashboard/Project List screen and its lifecycle-stage display, both owned by [Workspace Architecture](../01_architecture.md); depends on the Project entity and the "all Project IDs" persisted concept, both owned by [Workspace Data & State](../02_data_and_state.md). This Feature does not redefine either.

## Future Expansion (V2–V5)

*(Inferred, consistent with [Future Expansion Strategy](../../context/06_future_expansion_strategy.md) — no new capability is designed here, only the seam this Feature must not block.)*

- V3 (Market Intelligence) and later stages may add project-level metadata (e.g., a market category) — this Feature's Project entity must remain extensible without a breaking change, consistent with the already-established data-shape-stability principle.
- Cross-project comparison, if the Idea Explorer persona is ever promoted (see [Personas](../../context/03_personas_and_journey.md)), would extend this Feature's "list" responsibility — not replace it.

## Risks and Constraints

- Inherits the LocalStorage data-loss risk already recorded in [Product Scope](../../context/02_product_scope.md) — no new risk is introduced by this Feature specifically.
- Constraint: must not implement deletion, even as a convenience, without first extending [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) — adding an undocumented transition would violate that document's ownership.
