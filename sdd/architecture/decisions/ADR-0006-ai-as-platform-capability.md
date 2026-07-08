# ADR-0006: Introduce AI as a Platform API Capability with Stable Capability Contracts

**Status:** Accepted
**Date:** 2026-07-08
**Affects specs:** [Application Responsibilities](../../context/05_application_responsibilities.md), [Future Expansion Strategy](../../context/06_future_expansion_strategy.md), [Ownership Map](../../rules/ownership.md), AI Platform Architecture (forthcoming, `sdd/platform-api/`)
**Related ADRs:** [ADR-0001](./ADR-0001-one-product-multiple-applications.md) (Platform API as an Application); [ADR-0007](./ADR-0007-llm-provider-independence-and-encapsulation-boundary.md), [ADR-0008](./ADR-0008-ai-platform-ownership-model.md), [ADR-0010](./ADR-0010-search-as-independent-platform-capability.md), [ADR-0011](./ADR-0011-defer-multi-step-workflow-orchestration.md) (all extend the capability model this ADR establishes)

## Context

V1 shipped with no AI. `context/05_application_responsibilities.md` already lists AI as a Platform API capability that is "Not implemented" in V1 but is expected to "back V2 (AI Canvas Assistant) through V5 (AI Product Builder)," and `context/06_future_expansion_strategy.md` states that the vendor/integration pattern for AI is deferred "to whichever stage first requires it, and would meet the ADR trigger list at that time." V2 is that stage.

The decision of *how* Features reach AI — as a first-class Platform capability with its own stable outward contract, versus an embedded per-Feature integration, or a set of ad hoc Feature-to-provider calls — is a Product Architecture decision: it defines a new capability surface on Platform API, is referenced by every future roadmap stage (V2–V5), spans the Workspace/Feature area and the future Platform API area, and is expensive to reverse once Features have been built against whatever shape is chosen.

## Decision

1. **AI is exposed as a Platform API capability, not as per-Feature logic.** A Workspace Feature that wants AI assistance consumes a named, enumerable **AI Capability** (e.g., `CanvasSuggestion`, `MissingInfoDetection`, `FollowUpQuestion`, `Refinement` for V2) — it never embeds provider calls, prompt assembly, or model selection itself. This mirrors how Workspace already consumes Platform API's Projects capability rather than reimplementing persistence (per [Application Responsibilities](../../context/05_application_responsibilities.md#cross-application-boundaries)).
2. **Each AI Capability is a stable, versioned outward contract** — a Capability Request, a Capability Response, and a Capability Error taxonomy — independent of which LLM provider services it. This contract is the seam Workspace codes against; it must exist and be documented before any Feature is built against a given capability, not retrofitted afterward.
3. **New roadmap stages add new named capabilities, not a new architecture.** V3 (Market Intelligence), V4 (GTM Planning), and V5 (AI Product Builder) are each expected to register one or more new AI Capabilities under this same model rather than requiring a different integration pattern per stage.
4. A shared runtime (the AI Application Service, detailed in [ADR-0008](./ADR-0008-ai-platform-ownership-model.md)) sits behind every capability; the capability layer itself owns only the contract and naming, not execution mechanics.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Embed AI calls directly inside each Workspace Feature (e.g., Canvas Assistant calls Gemini directly from Workspace code) | Rejected — violates the existing Cross-Application Boundary rule that Workspace consumes Platform API rather than reimplementing platform concerns; would also mean V3–V5 each reinvent their own integration pattern instead of reusing one |
| Treat "AI" as a single undifferentiated Platform API endpoint (one generic `askAI(prompt)` call for every Feature) | Rejected — collapses distinct capabilities (Canvas Suggestion vs. Market Intelligence vs. GTM Planning) into one contract, which forces every Feature to hand-roll its own request/response shape on top of a lowest-common-denominator endpoint; provides no seam for capability-specific evolution |
| Defer any AI architecture decision until each roadmap stage is implemented independently | Rejected — `06_future_expansion_strategy.md` already anticipated this decision firing at "whichever stage first requires it," and V2 is that stage; deferring further would let V2 ship with no contract, which is exactly the expensive-to-reverse state this ADR exists to avoid |

## Consequences

**Positive:**
- Workspace Features remain ignorant of AI implementation details, consistent with the existing Platform API boundary rule.
- V3–V5 have a proven pattern to extend (register a new capability) rather than a precedent to invent.
- The capability contract, once stable, allows the entire provider/runtime stack behind it to change without touching Feature code (see [ADR-0007](./ADR-0007-llm-provider-independence-and-encapsulation-boundary.md)).

**Negative / accepted trade-offs:**
- Introduces a new architectural layer (AI Capability) and a new spec area (AI Platform Architecture) that must be authored and maintained — accepted as the necessary cost of giving four future roadmap stages one seam instead of four.
- Requires the capability contract to be designed before any V2 Feature code is written, adding upfront design cost to V2 rather than letting it emerge implementation-first.

## Future Impact

Every future roadmap stage (V3, V4, V5) that adds AI-backed functionality is expected to register a new AI Capability under this model rather than introduce a new integration pattern. Changing this decision later (e.g., collapsing capabilities back into a single generic endpoint) would require touching every Feature built against a capability contract in the interim — treat this as the load-bearing decision for the entire AI Platform.
