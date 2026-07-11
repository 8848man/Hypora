# Capability: Validation Planning Assistant

**Refs:** → [Capability Index](./000_index.md) · [AI Platform Architecture](../01_architecture.md) · [Ownership Model](../03_ownership_model.md) · [Provider Independence & Configuration](../02_provider_independence_and_configuration.md) · [Validation Planning](../../workspace/features/04_validation_planning.md) · [Canvas Assistant](./01_canvas_assistant.md) · [Risk Memo Assistant](./02_risk_memo_assistant.md) · [MVP Planning Assistant](./03_mvp_planning_assistant.md) · [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md)

**Contract Version:** 1.0 — **Stable** (implemented against, this task).

*(Fourth capability instantiating the generalized AI-assisted structured-feature architecture. Deliberately a separate capability from Canvas Assistant, Risk Memo Assistant, and MVP Planning Assistant — per [Capability Promotion Rules](./000_index.md#capability-promotion-rules), its Request Contract (Canvas + Risk Memo + MVP Scope context, one new-assumption target) shares no field set with any existing capability without an ambiguous, conditionally-meaningful field.)*

## Purpose

Help a user draft a new Assumption statement for the Validation Checklist, grounded in their completed Business Canvas, Risk Memo, and MVP Scope, the same way the other structured-feature capabilities help with their own fields.

## Responsibility

**In scope:**
- Suggesting content for the new-assumption draft field — the single-line input a user fills before a Validation Checklist item is created (per [Validation Planning](../../workspace/features/04_validation_planning.md)'s Structured Data Model) — targeted by the Feature's own explicit invocation.
- Grounding that suggestion in the Business Canvas, the current Risk Memo, and the current MVP Scope, per the [Capability Matrix](../03_ownership_model.md#capability-matrix) — never in another Feature's data beyond those three, and never in Validation Planning's own already-created items (this contract drafts a *new* assumption; it does not read or rewrite existing ones).

**Not in scope for Contract Version 1.0:** AI assistance for an existing item's Validation Method or Success Criterion fields, or for resolving an item's status — each existing item is one of a dynamic collection and needs its own target-addressing design (item id + field enum) if ever pursued; not assumed by this contract.

## Consumers

- [Validation Planning](../../workspace/features/04_validation_planning.md) — the sole consumer.

## Request Contract

| Field | Meaning |
|---|---|
| Operation | Currently always `"suggestion"` |
| Canvas context | Normalized Workspace Context for the current Project's Canvas |
| Risk context | Normalized Workspace Context for the current Project's Risk Memo (all non-empty fields) — read-only |
| MVP context | Normalized Workspace Context for the current Project's MVP Scope statement — read-only |
| Language | The user's current language, per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md) |

## Response Contract

| Field | Meaning |
|---|---|
| Suggestion text | Already-localized presentation content — a suggested Assumption statement |
| Confidence / rationale | Optional supporting note, identical in role to every other capability's own |

The Feature always presents a suggestion as an offer, never an automatic edit.

## Failure Model

| Case | Handling |
|---|---|
| Provider/Service failure | Validation Planning proceeds exactly as it does today with no AI available |
| Empty or low-value suggestion | Treated as "nothing to suggest," not an error |

## Localization

Per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md): suggestions return already-localized in the user's current language; once accepted, ordinary user-authored content.

## Acceptance Criteria

- A new-assumption suggestion is shown as an offer, never auto-inserted.
- If this capability is unavailable or fails, Validation Planning behaves exactly as it does with no AI available.
- A suggestion is never generated for, or applied to, an already-created Validation Checklist item's fields.

## Out of Scope

- Any data outside Business Structuring, Risk Memo, and MVP Planning, per capability-independence.
- AI assistance for an existing item's method, criterion, or status — see Responsibility above.
- External market/competitor data — Search's future capability, per [ADR-0010](../../architecture/decisions/ADR-0010-search-as-independent-platform-capability.md).
- V4 (Go-to-Market Planning)'s AI-suggested experiment ideas — a distinct, cross-Feature source per [Validation Planning](../../workspace/features/04_validation_planning.md#future-expansion-v2-v5)'s own Future Expansion note; this capability is the other, coexisting source, not a replacement for it.

## Future Expansion

- AI assistance for an existing item's Method/Success Criterion fields is a plausible future extension, requiring its own target-addressing design (item id + field enum, analogous to Risk Memo's) — a new, explicit decision, not assumed by this contract.
