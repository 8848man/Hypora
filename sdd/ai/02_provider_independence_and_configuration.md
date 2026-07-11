# Provider Independence & Configuration

**Refs:** → [00_index](../00_index.md) · [AI Platform Architecture](./01_architecture.md) · [Ownership Model](./03_ownership_model.md) · [ADR-0007](../architecture/decisions/ADR-0007-llm-provider-independence-and-encapsulation-boundary.md) · [Infra Deployment](../infra/01_deployment.md)

Canonical owner of the LLM Provider Interface's independence guarantee and the provider configuration model established by [ADR-0007](../architecture/decisions/ADR-0007-llm-provider-independence-and-encapsulation-boundary.md). This document states the current, standing rule — it does not re-derive why it was chosen; see the ADR for that.

## Purpose

Guarantee that Gemini (first), OpenAI, Anthropic, and any future provider (including a future local model) can be added or swapped without changing Workspace Feature code, AI Capability code, or the AI Application Service. This is the property that makes "no vendor lock-in" (a stated design goal) checkable rather than aspirational.

## The Zero-Provider-Conditional Rule

No code outside a given Provider implementation may branch on provider identity. This applies to the AI Capability layer, the AI Application Service, and every Workspace Feature — none of them may be written in a way that requires naming Gemini, OpenAI, Anthropic, or any other vendor to function correctly.

## Provider Responsibilities

Per [ADR-0007](../architecture/decisions/ADR-0007-llm-provider-independence-and-encapsulation-boundary.md), each Provider owns, and the AI Application Service never duplicates:

| Responsibility | Why it must stay in Provider |
|---|---|
| Wire-level API communication, authentication | Vendor-specific by nature |
| Request/response formatting | Differs per vendor's native request shape |
| Structured / schema-constrained output generation | Each vendor implements this via a different native mechanism (function-calling, tool-use, JSON mode, or equivalent); if this logic lived in the AI Application Service instead, the Service would become provider-aware in practice even while provider-agnostic in name |
| Translation of vendor-specific errors into the AI Platform's unified error taxonomy | Only the Provider layer has visibility into a vendor's native error shape |

The AI Application Service's own share of response handling (normalization of the *already-translated* result, parsing into the generic Capability Response DTO, validation) is owned separately — see [Ownership Model](./03_ownership_model.md), which does not re-decide anything assigned here.

## Configuration Scoping

Configuration is scoped **Provider × Capability**, not Provider alone. Different capabilities may reasonably require different runtime tuning (model, temperature/top_p or equivalent, max tokens, thinking/reasoning mode) on the same provider — for example, a V2 canvas suggestion and a V5 multi-step generation calling the same provider are not expected to share one configuration profile.

