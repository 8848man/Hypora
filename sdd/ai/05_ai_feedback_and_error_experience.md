# AI Feedback and Error Experience

**Refs:** → [00_index](../00_index.md) · [AI Interaction Specification](./04_ai_interaction.md) · [Provider Independence & Configuration](./02_provider_independence_and_configuration.md) · [Ownership Model](./03_ownership_model.md) · [Canvas Assistant](./capabilities/01_canvas_assistant.md) · [ADR-0007](../architecture/decisions/ADR-0007-llm-provider-independence-and-encapsulation-boundary.md) · [ADR-0009](../architecture/decisions/ADR-0009-ai-platform-localization-integration.md) · [ADR-0011](../architecture/decisions/ADR-0011-defer-multi-step-workflow-orchestration.md) · [Design System](../design-system/01_design_system.md)

Canonical owner of the **UX contract** for AI failure, retry, and cost-governance experience — not Canvas-Assistant-specific, reusable by every future AI Capability. This document defines only what the user experiences; it never redefines HTTP status codes, Provider implementation, or error-translation logic, all of which are already owned by [Provider Independence & Configuration](./02_provider_independence_and_configuration.md) (the unified `ProviderErrorKind` taxonomy) and each Provider's own implementation (ADR-0007).

This document assumes [AI Interaction Specification](./04_ai_interaction.md)'s Governing Rules and lifecycle — in particular, everything here describes what happens at and around the `Failed` state that document's [Interaction Lifecycle](./04_ai_interaction.md#interaction-lifecycle) already defines a place for.

## Failure Taxonomy (UX-Facing)

Each row maps an already-classified failure (per `02_provider_independence_and_configuration.md`'s unified taxonomy, or a request-validation failure at the boundary above the Provider) onto what the user is meant to experience — not onto any status code or implementation detail.

| Failure | User-facing framing |
|---|---|
| Timeout | "This is taking longer than expected" — retryable |
| Rate limit | "AI assistance needs a moment" — retryable, framed as a pause, never as user error |
| Provider unavailable | "AI assistance isn't available right now" — retryable |
| Safety refusal | No suggestion is available for this request — not framed as retryable in place; see Retry Policy |
| Validation failure (the request itself was malformed before reaching a Provider) | Generic "couldn't get a suggestion right now" — not user-actionable, since the Feature assembles requests programmatically; presented identically to Unknown failure |
| Malformed response (a Provider's response failed parsing/validation) | Generic "couldn't get a suggestion right now" — identical framing to Validation failure |
| Unknown failure | Generic "couldn't get a suggestion right now" |

No row above exposes an internal error code, provider name, or raw message to the user — that boundary is already enforced by the error-translation layer this document does not redefine; this table only states the *user-facing consequence* of that enforcement.

## Retry Policy

| Failure kind | Retryable? | Behavior |
|---|---|---|
| Timeout, Rate limit, Provider unavailable | Retryable | A manual Retry affordance is offered |
| Safety refusal | Not usefully retryable as-is | Retry is not specially hidden, but no message implies retrying the identical request will help — the user is expected to change their input (ordinary manual editing) before trying again |
| Validation failure, Malformed response, Unknown failure | Retryable | A manual Retry affordance is offered; not auto-retried (see below) |

**Manual retry:** every retryable failure is retried only via an explicit user action (the `Failed → Requesting` transition in [04's lifecycle](./04_ai_interaction.md#interaction-lifecycle)).

**Auto retry:** **V2 performs no silent, automatic retries.** This is a deliberate UX policy decision (not forced by any existing ADR, but consistent with Manual-first and with keeping request volume — and therefore cost — bounded to explicit user action): the system never re-calls a Capability on the user's behalf without them choosing to. If a future stage introduces automatic retry (e.g., a single silent retry on transient network failure before surfacing `Failed`), that is a new UX decision to make explicitly, not something this document already permits.

## Timeout Behavior

On timeout, the lifecycle enters `Failed` with the Timeout framing above. The threshold itself (how long is "too long") is an implementation/infra concern, not defined here. Per [04](./04_ai_interaction.md#manual-first-behavior-and-field-editability), the targeted field remains editable throughout — a timeout never locks the field it was trying to help with.

## Rate Limit Behavior

Framed distinctly from a generic failure: the message communicates a pause, not an error, and never implies the user did anything wrong. No forced client-side cooldown timer is required for V2 — the user may attempt Retry immediately; if the underlying condition hasn't cleared, the same rate-limit framing simply recurs.

## Provider Unavailable

Framed identically to any other "AI isn't available right now" case. Per the [Canvas Assistant](./capabilities/01_canvas_assistant.md#failure-model) Failure Model, this is explicitly additive — the guided flow it would have assisted continues exactly as if AI did not exist.

## Validation Failure / Malformed Response / Unknown Failure

Presented uniformly and generically, per the Failure Taxonomy above — never with internal detail, since none of these are meaningfully actionable by the user (they indicate either a Feature-side defect or an upstream provider issue, not something the user caused or can diagnose).

## User Messaging Principles

- Never imply the user made a mistake.
- Never expose provider names, internal error codes, or raw error text.
- Always state, implicitly or explicitly, that the user can continue without AI — no failure message may read as a dead end.
- Reuses the Design System's existing Inline Alert / Error Banner primitive and Workspace's existing system-message tone (`design-system/01_design_system.md`) — this document does not define a new presentation, only the content principles above.

## Cost Visibility

V2 exposes no cost, usage, or quota information to the user (no request counter, no visible cost indicator, no "N suggestions remaining"). This is a deliberate, minimal-scope decision for this stage, not a statement about billing or infrastructure — those remain entirely [Provider Independence & Configuration](./02_provider_independence_and_configuration.md)'s and Infra's concern. Future user-facing cost/quota visibility, if ever needed, is a new decision to make at that time.

## Duplicate Request Handling

While an invocation is `Generating` for a given field/operation, the affordance that triggers it (Ask AI, Accept-triggered Regenerate, etc.) must not be able to fire a second concurrent invocation for that same target until the first resolves into `Suggestion Ready`, `Failed`, or is canceled. This is a UX-level debouncing rule to prevent accidental duplicate calls — it is not a backend rate-limiting implementation, which remains Provider/Infra's concern.

## Throttling Expectations

Beyond the duplicate-request prevention above, no additional client-side throttling (e.g., an enforced cooldown between successive Regenerate requests) is defined for V2. A stricter throttle policy is a future decision, to be made only if real usage patterns show a need — not assumed now, per the smallest-implementation-that-preserves-architecture principle.

## Caching Expectations

V2 caches nothing across invocations. Every invocation, including a Regenerate, is a fresh request — consistent with [04's Conversation Policy](./04_ai_interaction.md#conversation-policy) (stateless, no memory). No caching layer is defined or implied at the UX level; introducing one later is a new decision, not a silent retrofit of this document.

## Graceful Degradation and Manual Fallback Behavior

On any `Failed` outcome, per [Canvas Assistant](./capabilities/01_canvas_assistant.md#acceptance-criteria)'s own Acceptance Criteria, Business Structuring's guided flow and Review step behave exactly as they would with no AI available at all — no screen, transition, save, or lifecycle progression depends on an AI Capability succeeding. This applies to every current and future AI Capability instantiating this lifecycle, not only Canvas Assistant.

## Non-Blocking Requirements

No failure state may block navigation, saving, or progression through the Feature it assists — this restates and confirms, without re-deriving, the Manual-first guarantee [04](./04_ai_interaction.md) already establishes for the happy path, applied specifically to every failure path in the taxonomy above.

## Localization

Failure and retry messaging is ordinary Workspace system-message content — already covered by [Workspace Architecture](../workspace/01_architecture.md#localization)'s "system messages (errors, confirmations)" localized-content category. No new localization mechanism is introduced; this document does not restate [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md) or [ADR-0009](../architecture/decisions/ADR-0009-ai-platform-localization-integration.md), only confirms failure copy participates in the same existing system as every other system message.

## Out of Scope

- HTTP status code definitions — owned by the implementation's error-translation layer, itself downstream of [Provider Independence & Configuration](./02_provider_independence_and_configuration.md)'s taxonomy.
- Provider implementation details or any vendor-specific error shape — Provider's own ownership (ADR-0007).
- Error translation logic itself — already owned by the Provider → unified-taxonomy responsibility `02_provider_independence_and_configuration.md` establishes.
- Search-specific failure modes — Search is an independent Platform Capability (ADR-0010), out of scope here.
- Multi-step workflow failure/rollback and autonomous-execution failure handling — deferred per [ADR-0011](../architecture/decisions/ADR-0011-defer-multi-step-workflow-orchestration.md), same boundary [04](./04_ai_interaction.md#out-of-scope) already states.
