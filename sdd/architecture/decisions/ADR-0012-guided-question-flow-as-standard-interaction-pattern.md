# ADR-0012: Guided Question-Flow as the Standard Interaction Entry Pattern for Planning Features

**Status:** Accepted
**Date:** 2026-07-12
**Affects specs:** [Product Vision](../../context/01_product_vision.md), [Future Expansion Strategy](../../context/06_future_expansion_strategy.md), [Workspace Architecture](../../workspace/01_architecture.md), [Business Structuring](../../workspace/features/02_business_structuring.md), [Risk Memo](../../workspace/features/06_risk_memo.md), [Implementation Lifecycle](../../workflow/00_implementation_lifecycle.md)

## Context

Multiple product architecture reviews concluded that founders think in questions, not framework vocabulary, and that frameworks (Lean Canvas, MVP, Validation) should emerge as structured outputs of guided thinking rather than being the first thing a user must understand. [Product Vision](../../context/01_product_vision.md#product-principles) already commits to Progressive Disclosure as an enduring principle, and [ADR-0004](./ADR-0004-guided-question-flow-for-business-structuring.md) already applied a guided-flow pattern to Business Structuring specifically. ADR-0004 explicitly rejected a chat-style conversational interface for V1 *because no AI capability existed yet at the time* — that precondition no longer holds now that V2's Canvas Assistant is built. This decision generalizes the pattern ADR-0004 already established, rather than reversing it; ADR-0004's own Decision and Consequences are unchanged.

[Risk Memo](../../workspace/features/06_risk_memo.md) currently specifies an entry point independent of Business Structuring ("directly from the Dashboard"), inconsistent with the agreed direction that Risk should be an optional guided-thinking activity associated with Business Structuring rather than an equal, independent planning stage.

This decision spans Context, Workspace, and every future Feature's interaction model, and is intended to be a durable, hard-to-reverse standard — meeting the ADR trigger criteria.

## Decision

1. Business Structuring's existing guided, one-question-at-a-time flow is generalized as the standard entry pattern for planning Features specified from this point forward. This does not modify ADR-0004, which remains scoped to Business Structuring's own five Canvas questions.
2. Guided-thinking entry and structured, directly-editable Workspace views are equal, permanent surfaces for any Feature adopting this pattern. Guided entry is the preferred first encounter; the structured view is always available. Neither is removed in favor of the other.
3. Guided entry never owns Project state. It only creates or updates the canonical Workspace artifact a Feature already owns, per [Workspace Data & State](../../workspace/02_data_and_state.md)'s ownership table — no new persistence layer or "conversation state" concept is introduced.
4. Framework identity (Lean Canvas, Risk, MVP, Validation terminology) is not required knowledge to begin using a Feature; it may surface once a user reaches that Feature's structured, directly-editable view.
5. AI Assistance's existing universal interaction lifecycle ([04_ai_interaction.md](../../ai/04_ai_interaction.md)) and Feature-scoped Capability ownership ([03_ownership_model.md](../../ai/03_ownership_model.md)) are unchanged and are the intended AI surface for any guided entry adopting this pattern. This decision does not alter capability, prompt, or context ownership.
6. No unified cross-Feature orchestration mechanism ("Question Sequencer" spanning multiple Features in one continuous thread) is introduced by this decision. Each Feature's guided entry is independent, reusing the same interaction pattern, not a shared state machine. A cross-Feature orchestration layer remains a distinct, future decision, to be made only if real evidence shows it's needed. **Refinement:** within a single guided flow, a question may move between conceptual domains whenever it improves the user's thinking, without that transition being visible as a Feature-boundary interruption — this never changes Concept Ownership. Every answer is still written to its single canonical Feature-owned field; no shared ownership, no duplicated data. This is a content/routing expectation on whichever guided flow presents the question, not the shared orchestration infrastructure rejected above.
7. [Risk Memo](../../workspace/features/06_risk_memo.md) is the first Feature to apply this decision retroactively: its entry point moves from an independent page-first model to an optional guided-thinking activity reachable from within Business Structuring's flow, while its data ownership, AI Capability, and directly-editable structured view remain unchanged (see that Feature's own updated Navigation section).
8. MVP Planning and Validation Planning's existing V1 specifications are not modified by this decision — they were authored before this pattern existed, are already-approved V1 core scope, and changing their interaction model now would be a redesign, not a clarification. This decision governs Features specified from this point forward.
9. **Workspace artifacts are continuously revisable thinking, not one-time output of a single guided flow.** A user may return to any Feature's structured view at any time as their thinking evolves elsewhere in the Project, and every field remains editable indefinitely — this restates an already-true property of every existing Feature's data model (no field is ever locked or versioned once authored) as a permanent, deliberate philosophy rather than an incidental fact. This decision introduces **no new cross-Feature read relationship**: a founder revisiting Canvas after working on Risk Memo, or MVP Scope after Validation Planning, is a manual, user-driven action, not a new capability-to-capability data flow. Every existing capability-independence boundary — including [Risk Memo](../../workspace/features/06_risk_memo.md)'s stated "No direct relationship" with MVP Planning — is unchanged by this decision.
10. **A Feature's internal name is an architecture and specification concept, not required user-facing vocabulary.** A guided flow may present a question without naming the Feature or framework it maps to; the Feature's own name and structure become visible once a user reaches its structured, directly-editable view, per Decision 4. Internal architecture and user-facing presentation are intentionally decoupled — this is a permanent rule, not a V1-specific default.
11. Validating conversation-first UX changes through low-fidelity interaction prototypes before production implementation is a delivery/process concern, not an architectural one — see [Implementation Lifecycle](../../workflow/00_implementation_lifecycle.md#conversation-first-ux-prototyping-checkpoint) for where that procedure is recorded; it is not restated here.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| A unified cross-Feature Question Sequencer with full conversational continuity across all Features | Unnecessary infrastructure investment without evidence of need; may be revisited if real usage shows founders want seamless cross-Feature continuity |
| Retrofitting MVP Planning and Validation Planning to guided entry immediately | Would redesign already-approved V1 scope; contradicts this task's own preference for evolution over rewrite |
| Hard-gating structured/direct-edit views until a "readiness" condition is met | Contradicts Manual-first and founder agency; rejected in prior reviews and not reopened here |
| Modeling artifact-evolution (Decision 9) as a new automated cross-Feature context relationship | Would contradict the already-frozen Capability Independence rule and existing Feature Relationships tables (e.g. Risk Memo ↔ MVP Planning); rejected in favor of framing it as manual, founder-driven revisiting of already-always-editable fields |

## Consequences

**Easier:**
- Future planning Features (GTM, Pricing, Launch, Growth Experiments, Customer Interviews) inherit a settled interaction-model answer before they're specced, removing the need for a repeated architecture debate.
- No new infrastructure is required — the existing guided-question-flow component pattern (Business Structuring), existing AI interaction lifecycle, and existing always-editable data model already satisfy this decision in full, including its Decision 9–10 refinements.

**Negative / accepted trade-offs:**
- Each Feature's guided entry remains independently implemented (not orchestrated into one continuous cross-Feature thread); founders may still perceive a seam between Features' conversational entries. Accepted as the lower-risk option; revisit only with real evidence of need.
- Hiding framework identity during conversational entry risks weakening learning transfer if a Feature's later "reveal" of its framework name isn't deliberately designed as a teaching moment — this is a UX-execution responsibility of each Feature, not resolved by this ADR.
