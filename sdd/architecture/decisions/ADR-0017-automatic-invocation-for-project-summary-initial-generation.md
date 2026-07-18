# ADR-0017: Automatic (System-Triggered) Invocation for Project Summary's Initial Generation

**Status:** Accepted
**Date:** 2026-07-18
**Affects specs:** [AI Interaction Specification](../../ai/04_ai_interaction.md), [Project Summary Feature](../../workspace/features/05_project_summary.md), AI Capability Index (forthcoming capability file, `sdd/ai/capabilities/`)
**Related ADRs:** [ADR-0016](./ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md) (the companion decision this ADR's trigger condition depends on), [ADR-0011](./ADR-0011-defer-multi-step-workflow-orchestration.md) (confirms this remains a single-call capability, not workflow orchestration)

## Context

[AI Interaction Specification](../../ai/04_ai_interaction.md)'s Invocation Model explicitly defers Automatic Invocation: "The system starting a capability call without an explicit user action ... is out of scope for V2 ... no code path may trigger Requesting except a user's explicit action" (Governing Rule 1: "Passive UI never invokes AI").

The Project Summary feature's Initial Generation requirement is exactly this case: the first synthesized summary must begin generating in the background the moment a Project has sufficient input (Business Canvas, MVP Plan, and Validation Plan each complete), with the Summary Card always visible in a loading state — the user must never be required to press a button to get their first summary, and must never be blocked while it generates. This is a genuine, narrow reversal of an explicit V2 boundary, not an oversight, and must be recorded and scoped tightly so it does not quietly loosen Governing Rule 1 for any other capability.

## Decision

1. **Introduce Automatic Invocation as a second Invocation Mode**, alongside Manual invocation, amending [AI Interaction Specification](../../ai/04_ai_interaction.md)'s Invocation Model table.

2. **Scope: exactly one operation, one trigger.** Automatic Invocation applies only to the Project Summary Synthesis Assistant capability's **Initial Generation** operation. Every other current and future AI Capability, and every other operation of this same capability (notably its Sync-triggered regeneration), remains Manual-only per Governing Rule 1. This is not a general toggle — a future capability wanting Automatic Invocation must earn it via its own ADR against the same narrow bar this one sets (below), never by citing this ADR as a blanket precedent.

3. **Trigger condition.** Initial Generation fires automatically, at most once per Project, the first time that Project's derived lifecycle stage (per [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)) reaches **Validated** while Summary is still `NotGenerated` — i.e., Canvas, MVP Scope, Feature Planning, and the Validation Checklist have all reached the completion state the domain lifecycle already computes. This reuses an existing, already-computed signal (the domain lifecycle's own stage transition) rather than introducing a second, parallel "are the inputs ready" computation — consistent with [Workspace Data & State](../../workspace/02_data_and_state.md)'s existing rule against duplicating what completeness already tells you.

4. **Execution model: client-orchestrated, non-blocking, not a server-side job queue.** Consistent with the existing AI Application Service's single-call model ([ADR-0006](./ADR-0006-ai-as-platform-capability.md) through [ADR-0008](./ADR-0008-ai-platform-ownership-model.md)) and [ADR-0011](./ADR-0011-defer-multi-step-workflow-orchestration.md)'s confirmation that workflow orchestration remains out of scope: "background" means the request is issued without the user having clicked anything and without blocking the UI thread's responsiveness (fire-and-await via the existing capability-invocation hook, rendered as the Summary Card's own loading state) — it does not mean a durable, retryable, server-side background job. No new server-side infrastructure is introduced by this ADR.

5. **No Suggestion Ready / Accept-Reject step for this specific automatic case.** The existing single-call Interaction Lifecycle (Idle → Requesting → Generating → Suggestion Ready/Failed) still governs the call mechanically, but Initial Generation's success path writes directly into the `Generated` state ([ADR-0016](./ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md)) rather than pausing at an offered `Suggestion Ready` the user must Accept. This is justified narrowly: Manual-first's "never overwrite live user edits" concern (Governing Rule 2) does not apply here, because Initial Generation targets an artifact that does not yet exist — there is no live user-authored Summary text in flight to protect. Every subsequent regeneration (the Sync dialog's **AI Summary Update**) is unaffected by this carve-out and keeps the full Suggestion Ready → user-edits-the-draft → explicit Apply flow, per ADR-0016 Decision 4.

6. **Failure behavior.** If Initial Generation fails, Summary returns to `NotGenerated` (never a stuck `Generating` or a dead-end `Failed` state blocking the Summary page) and is safely re-attempted the next time its trigger condition re-evaluates (e.g., the next time the Summary page is opened, or the next qualifying save) — consistent with [AI Feedback and Error Experience](../../ai/05_ai_feedback_and_error_experience.md)'s Graceful Degradation principle: no screen or progression depends on this capability succeeding.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Require a manual "Generate Summary" button the first time Summary is `NotGenerated` | Rejected — directly contradicts the explicit product requirement that generation begins automatically once inputs are sufficient, with the user never blocked or required to take an extra action |
| Loosen Governing Rule 1 globally, allowing any capability to auto-invoke | Rejected — far broader than this feature needs; would silently erode Manual-first's cost and predictability guarantees for every other capability (Canvas Assistant, Risk Memo Assistant, etc.), none of which asked for this |
| Model Initial Generation as an ordinary Suggestion the user must Accept/Reject, like every other capability | Rejected — there is no live field content to protect (Decision 5), and forcing an Accept step here reintroduces exactly the manual friction the product requirement removes |
| Build a durable server-side background job/queue to run Initial Generation | Rejected — no such infrastructure exists anywhere in the codebase today, and one is not needed: a single, non-blocking client-issued request, rendered as a loading Summary Card, fully satisfies "never blocks the user," per the project's "smallest implementation that preserves architecture" principle |

## Consequences

**Positive:**
- Satisfies "never blocked, background generation" without weakening Manual-first anywhere else in the AI Platform.
- Reuses an existing signal (domain lifecycle stage) instead of introducing new completeness-tracking state.
- Keeps the exception auditable: one capability, one operation, one trigger, recorded here rather than discovered as an inconsistency later.

**Negative / accepted trade-offs:**
- Introduces the project's first AI cost the user did not explicitly request. Accepted because it fires at most once per Project and is gated on substantial, already-authored input (three fully completed sections) — not a timer, blur, or page-load trigger.
- A user who reaches Validated while offline or mid-navigation may not see generation start until the trigger condition is next evaluated; this is an acceptable, non-blocking degradation, not a correctness issue (Summary simply remains `NotGenerated` until then).

## Future Impact

Any future capability proposing Automatic Invocation must justify it against this same narrow bar (one-time-or-tightly-bounded trigger, substantial-input-gated, no live-edit-overwrite risk) via its own ADR. This ADR does not generally reopen Governing Rule 1, and [AI Interaction Specification](../../ai/04_ai_interaction.md)'s Invocation Model table must name each such exception individually rather than growing a second, general "automatic" mode.
