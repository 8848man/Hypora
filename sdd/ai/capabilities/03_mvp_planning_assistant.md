# Capability: MVP Planning Assistant

**Refs:** → [Capability Index](./000_index.md) · [AI Platform Architecture](../01_architecture.md) · [Ownership Model](../03_ownership_model.md) · [Provider Independence & Configuration](../02_provider_independence_and_configuration.md) · [MVP Planning](../../workspace/features/03_mvp_planning.md) · [Canvas Assistant](./01_canvas_assistant.md) · [Risk Memo Assistant](./02_risk_memo_assistant.md) · [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md)

**Contract Version:** 1.0 — **Stable** (implemented against, this task).

*(Third capability instantiating the generalized AI-assisted structured-feature architecture — see [AI Ownership Model](../03_ownership_model.md#context-representation-pipeline) for the pipeline this capability's requests flow through, and [Context Eligibility Rules](../../workspace/01_architecture.md#context-eligibility-rules) for why its Read Context may legitimately span more than Canvas. Deliberately a separate capability from Canvas Assistant and Risk Memo Assistant — per [Capability Promotion Rules](./000_index.md#capability-promotion-rules), its Request Contract (Canvas + Risk Memo context, one MVP Scope target) shares no field set with either existing capability without an ambiguous, conditionally-meaningful field.)*

## Purpose

Help a user draft the MVP Scope statement — the boundary of what counts as their first version — grounded in their completed Business Canvas and Risk Memo, the same way Canvas Assistant and Risk Memo Assistant help with their own respective fields.

## Responsibility

**In scope:**
- Suggesting content for the MVP Scope statement field, the Feature's sole freeform text field (per [MVP Planning](../../workspace/features/03_mvp_planning.md)'s Structured Data Model), targeted by the Feature's own explicit invocation (Manual-first).
- Grounding that suggestion in the Business Canvas and the current Risk Memo, per the [Capability Matrix](../03_ownership_model.md#capability-matrix) — never in Validation Planning or any other Feature's data.

**Not in scope for Contract Version 1.0:** AI assistance for the Feature list (add/priority/in-scope tagging) — that is a dynamic collection, not a single freeform field, and needs its own target-addressing design if ever pursued; not assumed by this contract. Missing-information detection or follow-up questions analogous to Canvas Assistant's other behaviors — MVP Scope is a single field with no "which of several fields is missing" concept to detect.

## Consumers

- [MVP Planning](../../workspace/features/03_mvp_planning.md) — the sole consumer.

## Request Contract

*(Conceptual shape only — mirrors [Risk Memo Assistant](./02_risk_memo_assistant.md#request-contract)'s pattern.)*

| Field | Meaning |
|---|---|
| Operation | Currently always `"suggestion"` — kept explicit for future extensibility without a breaking change |
| Canvas context | Normalized Workspace Context for the current Project's Canvas, via the Workspace Context Builder |
| Risk context | Normalized Workspace Context for the current Project's Risk Memo (all non-empty fields), via the Workspace Context Builder — read-only, per the Capability Matrix; never written to |
| Language | The user's current language, per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md) |

Context accumulation and user-override-priority rules are Platform-wide, per [04_ai_interaction.md#conversation-policy](../04_ai_interaction.md#conversation-policy) — not redefined here.

## Response Contract

| Field | Meaning |
|---|---|
| Suggestion text | Already-localized presentation content — a suggested MVP Scope statement |
| Confidence / rationale | Optional supporting note, identical in role to every other capability's own |

The Feature always presents a suggestion as an offer, never an automatic edit.

## Failure Model

| Case | Handling |
|---|---|
| Provider/Service failure | MVP Planning proceeds exactly as it does today with no AI available — additive, never a blocking dependency |
| Empty or low-value suggestion | Treated as "nothing to suggest," not an error |

## Localization

Per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md): suggestions return already-localized in the user's current language. Once accepted, the text is ordinary user-authored content — never re-localized on a later language switch.

## Acceptance Criteria

- An MVP Scope suggestion is shown as an offer, distinguishable from the user's own entered text, never auto-inserted.
- If this capability is unavailable or fails, MVP Planning behaves exactly as it does with no AI available.
- A suggestion is never generated for, or applied to, anything other than the MVP Scope statement field.

## Out of Scope

- Any data from Validation Planning or any Feature other than Business Structuring, Risk Memo, and MVP Planning itself, per capability-independence.
- Feature list / prioritization AI assistance — see Responsibility above.
- External market/competitor data — Search's future capability, per [ADR-0010](../../architecture/decisions/ADR-0010-search-as-independent-platform-capability.md).

## Future Expansion

- AI assistance for individual planned Features (name drafting, priority suggestion) is a plausible future extension, but requires its own target-addressing design (analogous to Risk Memo's field enum, applied per dynamic list item) — a new, explicit decision, not assumed by this contract.
- Any future structured Feature needing an analogous capability follows this same template as its own next capability file.
