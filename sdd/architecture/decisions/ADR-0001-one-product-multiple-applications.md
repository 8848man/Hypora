# ADR-0001: One Product, Multiple Applications

**Status:** Accepted
**Date:** 2026-07-07
**Affects specs:** [Product Vision](../../context/01_product_vision.md), [Product Scope](../../context/02_product_scope.md), [Application Responsibilities](../../context/05_application_responsibilities.md), [Information Architecture](../../context/04_information_architecture.md), `sdd/rules/ownership.md`

## Context

Hypora consists of three distinct concerns: a marketing site (Landing), the actual workspace application (Workspace), and a backend/platform layer that is LocalStorage-backed in V1 and will grow real backend responsibilities later (Platform API). These three concerns have different audiences (anonymous visitors vs. authenticated-in-spirit workspace users vs. no direct audience at all for the API layer), different release cadences, and — eventually — different codebases.

The specification tree needs one governing structure for how these three relate, decided once, before any per-Application specification is written, so that every subsequent document (ownership map, information architecture, roadmap) is authored consistently against it rather than each document inventing its own framing.

## Decision

Hypora is modeled as **one Product** with **multiple Applications** (Landing, Workspace, Platform API). Applications are never specified, pitched, or structured as independent products. There is exactly one Product Vision, one Product Roadmap, and one set of Non-Goals — each Application's specification references these rather than maintaining its own.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Three independent products, each with its own vision/roadmap/scope | Would fragment the AI Co-founder vision across three uncoordinated specs; the roadmap (V2–V5) is a single coherent evolution that touches all three Applications together, not three separate roadmaps that happen to be shipped by the same company |
| A single monolithic application with no Application-level separation | Contradicts the explicit constraint that Landing must never contain workspace logic; a monolith with no enforced boundary would make that constraint unenforceable rather than structural |
| Applications as arbitrary subdirectories of one codebase with no distinct responsibility model | Considered as a lighter-weight alternative, but rejected because it gives no place to record Platform API's distinct current-vs-future-capability distinction (LocalStorage today, real backend later) — that distinction needs its own named Application, not a folder with no conceptual boundary |

## Consequences

**Easier:**
- Every future specification (per-Application architecture docs, once real code exists) has one unambiguous place to check for the canonical product-level facts (vision, scope, roadmap) rather than re-deriving them per Application.
- The ownership map (`sdd/rules/ownership.md`) has a clean area-per-Application structure to extend as each Application gains real code.
- Landing/Workspace separation is enforceable as an ownership rule, not just a stated intention.

**Harder / accepted trade-offs:**
- Any change to how the three Applications relate (adding a fourth Application, merging two) requires updating this ADR's superseding record and every context document listed under "Affects specs" — a deliberately higher bar than editing a single document, which is the intended effect of the ADR gate firing here.
- Platform API currently has no real backend and no dedicated implementation directory yet (per `10_bootstrap_guide.md` Step 3) — its responsibilities are recorded in the shared context layer until real code exists, which means its specification is temporarily less detailed than Landing's or Workspace's conceptually similar future documents. This is accepted as consistent with "current MVP first."
