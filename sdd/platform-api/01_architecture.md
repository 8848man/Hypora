# Platform API Architecture

**Refs:** → [00_index](./00_index.md) · [sdd/00_index](../00_index.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [AI Platform Architecture](../ai/01_architecture.md) · [Analytics Architecture](../analytics/01_architecture.md) · [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md)

Created per [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md), which fired this directory's promotion trigger (`sdd/00_index.md`'s "Not Yet Created" table — a real backend capability beyond the AI capability, or Authentication/Search/Integrations becoming real). This document does not redesign anything ADR-0024 already decided; it records the current, standing shape of Platform API as a whole, mirroring how [AI Platform Architecture](../ai/01_architecture.md) and [Analytics Architecture](../analytics/01_architecture.md) each already document their own Platform Service.

## Purpose

*(By reference)* — Platform API is the Application named in [Application Responsibilities](../context/05_application_responsibilities.md#platform-api)'s Product Architecture. This document owns *how* its capabilities are structured once real, not *what* Platform API is for (owned by that document, never restated here).

## Current Capability Status

This table is the single place that summarizes cross-capability status; per-capability detail is owned by each capability's own spec area, never restated here (Duplication Rule, `sdd/rules/spec_authoring_rules.md`).

| Capability | Status | Owning spec |
|---|---|---|
| AI | Implemented — real backend (Vercel serverless functions) | [`sdd/ai/`](../ai/01_architecture.md) |
| Analytics | Implemented — write path + internal Dashboard read path | [`sdd/analytics/`](../analytics/01_architecture.md) |
| Projects | **Partially implemented** — LocalStorage remains the synchronous read/write source of truth; every save additionally backs up to Firestore in the background, per [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md). No read-from-backup path exists yet. | This document, `## Projects` below |
| Authentication | **Partially implemented** — Firebase Anonymous Authentication exists, scoped only to giving a browser profile a stable identity for the Projects backup above. The general, multi-user Authentication capability remains deferred. | This document, `## Authentication` below |
| Search | Not implemented | [Application Responsibilities](../context/05_application_responsibilities.md#platform-api) |
| Integrations | Not implemented | [Application Responsibilities](../context/05_application_responsibilities.md#platform-api) |

**Distinguishing current vs. future is mandatory for every fact recorded here** — the same rule [Application Responsibilities](../context/05_application_responsibilities.md) already states for its own capability table applies identically to this one.

## Projects

Per [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md):

- **Source of truth:** `window.localStorage`, accessed exclusively through `src/platform/storage.ts` (per [Frontend Architecture](../frontend/01_architecture.md)'s LocalStorage Ownership rule). This is unchanged by ADR-0024.
- **Backup:** `saveProject` additionally triggers a best-effort, non-blocking write to Firestore, through `src/platform/persistence/projectCloudSync.ts` — the sole file in this codebase permitted to write Project data to Firestore, mirroring the existing one-file-per-Firestore-concern convention Analytics already established (`FirebaseEventTracker`, `FirebaseAnalyticsRepository`).
- **Document shape:** one Firestore document per Project, at `users/{uid}/projects/{projectId}`, containing the same `Project` shape already defined in `src/domain/types.ts` — no second schema.
- **No read path yet.** Nothing in this codebase currently reads a Project back from Firestore; the backup exists for future recovery, not live sync. See ADR-0024's Migration Implications for the trigger that would add one.

## Authentication

Two independent, narrow uses of Firebase Authentication exist in this codebase — neither is the general, multi-user Authentication capability, and neither accelerates or substitutes for it:

| Use | Scope | Governing ADR |
|---|---|---|
| Internal Analytics Dashboard login | A hardcoded allowlist of internal operators, email/password sign-in | [ADR-0015](../architecture/decisions/ADR-0015-analytics-dashboard-access-boundary.md) |
| Per-device Project backup identity | Anonymous sign-in only, one stable `uid` per browser profile, never tied to a real account | [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md) |

Both are implemented in `src/platform/auth/authService.ts` — the sole file in this codebase permitted to import `firebase/auth`. A future general Authentication capability (real user accounts, sign-up/sign-in, linking an existing anonymous identity to a real one) is a distinct, not-yet-scoped promotion of this same file, not a reason to duplicate it elsewhere.

## What This Document Does Not Cover

- AI's own Capability Model, Provider Interface, or per-capability contracts — owned entirely by [`sdd/ai/`](../ai/01_architecture.md).
- Analytics' own Event Model, Provider Independence, or Query/Reporting — owned entirely by [`sdd/analytics/`](../analytics/01_architecture.md).
- Search and Integrations — not yet implemented; when either is promoted, it gets its own section here or its own directory, per the same "promote on real evidence" discipline this directory itself was just promoted under.
