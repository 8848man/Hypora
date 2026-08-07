# ADR-0024: Project Data Gets a Durable, Server-Side Backup — Firestore Write-Through, Per-Device Identity, Cross-Device Sync Explicitly Deferred

**Status:** Accepted
**Date:** 2026-08-07
**Affects specs:** [Application Responsibilities](../../context/05_application_responsibilities.md), [Workspace Data & State](../../workspace/02_data_and_state.md), [Frontend Architecture](../../frontend/01_architecture.md), Platform API Architecture (new, `sdd/platform-api/`)
**Related ADRs:** [ADR-0007](./ADR-0007-llm-provider-independence-and-encapsulation-boundary.md) / [ADR-0013](./ADR-0013-analytics-provider-independence.md) (the Provider/Repository Interface pattern this decision reuses for a third concern), [ADR-0015](./ADR-0015-analytics-dashboard-access-boundary.md) (the only prior use of Firebase Authentication in this codebase, extended here for a different purpose)

## Context

Every Project's data (Business Canvas, Risk Memo, MVP Scope, Validation Checklist) persists exclusively via `window.localStorage` ([Workspace Data & State](../../workspace/02_data_and_state.md), `src/platform/storage.ts`). This has one real, already-realized failure mode: LocalStorage is cleared by a browser's "clear site data," private-browsing session end, storage-pressure eviction, or a user switching browsers/devices — any of which is unrecoverable data loss today, with no server-side copy to recover from.

