# ADR-0018: Narrow Project Summary to Business Canvas Identity Synthesis

**Status:** Accepted
**Date:** 2026-07-19
**Affects specs:** [Project Summary Feature](../../workspace/features/05_project_summary.md), [Project Summary Synthesis Assistant](../../ai/capabilities/06_project_summary_synthesis_assistant.md), [AI Ownership Model](../../ai/03_ownership_model.md), [AI Interaction Specification](../../ai/04_ai_interaction.md), [Workspace Data & State](../../workspace/02_data_and_state.md)
**Related ADRs:** [ADR-0016](./ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md) (partially superseded — Read Context and OutOfSync-trigger portions only; its persisted-artifact/lifecycle-state thesis is unchanged), [ADR-0017](./ADR-0017-automatic-invocation-for-project-summary-initial-generation.md) (partially superseded — trigger-condition portion only; its Automatic Invocation exception thesis is unchanged), [ADR-0002](./ADR-0002-business-idea-lifecycle-domain-model.md) (the domain-lifecycle signal this ADR's new trigger reuses)

## Context

ADR-0016 and ADR-0017 defined Project Summary as a whole-project synthesis: an AI-written narrative covering Business Canvas, MVP Plan, and Validation Plan together, triggered automatically once a Project reached the Validated stage. A subsequent design review found this conflates two responsibilities that don't need the same mechanism:

1. **Identity** — what the project is, who it's for, what problem it solves, what value it provides. Naturally Canvas-scoped: the five Canvas fields are narrative and homogeneous, authored one guided question at a time (per ADR-0004/ADR-0012), and genuinely benefit from being recomposed into one coherent story the user never actually saw as a single artifact.
2. **Readiness** — is the plan complete, is it validated, is it Build-Ready. Already served, correctly, by the non-AI completion cards and the Build-Ready confirmation that predate this AI work entirely — these need no AI narration to do their job.

Bundling both into one AI-synthesized artifact produces concrete problems, independent of product framing:

- **AI context quality.** Canvas's five narrative fields blend naturally into prose. MVP Scope, the Feature list, and the Validation Checklist are structurally different (a boundary statement, a priority-tagged list, assumption/method/criterion/status tuples) — folding them into the same narrative voice produces a synthesis that reads as prose colliding with enumerated planning facts, observed directly in this capability's own output.
- **Architectural inconsistency.** Every other AI Capability in the Matrix ([Ownership Model](../../ai/03_ownership_model.md#capability-matrix)) reads broader context to draft one new, narrow field (MVP Planning Assistant reads Canvas+Risk to draft the Scope statement; Validation Planning Assistant reads Canvas+Risk+MVP to draft one new assumption). None of them recap everything they read. The whole-project Summary capability was the only one whose job was "read everything, narrate it all back" — the actual outlier in the Matrix, not an extension of its escalating-context pattern.
- **Unbounded extensibility and token cost.** Canvas's schema has been stable since V1 and needs no revision as the roadmap grows. A whole-project synthesizer, by contrast, must be revisited at every future stage (V3 market data, V4 GTM channels) and its token cost grows without bound as a Project accumulates Features and Validation items — a real, already-anticipated risk per [Provider Independence & Configuration](../../ai/02_provider_independence_and_configuration.md#context-budget)'s Context Budget section.
- **OutOfSync churn.** Because MVP Scope, Feature Planning, and Validation Checklist edits all invalidate a whole-project Summary, the very first automatically-generated summary goes stale almost immediately for any user who keeps working after reaching Validated — the staleness signal stopped being meaningful.

This is a deliberate narrowing of an already-shipped capability, not a green-field decision, and is recorded here — including which specific ADR-0016/ADR-0017 decision points it changes — rather than silently contradicting either.

## Decision

1. **Project Summary's AI synthesis is narrowed to Business Canvas only.** Its Purpose becomes: synthesize the five Canvas fields into a concise identity narrative — what the project is, who it's for, what problem it solves, what value it provides. It is no longer responsible for narrating MVP Planning, Validation Planning, or Build readiness — those remain independent concepts, represented exactly as they are today by the non-AI completion cards and the Build-Ready confirmation workflow, both of which are **unaffected by this ADR**.

2. **The capability's Read Context narrows to Canvas only.** `mvpContext` and `validationContext` are removed from the Request Contract. This is a breaking change to an already-`Stable` contract (at least one Feature is implemented against Contract Version 1.0), so per [Contract Versioning](../../ai/capabilities/000_index.md#contract-versioning) this is **Contract Version 2.0**, with 1.0's shape preserved in a Contract Version History subsection of the capability's own file, never silently edited away.

3. **Initial Generation's trigger condition changes** from "the Project's domain lifecycle stage reaches Validated" to "the Project's domain lifecycle stage advances out of Structuring" — i.e., the Structuring → Scoped guard (all five Canvas fields non-empty, per [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)) is satisfied. This reuses an existing, already-computed domain-lifecycle signal, exactly as ADR-0017 originally established the discipline of doing — only the specific signal reused changes, not the discipline itself.

4. **OutOfSync narrows to Canvas changes only.** A Saved change to a Canvas field, while Summary is `Generated`, transitions it to `OutOfSync`, exactly as before. A Saved change to MVP Scope, the Feature list, or the Validation Checklist **no longer affects Summary Lifecycle at all** — those artifacts are no longer part of what Summary represents.

5. **The Synchronization Dialog's mechanics are unchanged** — As-Is/To-Be, no AI call on open, **AI Summary Update** as the only manual trigger, editable draft, Apply/Cancel semantics per ADR-0016 Decision 4 — only the context fed into the `sync` Operation narrows to Canvas, identically to Initial Generation.

6. **This partially supersedes ADR-0016 and ADR-0017**, named precisely so neither ADR is misread as fully reversed:
   - **ADR-0016** — superseded: Decision 2's Lifecycle diagram/OutOfSync-trigger wording ("Canvas, MVP Plan, or Validation Plan"), Decision 3 ("Canvas field, the MVP Scope statement, the Feature list, or any Validation Checklist item"), and Decision 7's Read Context description ("Canvas, MVP Scope, and Validation Checklist data"). **Not superseded** — and still fully in force: the persisted-artifact model, the four-state Lifecycle shape itself (NotGenerated/Generating/Generated/OutOfSync), the Repository Pattern reuse, and the Build-Ready independence guarantee.
   - **ADR-0017** — superseded: Decision 3's trigger condition (Validated → Canvas-complete) and the Context section's framing ("Business Canvas, MVP Plan, and Validation Plan each complete"). **Not superseded** — and still fully in force: the single-capability, single-operation scope of the Automatic Invocation exception, the no-Suggestion-Ready carve-out (Decision 5), the client-orchestrated non-blocking execution model (Decision 4), and the failure-recovery behavior (Decision 6).
   - Both ADRs are marked `Partially Superseded by ADR-0018` in their own headers and in the ADR index, per this project's discipline against rewriting an `Accepted` ADR's Decision content in place ([`rules/ownership.md`](../../rules/ownership.md)'s Architecture area row).

7. **The capability is not renamed.** "Project Summary" and "Project Summary Synthesis Assistant" remain the names of the Feature and the capability, respectively — narrowing what a concept synthesizes is not the same as it becoming a different concept, and renaming would touch UI copy, routes, and file names with no functional benefit.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Keep whole-project scope; mitigate quality/cost issues with list truncation or per-section summarization heuristics inside the prompt | Rejected — treats the symptom, not the cause; the underlying problem (narrative prose forced to also carry checklist-shaped data) remains, and token cost still grows unboundedly with Feature/Validation item count regardless of truncation heuristics |
| Split into two capabilities now — an Identity Assistant (Canvas) and a Plan Overview Assistant (MVP + Validation) | Rejected as premature — MVP Planning and Validation Planning are already coherently presented on their own dedicated screens; there is no demonstrated need yet for an AI-narrated overview of them. Per this project's demand-driven promotion discipline, that capability gets built if and when a real need for it appears, not speculatively alongside this change. |
| Keep milestone-progressive triggering across Canvas/MVP/Validated completion (a design considered in an earlier review pass) | Superseded by this proposal directly — once Summary depends on Canvas alone, there is exactly one meaningful completion milestone; the added complexity of tracking multiple trigger points and a post-first-Sync auto-invocation lockout is no longer needed for anything |

## Consequences

**Positive:**
- Every future roadmap stage (V3–V5) can add data to a Project without ever requiring a revision to this capability — its input schema has been stable since V1 and stays that way.
- Token cost is now bounded and predictable (a fixed five-field input) rather than growing with a Project's Feature and Validation item counts.
- OutOfSync no longer fires on MVP/Validation edits, eliminating the near-immediate staleness churn the whole-project design produced.
- The capability now matches every other entry in the Capability Matrix: bounded input, one coherent, narrow-purpose output.

**Negative / accepted trade-offs:**
- The AI-written text no longer explains "how the project intends to validate the idea" — a requirement stated explicitly in this Feature's original brief. This is a deliberate, explicit product decision made at the time of this ADR, not a silent scope reduction: that information remains fully visible on the same Summary page via the existing Validation Planning completion card, just not narrated in prose.
- The Contract Version 2.0 bump is a breaking change to the capability's Request Contract. Its sole Consumer (Project Summary) is migrated in the same task as this ADR, so no external Consumer is left on an incompatible shape.
- Existing persisted `summary.text` values generated under Contract Version 1.0 remain valid, displayable, opaque text — no data migration is required — but they will not be regenerated with the same (whole-project) content shape going forward; a user who Syncs after this change gets an Identity-only draft, not a like-for-like refresh.

## Future Impact

If a genuine future need emerges for an AI-narrated overview of MVP Planning and/or Validation Planning, that is a new, separate capability decision (per the rejected-alternative above) — never a re-widening of this capability's Read Context back toward whole-project scope.
