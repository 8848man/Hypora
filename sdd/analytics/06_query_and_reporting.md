# Analytics Query & Reporting (Dashboard)

**Refs:** → [00_index](../00_index.md) · [Analytics Platform Architecture](./01_architecture.md) · [Event Model](./02_event_model.md) · [Provider Independence](./03_provider_independence.md) · [Event Catalog](./04_event_catalog.md) · [ADR-0013](../architecture/decisions/ADR-0013-analytics-provider-independence.md) · [ADR-0015](../architecture/decisions/ADR-0015-analytics-dashboard-access-boundary.md) · [Platform Services](../architecture/01_platform_services.md) · [Application Responsibilities](../context/05_application_responsibilities.md)

Canonical owner of the **read path** into stored Analytics Events — an internal Analytics Dashboard for inspecting product usage and MVP validation signal, per [Ownership Map](../rules/ownership.md)'s Analytics row. This document does not redefine anything [Analytics Platform Architecture](./01_architecture.md), [Event Model](./02_event_model.md), or [Provider Independence](./03_provider_independence.md) already own — the Event Model, the write-side Provider Interface, and Firestore's role as canonical store are unchanged. This is a new, additive sibling concern: how an already-stored event is queried back, by whom, and through what boundary.

## Problem Statement

Events are being written successfully (Firestore, per ADR-0013), but the only way to inspect them today is the Firestore Console — not usable for routine product-validation review, and not something every team member should need direct database access for. An internal dashboard is needed to answer "how many people saw Landing, clicked through, and started Workspace" without granting broad Firestore access to anyone who needs the answer.

## Goals

- Let an internal operator view Landing→Workspace conversion, a recent event timeline, and per-event detail, without touching the Firestore Console.
- Introduce a read path that is symmetric in spirit to the existing write path: provider-independent, with no Feature or dashboard component ever depending on Firestore's SDK directly.
- Keep Firestore as the sole canonical source the dashboard ever reads from.

## Non-Goals

