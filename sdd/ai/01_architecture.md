# AI Platform Architecture

**Refs:** → [00_index](../00_index.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [Future Expansion Strategy](../context/06_future_expansion_strategy.md) · [Ownership Map](../rules/ownership.md) · [ADR-0006](../architecture/decisions/ADR-0006-ai-as-platform-capability.md) · [ADR-0010](../architecture/decisions/ADR-0010-search-as-independent-platform-capability.md) · [ADR-0011](../architecture/decisions/ADR-0011-defer-multi-step-workflow-orchestration.md) · [Provider Independence & Configuration](./02_provider_independence_and_configuration.md) · [Ownership Model](./03_ownership_model.md) · [Capability Index](./capabilities/000_index.md)

Created ahead of any real AI code, per the SDD Framework's "spec leads implementation" principle — the same allowance already exercised for [Workspace Architecture](../workspace/01_architecture.md). This is the point at which AI has enough decided (ADR-0006 through ADR-0011) to warrant its own cross-cutting specification domain rather than remaining an unwritten implication of `context/05_application_responsibilities.md`'s AI capability row.

This document does not redesign or re-derive any architectural decision — every decision below cites the ADR that made it. It states the current, standing shape of the AI Platform.

## Purpose

*(Explicit, by reference)* — the AI Platform is Platform API's capability surface for AI-backed functionality, first exercised by V2's Canvas Assistant and expected to back every roadmap stage through V5 (see [Application Responsibilities](../context/05_application_responsibilities.md) and [Future Expansion Strategy](../context/06_future_expansion_strategy.md)). A Workspace Feature never calls an LLM provider directly; it consumes a named AI Capability exposed by this domain (per [ADR-0006](../architecture/decisions/ADR-0006-ai-as-platform-capability.md)).

## Responsibilities

**In scope for the AI Platform:**
- Defining the AI Capability model: what a capability is, how it is named, and the requirement that every capability expose a stable request/response/error contract before any Feature is built against it ([ADR-0006](../architecture/decisions/ADR-0006-ai-as-platform-capability.md)).
- Owning the LLM Provider Interface, the provider independence guarantee, and provider configuration scoping ([Provider Independence & Configuration](./02_provider_independence_and_configuration.md), per [ADR-0007](../architecture/decisions/ADR-0007-llm-provider-independence-and-encapsulation-boundary.md)).
- Owning the single-owner responsibility split across the prompt/context/response request lifecycle ([Ownership Model](./03_ownership_model.md), per [ADR-0008](../architecture/decisions/ADR-0008-ai-platform-ownership-model.md)).
- Hosting one specification per AI Capability that exists, under [`capabilities/`](./capabilities/000_index.md).

**Explicitly NOT part of the AI Platform:**
- **Search / retrieval / ranking over external data** — a distinct Platform API capability, never modeled as an LLM Provider or folded into this domain, per [ADR-0010](../architecture/decisions/ADR-0010-search-as-independent-platform-capability.md). V3's Market Intelligence Feature may consume both the AI Platform and a future Search capability together; that composition does not make Search part of this domain.
- **Multi-step / session-based workflow orchestration** — out of scope for the AI Application Service established here, per [ADR-0011](../architecture/decisions/ADR-0011-defer-multi-step-workflow-orchestration.md). V5 (AI Product Builder) requires this project to explicitly revisit and extend (or sibling) this architecture before it can be built — it is not something a Feature or capability spec may quietly assume exists.
- **Localization mechanics** — the AI Platform is a consumer of the existing localization architecture, never a second implementation of it. See Localization below.
- **Workspace's own UI/UX, screens, or Feature-specific business logic** — owned entirely by [Workspace Architecture](../workspace/01_architecture.md) and the relevant Feature Specification; this domain is consumed by Workspace, it does not describe Workspace's own presentation.
- **Platform API's other capabilities** (Authentication, Projects, Integrations) — each remains owned by [Application Responsibilities](../context/05_application_responsibilities.md) until promoted to its own directory; this domain owns AI only.

## Capability Model

```
Workspace Feature
     │  (consumes a named AI Capability's Request/Response/Error contract)
     ▼
AI Capability                 — the enumerable, Feature-facing seam; one per capability
     │
     ▼
AI Application Service        — the shared runtime behind every capability
     │
     ▼
LLM Provider Interface        — unified request/response contract each Provider implements
     │
     ▼
Provider (Gemini first; OpenAI, Anthropic, future/local later)
     │
     ▼
External LLM
```

Per [ADR-0006](../architecture/decisions/ADR-0006-ai-as-platform-capability.md): a new roadmap stage (V3, V4, V5) adds one or more new named AI Capabilities under this same model — it does not require a new architecture. The AI Capability layer owns the contract and naming; the AI Application Service owns execution mechanics behind every capability equally (see [Ownership Model](./03_ownership_model.md) for exactly how responsibility is split within that Service, and [Provider Independence & Configuration](./02_provider_independence_and_configuration.md) for the Provider layer downward).

## Localization

*(References [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md) and [ADR-0009](../architecture/decisions/ADR-0009-ai-platform-localization-integration.md) — this section does not redefine either.)* The AI Platform introduces no second localization mechanism. It consumes the same canonical `language` Application-level state already owned by [Workspace Data & State](../workspace/02_data_and_state.md#application-level-state-non-project), as an ordinary Context Creation input (see [Ownership Model](./03_ownership_model.md)). Any AI Capability whose output populates a content-identity-bearing concept (e.g., a Question Model field, per [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md)) returns already-localized presentation content for the requested language — the same role a human-curated preset already fills — and never returns a `localizationKey` itself. Per [ADR-0009](../architecture/decisions/ADR-0009-ai-platform-localization-integration.md), user-authored content that originated from an AI suggestion is, once accepted, ordinary user-authored content: never re-localized on a later language switch, identically to how a preset-derived Canvas answer is already treated ([Workspace Architecture](../workspace/01_architecture.md#localization)).

## Capability Inventory

See [`capabilities/000_index.md`](./capabilities/000_index.md) for the full list and the canonical Capability Specification Template every entry follows. This document does not restate any capability's own Purpose, Request Contract, or Acceptance Criteria — that detail belongs exclusively to its own file.
