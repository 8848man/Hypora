# ADR-0026: A Workspace App Shell, So Account/Login Has One Place to Live

**Status:** Accepted
**Date:** 2026-08-08
**Affects specs:** [Frontend Architecture](../../frontend/01_architecture.md), [Workspace Architecture](../../workspace/01_architecture.md)
**Related ADRs:** [ADR-0025](./ADR-0025-account-authentication-and-one-directional-migration.md) (the authentication decision this ADR gives a UI home to; kept as a separate ADR since this one is a layout/navigation decision, not an auth or persistence one)

## Context

[ADR-0025](./ADR-0025-account-authentication-and-one-directional-migration.md) adds real login, but Workspace's current route structure has nowhere consistent to put it. Per [Frontend Architecture](../../frontend/01_architecture.md)'s React Router Structure and the actual route tree (`App.tsx`): `/app` (the Dashboard/Project List) and `/app/projects/:projectId/*` (wrapped in `WorkspaceProjectLayout`, which owns only *within-Project* section navigation — Canvas/Scope/Validation/Risks/Summary) are **sibling routes with no shared parent layout**. There is no existing app-level chrome to add a login affordance to without duplicating it into two unrelated components — this ADR closes that specific gap.

This meets the ADR trigger list: it changes Workspace's route structure (a fact [Frontend Architecture](../../frontend/01_architecture.md) owns), was chosen among genuinely different placement options, and — once account/login UI depends on wherever it lands — is moderately expensive to relocate later.

## Options Considered

### Option 1 — A new shared `WorkspaceAppLayout`, wrapping both `/app` and `/app/projects/:projectId/*`

A new top-level layout component becomes the parent of both existing routes; it renders an app bar (title, consolidated language switcher, login/account area) and an `<Outlet/>` for whichever of the two existing route subtrees is active.

**Trade-offs:** One consistent place for account UI, reachable from every Workspace screen without exception. Requires restructuring `App.tsx`'s route tree (nesting, not just adding) and removes the now-redundant per-page `LanguageSwitcher` placements in `ProjectListPage` and `WorkspaceProjectLayout`, consolidating them into the new shell — a small cleanup this ADR gets for free rather than as separate scope.

### Option 2 — Add login UI independently to `ProjectListPage` and `WorkspaceProjectLayout`, no shared layout

**Trade-offs:** No route restructuring needed. But duplicates the login/account component and its state in two places that must now stay in sync, and any future Workspace screen added outside both would still lack it — the same "no consistent home" problem this ADR exists to close, just deferred rather than solved.

### Option 3 — A dedicated `/app/login` route, navigated to explicitly

**Trade-offs:** Simplest routing change (one new leaf route, no restructuring of existing ones). But a full-page navigation away from whatever the user was doing (mid-edit on a Canvas field, for instance) is a heavier interruption than an in-place account affordance, and still leaves nowhere for a persistent "you're signed in as X" indicator once returned — it solves *signing in* but not *account presence*, which Option 1 gives for free via the always-rendered app bar.

## Decision

**Adopt Option 1.** A new `WorkspaceAppLayout` component becomes the shared parent of `/app` and `/app/projects/:projectId/*` in `App.tsx`'s route tree. It owns:
1. An app bar, always rendered across every Workspace screen — title/branding, the consolidated `LanguageSwitcher` (moved here from its two current per-page locations), and an account area: a login affordance when the current Firebase Auth user is anonymous or signed out, an account indicator (and sign-out) once linked/signed in, per [ADR-0025](./ADR-0025-account-authentication-and-one-directional-migration.md).
2. The login/sign-up form itself, composed from existing Design System primitives (`Card`, `TextField`, `Button`) shown inline from the account area — no new Design System primitive, no modal/dialog component introduced, and no full-page navigation (rejecting Option 3).

Per [Frontend Architecture](../../frontend/01_architecture.md)'s Component Ownership tiers, this app bar is an **App-shell component** (cross-Feature, Workspace-internal) — the tier already named for exactly this kind of thing; no new ownership tier is introduced. `WorkspaceProjectLayout`'s existing within-Project section navigation is unchanged and continues to render beneath this new shell when a Project is open.

## Consequences

**Positive:**
- Every Workspace screen, present and future, automatically has consistent account UI and a persistent "signed in as" indicator, without each new screen needing to remember to add it.
- Removes an existing small duplication (`LanguageSwitcher` in two places) as a side effect.
- No new routes, no new Design System primitive — bounded, additive change.

**Negative / accepted trade-offs:**
- `App.tsx`'s route tree gains one more nesting level; every existing Workspace route's actual URL is unchanged (this is purely a rendering-tree restructuring, not a URL change), so no existing deep link breaks.
- The login form living inline in the app bar (rather than a dedicated route or modal) means it must be designed to not visually compete with whatever page is currently showing beneath it — an implementation-time layout concern, not a further architectural decision.

## Rejected Alternatives

| Alternative | Why rejected |
|---|---|
| Option 2 (per-page login UI, no shared layout) | Duplicates state/UI across pages and still leaves any future screen without it by default |
| Option 3 (dedicated `/app/login` route) | Solves signing in but not persistent account presence/indication; a heavier interruption than an always-available app bar affordance |

## Migration Implications

If Workspace later needs a second app-level concern beyond account/language (e.g., a global notification indicator), it is added to this same `WorkspaceAppLayout`, not a second competing shell — mirroring this project's own "one seam per cross-cutting concern" discipline already applied to `storage.ts`, `authService.ts`, and each Firestore-touching module. Relocating account UI out of the app bar entirely (e.g., to a dedicated settings route) would be a reversal of this ADR's core Decision and requires a superseding ADR.
