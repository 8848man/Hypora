# Context Loading Strategy and Agent Capability Model

**Purpose:** two closely related concerns, kept in one document because they share the same per-task-type structure and splitting them would mean maintaining two parallel tables for the same eight task types. First: minimize what an agent loads before acting, without ever loading too little to make a correct decision (a generalized, reusable version of the reference project's own per-task-type loading matrix, `sdd/workflow/01_context_loading.md`). Second, extending the same per-task-type breakdown: what each task type actually *produces*, what validation it *requires*, whose ownership boundary it falls within, and when it should stop for a human — formalizing task types as capabilities rather than one-off workflows, per this framework's evolution from documentation methodology to agent operating model.

## The Four Tiers

| Tier | Meaning |
|---|---|
| **Mandatory** | Load before starting this task type, no exception |
| **Recommended** | Load if the task plausibly touches this area — check before assuming it doesn't |
| **Optional** | Load only if you hit a specific need for it mid-task |
| **Never (for this task type)** | Do not load, even if it seems related — loading it degrades focus without improving the outcome |

## General Rules (apply to every task type)

1. **Load the code before the spec.** The spec describes intent; the code describes current reality. You need reality first to spot the delta between the two.
2. **Load the data/entity definition before the surface that renders or consumes it.** A UI or downstream consumer built against a stale entity definition breaks silently.
3. **Product-level, design-time-only documents (full requirements list, product vision/scope) are `Never` for implementation tasks.** Load them only when the task is explicitly about evaluating scope or priorities, not when implementing against an already-scoped requirement.
4. **A document explicitly marked stale, superseded, or "not yet implemented" is `Never`**, regardless of task type, until its replacement is identified or its triggering condition becomes true.
5. **If a document isn't listed for your task type below, don't load it.** This default-to-skip posture, not default-to-include, is what keeps context minimal.

## Per-Task-Type Matrix

### Feature Implementation

| Tier | Documents |
|---|---|
| Mandatory | Always-loaded instructions file; the affected layer's contract/interface doc; the affected layer's architecture doc; the code files closest to the change (entity → model → datasource → consumer chain, or the layer-equivalent) |
| Recommended | The domain/state-machine doc if the feature touches entity lifecycle; the relevant decision-flow entry if one exists for this exact case; the cross-cutting capability contract if the feature touches one (e.g. auth) |
| Optional | The product/context spec for the specific feature, if the requirement itself is ambiguous |
| Never | Full requirements list; other layers' architecture docs unless the feature is genuinely cross-layer; `sdd/archive/`; release history |

**Capability attributes:**

| Attribute | Value |
|---|---|
| Purpose | Add new user- or system-facing behavior |
| Produced artifacts | Code change; spec update if the contract changed; ADR only if the ADR gate fires |
| Required validation | L1–L3 always; L4 if cross-layer; L5 if user-visible |
| Ownership boundary | The layer(s) implementing the feature; cross-cutting contract owners if touched |
| Stop for human when | The Specification-First outcome is Conflict and cannot be resolved by the conflict-resolution order; the ADR gate fires and required cross-area sign-off is unavailable |

### Architecture Change

| Tier | Documents |
|---|---|
| Mandatory | Always-loaded instructions file; `07_adr_process.md`-equivalent (the ADR process doc); the ADR index; any existing ADR touching the affected area; the ownership map |
| Recommended | Every layer's architecture doc the change plausibly touches; the domain/state-machine doc |
| Optional | Historical/archived design-discussion documents, if backfilling an ADR |
| Never | Release history (architecture decisions are not gated by deployment status) |

**Capability attributes:**

| Attribute | Value |
|---|---|
| Purpose | Change or introduce a decision meeting the ADR trigger list |
| Produced artifacts | A new or superseding ADR; the implementation; any spec the decision affects |
| Required validation | L1–L3 at minimum; L4 if the decision changes a cross-layer contract |
| Ownership boundary | Every area the ADR's consequences span — sign-off required from all before `Accepted` |
| Stop for human when | Cross-area sign-off cannot be obtained; the decision would break user-facing behavior with no migration path |

### Bug Fix

| Tier | Documents |
|---|---|
| Mandatory | Always-loaded instructions file; the code path exhibiting the bug; the contract/schema doc the buggy behavior should conform to |
| Recommended | The relevant validation checklist, to confirm the fix's correctness criteria |
| Optional | The domain doc, only if the bug involves a state transition |
| Never | ADR process doc (a bug fix essentially never meets the ADR trigger list); full requirements list; product spec |

**Capability attributes:**

| Attribute | Value |
|---|---|
| Purpose | Correct behavior that diverges from intended/documented behavior |
| Produced artifacts | Code change; spec update only if the bug fix reveals the spec itself was wrong |
| Required validation | L1–L3; L4 only if the bug crosses a layer boundary |
| Ownership boundary | The layer containing the bug |
| Stop for human when | The "correct" behavior is itself ambiguous (spec and code disagree and neither is obviously the bug) |

### Release Preparation

| Tier | Documents |
|---|---|
| Mandatory | The release index; the specific component's release log; the git tag/commit actually being released |
| Recommended | Any ADR whose decision shipped in this release, for the rollup entry's optional narrative mention |
| Optional | The deployment/infra spec, if the deployment process itself is in question |
| Never | Specifications (a release records what shipped, it does not re-derive or re-validate spec correctness — that already happened in the tasks that produced the release) |

**Capability attributes:**

| Attribute | Value |
|---|---|
| Purpose | Record what was actually deployed, when, at which version |
| Produced artifacts | A git tag (component); a release-log entry (component); a rollup entry (project) |
| Required validation | Confirm the tag points at the actually-deployed commit; confirm the version bump is correct |
| Ownership boundary | DevOps / whichever area owns deployment |
| Stop for human when | The deployment itself hasn't actually completed successfully — never record a release speculatively |

### Documentation Review

| Tier | Documents |
|---|---|
| Mandatory | The document(s) under review; the authoring rules doc; the ownership map (to confirm the right area is making the change) |
| Recommended | Any other document the one under review cross-references, to check the reference is still accurate |
| Optional | The full index, if checking for orphaned/unindexed documents |
| Never | Unrelated layers' implementation code |

**Capability attributes:**

| Attribute | Value |
|---|---|
| Purpose | Confirm a document is accurate, well-owned, and non-duplicative |
| Produced artifacts | Corrections to the document; a note if a concept's canonical owner needs to change |
| Required validation | Cross-check against `13_concept_ownership_model.md`; link validity |
| Ownership boundary | Whichever area owns the document under review |
| Stop for human when | The review finds the document's canonical owner is genuinely ambiguous between two areas |

### Validation

| Tier | Documents |
|---|---|
| Mandatory | The validation-levels/checklist doc; the specific contract/schema doc the change must conform to |
| Recommended | The cross-boundary checklist, if the change crosses a layer boundary |
| Optional | The domain doc, if validating a state transition specifically |
| Never | ADR process doc; release documents |

**Capability attributes:**

| Attribute | Value |
|---|---|
| Purpose | Confirm a change is behaviorally correct, not just compiling |
| Produced artifacts | Pass/fail result per triggered level; on failure, a routed-back Implementation state (`16_agent_runtime_model.md`) |
| Required validation | This capability *is* validation — see `05`'s level-selection tree |
| Ownership boundary | Whichever area owns the contract/schema being validated against |
| Stop for human when | Validation cannot actually be executed (missing tooling, no test environment) and the change is non-trivial |

### Refactoring

| Tier | Documents |
|---|---|
| Mandatory | The code being refactored; the architecture doc for that layer (to confirm the refactor doesn't violate a stated layering rule) |
| Recommended | Any ADR governing the pattern being refactored — if the refactor would change the decision itself rather than just its implementation, this is no longer "just a refactor" (see `14_evolution_rules.md`) |
| Optional | The contract/interface doc, only to confirm the refactor doesn't change any external-facing shape |
| Never | Product/context specs; release history |

**Capability attributes:**

| Attribute | Value |
|---|---|
| Purpose | Improve internal structure with no external behavior change |
| Produced artifacts | Code change only — a genuine refactor produces no spec/ADR change (see `04`'s Refactor-vs-Implement-Directly tree: if it would, it isn't "just" a refactor) |
| Required validation | L1 mandatory; a full regression pass strongly recommended (refactors are the likeliest change type to silently break behavior) |
| Ownership boundary | The layer being refactored |
| Stop for human when | The refactor turns out to require changing a decision an ADR governs — escalate to Architecture Change instead of continuing |

### Infrastructure Work

| Tier | Documents |
|---|---|
| Mandatory | The deployment/infra spec; the deploy scripts/pipeline definitions themselves; the environment-variable inventory |
| Recommended | The ADR process doc, if the change is a genuine infra-architecture decision (e.g., changing hosting provider) rather than routine tuning |
| Optional | The release process doc, if the infra change directly enables or blocks the next release |
| Never | Domain/state-machine doc; product/context specs |

**Capability attributes:**

| Attribute | Value |
|---|---|
| Purpose | Change deployment/environment/pipeline configuration |
| Produced artifacts | Config/pipeline change; infra spec update; ADR only if it's a genuine infra-architecture decision |
| Required validation | A deployment smoke-test sequence appropriate to the change |
| Ownership boundary | DevOps / whichever area owns infrastructure |
| Stop for human when | The change affects production credentials/secrets, or would change what's publicly reachable, without explicit authorization |

## Building Your Own Matrix for a New Task Type

If a new, recurring task type emerges that isn't listed above, construct its context-loading row using this test per document: *"If I skip loading this, is there a realistic scenario where I make a wrong decision I could have avoided?"* If yes for a given document, it's at least Recommended; if the wrong decision would be severe or hard to reverse, it's Mandatory. If the answer is "no, and loading it would mostly just add noise," it's Never. Optional is reserved for documents that are situational rather than wrong-by-default to skip.

Construct its capability attributes the same way: purpose is a one-sentence statement of what the task type accomplishes; produced artifacts and required validation follow directly from which of the four framework artifacts (spec, ADR, release, code) the task type plausibly touches; the stop-for-human trigger is whatever, for this specific task type, would let something become silently true without anyone deciding it (`01_philosophy.md`, Principle 5's unifying test; `11_ai_operating_rules.md`'s Request-Human-or-Continue tree).
