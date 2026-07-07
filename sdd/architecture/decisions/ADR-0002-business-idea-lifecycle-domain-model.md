# ADR-0002: Introduce a Canonical Business Idea Lifecycle as the Domain Model

**Status:** Accepted
**Date:** 2026-07-07
**Affects specs:** [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md), [Information Architecture](../../context/04_information_architecture.md), [Application Responsibilities](../../context/05_application_responsibilities.md), `sdd/rules/ownership.md`, `sdd/00_index.md`

## Context

Hypora's Workspace already has four artifact types per project (Canvas, MVP Scope, Feature Planning, Validation Checklist), authored in a suggested-but-non-enforced order (see [Core User Journey](../../context/03_personas_and_journey.md)). As the roadmap moves through V2–V5, every future stage (AI Canvas Assistant, Market Intelligence, Go-to-Market Planning, AI Product Builder) needs to know *what state a given project is in* to decide what it can meaningfully do — e.g., an AI Product Builder (V5) generating requirements from an unvalidated project would violate the "validation before implementation" product principle. Without one authoritative lifecycle definition, each future stage's specification would have to independently infer or redefine "is this project ready," which is exactly the duplicated-ownership failure mode the SDD Framework's concept-ownership model exists to prevent.

This decision spans every future Application (Workspace enforces it; Platform API will eventually persist it; Landing's roadmap copy implicitly promises it works this way) and is expensive to reverse once Feature Planning and V2+ specifications are written against a specific set of states — changing the state model later would ripple through every dependent specification.

## Decision

Introduce a canonical **Business Idea Lifecycle** domain model — a named entity ("Project") with seven states (Captured, Structuring, Scoped, Validating, Validated, Build-Ready, Archived) and explicit from/to/trigger/guard transitions — as the single authoritative definition of a project's structuring/validation progress. Recorded in a new `sdd/domain/` document (Type 6, per the framework's `03_document_lifecycle.md`), since no existing context document owns entity-state behavior and the trigger condition ("an entity has more than one lifecycle state that more than one document/layer cares about") has now fired.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| No formal lifecycle — leave each artifact (Canvas, Scope, Planning, Checklist) independently trackable with no unifying state | Would force every future roadmap stage (V2–V5) to independently reconstruct "is this project ready for X," risking inconsistent definitions across stages |
| A generic freeform status field (e.g., a user-chosen label per project) | Fails the "validation before implementation" product principle — a user could label a project "done" without the Validation Checklist actually being resolved; guards specifically prevent this |
| Task/ticket-style status (To Do / In Progress / Done) borrowed from generic PM tools | Rejected on product-positioning grounds (see [Product Positioning](../../context/01_product_vision.md#product-positioning)) — Hypora is explicitly not a PM/ticketing tool, and reusing that mental model would blur the distinction the product is positioned against |
| Embedding the lifecycle as a subsection of `context/04_information_architecture.md` | Rejected — IA owns navigable screen structure, not entity behavior; conflating the two would make IA responsible for a concept (IA doesn't enforce transitions, the underlying data model does), violating single-responsibility per document |

## Consequences

**Easier:**
- Every future roadmap-stage specification (V2–V5) can reference one authoritative "what state is this project in" definition instead of re-deriving it.
- Feature Planning and Validation Checklist specifications, once written, have an explicit guard model to implement against rather than an ambiguous notion of "done."
- The Workspace Mental Model review in [Information Architecture](../../context/04_information_architecture.md) has a concrete lifecycle to evaluate navigation against.

**Harder / accepted trade-offs:**
- Any future change to the state set or a transition's guard now requires updating this ADR's superseding record (a new ADR) rather than a quiet edit to a context document — a deliberately higher bar, consistent with ADR-0001's precedent.
- V1 has no real code yet, so this lifecycle is, for now, a specification-only model with no enforcement mechanism — the guards above are binding requirements for whichever implementation eventually builds the Workspace, not yet verified against running code.
