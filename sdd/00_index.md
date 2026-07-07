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
| [workflow/02_git_and_release_strategy.md](./workflow/02_git_and_release_strategy.md) | Git branch model (main/develop/feature), merge strategy, versioning strategy |

## Product / Context

| Doc | Purpose |
|---|---|
| [context/01_product_vision.md](./context/01_product_vision.md) | Product Vision, Product Goals, Product Roadmap (V1–V5) |
| [context/02_product_scope.md](./context/02_product_scope.md) | Product Scope, Non-Goals, Constraints, MVP Success Criteria, Assumptions, Risks, Open Questions |
| [context/03_personas_and_journey.md](./context/03_personas_and_journey.md) | User Personas, Core User Journey |
| [context/04_information_architecture.md](./context/04_information_architecture.md) | Product-level IA: Landing's screens, cross-Application navigation rule (Workspace's own IA relocated to `workspace/01_architecture.md`) |
| [context/05_application_responsibilities.md](./context/05_application_responsibilities.md) | Product Architecture (one Product, multiple Applications); Landing / Workspace / Platform API responsibilities (Workspace's detailed scope relocated to `workspace/`) |
| [context/06_future_expansion_strategy.md](./context/06_future_expansion_strategy.md) | How V1's architecture stays compatible with V2–V5 without redesign |

## Domain

| Doc | Purpose |
|---|---|
| [domain/01_business_idea_lifecycle.md](./domain/01_business_idea_lifecycle.md) | Canonical Project (Business Idea) lifecycle — states, transitions, guards; the conceptual backbone every future feature and roadmap stage must fit |

## Workspace

| Doc | Purpose |
|---|---|
| [workspace/01_architecture.md](./workspace/01_architecture.md) | Purpose, Responsibilities, Information Architecture, Feature Inventory (Core/Optional/Future), User Flow |
| [workspace/02_data_and_state.md](./workspace/02_data_and_state.md) | Conceptual Data Ownership, UI-level State Model, conceptual Local Persistence, Error States |
| [workspace/features/000_index.md](./workspace/features/000_index.md) | Index of every V1 Feature Specification (user-goal capabilities, not screens) |
| [workspace/features/01_project_management.md](./workspace/features/01_project_management.md) | Create, list, select, and archive a Project |
| [workspace/features/02_business_structuring.md](./workspace/features/02_business_structuring.md) | Structure the Canvas hypothesis and optional Risk Notes |
| [workspace/features/03_mvp_planning.md](./workspace/features/03_mvp_planning.md) | Define MVP Scope and a prioritized Feature list |
| [workspace/features/04_validation_planning.md](./workspace/features/04_validation_planning.md) | Author and resolve testable Assumptions |
| [workspace/features/05_project_summary.md](./workspace/features/05_project_summary.md) | Aggregate readiness; own the Validated → Build-Ready confirmation |

## Infra

| Doc | Purpose |
|---|---|
| [infra/01_deployment.md](./infra/01_deployment.md) | V1 deployment target (single Vercel project), Applications included/excluded |

## Analysis

| Doc | Purpose |
|---|---|
| [analysis/01_v1_release_specification.md](./analysis/01_v1_release_specification.md) | Unified V1 Release Specification — synthesizes release goal/scope/boundary/success criteria/risks/limitations/deployment/git strategy from their canonical owners |

## Architecture Decisions

| Doc | Purpose |
|---|---|
| [architecture/decisions/000_index.md](./architecture/decisions/000_index.md) | Running index of every ADR, its status, and a one-line summary |
| [architecture/decisions/ADR-0001-one-product-multiple-applications.md](./architecture/decisions/ADR-0001-one-product-multiple-applications.md) | Why Hypora is one Product with multiple Applications, not three products |
| [architecture/decisions/ADR-0002-business-idea-lifecycle-domain-model.md](./architecture/decisions/ADR-0002-business-idea-lifecycle-domain-model.md) | Why a canonical Project lifecycle was introduced as the domain model, and the alternatives rejected |
| [architecture/decisions/ADR-0003-single-v1-deployment-target.md](./architecture/decisions/ADR-0003-single-v1-deployment-target.md) | Why Landing + Workspace are bundled into one Vercel project for V1, and Platform API excluded |

## Not Yet Created (by design)

Per `10_bootstrap_guide.md`, these are deliberately deferred until their trigger condition is real, not created speculatively:

| Would-be area | Trigger to create it |
|---|---|
| `sdd/landing/`, `sdd/platform-api/` | Once each Application has real code (architecture doc + contract doc) — Workspace was promoted early under the "spec leads implementation" principle; see `workspace/01_architecture.md` |
| `release/` (outside `sdd/`) | Once something is actually deployed to real users |
| `sdd/archive/` | Once a document is first superseded or relocated |

**Triggers already fired:** `sdd/domain/` (2026-07-07, [ADR-0002](./architecture/decisions/ADR-0002-business-idea-lifecycle-domain-model.md)); `sdd/infra/` (2026-07-07, a real deployment target was decided — [ADR-0003](./architecture/decisions/ADR-0003-single-v1-deployment-target.md)); `sdd/workspace/` (2026-07-07, created ahead of code under the framework's "spec leads implementation" allowance). None of these are listed above as pending anymore.

## Key Conventions

- **Evidence tagging:** every fact in `sdd/context/` and `sdd/domain/` is marked `(Explicit)` (stated directly in the product brief) or `(Inferred)` (a design decision made to complete the specification) — see each document's inline notes.
- **Roadmap:** canonically owned by [context/01_product_vision.md](./context/01_product_vision.md); no other document restates the V1–V5 stage table.
- **Product Positioning and Product Principles:** canonically owned by [context/01_product_vision.md](./context/01_product_vision.md); no other document restates what Hypora is/isn't or its enduring principles.
- **Application responsibilities:** canonically owned by [context/05_application_responsibilities.md](./context/05_application_responsibilities.md); no other document restates what Landing/Workspace/Platform API is for.
- **Success Metrics:** canonically owned by [context/02_product_scope.md](./context/02_product_scope.md); no other document defines its own success measurement.
- **Project lifecycle (states, transitions, guards):** canonically owned by [domain/01_business_idea_lifecycle.md](./domain/01_business_idea_lifecycle.md); [workspace/01_architecture.md](./workspace/01_architecture.md) may reference lifecycle stage as a display concern only, never redefine a transition.
- **Workspace's own IA, feature inventory (categorization), data ownership, state model, persistence, and error states:** canonically owned by [workspace/01_architecture.md](./workspace/01_architecture.md) and [workspace/02_data_and_state.md](./workspace/02_data_and_state.md); no other document restates them.
- **Each Feature's Purpose, Responsibilities, User Stories, Acceptance Criteria, and cross-Feature boundaries:** canonically owned by its own document under [workspace/features/](./workspace/features/000_index.md); no other document (including `workspace/01_architecture.md`'s Feature Inventory) restates this detail — the inventory only categorizes, the Feature Specification defines.
- **Deployment target and Application deployment inclusion:** canonically owned by [infra/01_deployment.md](./infra/01_deployment.md); [analysis/01_v1_release_specification.md](./analysis/01_v1_release_specification.md) summarizes it for release-boundary orientation but does not redefine it.
- **Git branch/merge/versioning strategy:** canonically owned by [workflow/02_git_and_release_strategy.md](./workflow/02_git_and_release_strategy.md).
- **ADR numbering:** `ADR-NNNN`, sequential, never reused — see `sdd-framework/07_adr_process.md` for the full lifecycle rule this project follows.
