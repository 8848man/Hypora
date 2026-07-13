# ADR-0013: Analytics Provider Independence

**Status:** Accepted
**Date:** 2026-07-13
**Affects specs:** [Application Responsibilities](../../context/05_application_responsibilities.md), Analytics Platform Architecture (new, `sdd/analytics/`)
**Related ADRs:** [ADR-0006](./ADR-0006-ai-as-platform-capability.md) (the capability model this ADR applies to a second Platform capability), [ADR-0007](./ADR-0007-llm-provider-independence-and-encapsulation-boundary.md) (the provider-independence pattern this ADR mirrors for a different concern), [ADR-0010](./ADR-0010-search-as-independent-platform-capability.md) (the precedent for deciding a capability boundary before the pressure to misuse an existing pipeline arises)

## Context

Hypora is entering the transition from V2 toward V3. Ahead of V3, Product Analytics (event tracking) is being introduced into the architecture, initially backed by Firebase Firestore for being lightweight and sufficient for the current MVP stage. Left undefined, this creates the same risk [ADR-0010](./ADR-0010-search-as-independent-platform-capability.md) already identified for Search: an already-proven, provider-independent pipeline exists for AI (per [ADR-0006](./ADR-0006-ai-as-platform-capability.md) and [ADR-0007](./ADR-0007-llm-provider-independence-and-encapsulation-boundary.md)), creating pressure to reuse it — either by embedding Firestore calls directly into Workspace Features, or by modeling Firestore as an "LLM Provider" simply because the plumbing (a provider-swappable external write) looks similar. Event delivery and text generation are different concerns with different failure modes and a different vendor landscape (Firestore, PostgreSQL, ClickHouse, BigQuery, Mixpanel, and Segment are all under consideration as future backends). This boundary is cheap to decide now, before real event volume or a second provider exists, and expensive to unwind if Firestore-specific assumptions are allowed to leak into Feature code first.

## Decision

1. **Analytics is its own independent Platform API capability**, added as a new row to [Application Responsibilities](../../context/05_application_responsibilities.md#platform-api)'s capability table, distinct from AI and Search — the same boundary discipline [ADR-0010](./ADR-0010-search-as-independent-platform-capability.md) already applied to Search.
2. **Analytics events conform to one stable, provider-independent Event Model**, shared across every event category — not N per-event-type contracts. This differs deliberately from the AI Platform's own Capability model (one contract per Capability, because AI Capabilities' Request/Response shapes genuinely diverge per the Capability Promotion Rules): Analytics events share one envelope, varying only in `eventName` and `properties`. See `sdd/analytics/02_event_model.md`.
3. **The Zero-Provider-Conditional Rule, established for LLM Providers by [ADR-0007](./ADR-0007-llm-provider-independence-and-encapsulation-boundary.md), applies identically to Analytics Providers.** No code outside a given Analytics Provider implementation may branch on provider identity. Firebase Firestore, PostgreSQL (Prisma or Drizzle), ClickHouse, BigQuery, Mixpanel, Segment, and a Mock Provider must all be able to implement the same Analytics Provider Interface. See `sdd/analytics/03_provider_independence.md`.
4. **Firebase Firestore is the initial Provider only** — an infrastructure choice, never an architectural commitment. No Firestore-specific concept (a document, a collection path) may appear in the Event Model or in any Feature/Capability code that emits an event.
5. **A five-stage migration strategy** (Single Provider → Dual Provider → Dual Write → Read Switch → Legacy Removal) is the official, documented procedure for any future Analytics Provider change. See `sdd/analytics/05_migration_strategy.md`.
6. **Analytics is explicitly distinct from Feature History** (per `sdd/workspace/features/03_mvp_planning.md#history`) — a Workspace-owned, per-Project, user-visible record. The two may compose (an event emitted alongside a History entry being recorded) but neither owns or implies the other.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Embed Firestore SDK calls directly inside Workspace Features | Rejected — violates the existing Cross-Application Boundary rule that Workspace consumes Platform API rather than reimplementing platform concerns, the same reasoning [ADR-0006](./ADR-0006-ai-as-platform-capability.md) already applied to AI |
| Model Analytics as an additional "Provider" behind the existing LLM Provider Interface | Rejected — event delivery is a fundamentally different concern from text generation; forcing it through an interface designed for LLM request/response would distort or misuse that contract, exactly the failure mode [ADR-0010](./ADR-0010-search-as-independent-platform-capability.md) already rejected for Search |
| Defer any Analytics architecture decision until a specific reporting need arises | Rejected — Firestore adoption is happening now, ahead of V3; deciding the boundary before real event volume or a second provider exists costs nothing and prevents the same reuse pressure ADR-0010 identified for Search |
| Give Analytics a per-event-type contract model, mirroring AI's `capabilities/` directory | Rejected as over-engineering relative to its own justification — AI's per-capability contracts exist because Request/Response shapes genuinely diverge (Capability Promotion Rules); Analytics events share one stable envelope, so one Event Model plus a name catalog is sufficient |

## Consequences

**Positive:**
- Firebase Firestore can be replaced by PostgreSQL, ClickHouse, BigQuery, Mixpanel, Segment, or any future backend without touching Workspace Feature or AI Capability code, provided the Zero-Provider-Conditional Rule holds.
- A documented, staged migration procedure exists before it is ever needed, avoiding an ad hoc migration under time pressure.
- V3–V5 and any future Feature inherit a settled event-tracking pattern rather than each inventing its own instrumentation.

**Negative / accepted trade-offs:**
- Introduces a new spec area (`sdd/analytics/`) that must be authored and maintained — accepted as the cost of giving every future Feature one seam instead of an ad hoc one per Feature.
- The five-stage migration strategy adds process overhead to any future provider swap compared to an uncoordinated cutover — accepted, since an uncoordinated cutover is exactly the risk this ADR exists to avoid.

## Future Impact

Every future Feature or AI Capability that wants to emit analytics adds an `eventName` to the Event Catalog and calls the Analytics Service — no new architecture decision required, mirroring how V3–V5 add AI Capabilities under [ADR-0006](./ADR-0006-ai-as-platform-capability.md)'s existing model without a new ADR each time. Changing the active Analytics Provider follows `sdd/analytics/05_migration_strategy.md`'s five stages; changing this decision itself (e.g., collapsing Analytics back into the AI Platform, or abandoning provider independence) would require re-touching every emitting call site and is treated as a reversal, not an extension, of this ADR.
