# Platform API Architecture

**Refs:** → [00_index](./00_index.md) · [sdd/00_index](../00_index.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [AI Platform Architecture](../ai/01_architecture.md) · [Analytics Architecture](../analytics/01_architecture.md) · [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md) · [ADR-0025](../architecture/decisions/ADR-0025-account-authentication-and-one-directional-migration.md) · [ADR-0026](../architecture/decisions/ADR-0026-workspace-app-shell-for-account-navigation.md)

Created per [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md), which fired this directory's promotion trigger (`sdd/00_index.md`'s "Not Yet Created" table — a real backend capability beyond the AI capability, or Authentication/Search/Integrations becoming real). This document does not redesign anything ADR-0024 already decided; it records the current, standing shape of Platform API as a whole, mirroring how [AI Platform Architecture](../ai/01_architecture.md) and [Analytics Architecture](../analytics/01_architecture.md) each already document their own Platform Service.

## Purpose

*(By reference)* — Platform API is the Application named in [Application Responsibilities](../context/05_application_responsibilities.md#platform-api)'s Product Architecture. This document owns *how* its capabilities are structured once real, not *what* Platform API is for (owned by that document, never restated here).

## Current Capability Status

This table is the single place that summarizes cross-capability status; per-capability detail is owned by each capability's own spec area, never restated here (Duplication Rule, `sdd/rules/spec_authoring_rules.md`).

| Capability | Status | Owning spec |
|---|---|---|
| AI | Implemented — real backend (Vercel serverless functions) | [`sdd/ai/`](../ai/01_architecture.md) |
| Analytics | Implemented — write path + internal Dashboard read path | [`sdd/analytics/`](../analytics/01_architecture.md) |
| Projects | **Partially implemented** — an anonymous/signed-out caller still reads/writes LocalStorage synchronously (backed up to Firestore in the background); a linked/signed-in caller reads/writes Firestore directly instead, per [ADR-0025](../architecture/decisions/ADR-0025-account-authentication-and-one-directional-migration.md) (building on [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md)). No cross-device sync for two devices that both used the product *before* either logged in — see ADR-0025's own accepted trade-offs. | This document, `## Projects` below |
| Authentication | **Partially implemented** — Anonymous Authentication (per-device identity, [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md)) and email/password sign-up/sign-in with anonymous-to-real upgrade ([ADR-0025](../architecture/decisions/ADR-0025-account-authentication-and-one-directional-migration.md)) both exist. Still not the general, multi-user Authentication capability in full (no password reset, no additional providers, no admin-side user management). | This document, `## Authentication` below |
| Search | Not implemented | [Application Responsibilities](../context/05_application_responsibilities.md#platform-api) |
| Integrations | Not implemented | [Application Responsibilities](../context/05_application_responsibilities.md#platform-api) |

**Distinguishing current vs. future is mandatory for every fact recorded here** — the same rule [Application Responsibilities](../context/05_application_responsibilities.md) already states for its own capability table applies identically to this one.

## Projects

`src/platform/storage.ts` (per [Frontend Architecture](../frontend/01_architecture.md)'s LocalStorage Ownership rule) is dual-mode, routing on the current Firebase Auth user per request:

- **Anonymous/signed-out:** unchanged from [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md) — `window.localStorage` is the source of truth; every save also fires a best-effort, non-blocking Firestore backup.
- **Linked/signed-in:** per [ADR-0025](../architecture/decisions/ADR-0025-account-authentication-and-one-directional-migration.md) — Firestore is the source of truth directly; reads and writes are awaited, errors propagate rather than being swallowed.
- **Migration (sign-in/link time only):** every LocalStorage Project is written to the now-current account's Firestore store, one-directional (LocalStorage always wins on conflict), per-Project confirm-then-delete (never deletes a LocalStorage Project ahead of its own confirmed Firestore write).
- Both modes go through `src/platform/persistence/projectCloudSync.ts` — the sole file in this codebase permitted to read or write Project data to/from Firestore, mirroring the existing one-file-per-Firestore-concern convention Analytics already established (`FirebaseEventTracker`, `FirebaseAnalyticsRepository`).
- **Document shape:** one Firestore document per Project, at `users/{uid}/projects/{projectId}`, containing the same `Project` shape already defined in `src/domain/types.ts` — no second schema, unchanged by ADR-0025.

## Authentication

Three independent, narrow uses of Firebase Authentication exist in this codebase — none is the general, multi-user Authentication capability in full, and none accelerates or substitutes for the parts still missing (password reset, additional providers, admin-side user management):

| Use | Scope | Governing ADR |
|---|---|---|
| Internal Analytics Dashboard login | A hardcoded allowlist of internal operators, email/password sign-in | [ADR-0015](../architecture/decisions/ADR-0015-analytics-dashboard-access-boundary.md) |
| Per-device Project backup identity | Anonymous sign-in only, one stable `uid` per browser profile | [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md) |
| Account sign-up/sign-in | Email/password, upgrading the existing Anonymous identity in place via `linkWithCredential` (preserving its uid and Firestore data) when possible, falling back to an ordinary sign-in when the email already belongs to an existing account | [ADR-0025](../architecture/decisions/ADR-0025-account-authentication-and-one-directional-migration.md) |

All three are implemented in `src/platform/auth/authService.ts` — the sole file in this codebase permitted to import `firebase/auth`.

## App Shell

Per [ADR-0026](../architecture/decisions/ADR-0026-workspace-app-shell-for-account-navigation.md): account/login UI (and the Language Switcher, consolidated here) lives in `src/layout/WorkspaceAppLayout.tsx`, the shared parent of every Workspace route — see [Frontend Architecture](../frontend/01_architecture.md#workspace-layout). A Workspace/frontend-layer concern, not a Platform API capability of its own; named here only because it is the UI surface for this document's Authentication capability above.

## What This Document Does Not Cover

- AI's own Capability Model, Provider Interface, or per-capability contracts — owned entirely by [`sdd/ai/`](../ai/01_architecture.md).
- Analytics' own Event Model, Provider Independence, or Query/Reporting — owned entirely by [`sdd/analytics/`](../analytics/01_architecture.md).
- Search and Integrations — not yet implemented; when either is promoted, it gets its own section here or its own directory, per the same "promote on real evidence" discipline this directory itself was just promoted under.
