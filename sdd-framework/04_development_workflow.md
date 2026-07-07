# Development Workflow

Reconstructed from the reference project's `sdd/workflow/00_implementation_lifecycle.md` and its `02_decision_flow.md`, plus the operating-model rollout that extended both. Every phase below is evidenced; none are invented.

**This document describes the methodology as a narrative phase sequence.** For the same process described as an executing agent's state machine — states, transitions, entry/exit conditions — see `16_agent_runtime_model.md`.

## Starting Point

Every task begins by reading, in order: (1) the always-loaded agent-instructions file (the one document with no conditional loading — read on every single task regardless of type), (2) the workflow/lifecycle document, (3) a context-loading matrix that maps *task type* → *which documents to load*. The explicit rule governing step 3: **"If a document is not listed for your task type, do not load it."** This is a deliberate anti-pattern to "load everything just in case," which the reference project treats as actively harmful to output quality, not just wasteful.

## The Phase Sequence

```
1. Context Load          — load only what the task-type matrix says to load
        ↓
2. Code-First Analysis   — read the affected code BEFORE reading the spec
        ↓
3. Decision Check        — does this fit a known decision tree? does it need an ADR?
        ↓
4. Implement             — per layer-specific implementation rules
        ↓
5. Verify                — cheap, mechanical: does it even run/compile/import?
        ↓
6. Validate              — behavioral correctness, per validation-level checklist
        ↓
7. Sync Documentation    — update any spec the change now diverges from, same task
        ↓
8. Cross-Boundary Check  — did this ripple to the other side of a layer boundary?
        ↓
9. Release Decision      — was this actually deployed? if so, record it; if not, skip
        ↓
   SDD Drift Check       — mandatory close-out, every task (see 05_validation_and_review.md)
        ↓
   Artifact Decision Matrix — explicit stated output: what changed and why, per artifact type
```

**No phase is optional to evaluate.** Several are commonly "No" in outcome (most tasks don't need a doc change, most tasks don't need an ADR, most commits are not a release) — but the evaluation itself is not skippable. This is the single most load-bearing operational rule in the whole methodology: it is what prevents both under-documentation (silently skipping the check) and over-documentation (forcing an edit where none is warranted).

### Decision Tree — Should a New Feature Be Created (and How)?

```
Does an existing spec already describe this behavior correctly?
        │
    ┌───┴───┐
   Yes      No
    │        │
 Proceed   Update the spec first (same task) — then:
 to impl.        │
            Does this feature meet any ADR trigger (07_adr_process.md)?
                        │
                    ┌───┴───┐
                   Yes      No
                    │        │
              Write/supersede   Proceed to implementation.
              an ADR first,
              then implement.
```

This is the Specification-First procedure and the ADR gate, drawn as one combined flow — they are always evaluated together at Phase 3, not as two separate decisions at two separate times.

## Decision Points

**Phase 2 → Phase 3, the core epistemic rule:** "Never trust a spec to describe what the code does today. Trust it only to describe what was intended, then compare against reality." Code is read first specifically so the agent can identify the *delta* between intent and reality, rather than assuming either side is automatically correct.

**Phase 3, the Specification-First procedure** — before implementing, resolve to exactly one of three outcomes:

| Outcome | Meaning | Required action |
|---|---|---|
| Covered | Spec already correctly describes this behavior | Proceed |
| Requires modification | Spec is silent, incomplete, or intentionally changing | Update the spec *first*, same task, before writing code |
| Conflict | Spec and running code disagree, neither is being intentionally changed by this task | Stop. Report the conflict before the task is considered complete — resolve which side is authoritative, then correct the loser |

**Phase 3, the ADR gate:** does the change span more than one owned area, is it expensive to reverse, was it chosen among real alternatives, or would a future reader be unable to reconstruct the reasoning from the code alone? If any is true, an ADR must be written or an existing one superseded *before* implementation proceeds. See `07_adr_process.md`.

**Numbered decision trees** exist for the recurring cases ambiguous enough to need a documented default: adding a field to a shared interface, adding a persisted column, adding a new pluggable capability (in an integration/plugin architecture), changing a lifecycle state's transition rules, a consumer-side layer picking up a new field, adding a new UI surface, resolving a spec/code conflict, and deciding whether a change needs an ADR. Each decision tree names its **source of truth document** explicitly and gives an ordered sequence of steps — this is what lets an agent follow a known pattern mechanically instead of re-deriving the right sequence from first principles every time.

