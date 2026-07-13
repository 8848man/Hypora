# Analytics Provider Independence & Configuration

**Refs:** → [00_index](../00_index.md) · [Analytics Platform Architecture](./01_architecture.md) · [Event Model](./02_event_model.md) · [ADR-0013](../architecture/decisions/ADR-0013-analytics-provider-independence.md) · [Provider Independence & Configuration (AI)](../ai/02_provider_independence_and_configuration.md) · [Infra Deployment](../infra/01_deployment.md)

Canonical owner of the Analytics Provider Interface's independence guarantee and provider configuration model, established by [ADR-0013](../architecture/decisions/ADR-0013-analytics-provider-independence.md). This document states the current, standing rule — it does not re-derive why it was chosen; see the ADR for that. Structured identically to the AI Platform's own [Provider Independence & Configuration](../ai/02_provider_independence_and_configuration.md), because both guarantee the same property (vendor swap without Feature-code change) for two different concerns — not because Analytics borrows AI's architecture, but because the same problem correctly has the same shape of answer twice.

## Purpose

Guarantee that Firebase Firestore (first), PostgreSQL (Prisma or Drizzle), ClickHouse, BigQuery, Mixpanel, Segment, or any future analytics backend can be added or swapped without changing Workspace Feature code, AI Capability code, or the Analytics Service. Firestore is an initial, lightweight-MVP choice — never a permanent dependency, per [ADR-0013](../architecture/decisions/ADR-0013-analytics-provider-independence.md).

## The Zero-Provider-Conditional Rule

No code outside a given Analytics Provider implementation may branch on provider identity. This applies to every Workspace Feature, every AI Capability, and the Analytics Service itself — none of them may be written in a way that requires naming Firestore, PostgreSQL, ClickHouse, BigQuery, Mixpanel, Segment, or any other vendor to function correctly. Identical in spirit to the AI Platform's own rule ([Provider Independence & Configuration (AI)](../ai/02_provider_independence_and_configuration.md#the-zero-provider-conditional-rule)), applied here to Analytics Providers.

## Provider Responsibilities

Each Analytics Provider owns, and the Analytics Service never duplicates:

| Responsibility | Why it must stay in Provider |
|---|---|
| Wire-level API/SDK communication, authentication | Vendor-specific by nature (Firestore's SDK, a Postgres connection, ClickHouse's insert protocol, and Mixpanel/Segment's HTTP API all differ completely) |
| Mapping the Event Model envelope into the provider's own persistence format | A Firestore document, a relational row, a columnar insert, and a third-party analytics API's own event shape are unrelated formats — this mapping is inherently provider-specific |
| Batching, flushing, and delivery retry mechanics | Each provider has its own throughput/latency characteristics and native batching support |
| Translating vendor-specific write/delivery failures into a unified failure taxonomy the Analytics Service can react to uniformly | Only the Provider layer has visibility into a vendor's native error shape — mirrors the AI Platform's own error-translation responsibility |

## Configuration Scoping

Configuration is scoped **per active Provider**, referenced by name from Analytics Service calls — simpler than the AI Platform's Provider × Capability scoping, because every event shares one Event Model rather than each needing its own tuning profile. A routing entry names which Provider implementation is currently active; it contains no runtime logic of its own.

## Credential Separation

Secrets (a Firestore service account key, a Postgres connection string, a Mixpanel/Segment API token) are never stored in Analytics configuration. Credentials are resolved through the same Credential Loader pattern already established for the AI Platform, referenced from configuration by name only — see [Infra Deployment](../infra/01_deployment.md) for how environment variables are actually provisioned once a real deployment exists for this capability.

## Minimum Abstraction

Deliberately the *minimum* guarantee, not the maximum — mirroring [ADR-0007](../architecture/decisions/ADR-0007-llm-provider-independence-and-encapsulation-boundary.md)'s own restraint:

**Not required by this architecture:**
- A dynamic, runtime-loadable provider plugin system.
- Automatic provider discovery.
- Simultaneous multi-provider writes as a permanent steady state — dual-write exists only as a *transitional* migration mechanism (see [Migration Strategy](./05_migration_strategy.md)), never a standing architecture.

Static, configuration-driven provider selection is sufficient until a real product need for more is identified — at which point that is a new, additive decision, not a reversal of this one.

## Analytics Provider Configuration Schema

| Field | Meaning | Required? |
|---|---|---|
| Provider identity | Which Provider implementation is active (e.g., "firestore," "postgres-prisma," "clickhouse," "mixpanel") — never a vendor SDK detail | Required |
| Secret reference | A symbolic reference the Credential Loader resolves at runtime — never the literal secret value | Required |
| Provider-specific configuration | Heterogeneous parameters that provider exposes (e.g., a Firestore collection path, a Postgres table name, a ClickHouse database) | Required, shape varies per Provider |
| Optional provider parameters | Parameters that may be omitted, falling back to a Provider-defined default | Optional |

## Mock Provider

A Mock Provider — recording events in-process without any real backend — is expected, mirroring the AI Platform's own `FakeProvider` precedent (used today for its verification scripts). Its role is proving the Analytics Service's own wiring and enabling tests/verification without a live backend dependency, never a production storage option.

## What This Document Does Not Cover

- The Event Model's own shape — owned by [Event Model](./02_event_model.md).
- Which `eventName` values exist — owned by [Event Catalog](./04_event_catalog.md).
- The procedure for actually migrating from one active Provider to another — owned by [Migration Strategy](./05_migration_strategy.md).
