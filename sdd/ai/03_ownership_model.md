# AI Platform Ownership Model

**Refs:** → [00_index](../00_index.md) · [AI Platform Architecture](./01_architecture.md) · [Provider Independence & Configuration](./02_provider_independence_and_configuration.md) · [ADR-0008](../architecture/decisions/ADR-0008-ai-platform-ownership-model.md) · [Workspace Data & State](../workspace/02_data_and_state.md) · [Workspace Architecture](../workspace/01_architecture.md)

Canonical owner of the single-owner responsibility split across an AI request's lifecycle (prompt, context, response), established by [ADR-0008](../architecture/decisions/ADR-0008-ai-platform-ownership-model.md). Every responsibility below has exactly one owner; none is shared. This document restates the ADR's Decision as the ongoing, current reference — see the ADR for the alternatives considered and why.

## Single-Owner Principle

Every row below is owned by either the **Feature** (Workspace-side business logic) or the **AI Application Service** (the shared AI Platform runtime introduced in [AI Platform Architecture](./01_architecture.md)) — never both, and never left unassigned.

## Prompt Ownership

| Responsibility | Owner | Note |
|---|---|---|
| Prompt intent (what to ask, tone, business goal) | Feature | Business judgment |
| Prompt template (structure sent to the provider) | AI Application Service | Kept provider-portable so a provider swap never requires a Feature change |
| Prompt rendering (variable interpolation, provider-appropriate formatting) | AI Application Service | Mechanical |
| Prompt versioning (tracking/promoting the active template version) | AI Application Service | Triggered by a Feature's changed intent, but the Feature does not own the version identifier or lifecycle |

## Context Ownership

