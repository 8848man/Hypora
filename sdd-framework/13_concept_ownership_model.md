# Concept Ownership Model

`02_directory_structure.md` maps *directories* to their dependencies. This document maps *concepts* — the actual facts a project's documentation needs to state — to exactly one canonical owner each, plus who may reference that fact and who must never restate it. This is the model that actively prevents duplication: before writing a fact into any document, check this table first. If the concept already has an owner, reference it; only write the fact down again if you are that owner making a real update.

| Concept | Canonical Owner | May Reference | Must Never Duplicate |
|---|---|---|---|
| Product requirement / user-facing intent | The requirements/product spec (context layer) | Any layer spec, by citing the requirement ID | A layer spec restating full requirement prose instead of citing the ID |
| Interface/API request-response shape | The layer's contract/interface document | Consumer-side entity/model docs, a mock-data spec if one exists, an integration spec producing the field | Any second document restating the full shape rather than pointing at the contract doc |
| Persisted data schema (tables, fields, types, constraints) | The layer's schema document | The contract document (for field shapes exposed via the interface), integration specs (for fields they produce) | A layer architecture document restating full table definitions |
| Business entity lifecycle (states, transitions, guards) | The domain/state-machine document | Every layer spec whose implementation enforces or reacts to a transition | Any layer spec redefining a transition instead of referencing the domain document |
| A cross-cutting capability's binding contract (e.g. token format, shared interface) | The capability's dedicated contract document | Every layer's own architecture document, by reference | A layer architecture document restating the token/message format instead of linking to the contract |
| Architectural decision rationale (why, alternatives considered) | The specific ADR that recorded it | Any spec whose current behavior follows from that decision, by ADR ID | A spec restating the decision's reasoning inline instead of citing the ADR |
| ID/naming/versioning scheme for a specific artifact type | The process document owning that artifact type (ADR scheme → the ADR process doc; release scheme → the release process doc; requirement IDs / file-numbering → the naming-and-versioning doc, since no other doc owns those) | A comparative/summary document, explicitly marked as comparison-only | Any second document giving its own independent definition of the same scheme |
| Deployment/environment configuration (required variables, secrets, targets) | The infrastructure/deployment document | Every layer's own docs, by reference to "see infra doc for required vars" | A layer document restating the full environment-variable list |
| What was actually deployed, when, at which version | The release logs (component and rollup) | An ADR's optional narrative mention; nothing else | Any specification (specs remain release-unaware by design — see `01_philosophy.md`, Principle 2 corollary in `08_release_process.md`) |
| Who owns which files, and cross-area coordination rules | The ownership map (rules document) | Every other document, implicitly, by following its rules | Any document redefining ownership boundaries independently |
| Document authoring style, size limits, splitting rules | The authoring-rules document | Every document, implicitly | Any document inventing its own competing style/size rule |
| The implementation lifecycle / phase sequence itself | The single canonical workflow/lifecycle document | Every other process document, by reference | A second, competing workflow document (extend the canonical one instead — see `14_evolution_rules.md`) |
| Validation criteria for a given task type | The validation-levels document | A layer-specific document, only for a genuinely layer-unique nuance not already covered generically | A layer document restating the generic validation checklist verbatim |
| Context-loading rules for a given task type | The context-loading strategy document | Every process document, by reference | Any document inventing its own separate loading rule for a task type already covered |

## How to Use This Table While Working

Before writing any fact into a document:

1. Check whether the concept already appears in this table.
2. If yes: go to the canonical owner. If it's already correct there, reference it — do not restate it. If it needs to change, update it there, in the same task, and check whether any document referencing it now needs its reference updated (rarely; a reference by ID/name survives most changes to the underlying content).
3. If no: this is either a new concept (add a row here, in the same task that introduces it) or you are about to duplicate an existing concept under a different name — check for that before assuming it's new.

## Why a Concept-Level Model, Separate From the Directory-Level Model

`02_directory_structure.md`'s directory dependency graph tells you which *directories* to consult for a given layer. It does not tell you, when you're about to write a specific fact, whether that fact already has a home elsewhere — two directories can each have a legitimate reason to mention the same underlying concept (e.g., both a layer's architecture doc and a cross-cutting capability's contract doc might plausibly want to say something about "the token format") without an explicit concept-ownership rule telling you which one actually owns the fact and which one must only reference it. This is precisely the gap that produced the real duplication found during the critical review of this framework's own first draft (`06_naming_and_versioning.md` restating ADR/Release ID rules already owned by `07_adr_process.md`/`08_release_process.md`) — this table exists specifically so that mistake doesn't recur, in this framework or in any project built on it.

## Multi-Agent Extension

**(Inferred — logically required for multiple agents to work concurrently without conflict, derived from the single-agent ownership rules already established above, not an invented distributed architecture.)** Everything above already assumes exactly one canonical owner per concept; this section states what changes, and what doesn't, when more than one agent is active in the same project at the same time.

**What doesn't change:** the ownership model itself. Two agents working concurrently must still resolve every fact to the same single canonical owner listed above — concurrency is not a reason to relax the "reference, don't duplicate" discipline; if anything it's the situation where violating it is most damaging, since two agents duplicating the same concept independently is exactly how contradictory documents get introduced without either agent noticing.

**What multi-agent work adds:**

- **Task delegation follows area ownership, not arbitrary split.** A task spanning two owned areas should be delegated along the existing area boundaries (per `02_directory_structure.md` and the reference project's own ownership-map pattern), not split by some other axis (e.g., "half the files each") that cuts across an area's internal coherence.
- **Conflict avoidance is concept-ownership enforcement, applied proactively.** Before starting work, an agent checks whether another agent is already the declared owner of the concept it's about to touch (per this document's table) for the current task cycle. If two agents would otherwise write to the same canonical-owner document in the same work session, one must yield — this is a scheduling concern, not a new ownership rule; the *owner* of the concept doesn't change, only who is actively editing it right now.
- **Context synchronization is index-mediated, not direct agent-to-agent communication.** Agents do not need a live channel to each other — the master index, the ADR index, and the release index are the shared, eventually-consistent source of truth each agent re-reads before acting. An agent finishing a task that added/archived/superseded something is responsible for updating the relevant index in the same task (already a mandatory rule, `11_ai_operating_rules.md`) specifically so the *next* agent — human or AI — doesn't need to have been present for the change to discover it.
- **Review responsibility is symmetric, not hierarchical.** Nothing in the single-agent model implies one agent outranks another; a review performed by a second agent uses the same procedure `11_ai_operating_rules.md` describes for any review, regardless of whether the original author was human or another agent.
- **Artifact ownership survives agent handoff.** An ADR, spec, or release entry's canonical owner is the *area*, never the *agent* that happened to author it — any agent operating within that area's boundary may extend or correct it later, exactly as a human successor could.

**What this section deliberately does not do:** define a locking protocol, a message queue, or any synchronization mechanism beyond "re-read the indexes before acting, update them when you're done." If a project's actual concurrency needs outgrow that (e.g., true simultaneous edits to the same document), that is itself a decision meeting the ADR trigger list (`07_adr_process.md`) — write one, rather than retrofitting an assumption into this framework ahead of evidence that it's actually needed.
