# ADR-0022: Generalize Navigation Emphasis to All Required Workflow Stages, Add Completion Indicators

**Status:** Accepted
**Date:** 2026-07-21
**Affects specs:** [Workspace Architecture](../../workspace/01_architecture.md) (Navigation Model → new Navigation State Semantics subsection), [Design System](../../design-system/01_design_system.md) (Design Tokens, Badge)
**Related ADRs:** [ADR-0020](./ADR-0020-progressive-navigation-as-non-restrictive-guided-emphasis.md) (this ADR partially supersedes only its Decision 3 scope boundary — see the partial-supersession note below; Decisions 1, 2, and 4 remain fully in force and are the load-bearing constraints this ADR is written against), [ADR-0012](./ADR-0012-guided-question-flow-as-standard-interaction-pattern.md) (the guided-flow/non-linear-navigation distinction this ADR continues to respect), [ADR-0002](./ADR-0002-business-idea-lifecycle-domain-model.md) (the domain model this ADR reads from, never redefines)

> **Partial supersession note (2026-07-21):** This ADR supersedes only [ADR-0020](./ADR-0020-progressive-navigation-as-non-restrictive-guided-emphasis.md)'s Decision 3 ("Scope: new/incomplete Projects only, and Business Structuring only... not a general 'suggested next step' engine across a Project's whole lifecycle"). ADR-0020's own Future Considerations named this exact generalization as a distinct decision requiring its own justification — this ADR is that justification. Every other Decision in ADR-0020 — the emphasis-not-restriction principle (Decision 1), the presentation-layer-only mechanism (Decision 2), and the no-new-state constraint (Decision 4) — remains fully in force and is extended, not reopened, by what follows. Read this ADR together with ADR-0020 for the current, accurate Navigation Model.

## Context

A design review of "Progressive Navigation" (the same name ADR-0020 already uses, for a narrower mechanism) proposed hiding future workflow items until prior ones complete. That review — see the design review preserved in this session's history and `planning/prototype/hypora-navigation-concepts.html` — rejected the hide/lock mechanism as a direct contradiction of the Navigation Model's non-linear guarantee, but endorsed a **locked-but-visible-effort's actual conclusion**: the underlying UX problem (current-page and next-recommended-step both rendered in the same blue, with no other distinguishing signal) is real, independent of any hide/lock question, and worth solving on its own.

Concept G ("Recommended Hybrid"), the resulting prototype comparison's recommended direction, asks for:
1. Current-page emphasis strong enough to never be confused with a mere suggestion.
2. **Completed** required stages marked with a check indicator — a signal ADR-0020 never addressed at all (ADR-0020 was only ever about *next-step* emphasis, never about *completion*).
3. **Next-recommended** shown for *any* required stage a Project is currently blocked on — not only Business Structuring, which is exactly the generalization ADR-0020's Decision 3 declined to make and named as needing its own ADR.
4. Required stages visually grouped; Risk (optional) and Overview (summary) visually separated from that group.

This ADR resolves both the named-but-deferred generalization and the net-new completion-indicator concern together, because both are answered by the same underlying data already computed by [`app/src/domain/lifecycle.ts`](../../../app/src/domain/lifecycle.ts)'s `blockingReason()` — introducing them separately would produce two ADRs reasoning about the same source of truth.

## Decision

1. **Emphasis and completion indication extend to all three required workflow stages** (Business Structuring, MVP Planning, Validation Planning) — no longer Business Structuring only. Risk Memo (optional) and Project Summary (always-available) are explicitly excluded from both completion and next-recommendation treatment, per Concept G's own role distinction — this is unchanged from, and consistent with, ADR-0020's original exclusion of Risk Memo from any emphasis logic.

