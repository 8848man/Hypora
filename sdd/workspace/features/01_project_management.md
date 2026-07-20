# Feature: Project Management

**Refs:** → [Features Index](./000_index.md) · [Workspace Architecture](../01_architecture.md) · [Workspace Data & State](../02_data_and_state.md) · [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) · [Personas](../../context/03_personas_and_journey.md) · [Onboarding Preset Assistant](../../ai/capabilities/07_onboarding_preset_assistant.md) · [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) · [ADR-0020](../../architecture/decisions/ADR-0020-progressive-navigation-as-non-restrictive-guided-emphasis.md)

*(Inferred — the brief names "Project management" as a Workspace responsibility; this document operationalizes it as a capability, per the Feature Philosophy: a user goal, not a screen.)*

## Purpose

Let a user create, resume, and retire a business idea as a Project, so that every other capability (Business Structuring, MVP Planning, Validation Planning, Project Summary) has a durable home to operate within. This is the capability that makes "holding more than one idea at once" possible — it is not itself the Dashboard/Project List screen; that screen is one surface this capability is exposed through (see [Workspace Architecture](../01_architecture.md)).

## Responsibilities

**In Scope:**
- Creating a new Project (entering the Captured lifecycle stage), via a Name (required) and Description (optional) — see Acceptance Criteria for Description's role.
- Listing every Project the user has created, each showing its current lifecycle stage.
- Selecting a Project to resume work on it.
- Archiving a Project (the Archived lifecycle stage, reachable from any non-Captured state per [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)).
- Triggering [Onboarding Preset Assistant](../../ai/capabilities/07_onboarding_preset_assistant.md)'s single, automatic invocation immediately after a new Project is created, per [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) — this Feature owns *triggering* that one-time call; the resulting presets are consumed and displayed by [Business Structuring](./02_business_structuring.md), not rendered here.

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

