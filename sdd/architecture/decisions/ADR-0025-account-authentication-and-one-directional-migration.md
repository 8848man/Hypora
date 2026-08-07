# ADR-0025: Account Authentication — One-Directional LocalStorage-to-Account Migration, Dual-Mode Storage

**Status:** Accepted
**Date:** 2026-08-08
**Affects specs:** [Platform API — Projects](../../platform-api/02_projects.md), [Platform API — Authentication](../../platform-api/03_authentication.md), [Workspace Data & State](../../workspace/02_data_and_state.md), [Frontend Architecture](../../frontend/01_architecture.md), [Application Responsibilities](../../context/05_application_responsibilities.md)
**Related ADRs:** [ADR-0024](./ADR-0024-project-data-durable-server-side-backup.md) (the Firestore backup and per-device Anonymous identity this ADR builds on and completes the read side of), [ADR-0015](./ADR-0015-analytics-dashboard-access-boundary.md) (the only prior use of Firebase Authentication's email/password sign-in, extended here for a second, distinct purpose)

## Context

[ADR-0024](./ADR-0024-project-data-durable-server-side-backup.md) deliberately stopped short of real login and a Firestore read path, scoping itself to a write-only, per-device backup and naming the trigger for going further: "a concrete UI need (a restore flow, or the general Authentication capability's own promotion)." That need is now concrete — this ADR is that promotion, decided together with its own scope boundary rather than left implicit.

This meets the ADR trigger list: it changes `storage.ts`'s public contract (per [Frontend Architecture](../../frontend/01_architecture.md)'s LocalStorage Ownership rule, the sole persistence-access module), is genuinely expensive to reverse once real accounts hold real data, and was chosen among real alternatives for both its migration policy and its storage-access shape.

## Options Considered

### Migration conflict policy

**Option A — One-directional, LocalStorage always wins.** On successful login/account-link, every Project currently in LocalStorage is written to the account's Firestore store, unconditionally overwriting whatever document (if any) already exists there at the same id. No diff, no merge, no user prompt.

**Option B — Field-level or timestamp-based merge.** Compare local and remote copies of a conflicting Project and merge or pick a winner per field or by recency.

**Decision: Option A**, explicitly declared, not left implicit. Project ids are locally generated random strings ([Workspace Data & State](../../workspace/02_data_and_state.md)), so an id colliding between two independently-generated devices is already vanishingly unlikely; the realistic collision case is the *same* device logging into the *same* account a second time (e.g., re-authenticating after a session expiry) — where "local wins" is also the correct behavior, since local IS that device's latest edit. Option B is rejected as solving a merge problem this product does not yet have concurrent-editing evidence for, per the project's own "don't build ahead of a concrete need" discipline — the same reasoning that kept ADR-0024 write-only until this ADR's own trigger arrived.

### Delete timing

**Option A — Delete each Project from LocalStorage only after its own Firestore write is confirmed.** Per-Project, not all-or-nothing: a network failure partway through a multi-Project migration leaves the already-confirmed Projects migrated and cleared, and the remainder still safely in LocalStorage, retried on the next login-triggered migration pass (idempotent, since Option A above always overwrites).