2. **Reuses `blockingReason()` as the sole source of the "next recommended" signal — no new state.** This function ([`lifecycle.ts`](../../../app/src/domain/lifecycle.ts)) already exists, is already used by Project Summary, and already names which single artifact is currently blocking a Project's progress. Its return value maps deterministically onto at most one of the three required nav items:

   | `blockingReason()` | Required nav item |
   |---|---|
   | `"canvas"` | Business Structuring |
   | `"scope"` or `"feature-planning"` | MVP Planning |
   | `"validation-empty"` or `"validation-open"` | Validation Planning |
   | `"confirm"` or `null` | none (no required nav item is "next" — `"confirm"` is Project Summary's own Build-Ready confirmation, not a sibling nav destination) |

   This is a pure, presentation-layer mapping over an already-computed domain signal — it introduces no new persisted field, no new guard, and no new transition, per [ADR-0020](./ADR-0020-progressive-navigation-as-non-restrictive-guided-emphasis.md) Decision 4's own discipline, extended rather than reopened.

3. **Completion is derived per required stage from already-existing domain booleans/stage checks — no new state.** Business Structuring: `project.stage !== "captured" && project.stage !== "structuring"` (Canvas complete — the same signal the Navigation Model's existing Presentation exception already reused). MVP Planning: `canEnterValidating(project)` (`mvpScopeComplete && featurePlanningComplete`, already exported). Validation Planning: `canEnterValidated(project)` (every Validation Checklist item resolved, already exported).

4. **Current-page status and completion status are independent, not mutually exclusive.** A required stage that is both the active route and already complete (a user revisiting a finished stage) shows **both** signals at once — current-page emphasis is never suppressed by completion, and the completion check is never hidden just because the stage is currently open. This directly follows from [Workspace Architecture](../../workspace/01_architecture.md)'s own "Artifacts as continuously revisable thinking" principle: revisiting a completed stage is a fully ordinary, supported action, and the navigation must not misrepresent it as either "not done" or "not here."

5. **When the "next recommended" item is also the current page, the next-indicator is suppressed on that item.** Showing both a current-page treatment and a "next" badge on the same, single item is redundant — the current-page treatment already answers "where am I / what should I focus on." This is a presentation deduplication rule, not a change to what `blockingReason()` returns or means.

6. **Still never a restriction.** Restates [ADR-0020](./ADR-0020-progressive-navigation-as-non-restrictive-guided-emphasis.md) Decision 1 explicitly, now covering the generalized scope: every required stage, at every completion state, remains reachable in any order, with identical click/keyboard behavior. Nothing in this ADR disables, hides, or gates any route. A user may open Validation Planning on a Project that hasn't started Business Structuring today, tomorrow, and after this ADR, with identical outcome.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Introduce a new persisted "nav display state" per Project | Rejected — duplicates what `blockingReason()`, stage, and the two completion booleans already fully determine; violates [Workspace Data & State](../../workspace/02_data_and_state.md)'s standing rule against duplicating what completeness already tells you. |
| Collapse current+completed into a single role (current wins) | Rejected — loses the ability to show a user revisiting a finished stage that it is, in fact, finished; directly regresses the "Artifacts as continuously revisable thinking" principle by making a completed stage look unfinished the moment it's reopened. |
| Show the next-indicator on the current item too, when they coincide | Rejected as visual noise for no informational gain — the current-page treatment alone already answers "what to focus on right now" for that one item. |
| Extend emphasis/completion to Risk Memo and Project Summary as well | Rejected — Risk Memo gates no lifecycle transition and has no "completion" concept in the domain model; Project Summary is explicitly a read-only aggregate, not a workflow step, per the Navigation Model's existing distinction. Treating either as completable would invent a domain concept that doesn't exist. |

## Consequences

**Positive:**
- Resolves the actual reported ambiguity (current vs. next both rendered identically) without touching route access, guards, or persisted state.
- Reuses 100% existing domain signals — `blockingReason`, stage, `canEnterValidating`, `canEnterValidated` — all already implemented and already consumed elsewhere (Project Summary).
- Keeps ADR-0020's discipline intact: the generalization was named in advance as needing its own justification, and this ADR provides exactly that, rather than silently widening scope through an unrelated implementation task.

**Negative / accepted trade-offs:**
- The nav now carries more visual information per item (completion + emphasis + grouping) than before — accepted because Concept G's own design requirement is that this information be conveyed without relying on color alone, which necessarily means more than one visual dimension per state.
- A Project's nav can now show a "next" indicator on any of three items instead of only Business Structuring — a broader surface for the "does emphasis imply restriction" risk ADR-0020's own review already flagged. Mitigated by Decision 6 restating non-restriction explicitly and by keeping every item's click/keyboard behavior completely unchanged.

## Future Considerations

If a future need arises to show "next recommended" or completion treatment for a non-required item (Risk Memo, Project Summary, or any future structured Feature), that is a distinct decision requiring its own justification against the domain model's actual completion semantics for that Feature — this ADR's Decision 1 scope boundary (required stages only) should not be read as already covering it, mirroring the same discipline ADR-0020 itself used.
