# AI Platform Ownership Model

**Refs:** → [00_index](../00_index.md) · [AI Platform Architecture](./01_architecture.md) · [Provider Independence & Configuration](./02_provider_independence_and_configuration.md) · [ADR-0008](../architecture/decisions/ADR-0008-ai-platform-ownership-model.md) · [Workspace Data & State](../workspace/02_data_and_state.md)

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
| Context creation (gathering Workspace/Canvas data, current question, previous answers, user preferences) | Feature | Workspace already owns this data per [Workspace Data & State](../workspace/02_data_and_state.md) |
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

## How a New Capability Uses This Table

Every AI Capability specification under [`capabilities/`](./capabilities/000_index.md) is written against this same ownership split — a capability spec does not reassign any row above, and does not restate the split inline; it references this document.
