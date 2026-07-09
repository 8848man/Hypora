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

## Artifact Decision Matrix (mandatory output, every task)

| Artifact | Change? | Reasoning |
|---|---|---|
| Specification | Yes / No | one line |
| ADR | Yes / No | which trigger fired, or why none did |
| Release | Yes / No | not applicable until a first deployment exists |
| Validation | which checks ran | |
| Git Commit | Yes / No (No requires explicit justification) | which meaningful unit, spec, or ADR this commit represents, per Commit Discipline above |
