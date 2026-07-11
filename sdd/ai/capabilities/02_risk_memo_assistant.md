# Capability: Risk Memo Assistant

**Refs:** → [Capability Index](./000_index.md) · [AI Platform Architecture](../01_architecture.md) · [Ownership Model](../03_ownership_model.md) · [Provider Independence & Configuration](../02_provider_independence_and_configuration.md) · [Risk Memo](../../workspace/features/06_risk_memo.md) · [Canvas Assistant](./01_canvas_assistant.md) · [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md)

**Contract Version:** 1.0 — **Draft** (no Feature is implemented against this contract yet; per [Contract Versioning](./000_index.md#contract-versioning), it may still change freely, including breaking changes, without a version bump, until [Risk Memo](../../workspace/features/06_risk_memo.md) is actually built against it).

*(First capability instantiating the generalized AI-assisted structured-feature architecture — see [AI Ownership Model](../03_ownership_model.md#context-representation-pipeline)'s Context Representation Pipeline for the pipeline this capability's requests flow through, and [Future Expansion Strategy](../../context/06_future_expansion_strategy.md#future-ready-architecture-principle)'s 4th principle for why this did not require a new architecture. Deliberately a separate capability from [Canvas Assistant](./01_canvas_assistant.md), not a shared or extended contract — per [Capability Promotion Rules](./000_index.md#capability-promotion-rules), Risk Memo's Request/Response shape (a Target field naming one of three Risk Memo fields, plus sibling Risk Memo values) diverges from Canvas Assistant's from the outset; consolidating them would immediately trip the "cannot share one field set without a field whose meaning is conditional on which behavior is invoked" mandatory trigger.)*

## Purpose

Help a user articulate one field of their [Risk Memo](../../workspace/features/06_risk_memo.md) — Technical Risks, Business Risks, or Open Questions — grounded in their completed Business Canvas, the same way Canvas Assistant helps with Canvas fields.

## Responsibility

**In scope:**
- Suggesting content for exactly one Risk Memo field at a time, targeted by the Feature's own explicit invocation (Manual-first — see [04_ai_interaction.md](../04_ai_interaction.md)'s Governing Rules; this capability never decides which field to target).
- Grounding that suggestion in the Business Canvas and the Risk Memo's own other, already-answered fields (sibling context) — never in MVP Planning, Validation Planning, or any other Feature's data, per the capability-independence rule this generalized architecture establishes ([AI Ownership Model](../03_ownership_model.md)).

**Not in scope for Contract Version 1.0:** missing-information detection, follow-up questions, or refinement operations analogous to Canvas Assistant's other three behaviors — Risk Memo's fields are each optional and non-gating (per [Risk Memo](../../workspace/features/06_risk_memo.md#ownership)'s own Ownership section), so there is no "missing information that would materially weaken the hypothesis" concept to detect here the way there is for the Canvas. A future minor version may add operations if a real need emerges; none is assumed now.

## Consumers

- [Risk Memo](../../workspace/features/06_risk_memo.md) — the sole consumer. No other Feature may invoke this capability, per the same independence rule this capability itself relies on for its own context boundary.

## Request Contract

*(Conceptual shape only — see [Canvas Assistant](./01_canvas_assistant.md#request-contract) for the identical pattern this mirrors.)*

| Field | Meaning |
|---|---|
| Operation | Currently always `"suggestion"` — kept as an explicit field, mirroring Canvas Assistant, so a future minor version can add operations without a breaking change |
| Canvas context | Normalized Workspace Context for the current Project's Canvas, supplied via the Workspace Context Builder ([Workspace Architecture](../../workspace/01_architecture.md#workspace-context-builder)) and the Feature's own Capability Context Selection ([Context Representation Pipeline](../03_ownership_model.md#context-representation-pipeline)) |
| Target field | Which of the three Risk Memo fields this invocation targets: `technical_risks` \| `business_risks` \| `open_questions` |
| Sibling field values | The Risk Memo's other two fields' current values, if any — mirrors Canvas Assistant's "Prior answers"; supplied only from Risk Memo's own data, never another Feature's |
| Language | The user's current language, per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md) |

Context accumulation and user-override-priority rules governing what these fields contain on any given invocation are Platform-wide, per [04_ai_interaction.md#conversation-policy](../04_ai_interaction.md#conversation-policy) — this capability does not redefine them.

## Response Contract

| Field | Meaning |
|---|---|
| Suggestion text | Already-localized presentation content — a suggested value for the targeted Risk Memo field |
| Confidence / rationale | Optional supporting note, identical in role to [Canvas Assistant](./01_canvas_assistant.md#response-contract)'s own — capability-specific detail deferred to implementation |

The Feature always presents a suggestion as an offer, never an automatic edit — identical to every other AI Capability in this product.

## Failure Model

| Case | Handling |
|---|---|
| Provider/Service failure (per the unified error taxonomy, [Provider Independence & Configuration](../02_provider_independence_and_configuration.md)) | Risk Memo proceeds exactly as it does today with no AI available — this capability is additive, never a blocking dependency, consistent with Risk Memo's own non-gating design |
| Empty or low-value suggestion | Treated as "nothing to suggest," not an error — identical framing to Canvas Assistant |

## Localization

Per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md): suggestions are returned already-localized in the user's current language. Once accepted into a Risk Memo field, the text is ordinary user-authored content — never re-localized on a later language switch, identical to every other AI-assisted field in this product.

## Acceptance Criteria

- A Risk Memo field with a suggestion available shows it as an offer, distinguishable from the user's own entered text, never auto-inserted.
- If this capability is unavailable or fails, Risk Memo behaves exactly as it does with no AI available — no degradation beyond the absence of a suggestion, per [Risk Memo](../../workspace/features/06_risk_memo.md)'s own Acceptance Criteria.
- A suggestion for one Risk Memo field is never generated for, or applied to, another field — this capability governs exactly one field per invocation, per the frozen architecture's field-level-only interaction model.

## Out of Scope

- Any data from MVP Planning, Validation Planning, or any Feature other than Risk Memo and the Business Canvas — per the capability-independence rule; a future need for cross-Feature context is a new, explicit architecture decision, not something this capability may assume.
- Whole-Risk-Memo (all three fields at once) generation — explicitly excluded by the frozen architecture's field-level-only interaction model; see [AI Ownership Model](../03_ownership_model.md).
- Converting a suggestion into a Validation Planning Assumption — that remains a manual, user-driven action, per [Risk Memo](../../workspace/features/06_risk_memo.md#feature-scope)'s own boundary with Validation Planning.
- External market/competitor data — Search's future capability, per [ADR-0010](../../architecture/decisions/ADR-0010-search-as-independent-platform-capability.md), identical exclusion to Canvas Assistant's.

## Future Expansion

- If Risk Memo's own specification later adds a fourth field or a missing-information concept, this capability's Contract Version would bump accordingly (minor if additive, major if it changes existing field meaning) — not before, and not assumed now.
- Any future structured Feature (per [Future Expansion Strategy](../../context/06_future_expansion_strategy.md#future-ready-architecture-principle)'s 4th principle) that needs an analogous capability follows this same template as its own next capability file — this document does not anticipate their contracts.
