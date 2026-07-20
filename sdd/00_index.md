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
| [context/07_landing_experiment_strategy.md](./context/07_landing_experiment_strategy.md) | Landing's A/B/C storytelling experiment — variant assignment, URL override, Local Storage ownership, composition with the Localization Layer, Analytics extension, Design System boundary |

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
| [workspace/features/02_business_structuring.md](./workspace/features/02_business_structuring.md) | Structure the Canvas hypothesis via a guided, one-question-at-a-time flow ending in Review |
| [workspace/features/02_1_question_model.md](./workspace/features/02_1_question_model.md) | Question domain model and replaceable Preset Strategy behind the guided flow (React-independent) |
| [workspace/features/03_mvp_planning.md](./workspace/features/03_mvp_planning.md) | Define MVP Scope and a prioritized Feature list |
| [workspace/features/04_validation_planning.md](./workspace/features/04_validation_planning.md) | Author and resolve testable Assumptions |
| [workspace/features/05_project_summary.md](./workspace/features/05_project_summary.md) | Aggregate readiness; own the Validated → Build-Ready confirmation |

## AI

Undocumented in this master index until this pass, despite existing since 2026-07-08 (see "Triggers already fired" below) — every document here was already real and reachable via its own `Refs` header, just never listed in this file, violating this index's own "every document must be reachable from here" rule. Fixed in this synchronization pass.

| Doc | Purpose |
|---|---|
| [ai/01_architecture.md](./ai/01_architecture.md) | Purpose, Responsibilities, the Capability Model (Workspace Feature → AI Capability → AI Application Service → LLM Provider Interface → Provider), Localization composition |
| [ai/02_provider_independence_and_configuration.md](./ai/02_provider_independence_and_configuration.md) | The LLM Provider Interface's independence guarantee and Provider × Capability configuration scoping |
| [ai/03_ownership_model.md](./ai/03_ownership_model.md) | The single-owner split across the prompt/context/response request lifecycle |
| [ai/04_ai_interaction.md](./ai/04_ai_interaction.md) | Governing Rules, Invocation Model, the universal `Ask AI → Suggestion → Accept/Reject/Regenerate` Interaction Lifecycle, Loading Behavior |
| [ai/05_ai_feedback_and_error_experience.md](./ai/05_ai_feedback_and_error_experience.md) | The unified error taxonomy and user-facing feedback/failure presentation every AI Capability shares |
| [ai/capabilities/000_index.md](./ai/capabilities/000_index.md) | Index of every AI Capability, the Capability Specification Template, Contract Versioning rules, Capability Promotion Rules |
| [ai/capabilities/01_canvas_assistant.md](./ai/capabilities/01_canvas_assistant.md) | Canvas Assistant (V2) — improve/complete/refine a Business Canvas via AI suggestions and follow-up questions |
| [ai/capabilities/02_risk_memo_assistant.md](./ai/capabilities/02_risk_memo_assistant.md) | Risk Memo Assistant — suggests one Risk Memo field at a time, grounded in the Business Canvas and sibling fields |
| [ai/capabilities/03_mvp_planning_assistant.md](./ai/capabilities/03_mvp_planning_assistant.md) | MVP Planning Assistant — suggests MVP Scope content, grounded in Business Canvas and Risk Memo (read-only) |
| [ai/capabilities/04_validation_planning_assistant.md](./ai/capabilities/04_validation_planning_assistant.md) | Validation Planning Assistant — suggests a new Assumption statement, grounded in Business Canvas, Risk Memo, and MVP Scope (read-only) |
| [ai/capabilities/05_feature_suggestion_assistant.md](./ai/capabilities/05_feature_suggestion_assistant.md) | Feature Suggestion Assistant — proposes a batch of Feature names, grounded in Business Canvas, MVP Scope, existing Features, and Risk Memo (read-only, optional) |
| [ai/capabilities/06_project_summary_synthesis_assistant.md](./ai/capabilities/06_project_summary_synthesis_assistant.md) | Project Summary Synthesis Assistant — synthesizes a Business Canvas identity narrative; the AI Platform's first Automatic Invocation exception (ADR-0017/ADR-0018) |
| [ai/capabilities/07_onboarding_preset_assistant.md](./ai/capabilities/07_onboarding_preset_assistant.md) | Onboarding Preset Assistant — generates tailored Business Structuring presets (or Thinking Prompts) from a Project's Name/Description at creation; the AI Platform's second Automatic Invocation exception (ADR-0019) |

