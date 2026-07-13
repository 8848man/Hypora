# Analytics Platform Architecture

**Refs:** → [00_index](../00_index.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [Future Expansion Strategy](../context/06_future_expansion_strategy.md) · [Ownership Map](../rules/ownership.md) · [ADR-0013](../architecture/decisions/ADR-0013-analytics-provider-independence.md) · [AI Platform Architecture](../ai/01_architecture.md) · [Event Model](./02_event_model.md) · [Provider Independence](./03_provider_independence.md) · [Event Catalog](./04_event_catalog.md)

Created ahead of any real Analytics code, per the SDD Framework's "spec leads implementation" principle — the same allowance already exercised for [Workspace Architecture](../workspace/01_architecture.md) and [AI Platform Architecture](../ai/01_architecture.md). This document mirrors that AI Platform's own architecture shape deliberately, per [ADR-0013](../architecture/decisions/ADR-0013-analytics-provider-independence.md), since both solve the same underlying problem — a Feature-facing capability whose backing vendor must be swappable without touching Feature code — for two different concerns. It does not redesign anything AI Platform already decided; it applies the same philosophy to a new capability. Both are confirmed instances of the same named **Platform Service** role — see [Platform Services](../architecture/01_platform_services.md) and [ADR-0014](../architecture/decisions/ADR-0014-platform-services-architectural-role.md).

## Purpose

Give Workspace Features, and the AI Platform's own capabilities, a single, stable way to record that a meaningful event occurred — without any of them knowing or caring which analytics backend stores it. Firebase Firestore is the first backend, chosen for being lightweight and already suitable for the current MVP stage — never a permanent architectural dependency, per [ADR-0013](../architecture/decisions/ADR-0013-analytics-provider-independence.md).

## Responsibilities

**In scope for the Analytics Platform:**
- Defining the Event Model: the single, stable, provider-independent shape every event conforms to, regardless of category (see [Event Model](./02_event_model.md)).
- Owning the Analytics Provider Interface, the provider independence guarantee, and provider configuration scoping (see [Provider Independence](./03_provider_independence.md)).
- Hosting the single authoritative Event Catalog every Feature and AI Capability references rather than redefines (see [Event Catalog](./04_event_catalog.md)).
- Defining the official strategy for migrating from one Analytics Provider to another (see [Migration Strategy](./05_migration_strategy.md)).

**Explicitly NOT part of the Analytics Platform:**
- **The AI Platform itself** — an Analytics Event may be emitted around an AI Capability invocation (e.g., `ai_request_sent`), but the Analytics Platform never becomes a second AI integration layer, and the AI Platform never depends on Analytics to function. The two are independent Platform API capabilities that compose, mirroring the existing AI/Search boundary established by [ADR-0010](../architecture/decisions/ADR-0010-search-as-independent-platform-capability.md).
- **Product usage dashboards, reporting, or analysis tooling** — this domain owns getting an event safely and consistently into storage; what a human or a future internal tool does with stored events is out of scope, the same way the AI Platform owns getting a prompt to a provider and back, not what a Feature does with the resulting suggestion.
- **Workspace's own UI, screens, or Feature-specific business logic** — a Feature decides *when* to emit an event and *what* properties to attach (business judgment); it never decides *how* that event is stored.
- **Feature History** (per [MVP Planning](../workspace/features/03_mvp_planning.md#history)) — a distinct, Workspace-owned, per-Project, user-visible record of Feature Plan changes. An analytics event may be emitted alongside a History event being recorded, but neither owns or implies the other; conflating them would put user-visible product data behind the same provider-swap risk this domain exists to isolate.
- **Platform API's other capabilities** (Authentication, Projects, AI, Search, Integrations) — each remains owned by [Application Responsibilities](../context/05_application_responsibilities.md#platform-api) until promoted to its own directory; this domain owns Analytics only.

## Tracking Model

```
Workspace Feature / AI Capability
     │  (emits a named Event, per the Event Catalog)
     ▼
Analytics Service              — the shared runtime behind every event (mirrors AI Application Service)
     │  (validates against the Event Model, normalizes the envelope)
     ▼
Event Model                    — the stable, provider-independent domain shape (see 02_event_model.md)
     │
     ▼
Analytics Provider Interface   — unified contract each Provider implements
     │
     ▼
Analytics Provider (Firestore first; PostgreSQL, ClickHouse, BigQuery, Mixpanel, Segment, Mock later)
     │
     ▼
Storage
```

This differs from the AI Platform's Capability Model in one structural way, worth stating rather than silently mirroring: the AI Platform grows by *adding new named Capabilities* (one contract per Feature need, catalogued under [`ai/capabilities/`](../ai/capabilities/000_index.md)), because each AI Capability's Request/Response shape genuinely diverges, per the Capability Promotion Rules. Analytics events share **one** stable envelope (the Event Model) across every category; what varies is only the `eventName` and `properties` values, not the contract shape itself. Analytics therefore does not need a `capabilities/`-style subdirectory of per-event contract files — it needs a single Event Model plus a catalog of valid `eventName` values.

## Responsibility Split

| Responsibility | Owner |
|---|---|
| Deciding *when* to emit an event, and which `eventName`/`properties` to attach | The emitting Feature or AI Capability (business judgment) |
| Validating an emitted event against the Event Model's required fields and the Event Catalog's known `eventName` values | Analytics Service |
| Normalizing the envelope (assigning `eventId`/`timestamp` if not already supplied, attaching the current `sessionId`) | Analytics Service |
| Mapping the normalized event into a specific Provider's persistence format (a Firestore document, a Postgres row, a ClickHouse insert, …) | Analytics Provider |
| Wire-level delivery, batching, retry | Analytics Provider |

This mirrors [AI Platform](../ai/01_architecture.md)'s own Feature-vs-Service-vs-Provider split (per [ADR-0008](../architecture/decisions/ADR-0008-ai-platform-ownership-model.md)), simplified to two layers below the emitting call site instead of three, because an Analytics Event carries no prompt/context lifecycle to split — only a single envelope to validate, normalize, and persist.

## Localization

Event names and `properties` keys are internal, developer-facing identifiers — never user-facing presentation content, and therefore never subject to [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md)'s content-identity/presentation-content split. If a `properties` value ever captures user-facing text, it is recorded as already-current data exactly as it exists in `project` at that moment — this domain introduces no second localization mechanism.
