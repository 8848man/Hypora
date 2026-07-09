# ADR-0011: Defer Multi-Step Workflow Orchestration Beyond V2–V4

**Status:** Accepted
**Date:** 2026-07-08
**Affects specs:** [Future Expansion Strategy](../../context/06_future_expansion_strategy.md), AI Platform Architecture (forthcoming, `sdd/platform-api/`)
**Related ADRs:** [ADR-0006](./ADR-0006-ai-as-platform-capability.md) (scopes what the AI Application Service established there is, and is not, responsible for)

## Context

V5 (AI Product Builder) is described in [Future Expansion Strategy](../../context/06_future_expansion_strategy.md) as generating "requirement generation, SDD generation, development planning, AI-assisted execution" — work that plausibly requires a chain of AI calls with intermediate state, branching, and resumability, not a single request/response round trip. The AI Platform architecture established in ADR-0006 through ADR-0008 is a single-call pipeline: Feature → AI Capability → AI Application Service → Provider → back. Building durable multi-step workflow orchestration into the AI Application Service now, for a roadmap stage (V5) that is not yet planned and whose actual requirements are unknown, would be speculative work against the project's "current MVP first" principle and risks building the wrong orchestration shape for requirements that don't exist yet.

Silently leaving this gap undocumented, however, is itself a risk: a future implementer could reasonably assume the AI Application Service already supports chaining, or discover the gap only once V5 planning is underway and treat it as a surprise requiring emergency redesign rather than an anticipated, budgeted piece of work.

## Decision

1. **Multi-step workflow orchestration is explicitly out of scope for the AI Platform architecture established in ADR-0006 through ADR-0008.** The AI Application Service's "request orchestration" responsibility means orchestrating a single capability call (prompt assembly, provider selection, response handling) — it does not mean multi-call, multi-step, or session-based workflow orchestration.
2. **This is a deliberate, recorded deferral, not an oversight.** V2 (Canvas Assistant), V3 (Market Intelligence), and V4 (GTM Planning) are all expected to fit within the single-call model; only V5 is anticipated to need workflow orchestration.
3. **Revisiting this decision is a required step of V5 planning**, not an optional one. When V5 (AI Product Builder) is actually planned, the AI Platform architecture must be explicitly extended (or a separate Workflow Orchestration capability introduced alongside it) — this ADR does not prejudge which shape that takes, only that the current architecture does not yet provide it.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Design multi-step workflow orchestration into the AI Application Service now, ahead of V5 | Rejected — V5's actual requirements are not yet specified; building orchestration speculatively risks designing the wrong shape and adds complexity to V2–V4, which don't need it, violating "build only what V2 needs" |
| Leave the gap unrecorded and let it surface organically when V5 is eventually planned | Rejected — an unrecorded gap risks being discovered as a crisis rather than a budgeted decision, and risks a future implementer incorrectly assuming the existing Service already supports chaining |
| Model V5's needs as "just another AI Capability" under the existing single-call contract | Rejected — multi-step orchestration with intermediate state and resumability is a materially different architectural shape than a single request/response capability call; treating it as "just another capability" would either fail to meet V5's needs or quietly force workflow state into the single-call model, corrupting the contract ADR-0006 established |

## Consequences

**Positive:**
- V2–V4 implementation proceeds without carrying speculative orchestration complexity they don't need.
- V5 planning starts from an explicit, known gap rather than an implicit assumption, reducing the risk of a late-discovered architectural surprise.
- The AI Application Service's responsibility boundary (single-call orchestration only) stays unambiguous for V2–V4.

**Negative / accepted trade-offs:**
- V5 is guaranteed to require additional architectural work (a new ADR and likely a new specification area) before it can be implemented — accepted as the correct cost of not building it prematurely.
- If V5's timeline moves up unexpectedly, this gap becomes a scheduling dependency; this ADR does not mitigate that risk, only makes it visible.

## Future Impact

V5 planning must treat "extend or supplement the AI Platform architecture for multi-step workflow orchestration" as a required first step, not an implementation detail to be discovered mid-build.
