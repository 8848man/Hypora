# Implementation Lifecycle

**Refs:** → [00_index](../00_index.md) · [Context Loading](./01_context_loading.md) · [Ownership Map](../rules/ownership.md)

The phase sequence every task follows, per the SDD framework's `04_development_workflow.md`. Started at project inception per `10_bootstrap_guide.md` Step 1, at the minimal phase set — extended later (ADR gate, Release gate) exactly as real implementation and real deployments come into existence, never replaced with a competing document.

## Current Phase Sequence

```
1. Context Load          — load only what 01_context_loading.md says to load for this task type
        ↓
2. Code-First Analysis   — read the affected code BEFORE reading the spec (once real code exists;
                             for product-specification tasks, read the existing spec tree first instead)
        ↓
3. Decision Check        — does this fit a known decision tree? does it need an ADR
                             (sdd/architecture/decisions/, once created)?
        ↓
4. Implement / Author    — write the spec or code change
        ↓
5. Verify                — cheap, mechanical: does it compile/render, or for a spec, is it internally
                             consistent and free of broken links?
        ↓
6. Validate              — behavioral or content correctness — see the validation checklist this
                             document will grow once real implementation begins
        ↓
7. Sync Documentation    — update any other document this change now diverges from, same task
        ↓
8. Commit                — verify the changed files, confirm validation passed, then create a git
                             commit for this one logical change (see Commit Discipline below) —
                             mandatory before continuing to the next meaningful unit of work
        ↓
   SDD Drift Check       — mandatory close-out, every task (see framework's 05_validation_and_review.md)
        ↓
   Artifact Decision Matrix — explicit stated output: what changed and why, per artifact type
```

**Phases 4–8 repeat per meaningful unit of work, not once per task.** A task that naturally decomposes into multiple sequential steps (e.g., a phased implementation plan executed step by step) runs Context Load → Analysis → Decision Check once, then Implement → Verify → Validate → Sync Documentation → Commit once *per step* — never accumulating more than one step's changes into a single commit. The SDD Drift Check and Artifact Decision Matrix close out the task as a whole, after its last unit's commit.

**Not yet added:** a Cross-Boundary Check phase and a Release Decision phase — both are deferred until, respectively, a second Application area exists with a real contract between them, and a first real deployment exists. Add them at that point per the framework's own extension pattern (a new phase inserted into this same document, never a competing lifecycle document).

## Specification-First Procedure (applies to every task, including product-specification tasks)

Before writing any new fact, resolve to exactly one outcome:

| Outcome | Meaning | Required action |
|---|---|---|
| Covered | An existing document already correctly describes this | Proceed — reference it, do not restate |
| Requires modification | The concept is new, or an existing document is silent/incomplete/intentionally changing | Update the owning document first, same task |
| Conflict | Two existing documents disagree | Stop. Resolve which is authoritative before either is touched further |

## ADR Gate

Before authoring a change, check whether it meets any trigger in the framework's `07_adr_process.md`: spans more than one owned area, expensive/risky to reverse, chosen among real alternatives, or not reconstructible from the artifact alone. If yes, write or supersede an ADR in `sdd/architecture/decisions/` before proceeding.

## Commit Discipline

Whenever a meaningful unit of work is completed, it must be committed before continuing to the next one. A meaningful unit includes, but is not limited to: completion of one implementation step, one specification update, one architecture refinement, one bug fix, one refactoring task, one validation stage, or one review-driven improvement.

This exists to keep each commit small and reviewable, preserve a recoverable history, avoid mixing unrelated work in one commit, make rollback easy, and ensure every implementation milestone has a corresponding commit. A commit represents one logical change only — never a "mega commit" combining multiple unrelated implementations. If a task naturally consists of multiple logical changes, commit after each one completes rather than waiting until the whole task is done.

**Execution rule**, applied after every document change or implementation step, before proceeding to the next:
1. Verify the changed files.
2. Run the required validation for that step (phases 5–6 above).
3. If validation passes, create a git commit.
4. Only then continue to the next implementation step.

This is phase 8 of the sequence above — part of the normal workflow, not an optional recommendation. See [Git and Release Strategy](./02_git_and_release_strategy.md) for branch/merge rules governing what happens *between* commits (feature branch → develop → main); this section governs commit granularity *within* a branch, during a task.

## AI Provider Model Change Verification

*(Operational policy, not an architectural decision — does not modify ADR-0007's provider-independence guarantee or Configuration Scoping. See [Provider Independence & Configuration](../ai/02_provider_independence_and_configuration.md) for the static configuration model this procedure operates on.)*

Prompted by a real V2 incident: a configured Gemini model appeared unavailable (a live 404), was replaced based on that single observation, and a later, separate investigation found the original model had become invokable again with no code change — the failure was transient, not a genuine deprecation. This procedure exists so a single runtime failure never again triggers a production AI model change without the sequence below. It applies whenever a change to a configured AI Provider model identifier is being considered — never automatically, and never triggered by a runtime failure alone.

1. **Official Documentation First.** Before concluding a model is deprecated, unavailable, or should be replaced, check the provider's current official documentation. Do not rely on memory, training data, or a previous incident's conclusion — provider model lifecycles change faster than any cached understanding of them.
2. **Live Verification Required.** Reproduce the failure against the actual production configuration: the production API key, the production endpoint, the production model identifier, a real invocation. A failure reproduced only against a different key, a different environment, or a mocked path is not sufficient evidence.
3. **Multiple Verification Attempts.** Before changing the configured model, perform multiple consecutive live validation requests, not one. A single failed request is never sufficient evidence of a permanent condition — this project's own incident involved a failure reproducible for over a day that then resolved without any change. No exact retry count is prescribed beyond "more than one, consecutively, immediately before deciding."
4. **Root Cause Before Model Change.** Changing the configured model is the last step, not the first. Before replacing it, determine whether the observed failure is explained by, roughly in this order (cheapest and most common causes first): implementation error, configuration error, credential/authentication failure, a provider-side outage, a project/account-level restriction, or genuine model lifecycle retirement.
5. **Production Validation After Change.** If the model is changed, the change is not complete until production validation succeeds: the health endpoint, the AI capability endpoint, a real generation (not a structural or mocked check), and at least one representative user flow, all verified against the actual deployed production environment.
6. **Rollback Readiness.** Whenever a replacement model is introduced, the previous known-good model identifier must remain trivially easy to restore (e.g., a single configuration value change). This is a readiness requirement for a human-initiated rollback — not a requirement for automatic runtime fallback, dynamic provider switching, or any new configuration mechanism. [ADR-0007](../architecture/decisions/ADR-0007-llm-provider-independence-and-encapsulation-boundary.md)'s Minimum Abstraction already rejects automatic fallback and dynamic provider discovery for this exact reason; this procedure does not reopen that decision.
7. **Evidence-Based Decisions.** Every step above produces evidence — documentation, live API behavior, reproduction results. The decision to change (or not change) the configured model must be traceable to that evidence, never to assumption or to precedent from an earlier, possibly-since-resolved incident.

## Artifact Decision Matrix (mandatory output, every task)

| Artifact | Change? | Reasoning |
|---|---|---|
| Specification | Yes / No | one line |
| ADR | Yes / No | which trigger fired, or why none did |
| Release | Yes / No | not applicable until a first deployment exists |
| Validation | which checks ran | |
| Git Commit | Yes / No (No requires explicit justification) | which meaningful unit, spec, or ADR this commit represents, per Commit Discipline above |
