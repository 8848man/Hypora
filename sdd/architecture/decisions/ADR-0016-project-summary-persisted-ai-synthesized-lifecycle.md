# ADR-0016: Project Summary Becomes a Persisted, AI-Synthesized Artifact with an Explicit Lifecycle

**Status:** Partially Superseded by [ADR-0018](./ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md) — see note below
**Date:** 2026-07-18
**Affects specs:** [Workspace Data & State](../../workspace/02_data_and_state.md), [Project Summary Feature](../../workspace/features/05_project_summary.md), [Workspace Architecture](../../workspace/01_architecture.md), AI Capability Index (forthcoming capability file, `sdd/ai/capabilities/`)
**Related ADRs:** [ADR-0002](./ADR-0002-business-idea-lifecycle-domain-model.md) (the Project-level domain lifecycle this ADR does not touch), [ADR-0006](./ADR-0006-ai-as-platform-capability.md) through [ADR-0009](./ADR-0009-ai-platform-localization-integration.md) (the AI Platform architecture this ADR's new capability is built against, unchanged), [ADR-0017](./ADR-0017-automatic-invocation-for-project-summary-initial-generation.md) (the companion decision governing how this artifact's first generation is triggered), [ADR-0018](./ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md) (supersedes this ADR's OutOfSync-trigger and Read Context content — see note below)

> **Partial supersession note (2026-07-19):** [ADR-0018](./ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md) supersedes only this ADR's OutOfSync-trigger wording (Decision 2's diagram/state description and Decision 3, which named Canvas, MVP Plan, and Validation Plan as triggers) and Decision 7's Read Context description (which named Canvas, MVP Scope, and Validation Checklist). This ADR's core thesis — a persisted, stateful Summary artifact with the NotGenerated/Generating/Generated/OutOfSync lifecycle shape, the Repository Pattern reuse, and Build-Ready's independence from Summary Lifecycle — remains fully in force, unchanged. The rest of this document is preserved as originally written, per this project's discipline against rewriting an Accepted ADR's Decision in place; read it together with ADR-0018 for the current, accurate behavior.

## Context

[Workspace Data & State](../../workspace/02_data_and_state.md) and [Project Summary](../../workspace/features/05_project_summary.md) currently define Summary as a purely derived, non-persisted read view: "computed from the other four [Canvas, MVP Scope, Features, Validation] at render time, never persisted as its own record," recomputed fresh on every view, with zero AI involvement (consistent with the V1-era framing that predates the AI Platform's five now-live capabilities, per [Application Responsibilities](../../context/05_application_responsibilities.md)'s AI capability row).

The product now requires Project Summary to do something a pure aggregation cannot: synthesize Canvas, MVP Plan, and Validation Plan into a concise, human-readable narrative — what the project is, who it's for, what problem it solves, how it intends to validate — not a completion checklist. Three consequences follow directly:

1. **Synthesis is expensive and non-deterministic.** Re-running an AI narration on every Summary view (the current "recompute at render time" model) means a live AI call every time the page opens, with a different narrative each time — unacceptable cost and inconsistent UX.
2. **The Synchronization Dialog needs a stable baseline.** Comparing "As-Is" (the currently saved summary) against "To-Be" (a freshly AI-drafted, user-editable revision) requires the As-Is side to be a fixed, persisted value that does not change while the dialog is open — impossible if Summary is only ever recomputed on the fly.
3. **Staleness must be trackable and user-decided.** Once a synthesized summary exists, it can fall out of sync with edits to Canvas/MVP Plan/Validation Plan made afterward. Whether to regenerate is a deliberate user decision (per the Product Principle "AI augmentation, not replacement"), which requires the artifact to have an explicit state, not just always be "whatever the data currently says."

None of this is achievable under the current "never persisted, always derived" model. This is a genuine reversal of an explicit standing decision, not an oversight, and is recorded here rather than silently contradicting the documents named above.

## Decision

1. **Project Summary is promoted from a fully derived, non-persisted read view to a persisted, Project-owned artifact.** It carries a synthesized narrative (text) and a lifecycle state (below), persisted via Platform API's V1 LocalStorage implementation exactly like every other Project-scoped artifact (Canvas, MVP Scope, Features, Validation) — no new persistence mechanism is introduced; this follows the existing Repository Pattern and per-Project persistence scoping already defined in [Workspace Data & State](../../workspace/02_data_and_state.md#local-persistence-conceptual).

