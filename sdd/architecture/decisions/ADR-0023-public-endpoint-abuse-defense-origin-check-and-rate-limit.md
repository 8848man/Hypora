# ADR-0023: Public AI Endpoint Abuse Defense — Origin Allowlist Plus a Firestore-Backed Rate Limit

**Status:** Accepted
**Date:** 2026-08-07
**Affects specs:** [AI Platform Architecture](../../ai/01_architecture.md), [Application Responsibilities](../../context/05_application_responsibilities.md)
**Related ADRs:** [ADR-0007](./ADR-0007-llm-provider-independence-and-encapsulation-boundary.md) (the Provider Interface this decision does not touch), [ADR-0013](./ADR-0013-analytics-provider-independence.md) (establishes the Firestore project this decision reuses), [ADR-0015](./ADR-0015-analytics-dashboard-access-boundary.md) (the precedent this ADR explicitly cannot reuse — see Context)

## Context

Every AI Capability endpoint (`/api/*`, per [AI Platform Architecture](../../ai/01_architecture.md)) is a public, unauthenticated Vercel Function — any client that can reach the deployed URL can invoke it, and every invocation spends real, metered Gemini API quota. Left unaddressed, anyone (a scraper, a competing tool, an accidental infinite-retry loop in a client) can exhaust the deployed quota, degrading or breaking the product for real users, with no attribution back to who did it.

This is not the same problem [ADR-0015](./ADR-0015-analytics-dashboard-access-boundary.md) already solved for the Analytics Dashboard. That ADR could gate access behind Firebase Authentication because the Dashboard has a small, fixed, internal-operator audience willing to log in. Workspace's AI Capabilities are consumed by anonymous, unauthenticated end users as part of the core product experience (per [Application Responsibilities](../../context/05_application_responsibilities.md#platform-api), general multi-user Authentication remains deferred) — requiring login here would break the product, not just gate an internal tool. The defense has to work without knowing who the caller is.

This meets the ADR trigger list: it is security-relevant, was chosen among genuinely different alternatives, and is moderately expensive to reverse once real traffic depends on whichever shape is chosen.

## Options Considered

### Option 1 — Do nothing, rely on Gemini's own vendor-side quota

**Trade-offs:** Zero implementation cost. But the quota is shared across the whole deployed product — one abusive client exhausts it for every real user simultaneously, with no way to isolate or throttle the offender. Rejected as not actually a defense, only an acknowledgment of the existing failure mode.

### Option 2 — Full user authentication gating every AI Capability call

