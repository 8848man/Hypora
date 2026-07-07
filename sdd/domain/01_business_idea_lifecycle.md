# Business Idea Lifecycle (Domain Model)

**Refs:** → [00_index](../00_index.md) · [Product Vision](../context/01_product_vision.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [Information Architecture](../context/04_information_architecture.md) · [ADR-0002](../architecture/decisions/ADR-0002-business-idea-lifecycle-domain-model.md)

*(Inferred — the product brief never states a formal lifecycle; this document introduces one as the conceptual backbone the Workspace, Feature Planning, and every future roadmap stage (V2–V5) can be checked against, per the SDD Framework's Type 6 "Domain / State Machine Document.")*

## Why This Is a Separate Document, Not a Section of an Existing One

Per the framework's `03_document_lifecycle.md` (Type 6) and `02_directory_structure.md` (`sdd/domain/`): a domain/state-machine document is warranted "as soon as a business entity has more than one lifecycle state and more than one [document/future layer] cares about it." A Project's lifecycle meets both conditions here:

- It has more than one valid state (below), with real transition rules and guards — not a simple boolean flag.
- More than one existing document already depends on it implicitly: [Information Architecture](../context/04_information_architecture.md) needs to know what a project's navigable state looks like; [Application Responsibilities](../context/05_application_responsibilities.md)'s Workspace scope needs an authoritative definition of "what does a completed project mean"; and every future roadmap stage (V2–V5) reads or writes this same state.

It cannot live inside `context/01_product_vision.md` (owns Vision/Positioning/Roadmap, not entity behavior), `context/02_product_scope.md` (owns scope/metrics, not state transitions), or `context/04_information_architecture.md` (owns navigable screen structure, not the underlying entity's valid states — IA describes *where* a user can go, not what state the data is in). Per the concept-ownership rule, this is a genuinely new concept requiring its own canonical owner, which is why `sdd/domain/` is created now — the trigger condition in `sdd/00_index.md`'s "Not Yet Created" table has fired.

## Entity: Project

A **Project** is one business idea being structured inside the Workspace (see [Information Architecture](../context/04_information_architecture.md)). Its lifecycle stage is a property of the Project as a whole, derived from the completion state of its Canvas, MVP Scope, Feature Planning, and Validation Checklist — not a separately user-set field the user picks arbitrarily.

## States

| State | Meaning | Derived from |
|---|---|---|
| **Captured** | A Project exists, but the Canvas has not been started | Project created, all five Canvas fields empty |
| **Structuring** | The Canvas is being authored | At least one Canvas field filled, not all five |
| **Scoped** | The Canvas is complete; MVP Scope and/or Feature Planning are being defined | All five Canvas fields filled; MVP Scope or Feature Planning incomplete |
| **Validating** | MVP Scope and Feature Planning are complete; the Validation Checklist is in progress | MVP Scope + Feature Planning complete; at least one Checklist item still unresolved |
| **Validated** | Every Validation Checklist item has been explicitly resolved (marked validated or explicitly invalidated) | All Checklist items resolved, none left open |
| **Build-Ready** | The user has explicitly confirmed the Validated plan as ready to act on | User-triggered confirmation on a Validated project — the terminal "useful output" state for V1 |
| **Archived** | The Project is no longer active | User-triggered archive action, from any prior state |

## Transitions

| From | To | Trigger | Guard |
|---|---|---|---|
| Captured | Structuring | User edits any Canvas field | None |
| Structuring | Scoped | User completes the fifth (final) Canvas field | All five Canvas fields must be non-empty |
| Scoped | Validating | User completes MVP Scope and Feature Planning | Both MVP Scope and Feature Planning must be marked complete by the user |
| Validating | Validated | User resolves the last open Validation Checklist item | Every Checklist item must be explicitly validated or explicitly invalidated — an empty checklist does not satisfy this guard (see Invalid Transitions) |
| Validated | Build-Ready | User explicitly confirms the plan as build-ready | Only reachable from Validated — a project cannot skip Checklist resolution |
| Validated / Scoped / Validating / Structuring / Build-Ready | Archived | User archives the Project | None — archiving is allowed from any non-Captured state; see note below on Captured |
| Captured | Archived | User archives an empty Project | Allowed, but distinct from other archive transitions since no structuring work exists to preserve |
| Validating | Scoped | User reopens MVP Scope or Feature Planning after invalidating an assumption there | Only fires if the user explicitly reopens Scope/Planning, not automatically on a single invalidated Checklist item |

## Invalid Transitions and Rejection Handling

- **Scoped → Validated (skipping Validating):** rejected. A project must pass through Validating — every Checklist item must be seen and explicitly resolved, not silently assumed complete because Scope/Planning are done.
- **Structuring → Scoped without all five Canvas fields filled:** rejected. Partial Canvas completion does not satisfy the Scoped guard.
- **Any state → Build-Ready except from Validated:** rejected. Build-Ready is only meaningful once every assumption has been explicitly checked.
- **Archived → any other state:** rejected in V1. Archiving is treated as terminal for V1 — no "unarchive" transition exists yet. If a future stage needs one, it must be added here explicitly, not assumed.

## Relationship to the Roadmap

*(Explicit stage names per [Product Vision](../context/01_product_vision.md#product-roadmap); the mapping below is Inferred.)*

| Roadmap stage | How it engages this lifecycle |
|---|---|
| V1 — Manual Workspace | Implements every state and transition above, entirely by manual user action |
| V2 — AI Canvas Assistant | Operates only within Captured/Structuring — suggests Canvas content, never advances a state transition on the user's behalf (per the [Product Principles](../context/01_product_vision.md#product-principles) "AI augmentation, not replacement" rule) |
| V3 — Market Intelligence | Surfaces alongside Scoped/Validating projects as supporting context; does not introduce a new state |
| V4 — Go-to-Market Planning | Consumes Validated/Build-Ready projects as input; does not introduce a new state |
| V5 — AI Product Builder | Consumes Build-Ready projects specifically — this is the state a project must reach before requirement/SDD generation is meaningful |

## Ownership

This document is the single authoritative source for Project lifecycle states, transitions, and guards. [Information Architecture](../context/04_information_architecture.md) references lifecycle stage as a display concern (see its Workspace Mental Model review) but must not redefine any transition here. Any future `sdd/workspace/` implementation document must reference this document rather than re-specifying the state machine.