## Analytics

| Doc | Purpose |
|---|---|
| [analytics/01_architecture.md](./analytics/01_architecture.md) | Purpose, Responsibilities, Tracking Model, Responsibility Split — mirrors AI Platform Architecture for a different Platform API capability |
| [analytics/02_event_model.md](./analytics/02_event_model.md) | The single, stable, provider-independent Event Envelope every event conforms to |
| [analytics/03_provider_independence.md](./analytics/03_provider_independence.md) | The Analytics Provider Interface's independence guarantee and configuration model |
| [analytics/04_event_catalog.md](./analytics/04_event_catalog.md) | The single authoritative list of every valid `eventName` |
| [analytics/05_migration_strategy.md](./analytics/05_migration_strategy.md) | The five-stage procedure for migrating from one Analytics Provider to another |
| [analytics/06_query_and_reporting.md](./analytics/06_query_and_reporting.md) | The read path (Analytics Query Service, Analytics Repository Interface) behind an internal Analytics Dashboard; Authentication Boundary flagged as needing an ADR before implementation |

## Frontend

| Doc | Purpose |
|---|---|
| [frontend/01_architecture.md](./frontend/01_architecture.md) | React Router structure, Feature boundaries, component ownership tiers, state ownership, LocalStorage access-layer boundary, Workspace layout, responsive behavior, Landing/Workspace separation enforcement |

## Design System

| Doc | Purpose |
|---|---|
| [design-system/01_design_system.md](./design-system/01_design_system.md) | Shared design tokens, component inventory, composition rules, coverage check against V1 UI needs; the Design System as a replaceable architectural boundary, Theme vs. Design Token vs. alternate-Design-System distinction, and the HTML Catalog (`/design-system` route) |

## Infra

| Doc | Purpose |
|---|---|
| [infra/01_deployment.md](./infra/01_deployment.md) | V1 deployment target (single Vercel project), Applications included/excluded |

## Analysis

| Doc | Purpose |
|---|---|
| [analysis/01_v1_release_specification.md](./analysis/01_v1_release_specification.md) | Unified V1 Release Specification — synthesizes release goal/scope/boundary/success criteria/risks/limitations/deployment/git strategy from their canonical owners |

## Landing

Landing's own dedicated specification directory, promoted 2026-07-17 — real Landing code already existed before promotion (see [landing/00_index.md](./landing/00_index.md)'s Provenance section for why this was spec catching up to code and a validated redesign, not "spec leads implementation"). Landing's Purpose/Responsibilities summary remains owned by [context/05_application_responsibilities.md](./context/05_application_responsibilities.md); only detailed architecture relocated here, mirroring Workspace's own precedent.

| Doc | Purpose |
|---|---|
| [landing/00_index.md](./landing/00_index.md) | Local index for this directory; Provenance; the permanent rule governing `planning/`/`improvement/` as frozen historical evidence |
| [landing/01_architecture.md](./landing/01_architecture.md) | Purpose, Responsibilities (by reference), Final Design Direction (why there is no single "winning" A/B/C concept), CTA strategy, design constraints |
| [landing/02_information_architecture.md](./landing/02_information_architecture.md) | The finalized 7-section visitor journey, route model, navigation strategy — relocated from `context/04_information_architecture.md` |
| [landing/03_component_model.md](./landing/03_component_model.md) | Every prototype-phase component reviewed and classified (Promote / Merge / Remove / Replace); the resulting production component inventory |
| [landing/04_component_contracts.md](./landing/04_component_contracts.md) | Conceptual contract (purpose, content, states, non-goals) for each Landing-owned component |
| [landing/05_design_system.md](./landing/05_design_system.md) | How Landing consumes the shared [design-system/01_design_system.md](./design-system/01_design_system.md) — never a duplicate of its token catalog or inventory |
| [landing/06_motion_system.md](./landing/06_motion_system.md) | The production Motion System — one configuration used identically across every A/B/C variant, resolving a real conflict this promotion found between the prototype phase's per-concept motion tuning and [Landing Experiment Strategy](./context/07_landing_experiment_strategy.md)'s Non-Goal that animations must be identical across variants |
| [landing/07_implementation_plan.md](./landing/07_implementation_plan.md) | Production gap analysis (prototype → production) and a 7-phase implementation roadmap with dependencies and completion criteria per phase |
| [landing/improvement/](./landing/improvement/), [landing/planning/](./landing/planning/) | **Historical evidence, frozen — not specification.** The reference-analysis, improvement-planning, target-IA, concept-prototype, and motion-refactor work that produced the documents above. See `landing/00_index.md` for the permanent rule governing them. |