The Platform API capability table ([Application Responsibilities](../../context/05_application_responsibilities.md#platform-api)) already names this precisely: **Projects — "Implemented via LocalStorage" → future: "Same conceptual API surface, backed by a real service instead of the browser."** This ADR is that promotion.

**What this ADR deliberately does not solve:** true multi-device sync (open the same Project from a different browser/device and see the same data) requires knowing *which* device/browser belongs to *which* user — that is the general, still-deferred, multi-user Authentication Platform API capability, not something this ADR can responsibly build ahead of it (the same restraint [ADR-0015](./ADR-0015-analytics-dashboard-access-boundary.md) already applied: build the narrow thing the current need justifies, not the general capability it resembles). What this ADR *does* solve is durability — data survives LocalStorage being cleared, recoverable back to the same browser profile via Firebase Anonymous Authentication's persisted identity. This is a real, meaningful improvement over today, honestly scoped short of the reviewer feedback's literal "device-to-device sync" framing.

This meets the ADR trigger list: spans Workspace (the consuming Feature) and the not-yet-promoted Platform API area, is expensive to reverse once real Project data depends on the chosen document shape, and was chosen among genuinely different alternatives.

## Options Considered

### Option 1 — Full synchronous migration: Firestore becomes the read/write source of truth, LocalStorage becomes a cache

Every `storage.ts` function (`readProject`, `saveProject`, `listProjects`) becomes `Promise`-returning, calling Firestore directly, with LocalStorage as an offline fallback layer underneath.

**Trade-offs:** The architecturally "correct" end state — Firestore genuinely becomes the source of truth, not just a backup. But it changes `storage.ts`'s public contract from synchronous to asynchronous, rippling into every call site that currently calls these functions synchronously inside a React render or event handler (`useProject.ts`'s loader/update, `ProjectListPage.tsx`'s create/archive/onboarding-preset flow) — a wide-blast-radius refactor with real regression risk, for a synchronous UX (instant local save-on-blur, per [Workspace Data & State](../../workspace/02_data_and_state.md)) that would need to be carefully preserved through a new loading/optimistic-update layer. Rejected **for now** as disproportionate to the actual problem (durability, not "Firestore-as-source-of-truth") — see Migration Implications for when this becomes the right call.

### Option 2 — Durable write-through backup, LocalStorage remains the synchronous source of truth for reads

`storage.ts`'s public API is unchanged (still synchronous, zero call-site changes). `saveProject` gains one addition: after the existing synchronous LocalStorage write succeeds, it fires a **best-effort, non-blocking** write to Firestore in the background — never awaited, never able to throw into the caller, never able to slow down or fail the existing save. Firestore becomes a durable backup a user can be restored from later (a future "restore my data" flow, explicitly out of this ADR's scope), not yet a live read path.

**Trade-offs:** Solves exactly the durability problem this ADR exists for, with a minimal, low-risk diff — no existing call site changes, no new loading states, no risk of a slow/offline Firestore write blocking the instant-save UX. Does not yet give a "read from Firestore" path (a Project is not yet restorable through any UI in this ADR — that is real future work, not a regression, since no such path exists today either). Same Repository Interface seam as Option 1 underneath, so upgrading to Option 1 later is additive, not a rewrite.

### Option 3 — Do nothing until real user reports of data loss accumulate

**Trade-offs:** Zero implementation cost now. Rejected — the failure mode is not hypothetical (LocalStorage clearing is a routine browser/user action, not an edge case), Firestore is already provisioned and reachable at zero marginal infrastructure cost ([ADR-0013](./ADR-0013-analytics-provider-independence.md)), and the reviewer feedback this ADR responds to already identifies it as a real gap against a stated requirement.

## Decision

**Adopt Option 2.** Every Project save durably backs up to Firestore in the background; LocalStorage remains the synchronous, unchanged source of truth for every existing read/write call site.

Specifically:
1. **Repository seam, not an inline Firestore call.** A new, single file — `src/platform/persistence/projectCloudSync.ts` — is the only file in this codebase permitted to write Project data to Firestore, mirroring the existing convention (`FirebaseEventTracker`/`FirebaseAnalyticsRepository` are each the sole Firestore touchpoint for their own concern). `storage.ts` calls this module; no Workspace Feature or component ever imports Firestore directly, preserving the existing Cross-Application Boundary rule ("Workspace consumes Platform API's contract; Workspace does not reimplement persistence itself" — [Application Responsibilities](../../context/05_application_responsibilities.md)).
2. **Identity: Firebase Anonymous Authentication**, extending `src/platform/auth/authService.ts` (already the sole file permitted to import `firebase/auth`, per [ADR-0015](./ADR-0015-analytics-dashboard-access-boundary.md)) with an anonymous sign-in path distinct from that file's existing admin-login path. A first-run browser gets a stable, persisted anonymous `uid`; every Project backup for that browser profile is stored under `users/{uid}/projects/{projectId}`.
3. **Firestore Rules**: `users/{uid}/projects/{projectId}` permits read/write only when `request.auth != null && request.auth.uid == uid` — the same identity-conditioned enforcement pattern [ADR-0015](./ADR-0015-analytics-dashboard-access-boundary.md) already established, applied here to a per-device identity instead of a hardcoded operator allowlist.
4. **Fire-and-forget, fail-silent.** A Firestore write failure (offline, quota, any error) is caught and dropped inside `projectCloudSync.ts` — it never surfaces to the user, never retries aggressively, and never affects `saveProject`'s existing return value or timing. Durability improves; nothing about today's synchronous UX or its own error handling (per [Workspace Data & State](../../workspace/02_data_and_state.md) Error States) changes.
5. **Platform API is promoted** — `sdd/platform-api/` is created (per `10_bootstrap_guide.md` Step 3, the trigger — a real, deployed backend capability beyond the AI capability — has now fired, alongside Anonymous Authentication becoming real). [Application Responsibilities](../../context/05_application_responsibilities.md#platform-api)'s Projects row updates from "Implemented via LocalStorage" to reflect the write-through backup; LocalStorage remains the read source of truth per Decision 2 above, so the row is not marked fully "Implemented via a real service" — see Migration Implications.

## Consequences

**Positive:**
- Closes the actual, routine data-loss failure mode (LocalStorage cleared) without touching a single existing call site's synchronous contract.
- Reuses provisioned infrastructure exactly twice already reused this project (Firestore for Analytics, Firebase Auth for the Dashboard) — no new vendor, no new secret.
- The Repository seam this ADR introduces (`projectCloudSync.ts`) is the same shape Option 1 needs later — nothing here is thrown away if/when a full read migration happens.

**Negative / accepted trade-offs:**
- **No restore UI exists yet.** A user who loses LocalStorage today has no way, through this ADR alone, to recover their backed-up data — the backup exists in Firestore, but nothing reads it back. This is real, scoped-out future work (see Migration Implications), not a claim that this ADR "solves" data loss end-to-end.
- **Not cross-device sync.** Anonymous Authentication's `uid` is tied to one browser profile; opening the same Project on a second device creates a second, unrelated anonymous identity with no data to restore. This is the honest limit stated in Context — the reviewer feedback's literal ask (device-to-device sync) requires the still-deferred general Authentication capability, not this ADR.
- A background Firestore write on every save is additional Firestore usage/cost, proportional to Project edit frequency — accepted as low, matching Analytics' own already-accepted per-event write cost.

## Rejected Alternatives

| Alternative | Why rejected |
|---|---|
| Option 1 (full synchronous migration to Firestore-as-source-of-truth) | Correct end state eventually, but a wide-blast-radius refactor of every existing synchronous call site for a problem (durability) that doesn't require it; revisit once a real read/restore need exists (see Migration Implications) |
| Do nothing (Option 3) | The failure mode is routine, not hypothetical, and the fix is near-zero marginal infrastructure cost given what is already provisioned |
| A dedicated server API endpoint (`/api/projects`) fronting Firestore, instead of direct client writes | Rejected for the same reason [ADR-0013](./ADR-0013-analytics-provider-independence.md) chose direct client writes for Analytics events over a write-side API: Firestore Security Rules already provide real, server-enforced access control (identity-conditioned per Decision 3 above), so an intermediary API adds a deployment surface and latency without adding any security property Firestore Rules don't already provide |

## Migration Implications

Moving from Option 2 to Option 1 (Firestore becomes an actual read path — the natural next step once a "restore on this device" or "sign in to sync" flow is scoped) is additive: `projectCloudSync.ts`'s existing write path is unchanged, and a new read function is added beside it, then `storage.ts`'s callers migrate to an async contract deliberately, feature by feature, rather than all at once. The trigger for that migration is a concrete UI need (a restore flow, or the general Authentication capability's own promotion linking anonymous identities to real accounts) — not a speculative "might as well," per this project's standing evolution rules. Reversing Decision 2 (e.g., dropping Firestore backup entirely) requires a new ADR superseding this one.
