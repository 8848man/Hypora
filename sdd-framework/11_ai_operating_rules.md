# AI Agent Operating Rules

Everything before this document describes the SDD methodology's *structure* — directories, document types, lifecycles, IDs. This document describes how an AI agent should actually **behave**, moment to moment, while working inside a project built on that structure. Read `01_philosophy.md` first — every rule below is that document's principles converted into decision rules an agent applies in real time.

**The one test behind all of them (see `01_philosophy.md`, Principle 5):** *would skipping this check let something silently become true without anyone having decided it?* Every rule below is that test applied to one recurring situation.

## Creating a New Feature

1. Resolve the Specification-First outcome (Covered / Requires Modification / Conflict) before writing any code — see `04_development_workflow.md`.
2. If "Requires Modification," write the spec change first, in the same task.
3. Check the ADR trigger list (`07_adr_process.md`). A new feature that follows an existing pattern (a new handler in an existing plugin architecture, a new CRUD endpoint, a new screen matching an existing reference) needs no ADR. A new feature that introduces a genuinely new pattern, or was chosen among real alternatives, does.
4. Implement, respecting the layering rules of whichever document type owns the affected area (`03_document_lifecycle.md`).
5. Close with validation, drift check, and the Artifact Decision Matrix (`05_validation_and_review.md`).

## Modifying Architecture

An architecture modification is any change that alters a decision an ADR already covers, or that would meet the ADR trigger list if it were being made for the first time. **Never implement one silently.** Either:
- The change is consistent with an existing ADR — implement, and cite the ADR in the commit.
- The change breaks an existing ADR's decision — write a new ADR that supersedes it *before* implementing, get cross-area sign-off if the ADR spans more than one owned area, then implement.
- You are not sure whether it breaks an existing ADR — treat this as "yes it might," check `sdd/architecture/decisions/000_index.md` for anything touching the affected area, and resolve the ambiguity before proceeding, not after.

## Editing a Specification

- Determine the document type first (`03_document_lifecycle.md`) — this tells you the required sections and who else needs to sign off.
- Never add a commit hash, PR number, or branch name to a spec, under any circumstance (`01_philosophy.md`, Principle 2). If you're tempted to write "as of commit X," that sentence belongs in a Release entry or an ADR's optional provenance field, not in the spec.
- Never add historical narrative to a spec ("we used to do X, then changed to Y") — that belongs in an ADR (if it was a decision) or a Release entry (if it was a delivered change), never inline in a living spec (`01_philosophy.md`, Principle 3).
- If the edit makes another document's claim about the same concept now wrong or redundant, fix that document in the same task — do not leave two documents disagreeing about the same concept (see `13_concept_ownership_model.md`).

## Updating Implementation

- Read the code before the spec (`04_development_workflow.md`, Phase 2) — never assume the spec already accurately describes current behavior.
- Follow the document-type-specific implementation rules for the layer you're touching (thin routing/controller layer, no hardcoded values where a shared token/config layer exists, no new component where an existing one can be reused, etc.).
- Run the mechanical verification appropriate to the change (does it compile/import/run) before moving to behavioral validation.

## Handling Implementation Drift (Spec Says X, Code Does Y)

This is a **Conflict** outcome in the Specification-First procedure, not a "just implement around it" situation.

1. Determine which side is actually correct using the conflict-resolution order (`04_development_workflow.md`, citing the reference project's Decision 8: an explicitly-noted divergence in the always-loaded instructions file wins; a recently-written file usually means the spec is stale; security-critical code is trusted over a conflicting spec; failing all else, check the file's own change history for intent).
2. Correct the losing document. Never leave the divergence undocumented, and never silently implement a third behavior that matches neither.
3. State the conflict and its resolution explicitly in the task's output — this is exactly the kind of thing the Artifact Decision Matrix and SDD Drift Check exist to surface, not bury in an unremarked code diff.

## Writing ADRs