## Architecture

| Doc | Purpose |
|---|---|
| [architecture/01_platform_services.md](./architecture/01_platform_services.md) | The Platform Service architectural role AI and Analytics both instantiate; Candidate Members, Admission Criteria, Dependency Rules |
| [architecture/decisions/000_index.md](./architecture/decisions/000_index.md) | The single, complete, authoritative index of every ADR (currently ADR-0001 through ADR-0022), its status, date, and one-line summary — this document does not restate any ADR individually; see that index for the full list rather than duplicating it here, per this project's own Duplication Rule |

## Not Yet Created (by design)

Per `10_bootstrap_guide.md`, these are deliberately deferred until their trigger condition is real, not created speculatively:

| Would-be area | Trigger to create it |
|---|---|
| `sdd/platform-api/` | Once Platform API has real code (a real backend — V1 still uses LocalStorage) |
| `sdd/archive/` | Once a document is first superseded or relocated |

**Triggers already fired:** `sdd/domain/` (2026-07-07, [ADR-0002](./architecture/decisions/ADR-0002-business-idea-lifecycle-domain-model.md)); `sdd/infra/` (2026-07-07, a real deployment target was decided — [ADR-0003](./architecture/decisions/ADR-0003-single-v1-deployment-target.md)); `sdd/workspace/` (2026-07-07, created ahead of code under the framework's "spec leads implementation" allowance); `sdd/frontend/` (2026-07-07, real frontend code is about to be written); `sdd/design-system/` (2026-07-07, a second consumer — Landing and Workspace both — needs the shared contract); `sdd/ai/` (2026-07-08, AI capability decisions ADR-0006 through ADR-0011 gave it enough shape to warrant its own domain); `sdd/analytics/` (2026-07-13, [ADR-0013](./architecture/decisions/ADR-0013-analytics-provider-independence.md) — created ahead of code, mirroring `sdd/ai/`'s own precedent); `sdd/landing/` (2026-07-17, real Landing code already existed and a validated redesign direction was reached — see `landing/00_index.md`'s Provenance section; unlike Workspace, this was spec catching up to code, not leading it); `release/` (outside `sdd/`, 2026-07-17, first actual production deployment — bookkeeping only, per the framework's own rule that specifications otherwise stay unaware of release status; see `release/000_index.md`, never this document, for what's actually released). None of these are listed above as pending anymore.

## Key Conventions

- **Evidence tagging:** every fact in `sdd/context/` and `sdd/domain/` is marked `(Explicit)` (stated directly in the product brief) or `(Inferred)` (a design decision made to complete the specification) — see each document's inline notes.
- **Roadmap:** canonically owned by [context/01_product_vision.md](./context/01_product_vision.md); no other document restates the V1–V5 stage table.
- **Product Positioning and Product Principles:** canonically owned by [context/01_product_vision.md](./context/01_product_vision.md); no other document restates what Hypora is/isn't or its enduring principles.
- **Application responsibilities:** canonically owned by [context/05_application_responsibilities.md](./context/05_application_responsibilities.md); no other document restates what Landing/Workspace/Platform API is for.
- **Success Metrics:** canonically owned by [context/02_product_scope.md](./context/02_product_scope.md); no other document defines its own success measurement.
- **Project lifecycle (states, transitions, guards):** canonically owned by [domain/01_business_idea_lifecycle.md](./domain/01_business_idea_lifecycle.md); [workspace/01_architecture.md](./workspace/01_architecture.md) may reference lifecycle stage as a display concern only, never redefine a transition.
- **Workspace's own IA, feature inventory (categorization), data ownership, state model, persistence, and error states:** canonically owned by [workspace/01_architecture.md](./workspace/01_architecture.md) and [workspace/02_data_and_state.md](./workspace/02_data_and_state.md); no other document restates them.
- **Landing's own section/route inventory, component model, component contracts, Design System consumption, and Motion System:** canonically owned by [landing/02_information_architecture.md](./landing/02_information_architecture.md) through [landing/06_motion_system.md](./landing/06_motion_system.md); `landing/improvement/` and `landing/planning/` are frozen historical evidence, never updated to track these documents' future changes, and never a source to copy from without re-deriving against Hypora's own philosophy (see [landing/00_index.md](./landing/00_index.md)).
- **Each Feature's Purpose, Responsibilities, User Stories, Acceptance Criteria, and cross-Feature boundaries:** canonically owned by its own document under [workspace/features/](./workspace/features/000_index.md); no other document (including `workspace/01_architecture.md`'s Feature Inventory) restates this detail — the inventory only categorizes, the Feature Specification defines.
- **Deployment target and Application deployment inclusion:** canonically owned by [infra/01_deployment.md](./infra/01_deployment.md); [analysis/01_v1_release_specification.md](./analysis/01_v1_release_specification.md) summarizes it for release-boundary orientation but does not redefine it.
- **Git branch/merge/versioning strategy:** canonically owned by [workflow/02_git_and_release_strategy.md](./workflow/02_git_and_release_strategy.md).
- **Frontend codebase structure (routing, feature boundaries, component ownership, state ownership, LocalStorage access boundary):** canonically owned by [frontend/01_architecture.md](./frontend/01_architecture.md); `infra/01_deployment.md` references it rather than restating it.
- **Design System component inventory and composition rules:** canonically owned by [design-system/01_design_system.md](./design-system/01_design_system.md); `frontend/01_architecture.md` references it rather than restating it.
- **Business Structuring's Question Model and Preset Strategy:** canonically owned by [workspace/features/02_1_question_model.md](./workspace/features/02_1_question_model.md); no other document (including `02_business_structuring.md` itself) restates the Question schema or the replaceable-content contract.
- **Localization Principle (Korean-first policy):** canonically owned by [context/01_product_vision.md](./context/01_product_vision.md#localization-principle); no other document restates the policy, only cites it.
- **Language selection flow and localization scope (what's localized vs. not):** canonically owned by [workspace/01_architecture.md](./workspace/01_architecture.md#localization); no other document restates the detection/default/override rules or the localized/not-localized content lists.
- **Persisted `language` state:** canonically owned by [workspace/02_data_and_state.md](./workspace/02_data_and_state.md#application-level-state-non-project); no other document redefines its persistence or scope.
- **The Localization Layer (where localization lives in the codebase architecture):** canonically owned by [frontend/01_architecture.md](./frontend/01_architecture.md#localization-layer); no other document restates the layering or the "no hardcoded strings" rule at the architecture level.
- **Component-level localization contract (what a compliant Design System primitive must do):** canonically owned by [design-system/01_design_system.md](./design-system/01_design_system.md#localization-requirements); no other document restates it.
- **Question/Preset content-identity vs. presentation-content separation and `localizationKey`:** canonically owned by [workspace/features/02_1_question_model.md](./workspace/features/02_1_question_model.md#localization); no other document (including `02_business_structuring.md`) redefines it.
- **Localization Readiness Gate (release checklist):** canonically owned by [analysis/01_v1_release_specification.md](./analysis/01_v1_release_specification.md#localization-readiness-gate); no other document restates the checklist.
- **ADR numbering:** `ADR-NNNN`, sequential, never reused — see `sdd-framework/07_adr_process.md` for the full lifecycle rule this project follows.
- **Analytics Event Catalog:** canonically owned by [analytics/04_event_catalog.md](./analytics/04_event_catalog.md); no Feature or AI Capability specification restates or invents its own `eventName`.