| Responsibility | Owner | Note |
|---|---|---|
| Context creation (requesting Normalized Workspace Context — see Context Representation Pipeline below — and combining it with Feature-specific values: current question, previous answers, user preferences) | Feature | The Feature never re-implements raw Canvas/Workspace-state serialization itself; that mechanical step is the Workspace Context Builder's job, per [Workspace Data & State](../workspace/02_data_and_state.md) and [Workspace Context Builder](../workspace/01_architecture.md#workspace-context-builder) |
| Context selection (business priority — what matters most if not everything fits) | Feature | Business judgment |
| Context transformation (mechanical truncation/serialization to fit a provider's token budget or format) | AI Application Service | Runtime mechanics; keeps provider-specific knowledge (token budgets) out of Feature code |
| Context delivery (assembling the final request payload) | AI Application Service | Mechanical |

## Response Ownership

The Provider's share of response handling — structured-output generation and vendor error translation — is owned by Provider per [Provider Independence & Configuration](./02_provider_independence_and_configuration.md) and is **not** re-decided here.

| Responsibility | Owner | Note |
|---|---|---|
| Response normalization (turning an already-translated, already-structured Provider result into the unified Capability Response shape) | AI Application Service | |
| Parsing (into the generic Capability Response DTO) | AI Application Service | |
| Validation (conformance/non-empty checks) | AI Application Service | |
| Consuming the Capability Response into a Feature-specific view model | Feature | The last step in the lifecycle; the Feature never receives a raw Provider response |

## Context Representation Pipeline

*(Restates the Context Ownership table above as a single left-to-right pipeline, so the owner of each transformation between raw Workspace data and a finished prompt is unambiguous. Introduces no new responsibility beyond what the table above and [Workspace Context Builder](../workspace/01_architecture.md#workspace-context-builder) already establish — this section only names the stages between them, and states why the pipeline has the shape it does.)*

```
Workspace State                    — raw Project/Canvas/Feature data, Workspace-owned
                                      (sdd/workspace/02_data_and_state.md)
     │  Workspace Context Builder (Workspace-owned — see
     │  sdd/workspace/01_architecture.md#workspace-context-builder)
     │  Context normalization (Workspace-owned — see Purpose of Normalization below)
     ▼
Normalized Workspace Context       — a capability-agnostic, provider-agnostic serialization
                                      of Canvas (+ any other Workspace data a Feature reads)
     │  Capability Context Selection (Feature-owned — existing "Context creation" +
     │  "Context selection" rows above; the Feature combines Normalized Workspace
     │  Context with its own local structured values and applies its own
     │  business-priority judgment about what matters if not everything fits)
     ▼
Capability Request                 — the capability's own Request Contract shape
     │  Provider Transformation (AI Application Service-owned — existing "Context
     │  transformation" row above; mechanical truncation/serialization to fit a
     │  provider's budget/format)
     │  Prompt rendering (AI Application Service-owned — existing rows above)
     ▼
Prompt
     │
     ▼
Provider → External LLM
```

**Ownership, stated explicitly:**
- **Workspace owns** the Workspace Context Builder and Context normalization — producing Normalized Workspace Context is a Workspace responsibility, not an AI Platform one.
- **Feature owns** Capability Context Selection, Prompt intent, and business meaning — deciding what a request is *for* and which normalized values it needs.
- **AI Application Service owns** Provider Transformation, Prompt rendering, and execution — everything mechanical between a Capability Request and an actual call to a Provider.

**Purpose of Normalization.** Context normalization exists to:
- **Isolate Workspace's own data models from AI contracts** — a Feature's or Capability's Request Contract is never written directly against Workspace's internal Project/Canvas shape; it is written against Normalized Workspace Context, so a change to one does not force a change to the other.
- **Create provider-independent context** — Normalized Workspace Context carries no provider-specific shape or limit; those are applied only downstream, at Provider Transformation.
- **Create capability-independent context** — the same Normalized Workspace Context can feed any capability's own Context Selection step; it is not authored toward one capability's Request Contract.
- **Improve long-term maintainability** — one place (the Workspace Context Builder) is responsible for correctly representing Workspace state, rather than that responsibility being re-derived inside every Feature that needs it.

**Explicitly deferred, not decided here:** the concrete serialization format, any summarization algorithm, compression heuristics, and token thresholds are implementation decisions, not architectural ones — see [Context Budget](./02_provider_independence_and_configuration.md#context-budget) for the ownership (not the mechanism) of budget-related concerns, and the Workspace Context Builder's own eventual implementation for the rest.

No stage above reassigns an existing row's owner. "Normalized Workspace Context" and "Capability Request" name an already-existing Feature-owned transformation as two explicit steps instead of one, because the Workspace Context Builder now sits before the Feature's own Context Selection judgment is applied, where previously that boundary was implicit.

## How a New Capability Uses This Table

Every AI Capability specification under [`capabilities/`](./capabilities/000_index.md) is written against this same ownership split — a capability spec does not reassign any row above, and does not restate the split inline; it references this document.

When a new Capability's Context Selection step needs an artifact not yet part of Normalized Workspace Context, see [Workspace Context Builder](../workspace/01_architecture.md#context-eligibility-rules)'s Context Eligibility Rules for the promotion discipline that governs adding it — demand-driven, not automatic, and never a change to this document's ownership rows.

## Capability Matrix

*(Permanent reference — every AI Capability's Read Context and Write Target, in one place, so a future Capability's design is checked against this table rather than re-derived. Grows by one row per capability; this document's own ownership rows above are never restated or overridden by it.)*

| Capability | Read Context | Write Target |
|---|---|---|
| [Canvas Assistant](./capabilities/01_canvas_assistant.md) | Project name (seed only, when Canvas is empty), Canvas (own field + prior answers) | Canvas (one field) |
| [Risk Memo Assistant](./capabilities/02_risk_memo_assistant.md) | Canvas | Risk Memo (one of three fields) |
| [MVP Planning Assistant](./capabilities/03_mvp_planning_assistant.md) | Canvas, Risk Memo | MVP Scope (statement field) |
| [Validation Planning Assistant](./capabilities/04_validation_planning_assistant.md) | Canvas, Risk Memo, MVP Scope | New-assumption draft field |

Every row's Read Context beyond Canvas exists only because a real Capability's own Context Selection step needed it, per [Context Eligibility Rules](../workspace/01_architecture.md#context-eligibility-rules) — never added speculatively ahead of an implemented Capability. A future structured Feature (GTM Planning, Pricing, Launch, Growth Experiments, Analytics, Customer Interview Planning) adds its own row here the same way, following [Future Expansion Strategy](../context/06_future_expansion_strategy.md#future-ready-architecture-principle)'s 4th and 5th principles — no new architecture decision is required per row.
