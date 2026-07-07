# Document Types and Lifecycle

This catalogs every recurring *type* of document observed in the reference project, independent of which directory it lives in. Use this to decide what kind of document you're creating when starting a new one.

---

## 1. Master Index

**Purpose:** Single reachable map of every document + one-line purpose, grouped by area.
**Owner:** Whoever is doing the reorganization at the time; no permanent owner.
**Lifecycle:** Created once, at project inception. Never retired.
**Required sections:** One table per area, each row linking to a document with a one-line purpose. A "Key Conventions" summary is common at the bottom (ID formats, enum values, global rules worth restating in one place).
**Dependencies:** None in, everything out.
**Creation timing:** Before any other spec exists.
**Update timing:** Every time a document is added, removed, or an area is restructured.
**Completion criteria:** Every document in the tree is reachable from here within one click.

## 2. Layer Architecture Document

**Purpose:** Describes one implementation layer's folder structure, layering rules (what's allowed to call what), and its core dependency list.
**Owner:** The team/agent area responsible for that layer.
**Lifecycle:** Created as soon as the layer exists as real code (even a skeleton). Edited whenever the folder structure or layering rules change — not for every feature addition within the existing structure.
**Required sections:** Folder tree (annotated inline with one-line comments per file/directory), layering rules as a bullet list ("X never calls Y directly"), and a dependency/package list.
**Dependencies:** References the layer's own contract doc (e.g., API spec) and any cross-cutting docs it must obey (e.g., auth contract).
**Creation timing:** Alongside the first real implementation of the layer.
**Update timing:** Any structural change — new top-level module, new layering rule, new major dependency.
**Completion criteria:** A new contributor (human or AI) can locate the right file for a given responsibility using only this document.

## 3. Interface / Contract Document

**Purpose:** The binding request/response or interface contract other layers implement against (e.g., an API spec, an interface class definition).
**Owner:** The layer that serves the contract; consumers must not redefine it independently.
**Lifecycle:** Created as soon as the first real endpoint/interface exists. This is the single most frequently edited document type in the entire tree.
**Required sections:** Common conventions (timestamp format, error shape, enum values) stated once at the top; one section per operation/endpoint with exact request/response shapes; an error-code table.
**Dependencies:** Depends on the schema/data-model doc for field shapes; depended on by every consumer-side document (e.g., a frontend entity spec) and by the mock-data spec if one exists.
**Creation timing:** Before or alongside the first real implementation of the contract — "spec leads implementation" for any new field or endpoint.
**Update timing:** Every single change to a request/response shape, in the same commit as the implementation change.
**Completion criteria:** No endpoint/interface exists in code that isn't described here, and nothing described here has silently drifted from what the code returns (verified in a periodic consistency audit — see `05_validation_and_review.md`).

## 4. Schema / Data Model Document

