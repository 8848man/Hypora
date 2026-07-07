# Bootstrap Guide — Setting Up SDD in a New Project

This is the actionable, one-time zero-to-one checklist. Everything else in this document set is the reasoning behind these steps — read it if a step here doesn't make sense on its own. **For how the tree evolves after bootstrap** (when to create vs. extend vs. split vs. archive vs. reorganize, on an ongoing basis), see `14_evolution_rules.md` — that document, not this one, governs the project's entire life after Step 9 below.

## Step 0 — If You're Retrofitting an Existing Codebase, Audit First

**(Explicit, evidenced by the reference project's own history)** — if the new project already has some code and some documentation, do not start by adding ADR/Release/new governance. First, run a full consistency audit: compare every existing spec against the actual implementation, and classify every mismatch as one of: consistent, outdated spec, implementation drift, missing spec, or unused spec. Fix the Critical/High findings (specs that would be actively misleading to a new document built on top of them) **before** proceeding to Step 1. Building new governance on top of specs already known to be wrong just gives the wrong information a more official-looking home.

If this is a genuinely greenfield project with no existing code or docs, skip to Step 1.

## Step 1 — Create the Governance Layer First

Before writing a single feature spec, create:

1. `sdd/rules/spec_authoring_rules.md` — size tiers, splitting rule, writing-style preference (bullets/tables over narrative), the "specs never contain commit hashes/PR numbers/branch names" rule, a duplication rule (reference, don't copy).
2. `sdd/rules/ownership.md` — even with just one or two areas at this stage (it will grow as areas are added). Include a cross-boundary-rules section, even if currently empty.
3. `sdd/workflow/00_implementation_lifecycle.md` — start with the phase sequence in `04_development_workflow.md` of this document set. It's fine to start smaller than the reference project's final state (which had already been extended with ADR/Release phases) — start with Context Load → Analysis → Decision Check → Implement → Verify → Validate → Sync Docs, and extend it later exactly the way the reference project did (adding phases, never replacing the document).
4. `sdd/workflow/01_context_loading.md` — even a rough first version prevents the "load everything" anti-pattern from taking hold early.
5. `sdd/00_index.md` — the master index, empty except for pointers to the four documents above.

**Why governance first:** every subsequent document you write should already be following the authoring rules and be reachable from the index. Writing feature specs before governance means retrofitting style/size compliance later, which never fully happens in practice.

## Step 2 — Create the Product/Context Layer

`sdd/context/` — requirements (with an ID scheme, e.g. `FR-<AREA>-<NN>`), product scope/priorities, user flow. This is upstream of everything else; every implementation-layer spec should eventually be traceable back to a requirement here.

**Mandatory** if there's a user-facing product. A pure internal service/library could shrink this to a short requirements-only document.

## Step 3 — Create One Directory Per Implementation Layer, As Each Layer Comes Into Existence

Don't pre-create `sdd/backend/`, `sdd/frontend/`, etc. all at once if only one layer exists yet — create each layer's directory (architecture doc + interface/contract doc + schema doc as applicable) at the point that layer has real code, not before. Each new layer directory requires one addition to `sdd/00_index.md` and one row in `sdd/rules/ownership.md`.

**Mandatory:** one per real implementation layer, once it exists. **Optional/deferred:** don't create a directory for a layer that doesn't exist yet, even if it's planned.

## Step 4 — Create Cross-Cutting Capability Directories Only When a Second Layer Needs the Contract

Wait until a capability (authentication is the paradigm example) genuinely needs to be agreed upon by more than one layer before creating its dedicated directory. If a single layer currently owns the entire capability, document it inside that layer's own directory — promote it to a dedicated cross-cutting directory only at the moment a second layer needs a binding contract, and leave a relocation stub at the old location (see `03_document_lifecycle.md`, Relocation Stub) rather than breaking existing references.

## Step 5 — Create `sdd/domain/` As Soon As Any Entity Has More Than One Lifecycle State

Don't wait for complexity to accumulate. The moment a business entity has a second valid state, create the domain document and declare it the single authoritative source for that entity's transitions — every layer spec touching that entity's state must reference it, never redefine it.

## Step 6 — Create `sdd/infra/` As Soon As There's a Real Deployment Target

Even a one-paragraph deployment doc, the moment there's a real (even manual) deploy process. Add the testing strategy document alongside it, and mark any section describing not-yet-implemented test coverage explicitly (e.g., a stale/pending tag) rather than letting the document imply coverage that doesn't exist yet.

## Step 7 — Introduce ADR the First Time a Genuinely Hard, Multi-Alternative Decision Is Made

Don't front-load ADR creation before any real architectural decision has happened — an empty ADR directory full of hypothetical decisions is worse than no ADR directory at all. The moment a decision meets the trigger list in `07_adr_process.md` (spans multiple areas, expensive to reverse, real alternatives existed, not reconstructible from code alone), create `sdd/architecture/decisions/` with a template and an index, write that first ADR, and register the new area (index + ownership row + README row — the three-step registration ritual in `09_implicit_conventions.md` #5).

If retrofitting an existing project (Step 0), backfill ADRs for the handful of already-made significant decisions at this point, mining any existing informal design-discussion documents before archiving them.

## Step 8 — Introduce Release Management the First Time Something Is Actually Deployed to Real Users

Same "don't front-load it" principle as ADR. The moment there's a first real deployment worth recording, create `release/` (outside `sdd/`), cut the first git tag for each independently-deployable component (even if it's just `v1.0.0` at the current commit, to establish the baseline), and write the first release entries. If there's an existing informal changelog file, migrate it in per `08_release_process.md`'s migration guidance and archive the original.

## Step 9 — From Here On, Every Task Follows the Full Lifecycle Automatically

Once Steps 1–8 (as applicable — 7 and 8 may come much later than 1–6) are in place, every implementation task — bug fix, feature, refactor, architecture change, deployment change, documentation change, infrastructure change — automatically runs the full phase sequence from `04_development_workflow.md`, ending in the mandatory SDD Drift Check and Artifact Decision Matrix from `05_validation_and_review.md`. No task should need to be told to follow this; it should be stated once, prominently, in the project's always-loaded entry-point instructions.

## Mandatory vs. Optional Summary

| Component | Mandatory? | When |
|---|---|---|
| `sdd/00_index.md` | Always | Day one |
| `sdd/rules/spec_authoring_rules.md` | Always | Day one |
| `sdd/rules/ownership.md` | Always | Day one |
| `sdd/workflow/00_implementation_lifecycle.md` | Always | Day one |
| `sdd/workflow/01_context_loading.md` | Always | Day one, can start minimal |
| `sdd/context/` | Yes for user-facing products; minimal for pure services | Before implementation begins |
| `sdd/<layer>/` per layer | Yes, one per real layer | When that layer has real code |
| `sdd/<cross-cutting>/` | Only if a capability genuinely spans layers | When a second layer needs the contract |
| `sdd/domain/` | Only if entities have non-trivial state | First multi-state entity |
| `sdd/infra/` | Yes, even minimal | First real deployment target |
| `sdd/analysis/` | No — escape hatch only | Only if a feature's contract genuinely doesn't fit the per-layer split |
| `sdd/architecture/decisions/` | No, until the first qualifying decision | First decision meeting the ADR trigger list |
| `release/` | No, until the first real deployment | First actual deploy |
| `sdd/archive/` | Not as an empty directory; the *pattern* is mandatory | First document retirement |

## First-Review Sequence (the first time a change is reviewed on a freshly bootstrapped project)

1. Confirm the reviewer (human or agent) has read the always-loaded instructions file and the workflow/lifecycle document — not the full `sdd-framework/` set, just the entry points a real task would load.
2. Check the change against `13_concept_ownership_model.md`: does it introduce a fact that already has an owner elsewhere? This catches duplication before it's committed, which is cheaper than catching it in a later audit.
3. Apply the Specification-First and ADR-gate decision trees (`04_development_workflow.md`) as if reviewing, not authoring: does the diff match what the spec says should happen? Does it silently touch something an ADR should govern?
4. Confirm the Artifact Decision Matrix was actually produced for the change, not skipped because the project is new and "nothing's really been decided yet" — the matrix is exactly as mandatory on day one as it is a year in.

## First-Validation Sequence (the first time validation is exercised on a freshly bootstrapped project)

1. Run L1 (syntax/compile) — this should already be trivially true for a new project's first change; if it isn't, something is wrong with the bootstrap itself, not the change.
2. Confirm the validation-levels document (`05_validation_and_review.md`'s tiering, instantiated as the project's own `03_validation.md`-equivalent) actually has at least one concrete checklist populated for the project's first real task type — an empty validation document that only says "validate appropriately" is not sufficient; the first real task should produce the first real concrete checklist entry, and every task afterward should either reuse or extend it.
3. Confirm the SDD Drift Check ran even on this very first task and produced an explicit result (almost certainly "no drift, nothing yet to check against" — state that explicitly rather than omitting the check because it feels vacuous on task one).

**Why bother running these mostly-trivial first passes explicitly:** the habit formed on task one is the habit that persists. A project that skips review/validation formality "because it's still early" tends to never fully adopt it once real complexity arrives.
