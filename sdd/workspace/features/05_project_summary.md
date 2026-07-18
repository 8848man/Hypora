# Feature: Project Summary

**Refs:** → [Features Index](./000_index.md) · [Workspace Architecture](../01_architecture.md) · [Workspace Data & State](../02_data_and_state.md) · [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) · [Validation Planning](./04_validation_planning.md) · [ADR-0016](../../architecture/decisions/ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md) · [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md) · [Project Summary Synthesis Assistant](../../ai/capabilities/06_project_summary_synthesis_assistant.md) · [AI Interaction Specification](../../ai/04_ai_interaction.md)

*(Explicit — the brief names "Project Summary" directly, with the purpose "provide a concise overview of the current project's status and readiness." Framed here as a readiness capability, not a page — per the Feature Philosophy, this Feature would remain the same capability even if its presentation changed from a dedicated screen to, say, a panel or export. Its readiness-aggregation and Build-Ready responsibilities below are unchanged from the original specification; its Summary content itself was promoted from a derived checklist to a persisted, AI-synthesized narrative by [ADR-0016](../../architecture/decisions/ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md) — see Provenance note at the end of this document.)*

## Purpose

Let a user answer, at a glance, "where does this project stand, and is it ready to move forward?" and "what is this project, in plain terms?" — aggregating readiness signals from Business Structuring, MVP Planning, and Validation Planning, synthesizing their content into a concise narrative via the [Project Summary Synthesis Assistant](../../ai/capabilities/06_project_summary_synthesis_assistant.md), and letting the user act on that readiness signal by confirming the project as Build-Ready.

## Responsibilities