**Purpose:** The authoritative table/field/type definitions for persisted data.
**Owner:** Whichever area owns the data layer (often a distinct "Database" area separate from general backend).
**Lifecycle:** Created with the first schema migration. Edited every time a migration is written — never edited independently of one.
**Required sections:** Design principles stated once (PK format, timestamp format, naming convention); one block per table with inline comments on enum values and non-obvious constraints; a migrations list in true dependency order (not just "recent ones").
**Dependencies:** None in (this is close to the root of the layer's dependency graph); depended on by the interface/contract document for field shapes.
**Creation timing:** Alongside the first migration tool setup.
**Update timing:** Every migration, in the same task as writing the migration file — never batched up and reconciled later. This document's own migration list is verified against the actual migration files' dependency chain periodically, since it degrades the moment someone trusts "recent memory" instead of re-deriving the chain from the files themselves.
**Completion criteria:** The documented migration list, read in order, exactly reconstructs the real migration dependency chain in the codebase.

## 5. Integration Spec (Third-Party Service / Sub-Feature)

**Purpose:** Documents an integration with an external system (an LLM API, an OCR service) or a self-contained sub-feature (e.g. a plugin architecture for one category of capability): the architecture pattern used, the registered capabilities, prompt/parsing templates if applicable, and error handling.
**Owner:** The area responsible for that integration.
**Lifecycle:** Created when the integration is first built. Edited when a new capability/handler is added (see `sdd/rules/ownership.md`-style cross-boundary rule: adding a capability should require touching only this document plus one new implementation file, never a change to the shared orchestration logic).
**Required sections:** Architecture pattern diagram/description; a table of registered capabilities; the execution flow (especially if it involves a multi-step transaction pattern); one section per capability with its exact prompt/parsing contract if applicable; an error-handling table.
**Dependencies:** Depends on the layer architecture doc; depended on by the interface/contract doc for any new fields the integration produces.
**Creation timing:** Alongside the first working version of the integration.
**Update timing:** Every new registered capability, every prompt change, every output-shape change (paired with an explicit output-schema-version bump if outputs are persisted).
**Completion criteria:** Adding a new capability required editing only this document and adding one new file — if it required touching shared orchestration code, the architecture pattern itself may need reconsidering (candidate for an ADR).

## 6. Domain / State Machine Document

**Purpose:** The single authoritative definition of a business entity's valid states and transitions.
**Owner:** Shared between the layer that enforces transitions and the layer(s) that render/react to state.
**Lifecycle:** Created as soon as an entity has more than one state and more than one layer cares about it. Edited whenever a state or transition is added or a guard changes.
**Required sections:** One diagram or table per entity's lifecycle; an explicit from/to/trigger/guard table; an explicit list of invalid transitions and how they must be rejected.
**Dependencies:** None in; depended on by every layer's contract/architecture doc that touches the entity's state.
**Creation timing:** As soon as a second lifecycle state is introduced for any entity.
**Update timing:** Every new transition, in the same task that implements it.
**Completion criteria:** No code path exists that changes this entity's state via a transition not listed here.

## 7. Cross-Cutting Capability Set (Overview + Per-Mode Documents)

**Purpose:** For a capability spanning layers (see `02_directory_structure.md`), a small family of documents: one overview (mechanisms, environment model, document map for this family), one binding interface contract, and one document per major operating mode (e.g. production vs. local-development).
**Owner:** Jointly by every layer the capability spans; the contract document specifically requires cross-area sign-off to change.
**Lifecycle:** Created when a second layer needs to agree on this capability's contract. Edited by whichever layer's implementation changed; the contract document only changes with agreement from every bound layer.
**Required sections (overview doc):** mechanisms table, environment/mode model, links to the other documents in the family. **Required sections (contract doc):** the shared entity/interface definition, the required token/message format, a per-implementation behavior table. **Required sections (per-mode doc):** the mode-specific architecture, an explicit production-safety-guard section if the mode is not the production default.
**Dependencies:** Every layer implementing the capability.
**Creation timing:** The moment a capability needs a second implementation mode (e.g. a production auth flow plus a local-development bypass) — this is usually when the family first becomes necessary, even if only one mode existed before.
**Update timing:** Any change to the shared contract requires updating the contract doc in the same task; a mode-specific implementation detail only requires updating that mode's document.
**Completion criteria:** Every implementation of this capability (in every layer, every mode) satisfies the contract document without needing an undocumented exception.

## 8. Rules Document (Ownership Map / Authoring Rules)

**Purpose:** Permanent governance — who may touch what, and how documents must be written.
**Owner:** No single area; changed by consensus/whoever is doing repository-wide governance work.
**Lifecycle:** Created at project inception. Edited rarely — adding a new area/owner, or revising a governance rule itself.
**Required sections (ownership map):** a table of area → owned files → forbidden files; a cross-boundary rules section for changes spanning areas. **Required sections (authoring rules):** size tiers (target/soft-limit/hard-limit line counts), a file-splitting rule, a writing-style preference list (bullets/tables over narrative prose), a duplication rule (reference, don't copy).
**Dependencies:** None in; every other document depends on these rules indirectly.
**Creation timing:** Before the first layer-specific spec.
**Update timing:** Only when the governance model itself changes (a new area appears; a new artifact type like ADR or Release is introduced and needs an ownership row).
**Completion criteria:** Every file in the repository is unambiguously owned by exactly one area (or explicitly requires coordination between named areas).

## 9. Workflow / Process Document

**Purpose:** How work actually gets done — the lifecycle, the context-loading matrix, decision trees, validation checklists.
**Owner:** Whoever maintains the process; typically evolves via the same "operating model" style rollout that introduced ADR/Release in the reference project.
**Lifecycle:** Created at project inception alongside rules. Extended (not replaced) as the methodology matures — the reference project added an ADR gate and a Release phase to its existing lifecycle document rather than writing a competing document.
**Required sections:** See `04_development_workflow.md` and `05_validation_and_review.md` for the full breakdown of what belongs in this document family.
**Dependencies:** References the rules documents for cross-boundary coordination.
**Creation timing:** Before the first implementation task, ideally on day one.
**Update timing:** Whenever the process itself changes — this should be rare and deliberate, since every implementation task is trusting this document's stability.
**Completion criteria:** A new AI agent, given only the always-loaded instructions file and this document family, can execute a correctly-scoped implementation task without further clarification.

## 10. Relocation Stub

**Purpose:** When a document's content moves to a new canonical location (not because it's obsolete, but because it was miscategorized or a cross-cutting home became necessary), the old path becomes a short, permanent redirect. This is distinct from archival (#11) — nothing here is being retired, only relocated.
**Owner:** Whoever owns the new canonical location.
**Lifecycle:** Created at the moment of relocation. Kept permanently — never itself archived, since old cross-references may still point at it indefinitely.
**Required sections:** A one-line "moved" notice, a table of the new documents and what each contains, and an explicit instruction to update references.
**Dependencies:** Points at the new canonical location.
**Creation timing:** The moment content moves.
**Update timing:** Essentially never, once written.
**Completion criteria:** Any old link to the original path still lands somewhere useful.

## 11. Archived Document

**Purpose:** Preserves superseded content in full, so historical reasoning is never lost, while keeping the live tree free of dead or contradicting duplicates.
**Owner:** Whoever retired the original.
**Lifecycle:** Created at the moment of retirement. Frozen forever after — an archived document is never edited again except to fix its own archival header.
**Required sections:** An "Archived" header stating what superseded it and why, followed by the original content unchanged.
**Dependencies:** None in; the live document that superseded it may reference it as historical context.
**Creation timing:** The moment a document is superseded, an orphaned analysis is resolved, or a document is found to have no live purpose but real historical value.
**Update timing:** Never (frozen), except the one-time header addition.
**Completion criteria:** No content is deleted; the live tree contains no two documents making contradictory claims about the same thing.

## 12. Large Cross-Layer Authoritative Spec (versioned, ID-tagged)

**Purpose:** For the rare feature whose cross-layer contract is both large and singularly authoritative (see `sdd/analysis/` in `02_directory_structure.md`), a self-contained document carries its own identity metadata rather than relying only on its filename.
**Owner:** Jointly by the layers it spans; changes to the contract itself require the same cross-area coordination as a cross-cutting capability document.
**Lifecycle:** Created when a feature's cross-layer contract becomes too large/central to live as a subsection anywhere else. Versioned explicitly — bump the version on any change to the contract that could break an implementer relying on the old version.
**Required sections:** A frontmatter block (Document ID, Version, Status, supersession note if any, scope, audience); the contract itself, structured however the domain requires (state machine + API + rendering rules, for instance).
**Dependencies:** The layers it spans; explicitly declares itself authoritative over any competing definition elsewhere, and other documents must reference it rather than redefine the same contract.
**Creation timing:** Rare — only when the standard per-layer split genuinely doesn't fit.
**Update timing:** On any change to the contract; version bump is mandatory for breaking changes.
**Completion criteria:** No other document in the tree redefines any part of the contract this document owns.

**Type 7 vs. Type 12 — how to tell them apart:** both handle a contract spanning layers, and it's easy to pick the wrong one. Use this test: **does the capability need a genuinely different document per implementation mode** (e.g., production auth vs. local-dev auth — different mechanisms, same contract)? If yes, it's Type 7 (Cross-Cutting Capability Set) — split by mode, with one binding contract doc shared across modes. **Is it instead one single, tightly-coupled behavioral contract** (one state machine + one API surface + one set of rendering rules, all describing the same feature, none of which make sense read independently of the others)? If yes, it's Type 12 (Large Cross-Layer Authoritative Spec) — kept as one versioned document specifically because splitting it by layer would fragment a contract that only makes sense as a whole. If a case seems to fit both, default to Type 7 unless there is no natural "mode" axis to split by.

## 13. Agent Runtime Model

**Purpose:** the execution-semantics view of the development workflow — states an executing agent occupies, transitions between them, and entry/exit conditions per state. Distinct from a Workflow/Process Document (#9), which describes the *methodology* narratively; this type describes the same process as a formal state machine.
**Owner:** Whoever maintains the process, same as the Workflow/Process Document — the two should be kept in sync but are not merged, since they serve different readers (a human/agent following the process step by step vs. one reasoning about valid states and transitions).
**Lifecycle:** Created once the project's process is stable enough that an explicit state model adds value beyond the narrative version — premature for a brand-new project's first few tasks, worth creating once the pipeline has real branch/loop points (validation failures routing back to implementation, escalations to human review) that are easier to reason about as states than as prose.
**Required sections:** A state table (responsibility, entry condition, exit condition per state); a state diagram; an explicit mandatory/optional/repeatable classification per state; a failure-handling and recovery section; a consolidated index of the recurring decisions that trigger transitions (pointing at, never restating, each decision's canonical home).
**Dependencies:** The Workflow/Process Document (source of the phase sequence this reframes); every document that owns an individual decision tree referenced in the consolidated index.
**Creation timing:** After the narrative workflow document is stable; not needed for very early-stage projects.
**Update timing:** Any time a new state, transition, or loop is added to the actual process — kept in lockstep with the Workflow/Process Document's own phase changes.
**Completion criteria:** Every phase in the narrative Workflow/Process Document maps to exactly one state here, and every decision tree that exists anywhere in the documentation set appears in this type's consolidated index.

---

**ADRs and Release entries are distinct enough in lifecycle rules (immutability, tagging, rollup direction) to warrant their own documents** — see `07_adr_process.md` and `08_release_process.md`.
