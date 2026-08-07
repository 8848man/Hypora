# Platform API — Projects

**Refs:** → [00_index](./00_index.md) · [01_architecture](./01_architecture.md) · [Frontend Architecture](../frontend/01_architecture.md#localstorage-ownership) · [Workspace Data & State](../workspace/02_data_and_state.md) · [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md) · [ADR-0025](../architecture/decisions/ADR-0025-account-authentication-and-one-directional-migration.md)

Split out of [01_architecture.md](./01_architecture.md) once its Projects section grew past a summary paragraph — mirrors why Analytics splits `02_event_model.md` etc. out of its own `01_architecture.md` rather than growing one document indefinitely. Owns the current, standing shape of the Projects capability only; the decisions themselves (why dual-mode, why one-directional migration) live in [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md) and [ADR-0025](../architecture/decisions/ADR-0025-account-authentication-and-one-directional-migration.md) and are not re-derived here.

## Dual-Mode Access

`src/platform/storage.ts` (per [Frontend Architecture](../frontend/01_architecture.md#localstorage-ownership)'s LocalStorage Ownership rule — still the sole file permitted to call LocalStorage directly) routes on the current Firebase Auth user, per request:

| Caller state | Source of truth | Write behavior |
|---|---|---|
| Anonymous / signed-out | `window.localStorage` | Synchronous write; also fires a best-effort, non-blocking Firestore backup (never awaited, never surfaces a failure) |
| Linked / signed-in | Firestore, directly | Awaited; a failure propagates to the caller rather than being swallowed |

## Migration (Sign-In/Link Time Only)

Per [ADR-0025](../architecture/decisions/ADR-0025-account-authentication-and-one-directional-migration.md), triggered automatically on every successful sign-up/sign-in/account-link — no separate user confirmation step:

- **One-directional.** Every LocalStorage Project is written to the now-current account's Firestore store, unconditionally overwriting whatever (if anything) already exists there at the same id. No merge, no diff.
- **Per-Project confirm-then-delete.** A LocalStorage Project is removed only after its own Firestore write is confirmed successful — never ahead of it. A failure partway through a multi-Project migration leaves the remainder safely in LocalStorage, retried on the next migration.
- **No cross-device sync for pre-login usage.** Two devices that both used the product anonymously *before* either logged in do not merge — the device that logs in second overwrites the first device's already-synced data for any Project sharing an id (practically unreachable, since Project ids are locally generated random strings — see ADR-0025's own accepted trade-offs).

## Storage Shape

- Both modes go through `src/platform/persistence/projectCloudSync.ts` — the sole file in this codebase permitted to read or write Project data to/from Firestore, mirroring the existing one-file-per-Firestore-concern convention Analytics already established (`FirebaseEventTracker`, `FirebaseAnalyticsRepository`).
- One Firestore document per Project, at `users/{uid}/projects/{projectId}`, containing the same `Project` shape already defined in `src/domain/types.ts` — no second schema.

## What This Document Does Not Cover

- Why dual-mode, why one-directional migration, why per-Project confirm-then-delete — the reasoning and rejected alternatives live in [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md) and [ADR-0025](../architecture/decisions/ADR-0025-account-authentication-and-one-directional-migration.md), never re-derived here.
- The identity (Anonymous/account) this capability keys on — owned by [03_authentication.md](./03_authentication.md).
- Where login/account UI lives — owned by [Frontend Architecture](../frontend/01_architecture.md#workspace-layout), per [ADR-0026](../architecture/decisions/ADR-0026-workspace-app-shell-for-account-navigation.md).
