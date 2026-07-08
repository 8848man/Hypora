# ADR-0007: LLM Provider Independence and Encapsulation Boundary

**Status:** Accepted
**Date:** 2026-07-08
**Affects specs:** AI Platform Architecture (forthcoming, `sdd/platform-api/`)
**Related ADRs:** [ADR-0006](./ADR-0006-ai-as-platform-capability.md) (establishes the AI Capability this boundary protects); [ADR-0008](./ADR-0008-ai-platform-ownership-model.md) (the runtime-side ownership split this boundary is a precondition for)

## Context

Hypora's AI Platform must support Gemini first, then OpenAI, Anthropic, and future vendors (including local models) without requiring changes to Feature or Capability code when a provider is added or swapped. Left undefined, "provider independence" is easy to assert and easy to quietly violate — for example, if structured-output handling or vendor error normalization drifts into the shared AI Application Service instead of staying inside each Provider, the Service becomes provider-aware in practice even though it is provider-agnostic in name. This is a foundational, cross-cutting guarantee that every future capability (V2–V5) and every future provider addition depends on; getting it wrong is discovered only when a provider swap unexpectedly requires Feature or Service changes, at which point it is expensive to unwind.

## Decision

1. **Zero-provider-conditional rule:** no code outside a given Provider implementation may branch on provider identity. The AI Capability layer, the AI Application Service, and all Feature code must be expressible without ever naming Gemini, OpenAI, Anthropic, or any other vendor.
2. **Providers own all vendor-specific mechanics**, including: wire-level API communication, authentication, request/response formatting, structured/schema-constrained output generation (each vendor's native mechanism — function-calling, tool-use, JSON mode, or equivalent), and translation of vendor-specific error responses into the AI Platform's unified error taxonomy. A Provider that only forwards raw text and defers structured-output or error-shape handling to the Service does not satisfy this ADR.
3. **Configuration is scoped Provider × Capability, not Provider alone.** Runtime parameters (model, temperature/top_p or equivalent, max tokens, thinking/reasoning mode) are selected per capability, because different capabilities (e.g., a V2 canvas suggestion vs. a V5 multi-step generation) may reasonably require different tuning on the same provider. A routing table (referred to as `registry.yaml` in the original proposal) maps capability → provider/model profile; its architectural responsibility is limited to routing — it contains no runtime logic.
4. **Credentials remain separate from configuration.** Secrets are never stored in provider configuration; they are resolved through a Credential Loader reading environment variables, referenced from configuration by name only.
5. **Minimum abstraction, not maximum:** this ADR deliberately does not require a dynamic provider plugin registry, runtime provider auto-discovery, or multi-provider fallback/routing chains. Static, configuration-driven provider selection is sufficient until a real product need for runtime provider switching exists.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Allow the AI Application Service to special-case each provider's structured-output mechanism | Rejected — this is the exact failure mode this ADR exists to prevent: the Service silently becomes provider-aware, and every new provider requires a Service change rather than a new, isolated Provider implementation |
| Single Provider × global configuration (one config per provider, shared across all capabilities) | Rejected — cannot express different runtime tuning per capability on the same provider without ad hoc runtime overrides scattered through code, eroding the configuration boundary as V3–V5 add capabilities |
| Build a dynamic provider plugin system (runtime-loadable providers, provider auto-discovery) now | Rejected as premature — no current or near-term requirement for runtime-loadable providers; static configuration-driven selection meets every V2–V5 need identified so far and avoids speculative infrastructure |
| Multi-provider fallback chains (e.g., automatic failover from Gemini to OpenAI on error) | Rejected for this ADR's scope — a legitimate future capability, but not required for provider independence itself; would be a separate, additive decision if a reliability need for it emerges |

## Consequences

**Positive:**
- Adding OpenAI, Anthropic, or a future local-model provider requires writing a new Provider implementation only — no changes to Feature, Capability, or AI Application Service code, provided the zero-provider-conditional rule holds.
- Per-capability configuration scoping means V3–V5 capabilities can tune provider behavior independently without forcing a configuration-schema migration.
- The rule is directly checkable (a static or code-review check for provider-name references outside the Provider layer), giving the architecture a concrete, verifiable independence guarantee rather than an aspirational one.

**Negative / accepted trade-offs:**
- Pushes more responsibility (structured output, error normalization) into each Provider implementation than a naive design would, meaning each new provider is more work to add than a thin pass-through would be — accepted as the cost of a guarantee that actually holds.
- Provider × Capability configuration scoping means the number of distinct configuration entries grows with the product of providers and capabilities rather than staying linear in providers alone — accepted because the alternative (global-per-provider config) was already shown to break down by V3.

## Future Impact

Every future Provider addition (OpenAI, Anthropic, future vendors, local models) is validated against the zero-provider-conditional rule before being considered complete. If a genuine need for dynamic provider plugin loading or multi-provider fallback emerges, that is a new, additive decision — not a reversal of this one.
