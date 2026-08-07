# Platform API — Authentication

**Refs:** → [00_index](./00_index.md) · [01_architecture](./01_architecture.md) · [02_projects](./02_projects.md) · [Application Responsibilities](../context/05_application_responsibilities.md#platform-api) · [ADR-0015](../architecture/decisions/ADR-0015-analytics-dashboard-access-boundary.md) · [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md) · [ADR-0025](../architecture/decisions/ADR-0025-account-authentication-and-one-directional-migration.md)

Split out of [01_architecture.md](./01_architecture.md) once its Authentication section grew past a summary paragraph, mirroring [02_projects.md](./02_projects.md)'s own split. Owns the current, standing shape of every Authentication use in this codebase; the decisions themselves live in the ADRs cited throughout and are not re-derived here.

## Not the General Capability

None of the three uses below is, or accelerates, the general, multi-user Authentication Platform API capability named in [Application Responsibilities](../context/05_application_responsibilities.md#platform-api) — that capability still has no password reset, no additional sign-in providers, and no admin-side user management. All three are implemented in `src/platform/auth/authService.ts` — the sole file in this codebase permitted to import `firebase/auth`.

| Use | Scope | Governing ADR |
|---|---|---|
| Internal Analytics Dashboard login | A hardcoded allowlist of internal operators, email/password sign-in | [ADR-0015](../architecture/decisions/ADR-0015-analytics-dashboard-access-boundary.md) |
| Per-device Project backup identity | Anonymous sign-in only, one stable `uid` per browser profile | [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md) |
| Account sign-up/sign-in | Email/password, upgrading the existing Anonymous identity in place via `linkWithCredential` (preserving its uid and Firestore data) when possible, falling back to an ordinary sign-in when the email already belongs to an existing account | [ADR-0025](../architecture/decisions/ADR-0025-account-authentication-and-one-directional-migration.md) |

## Account Sign-Up/Sign-In — Validation Policy

Enforced client-side first (immediate feedback, no round trip for the common case), then by Firebase itself as the actual source of truth — the client-side checks are a fast path, never a second, divergent set of rules:

- **Password minimum length: 6 characters.** Matches Firebase Authentication's own enforced minimum; not an independently chosen policy.
- **Sign-Up requires password confirmation.** A mismatch between password and confirmation is rejected client-side, before any network call — Sign-In has no confirmation field, since there is nothing to confirm against.
- **Email verification is explicitly out of scope.** No confirmation email is sent; an account is usable immediately on creation. Deliberately excluded from this policy's current scope, not an oversight — revisit if real evidence of fraudulent/typo'd sign-ups accumulates.

## Error Classification (Anti-Enumeration)

`authService.ts`'s `classifyAuthError()` maps every Firebase Authentication error this codebase reacts to into one of four kinds, so no caller inspects a raw Firebase error code:

| Kind | Covers | Why grouped this way |
|---|---|---|
| `weak-password` | `auth/weak-password` | Actionable, not security-sensitive — safe to state specifically |
| `invalid-email` | `auth/invalid-email` | Actionable, not security-sensitive — safe to state specifically |
| `wrong-credentials` | `auth/wrong-password`, `auth/user-not-found`, `auth/invalid-credential` | **Deliberately merged into one message, never revealing which.** Distinguishing "no such account" from "wrong password" lets an attacker enumerate registered emails one guess at a time — standard practice against account enumeration. |
| `generic` | Anything else | Never leaks the underlying Firebase error string to the user |

## What This Document Does Not Cover

- Why these three uses exist as separate, narrow grants rather than one general capability — the reasoning and rejected alternatives live in [ADR-0015](../architecture/decisions/ADR-0015-analytics-dashboard-access-boundary.md), [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md), and [ADR-0025](../architecture/decisions/ADR-0025-account-authentication-and-one-directional-migration.md), never re-derived here.
- Project data's own migration/storage behavior once an identity exists — owned by [02_projects.md](./02_projects.md).
- Where the sign-up/sign-in form is rendered — owned by [Frontend Architecture](../frontend/01_architecture.md#workspace-layout), per [ADR-0026](../architecture/decisions/ADR-0026-workspace-app-shell-for-account-navigation.md): a `WorkspaceAppLayout`-hosted app bar, composed only of existing Design System primitives (`Card`, `TextField`, `Button`) — no new component, no modal, no full-page navigation.