**Option B — Migrate all, then delete all, atomically.** Simpler to reason about as a single transaction, but a single failed write anywhere in the batch means either nothing is cleared (safe but means one flaky write blocks the whole migration from ever completing incrementally) or a retry re-uploads Projects that already succeeded (wasteful, though harmless given Option A's overwrite semantics above).

**Decision: Option A**, per-Project confirm-then-delete. Directly implements the requirement that the delete step must never run ahead of a confirmed successful write — the exact failure mode [ADR-0024](./ADR-0024-project-data-durable-server-side-backup.md) avoided by never deleting anything at all. A partially-migrated state is a valid, resumable state, not an error condition.

### Storage access shape after login

**Option A — `storage.ts`'s public API becomes `Promise`-returning, branching internally on the current Firebase Auth user's `isAnonymous` flag** (anonymous or signed-out → LocalStorage, exactly as today; linked/real account → Firestore, reading `users/{uid}/projects/*`).

**Option B — Keep `storage.ts` synchronous; add a parallel async module for the logged-in path, with call sites choosing which to call.**

**Decision: Option A.** [ADR-0024](./ADR-0024-project-data-durable-server-side-backup.md) previously deferred exactly this conversion (its own "Option 1") specifically because no concrete read need justified it yet and its blast radius was unscoped. That blast radius is now known and small — exactly three files (`storage.ts` itself, `useProject.ts`, `ProjectListPage.tsx`, per this project's own prior audit) — and Option B would leave two parallel, easy-to-miscall persistence paths permanently in the codebase, which is a worse long-term cost than a one-time, bounded async conversion. `storage.ts` remains the **only** file permitted to call LocalStorage directly *or* read/write a Project to Firestore — this ADR does not relax that boundary, it changes what's behind it depending on auth state.

## Decision

1. **Email/password authentication**, extending `src/platform/auth/authService.ts` (already the sole file permitted to import `firebase/auth`, per [ADR-0015](./ADR-0015-analytics-dashboard-access-boundary.md) and [ADR-0024](./ADR-0024-project-data-durable-server-side-backup.md)) with sign-up and sign-in functions distinct from that file's existing admin-login and anonymous-identity paths.
2. **Anonymous-to-real upgrade via `linkWithCredential`.** A signed-in-anonymously visitor who signs up keeps their existing `uid` (and therefore everything [ADR-0024](./ADR-0024-project-data-durable-server-side-backup.md) already backed up under it) — no separate "claim" step. If the credential already belongs to an existing account (`auth/credential-already-in-use`, the standard Firebase case of returning on a fresh anonymous session to sign into a pre-existing account), fall back to an ordinary sign-in against that existing account; migration (below) still runs, now targeting that account's `uid`.
3. **Migration runs automatically on every successful sign-up/sign-in/link**, per-Project, one-directional, confirm-then-delete — the two policies decided above. No user confirmation step gates it; the confirm-before-delete write ordering is the safety mechanism, not an added prompt.
4. **`storage.ts` becomes dual-mode and asynchronous.** `readProject`, `saveProject`, and `listProjects` return Promises; internally, each checks the current Firebase Auth user (`auth.currentUser`, `isAnonymous`) and routes to LocalStorage or Firestore accordingly. `useProject.ts` and `ProjectListPage.tsx` — the only two existing call sites — are updated to `await` accordingly; no other file is affected.
5. **Firestore Rules are unchanged.** [ADR-0024](./ADR-0024-project-data-durable-server-side-backup.md) already scoped `users/{uid}/projects/{projectId}` to `request.auth != null && request.auth.uid == uid`, which already covers a real (non-anonymous) authenticated user identically to an anonymous one — no new rule is needed for the read path this ADR adds.
6. **Still explicitly out of scope:** password reset, email verification, multi-provider sign-in (Google, etc.), and any UI for the login/account surface itself — the latter is [ADR-0026](./ADR-0026-workspace-app-shell-for-account-navigation.md)'s own decision, kept separate because it is a layout/navigation concern, not an authentication or persistence one.

## Consequences

**Positive:**
- Completes the read side [ADR-0024](./ADR-0024-project-data-durable-server-side-backup.md) deliberately deferred, using the exact seam that ADR left in place (`storage.ts` as the sole boundary) rather than introducing a new one.
- A returning, logged-in user on a second device now genuinely sees their Projects — the first real cross-device capability this product has.
- Per-Project confirm-then-delete means a flaky connection during migration degrades to "some Projects migrated, rest retried next login," never to data loss.

**Negative / accepted trade-offs:**
- `storage.ts`'s async conversion is a breaking change to its own contract, even though contained to two call sites — both are updated in this same task, never left half-migrated.
- One-directional/local-wins is a real, accepted data-loss edge case in the narrow scenario of the same account being used with meaningfully different, non-overlapping Project sets on two devices *before* either has ever logged in (the second device's login silently overwrites the first device's already-synced copy of any Project sharing an id — practically unreachable given locally-generated ids, per the Migration conflict policy discussion above, but named here for completeness).
- No restore/undo UI exists for a user who regrets having migrated (e.g., wants their pre-login LocalStorage state back) — LocalStorage is cleared, not archived. Accepted as consistent with this being an explicit, user-initiated action (signing in), not a background/automatic data change.

## Rejected Alternatives

| Alternative | Why rejected |
|---|---|
| Field-level/timestamp merge on migration conflict | Solves a concurrent-multi-device-before-login problem with no current evidence of occurring, at real implementation cost; revisit if real users report it |
| All-or-nothing atomic migration | Less resilient to partial network failure than per-Project confirm-then-delete, for no real benefit given the chosen overwrite policy is already idempotent on retry |
| A parallel async persistence module, `storage.ts` left synchronous | Leaves two ways to persist a Project permanently in the codebase instead of one bounded conversion; the very blast-radius concern that justified deferring this in ADR-0024 turns out to be small (3 files) once actually audited |
| A confirmation prompt before migration ("import your local data?") | Not requested by this task's scope, and adds a UI decision (ADR-0026's territory) to what is fundamentally a persistence/auth decision; the write-then-delete ordering already provides the actual safety property needed |

## Migration Implications

A future move away from one-directional/local-wins (e.g., to support genuine concurrent multi-device editing before login) requires a new ADR superseding this one's Migration conflict policy specifically — it does not require revisiting the delete-timing or storage-shape decisions, which are independent. Password reset, email verification, and additional sign-in providers are each additive to `authService.ts`'s existing shape and do not require a new ADR unless one meets the trigger list independently (e.g., a genuinely new identity-linking edge case).