### Decision Tree — Refactor, or Implement the Feature Directly?

A recurring ambiguity Phase 4 (Implement) surfaces: mid-implementation, existing code looks like it needs restructuring before the new behavior fits cleanly. Refactoring and implementing are not the same action, and conflating them makes both harder to validate.

```
Does the existing code already support the new behavior with a
straightforward addition (new file/handler/section, per the
"one new file + one index line" pattern where applicable)?
        │
    ┌───┴───┐
   Yes      No
    │        │
Implement   Would refactoring first change any existing behavior,
directly,   contract, or ADR-governed decision?
no refactor         │
                 ┌───┴───┐
                Yes      No
                 │        │
           This is now      Refactor first (structure-only,
           an Architecture   no behavior change), validate the
           Change — resolve  refactor in isolation (L1 + a
           via the ADR gate  regression pass), then implement
           above before      the feature as a separate step.
           proceeding.
```

**Never bundle a refactor and a feature into one unvalidated step** — if the refactor changes behavior, it needs its own Decision Making pass; if it's purely structural, it still needs its own validation pass before the feature is layered on top, so a validation failure can be attributed to one or the other, not both at once.

## Implementation Rules (Phase 4)

Stated per layer, kept short, framed as hard constraints rather than guidance:
- A "thin routing/thin controller" rule: the entry-point layer validates input and delegates; it never contains business logic.
- An explicit list of what a shared/orchestration layer must never be called from directly (e.g., "routers never call the AI service directly — always through the domain service").
- A UI-layer rule against hardcoded style values — always resolve through the shared design-token layer.
- A "no new component if an existing one can be reused" rule for UI work specifically.
- A mechanical, per-change-type verification requirement is stated inline (e.g., "linter/analyzer must pass with zero errors after every change" for a UI layer).

## Review Gates

There is no separate human "approval" step documented as a distinct phase — review is embedded *inside* the phases themselves as mechanical checks:
- **Phase 5 (Verify)** is the cheapest gate: does the change even run/compile/import, per task type.
- **Phase 6 (Validate)** is the behavioral gate: response shapes match the contract doc, database state matches the schema doc, timeline/audit records exist with correct actor/event typing.
- **Phase 8 (Cross-Boundary Check)** is the gate most explicitly called out as commonly skipped — the reference project records a real incident where an entire new capability was invisible to the consuming layer because this check wasn't run, and treats that as the canonical cautionary example.
- **The SDD Drift Check** (see `05_validation_and_review.md`) functions as a final review gate at the end of every task, independent of what the task was.

## Approval / Sign-Off Flow

**(Explicit, `sdd/rules/ownership.md`'s cross-boundary rules)** — approval is area-based, not role-based: a new user-facing screen requires sign-off from the product/context area before the UI area implements it; a new API endpoint requires alignment with the interface contract document before the backend area implements it; an ADR whose consequences span more than one area requires sign-off from every affected area before it can be marked accepted.

## Release Flow

A release entry is written only when something is **actually deployed** — never at commit time, never speculatively. See `08_release_process.md`.

## Feedback Loops

- **Documentation → Implementation:** the Specification-First procedure's "Requires modification" outcome is a direct write-then-implement loop — the spec is updated first, and only then does implementation proceed against the now-current spec.
- **Implementation → Documentation:** Phase 7 (Sync Documentation) is the reverse loop — implementation reveals a spec is stale, and the spec is corrected before the task is considered done.
- **Consistency Audit → Everything:** the reference project's operating-model rollout was itself preceded by a full audit comparing every spec against the actual implementation, classifying every mismatch (consistent / outdated spec / implementation drift / missing spec / unused spec) before any new governance (ADR, Release) was introduced. **This is a general, reusable pattern for bootstrapping SDD onto an existing codebase that already has some documentation**: audit first, fix drift, only then add new structure — never build new governance on top of specs already known to be wrong.
- **SDD Drift Check → Archive:** if the drift check finds a document has become obsolete as a side effect of the current task, it is archived (not deleted) as part of finishing that same task, not deferred.