- Confirm the trigger list actually fired (`07_adr_process.md`) before writing one — don't write an ADR for a decision that doesn't meet the bar; that's overhead the framework explicitly argues against.
- Write the "Alternatives Considered" section honestly, including the alternative you almost chose — an ADR without real rejected alternatives is far less useful to a future reader than one with them.
- Never edit an `Accepted` ADR's Decision or Consequences. If the decision has genuinely changed, write a new ADR and mark the old one superseded.
- Update the running ADR index in the same task — an ADR that exists but isn't indexed is, for practical purposes, undiscoverable.

## Performing Reviews

A review (of a PR, a diff, or a standalone request to "check this") should apply the same Specification-First and ADR-trigger tests as if you were about to implement the change yourself, but in reverse: does this diff match what the spec says should happen? Does it silently break an existing ADR's decision without superseding it? Does it introduce a new cross-layer field without updating the consuming side? Report findings the same way the SDD Drift Check would — explicitly, even "no findings," never silently.

## Performing Validation

Run every validation level the change actually triggers (`05_validation_and_review.md`, L1–L5) — do not stop at L1 because the code compiles. A change that compiles but returns the wrong shape, transitions to an invalid state, or breaks the consuming layer is not validated, regardless of what a linter says.

## Updating Indexes

Any time a document is added, archived, or relocated, the relevant index (`sdd/00_index.md`, an ADR index, a release index) is updated in the **same task** — never treated as a follow-up. An unindexed document is, in practice, invisible to the next agent working in the project.

## Deprecating Documents

Deprecation applies to an artifact whose *content is still correct* but is no longer the recommended path (e.g., an ADR whose decision no longer applies because the feature it governed was removed, distinct from being superseded by a better decision). Mark it `Deprecated`, state why, and do not delete it.

## Archiving Obsolete Specifications

See the decision tree in `14_evolution_rules.md`. In summary: archive (never delete) the moment a document's content is no longer live and has any historical/reasoning value — which is nearly always. Use the correct header pattern (Archived vs. Relocated — `06_naming_and_versioning.md`) depending on whether the content was superseded or simply moved.

## When an Agent Should Refuse to Proceed

Refuse (or stop and ask) rather than proceed when:
- A requested change would silently break an existing ADR's decision and the requester hasn't authorized writing a superseding ADR.
- A requested spec edit would introduce a commit hash, PR reference, or historical narrative into a living specification.
- A requested change touches a shared/cross-cutting contract document and you cannot get (or don't have) sign-off from every area it binds.
- Validation cannot actually be run (not just "was skipped for time") and the change is non-trivial — say so explicitly rather than reporting success.
- You are asked to delete historical documentation rather than archive it, without an explicit, specific instruction to actually delete (not just "clean up").

### Decision Tree — Request Human Review, or Continue Autonomously?

The five conditions above are specific instances of one general test, made explicit here as a tree so it can be applied to a situation not already on that list:

```
Does proceeding require a decision only a human can make
(authorization, a trade-off with no framework-derivable answer,
sign-off from an area you cannot reach), as opposed to a mechanical
step you can execute yourself?
        │
    ┌───┴───┐
   Yes      No
    │        │
 Stop.   Would proceeding without asking risk something becoming
 State   silently true that nobody actually decided (01_philosophy.md,
 what    Principle 5's unifying test)?
 you            │
 need,      ┌───┴───┐
 wait.     Yes      No
            │        │
          Stop.   Continue autonomously — this is exactly the
          Ask.     "no change required, stated explicitly" case,
                    not a silent skip.
```

Never resolve ambiguity here by guessing and proceeding — a wrong guess that isn't flagged is strictly worse than a stopped task, because it looks completed.

## What "Repository Maintainer, Not Code Generator" Means in Practice

Concretely, not just as a slogan: an agent operating under this framework treats the *documentation tree's long-term integrity* as part of the deliverable of every task, not a separate concern someone else handles later. A task that produces working code but leaves the spec wrong, an ADR unwritten for a real architectural change, or an orphaned document unarchived is an **incomplete task**, even if the code itself is correct and merged.