**Trade-offs:** Would give a clean per-user quota. Rejected as disproportionate — this is exactly the general, still-deferred, multi-user Authentication Platform API capability ([Application Responsibilities](../../context/05_application_responsibilities.md#platform-api)), and requiring login to use the core product's AI features would be a product regression, not a hardening measure. The same reasoning [ADR-0015](./ADR-0015-analytics-dashboard-access-boundary.md) already used to reject building general Authentication just to gate one internal tool applies with even more force here.

### Option 3 — Vercel Firewall / WAF-level IP rate limiting (dashboard-configured)

**Trade-offs:** The strongest, most reliable mitigation available — enforced at the edge, before a request even reaches the Function, and unaffected by serverless cold starts or instance churn. But it is dashboard/CLI configuration, not application code committed to this repository, and is outside this ADR's ability to apply directly (no Vercel project console access from within a code change). **Adopted as a recommended operational follow-up, not as this ADR's own Decision** — see Migration Implications.

### Option 4 — Origin/Referer header allowlist, enforced in the HTTP handler shell

**Trade-offs:** Cheap, no new infrastructure, blocks the common case (a browser-based scraper or a third-party site embedding a call to the deployed endpoint) outright. Does not stop a determined attacker who can freely set arbitrary headers (e.g., a direct `curl`/script call) — this is defense against casual/accidental abuse, not a hard security boundary. Requires a small, explicit decision about what happens when both `Origin` and `Referer` are absent (some legitimate non-browser tooling and a few browser configurations omit both) — this ADR treats "absent" as allowed, not rejected, since the cost of a false positive (breaking a real user) is judged higher than the marginal defense gained by rejecting silence outright.

### Option 5 — A durable, per-caller rate limit, backed by the already-provisioned Firestore project

**Trade-offs:** Firestore is already provisioned for Analytics ([ADR-0013](./ADR-0013-analytics-provider-independence.md)) and already reachable from the client bundle via the same public Firebase config ([Analytics Provider Independence](../../analytics/03_provider_independence.md)) — no new vendor, no new secret. Reusing it from a server Function via the same client SDK, keyed on the caller's IP, gives a per-caller request budget that survives across separate Function invocations (unlike an in-memory counter, which resets on every cold start and is never shared across concurrent instances). Costs one Firestore read+write per request and a small amount of new code (a token-bucket document per key); accepted as proportionate to the quota-exhaustion risk it closes.

## Decision

**Adopt Option 4 and Option 5 together, as defense-in-depth, both enforced in the shared HTTP handler shell (`createCapabilityHandler`) so every current and future AI Capability endpoint inherits both automatically — no per-endpoint opt-in.** Option 3 is recorded as a recommended, separately-actioned operational hardening step, not part of this ADR's own code-level Decision.

Specifically:
1. **Origin/Referer allowlist.** A request whose `Origin` header (falling back to `Referer`'s origin if `Origin` is absent) is present but does not match the deployment's own origin — derived automatically from Vercel's own `VERCEL_URL`/`VERCEL_BRANCH_URL`/`VERCEL_PROJECT_PRODUCTION_URL` environment variables, plus an optional `ALLOWED_ORIGINS` env var for any additional custom domain — is rejected with `403`. A request with neither header present is allowed through to the rate limiter below, never rejected on absence alone.
2. **Per-IP token-bucket rate limit**, backed by Firestore, keyed on the caller's IP (`x-forwarded-for`'s first entry, since Vercel Functions sit behind a proxy). A caller exceeding the bucket's budget receives `429` with the existing `rate_limited` error shape already used for a Provider-side 429 ([errors.ts](../../../app/server/http/errors.ts)) — the client-side handling this ADR's endpoints already need for a vendor rate limit is reused unchanged for a platform-side one.
3. Both checks run before request-body parsing and before any Provider call, so a rejected request never spends Gemini quota.
4. Neither check introduces a new vendor or a new secret — the Firestore project and its public client config already exist per [ADR-0013](./ADR-0013-analytics-provider-independence.md).

## Consequences

**Positive:**
- Closes the most likely abuse path (casual scraping/embedding, and runaway retry loops from any single caller) without requiring login, consistent with Workspace's unauthenticated product experience.
- No new vendor, secret, or deployment topology change.
- The 429 path reuses an error shape and client handling that already exist for vendor-side rate limiting — no new UX state.

**Negative / accepted trade-offs:**
- Neither check stops a determined, headers-spoofing attacker distributing requests across many IPs — this ADR closes the common case, not every case. A determined attacker requires Option 3 (edge-level firewall/WAF), which this ADR recommends but does not itself apply.
- Adds one Firestore read+write to every AI Capability request's latency and Firestore usage cost — accepted as proportionate to the quota-exhaustion risk being closed.
- The rate limit's Firestore document schema is new state this project did not previously have to reason about (concurrent writers to the same per-IP document) — mitigated by using Firestore's own transaction primitive for the read-modify-write, not by inventing new concurrency-control machinery.

## Rejected Alternatives

| Alternative | Why rejected |
|---|---|
| Full user authentication (Option 2) | Disproportionate — would gate the core product behind login, not just an internal tool; the general Authentication capability this would require is explicitly deferred |
| Do nothing (Option 1) | Not a defense, merely an acknowledgment of the existing failure mode |
| In-memory-only rate limiting, no Firestore | Rejected as unreliable in this deployment's own topology — a Vercel Function's in-memory state does not survive a cold start and is never shared across concurrently warm instances, so a determined caller trivially resets their budget by triggering new instances |

## Migration Implications

Option 3 (Vercel Firewall / WAF-level rate limiting) remains the recommended next hardening step and should be configured operationally (Vercel dashboard or `vercel firewall` CLI, per the `vercel:vercel-firewall` guidance) by whoever holds the Vercel project's access — this ADR's code-level defenses are complementary to it, not a substitute, and neither depends on the other existing. If Option 3 is later configured, this ADR's own checks remain in place as defense-in-depth (an edge-level rejection and an application-level rejection are not redundant — they fail differently and the cheaper one, the origin check, still saves a wasted Firestore round-trip even when the edge would also have blocked the request). Revisiting this decision (e.g., replacing the Firestore-backed limiter with a dedicated rate-limiting service such as Upstash, if per-request Firestore cost becomes material) requires a new ADR superseding this one.
