# Analytics Event Model

**Refs:** → [00_index](../00_index.md) · [Analytics Platform Architecture](./01_architecture.md) · [Provider Independence](./03_provider_independence.md) · [Event Catalog](./04_event_catalog.md) · [ADR-0013](../architecture/decisions/ADR-0013-analytics-provider-independence.md)

Canonical owner of the single, stable, provider-independent shape every Analytics Event conforms to, per [ADR-0013](../architecture/decisions/ADR-0013-analytics-provider-independence.md). This is a **conceptual shape only** — field names and meaning, never a Firestore document schema, a Postgres table definition, or any other provider's native format. Mapping this shape into a specific provider's persistence format is that Provider's own responsibility, per [Provider Independence](./03_provider_independence.md).

## Purpose

Let every emitting call site (a Workspace Feature, an AI Capability) describe an event once, in one stable shape, regardless of which Analytics Provider is currently active. The Event Model must remain unchanged across a provider migration — see [Migration Strategy](./05_migration_strategy.md).

## Event Envelope

| Field | Required? | Meaning |
|---|---|---|
| `eventId` | Required | A unique identifier for this specific event occurrence, assigned by the Analytics Service if not already supplied by the emitting call site — never reused across two distinct occurrences |
| `eventName` | Required | One of the Event Catalog's known values (see [Event Catalog](./04_event_catalog.md)) — never an ad hoc string invented at the call site |
| `timestamp` | Required | When the event occurred, `YYYY-MM-DDTHH:mm:ss.sssZ` (ISO 8601, UTC) — assigned by the Analytics Service at the moment of emission if not already supplied |
| `sessionId` | Required | Identifies one continuous usage session, independent of `userId` — V1 has no Authentication (per [Application Responsibilities](../context/05_application_responsibilities.md#platform-api)), so a session is the only identity concept available until Authentication exists |
| `userId` | Optional | Absent in V1 (no Authentication yet); becomes available once Authentication is implemented, without changing this shape — an already-anticipated, not a speculative, field |
| `projectId` | Optional | The current Project's id, when the event occurred in the context of one — absent for Project-list-level or pre-Project events |
| `feature` | Optional | Which Workspace Feature the event belongs to — values drawn from the existing Feature Inventory ([Workspace Architecture](../workspace/01_architecture.md#feature-inventory-v1)), never a new, separately-invented vocabulary |
| `screen` | Optional | Which screen/section the event occurred on, within `feature` |
| `properties` | Optional | An open, event-specific key-value map — the only part of the envelope whose shape varies per `eventName`; see Extensibility below |

## Extensibility of `properties`

- `properties` is intentionally untyped at the Event Model level — each Event Catalog entry may document which keys it expects, but the Event Model itself does not enumerate them, so adding a new property to an existing event, or a new event with its own properties, is additive and never requires a change to this document.
- `properties` values must be primitive (string, number, boolean) or a flat structure of primitives — never a nested object requiring provider-specific serialization knowledge to interpret, which would leak a provider's own format expectations back into the domain model this document exists to keep stable.
- `properties` never carries a secret, credential, or full free-text user content (e.g., a whole Canvas answer) — an event records that something happened and light supporting detail, never a copy of the underlying product data itself, which remains owned exactly where it already is ([Workspace Data & State](../workspace/02_data_and_state.md)).

## Future: Contract Versioning

Not needed yet — no real Feature is implemented against any event's shape, so nothing here is "Stable" in the sense [AI Capability Contract Versioning](../ai/capabilities/000_index.md#contract-versioning) already defines. Once a real consumer exists, a breaking change to an event's `properties` shape is expected to follow that same Draft → Stable → Superseded discipline, not a new, separately-invented Analytics versioning scheme.

## What This Document Does Not Cover

- Which specific `eventName` values exist and what `properties` each expects — owned by [Event Catalog](./04_event_catalog.md).
- How a Provider maps this envelope into its own storage format — owned by [Provider Independence](./03_provider_independence.md) and each Provider's own (future, implementation-time) mapping.
- Validation/normalization mechanics (who assigns a missing `eventId`, etc.) — owned by [Analytics Platform Architecture](./01_architecture.md#responsibility-split).
