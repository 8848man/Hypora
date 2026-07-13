# Analytics Provider Migration Strategy

**Refs:** → [00_index](../00_index.md) · [Analytics Platform Architecture](./01_architecture.md) · [Provider Independence](./03_provider_independence.md) · [ADR-0013](../architecture/decisions/ADR-0013-analytics-provider-independence.md) · [AI Provider Model Change Verification](../workflow/00_implementation_lifecycle.md#ai-provider-model-change-verification)

Canonical owner of the official procedure for migrating from one Analytics Provider to another (e.g., Firebase Firestore to PostgreSQL, ClickHouse, BigQuery, Mixpanel, or Segment), per [ADR-0013](../architecture/decisions/ADR-0013-analytics-provider-independence.md). This is a **documented procedure**, not built infrastructure — mirroring how [AI Provider Model Change Verification](../workflow/00_implementation_lifecycle.md#ai-provider-model-change-verification) is a procedure, not a runtime mechanism. No migration tooling is implied to exist ahead of an actual migration being undertaken.

## Purpose

Make a future Analytics Provider swap a planned, low-risk, verifiable procedure rather than a rewrite — keeping the Event Model and every emitting call site (Feature, AI Capability) completely untouched throughout, per [Provider Independence](./03_provider_independence.md)'s guarantee.

## Strategy

Five stages, executed in order — a stage is never skipped, and a later stage is never started before the current one is verified complete:

| Stage | State | Exit condition before advancing |
|---|---|---|
| 1. Single Provider | Exactly one Analytics Provider is active (Firestore, initially) and receiving all events | N/A — this is the steady state before any migration begins |
| 2. Dual Provider | The new Provider implementation exists and is verified in isolation (e.g., against a Mock event stream or a non-production environment) — **not yet receiving real events** | The new Provider's implementation satisfies [Provider Independence](./03_provider_independence.md)'s Provider Responsibilities table, verified independently of the old Provider |
| 3. Dual Write | Every real event is written to **both** the old and new Provider simultaneously — the old Provider remains the sole source of truth read from | New-Provider writes are confirmed complete and correct against a real production event stream, for a duration sufficient to build confidence (an operational, not architectural, decision made at migration time) |
| 4. Read Switch | Reads (if any internal tooling reads analytics data) move to the new Provider; writes remain dual | The new Provider's data is confirmed equivalent to the old Provider's for the dual-write period |
| 5. Legacy Removal | The old Provider's write path is removed; the new Provider becomes the sole active Provider, returning to Single-Provider steady state | Explicit, deliberate decision — never automatic, never time-based alone |

## Rules Governing Every Migration

- **Stage 3 (Dual Write) is the only stage where two Providers are ever active simultaneously**, and it is explicitly transitional — [Provider Independence](./03_provider_independence.md#minimum-abstraction) already states dual-provider writing is never a standing architecture.
- **The Event Model never changes to accommodate a migration.** If a candidate new Provider cannot represent the existing Event Model, that is a reason to reconsider the candidate, not a reason to change the Event Model — per [ADR-0013](../architecture/decisions/ADR-0013-analytics-provider-independence.md)'s core guarantee.
- **No Feature, AI Capability, or Analytics Service code changes across any stage.** Every change is confined to Infrastructure: a new Provider implementation (Stage 2), and configuration routing changes (Stages 3–5) — per [Provider Independence](./03_provider_independence.md#configuration-scoping).
- **Each stage transition is a deliberate, recorded decision** (matching this project's Commit Discipline, [Implementation Lifecycle](../workflow/00_implementation_lifecycle.md#commit-discipline)), never inferred from passive observation — "writes look fine so far" is not, by itself, an exit condition.
- **Rollback at any stage is a configuration change**, not a code change — reverting to the old Single Provider from any later stage requires only routing configuration to point back, consistent with [Provider Independence](./03_provider_independence.md#minimum-abstraction)'s static, configuration-driven selection model.

## What This Document Does Not Cover

- Which Provider is actually chosen next, or when — an operational/product decision made at the time a real migration need exists, not speculated here.
- The mechanics of a specific Provider's own data export/import tooling — Provider-specific, owned by that Provider's own (future, implementation-time) documentation, never this cross-provider strategy document.
