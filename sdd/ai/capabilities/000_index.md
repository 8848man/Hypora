# AI Capability Specifications — Index

**Refs:** → [00_index](../../00_index.md) · [AI Platform Architecture](../01_architecture.md) · [Provider Independence & Configuration](../02_provider_independence_and_configuration.md) · [Ownership Model](../03_ownership_model.md)

Every AI Capability that exists, in the order it was introduced. Mirrors the ADR index and Workspace Feature index pattern: growth means one new file plus one new row here, never an edit to a shared file.

| # | Capability | Roadmap Stage | Purpose |
|---|---|---|---|
| [01](./01_canvas_assistant.md) | Canvas Assistant | V2 | Improve, complete, and refine a Business Canvas through AI-generated suggestions and follow-up questions |
| [02](./02_risk_memo_assistant.md) | Risk Memo Assistant | First consumer of the generalized structured-feature AI architecture (not a V-numbered roadmap stage — see [Future Expansion Strategy](../../context/06_future_expansion_strategy.md#future-ready-architecture-principle)) | Suggest content for one Risk Memo field at a time, grounded in the Business Canvas and the field's Risk Memo siblings |
| [03](./03_mvp_planning_assistant.md) | MVP Planning Assistant | Same as above | Suggest MVP Scope content, grounded in Business Canvas and Risk Memo (read-only) |
| [04](./04_validation_planning_assistant.md) | Validation Planning Assistant | Same as above | Suggest a new Assumption statement, grounded in Business Canvas, Risk Memo, and MVP Scope (read-only) |
| [05](./05_feature_suggestion_assistant.md) | Feature Suggestion Assistant | Same as above | Propose a batch of Feature names for the Feature Plan, grounded in Business Canvas, MVP Scope, existing Features, and Risk Memo (read-only, optional) |
| [06](./06_project_summary_synthesis_assistant.md) | Project Summary Synthesis Assistant | Introduced alongside [ADR-0016](../../architecture/decisions/ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md)/[ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md), 2026-07-18 (not a V-numbered roadmap stage — see [Future Expansion Strategy](../../context/06_future_expansion_strategy.md#future-ready-architecture-principle)) | Synthesize a concise narrative (what/who/problem/validation approach) from Business Canvas, MVP Scope, and Validation Checklist; the AI Platform's first, narrowly-scoped Automatic Invocation, per ADR-0017 |

## Capability Specification Template

Every AI Capability specification follows this template. Sections are fixed; a capability may state "None" for a section but may not omit it, so that the absence of, e.g., an Out of Scope boundary is a deliberate statement rather than an accidental gap.

| Section | Owns | Why it belongs in the template |
|---|---|---|
| **Purpose** | The business goal this capability serves | Ties the capability back to a roadmap stage and a real user need — prevents a capability from being justified only by "AI could do this here" |
| **Responsibility** | What this capability specifically does, at the level of user-visible behavior | Distinguishes the capability from the AI Platform's shared runtime — this section is about behavior, not mechanics (mechanics are owned by [Provider Independence & Configuration](../02_provider_independence_and_configuration.md) and [Ownership Model](../03_ownership_model.md), referenced, not restated) |
| **Consumers** | Which Workspace Feature(s) call this capability | Gives traceability from the AI Platform back to Workspace, and flags when a second consumer appears (relevant to future promotion/composition decisions, per [ADR-0010](../../architecture/decisions/ADR-0010-search-as-independent-platform-capability.md)'s composition note) |
| **Request Contract** | The capability-specific input shape (conceptually — field names and meaning, not an API/DTO definition) | This is the seam a Feature codes against, per [ADR-0006](../../architecture/decisions/ADR-0006-ai-as-platform-capability.md) — it must exist before the capability is built against, not be inferred from implementation |
| **Response Contract** | The capability-specific output shape (conceptually) | Same reasoning as Request Contract; together they are the capability's stable outward contract |
| **Failure Model** | The capability-specific error cases, mapped onto the AI Platform's unified error taxonomy | Prevents a capability from inventing its own error shape instead of using the taxonomy [Provider Independence & Configuration](../02_provider_independence_and_configuration.md) already establishes |
| **Localization** | How this capability's output respects the existing localization architecture | Every capability that produces user-facing text must state this explicitly, per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md) — never redefines localization, only confirms how this capability participates in it |
| **Acceptance Criteria** | Testable criteria for when the capability's behavior is correct | Mirrors the discipline already used in every [Workspace Feature Specification](../../workspace/features/000_index.md) |
| **Out of Scope** | What this capability deliberately does not do | Prevents scope creep into a neighboring capability or into Search/workflow-orchestration territory the AI Platform has already excluded ([ADR-0010](../../architecture/decisions/ADR-0010-search-as-independent-platform-capability.md), [ADR-0011](../../architecture/decisions/ADR-0011-defer-multi-step-workflow-orchestration.md)) |
| **Future Expansion** | How later roadmap stages are expected to extend this capability, if at all, without redesigning it | Mirrors [Future Expansion Strategy](../../context/06_future_expansion_strategy.md)'s per-stage notes pattern, applied at capability granularity |
| **Contract Version** | The current version of this capability's Request/Response Contract, and its status | Without a version, a breaking change to a capability's outward contract has no way to signal itself to a Consumer already built against the old shape — see Contract Versioning below |

**Deliberately not a template section:** provider or model selection. Which provider/model backs a capability is a routing decision owned by [Provider Independence & Configuration](../02_provider_independence_and_configuration.md)'s Provider × Capability configuration; a capability specification names its own tuning needs only if genuinely capability-specific (e.g., "this capability's requests do not fit a short context window"), and never names a vendor.

## Contract Versioning

Every AI Capability's Request/Response Contract carries an explicit version, because the contract is the seam a Workspace Feature is built against ([ADR-0006](../../architecture/decisions/ADR-0006-ai-as-platform-capability.md)) — an unversioned contract has no way to signal a breaking change to a Consumer already relying on the old shape.

**Scheme:** `<integer>.<integer>` (major.minor), aligned with the same versioning philosophy `sdd-framework/06_naming_and_versioning.md` already applies to other authoritative-contract documents — this is not a new, competing scheme; it reuses the existing major.minor convention rather than inventing a capability-specific one.

**Version ownership:** the capability's own specification file owns its Contract Version — no other document (a Consumer's Feature spec, the AI Platform Architecture overview, or a second capability's spec) may declare or imply a version on this capability's behalf.

**Version evolution rules:**
- **Minor bump** (e.g., 1.0 → 1.1): an additive, backward-compatible change — a new optional Request field, a new optional Response field, or a clarified (not changed) field meaning. An existing Consumer built against the prior minor version continues to work unmodified.
- **Major bump** (e.g., 1.x → 2.0): any change that an existing Consumer could not tolerate unmodified — a field removed, a field's meaning changed, a field made required that was previously optional, or a change to the Operation enumeration that alters existing behavior. A major bump requires the prior major version's shape to remain documented (see Compatibility Expectations) until every Consumer has migrated.

**Compatibility expectations:** a Consumer is written against a specific major version. The AI Platform must not silently change a published major version's shape — that would violate the contract stability every Feature depends on. A breaking change is always a new major version, never an in-place edit to an existing one.

**Contract stability expectations (status):** modeled on the same Draft → Stable → Superseded shape `sdd-framework/06_naming_and_versioning.md`'s Status Vocabulary Summary already uses for other authoritative-contract documents, adapted to a contract rather than a whole document:
- **Draft** — the Contract Version exists in the specification but is not yet consumed by any implemented Feature. May still change freely, including breaking changes, without a version bump — nothing depends on it yet.
- **Stable** — at least one Feature is implemented against this Contract Version. From this point, the evolution rules above are binding: any breaking change requires a major bump, not an in-place edit.
- **Superseded** — a newer major version now exists. The superseded version's shape remains documented in the capability's own file (a "Contract Version History" subsection), per the project's archive-don't-delete discipline — it is not moved to `sdd/archive/`, because the capability document as a whole is still current; only one version within it has been superseded.

This document does not itself assign a Contract Version to any capability — that value is owned and stated by each capability's own specification file, per Version ownership above.

## Capability Promotion Rules

A capability that currently consolidates more than one behavior under one Request/Response Contract (e.g., [Canvas Assistant](./01_canvas_assistant.md)) is promoted — split into multiple independent capability specifications, each with its own Contract Version — the moment any **mandatory trigger** below fires. These triggers are architecture-driven (they test the outward contract and its Consumer relationship) rather than implementation-driven (they deliberately exclude testing strategy, team assignment, or authorship convenience, none of which are architectural facts).

**Mandatory triggers — promotion is required, not a judgment call:**

| Trigger | Why it forces promotion |
|---|---|
| Two behaviors' Request Contracts cannot share one field set without a field whose meaning is conditional on which behavior is being invoked | An ambiguous shared shape is itself a contract defect — per [Ownership Model](../03_ownership_model.md), a Consumer must be able to read a Request/Response Contract without knowing which internal behavior it maps to |
| Two behaviors' Response Contracts diverge the same way | Same reasoning, output side |
| A second Consumer (a Feature not already listed in the capability's own Consumers section) needs a Request/Response shape the existing Contract Version cannot satisfy without a breaking (major) version change | A capability's Contract Version is meant to serve every current Consumer at once; a Consumer-forced breaking change for one Consumer that a different existing Consumer does not need is a sign the two Consumers no longer share one capability |
| Two behaviors require independent Contract Version lifecycles — one must undergo a breaking (major) change without affecting the other | Contract Versioning (above) assumes one version timeline per capability; two behaviors needing to break independently cannot share one timeline without one dragging an unrelated breaking change onto the other |

**Explicitly not a promotion trigger, on its own:**

| Non-trigger | Why it doesn't qualify |
|---|---|
| Two behaviors use different Context Creation/Selection logic, but their Request/Response Contract shape is unaffected | Context is Feature/Service-internal plumbing ([Ownership Model](../03_ownership_model.md)) — it may differ freely without the outward contract changing |
| Two behaviors would benefit from different testing strategies or coverage targets | Testing strategy is owned by `sdd/infra/`, not an architectural fact about this capability's contract boundary |
| Two behaviors would benefit from a different provider/model tuning profile | Already solved by [Provider Independence & Configuration](../02_provider_independence_and_configuration.md)'s Provider × Capability configuration scoping — does not require a second capability |
| Two behaviors are authored or reviewed by different people/teams | Authorship convenience is not an architectural fact |

When a mandatory trigger fires: the diverging behavior is extracted into its own new capability file, starting at Contract Version 1.0 (Draft), added as a new row in the table above; the original capability's own Contract Version is bumped only if its own Request/Response Contract shape actually changed as a result of the extraction. Consumer migration mechanics are an implementation-time concern, not decided in this specification.

## Ownership

Every Capability Specification here is owned by the AI Platform area (`sdd/rules/ownership.md`, pending its new row). Each capability document owns exactly its own Purpose/Responsibility/Consumers/Request Contract/Response Contract/Failure Model/Localization/Acceptance Criteria/Out of Scope/Future Expansion — none may redefine [AI Platform Architecture](../01_architecture.md)'s capability model, [Provider Independence & Configuration](../02_provider_independence_and_configuration.md)'s independence guarantee, or [Ownership Model](../03_ownership_model.md)'s prompt/context/response split; each references those documents instead.
