# ADR-0019: AI-Generated Onboarding Presets at Project Creation

**Status:** Partially Superseded by [ADR-0021](./ADR-0021-always-concrete-onboarding-presets.md) — see note below
**Date:** 2026-07-20

> **Partial supersession note (2026-07-21):** [ADR-0021](./ADR-0021-always-concrete-onboarding-presets.md) supersedes only this ADR's Decision 3 (the Sufficiency/Thinking-Prompts branching in the Response Contract) and the discriminated-union framing in Decisions 1 and 7. Every other Decision here — the new Capability #07, single-call batching (Decision 2), Project Description as a persisted field (Decision 4), static-provider Fallback (Decision 5), Regeneration reuse (Decision 6), and the Automatic Invocation exception itself (Decision 7's core grant) — remains fully in force, unchanged. Read this ADR together with ADR-0021 for the current, accurate Response Contract.
**Affects specs:** [AI Interaction Specification](../../ai/04_ai_interaction.md), [AI Ownership Model](../../ai/03_ownership_model.md), [Canvas Assistant](../../ai/capabilities/01_canvas_assistant.md), new capability file `sdd/ai/capabilities/07_onboarding_preset_assistant.md`, [Project Management](../../workspace/features/01_project_management.md), [Business Structuring](../../workspace/features/02_business_structuring.md), [Question Model & Preset Strategy](../../workspace/features/02_1_question_model.md), [Workspace Data & State](../../workspace/02_data_and_state.md)
**Related ADRs:** [ADR-0006](./ADR-0006-ai-as-platform-capability.md) (Capability contract discipline this ADR's new capability follows), [ADR-0011](./ADR-0011-defer-multi-step-workflow-orchestration.md) (bounds this to a single-call capability, not orchestration), [ADR-0017](./ADR-0017-automatic-invocation-for-project-summary-initial-generation.md) (the only prior Automatic Invocation exception — this ADR is the second, following the same narrow-bar discipline that ADR set), [ADR-0018](./ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md) (precedent for narrowing/superseding in place rather than rewriting)

## Context

Business Structuring's guided flow ([02_business_structuring.md](../../workspace/features/02_business_structuring.md)) presents each of the five Canvas questions with 3–5 curated preset options, per the **Preset Strategy**'s Preset Provider contract ([02_1_question_model.md#preset-strategy](../../workspace/features/02_1_question_model.md#preset-strategy)): `Input(Question ID, current answers/context, current language) → Output(3–5 localized preset options)`. That document already anticipated this exact moment — its V2 note states the Preset Provider is "the V2 seam" so that "V2's AI Canvas Assistant can become a different Preset Provider for these same five questions... without the guided flow, the Question Model, or the select-or-customize interaction changing at all."

Two V1-era statements are now stale, in the same way `01_architecture.md`'s "AI out of scope" line was stale before this project entered V2 (superseded, not deleted, per this project's evolution-rules discipline):
- Business Structuring's Acceptance Criteria: "No question's preset content is ever AI-generated in V1."
- Business Structuring's Out of Scope: "Any AI generation of preset content... Out of scope until V2."

A product proposal (reviewed and revised across multiple rounds; final revision approved) asks that a Project's presets be tailored by AI from the moment of creation — using the Project's Name and an optional Description — rather than the user needing to open Business Structuring and manually invoke Canvas Assistant per question. This requires two genuine decisions this ADR resolves together, because they are one coherent behavior, not two:

1. **A capability decision:** which existing or new AI Capability produces these tailored presets, and whether producing them for all five questions in one request is consistent with [ADR-0011](./ADR-0011-defer-multi-step-workflow-orchestration.md)'s deferral of multi-step orchestration.
2. **An invocation-timing decision:** generating presets automatically, before any explicit "Ask AI" action, is Automatic Invocation — [AI Interaction Specification](../../ai/04_ai_interaction.md)'s Governing Rule 1 defers this by default, with exactly one named exception today (ADR-0017, Project Summary's Initial Generation). A second exception requires its own ADR against that same narrow bar, per ADR-0017's own Future Impact.

## Decision

### 1. New Capability: Onboarding Preset Assistant

Introduce **Onboarding Preset Assistant** as AI Capability #07 ([sdd/ai/capabilities/07_onboarding_preset_assistant.md](../../ai/capabilities/07_onboarding_preset_assistant.md)), rather than extending Canvas Assistant. Per the [Capability Promotion Rules](../../ai/capabilities/000_index.md#capability-promotion-rules)' mandatory trigger ("Two behaviors' Response Contracts diverge"), this capability's Response Contract — a batch of per-question preset sets, or a Thinking Prompts fallback (Decision 3 below) — does not fit Canvas Assistant's existing Response Contract shape (a single suggestion text + optional rationale, one field at a time). A single request producing tailored content for all five Canvas questions at once, plus a distinct fallback content type, is a genuinely different outward contract, not a variation Canvas Assistant's existing Operation field can absorb without making that field's meaning conditional — exactly the ambiguity the Promotion Rules exist to prevent.

This keeps Canvas Assistant's own contract untouched for its existing manual, per-question, in-flow use — no version bump is required on Canvas Assistant's own Contract Version as a result of this ADR.

### 2. Single-call, not orchestrated

One capability call per Project creation, requesting presets for all five Canvas questions at once, returned in one Response. This is a single capability invocation (consistent with [ADR-0011](./ADR-0011-defer-multi-step-workflow-orchestration.md) and the AI Application Service's existing single-call model) — not five sequential Canvas Assistant calls and not a client-orchestrated chain of an initial sufficiency-check call followed by a separate generation call. Batching the five questions into one Request/Response was chosen specifically to avoid needing multi-step orchestration for what is otherwise a single, coherent "give this new Project its starting presets" action.

### 3. Content self-selects: tailored presets or Thinking Prompts, never a blocking prompt-back

The capability's own judgment, expressed entirely within its Response, decides how much of the input (Name, optional Description) was enough:

- **Sufficient context** → Response carries tailored preset sets for all five Canvas questions, in the same shape (3–5 localized options per question) the existing Preset Strategy already defines.
- **Insufficient context** (e.g., a very short or generic Name, no Description) → Response carries **Thinking Prompts** for the Business Idea question — open-ended, provocative questions rather than answer-shaped presets — while the remaining four questions fall back to their existing V1 static curated presets (see Decision 5). Thinking Prompts are a new, distinct preset-adjacent content type, not a form of preset (see the new capability's Response Contract); Business Structuring presents them differently from an ordinary preset list, per [Business Structuring](../../workspace/features/02_business_structuring.md)'s update.

This refines the reviewed proposal's original three-branch tree (self-explanatory name → proceed; ambiguous name → block on a description prompt; no description ultimately available → Thinking Prompts) into a single non-blocking branch, as this ADR's own refinement (see Alternatives Considered). The user is never blocked waiting for a description before Business Structuring opens.

### 4. Project Description becomes a persisted Project field

Add **Description** (optional, freeform) to the Project creation form alongside the existing required Name, always visible — never a conditional follow-up prompt gated on an "is this name ambiguous" judgment. Description is persisted per Project (see [Workspace Data & State](../../workspace/02_data_and_state.md) update) and remains user-editable after creation. Per [AI Interaction Specification](../../ai/04_ai_interaction.md#conversation-policy)'s User Input Has Highest Authority: editing the Description after creation never automatically overwrites already-authored Canvas content — it only affects future capability invocations that read it (this Capability's own one-time call, and, per Canvas Assistant's existing seed-field pattern, any later manual Canvas Assistant invocation on a still-empty field).

### 5. Failure and fallback: the existing V1 static Preset Provider, unchanged

If Onboarding Preset Assistant fails or is unavailable (per the AI Platform's unified error taxonomy, [Provider Independence & Configuration](../../ai/02_provider_independence_and_configuration.md)), Business Structuring proceeds exactly as V1 always has: every question shows its existing static curated presets. This introduces no new failure-handling concept — it reuses the Preset Strategy's already-existing static Preset Provider as the fallback provider, exactly the same provider V1 always used before any AI existed. Per [AI Feedback and Error Experience](../../ai/05_ai_feedback_and_error_experience.md)'s Graceful Degradation principle, referenced here rather than restated: no screen or progression depends on this capability succeeding.

### 6. Regeneration reuses the existing Suggestion Lifecycle — no new mechanism

Once Business Structuring is open, a user may regenerate any single question's presets via the same manual "Ask AI" / Regenerate affordance [Canvas Assistant](../../ai/capabilities/01_canvas_assistant.md) already offers per question — this ADR introduces no new regeneration concept. Onboarding Preset Assistant is never re-invoked after its one automatic call at creation; a later regeneration for a single question is an ordinary manual Canvas Assistant invocation, unaffected by this ADR.

### 7. Automatic Invocation: the second named exception

Amend [AI Interaction Specification](../../ai/04_ai_interaction.md)'s Invocation Model table with a second, individually-named exception, following ADR-0017's own instruction that future exceptions be named individually rather than generalized into an open-ended mode:

**The exception:** Onboarding Preset Assistant's single Operation, system-triggered exactly once per Project, immediately after Project creation (Name confirmed, Description present or not). No other capability, and no other invocation of this same capability, carries this exception — there is exactly one call, ever, per Project.

This exception clears the same narrow bar ADR-0017 set, and clears it more easily than ADR-0017 itself did:
- **One-time, tightly-bounded trigger** — fires once, at creation, never re-fires (ADR-0017's own bar).
- **No live-edit-overwrite risk** — stronger than ADR-0017's case. Project Summary's exception writes directly to a not-yet-existing artifact; this exception writes to nothing at all. Its output is a set of *offered presets*, presented through the exact same select-or-customize interaction the Question Model already defines for any preset — Manual-first's "never auto-inserted" rule (Governing Rule 2, and [Canvas Assistant](../../ai/capabilities/01_canvas_assistant.md)'s own Acceptance Criteria) is not touched or exempted at all, because no Canvas field is ever written by this capability. Unlike ADR-0017 Decision 5, no carve-out from the Suggestion Ready step is needed here.
- **Substantial-input-gated in spirit** — gated on the user having completed the creation form (Name, and optionally Description), not a timer, blur, or page-load trigger unconnected to user action.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Extend Canvas Assistant's existing Operation enum with a fifth "batch onboarding" operation | Rejected per the Capability Promotion Rules' mandatory trigger — the Response Contract (a five-question batch, with a Thinking-Prompts fallback branch) diverges from Canvas Assistant's single-suggestion shape enough that folding it in would make the Operation field's meaning conditional, the exact ambiguity the Promotion Rules exist to prevent. |
| Two-call chain: a sufficiency-check capability call, then a separate batch-generation call | Rejected — this is exactly the kind of multi-step client-orchestrated AI flow [ADR-0011](./ADR-0011-defer-multi-step-workflow-orchestration.md) defers. A single capability whose Response self-selects its own content type achieves the same product outcome (never showing generic presets when better ones are possible) in one call. |
| Block Business Structuring behind a mandatory "add a description" prompt when the name looks ambiguous | Rejected as the reviewed proposal's own required revisions already flagged: an "is this name ambiguous" judgment is itself an unreliable, hard-to-specify heuristic, and blocking contradicts this product's existing manual, non-restrictive philosophy. Making Description an always-visible, always-optional field on the creation form, with the capability's Response degrading gracefully to Thinking Prompts when input stays thin, resolves the same problem without ever blocking the user. |
| Model the automatic call as writing directly into Canvas fields (mirroring ADR-0017 Decision 5's direct-write carve-out) | Rejected — Canvas fields are user-authored answers, not a not-yet-existing artifact like Project Summary. Writing to them automatically would violate Canvas Assistant's own Acceptance Criteria ("never auto-inserted") and Governing Rule 2. Presets, not answers, are the correct output shape — the user still explicitly selects or customizes each answer, exactly as every existing preset already works. |
| Treat the static V1 presets as replaced (not merely a fallback) now that AI presets exist | Rejected — the static Preset Provider is not deprecated by this ADR. It remains Business Structuring's fallback whenever AI presets are unavailable, or whenever the AI Response falls back to Thinking Prompts for the Business Idea question while the other four questions still need presets. |

## Consequences

**Positive:**
- Realizes the Preset Strategy's own long-anticipated V2 seam exactly as that document already described it — the guided flow, Question Model, and select-or-customize interaction are unchanged.
- Clears the Automatic Invocation bar with less risk than ADR-0017's own precedent, since no Canvas content is ever written automatically.
- Avoids a second Automatic Invocation exception ballooning into a general pattern — this ADR's own Decision 7 is exactly one operation, one trigger, following ADR-0017's Future Impact instruction.
- Keeps the static V1 Preset Provider fully intact as a permanent, always-available fallback — no new failure-handling design needed.

**Negative / accepted trade-offs:**
- Introduces a second AI cost the user did not explicitly request (after Project Summary's Initial Generation, per ADR-0017). Accepted for the same reason ADR-0017 accepted its own: it fires at most once per Project, and is gated on the user's own creation-form input.
- A Project created while offline, or during a transient provider failure, silently receives static presets with no automatic AI retry — accepted, consistent with Graceful Degradation; the user may still manually invoke Canvas Assistant per question once online.
- Description becomes a second free-text Project field (alongside Name) a user must be told is optional — a small addition to the creation form's surface area, accepted because it is what makes tailored presets possible without a blocking prompt.

## Future Considerations

Any future capability proposing Automatic Invocation must still clear ADR-0017's original bar, refined by this ADR's stronger no-live-edit-overwrite case where applicable. [AI Interaction Specification](../../ai/04_ai_interaction.md)'s Invocation Model table now names two exceptions individually; a third must be named individually in turn, never folded into a general "automatic" mode. If Description later proves useful to more than Onboarding Preset Assistant (e.g., a future capability wanting richer creation-time context), it is already Normalized Workspace Context-eligible via the existing Context Eligibility Rules ([01_architecture.md#context-eligibility-rules](../../workspace/01_architecture.md#context-eligibility-rules)) — no new mechanism is anticipated here ahead of that real second need.