A routing table (the AI Platform's `registry`) maps **capability → provider/model profile**. Its architectural responsibility is limited to routing; it contains no runtime logic of its own. This is a routing table, not a global "active provider" switch — a capability's profile is looked up by the capability's own identity, never assumed globally.

## Credential Separation

Secrets are never stored in provider configuration. Credentials are resolved through a Credential Loader reading environment variables, referenced from configuration by name only — see [Infra Deployment](../infra/01_deployment.md) for how environment variables are actually provisioned once a real deployment target exists for this capability; this document does not restate that.

## Minimum Abstraction

Per [ADR-0007](../architecture/decisions/ADR-0007-llm-provider-independence-and-encapsulation-boundary.md), this is deliberately the *minimum* guarantee, not the maximum:

**Not required by this architecture:**
- A dynamic, runtime-loadable provider plugin system
- Automatic provider discovery
- Multi-provider fallback or routing chains (e.g., automatic failover from one provider to another)

Static, configuration-driven provider selection via the routing table above is sufficient until a real product need for any of the above is identified — at which point that is a new, additive decision, not a reversal of this one.

## Context Budget

*(Clarifies, rather than adds to, the Context Ownership split already stated in [Ownership Model](./03_ownership_model.md) — no new responsibility is introduced.)*

- **The token budget threshold itself is provider/model data**, not a new configuration field: it is already covered by the Provider Configuration Schema's existing "Provider-specific configuration" row below (e.g., "max tokens" is already named there as an example). A Feature never hardcodes a budget number; it is resolved from the active Provider × Capability configuration profile at request time.
- **Truncation is a mechanical operation, owned by the AI Application Service** — this restates, not extends, [Ownership Model](./03_ownership_model.md#context-ownership)'s existing "Context transformation" row. The mechanism (how to cut when Normalized Context exceeds the resolved budget) is generic and provider-independent; only the numeric threshold it's cutting against varies by Provider × Capability configuration.
- **Summarization, if ever introduced, is not a new ownership category** — it splits along the boundary already established: condensing that requires no business judgment (e.g., a fixed-length excerpt) remains AI Application Service-owned, identically to truncation; condensing that requires judgment about *what matters most to keep* is already Feature-owned, per the existing "Context selection (business priority)" row. Neither case needs a new row in the Context Ownership table.
- **Provider independence is preserved throughout:** neither the Feature nor the AI Application Service's truncation mechanism branches on provider identity (the Zero-Provider-Conditional Rule above is unaffected) — the mechanism reads whatever threshold the current configuration profile states and applies it uniformly; it never needs to know which provider chose that number or why.

## Provider Configuration Schema

The logical shape every Provider × Capability configuration profile carries. This is a **logical contract** — field names and meaning only. It contains no real values, no secrets, and no deployment mechanics; those remain owned by [Infra Deployment](../infra/01_deployment.md), referenced below rather than restated.

| Field | Meaning | Required? |
|---|---|---|
| Provider identity | Which Provider implementation this profile configures (e.g., a logical name such as "gemini," "openai," "anthropic") — never a vendor SDK/endpoint detail | Required |
| Capability routing | Which capability (and, per [Contract Versioning](./capabilities/000_index.md#contract-versioning), which Contract Version of that capability) this profile applies to | Required |
| Model identifier | The specific model name/version string for that provider | Required |
| Provider-specific configuration | The heterogeneous runtime parameters that provider exposes (e.g., temperature/top_p for one vendor, reasoning level/verbosity for another, thinking mode/max tokens for a third) | Required, shape varies per Provider — never unified into one shared field list, per this document's Configuration Scoping section |
| Secret reference | A symbolic reference (e.g., an environment-variable name) the Credential Loader resolves at runtime — never the literal secret value | Required |
| Optional provider parameters | Parameters that may be omitted, falling back to a Provider-defined default | Optional |

**Validation expectations** — a configuration profile is not considered valid unless:
- Every Required field above is present.
- Its Capability routing entry names a capability (and Contract Version) that actually exists in [`capabilities/000_index.md`](./capabilities/000_index.md) — a profile may not route to a capability this domain doesn't define.
- Its Provider identity names a Provider implementation that actually exists — a profile may not reference a vendor with no corresponding Provider.
- Its Secret reference resolves to a non-empty value at runtime — this document states the expectation only; the resolution mechanism itself, and what happens operationally if it fails, is owned by [Infra Deployment](../infra/01_deployment.md), not restated here.

**Explicitly out of scope for this schema:** where and how a secret is actually stored, rotated, or provisioned into an environment (Infrastructure's ownership); which specific Gemini/OpenAI/Anthropic account or billing arrangement is used (an operational, not architectural, fact); any real secret value (never appears in any `sdd/` document, per `sdd/rules/spec_authoring_rules.md`'s duplication and authoring discipline).

## What This Document Does Not Cover

- Prompt intent/template/rendering/versioning, and the Feature-vs-Service split across the request lifecycle — owned by [Ownership Model](./03_ownership_model.md).
- Any specific capability's own request/response contract or the model/tuning profile it requires — owned by that capability's own specification under [`capabilities/`](./capabilities/000_index.md).
- Localization behavior — owned by [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md) and [ADR-0009](../architecture/decisions/ADR-0009-ai-platform-localization-integration.md), referenced (not restated) from [AI Platform Architecture](./01_architecture.md#localization).
- The operational procedure for deciding whether and when to change a configured model identifier in production — owned by [Implementation Lifecycle](../workflow/00_implementation_lifecycle.md#ai-provider-model-change-verification).
