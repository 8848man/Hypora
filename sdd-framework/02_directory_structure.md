# Directory Structure

## Canonical Layout

```
<repo-root>/
├── <agent-instructions-file>     # e.g. CLAUDE.md — always-loaded entry point
├── README.md                      # human-facing overview + documentation map
├── sdd/
│   ├── 00_index.md                # master index — every doc must be reachable from here
│   ├── context/                   # product/requirements layer (WHY the product exists)
│   ├── <layer>/                   # one directory per implementation layer (e.g. backend/, frontend/)
│   ├── <cross-cutting>/           # one directory per capability that spans layers (e.g. auth/)
│   ├── domain/                    # cross-cutting behavioral contracts (e.g. state machines)
│   ├── infra/                     # deployment + testing specs
│   ├── analysis/                  # ad hoc home for large, cross-layer authoritative specs
│   ├── architecture/decisions/    # ADRs — see 07_adr_process.md
│   ├── rules/                     # governance: ownership map, authoring rules
│   ├── workflow/                  # the process itself: lifecycle, decisions, validation
│   └── archive/                   # retired documents, preserved in full
└── release/                       # OUTSIDE sdd/ — see 08_release_process.md
```

Every directory below is evaluated for: why it exists, when documents are created there, when they stop being edited, what depends on it, what it depends on, whether it's mandatory, and its role in the workflow.

---

## `sdd/00_index.md` — Master Index

