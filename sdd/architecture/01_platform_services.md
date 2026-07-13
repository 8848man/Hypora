# Platform Services

**Refs:** → [00_index](../00_index.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [Future Expansion Strategy](../context/06_future_expansion_strategy.md) · [Ownership Map](../rules/ownership.md) · [ADR-0014](./decisions/ADR-0014-platform-services-architectural-role.md) · [AI Platform Architecture](../ai/01_architecture.md) · [Analytics Platform Architecture](../analytics/01_architecture.md)

Names and describes an architectural role two existing subsystems already independently instantiate, per [ADR-0014](./decisions/ADR-0014-platform-services-architectural-role.md). This document does not own or supersede any subsystem's own specification — AI (`sdd/ai/**`) and Analytics (`sdd/analytics/**`) each retain full, unchanged ownership of their own architecture, per [Ownership Map](../rules/ownership.md). It states the shared role so a future capability can be checked against it, rather than each reinventing or subtly diverging from the same guarantees.

**Naming note:** "AI Platform" ([AI Platform Architecture](../ai/01_architecture.md)) predates the term "Platform Service" and is that subsystem's own proper name, not a claim of seniority over this more general category — AI is one Platform Service among (currently) two, not the definition of the category itself.

## Purpose

A Platform Service is a cross-cutting, infrastructure-oriented capability consumed by more than one Workspace Feature, whose backing vendor must be replaceable without touching Feature code. It exists to isolate a genuine external-system dependency (an LLM vendor, an analytics backend, a future search index) behind a stable contract, so Feature code never needs to know which vendor is currently active. **Platform Services do not consume each other** — see Dependency Rules below.

**How this differs from other layers:**

| Layer | Owns | Never owns |
|---|---|---|
| Feature (Workspace) | Product workflow, business rules, user-facing state | Vendor selection, wire-level infrastructure |
| Domain Model ([`sdd/domain/`](../domain/01_business_idea_lifecycle.md)) | Entity state/transitions (e.g., Business Idea Lifecycle) | Any external vendor dependency |
| Platform Service | A stable contract, provider selection, cross-cutting infrastructure isolation | Product workflows, business rules, Feature state, user-facing business logic |
| Infrastructure (a Provider implementation) | Vendor-specific wire mechanics behind one Platform Service's contract | Anything a Feature or another Provider needs to know about |

## Responsibilities

**A Platform Service may own:** provider abstraction (a stable interface every Provider implementation satisfies); provider selection (configuration-driven routing to the active Provider); cross-cutting infrastructure concerns specific to its own domain (credential resolution, request/event normalization, error taxonomy translation); a stable, durable domain contract Feature code is built against; runtime integration mechanics behind that contract.

**A Platform Service must never own:** product workflows or the sequencing of a user's journey through a Feature; business rules (what counts as a valid Canvas, when a Project transitions lifecycle stage, a Feature's own Acceptance Criteria); Feature-specific state (a Platform Service never reads or writes `project.canvas`, `project.features`, or any other Workspace-owned data directly — it receives exactly what a Feature's own Context Selection or Event emission chooses to pass it); user-facing business logic — a Platform Service's own Response/Event never dictates what a Feature does with it, only reports the outcome back.

## Provider Independence Is a Platform Service Property

The Zero-Provider-Conditional Rule — no code outside a given Provider implementation may branch on provider identity — is not AI-specific. It is a defining property of Platform Services generally, evidenced independently by [Provider Independence & Configuration (AI)](../ai/02_provider_independence_and_configuration.md#the-zero-provider-conditional-rule) (per [ADR-0007](./decisions/ADR-0007-llm-provider-independence-and-encapsulation-boundary.md)) and [Analytics Provider Independence](../analytics/03_provider_independence.md#the-zero-provider-conditional-rule) (per [ADR-0013](./decisions/ADR-0013-analytics-provider-independence.md)), which deliberately mirrors it. Neither ADR is modified by this document — both remain the concrete, standing rule for their own domain; this document only names the property they already state independently.

## Candidate Members

| Capability | Status | Evidence |
|---|---|---|
| AI | **Confirmed Platform Service** | [AI Platform Architecture](../ai/01_architecture.md), [ADR-0006](./decisions/ADR-0006-ai-as-platform-capability.md), [ADR-0007](./decisions/ADR-0007-llm-provider-independence-and-encapsulation-boundary.md), [ADR-0008](./decisions/ADR-0008-ai-platform-ownership-model.md) |
| Analytics | **Confirmed Platform Service** | [Analytics Platform Architecture](../analytics/01_architecture.md), [ADR-0013](./decisions/ADR-0013-analytics-provider-independence.md) |
| Search | **Anticipated, not yet built** | [ADR-0010](./decisions/ADR-0010-search-as-independent-platform-capability.md) decides Search's boundary against AI but "does not design Search's actual architecture" (that ADR's own Future Impact) — expected to become a Confirmed Platform Service once V3 planning produces a real architecture satisfying the Admission Criteria below; not assumed before then |

**Discussed, not admitted — no current architectural evidence for any of the following:** Notification, Identity, Billing, Background Jobs, Integrations, Market Intelligence Services. [Application Responsibilities](../context/05_application_responsibilities.md#platform-api) names "Integrations" as a future Platform API capability, but a name in a table is not evidence — none of these six has a specification, an ADR, or a real Feature consumer yet.

**Storage/Persistence — partial evidence, still not admitted.** Unlike the six above, [Future Expansion Strategy](../context/06_future_expansion_strategy.md#platform-apis-future-backend-transition) already states a concrete provider-independence expectation: "Workspace's Projects contract stays the same shape, only its implementation moves from LocalStorage to a real service." This satisfies Admission Criteria 1, 2, 3, and 5 in substance — but not criterion 4: no ADR yet establishes Persistence as a provider-independent capability with its own Zero-Provider-Conditional Rule. Closer to qualifying than any other discussed candidate, but still not admitted until that ADR exists.

Every candidate above is evaluated against the Admission Criteria below only when a real need is identified, never pre-emptively.

## Admission Criteria

A capability becomes a Platform Service only when **all** of the following are true, evidenced in writing — never asserted or pre-admitted:

1. It exposes a stable, real contract — proven, not asserted, by at least one real or concretely anticipated Feature actually consuming it. This criterion only establishes the contract is real, not a placeholder; criterion 5 below is the actual admission bar.
2. It genuinely requires provider independence — a real, named alternative implementation is plausible, not merely "someday, in principle, anything is swappable."
3. It owns no Feature-specific business logic — see Responsibilities above.
4. Its own architecture, and its recognition as a Platform Service, is decided via its own ADR before being treated as one — mirroring [ADR-0006](./decisions/ADR-0006-ai-as-platform-capability.md), [ADR-0010](./decisions/ADR-0010-search-as-independent-platform-capability.md), and [ADR-0013](./decisions/ADR-0013-analytics-provider-independence.md)'s own precedent.
5. It is consumed by, or clearly positioned to be consumed by, **more than one** Feature — the binding admission threshold, distinct from criterion 1's "at least one," per the same "promote on real or concretely anticipated second need" discipline already used for [Workspace Context Builder](../workspace/01_architecture.md#workspace-context-builder).

A capability failing any criterion stays exactly where it already is — a Feature-local concern, or an unbuilt future line item — never folded into Platform Services speculatively.

## Dependency Rules

```
Workspace Feature
     │  (consumes a Platform Service's stable contract)
     ▼
Platform Service           — e.g. AI Application Service, Analytics Service
     │
     ▼
Provider Interface         — unified contract each Provider implements
     │
     ▼
Infrastructure Provider    — a vendor-specific implementation
     │
     ▼
External Service
```

Already independently satisfied by both AI ([AI Platform Architecture](../ai/01_architecture.md#capability-model)) and Analytics ([Analytics Platform Architecture](../analytics/01_architecture.md#tracking-model)) — this document confirms and names the shared shape; it changes neither. **A Platform Service must never depend on a Feature** — neither the AI Application Service nor the Analytics Service reads Workspace state directly; each receives only what a Feature's own Context Selection or Event emission explicitly passes in, per each domain's own Ownership Model.

**A Platform Service must never depend on another Platform Service.** No exception is currently justified. Composition between two Platform Services happens only at the Feature layer — a Feature may consume both and sequence them itself (e.g., a future Market Intelligence Feature searching then synthesizing with AI, per [ADR-0010](./decisions/ADR-0010-search-as-independent-platform-capability.md)'s own precedent), but neither Platform Service ever calls the other directly. Concretely: a Feature invoking an AI Capability, and separately wanting to record an `ai_request_sent`-style analytics event about that invocation (per [Event Catalog](../analytics/04_event_catalog.md)), emits that event itself, observing the AI Capability's lifecycle from the Feature layer — the AI Application Service never calls the Analytics Service, and the Analytics Service never calls back into AI. This keeps a provider swap in one Platform Service from ever rippling into another.

## What This Document Does Not Cover

- Any specific Platform Service's own Purpose, Responsibilities, contract, or Provider set — owned entirely by that service's own architecture document.
- Search's actual architecture — deferred to V3 planning, per [ADR-0010](./decisions/ADR-0010-search-as-independent-platform-capability.md).
- Any decision to admit a new Platform Service — each is its own future ADR, per Admission Criteria above.
