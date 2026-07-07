# Feature: Project Summary

**Refs:** → [Features Index](./000_index.md) · [Workspace Architecture](../01_architecture.md) · [Workspace Data & State](../02_data_and_state.md) · [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) · [Validation Planning](./04_validation_planning.md)

*(Explicit — the brief names "Project Summary" directly, with the purpose "provide a concise overview of the current project's status and readiness." Framed here as a readiness capability, not a page — per the Feature Philosophy, this Feature would remain the same capability even if its presentation changed from a dedicated screen to, say, a panel or export.)*

## Purpose

Let a user answer, at a glance, "where does this project stand, and is it ready to move forward?" — aggregating Business Structuring, MVP Planning, and Validation Planning's progress into one readiness signal, and letting the user act on that signal by confirming the project as Build-Ready.

## Responsibilities

**In Scope:**
- Aggregating and presenting the current state of Canvas, MVP Scope, Feature Planning, and Validation Checklist for a Project (read-only).
- Presenting the Project's current lifecycle stage and, when not yet Validated, which artifact is blocking the next transition (per [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s guards).
- Owning the **Validated → Build-Ready** confirmation action — the one lifecycle transition that is a deliberate user decision rather than a side effect of completing an artifact.

**Out of Scope:**
- Authoring or editing any Canvas, Scope, Feature, or Validation content — Project Summary is read-only except for the single Build-Ready confirmation action; all editing happens in the owning Feature.
- Computing or storing its own copy of any data — per [Workspace Data & State](../02_data_and_state.md), Summary is never independently persisted; it is always derived at render time from the other four Features' data.
- Any export/print capability — named as an open, unresolved question in [Product Scope](../../context/02_product_scope.md#open-questions); not assumed into this Feature's V1 scope.

## User Stories

- As the **Primary Persona (Solo Founder)**, I want to see my project's overall status in one place, so that I don't have to reconstruct it by revisiting every section.
- As the **Primary Persona**, I want to know exactly what's still blocking my project from being ready, so that I know what to do next.
- As any persona, I want to explicitly confirm my project as Build-Ready once everything is validated, so that "ready" is a decision I make, not something the system assumes for me.

## Acceptance Criteria

- The Summary reflects the true current state of Canvas, Scope, Features, and Validation at the moment it's viewed — never a stale cached copy (consistent with "never independently persisted").
- When a Project is not yet Validated, the Summary names the specific incomplete artifact(s) blocking progress, per the relevant guard in [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md).
- The Build-Ready confirmation action is only available once the Project is in the Validated stage — never earlier, per the domain model's Invalid Transitions ("any state → Build-Ready except from Validated: rejected").
- Confirming Build-Ready is an explicit, deliberate action — never triggered automatically by reaching Validated.

## Relationships with Other Features

| Feature | Relationship |
|---|---|
| Project Management | Project Summary is scoped to one Project at a time — it does not compare across Projects (see [Project Management](./01_project_management.md)) |
| Business Structuring | Read-only consumer of Canvas completion state |
| MVP Planning | Read-only consumer of Scope/Feature Planning completion state and Feature priorities |
| Validation Planning | Read-only consumer of Validation Checklist resolution state; this Feature's Build-Ready action is only unlocked once Validation Planning's guard (Validating → Validated) has already fired |

Project Summary is the only Feature that reads from all four others without owning any of their authored content.

## Dependencies on Product Lifecycle

Owns the **Validated → Build-Ready** transition — the sole user-confirmed transition in the model, as opposed to the automatic guard-based transitions owned by the other Features. Reads, but does not alter, every other stage and guard defined in [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md).

## Dependencies on Workspace

Depends on the Project Summary screen owned by [Workspace Architecture](../01_architecture.md); depends on the Summary being a derived (never independently persisted) concept, per [Workspace Data & State](../02_data_and_state.md). Does not redefine either.

## Future Expansion (V2–V5)

- V5 (AI Product Builder) consumes a Build-Ready Project specifically as its input (see [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s Relationship to the Roadmap) — Project Summary is the capability that makes "this project is Build-Ready" a meaningful, user-confirmed fact for V5 to rely on.
- V4 (Go-to-Market Planning) may extend what's summarized (e.g., channel recommendations) once that stage exists — additive to the aggregation, not a redefinition of it.

## Risks and Constraints

- Constraint: must never let the Build-Ready confirmation become available through any path other than the Validated stage — this is the one transition in the entire model gated by explicit human judgment rather than pure data completeness, and it must stay that way per the domain model's Invalid Transitions.
- Risk: if the "blocking artifact" messaging is vague, users may not understand why they can't reach Build-Ready — a UI-design concern out of scope for this document, but flagged so future UI work treats it as a requirement, not an afterthought.

## User Journey

| Stage | Description |
|---|---|
| Beginning | User opens Project Summary at any point in the Project's lifecycle, from Captured through Build-Ready |
| Normal Flow | User reviews the aggregated status; if not yet Validated, follows a pointer to whichever section is blocking progress; if Validated, may confirm Build-Ready |
| Alternative Flow | User views Summary purely to check progress, with no action taken |
| Completion | Build-Ready is confirmed — the terminal, useful V1 outcome for a Project |
| Cancellation | User views Summary and leaves without confirming Build-Ready — no effect, nothing is persisted by viewing alone |
| Recovery | If the Build-Ready confirmation's write fails, the user is told it didn't take effect rather than assuming it did (per [Workspace Data & State](../02_data_and_state.md)'s Error States) |

## User Interaction

| Aspect | Definition |
|---|---|
| Primary Actions | Confirm Build-Ready (only when Validated) |
| Secondary Actions | Follow a pointer to whichever section is blocking the next transition |
| Empty State | A Captured Project with nothing filled in yet shows a minimal summary clearly stating that structuring hasn't started — not an error |
| Loading State | Aggregating current data from Business Structuring, MVP Planning, and Validation Planning |
| Error State | A read failure in any underlying artifact, or a failed Build-Ready write (per [Workspace Data & State](../02_data_and_state.md)) |
| Validation State | The Build-Ready action is unavailable/disabled unless the Project is in the Validated stage |
| Success State | Build-Ready is confirmed and reflected immediately |

## Navigation

| Aspect | Definition |
|---|---|
| Entry Point | From any other section of the Project, or from the Dashboard, at any time |
| Exit Point | To the Dashboard, or to whichever section is named as blocking readiness |
| Previous Screen | Whichever section the user came from (non-linear) |
| Next Screen | None formally — this is a terminal view; after confirming Build-Ready, the user typically returns to the Dashboard |
| Cross-Feature Navigation | Jump-links to whichever section (Business Structuring, MVP Planning, Validation Planning) is currently blocking progress |
| Browser Back Behavior | Returns to whichever section or the Dashboard was previously open |
| Deep Link Considerations | Applicable — Project Summary should be addressable within the Project |

## Persistence

| Aspect | Definition |
|---|---|
| Becomes dirty | N/A for viewing — the only "dirty" moment is the instant a user triggers the Build-Ready confirmation |
| Automatically saved | N/A — Summary itself is never saved (it's always recomputed from the other Features' data, per [Workspace Data & State](../02_data_and_state.md)); the Build-Ready confirmation, once triggered, is committed immediately as a deliberate action, not a draft |
| Restored | The Summary is recomputed fresh from current data every time it's viewed — there is nothing to "restore" for the Summary itself |
| Discarded | N/A — there is no editable draft content in this Feature besides the atomic Build-Ready action, which either commits or fails (per Error State above) |
