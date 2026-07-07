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
   SDD Drift Check       — mandatory close-out, every task (see framework's 05_validation_and_review.md)
        ↓
   Artifact Decision Matrix — explicit stated output: what changed and why, per artifact type
```

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

## Artifact Decision Matrix (mandatory output, every task)

| Artifact | Change? | Reasoning |
|---|---|---|
| Specification | Yes / No | one line |
| ADR | Yes / No | which trigger fired, or why none did |
| Release | Yes / No | not applicable until a first deployment exists |
| Validation | which checks ran | |
| Git Commit | Yes / No | which spec/ADR it references — not applicable until version control is initialized for this project |
