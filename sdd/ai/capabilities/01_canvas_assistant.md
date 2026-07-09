# Capability: Canvas Assistant

**Refs:** → [Capability Index](./000_index.md) · [AI Platform Architecture](../01_architecture.md) · [Ownership Model](../03_ownership_model.md) · [Business Structuring](../../workspace/features/02_business_structuring.md) · [Question Model & Preset Strategy](../../workspace/features/02_1_question_model.md) · [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md)

**Contract Version:** 1.1 — **Stable** (Business Structuring is an implemented Consumer as of Stage 5; per [Contract Versioning](./000_index.md#contract-versioning), the evolution rules now bind — any further breaking change requires a major version, never an in-place edit). Bumped from 1.0 → 1.1 (Minor, additive): adds an optional `Project title` Request field supporting AI-first Draft Generation (see Responsibility and Request Contract below). No existing field changed shape or meaning; this bump does not affect any Consumer already built against 1.0.

*(Instantiates [ADR-0006](../../architecture/decisions/ADR-0006-ai-as-platform-capability.md)'s illustrative V2 examples — Canvas improvement, missing-information detection, follow-up questions, and idea refinement — as one consolidated capability rather than four separate contracts. Rationale: all four operate over the same Canvas context shape and the same Consumer (Business Structuring); splitting them into independent capabilities now would multiply the outward contract surface for V2 without a second consumer or a diverging contract shape to justify it. This mirrors the project's existing promotion-on-second-need discipline (e.g., Design System component promotion in `sdd/rules/ownership.md`) — split into separate capabilities only if one operation's contract genuinely diverges enough to need its own. This is a specification-authoring judgment, not a reopening of ADR-0006's Decision, which committed to named, enumerable capabilities generically, not to the specific four-item list.)*

## Purpose

Help a user improve, complete, and refine their Business Canvas during Business Structuring — the first AI-backed functionality in Hypora's roadmap (V2), per [Product Vision](../../context/01_product_vision.md) and [Future Expansion Strategy](../../context/06_future_expansion_strategy.md).

## Responsibility

**In scope:**
- Suggesting an improved phrasing or more complete answer for a Canvas field already in progress.
- Detecting when a Canvas field is missing information that would materially weaken the hypothesis, and surfacing what's missing.
- Generating a relevant follow-up question to help the user think through an under-developed answer.
- Offering a refinement of the overall business idea based on the Canvas as currently structured.
- **AI-first Draft Generation:** generating an initial draft for the Canvas's first, currently-empty question, seeded from the Project's title and any other Canvas fields already answered (see Request Contract's `Project title` field). This does not change when or how the capability is invoked — it remains a manually-invoked offer like every other operation, per [04_ai_interaction.md](../04_ai_interaction.md)'s Invocation Model; only the *context available* to that same explicit user action differs when the Canvas is otherwise empty.

All four behaviors share one Request/Response Contract (below), distinguished by an operation-type field the Feature supplies — they are not four separate outward contracts.

## Consumers

- [Business Structuring](../../workspace/features/02_business_structuring.md) — the sole consumer for V2. Per [Question Model & Preset Strategy](../../workspace/features/02_1_question_model.md#preset-strategy), this capability is exactly the "AI provider" the Preset Strategy's replaceable-content seam was designed to accept without any Question Model or UI change.

## Request Contract

*(Conceptual shape — field meaning, not an API/DTO definition; the binding technical shape is authored when this capability is implemented, per [ADR-0006](../../architecture/decisions/ADR-0006-ai-as-platform-capability.md).)*

| Field | Meaning |
|---|---|
| Operation | Which of the four in-scope behaviors is requested |
| Canvas context | The current values of the Canvas fields relevant to the operation, supplied by Context Creation ([Ownership Model](../03_ownership_model.md)) |
| Current question / field | Which Canvas field the operation targets, if applicable |
| Prior answers | Previously answered Canvas fields, for operations that reason across the whole hypothesis (e.g., Refinement) |
| Language | The user's current language, per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md) |
| Project title (optional) | The Project's title, usable as seed context when the Canvas is otherwise empty — enables an initial draft suggestion for the first question rather than requiring the user to write something before AI can help |

Context accumulation and user-override-priority rules governing what these fields contain on any given invocation are Platform-wide, not Canvas-Assistant-specific — see [04_ai_interaction.md#conversation-policy](../04_ai_interaction.md#conversation-policy); this capability does not redefine them.

## Response Contract

| Field | Meaning |
|---|---|
| Suggestion text | Already-localized presentation content for the requested operation (a suggested answer, a missing-information note, a follow-up question, or a refinement note) |
| Confidence / rationale | Optional supporting note a user might see alongside the suggestion — not a guarantee field, capability-specific detail deferred to implementation |

The Feature always presents a suggestion as an offer, never an automatic edit — accepting it is a distinct user action (see [Business Structuring](../../workspace/features/02_business_structuring.md) for how a preset-equivalent suggestion is surfaced in the guided flow).

## Failure Model

| Case | Handling |
|---|---|
| Provider/Service failure (per the AI Platform's unified error taxonomy, [Provider Independence & Configuration](../02_provider_independence_and_configuration.md)) | Business Structuring proceeds exactly as it does today with no AI available — this capability is additive, never a blocking dependency of the guided flow |
| Empty or low-value suggestion (including one seeded only from a generic or placeholder Project title) | Treated as "nothing to suggest," not an error — the Feature shows no suggestion for that field rather than a degraded one |

## Localization

Per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md): suggestions are returned already-localized in the user's current language, exactly as a human-curated preset already is ([Workspace Architecture](../../workspace/01_architecture.md#localization)). If a user accepts a suggestion into a Canvas field, that field becomes ordinary user-authored content from that point on — never re-localized on a later language switch, identically to any other preset-derived answer.

## Acceptance Criteria

- A Canvas field with a suggestion available shows it as an offer, distinguishable from the user's own entered text, never auto-inserted.
- Missing-information detection never blocks progression through Business Structuring — it is informational, per [Business Structuring](../../workspace/features/02_business_structuring.md)'s existing guided-flow rules.
- A follow-up question offered by this capability is presented the same way a curated preset question would be, per [Question Model & Preset Strategy](../../workspace/features/02_1_question_model.md).
- If the capability is unavailable or fails, Business Structuring's guided flow and Review step behave exactly as V1 specified, with no user-visible degradation beyond the absence of suggestions.
- When the Canvas is entirely empty, an explicit Ask AI invocation on the first question may still produce a draft suggestion, seeded from the Project's title — this draft is presented as an offer exactly like any other suggestion (per Response Contract) and is never auto-inserted or auto-accepted.

## Out of Scope

- Any external market/competitor data — that is Search's future capability, per [ADR-0010](../../architecture/decisions/ADR-0010-search-as-independent-platform-capability.md); Canvas Assistant reasons only over the Canvas the user has already entered.
- Multi-step or session-based generation (e.g., iteratively co-authoring an entire Canvas across several AI turns) — out of scope per [ADR-0011](../../architecture/decisions/ADR-0011-defer-multi-step-workflow-orchestration.md); each request is a single, independent capability call.
- Modifying the Business Idea Lifecycle, MVP Scope, Feature Planning, or Validation Checklist — this capability's scope is the Canvas only.

## Future Expansion

*(Consistent with [Future Expansion Strategy](../../context/06_future_expansion_strategy.md) — no new capability designed here, only the seam this specification must not block.)*
- V4 (Go-to-Market Planning) may reuse this capability's Canvas-reasoning behavior as a context input to a new GTM capability, without requiring this capability's own contract to change.
- If a single one of the four in-scope operations (e.g., Refinement) later meets any of the [Capability Promotion Rules](./000_index.md#capability-promotion-rules)' mandatory triggers, it is split into its own capability at that point, starting at its own Contract Version 1.0 — not before, and not merely because it *could* be split.