- **Not a product-facing Feature.** The dashboard is an internal operations tool, not a Workspace Feature, not part of the Landing/Workspace user experience, and not localized per [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md) — it has no end-user audience.
- **Not a general Authentication system.** [Application Responsibilities](../context/05_application_responsibilities.md#platform-api) already lists Authentication as "Not implemented ... required once Workspace moves beyond single-browser, single-user persistence" — that is a future, multi-user, product-facing capability. This document's Authentication Boundary (below) is a narrower, internal-operator-only concern and must not be conflated with, and does not require or accelerate, that future capability.
- **Not a GA4 reporting replacement.** GA4 already has its own dashboards (Firebase Analytics DebugView, Google Analytics Realtime/reporting UI) for marketing use, per [Provider Independence](./03_provider_independence.md#firebase-analytics-ga4--a-non-portable-reporting-sink-not-a-provider). This internal dashboard exists for product-validation questions GA4 cannot answer against this project's own Event Model, not to duplicate GA4's own UI.
- **Not real-time streaming analytics, cohort/retention analysis, or a data warehouse.** Query, aggregate, and display what Firestore already holds — nothing here builds a second storage or processing layer.

## Architecture

Two independent paths share the same Event Model and the same Firestore instance, but never share code:

```
Write path (unchanged, per 01_architecture.md):

Landing / Workspace Feature / AI Capability
     │  trackEvent()
     ▼
Analytics Service
     │
     ▼
EventTracker Interface  ──▶  FirebaseEventTracker  ──▶  Firestore (create-only)


Read path (new, this document):

Analytics Dashboard
     │  (a query request: time range, eventName filter, funnel definition)
     ▼
Analytics Query Service
     │  (aggregation, filtering, funnel calculation — provider-independent)
     ▼
Analytics Repository Interface
     │
     ▼
Firebase Analytics Repository  ──▶  Firestore (read-only)
```

The two paths never call into each other. The Dashboard never imports `EventTracker`, any Provider, or the Firebase SDK; a Feature emitting events never imports the Query Service or Repository. They meet only at Firestore itself, and only because it is the one canonical store both sides agree on ([Event Model](./02_event_model.md#event-storage-ownership)).

## Component Responsibilities

### Analytics Dashboard

**Owns:** presentation only — Overview metrics, Event Timeline, Funnel Analysis, Event Detail (see Dashboard Scope below). Requests data from the Analytics Query Service by calling its query operations; never assembles a query against Firestore's own query language, never knows a collection path or document shape exists.

**Must never:** read from GA4 as a data source; import the Firebase SDK, `EventTracker`, or any Provider directly; encode Feature-specific business rules (e.g., "a Business Structuring session that took longer than 10 minutes is at-risk") — such judgments belong to a future product-intelligence capability consuming the same read path, never hardcoded into dashboard presentation code.

### Analytics Query Service

**Owns:** the read-side equivalent of the existing Analytics Service — event aggregation (counts, unique `sessionId`/`anonymousUserId` counts), filtering (by `eventName`, time range, `pagePath`), funnel calculation (an ordered sequence of `eventName` steps, computing how many distinct sessions reached each step and the conversion rate between consecutive steps), and provider-independent querying — it calls the Analytics Repository Interface, never a concrete Repository, mirroring how the write-side Analytics Service calls `EventTracker`, never a concrete Provider ([Analytics Platform Architecture](./01_architecture.md#responsibility-split)).

**Must never:** own presentation formatting (chart shape, table layout — Dashboard's job); own a second copy of the Event Catalog's `eventName` vocabulary (references [Event Catalog](./04_event_catalog.md), same as the write side).

### Analytics Repository Interface

**Owns:** the read-side equivalent of the Analytics Provider Interface — a stable, provider-independent contract for retrieving already-stored events (by time range, `eventName`, or both), returning them in the Event Model's own envelope shape ([Event Model](./02_event_model.md#event-envelope)), never a provider-native document/row/shape. The [Zero-Provider-Conditional Rule](./03_provider_independence.md#the-zero-provider-conditional-rule) applies identically here: no code outside a concrete Repository implementation may branch on which backend is active.

**Must never:** perform aggregation or funnel math itself (Query Service's job — the Repository returns raw matching events, nothing more); leak a provider-specific query mechanism (a Firestore composite index requirement, a SQL `WHERE` clause) into its own method signatures.

### Firebase Analytics Repository

**Owns:** Firestore-specific querying only — translating the Repository Interface's time-range/`eventName` parameters into Firestore query mechanics (`where`, `orderBy`, pagination), and mapping each returned document back into the Event Model envelope, stripping the write-side's own `schemaVersion` stamp (or exposing it as read-only metadata — implementation detail, decided when this Repository is actually built). Reuses the same shared Firebase App instance ([`firebaseApp.ts`](../../app/src/platform/analytics/firebaseApp.ts)) the write-side `FirebaseEventTracker` and GA4 Reporter already share — the read path introduces no second Firebase App initialization.

## Data Flow

1. An internal operator opens the Dashboard and selects a view (Overview, Timeline, Funnel, Detail) and any filters (time range, specific event).
2. The Dashboard calls one Analytics Query Service operation (e.g., "compute this funnel over the last 7 days").
3. The Query Service calls the Analytics Repository Interface for the raw events its calculation needs (e.g., every `landing_page_view`/`cta_clicked`/`workspace_started` in range).
4. The Firebase Analytics Repository issues the actual Firestore query, maps results into Event Model envelopes, and returns them.
5. The Query Service aggregates/computes (counts, funnel conversion) and returns a result shape to the Dashboard; the Dashboard only renders it.

## Query Model

Three query shapes cover the MVP scope below — no others are needed yet:

| Query | Input | Output |
|---|---|---|
| Aggregate count | `eventName` (or list), time range | A count, plus a distinct-session count (for "how many visitors," not "how many events") |
| Timeline | time range, optional `eventName` filter, pagination cursor | A time-ordered list of Event Model envelopes |
| Funnel | an ordered list of `eventName` steps, time range | Per-step counts of distinct sessions reaching that step, and conversion percentage between consecutive steps |

A funnel is **configuration, not code** — the Funnel Analysis view accepts an ordered `eventName` array and renders whatever steps it's given; adding a future funnel (e.g., `template_selected → signup_started`, once that UI exists per [Event Catalog](./04_event_catalog.md#landing)) is a new configuration value, never a new dashboard component.

## Dashboard Scope (MVP)

- **Overview:** Landing page views, CTA clicks, Workspace starts, and the derived conversion rate — the `landing_page_view → cta_clicked → workspace_started` funnel, using the Funnel query above.
- **Event Timeline:** timestamp, event name, page, `properties.placement`/`source` (whichever the event carries), session identifier — a Timeline query, most-recent-first.
- **Funnel Analysis:** the Query Model's Funnel query, initially seeded with the Overview's own three-step funnel; the same mechanism supports any future funnel without new dashboard architecture.
- **Event Detail:** the full Event Model envelope and `properties` for one selected event — direct passthrough of a single Timeline result, no additional query needed.

## Authentication Boundary

**Resolved by [ADR-0015](../architecture/decisions/ADR-0015-analytics-dashboard-access-boundary.md).** The Dashboard ships inside the existing single Vercel deployment ([ADR-0003](../architecture/decisions/ADR-0003-single-v1-deployment-target.md)), gated by Firebase Authentication with Firestore Security Rules restricting reads to a small, fixed allowlist of internal operators — never `allow read: if true`, and never conditioned on anything other than the authenticated identity. The Firestore rules deployed for the write path (`app/firestore.rules`) currently deny all reads outright and must be updated, at implementation time, to permit reads under exactly that condition. This is a narrow, internal-operator-only login, distinct from and not a substitute for the general, still-deferred, multi-user Authentication Platform API capability ([Application Responsibilities](../context/05_application_responsibilities.md#platform-api)).

## Migration Considerations

The Repository Interface is swappable exactly like the Provider Interface: adding a future backend (PostgreSQL, ClickHouse, BigQuery — same candidates as [Migration Strategy](./05_migration_strategy.md#strategy)) means implementing a new Repository and pointing the Query Service's own composition root at it — no change to the Query Service, Dashboard, or Event Model. A read-side migration follows the same five-stage discipline as [Migration Strategy](./05_migration_strategy.md) (Single → Dual → Dual Write is write-path-only, but Dual Provider verification and Read Switch apply directly to a Repository swap) — this document does not restate that procedure, only confirms it applies symmetrically.

## Future Extension Points

- Additional funnels are configuration (an `eventName` array), never new components, per Query Model above.
- A future product-intelligence capability (e.g., an AI Capability summarizing validation signal) consumes the same Analytics Query Service the Dashboard does — it must not gain its own, separate read path into Firestore.
- Cohort/retention-style queries, if ever needed, are a new Query Service operation against the existing Repository Interface, not a new architectural layer.

## What This Document Does Not Cover

- The Event Model's own shape, or which `eventName` values exist — owned by [Event Model](./02_event_model.md) and [Event Catalog](./04_event_catalog.md), unchanged by this document.
- The write path itself — owned entirely by [Analytics Platform Architecture](./01_architecture.md); this document only reads what that path writes.
- The specific allowlist mechanism (which sign-in method, how operators are added/removed) — [ADR-0015](../architecture/decisions/ADR-0015-analytics-dashboard-access-boundary.md) decides the deployment/access boundary only, per that ADR's own scope.
- Dashboard visual design, chart library choice, or any implementation detail — this is a specification of responsibilities and boundaries, not an implementation.
