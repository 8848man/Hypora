# ADR-0028: Amplitude Joins GA4 as a Non-Portable Reporting Sink; Session Replay Explicitly Deferred

**Status:** Accepted
**Date:** 2026-08-18
**Affects specs:** [Analytics Provider Independence](../../analytics/03_provider_independence.md), [Analytics Event Catalog](../../analytics/04_event_catalog.md) (no new row — no new taxonomy introduced)
**Related ADRs:** [ADR-0013](./ADR-0013-analytics-provider-independence.md) (the Provider Interface and the pre-existing GA4 non-portable-sink carve-out this ADR extends to a second vendor), [ADR-0014](./ADR-0014-platform-services-architectural-role.md) (the Platform Service role this stays inside, unchanged)

## Context

A request came in via an automated "Amplitude installation wizard" prompt to add `@amplitude/unified` (event tracking + Session Replay) to the client. The wizard's own default flow (call `amplitude.track()` directly at each instrumentation site; pick a new Title Case event name such as `Viewed Home Page`; turn on Session Replay at `sampleRate: 1` by default) conflicts with three things this project has already decided:

1. **Provider Interface / Zero-Provider-Conditional Rule** ([ADR-0013](./ADR-0013-analytics-provider-independence.md), [Provider Independence](../../analytics/03_provider_independence.md)) — no code outside a Provider implementation may call a vendor SDK directly from a Feature/page call site.
2. **Event Catalog naming convention** ([Event Catalog](../../analytics/04_event_catalog.md#naming-convention)) — `eventName` is `snake_case`, past-tense/`_requested`/`_sent`, and an equivalent event already exists (`landing_page_view` fires at Landing load, the same moment the wizard's own default candidate — a home-page load event — would cover).
3. **No new taxonomy without a Catalog row** ([Ownership Map](../../rules/ownership.md), Cross-Boundary Rules) — a Feature or integration may not invent an `eventName` inline.

This project already has a precedent for exactly this shape of vendor: [ADR-0013](./ADR-0013-analytics-provider-independence.md) and [Provider Independence](../../analytics/03_provider_independence.md#firebase-analytics-ga4--a-non-portable-reporting-sink-not-a-provider) carve out Firebase Analytics (GA4) as a **non-portable reporting sink** — not a swappable Provider, forwarded through a distinct path from `analyticsService.ts`, never through the Provider Interface, purely for its own out-of-the-box dashboards. Amplitude, for event tracking, is the same shape of thing for the same reason: a vendor-owned, non-self-hostable reporting product with no realistic migration path, wanted only for its own dashboards.

Session Replay is a materially different decision — it records real user screens, not discrete named events, and is far more expensive to reverse (once a session is recorded, it is recorded) and privacy-sensitive than adding one more forwarding target for existing events. It does not meet the bar of "cheap to decide now" that a same-shape-as-GA4 sink does, and is deliberately out of scope here.

## Decision

1. **Amplitude is added as a second non-portable reporting sink, generalizing the existing GA4 carve-out**, not modeled as an Analytics Provider. [Provider Independence](../../analytics/03_provider_independence.md)'s single-vendor GA4 section is generalized to a "Non-Portable Reporting Sinks" section covering both, per the same rules (never the Event Model's source of truth, never gates Provider selection in `container.ts`, called directly from `analyticsService.ts`).
2. **No new `eventName` is introduced.** Amplitude receives the same normalized `AnalyticsEvent` envelope every other sink receives — the existing Catalog `eventName` values, `snake_case`, unchanged. The wizard's own Title Case suggestion (`Viewed Home Page`) is rejected as a deviation from [Event Catalog](../../analytics/04_event_catalog.md#naming-convention); `landing_page_view`, which already fires at Landing load, serves as the first-event verification signal instead.
3. **Autocapture stays on** (`analytics.autocapture: true`) — it captures generic DOM interactions Amplitude-side only, same as GA4's own automatic page-view signals; it does not introduce a project-side taxonomy and is not something any Feature/Capability spec references.
4. **Session Replay is explicitly deferred, not enabled.** `sessionReplay.sampleRate` is configured at `0` (off) in this change. Turning it on is a distinct future decision requiring its own review (data retention, consent/disclosure, and whether Landing's anonymous visitors and Workspace's authenticated users need different handling) — not bundled into this ADR.
5. **Credential handling mirrors GA4's existing pattern**: an env var (`VITE_AMPLITUDE_API_KEY`, Vite's required client-exposure prefix per [Provider Independence's Credential Separation](../../analytics/03_provider_independence.md#credential-separation)), resolved through the same `config.ts` module, with the sink treated as inactive (skipped, not failing) when unset — identical to how `VITE_FIREBASE_MEASUREMENT_ID` being unset silently skips GA4 forwarding today.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Follow the installation wizard's default flow verbatim (direct `amplitude.track()` calls at each site, new Title Case event names, Session Replay on at `sampleRate: 1`) | Rejected — bypasses the Provider Interface / Zero-Provider-Conditional Rule, introduces a naming convention this project has never used, duplicates an event that already exists, and turns on session recording as a side effect of an event-tracking request, not a reviewed decision of its own |
| Model Amplitude as a swappable Analytics Provider behind the Provider Interface | Rejected for the same reason GA4 was rejected as a Provider in ADR-0013: Amplitude has no realistic migration path to a self-hosted or provider-swappable backend — it is a terminal, vendor-owned reporting product, not a data store this project owns |
| Bundle Session Replay into this same change, at a reduced sample rate instead of off | Rejected — a reduced rate is still "on"; it still requires the consent/retention review this ADR defers, just for fewer sessions. Off is the only option that requires no further review to ship now |
| Do nothing until a dedicated Analytics/growth stakeholder requests Amplitude through the normal Feature-request path | Considered, not chosen — the request already arrived from the user via the wizard prompt; the GA4 precedent makes the correct shape of answer cheap to apply now rather than deferring a decision that has no open question left once GA4's carve-out is generalized |

## Consequences

**Positive:**
- Amplitude's own dashboards become available for existing Catalog events without touching Workspace Feature, AI Capability, or Landing page code, and without adding a second event-tracking pipeline.
- The GA4 carve-out proves reusable for a second vendor of the same shape, validating that generalization rather than each vendor needing its own bespoke exception text.
- Session Replay's privacy/consent review is not rushed under the pressure of "the SDK is already being installed anyway."

**Negative / accepted trade-offs:**
- Two non-portable sinks (GA4, Amplitude) now exist alongside the one real Provider (Firestore); each is a small, permanent piece of forwarding code and its own env var to maintain — accepted, since both are optional and inert when unconfigured.
- Autocapture means Amplitude's own event stream (click/pageview signals it generates itself) diverges from this project's Catalog — accepted as a bounded, vendor-side-only divergence, same as GA4's own automatic signals already are today, and never referenced from any spec that assumes Catalog completeness.

## Future Impact

Turning on Session Replay is a future, separate decision — it requires its own review (data retention, consent/disclosure, anonymous-vs-authenticated handling) and, per the ADR trigger list, its own ADR entry (or an explicit amendment here) before `sessionReplay.sampleRate` moves off `0` in committed configuration. Any future third non-portable sink follows this same generalized carve-out without a new ADR, mirroring how GA4's original single-vendor exception is now reusable. Migrating away from Firestore as the real Provider still follows the existing five-stage [Migration Strategy](../../analytics/05_migration_strategy.md) unchanged — neither sink participates in that procedure.