2. **Summary Lifecycle** — a Feature-local state, distinct from and orthogonal to the Business Idea Lifecycle ([ADR-0002](./ADR-0002-business-idea-lifecycle-domain-model.md)), exactly as [Workspace Data & State](../../workspace/02_data_and_state.md#state-model)'s existing Section-Complete state is already orthogonal to it:

   ```
   NotGenerated ──(Initial Generation begins)──► Generating
                                                      │
                              (success)               │  (failure)
                                 ▼                     ▼
                              Generated ◄───────  NotGenerated
                                 │
                                 │ (any Saved change to Canvas, MVP Plan, or Validation Plan)
                                 ▼
                             OutOfSync
                                 │
                                 │ (user opens Sync dialog, presses Apply)
                                 ▼
                              Generated
   ```

   - **NotGenerated:** default state; no synthesized summary exists yet.
   - **Generating:** an Initial Generation or a Sync's AI Summary Update is in flight. The previously Generated text (if any) remains visible and unchanged during this state — this is not a blocking or replacing transition.
   - **Generated:** a synthesized summary is persisted and currently reflects the inputs it was generated from.
   - **OutOfSync:** a synthesized summary is persisted, but at least one of Canvas, MVP Plan, or Validation Plan has changed since it was generated. The existing summary text is unchanged and still displayed. Regeneration never happens automatically from this state — only via the user explicitly completing the Synchronization Dialog's Apply action (see Decision 4 below).

3. **Marking OutOfSync.** Any Saved change to a Canvas field, the MVP Scope statement, the Feature list, or any Validation Checklist item, while Summary is in `Generated`, transitions Summary to `OutOfSync`. This is a pure state transition — it never mutates the persisted summary text itself, and never triggers regeneration.

4. **Synchronization is always an explicit, user-completed action**, never automatic recomputation: opening the Synchronization Dialog does not itself call AI (no request is made merely by opening it); pressing **AI Summary Update** inside the dialog is the only action that requests a new draft (an ordinary Manual Invocation, per [ADR-0017](./ADR-0017-automatic-invocation-for-project-summary-initial-generation.md)'s scope boundary); the draft is offered as editable text the user may freely revise; only **Apply** commits the edited draft as the new persisted summary and clears `OutOfSync` back to `Generated`; **Cancel** discards the dialog's in-progress draft entirely, leaving the persisted summary and its `OutOfSync` state untouched.

5. **This supersedes the following specific statements**, updated in the same task as this ADR rather than left contradicting it:
   - [Workspace Data & State](../../workspace/02_data_and_state.md)'s Data Ownership table, Summary row: "Not independently stored... computed from the other four at render time, never persisted as its own record" → replaced with the persisted, stateful model above.
   - [Project Summary](../../workspace/features/05_project_summary.md)'s Responsibilities ("Computing or storing its own copy of any data" as Out of Scope), Persistence table (all four rows assumed no persistence), and any Acceptance Criteria asserting the Summary is "never a stale cached copy" — replaced with the Lifecycle-aware behavior above, where a stale display (`OutOfSync`) is now a deliberate, correct, user-visible state rather than a defect.

6. **The Build-Ready confirmation action is unaffected.** It remains Project Summary's sole domain-lifecycle-changing action (per [ADR-0002](./ADR-0002-business-idea-lifecycle-domain-model.md)), gated identically to today, entirely independent of the new Summary Lifecycle introduced here — a Project may be Validated and Build-Ready-eligible regardless of whether its Summary happens to be `Generated` or `OutOfSync`.

7. **Content synthesis is provided by a new AI Capability** (Project Summary Synthesis Assistant, specified separately under `sdd/ai/capabilities/`), reading committed Canvas, MVP Scope, and Validation Checklist data via the existing Workspace Context Builder and Context Eligibility Rules ([Workspace Architecture](../../workspace/01_architecture.md#context-eligibility-rules)) — unchanged by this ADR. This is Workspace's first AI Capability whose Context Selection step spans three Features' committed data in one request; this is a normal, demand-driven use of the already-existing promotion rule, not a new architectural mechanism.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Keep Summary purely derived; synthesize a fresh narrative via a live AI call on every render | Rejected — a real AI call (with real cost and latency) on every Summary view is unacceptable, and re-narrating from scratch each time produces an inconsistent, non-reproducible narrative with no stable "As-Is" anchor for the Sync dialog |
| Persist the synthesized Summary, but auto-regenerate silently whenever any input changes | Rejected — violates "AI augmentation, not replacement" and Manual-first's spirit; would silently discard a user's own edited summary (post-Apply) the moment any upstream field changes, with no user decision point |
| Model Summary Lifecycle as new states inside the Business Idea Lifecycle (ADR-0002) rather than a Feature-local state | Rejected — the Business Idea Lifecycle is exclusively the Project's entity-level stage (Captured → ... → Archived); Summary Lifecycle is UI/Feature-level state, exactly matching the already-established precedent of Section-Complete sitting outside that lifecycle. Folding it in would duplicate ownership between `sdd/domain/` and `sdd/workspace/`, which the project's ownership discipline forbids. |

## Consequences

**Positive:**
- Gives the Synchronization Dialog a stable, non-changing As-Is baseline, which a purely derived model could never provide.
- Eliminates redundant AI calls — synthesis happens only on Initial Generation and on explicit Sync, never on every page view.
- Leaves the Business Idea Lifecycle (ADR-0002) completely untouched; Build-Ready gating is unaffected.
- Follows the existing Repository Pattern and per-Project persistence model exactly — no new persistence mechanism.

**Negative / accepted trade-offs:**
- Summary is no longer guaranteed fresh at every view — this is intentional (`OutOfSync` is the correct, honest state), but it is a real behavior change from today's always-fresh guarantee, and must be clearly surfaced in the UI so a stale-but-displayed summary is never mistaken for current.
- The persisted Summary field is new data on the Project record; per [Workspace Data & State](../../workspace/02_data_and_state.md)'s existing Forward-compatibility rule, its absence on already-stored Projects must be treated as `NotGenerated`, never a read error.

## Future Impact

Any future Feature needing a persisted, AI-synthesized narrative derived from multiple other Features' committed data (e.g., a V4 Go-to-Market summary) should reuse this same Lifecycle pattern (NotGenerated/Generating/Generated/OutOfSync + explicit Sync-and-Apply) rather than inventing a new one.