**Why it exists:** A single, always-reachable entry point that lists every spec document and its one-line purpose. Prevents documents from becoming undiscoverable.
**Created:** At project inception, before any other spec.
**Edited:** Every time a new spec file is added anywhere in `sdd/`, or an area is reorganized.
**Depends on:** Nothing.
**Depended on by:** Every other document indirectly (it's the map to find them).
**Mandatory:** Yes — this is the one directory-adjacent file with no substitute.

## `sdd/context/` — Product / Requirements Layer

**Why it exists:** Separates *why the product exists and what it should do for users* from *how it's implemented*. Contains requirements (ID-tagged, e.g. `FR-<AREA>-<NN>`), product scope/priorities, user flow, and per-screen/per-feature specs.
**Created:** At project inception, before implementation begins — this is upstream of all layer-specific specs.
**Edited:** When product scope changes, a new user-facing flow is added, or a screen's behavior changes.
**Depends on:** Nothing (it's the root of the dependency graph).
**Depended on by:** Every layer spec that implements a requirement should reference the requirement ID or user flow step it satisfies.
**Mandatory:** Yes for any product with a UI; a pure backend service could shrink this to just requirements.
**Role in workflow:** Explicitly *not* loaded by default for routine implementation tasks (see `05_validation_and_review.md`'s context-loading discipline) — it's a design-time reference, loaded only when evaluating scope or priorities, not on every task.

## `sdd/<layer>/` — Per-Implementation-Layer Specs (e.g. `backend/`, `frontend/`)

**Why it exists:** One directory per major implementation layer/service. Each contains: an architecture overview, an API/interface contract, a data-model/schema doc, and layer-specific integration specs (e.g. a third-party AI integration, an OCR sub-feature).
**Created:** As soon as that layer exists as a real codebase.
**Edited:** Whenever the layer's public contract changes (new endpoint, new field, new folder structure) — this is the most frequently edited tier of `sdd/`.
**Depends on:** `sdd/context/` (implements requirements), `sdd/domain/` (respects shared state machines).
**Depended on by:** The other layer's spec (frontend depends on backend's API spec), `sdd/rules/ownership.md` (declares who owns which files here).
**Mandatory:** Yes, one per real implementation layer.
**Note:** Large, single-purpose specs within a layer are pulled into their own file when they exceed the size guidance (see `03_document_lifecycle.md`) — e.g. a sub-feature's API contract or a third-party integration's prompt/parsing logic gets its own file rather than bloating the layer's main API spec.

## `sdd/<cross-cutting>/` — Capabilities Spanning Multiple Layers (e.g. `auth/`)

**Why it exists:** Some capabilities (authentication is the paradigm case) cannot be owned by a single layer directory without becoming either duplicated or incomplete — the frontend needs to know the token contract, the backend needs to know validation rules, and deployment needs to know required secrets. A dedicated directory holds an overview, an interface *contract* (binding on all layers), and one document per major operating mode (e.g. production vs. local development).
**Created:** As soon as a second layer needs to agree on a shared contract for this capability.
**Edited:** By whichever layer's implementation changed, but the *contract* document requires sign-off from every layer it binds.
**Depends on:** The layers it spans.
**Depended on by:** Every layer implementing this capability; the old single-layer stub (e.g. a `backend/07_auth_spec.md`-style file) becomes a **relocation stub** (see `03_document_lifecycle.md`) pointing here, kept permanently for backward-compatible cross-references rather than archived.
**Mandatory:** Only if a capability genuinely spans layers with a binding contract; do not create one for a capability fully owned by a single layer.

## `sdd/domain/` — Cross-Cutting Behavioral Contracts

**Why it exists:** Certain behavioral truths (state machines, lifecycle transitions) are referenced by multiple layers and must have exactly one authoritative definition — never redefined per-layer. A domain doc explicitly says "any spec that describes state must reference this document rather than re-defining transitions."
**Created:** As soon as a piece of business logic has more than one valid state and more than one layer touches it.
**Edited:** Whenever a new state, transition, or guard is added.
**Depends on:** Nothing.
**Depended on by:** Every layer spec and decision-flow entry that touches lifecycle logic.
**Mandatory:** Only if the domain has non-trivial state machines; trivial CRUD-only domains may not need this directory.

## `sdd/infra/` — Deployment and Testing Strategy

**Why it exists:** Separates "how this gets built, deployed, and verified" from "what it does." Covers cloud services used, CI/CD pipeline shape, environment variables, and the testing strategy/coverage targets per layer.
**Created:** As soon as there is a real deployment target (even a single manual deploy script counts).
**Edited:** Whenever the deployment pipeline, hosting target, or testing strategy changes.
**Depends on:** Every layer (documents their env vars and test targets).
**Depended on by:** `release/` (a release records that this pipeline actually ran); `sdd/architecture/decisions/` (an infra-architecture change may require an ADR).
**Mandatory:** Yes, even a one-paragraph version, once there is a real deployment.
**Convention observed:** a testing spec may run ahead of actual test coverage — mark not-yet-implemented sections explicitly (e.g. a `[STALE]` or "not yet implemented" tag) rather than silently leaving a doc that overstates coverage.

## `sdd/analysis/` — Large Cross-Layer Authoritative Specs (ad hoc, opt-in)

**Why it exists:** Occasionally a single feature's cross-layer contract (state machine + API contract + UX rendering rules, all tightly coupled) is too large and too authoritative to sit as a subsection of any one layer's spec, and splitting it across layer directories would fragment a single coherent contract. A dedicated directory holds these as standalone, versioned, ID-tagged documents (see `06_naming_and_versioning.md`) that explicitly declare themselves authoritative over any layer-specific document touching the same feature.
**Created:** Only when a feature's cross-layer contract genuinely doesn't fit the standard per-layer split — this is the exception path, not the default.
**Edited:** By whichever layer's understanding of the contract changed, with a version bump on any breaking change to the contract itself.
**Depends on:** The layers it spans.
**Depended on by:** Layer-specific docs that touch the same feature must reference (not duplicate) this document.
**Mandatory:** No — this is an escape hatch for one specific kind of complexity, not a standard directory every project needs.

## `sdd/architecture/decisions/` — ADRs

See `07_adr_process.md` for the full model. In summary: **Why**, not **what**. Peer to specification, not a subtype of it.

## `sdd/rules/` — Governance

**Why it exists:** Two permanent, rarely-changing documents: an **ownership map** (which area may modify which files; cross-boundary coordination rules) and **authoring rules** (size limits, writing style, splitting rules, the "specs must never contain commit hashes" rule).
**Created:** At project inception, before the first layer-specific spec is written — these rules govern how every other document in `sdd/` is written.
**Edited:** Rarely — only when a new area/owner is added, or when a governance rule itself needs revision.
**Depends on:** Nothing.
**Depended on by:** Every other document, indirectly, via the rules it must follow.
**Mandatory:** Yes.

## `sdd/workflow/` — The Process Itself

**Why it exists:** Documents *how work gets done*: the phase-by-phase implementation lifecycle, a task-type-to-required-docs loading matrix (to prevent context bloat), numbered decision trees for ambiguous implementation choices, and per-task-type validation checklists.
**Created:** At project inception, alongside `sdd/rules/`.
**Edited:** When the process itself changes — e.g. a new gate is added (this methodology itself was extended, in the reference project, to add an ADR gate and a release gate without rewriting the existing phases).
**Depends on:** `sdd/rules/` (references ownership for cross-boundary rules).
**Depended on by:** Literally every implementation task — this is the first thing read after the always-loaded agent-instructions file.
**Mandatory:** Yes — this is the operational core of the entire methodology.

## `sdd/archive/` — Retired Documents

**Why it exists:** When a document is superseded, its content is never deleted — it's moved here in full, with a short header explaining what superseded it and why. Prevents silent loss of historical reasoning while keeping the live tree free of dead weight.
**Created:** The first time any document is superseded.
**Edited:** Never (archived documents are frozen) — only new archived documents are added.
**Depends on:** Whatever it's archiving.
**Depended on by:** Nothing in the live tree should depend on an archived document; live documents may reference it as historical context only.
**Mandatory:** Not as an empty directory, but the *pattern* (archive, don't delete) is mandatory from the first document retirement onward.

## `release/` — Outside `sdd/` Entirely

See `08_release_process.md` for the full model. In summary: intentionally placed outside the specification tree because it records deployment history (tied to this specific repository's real infrastructure), not system design (which must remain portable even if the repository disappears).

## Directory-Level Dependency Summary

```
context/  ← (nothing)
domain/   ← (nothing)
rules/    ← (nothing)
<layer>/  ← context/, domain/
<cross-cutting>/ ← the layers it spans
analysis/ ← the layers it spans
infra/    ← every layer
architecture/decisions/ ← whatever it decided about; points at affected specs
archive/  ← whatever was superseded
workflow/ ← rules/
release/ (outside sdd/) ← git tags, optionally ADRs — never specs, never raw commit hashes
```

No directory should depend on `release/`. This one-directional rule is what keeps the specification tree independently reusable (see `01_philosophy.md`, Principle 2).