- Creating a Project results in a Project in the Captured lifecycle stage, with all content Empty except Name (required) and Description (optional, may remain empty) (see [Workspace Data & State](../02_data_and_state.md)).
- The Project List shows every non-Archived Project by default, each labeled with its current lifecycle stage. Archived Projects are excluded from the default view but remain accessible via an explicit "show archived" toggle — archiving hides, it does not delete (per Out of Scope above).
- Selecting a Project from the list opens that Project's own scope, with no data from any other Project visible.
- Archiving a Project is available from any lifecycle stage except Archived itself; once archived, no further transition is available in V1 (per [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s Invalid Transitions).
- Archiving requires explicit user confirmation — a Project must never move to Archived as a side effect of another action.
- Description is never required to complete Project creation — the create action's Validation State is identical with or without a Description (see User Interaction below); a user may create a Project from Name alone.
- Immediately after creation is confirmed, this Feature triggers [Onboarding Preset Assistant](../../ai/capabilities/07_onboarding_preset_assistant.md) exactly once, in the background, per [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) — the user is taken directly into Business Structuring without waiting for this call to complete (see Navigation below); this Feature never blocks Project creation or entry into Business Structuring on the outcome of this call.
- If Onboarding Preset Assistant fails, is unavailable, or has not yet returned by the time the user reaches a given Canvas question, that question shows its existing static V1 presets — never an error, a blocked question, or a stuck loading state, per [Onboarding Preset Assistant](../../ai/capabilities/07_onboarding_preset_assistant.md#failure-model).
- Editing a Project's Description after creation is an ordinary content edit (see Persistence below) — it never re-triggers Onboarding Preset Assistant and never retroactively changes presets already shown or Canvas fields already answered, per [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) Decision 4.

## Relationships with Other Features

| Feature | Relationship |
|---|---|
| Business Structuring | Cannot begin until a Project exists — Project Management is a hard prerequisite. Also receives, but does not itself request, the one-time Onboarding Preset Assistant output this Feature triggers at creation (per [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md)); presentation of those presets (or their Thinking Prompts / static-preset fallback) is entirely [Business Structuring](./02_business_structuring.md)'s own responsibility |
| MVP Planning | Same — operates only within a Project already created here |
| Validation Planning | Same |
| Project Summary | Reads the Project's lifecycle stage, which Project Management's create/archive actions bookend (Captured at one end, Archived at the other) |

No other Feature may create, list, or archive a Project, or trigger Onboarding Preset Assistant — these are Project Management's exclusive responsibility.

## Dependencies on Product Lifecycle

Owns the **Captured** stage (a Project's starting point) and the **Archived** transition (available from any state) — see [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md). Does not own or alter any guard for Structuring, Scoped, Validating, Validated, or Build-Ready — those belong to the other four Features.

## Dependencies on Workspace

Depends on the Dashboard/Project List screen and its lifecycle-stage display, both owned by [Workspace Architecture](../01_architecture.md); depends on the Project entity and the "all Project IDs" persisted concept, both owned by [Workspace Data & State](../02_data_and_state.md). This Feature does not redefine either.

## Future Expansion (V2–V5)

*(Inferred, consistent with [Future Expansion Strategy](../../context/06_future_expansion_strategy.md) — no new capability is designed here, only the seam this Feature must not block.)*

- V3 (Market Intelligence) and later stages may add project-level metadata (e.g., a market category) — this Feature's Project entity must remain extensible without a breaking change, consistent with the already-established data-shape-stability principle.
- Cross-project comparison, if the Idea Explorer persona is ever promoted (see [Personas](../../context/03_personas_and_journey.md)), would extend this Feature's "list" responsibility — not replace it.
- **AI-tailored creation-time presets are now realized, not future** — [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) and [Onboarding Preset Assistant](../../ai/capabilities/07_onboarding_preset_assistant.md) implement this. If a future need arises to re-derive presets after Description is edited post-creation, that is a new, separately-justified decision — see that capability's own Future Expansion section.

## Risks and Constraints

- Inherits the LocalStorage data-loss risk already recorded in [Product Scope](../../context/02_product_scope.md) — no new risk is introduced by this Feature specifically.
- Constraint: must not implement deletion, even as a convenience, without first extending [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) — adding an undocumented transition would violate that document's ownership.

## Project Creation Flow

*(Named per the reviewed proposal integrated by [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md); shown as an ASCII flow, consistent with this project's existing lifecycle-diagram convention, e.g. [Project Summary](./05_project_summary.md#summary-lifecycle).)*

```
Create Project (Name required, Description optional)
     │
     ▼
Project persisted (Captured stage) ──────► User enters Business Structuring immediately
     │                                       (never waits on the step below)
     ▼
AI Analysis (Onboarding Preset Assistant — background, non-blocking, at most once)
     │
     ├── success, Sufficiency = sufficient ──► Generate Preset Suggestions (all 5 Canvas questions)
     │                                              │
     │                                              ▼
     ├── success, Sufficiency = insufficient ─► Thinking Prompts (Business Idea question) +
     │                                          static V1 presets (remaining 4 questions)
     │
     └── failure / unavailable ───────────────► static V1 presets (all 5 questions)
                                                       │
                                                       ▼
                                              Idea Structuring (Business Structuring's
                                              guided flow — unchanged, per Question Model)
```

**Reading this diagram:** the branch under "AI Analysis" resolves entirely within [Onboarding Preset Assistant](../../ai/capabilities/07_onboarding_preset_assistant.md)'s own Response (see its Response Contract) — Project Management does not itself decide Sufficiency or select which fallback applies; it only triggers the call and hands whatever Response (or absence of one) arrives to Business Structuring. Every path converges on the same Idea Structuring step with no difference in the guided-flow mechanics themselves, per [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) Decision 3.

## User Journey

| Stage | Description |
|---|---|
| Beginning | User arrives at the Dashboard / Project List, populated or empty |
| Normal Flow | User triggers "new Project," enters a Name (and optionally a Description), and is taken directly into that Project's Business Structuring view — see Project Creation Flow above for what happens to Onboarding Preset Assistant's output in the background |
| Alternative Flow | User selects an existing Project from the list instead of creating a new one, resuming wherever it was left off |
| Completion | A new Project exists in the Captured stage with a Name (and optional Description), visible in the list; or an existing Project is re-entered |
| Cancellation | User backs out of the "new Project" action before confirming a Name — no Project is created, and Onboarding Preset Assistant is never invoked |
| Recovery | If the create action's write fails, no partial/orphaned Project is left behind — the user sees the failure and may retry (per [Workspace Data & State](../02_data_and_state.md)'s Error States). If Onboarding Preset Assistant itself fails after a successful Project creation, no retry or user-visible error is needed — Business Structuring's static-preset fallback applies silently, per Acceptance Criteria above |

## User Interaction

| Aspect | Definition |
|---|---|
| Primary Actions | Create Project, Select Project, Archive Project |
| Secondary Actions | Toggle visibility of Archived Projects on the Dashboard — no rename, duplicate, or delete (see Out of Scope); optionally enter a Description while creating a Project |
| Empty State | Zero Projects: the list prompts creation of the first one |
| Loading State | Project list is being read from persistence before rendering. Separately, Onboarding Preset Assistant's background call (per [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md)) is never this Feature's own Loading State — it never blocks or delays entry into Business Structuring; the Project is persisted with an explicit `Generating` onboarding status in the same write as creation (see [Onboarding Preset Assistant](../../ai/capabilities/07_onboarding_preset_assistant.md#frontend-representation)), and the loading indication itself is owned entirely by [Business Structuring](./02_business_structuring.md)'s own per-question presentation |
| Error State | Persistence read failure while loading the list (per [Workspace Data & State](../02_data_and_state.md)) |
| Validation State | Creating a Project requires a non-empty Name; the create action is blocked until one is entered. Description has no validation rule — empty is valid |
| Success State | Project appears in the list immediately after creation, or archiving is reflected immediately after confirmation |

## Navigation

| Aspect | Definition |
|---|---|
| Entry Point | Landing's call-to-action, or direct return to an already-bookmarked Workspace URL |
| Exit Point | None formally — the Dashboard is the Workspace's root; a user may navigate to Landing manually, outside this Feature's own flow |
| Previous Screen | None — this is the Workspace's entry surface |
| Next Screen | The selected/created Project's Business Structuring view (see [Business Structuring](./02_business_structuring.md)) |
| Cross-Feature Navigation | Entry point into every other Feature, by way of selecting a Project. On a Project whose Canvas is not yet complete, Business Structuring may be presented with greater visual prominence among the sibling sections — a presentation-only emphasis, never a restriction — per [ADR-0020](../../architecture/decisions/ADR-0020-progressive-navigation-as-non-restrictive-guided-emphasis.md); every sibling remains reachable in any order exactly as [Workspace Architecture](../01_architecture.md#navigation-model-workspace-internal)'s Navigation Model already specifies. **Edge cases, clarified during implementation-readiness review — none require new state:** the emphasis is recomputed from current Canvas-completion on every render (never a stored "was this shown/dismissed" flag), so it is automatically correct whether the user reaches MVP Scope directly without ever opening Business Structuring first (emphasis simply persists on Business Structuring until Canvas completes, regardless of which other sibling was visited meanwhile — no "skipped" tracking exists or is needed), reopens Business Structuring after leaving it mid-flow (emphasis is unaffected either way, since it was never about visit history), or — the one genuine edge case — a user clears an already-answered Canvas field back to empty via custom text, which per the unchanged Structuring→Scoped guard's own non-empty definition un-completes the Canvas; emphasis reappears on Business Structuring exactly as it would for a Project that had never completed Canvas, since it is a pure function of current completion state, not a one-way flag. |
| Browser Back Behavior | Back from any Project screen returns to the Dashboard / Project List |
| Deep Link Considerations | Applicable — each Project should be addressable by its own identity (e.g., a Project-specific URL), so browser back/forward and bookmarking behave predictably |

## Persistence

| Aspect | Definition |
|---|---|
| Becomes dirty | The moment a user types a Name or Description in the "new Project" action |
| Automatically saved | Immediately upon confirming creation (the new Project, in Captured stage, with its Name and Description, is persisted at once — this is a deliberate action, not a draft); archiving is likewise persisted immediately upon confirmation; a later edit to Description follows the same field-level auto-save convention as every other authoring Feature |
| Restored | The full Project list (identity, Name, current lifecycle stage) is read from persistence every time the Dashboard is opened; Archived Projects are included in this read but filtered from the default display; a Project's own Description is restored along with its other fields when the Project is opened |
| Discarded | A Name or Description typed but not yet confirmed is discarded if the user cancels the create action before confirming |
