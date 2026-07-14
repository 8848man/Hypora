# ADR-0015: Analytics Dashboard Access Boundary — Same Deployment, Firebase-Authenticated

**Status:** Accepted
**Date:** 2026-07-14
**Affects specs:** [Query & Reporting](../../analytics/06_query_and_reporting.md), [Deployment Strategy](../../infra/01_deployment.md), [Application Responsibilities](../../context/05_application_responsibilities.md)
**Related ADRs:** [ADR-0003](./ADR-0003-single-v1-deployment-target.md) (the deployment-target decision this one extends rather than reverses), [ADR-0013](./ADR-0013-analytics-provider-independence.md) (establishes Firestore as the canonical event store this Dashboard reads from)

## Context

[Query & Reporting](../../analytics/06_query_and_reporting.md) specifies an internal Analytics Dashboard's read path (Analytics Query Service → Analytics Repository Interface → Firebase Analytics Repository → Firestore) but explicitly left its access boundary unresolved, flagging that a decision was needed before implementation could proceed. Two real constraints collide: [ADR-0003](./ADR-0003-single-v1-deployment-target.md) bundles Landing and Workspace into one public Vercel project with no backend of Hypora's own, and the Firestore rules already deployed for the write path (`app/firestore.rules`) currently deny all reads outright — the read path cannot function until reads are permitted under some condition, and that condition cannot be "always true" without publishing every stored event.

This decision determines whether the Dashboard is deployed inside the existing public bundle or as a functionally separate unit — squarely [ADR-0003](./ADR-0003-single-v1-deployment-target.md)'s own territory — and introduces Authentication into the codebase for the first time, which [Ownership Map](../../rules/ownership.md)'s "touches Product Architecture itself" trigger already requires an ADR for. It spans Analytics, Infra, and Application Responsibilities, is moderately expensive to reverse once the Dashboard has real operators depending on its URL and login flow, and was chosen among genuinely different alternatives — it meets the ADR trigger list on all three counts.

## Problem

Firestore Security Rules can only be conditioned on **who is asking** (a Firebase Auth identity), not on **where the requesting code was served from** — a rule cannot distinguish "this request came from the public Landing bundle" from "this request came from a separately deployed admin app," because both are just HTTPS calls to Firestore's API carrying an ID token. This means the real question is not "which deployment is more secure" in the abstract — it is whether **Firebase Authentication plus Firestore Rules, on their own, are a sufficient enforcement boundary**, or whether deployment-level separation is *also* needed, for reasons other than data access (blast radius, release independence, information disclosure).

## Options Considered

### Option 1 — Same deployment (existing Vercel project), protected by Firebase Authentication

The Dashboard ships as additional routes/components inside the existing React Router app (per [Frontend Architecture](../../frontend/01_architecture.md)), gated by: (a) a client-side redirect-to-login for UX only, and (b) Firestore Security Rules requiring `request.auth != null` and the authenticated user's email/UID to match a small, fixed, hardcoded allowlist of internal operators. **The actual enforcement point is Firestore itself** — Google's own backend evaluates the rule on every read request, regardless of which bundle or domain the request originated from. A visitor without valid Firebase Auth credentials matching the allowlist can navigate to the Dashboard's route and see a login screen, but every underlying data query fails at Firestore, not merely at a UI guard.

**Trade-offs:**
- No new deployment infrastructure — one more route, one more login check, reusing the already-provisioned Firebase project.
- Directly consistent with [ADR-0003](./ADR-0003-single-v1-deployment-target.md)'s own stated reasoning (reduce deployment complexity, reduce Vercel project usage, simplify MVP delivery) — applies with *more* force here, since the Dashboard has near-zero traffic and a tiny, trusted operator set.
- The Dashboard's own JS (component names, query shapes) ships as part of the public bundle, visible to anyone inspecting it — a mild information-disclosure concern (reveals that internal tooling exists and roughly what it measures), not a data-access concern, since no actual event data is retrievable without passing the Firestore Rules check.
- A build failure, bug, or dependency issue in the Dashboard's code is not isolated from Landing/Workspace — they ship and roll back together, exactly the trade-off [ADR-0003](./ADR-0003-single-v1-deployment-target.md) already accepted for Landing/Workspace bundling, now extended to a third surface.

### Option 2 — Separate deployment/application boundary

