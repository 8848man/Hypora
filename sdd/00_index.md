# Hypora — Specification Index

**Refs:** → [Root README](../README.md) · [CLAUDE.md](../CLAUDE.md)

Master index of every document in the `sdd/` tree. Every document must be reachable from here. Updated every time a document is added, removed, or an area is reorganized.

## Governance

| Doc | Purpose |
|---|---|
| [rules/spec_authoring_rules.md](./rules/spec_authoring_rules.md) | Size tiers, writing style, duplication rule, Refs header convention |
| [rules/ownership.md](./rules/ownership.md) | Who owns which files; cross-boundary coordination rules |
| [workflow/00_implementation_lifecycle.md](./workflow/00_implementation_lifecycle.md) | The phase sequence every task follows |
| [workflow/01_context_loading.md](./workflow/01_context_loading.md) | Per-task-type mandatory/recommended/optional/never loading matrix |

## Product / Context

| Doc | Purpose |
|---|---|
| [context/01_product_vision.md](./context/01_product_vision.md) | Product Vision, Product Goals, Product Roadmap (V1–V5) |
| [context/02_product_scope.md](./context/02_product_scope.md) | Product Scope, Non-Goals, Constraints, MVP Success Criteria, Assumptions, Risks, Open Questions |
| [context/03_personas_and_journey.md](./context/03_personas_and_journey.md) | User Personas, Core User Journey |
| [context/04_information_architecture.md](./context/04_information_architecture.md) | Screen inventory (Information Architecture), Navigation Model |
| [context/05_application_responsibilities.md](./context/05_application_responsibilities.md) | Product Architecture (one Product, multiple Applications); Landing / Workspace / Platform API responsibilities and V1 functional scope |
| [context/06_future_expansion_strategy.md](./context/06_future_expansion_strategy.md) | How V1's architecture stays compatible with V2–V5 without redesign |

## Architecture Decisions

| Doc | Purpose |
|---|---|
| [architecture/decisions/000_index.md](./architecture/decisions/000_index.md) | Running index of every ADR, its status, and a one-line summary |
| [architecture/decisions/ADR-0001-one-product-multiple-applications.md](./architecture/decisions/ADR-0001-one-product-multiple-applications.md) | Why Hypora is one Product with multiple Applications, not three products |

## Not Yet Created (by design)

Per `10_bootstrap_guide.md`, these are deliberately deferred until their trigger condition is real, not created speculatively:

| Would-be area | Trigger to create it |
|---|---|
| `sdd/landing/`, `sdd/workspace/`, `sdd/platform-api/` | Once each Application has real code (architecture doc + contract doc) |
| `sdd/domain/` | Once an entity (e.g., Validation Checklist item) has more than one lifecycle state that more than one layer must agree on |
| `sdd/infra/` | Once there is a real deployment target |
| `release/` (outside `sdd/`) | Once something is actually deployed to real users |
| `sdd/archive/` | Once a document is first superseded or relocated |

## Key Conventions

- **Evidence tagging:** every fact in `sdd/context/` is marked `(Explicit)` (stated directly in the product brief) or `(Inferred)` (a design decision made to complete the specification) — see each document's inline notes.
- **Roadmap:** canonically owned by [context/01_product_vision.md](./context/01_product_vision.md); no other document restates the V1–V5 stage table.
- **Application responsibilities:** canonically owned by [context/05_application_responsibilities.md](./context/05_application_responsibilities.md); no other document restates what Landing/Workspace/Platform API is for.
- **ADR numbering:** `ADR-NNNN`, sequential, never reused — see `sdd-framework/07_adr_process.md` for the full lifecycle rule this project follows.
