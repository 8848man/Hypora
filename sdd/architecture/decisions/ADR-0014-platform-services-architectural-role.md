# ADR-0014: Platform Services as a Named Architectural Role

**Status:** Accepted
**Date:** 2026-07-13
**Affects specs:** `sdd/architecture/01_platform_services.md` (new), [Application Responsibilities](../../context/05_application_responsibilities.md), [Future Expansion Strategy](../../context/06_future_expansion_strategy.md), [Ownership Map](../../rules/ownership.md)
**Related ADRs:** [ADR-0006](./ADR-0006-ai-as-platform-capability.md), [ADR-0007](./ADR-0007-llm-provider-independence-and-encapsulation-boundary.md), [ADR-0008](./ADR-0008-ai-platform-ownership-model.md) (AI, the first confirmed instance), [ADR-0010](./ADR-0010-search-as-independent-platform-capability.md) (Search's boundary, an anticipated instance), [ADR-0013](./ADR-0013-analytics-provider-independence.md) (Analytics, the second confirmed instance — this ADR generalizes the role both already independently share)

## Context

The repository now contains two independently-built, infrastructure-oriented subsystems — AI ([ADR-0006](./ADR-0006-ai-as-platform-capability.md), [ADR-0007](./ADR-0007-llm-provider-independence-and-encapsulation-boundary.md), [ADR-0008](./ADR-0008-ai-platform-ownership-model.md)) and Analytics ([ADR-0013](./ADR-0013-analytics-provider-independence.md)) — that share the same shape: a Zero-Provider-Conditional Rule, a Capability/Event → Application Service → Provider Interface → Provider pipeline, Provider configuration scoping, Credential Separation, and a Minimum Abstraction restraint. Analytics was deliberately authored to mirror AI's own pattern; this is written evidence of a recurring role, not a coincidence. A third capability, Search, already has its boundary decided against AI ([ADR-0010](./ADR-0010-search-as-independent-platform-capability.md)) but no architecture of its own yet, and is expected to eventually share the same shape once V3 is planned. Left unnamed, each future infrastructure-oriented capability risks re-deriving these guarantees from scratch or subtly diverging from them, and no single document currently gives a checklist against which to weigh whether a *new* candidate (e.g., Notification, Billing) genuinely belongs to this category or should remain Feature-local. This spans more than one owned area (AI, Analytics, Context, Ownership), is a genuine choice among real alternatives, and is cheap to decide now while only two confirmed instances exist — the same reasoning [ADR-0010](./ADR-0010-search-as-independent-platform-capability.md) already applied to deciding the Search/AI boundary before V3 existed.

## Decision

1. **"Platform Service" is introduced as a named architectural role**, documented in `sdd/architecture/01_platform_services.md`: a cross-cutting, infrastructure-oriented capability, consumed by more than one Feature, whose backing vendor is replaceable without touching Feature code.
2. **AI and Analytics are confirmed Platform Services.** Search is an anticipated Platform Service, pending its own architecture at V3 planning.
3. **Provider Independence (the Zero-Provider-Conditional Rule) is recognized as a property of Platform Services generally**, evidenced independently by [ADR-0007](./ADR-0007-llm-provider-independence-and-encapsulation-boundary.md) and [ADR-0013](./ADR-0013-analytics-provider-independence.md) — neither ADR is modified; both remain the standing rule for their own domain.
4. **Explicit Admission Criteria govern whether a future capability qualifies** as a Platform Service (see `sdd/architecture/01_platform_services.md#admission-criteria`) — never a default or miscellaneous bucket. Notification, Identity, Billing, Background Jobs, Integrations, Storage, and Market Intelligence Services are explicitly discussed and explicitly **not** admitted now, for lack of current architectural evidence.
5. **No directory relocation.** `sdd/ai/**` and `sdd/analytics/**` retain full, unchanged ownership of their own specifications; Platform Services is a descriptive overlay, not a containing directory or a new owning area beyond a small widening of the existing Architecture area's scope (`sdd/architecture/decisions/**` → `sdd/architecture/**`).
6. **Dependency direction is confirmed, not changed** — Feature → Platform Service → Provider Interface → Infrastructure → External Service is already independently satisfied by both AI and Analytics; this ADR names the shared shape without altering either.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Leave the pattern implicit (no new document) | Rejected — a real, recurring pattern with no name risks a third instance (Search, or a later candidate) re-deriving or subtly diverging from guarantees AI/Analytics already established, and gives no checklist to weigh a new candidate against |
| Merge `sdd/ai/`, `sdd/analytics/`, and future `sdd/search/` into one `sdd/platform-services/` directory | Rejected — real restructuring cost (broken links, ownership churn) for a purely organizational gain; both this task's constraints and the repository-stability principle weigh directly against it |
| Give Platform Services its own top-level owned area, separate from `sdd/architecture/` | Rejected — Platform Services doesn't own content; it describes a role instances already own themselves. A new top-level area would misrepresent it as a container |
| Pre-admit Notification, Identity, Billing, Background Jobs, Integrations, Storage, or Market Intelligence Services now | Rejected — no current architectural evidence for any of them; would violate this project's own restraint against speculative abstraction |

## Consequences

**Positive:**
- Search's eventual architecture (V3) inherits a checklist instead of starting from zero.
- Any future infrastructure candidate has explicit admission criteria rather than ad hoc judgment, preventing both premature over-admission and ad hoc reinvention.
- Provider Independence is now recognized as a reusable guarantee, not an AI-specific accident of one subsystem's design.

**Negative / accepted trade-offs:**
- One more document to keep in sync as AI and Analytics evolve — accepted as the cost of not letting a third instance diverge silently.
- Risk that "Platform Service" is applied loosely in future discussion without checking the Admission Criteria — mitigated by requiring a new capability's own ADR before admission, per Admission Criteria item 4.

## Future Impact

Any future capability seeking recognition as a Platform Service is checked against `sdd/architecture/01_platform_services.md#admission-criteria` and decided via its own ADR, mirroring [ADR-0006](./ADR-0006-ai-as-platform-capability.md), [ADR-0010](./ADR-0010-search-as-independent-platform-capability.md), and [ADR-0013](./ADR-0013-analytics-provider-independence.md)'s own precedent — never silently assumed. Search's own future architecture is expected to state explicitly whether it satisfies the Admission Criteria, at the point it is actually designed.
