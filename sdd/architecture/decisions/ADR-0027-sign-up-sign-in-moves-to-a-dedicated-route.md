# ADR-0027: Sign-Up/Sign-In Moves to a Dedicated Route, Partially Superseding ADR-0026

**Status:** Accepted
**Date:** 2026-08-08
**Affects specs:** [Frontend Architecture](../../frontend/01_architecture.md), [Platform API — Authentication](../../platform-api/03_authentication.md)
**Related ADRs:** [ADR-0026](./ADR-0026-workspace-app-shell-for-account-navigation.md) (partially superseded by this ADR — see below for exactly which part), [ADR-0025](./ADR-0025-account-authentication-and-one-directional-migration.md) (the auth/migration decision this ADR's UI still fronts, unchanged)

## Context

[ADR-0026](./ADR-0026-workspace-app-shell-for-account-navigation.md) chose to render the sign-up/sign-in form inline, in a `Card` dropped directly into the app bar's account area, explicitly rejecting a dedicated route (its own Option 3) on the grounds that a full-page navigation is a heavier interruption than an in-place affordance. Having actually run the app and looked at the result, that trade-off reads worse in practice than in the ADR's own reasoning: the app bar is a narrow horizontal strip, and the form (email, password, and — for Sign Up — a confirm-password field, plus the Sign Up/Sign In tab toggle) is a multi-field vertical form competing for space with page content directly beneath it. [ADR-0026](./ADR-0026-workspace-app-shell-for-account-navigation.md)'s own Migration Implications anticipated exactly this reversal and named its bar: "requires a superseding ADR." This is that ADR.

This meets the ADR trigger list on the same grounds ADR-0026 already established (changes Workspace's route structure) plus the explicit rule ADR-0026 itself set: reversing its core Decision requires a superseding ADR, not a silent implementation change.

## Decision

**The sign-up/sign-in form moves to a dedicated route, `/app/account`, under the existing `WorkspaceAppLayout` (unchanged from ADR-0026).** Specifically, this **partially** supersedes ADR-0026:

- **Superseded:** ADR-0026 Decision 2's "shown inline from the account area... no full-page navigation (rejecting Option 3)." That specific choice is reversed — Option 3 is adopted instead, for the form only.
- **Still in force, unchanged:** ADR-0026 Decision 1 (the `WorkspaceAppLayout` app bar itself, hosting the consolidated `LanguageSwitcher` and an account-state indicator) and its Component Ownership framing (App-shell component, no new ownership tier). The app bar does not disappear — it now hosts a slim entry point instead of the full form:
  - **Anonymous/signed-out:** a "Sign In" button in the app bar navigates to `/app/account`, replacing the previous inline-`Card`-toggle behavior.
  - **Linked/signed-in:** the app bar still shows the signed-in indicator and Sign Out button inline, unchanged from ADR-0026 — that is a single action, not a multi-field form, and does not have the space problem this ADR exists to fix. `/app/account` also renders this same state (so navigating there directly, e.g. via a bookmark, is never a dead end).
- The form itself is unchanged in every other respect: still composed only from existing Design System primitives (`Card`, `TextField`, `Button` — ADR-0026 Decision 2's "no new Design System primitive" still holds), still the same Sign Up/Sign In tabs, confirm-password field, and validation/error classification from [Platform API — Authentication](../../platform-api/03_authentication.md).
- On success, `/app/account` navigates back to `/app` — signing in is not a destination in itself.

## Consequences

**Positive:**
- The form gets a full page's width/height instead of competing with an app bar strip — directly fixes the observed problem.
- `/app/account` is a real, bookmarkable/shareable URL and a stable landing spot for "manage your account" later (sign-out, and eventually password reset/provider linking), without inventing a second concept for that.
- ADR-0026's actual hard-won parts (one shared app shell, no duplicated account UI across pages, consolidated language switcher) are untouched.

**Negative / accepted trade-offs:**
- Reintroduces exactly the trade-off ADR-0026 originally rejected: signing in is now a full navigation away from whatever the user was doing. Accepted here because the alternative (cramped inline form) was a worse experience in practice, not just in theory — the concrete failure ADR-0026's own reasoning didn't anticipate.
- One more route (`/app/account`) in `App.tsx`'s tree — bounded, additive, no existing URL changes.

## Rejected Alternatives

| Alternative | Why rejected |
|---|---|
| Keep the form inline but make the `Card` wider/taller | Doesn't solve the actual problem (competing with page content beneath it in the same viewport); still a stopgap around the same space constraint |
| A modal/dialog overlay instead of a route | Introduces a new Design System primitive (no `Modal`/`Dialog` exists yet) for a problem a plain route solves with zero new components |

## Migration Implications

If the account page later grows real "account settings" content (password change, provider linking, once the general Authentication capability exists), it extends `/app/account` in place — this ADR already establishes it as that page, not a reason to invent a second one. Moving the form back inline would be a reversal of this ADR's own Decision and requires a further superseding ADR, mirroring the same discipline ADR-0026 set and this ADR just exercised.
