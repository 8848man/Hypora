# Validation and Review

## Validation Levels

**(Explicit, `sdd/workflow/03_validation.md`)** — the reference project defines five validation levels, each triggered by a different scope of change, run in ascending order of behavioral depth:

| Level | Triggered by | Checks |
|---|---|---|
| L1 — Syntax | Every change, no exception | Imports, types, compilation/analyzer pass |
| L2 — Contract | Any interface/schema change | Request/response shapes, field names, status codes match the contract document exactly |
| L3 — Behavioral | Any logic change | State transitions, persisted-state consistency, audit/timeline records |
| L4 — Integration | Any change crossing a layer boundary | Consumer-side layer is updated to match the producer-side change |
| L5 — Product | Any user-visible change | UX flow, loading states, error states, empty states |

**Per-task-type checklists** exist as concrete, copy-pasteable checkbox lists rather than abstract descriptions — e.g., a checklist for "adding a persisted column" spells out exactly which naming rule, which constraint check, which migration property (idempotency, correct down-revision) must hold, rather than saying "validate the migration is correct."

**Completion rule:** "A change that cannot be verified is not done." Validation is not a separate QA phase bolted on after implementation — it's Phase 6 of the same lifecycle, and a task is explicitly defined as incomplete without it.

### Decision Tree — Which Validation Level(s) Apply?

```
L1 always applies — no exception.
        │
Does the change touch an interface/schema shape (request, response,
persisted field)?
        │
    ┌───┴───┐
   Yes      No
    │        │
   +L2   Does the change alter logic/behavior (not just shape)?
    │            │
    │        ┌───┴───┐
    │       Yes      No
    │        │        │
    │      +L3    Does the change cross a layer boundary
    │        │    (producer/consumer)?
    │        │            │
    │        │        ┌───┴───┐
    │        │       Yes      No
    │        │        │        │
    │        │      +L4    stop here
    │        │        │
    └────────┴────────┴── Is the change user-visible?
                                    │
                                ┌───┴───┐
                               Yes      No
                                │        │
                              +L5    stop here
```

Run every level the chain accumulates — they are additive, not alternatives. A change can legitimately require L1+L2+L3+L4+L5 simultaneously.

## Context-Loading Discipline

Governed by a dedicated per-task-type matrix — see `12_context_loading_strategy.md` for the full mandatory/recommended/optional/never breakdown. In short: this exists to prevent two failure modes symmetrically — an agent that doesn't load enough context to make a correct change, and an agent that loads so much "just in case" that output quality degrades. The core rule worth restating here because it governs validation specifically: **load the code before the spec** — the spec describes intent, the code describes current reality, and you need reality first to spot the delta between the two.

## Cross-Boundary Validation

A specific, always-run checklist for changes that touch a shared interface/schema, framed as "field added on the producing side → is it consumed correctly on the receiving side" pairs:

| Check | How to verify |
|---|---|
| Producer-side field added | Does the consumer-side data model include it? |
| Producer-side field removed | Does the consumer handle its absence without crashing (not just "does it compile")? |
| New endpoint/operation added | Does the consumer's endpoint registry and datasource/client method exist for it? |
| New persisted column added | Does the interface/contract document reflect it if it's ever exposed? |

**(Explicit)** — this is called out as "the most commonly missed check," with a real, named incident cited as the reason it exists at all: a capability was fully implemented on the producing side and completely invisible on the consuming side because this specific check was skipped. New projects should treat this pattern — a small, concrete "producer changed X, did the consumer handle it" table — as mandatory scaffolding from day one, not something to add after the first cross-boundary incident.

## SDD Drift Check (Mandatory Close-Out, Every Task)

Independent of what the task was, every task ends with this explicit five-part check, and the task is not complete until it has run and its findings — including "nothing found" — are stated:

1. **Implementation ↔ Specification** — does the changed code still match what the relevant spec(s) say?
2. **Architecture ↔ ADR** — if this touched an area governed by an existing ADR, does the implementation still honor it? An unresolved contradiction here means either the implementation is wrong or the ADR needs superseding — it cannot be left ambiguous.
3. **Release ↔ Current state** — if release records exist for the affected component, do they still describe what's actually deployed?
4. **Folder ownership** — does the ownership map still correctly describe who owns what was touched?
5. **Obsolete documentation** — did this task make anything obsolete? If so, archive it in the same task.

## Artifact Decision Matrix (Mandatory Output, Every Task)

The explicit, stated output at the end of every implementation task — not narrated in prose, but as a literal table, so it's scannable and auditable across many tasks over time:

| Artifact | Change? | Reasoning |
|---|---|---|
| Specification | Yes / No | one line |
| ADR | Yes / No | which trigger fired, or why none did |
| Release | Yes / No | was this actually deployed, or pending |
| Validation | which levels ran | |
| Version | Yes / No / which component | |
| Git Commit | Yes / No | which spec/ADR it references |

**Why a literal table, not prose:** a table of six fixed rows is what makes "did we actually check this" auditable after the fact, across dozens of tasks, without re-reading every task's full narrative. This is the single artifact that makes the "mandatory to evaluate, conditional to edit" principle (see `01_philosophy.md`, Principle 5) verifiable rather than just asserted.

## Review Sequencing (Inferred)

**(Inferred)** — no document states this as an explicit rule, but it is followed consistently across every recorded multi-phase change in the reference project's history: spec update → implementation → validation happen in that order within a single task, never implementation → validation → spec update as an afterthought. The one place this is stated explicitly is narrower ("spec sync is part of the same commit as implementation"), but the broader ordering (spec-before-code whenever the Specification-First procedure resolves to "Requires modification") is consistently observed rather than separately written down as a general sequencing rule.
