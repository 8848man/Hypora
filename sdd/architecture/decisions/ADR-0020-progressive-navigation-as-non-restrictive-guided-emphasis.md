# ADR-0020: Progressive Navigation as Non-Restrictive Guided Emphasis

**Status:** Partially Superseded by [ADR-0022](./ADR-0022-generalize-navigation-emphasis-with-completion-indicators.md) — see note below
**Date:** 2026-07-20

> **Partial supersession note (2026-07-21):** [ADR-0022](./ADR-0022-generalize-navigation-emphasis-with-completion-indicators.md) supersedes only this ADR's Decision 3 (the "Business Structuring only" scope boundary) — exactly the generalization this ADR's own Future Considerations named as needing a separate decision. Decisions 1 (never a restriction), 2 (presentation-layer only), and 4 (no new state) remain fully in force and are extended, not reopened, by ADR-0022. Read this ADR together with ADR-0022 for the current, accurate Navigation Model.
**Affects specs:** [Workspace Architecture](../../workspace/01_architecture.md) (Navigation Model, Workspace Mental Model Review), [Project Management](../../workspace/features/01_project_management.md)
**Related ADRs:** [ADR-0012](./ADR-0012-guided-question-flow-as-standard-interaction-pattern.md) (established that a guided flow's internal sequence is a Feature-level concept, distinct from Workspace-level non-linear navigation — this ADR extends that same distinction to a new, related case), [ADR-0019](./ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) (the companion decision this ADR's motivating context, the reviewed onboarding proposal, shares an origin with)

## Context

[Workspace Architecture](../../workspace/01_architecture.md)'s Navigation Model states plainly: "Within a Project | Business Structuring, MVP Scope, Feature Planning, and Validation Checklist are siblings — reachable in any order (non-linear)." The Workspace Mental Model Review reinforces this: navigation is organized around "Projects and their artifacts, not around lifecycle stages as top-level screens," and lifecycle stage is "a derived status... not a parallel navigation structure."

The reviewed onboarding proposal (see [ADR-0019](./ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) for its AI-generation half) also asks for **Progressive Navigation**: immediately after a new Project is created, visually emphasize the natural next step (Business Structuring) over the other three sibling sections, so a first-time user isn't presented with four equally-weighted destinations before they've authored anything. Read literally, "emphasize the next step" risks contradicting the Navigation Model's explicit non-linear, artifact-oriented philosophy above — this ADR exists to reconcile the two explicitly, per this project's discipline against letting a new decision silently sit beside an existing principle without stating how they coexist ([ADR-0012](./ADR-0012-guided-question-flow-as-standard-interaction-pattern.md) is the direct precedent for this kind of reconciliation).

## Decision

1. **Progressive Navigation is a visual emphasis layer, never a navigational restriction.** Every sibling section (Business Structuring, MVP Scope, Feature Planning, Validation Checklist) remains reachable at all times, in any order, exactly as the Navigation Model already specifies. Nothing about this ADR disables, hides, or gates any section — a user may open MVP Scope on an entirely empty Project today, tomorrow, and after this ADR, with identical outcome.

2. **What changes: presentation order and visual weight, not access.** On a Project whose Canvas is not yet complete, the Project's own navigation surface (however Workspace renders its sibling sections — e.g., a Dashboard/Project view) may present Business Structuring with greater visual prominence (e.g., listed first, or marked as the suggested next step) than the other three siblings. Once Canvas reaches completion (the same signal [ADR-0017](./ADR-0017-automatic-invocation-for-project-summary-initial-generation.md) already reuses for Project Summary's trigger), this emphasis is not owed to any particular section — Progressive Navigation does not extend to suggesting MVP Scope over Feature Planning or any other ordering among the remaining three; the Mental Model Review's artifact-oriented, non-hierarchical view governs everything past this one onboarding moment.

3. **Scope: new/incomplete Projects only, and Business Structuring only.** Progressive Navigation's emphasis applies only to steering a new Project toward its first guided flow. It is not a general "suggested next step" engine across a Project's whole lifecycle — MVP Planning, Feature Planning, and Validation Planning remain permanently equal-weight siblings, reachable in any order, with no analogous emphasis logic applied among them by this ADR.

4. **No new navigation state, no new routing concept.** This is a presentation-layer decision over the *existing* set of reachable destinations, computed from data the domain model already exposes (Canvas completion, per the [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s existing Structuring stage signal) — it introduces no new persisted state, no new guard, and no new transition, consistent with [Workspace Data & State](../../workspace/02_data_and_state.md)'s existing rule against duplicating what completeness already tells you.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Restrict navigation so MVP Scope/Feature Planning/Validation Checklist are unreachable until Business Structuring is complete | Rejected — directly contradicts the Navigation Model's explicit non-linear guarantee and the Mental Model Review's "artifacts as continuously revisable thinking" philosophy; would also block a returning user who deliberately wants to jot a Feature idea before finishing the Canvas, a workflow the existing architecture explicitly protects. |
| Leave navigation fully unweighted, with no onboarding emphasis at all | Rejected — this is the status quo the proposal identified as a real first-time-user problem (four equally-weighted, unexplained destinations on an empty Project); the reviewed proposal's underlying UX concern is legitimate and doesn't require a navigational restriction to solve. |
| Generalize Progressive Navigation into a persistent "suggested next step" indicator across the whole Project lifecycle | Rejected as broader than the proposal's actual motivation (easing the very first moment after creation) and as scope creep beyond what this ADR needs to decide — a future, separately-justified proposal may revisit this if a real need emerges. |

## Consequences

**Positive:**
- Resolves the proposal's onboarding-clarity goal without weakening or reopening the Navigation Model's non-linear guarantee.
- Costs no new state, guard, or routing concept — pure presentation over already-derived completion data.
- Keeps the exception narrow and explicit, following the same "name the exception, don't generalize the rule" discipline [ADR-0017](./ADR-0017-automatic-invocation-for-project-summary-initial-generation.md) established for Automatic Invocation.

**Negative / accepted trade-offs:**
- Introduces the Workspace's first instance of asymmetric visual weighting among the four sibling sections, where none existed before — accepted because it is presentation-only and time-bounded (ends at Canvas completion), not a precedent for weighting the remaining three siblings against each other.

## Future Considerations

If a future need arises to suggest a next step *among* MVP Scope, Feature Planning, and Validation Checklist (not just onboarding into Business Structuring), that is a distinct decision requiring its own justification against the Mental Model Review's existing philosophy — this ADR's Decision 3 scope boundary should not be read as already covering it.