**In Scope:**
- Presenting the Project's current lifecycle stage and, when not yet Validated, which artifact is blocking the next transition (per [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s guards) — read-only, unchanged from the original specification.
- Owning the **Validated → Build-Ready** confirmation action — the one lifecycle transition that is a deliberate user decision rather than a side effect of completing an artifact.
- Owning the persisted **Summary** narrative and its **Summary Lifecycle** (`NotGenerated` / `Generating` / `Generated` / `OutOfSync`), per [ADR-0016](../../architecture/decisions/ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md) and [Workspace Data & State](../02_data_and_state.md#summary-lifecycle).
- Triggering **Initial Generation** automatically (per [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md)) and owning the **Synchronization Dialog** that lets a user review, AI-draft, edit, and apply an updated Summary once `OutOfSync`.

**Out of Scope:**
- Authoring or editing any Canvas, Scope, Feature, or Validation content — Project Summary is read-only over that underlying data except for the single Build-Ready confirmation action; all editing of source content happens in the owning Feature. (Editing the Summary's own synthesized *text* inside the Synchronization Dialog's To-Be side is in scope — see Synchronization Dialog below — but this never edits Canvas/MVP Plan/Validation Plan themselves.)
- Any export/print capability — named as an open, unresolved question in [Product Scope](../../context/02_product_scope.md#open-questions); not assumed into this Feature's scope.
- Any AI capability behavior beyond invoking the Project Summary Synthesis Assistant's two operations (Initial Generation, Sync draft) — prompt/context/response mechanics are owned by the [AI Platform](../../ai/01_architecture.md), referenced here, never restated.

## User Stories

- As the **Primary Persona (Solo Founder)**, I want to see my project's overall status in one place, so that I don't have to reconstruct it by revisiting every section.
- As the **Primary Persona**, I want to know exactly what's still blocking my project from being ready, so that I know what to do next.
- As the **Primary Persona**, I want a concise, synthesized explanation of what my project is, for whom, and how I plan to validate it, without having to re-read every section myself.
- As the **Primary Persona**, I want the Summary to tell me plainly when it's fallen behind my latest edits, and to control if and when it's updated, rather than having it silently rewritten.
- As any persona, I want to explicitly confirm my project as Build-Ready once everything is validated, so that "ready" is a decision I make, not something the system assumes for me.

## Summary Lifecycle

*(Canonically owned here; registered alongside every other State Model concept in [Workspace Data & State](../02_data_and_state.md#summary-lifecycle), which must not restate these transitions — see that document's own note.)*

```
NotGenerated ──(Project reaches Validated stage — ADR-0017 trigger)──► Generating
                                                                            │
                                       (success: write Summary,            │  (failure)
                                        state → Generated)                 ▼
                                             ▼                        NotGenerated
                                         Generated
                                             │
                                             │ (Saved change to Canvas, MVP Plan, or Validation Plan)
                                             ▼
                                        OutOfSync
                                             │
                                             │ (user completes Synchronization Dialog's Apply)
                                             ▼
                                         Generated
```

- **Initial Generation** is the sole Automatic Invocation in the entire AI Platform, scoped exactly as [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md) defines: it fires once, the first time the Project's domain lifecycle stage reaches Validated while Summary is `NotGenerated`. It writes directly to `Generated` on success (no Suggestion Ready/Accept step — see ADR-0017 Decision 5) and returns to `NotGenerated` on failure.
- **OutOfSync** is entered the moment any Saved change lands in Canvas, MVP Scope, the Feature list, or the Validation Checklist while Summary is `Generated`. The existing Summary text is never altered by this transition — only the state flips.
- **No automatic regeneration ever occurs from `OutOfSync`.** The user always explicitly decides via the Synchronization Dialog.
- While `Generating` (either Initial Generation or a Sync's AI Summary Update in progress), the previously persisted Summary text (if any) remains visible, unchanged, alongside a loading indicator — the Summary Card is never hidden or replaced by a spinner-only state.

## Synchronization Dialog

*(Owned here; consumes the [Project Summary Synthesis Assistant](../../ai/capabilities/06_project_summary_synthesis_assistant.md)'s "sync" operation as an ordinary Manual Invocation, per [AI Interaction Specification](../../ai/04_ai_interaction.md) — unaffected by ADR-0017's narrow exception, which covers Initial Generation only.)*

Reachable from the Summary page via a **Sync Summary** action, shown exactly when Summary is `OutOfSync`.

| Side | Content | Behavior |
|---|---|---|
| **As-Is** (left) | The currently persisted Summary text | Read-only; fixed for the entire time the dialog is open — never changes while the dialog is open, even if underlying data changes elsewhere in another tab |
| **To-Be** (right) | Initially empty | No AI request is made merely by opening the dialog (Governing Rule 1 applies unchanged here). Pressing **AI Summary Update** invokes the capability's sync operation; the result is displayed in an editable TextForm the user may freely revise before deciding |

**Apply:** saves the (possibly user-edited) To-Be text as the new persisted Summary, replacing the prior one, and transitions Summary Lifecycle `OutOfSync → Generated`.

**Cancel:** discards the dialog's To-Be draft entirely. The persisted Summary and its `OutOfSync` state are untouched — closing without Apply is always a no-op on saved data.

## Acceptance Criteria

- Initial Generation never blocks the user and never hides the Summary Card — it always remains visible, showing a loading state while `Generating` (per [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md)).
- Initial Generation fires automatically exactly once per Project, only after Canvas, MVP Plan, and Validation Plan are each complete (the Project has reached the Validated stage) — never earlier, never on a partial project.
- Any Saved change to Canvas, MVP Plan, or Validation Plan while Summary is `Generated` transitions it to `OutOfSync`; the existing Summary text is never altered by this transition alone, and no automatic regeneration is ever triggered by it.
- Opening the Synchronization Dialog makes no AI request; only pressing **AI Summary Update** does.
- The Synchronization Dialog's As-Is side is read-only and never changes while the dialog is open.
- The Synchronization Dialog's To-Be side is editable once a draft exists; the user's edits are what gets saved on Apply, not necessarily the AI's raw draft verbatim.
- **Apply** replaces the persisted Summary and clears `OutOfSync` back to `Generated`; **Cancel** leaves the persisted Summary and its `OutOfSync` state completely unchanged.
- The synthesized Summary explains what the project is, who it's for, what problem it solves, and how it intends to validate — never merely a completion checklist (that responsibility belongs to the readiness/blocking-artifact messaging below, which remains separate content).
- When a Project is not yet Validated, the Summary page names the specific incomplete artifact(s) blocking progress, per the relevant guard in [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) — unchanged from the original specification, and independent of Summary Lifecycle (a project can be pre-Validated, and therefore Summary `NotGenerated`, while this blocking-artifact messaging is still shown).
- The Build-Ready confirmation action is only available once the Project is in the Validated stage — never earlier, per the domain model's Invalid Transitions ("any state → Build-Ready except from Validated: rejected") — entirely independent of Summary Lifecycle state (Build-Ready never depends on Summary being `Generated` rather than `OutOfSync`).
- Confirming Build-Ready is an explicit, deliberate action — never triggered automatically by reaching Validated, and never triggered by Initial Generation or a Sync Apply.

## Relationships with Other Features

| Feature | Relationship |
|---|---|
| Project Management | Project Summary is scoped to one Project at a time — it does not compare across Projects (see [Project Management](./01_project_management.md)) |
| Business Structuring | Read-only consumer of Canvas completion state |
| MVP Planning | Read-only consumer of Scope/Feature Planning completion state and Feature priorities |
| Validation Planning | Read-only consumer of Validation Checklist resolution state; this Feature's Build-Ready action is only unlocked once Validation Planning's guard (Validating → Validated) has already fired |

Project Summary is the only Feature that reads from all four others without owning any of their authored content. It is also the sole Consumer of the [Project Summary Synthesis Assistant](../../ai/capabilities/06_project_summary_synthesis_assistant.md) AI Capability, per that capability's own Consumers section.

## Dependencies on Product Lifecycle

Owns the **Validated → Build-Ready** transition — the sole user-confirmed transition in the model, as opposed to the automatic guard-based transitions owned by the other Features. Reads, but does not alter, every other stage and guard defined in [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md).

## Dependencies on Workspace

Depends on the Project Summary screen owned by [Workspace Architecture](../01_architecture.md); depends on the Summary's persisted, stateful Data Ownership row, per [Workspace Data & State](../02_data_and_state.md#summary-lifecycle) and [ADR-0016](../../architecture/decisions/ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md). Does not redefine either.

## Future Expansion (V2–V5)

- V5 (AI Product Builder) consumes a Build-Ready Project specifically as its input (see [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s Relationship to the Roadmap) — Project Summary is the capability that makes "this project is Build-Ready" a meaningful, user-confirmed fact for V5 to rely on.
- V4 (Go-to-Market Planning) may extend what's summarized (e.g., channel recommendations) once that stage exists — additive to the aggregation, not a redefinition of it.

## Risks and Constraints

- Constraint: must never let the Build-Ready confirmation become available through any path other than the Validated stage — this is the one transition in the entire model gated by explicit human judgment rather than pure data completeness, and it must stay that way per the domain model's Invalid Transitions.
- Constraint: Initial Generation must never be re-triggered more than once automatically per Project — repeated automatic invocation on every Summary view would violate [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md)'s narrow scope and turn a bounded exception into an unbounded one.
- Risk: if the "blocking artifact" messaging is vague, users may not understand why they can't reach Build-Ready — a UI-design concern out of scope for this document, but flagged so future UI work treats it as a requirement, not an afterthought.
- Risk: a user may not notice an `OutOfSync` Summary and act on stale content — the UI must visually distinguish `OutOfSync` from `Generated` clearly enough that this is unlikely, though the exact visual treatment is a UI-design concern out of scope for this document.

## User Journey

| Stage | Description |
|---|---|
| Beginning | User opens Project Summary at any point in the Project's lifecycle, from Captured through Build-Ready |
| Normal Flow | User reviews the aggregated status; if not yet Validated, follows a pointer to whichever section is blocking progress; if Validated, may confirm Build-Ready |
| Alternative Flow | User views Summary purely to check progress, with no action taken |
| Completion | Build-Ready is confirmed — the terminal, useful V1 outcome for a Project |
| Cancellation | User views Summary and leaves without confirming Build-Ready, or opens the Synchronization Dialog and presses Cancel — no effect, nothing is persisted |
| Recovery | If the Build-Ready confirmation's write fails, the user is told it didn't take effect rather than assuming it did (per [Workspace Data & State](../02_data_and_state.md)'s Error States); if Initial Generation or a Sync draft fails, per [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md) and [Workspace Data & State](../02_data_and_state.md#error-states), the user is never left with an ambiguous or stuck state |

## User Interaction

| Aspect | Definition |
|---|---|
| Primary Actions | Confirm Build-Ready (only when Validated); Sync Summary (only when `OutOfSync`) → opens Synchronization Dialog → AI Summary Update, edit To-Be, Apply |
| Secondary Actions | Follow a pointer to whichever section is blocking the next transition; Cancel out of the Synchronization Dialog |
| Empty State | A Captured Project with nothing filled in yet shows a minimal summary clearly stating that structuring hasn't started — not an error; distinct from `NotGenerated` Summary Lifecycle, which may also apply to a Validated project whose Initial Generation hasn't yet run or is still in flight |
| Loading State | Summary Card shows a loading indicator while Summary Lifecycle is `Generating` (Initial Generation or a Sync's AI Summary Update) — the Card itself remains visible and the layout stable throughout, per [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md); readiness/blocking-artifact messaging continues to aggregate current data from Business Structuring, MVP Planning, and Validation Planning as before, independent of Summary Lifecycle |
| Error State | A read failure in any underlying artifact; a failed Build-Ready write; a failed Initial Generation (returns to `NotGenerated`) or failed Sync draft (dialog shows the failure, As-Is and persisted state unchanged) — per [Workspace Data & State](../02_data_and_state.md#error-states) |
| Validation State | The Build-Ready action is unavailable/disabled unless the Project is in the Validated stage; Sync Summary is unavailable unless Summary is `OutOfSync`; Apply is unavailable until a To-Be draft exists |
| Success State | Build-Ready is confirmed and reflected immediately; a Sync Apply replaces the Summary and clears `OutOfSync` immediately |

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

*(Superseded by [ADR-0016](../../architecture/decisions/ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md) — Summary is no longer "never persisted"; see that ADR's Context for why the prior model no longer holds.)*

| Aspect | Definition |
|---|---|
| Becomes dirty | The instant a user triggers the Build-Ready confirmation; the instant Summary Lifecycle transitions to `OutOfSync` (a Saved change elsewhere); the instant a Synchronization Dialog's To-Be TextForm is edited (dialog-local draft only, not yet persisted) |
| Automatically saved | On Initial Generation success, the synthesized Summary and `Generated` state are saved immediately, with no user action required (per [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md)); the Build-Ready confirmation, once triggered, is committed immediately as a deliberate action, not a draft |
| Restored | The persisted Summary text and Summary Lifecycle state are loaded with the rest of the Project record, per [Workspace Data & State](../02_data_and_state.md#local-persistence-conceptual) — there is no separate restore path |
| Discarded | The Synchronization Dialog's To-Be draft is discarded entirely on Cancel, or on closing the dialog without Apply — never partially saved; the persisted Summary is only ever overwritten by an explicit Apply |

## Provenance

Originally specified with Summary as a purely derived, non-persisted, entirely non-AI read view (V1-era, predating the AI Platform). [ADR-0016](../../architecture/decisions/ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md) and [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md) (2026-07-18) superseded that model once the product reached V2 with a live AI Platform: Summary became a persisted, AI-synthesized artifact with an explicit lifecycle and a user-controlled Synchronization Dialog, per this document's current content above. The Validated → Build-Ready confirmation responsibility this Feature already owned is unchanged by either ADR.
