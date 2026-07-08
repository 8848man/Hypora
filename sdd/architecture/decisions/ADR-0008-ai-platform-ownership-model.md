# ADR-0008: AI Platform Ownership Model — Prompt, Context, and Response Responsibilities

**Status:** Accepted
**Date:** 2026-07-08
**Affects specs:** AI Platform Architecture (forthcoming, `sdd/platform-api/`), [Workspace Architecture](../../workspace/01_architecture.md)
**Related ADRs:** [ADR-0006](./ADR-0006-ai-as-platform-capability.md) (the capability boundary this ownership model operates within); [ADR-0007](./ADR-0007-llm-provider-independence-and-encapsulation-boundary.md) (Provider owns structured output and error translation — this ADR covers the Feature/AI Application Service side of the same lifecycle, and does not duplicate that assignment)

## Context

An AI request's lifecycle touches several distinct concerns — what to ask, what context to include, how to format it, and how to interpret what comes back — and each concern must have exactly one owner or teams will independently make conflicting assumptions about who is responsible for what. Left unassigned, this surfaces as contradictions such as prompt content simultaneously being described as "Feature-owned intent" and "AI Application Service-owned assembly," or context truncation decisions being made inconsistently across capabilities. This spans two owned areas — Workspace (where Feature business logic lives) and the AI Platform (the new Platform API capability established in ADR-0006) — and is expensive to reverse once multiple capabilities are built assuming a given split.

## Decision

Every responsibility below has exactly one owner. No responsibility is shared.

**Prompt ownership:**
1. **Prompt intent** (what to ask, tone, business goal) — owned by the **Feature**. This is business judgment.
2. **Prompt template** (the structure sent to the provider) and **prompt rendering** (variable interpolation, provider-appropriate formatting) — owned by the **AI Application Service**, so templates remain portable across providers and a provider swap never requires a Feature change.
3. **Prompt versioning** (tracking which template version is active, promoting a new version) — owned by the **AI Application Service** as a technical asset; a new version is *triggered* by a Feature's changed intent, but the Feature does not itself own the version identifier or lifecycle.

**Context ownership:**
4. **Context creation** (gathering Workspace/Canvas data, current question, previous answers, user preferences) and **context selection** (business priority — what matters most if not everything fits) — owned by the **Feature**, since Workspace already owns this data per [Workspace Data & State](../../workspace/02_data_and_state.md).
5. **Context transformation** (mechanical truncation/serialization to fit a provider's token budget or format) and **context delivery** (assembling the final request payload) — owned by the **AI Application Service**. Business priority (what to keep) is the Feature's decision; how much fits and how it's packed is a runtime mechanics decision, and keeping this split prevents provider-specific knowledge (token budgets) from leaking into Feature code.

**Response ownership** (the portion not already assigned to Provider by [ADR-0007](./ADR-0007-llm-provider-independence-and-encapsulation-boundary.md)):
6. **Response normalization** (turning a Provider's already-error-translated, already-structured output into the AI Platform's unified Capability Response shape), **parsing** (into a generic Capability Response DTO), and **validation** (conformance/non-empty checks) — owned by the **AI Application Service**.
7. Structured-output generation and vendor error translation remain owned by **Provider**, per ADR-0007; this ADR does not re-assign them.
8. **Consuming the Capability Response** into a Feature-specific view model — owned by the **Feature**.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Let prompt content live entirely with the Feature (Feature authors and controls the literal template text) | Rejected — ties template portability to Feature code, meaning a provider swap could require editing every Feature's prompt text if formatting conventions differ; also blurs "what to ask" (legitimately a Feature concern) with "how it's structured for a given provider" (not) |
| Let the AI Application Service decide context priority (what to include if something must be dropped) | Rejected — this is a business judgment about which Canvas fields or prior answers matter most, which the Service has no basis to make; keeping it with the Feature avoids the Service silently encoding product decisions |
| A single "AI orchestration" owner for the entire prompt/context/response lifecycle, undifferentiated | Rejected — this is the exact ambiguity the architecture review identified as unresolved; collapsing the split back into one undifferentiated owner reintroduces the contradiction (is prompt content Feature-owned or AI-Service-owned?) this ADR exists to close |

## Consequences

**Positive:**
- Every future capability (V2–V5) can be reviewed against the same fixed ownership table rather than re-litigating "who owns this" per capability.
- Business logic (intent, context priority) stays entirely within Workspace/Feature ownership, consistent with Workspace's existing architectural boundary; the AI Application Service never needs product knowledge to do its job.
- Prompt template portability is protected structurally, not by convention — a provider swap cannot silently require Feature-side prompt edits.

**Negative / accepted trade-offs:**
- Introduces more granular responsibility boundaries than a single "AI orchestration" concept would, which is more to document and onboard new contributors to — accepted as the cost of eliminating the ambiguity found in review.
- Prompt versioning being AI-Application-Service-owned (rather than Feature-owned) means Feature authors must go through the Service's versioning mechanism to ship a prompt change rather than editing it directly — an intentional friction point to preserve single ownership.

## Future Impact

Every new AI Capability added at V3, V4, or V5 is expected to slot into this same ownership table without renegotiation. If a future capability's needs genuinely don't fit this split (for example, a capability requiring Feature-level control over template structure), that is a signal to revisit this ADR explicitly rather than silently carve out an exception.
