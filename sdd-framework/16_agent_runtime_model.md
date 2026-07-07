# Agent Runtime Model

**What this document is:** the execution-semantics view of the same process `04_development_workflow.md` describes narratively. `04` tells you the sequence of phases and why each exists; this document tells you what *state* an executing agent is actually in at each point, what triggers a transition, and what must be true to enter or leave each state. Read `04` first if you haven't — this document assumes it.

**Why this is a separate document, not a section of `04`:** a state machine (states, transitions, entry/exit conditions) is a different kind of artifact than a phase narrative, in the same way the reference project keeps `domain/state_machines.md` separate from its architecture docs even though both describe "what happens to an entity over time." Forcing this into `04` would blur that document's existing single responsibility.

## Is There an Implicit Runtime Already? (Evidence)

Yes — reconstructed, not invented, from: `04`'s nine-phase sequence, `05`'s validation levels and drift check, `11`'s situational rules, and the decision trees already present in `04`/`05`/`07`/`14`. Every state and transition below traces to one of those.

## Agent States

| State | Responsibility | Entry Condition | Exit Condition |
|---|---|---|---|
| **Idle** | No active task | Default state, or previous task reached Completed | A task is received |
| **Task Received** | Task is assigned but not yet analyzed | Idle → task assigned | Context-loading tier for the task type is identified (`12_context_loading_strategy.md`) |
| **Context Loading** | Pulling in Mandatory and Recommended documents for this task type | Task type identified | Mandatory-tier documents are loaded |
| **Context Validation** | Confirming the loaded context is actually sufficient — not just "loaded," but adequate to make a correct decision | Mandatory context loaded | Either confirmed sufficient, or a gap is found |
| **Analysis** | Code-first analysis — read the affected code before trusting any spec's description of current behavior (`04`, Phase 2) | Context confirmed sufficient | The delta between spec-described intent and actual code is identified |
| **Decision Making** | Resolve the Specification-First outcome (Covered / Requires Modification / Conflict) and the ADR gate together, as one combined decision (`04`'s feature-creation tree) | Delta identified | One of: proceed to Implementation, proceed to Specification Editing, or escalate to Waiting for Human |
| **Specification Editing** | Update a spec (Requires Modification outcome) or write/supersede an ADR (ADR gate fired) — the *same* state whether entered before implementation (spec-first) or after (Phase 7 sync) | Decision Making resolved to "spec/ADR change needed," from either direction | The spec/ADR change is complete and internally consistent (checked against `13_concept_ownership_model.md`) |
| **Implementation** | Write the code change, following the layer-specific rules for the affected area | Decision Making resolved to "proceed," or Specification Editing completed | The change is made; ready for verification |
| **Validation** | Run every validation level the change actually triggers (`05`'s L1–L5 decision tree) | Implementation complete, or a prior Validation/Review loop sent it back here | Either all triggered levels pass, or a failure routes back to Implementation, or validation cannot be run at all |
| **Review** | Cross-Boundary Check and self-review against the Specification-First outcome, as if reviewing someone else's diff (`11`'s Performing Reviews rule) | Validation passed | Either confirmed clean, or a gap routes back to Implementation |
| **Documentation Sync** | Confirm every spec/index that should reflect this change actually does (`04` Phase 7) — distinct from Specification Editing in trigger (this is the mandatory post-implementation check; Specification Editing is the actual edit, which may already have happened pre-implementation) | Review passed | Every divergent doc has been corrected, or explicitly confirmed as needing no change |
| **Release Decision** | Was this actually deployed? If yes, record it (component + rollup logs); if no, skip (`04` Phase 9) | Documentation Sync complete | Release decision made (yes-and-recorded, or no) |
| **SDD Drift Check / Completion** | Run the five-part drift check and produce the Artifact Decision Matrix (`05`) | Release Decision made | Matrix produced, findings stated explicitly (including "no drift found") |
| **Completed** | Task fully closed | Drift check + matrix produced | Returns to Idle |
| **Blocked** | Cannot proceed due to an external/environmental obstacle (validation tooling unavailable, a dependency is missing, an artifact can't actually be verified) — distinct from Waiting for Human because the obstacle may not require a human decision, just an unblocking action | Any state where the next mechanical step cannot be executed | The obstacle clears (may or may not involve a human) |
| **Waiting for Human** | Cannot proceed because a *decision*, not an obstacle, requires human judgment (unresolved Conflict, cross-area ADR sign-off, an explicit refusal criterion from `11` has been met) | Decision Making escalates, or any state where `11`'s refusal criteria are met | A human responds, and execution resumes at the state it was suspended from |

## State Diagram

```
Idle ──▶ Task Received ──▶ Context Loading ──▶ Context Validation
                                                       │
                                    ┌──────────────────┼────────────────┐
                                    │ (gap found)       │ (sufficient)   │
                                    ▼                    ▼
                            Context Loading          Analysis
                                                          │
                                                          ▼
                                                  Decision Making
                                                          │
                          ┌───────────────────────────────┼───────────────────────┐
                          │ (spec/ADR needed)              │ (proceed)              │ (unresolved conflict /
                          ▼                                 ▼                        no sign-off)
                 Specification Editing ─────────▶ Implementation              Waiting for Human
                                                          │                            ▲
                                                          ▼                            │
                                                     Validation ◀──────────────────────┤
                                                    │        │ (cannot run)            │
                                          (fails) ──┘        └──────────────▶ Blocked ─┘
                                                          │ (passes)
                                                          ▼
                                                       Review
                                                    │        │
                                          (gap found)┘        │ (clean)
                                          back to               ▼
                                          Implementation   Documentation Sync
                                                                  │
                                                                  ▼
                                                          Release Decision
                                                                  │
                                                                  ▼
                                                    SDD Drift Check / Completion
                                                                  │
                                                                  ▼
                                                             Completed ──▶ Idle
```

Validation and Review are the two explicitly **repeatable** stages — either can route back to Implementation. No other backward transition exists in this model; every other stage is evidence-supported as strictly forward-moving once entered (nothing in the existing framework describes, for instance, Context Loading being re-entered from Decision Making — a gap discovered that late is handled as a Blocked/Waiting-for-Human escalation, not a silent return to an earlier stage).

## Mandatory, Optional, and Repeatable Stages

- **Mandatory, every task, no exception:** Task Received, Context Loading, Context Validation, Analysis, Decision Making, Validation, SDD Drift Check/Completion. (This mirrors `04`'s own rule: mandatory to *evaluate*, not necessarily to produce a change — Decision Making very often resolves to "proceed, nothing to write.")
- **Conditional (entered only if the relevant decision fires):** Specification Editing, Release Decision's actual recording action (the *decision* itself is always mandatory to evaluate; the recording only happens if the answer is yes).
- **Repeatable:** Validation, Review — both can loop back to Implementation.
- **Exceptional / not part of the normal path:** Blocked, Waiting for Human — these suspend the pipeline rather than advance it, and resume back into whichever state triggered them.

## Failure Handling and Recovery

- A **Validation failure** routes back to Implementation — this is not an error state, it's a normal loop.
- A **Review finding** (the Cross-Boundary Check catching a producer/consumer mismatch, the canonical example already documented in `04`/`05`) routes back to Implementation the same way.
- A **Blocked** state resolves either by the obstacle clearing on its own (e.g., a transient environment issue) or by an explicit unblocking action that may not require a human at all (e.g., installing a missing dependency) — do not conflate this with Waiting for Human, which specifically requires a *decision* a human alone can make.
- **Waiting for Human never silently times out into a default action.** Per `11`'s refusal criteria, the correct behavior when blocked on a needed human decision is to state clearly what's needed and stop — not to guess and proceed.

## Decision Engine Index

Every recurring decision in this framework, consolidated by reference (each lives in, and is owned by, the document listed — this index does not restate any of them, per `13_concept_ownership_model.md`'s discipline):

| Decision | Lives in | Triggered from state |
|---|---|---|
| Should a new feature be created / Specification-First + ADR gate | `04_development_workflow.md` | Decision Making |
| Which validation level(s) apply | `05_validation_and_review.md` | Validation |
| Should an ADR be written | `07_adr_process.md` | Decision Making |
| Should a new document be created, or an existing one extended | `14_evolution_rules.md` | Specification Editing |
| Should an existing specification be modified | `14_evolution_rules.md` | Specification Editing |
| Should a document be archived | `14_evolution_rules.md` | Documentation Sync |
| Refactor, or implement directly | `04_development_workflow.md` (Decision Points) | Decision Making |
| Request human review, or continue autonomously | `11_ai_operating_rules.md` (refusal criteria) | Any state, evaluated continuously |
| Validate immediately, or continue implementation first | Below (this document — no other document owns implementation/validation sequencing, since it's a runtime execution-order concern, not a "what to check" concern) | Implementation → Validation transition |

### Decision Tree — Validate Immediately, or Continue Implementation?

```
Does the current implementation step change a contract/interface shape,
or a persisted schema?
        │
    ┌───┴───┐
   Yes      No
    │        │
 Validate  Is the step small enough that a downstream step would be
 this step  expensive to unwind if this step turns out wrong?
 before          │
 continuing  ┌───┴───┐
            Yes      No
             │        │
          Validate  Continue implementing; validate at the next
          now       natural checkpoint (end of the logical unit
                     of work, not necessarily end of task)
```

This is the one genuinely new decision this framework didn't previously answer explicitly — everything else in this index already existed as a tree elsewhere and is only referenced here.