The Dashboard ships as its own Vercel project (or a separately access-controlled surface — e.g., Vercel's own preview-deployment protection), with its own build, domain, and release cadence, still using Firebase Authentication + Firestore Rules for the actual data-access gate underneath.

**Trade-offs:**
- Full blast-radius isolation: a Dashboard-side incident cannot affect the public Landing/Workspace deployment, and vice versa.
- The Dashboard's route and code never ship inside the public bundle at all — closes even the mild information-disclosure concern Option 1 accepts.
- Independent release cadence — the Dashboard can be redeployed without a full Landing/Workspace build.
- Doubles deployment configuration and hosting/monitoring overhead for a tool with, at this stage, no evidence of needing independent scaling, release cadence, or incident isolation — the same reasoning [ADR-0003](./ADR-0003-single-v1-deployment-target.md) already used to reject splitting Landing from Workspace.
- Data access security is **identical** to Option 1 once Firebase Auth + Firestore Rules are in place — a second deployment does not, by itself, make Firestore reads any more or less secure, since the enforcement point (Firestore) is the same either way.

## Decision

**Option 1 — the Dashboard ships inside the existing single Vercel deployment ([ADR-0003](./ADR-0003-single-v1-deployment-target.md)), gated by Firebase Authentication with Firestore Security Rules restricting reads to a small, fixed allowlist of internal operators.** This extends ADR-0003's existing bundling decision to a third internal surface rather than reversing it.

Specifically:
1. Firestore's currently-deny-all read rule (`app/firestore.rules`) is updated, at implementation time, to permit reads on the events collection only when `request.auth != null` and the authenticated identity is in a small, explicitly maintained allowlist — never `allow read: if true`, and never conditioned on anything other than the authenticated identity.
2. Authentication is Firebase Authentication only — reusing the Firebase project already provisioned for Firestore, introducing no new vendor. The specific sign-in method (email/password vs. a federated provider) is an implementation-time detail, not decided here.
3. This is explicitly **not** the general, still-deferred, multi-user Authentication Platform API capability ([Application Responsibilities](../../context/05_application_responsibilities.md#platform-api)) — it is a narrow, internal-operator-only login, never exposed to Landing/Workspace end users, and does not accelerate or substitute for that future capability.
4. The Dashboard's own route(s) are ordinary client-side routes in the existing Router — no new deployment, domain, or CI pipeline is introduced.

## Consequences

**Positive:**
- Zero new deployment infrastructure — ships as an extension of work already in place (existing Vercel project, existing Firebase project).
- Firestore Rules provide a real, server-side-enforced security boundary regardless of deployment topology — the security property this ADR needs does not depend on choosing Option 2.
- Consistent with every other "minimal infrastructure now, promote on real evidence" decision already made this project (Search deferred to V3, Storage/Persistence not yet promoted to a Platform Service, Platform Services' own Admission Criteria requiring concrete second-consumer evidence before admission).

**Negative / accepted trade-offs:**
- The Dashboard's code ships inside the public bundle, visible to anyone inspecting it, even though its data remains inaccessible without valid credentials — accepted as a mild information-disclosure cost, not a data-access risk.
- No release or incident isolation between the Dashboard and the public product — a serious bug in either can affect deployment of both, mirroring the exact trade-off already accepted for Landing/Workspace under [ADR-0003](./ADR-0003-single-v1-deployment-target.md).
- If the operator allowlist grows significantly, or a real incident demonstrates the bundling risk is not merely theoretical, this decision needs to be revisited — see Migration Implications.

## Rejected Alternatives

| Alternative | Why rejected |
|---|---|
| Option 2 (separate deployment/application boundary) | Doubles deployment configuration and hosting overhead for a tool with no current evidence of needing independent scaling, release cadence, or incident isolation — the same reasoning [ADR-0003](./ADR-0003-single-v1-deployment-target.md) already used to reject splitting Landing from Workspace; the actual data-security property this ADR is responsible for (Firestore read access) is identical under either option, so Option 2's isolation benefits are real but not yet justified by any concrete need |
| No authentication at all — client-side route hiding only | Rejected outright, not seriously considered as viable — provides no real security; the entire public bundle, including a "hidden" route's code, is downloadable regardless of whether a link to it is published |
| Building the general, multi-user Authentication Platform API capability now, to gate this one internal tool | Rejected as disproportionate — [Application Responsibilities](../../context/05_application_responsibilities.md#platform-api) already defers general Authentication until Workspace needs multi-user accounts; building it now for an internal admin tool used by a handful of trusted operators would be exactly the kind of speculative, oversized infrastructure this project's evolution rules warn against |

## Migration Implications

Moving from Option 1 to Option 2 later is a deployment-configuration change, not a rewrite: the Analytics Query Service, Repository Interface, and Firebase Repository ([Query & Reporting](../../analytics/06_query_and_reporting.md)) are unaffected either way, since they never know or care which deployment their calling UI lives in. What would change is only the Dashboard's own build/deploy target and routing. Concrete triggers that would justify revisiting this decision (each already the kind of "real, concrete evidence" bar this project applies elsewhere, not a hypothetical): a real incident where a Dashboard-side bug or deploy affected the public Landing/Workspace surface; a genuine need for the Dashboard to release on a different cadence than the public product; or the operator allowlist growing beyond a size where hardcoded Firestore Rules entries remain a reasonable access-control mechanism. Reversing this decision requires a new ADR superseding this one, mirroring [ADR-0003](./ADR-0003-single-v1-deployment-target.md)'s own reversal clause — an intentionally higher bar than a routine configuration change.
