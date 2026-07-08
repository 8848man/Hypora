# ADR-0010: Search Is an Independent Platform Capability, Not an LLM Provider

**Status:** Accepted
**Date:** 2026-07-08
**Affects specs:** [Application Responsibilities](../../context/05_application_responsibilities.md), [Future Expansion Strategy](../../context/06_future_expansion_strategy.md), AI Platform Architecture (forthcoming, `sdd/platform-api/`)
**Related ADRs:** [ADR-0006](./ADR-0006-ai-as-platform-capability.md) (establishes the capability model this ADR scopes a boundary against)

## Context

[Application Responsibilities](../../context/05_application_responsibilities.md) already lists Search as a distinct Platform API capability from AI, backing V3's Market Intelligence discovery features. Without an explicit boundary decision, the architectural pressure of "we already have a provider-independent request/response pipeline for AI" creates a real risk that Search (retrieval and ranking over external market/competitor data) gets folded into the LLM Provider Interface established in [ADR-0006](./ADR-0006-ai-as-platform-capability.md) and [ADR-0007](./ADR-0007-llm-provider-independence-and-encapsulation-boundary.md) simply because the plumbing (a provider-swappable external API pipeline) looks similar. Retrieval/ranking and text generation are different concerns with different failure modes, different data-freshness requirements, and different vendor landscapes; treating a search/data provider as if it were an "LLM Provider" would be a wrong-abstraction reuse of a pipeline built for a different purpose. This boundary is cheap to decide now, before V3 exists, and expensive to unwind if V3 is first implemented by forcing search results through the LLM Provider Interface.

## Decision

1. **Search is its own Platform API capability, independent of the AI Platform** established in ADR-0006, matching the existing distinction already recorded in [Application Responsibilities](../../context/05_application_responsibilities.md) between the AI and Search capability rows.
2. **Search is never implemented as an "LLM Provider."** No search/data-retrieval integration may be added to the LLM Provider Interface's Provider set, regardless of surface-level similarity in "call an external API and get results back."
3. **A Market Intelligence Feature (V3) may consume both the AI Capability and a future Search Capability together** (e.g., search for competitor data, then use an AI Capability to synthesize it) — this is legitimate composition between two independent Platform capabilities, not evidence that they should be the same capability.
4. This ADR decides the boundary only. The internal architecture of the Search capability itself (data sources, ranking, caching) is explicitly out of scope here and deferred to V3 planning, per the project's "current MVP first" principle.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Model Search as an additional "Provider" behind the LLM Provider Interface | Rejected — retrieval/ranking is a fundamentally different concern from text generation; forcing it through an interface designed for LLM request/response would either distort the LLM Provider contract to accommodate search semantics or silently misuse it, and would couple Search's evolution to the AI Platform's |
| Defer the boundary decision entirely until V3 is planned | Rejected — the pressure to reuse the AI Platform's pipeline for Search is strongest precisely at the moment V3 is first implemented under time constraint; deciding the boundary now, while V3 doesn't exist yet, costs nothing and prevents that misuse |
| Merge AI and Search into a single "External Capability" abstraction spanning both | Rejected — `context/05_application_responsibilities.md` already treats them as distinct capability rows with distinct future roles; merging them here would contradict an existing canonical fact rather than build on it |

## Consequences

**Positive:**
- Prevents a foreseeable architectural misuse (Search-as-LLM-Provider) before it can happen, at zero implementation cost today.
- Keeps the LLM Provider Interface's guarantees (from ADR-0007) meaningful and undiluted by a fundamentally different capability's requirements.
- V3 Market Intelligence can compose AI and Search capabilities together without either capability needing to know about the other's internals.

**Negative / accepted trade-offs:**
- Introduces a second Platform capability family (Search) that will need its own architecture document at V3, rather than reusing AI's — accepted, since this is exactly the separation the ADR is protecting.
- This ADR does not design Search's actual architecture, so V3 planning still starts from a boundary decision only, not a ready-to-build design — an intentional, minimal scope for this ADR.

## Future Impact

When V3 (Market Intelligence) is planned, Search's own architecture is designed fresh, informed by this boundary but not constrained to mirror the AI Platform's internal structure unless that structure genuinely fits Search's concerns.
