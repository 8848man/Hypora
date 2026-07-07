# Context Loading Strategy

**Refs:** → [00_index](../00_index.md) · [Implementation Lifecycle](./00_implementation_lifecycle.md)

Per-task-type mandatory/recommended/optional/never loading matrix, per the framework's `12_context_loading_strategy.md`. Started minimal at bootstrap (`10_bootstrap_guide.md` Step 1); extended as new task types recur.

## General Rules

1. Load the code before the spec, once real code exists. Until then, load the existing spec tree before drafting new spec content — you need to know what's already been decided before adding to it.
2. Product-level, design-time-only documents (`sdd/context/**`) are `Never` for future implementation tasks, except when the task is explicitly about evaluating scope or priorities. They are `Mandatory` for Product Specification tasks (see below).
3. If a document isn't listed for your task type, don't load it — default to skip, not default to include.

## Product Specification (current task type — no code exists yet)

| Tier | Documents |
|---|---|
| Mandatory | `sdd/00_index.md`; `sdd/rules/spec_authoring_rules.md`; `sdd/rules/ownership.md`; every existing document under `sdd/context/` |
| Recommended | Any existing ADR under `sdd/architecture/decisions/` touching product architecture |
| Optional | None yet |
| Never | Future `sdd/<application>/` implementation docs (none exist yet) |

**Capability attributes:**

| Attribute | Value |
|---|---|
| Purpose | Define or refine what the product is, for whom, and at what scope — no implementation |
| Produced artifacts | `sdd/context/**` documents; an ADR if the Product Architecture itself changes |
| Required validation | Internal consistency across all `sdd/context/` documents; no duplicated concept ownership; every document reachable from `sdd/00_index.md` |
| Ownership boundary | Product / Context area |
| Stop for human when | A scope decision has no framework-derivable answer (e.g., which persona to prioritize) and no existing instruction resolves it |

## Feature Implementation (future task type — not yet applicable, no code exists)

Placeholder — populate this row the first time a real Application (Landing, Workspace, or Platform API) has actual code. Use the framework's `12_context_loading_strategy.md` Feature Implementation row as the starting template; `sdd/workspace/01_architecture.md` and `sdd/workspace/02_data_and_state.md` already exist as the Mandatory contract/architecture docs to substitute in for Workspace once code work begins.

## Architecture Change

| Tier | Documents |
|---|---|
| Mandatory | `sdd/architecture/decisions/000_index.md`; any existing ADR touching the affected area; `sdd/rules/ownership.md` |
| Recommended | Every `sdd/context/`, `sdd/domain/`, `sdd/workspace/`, or `sdd/infra/` document the change plausibly touches |
| Optional | `sdd-framework/07_adr_process.md`, if the ADR trigger determination itself is ambiguous |
| Never | `release/` (doesn't exist yet); Landing/Platform API implementation docs (don't exist yet) |

**Capability attributes:**

| Attribute | Value |
|---|---|
| Purpose | Change or introduce a decision meeting the ADR trigger list |
| Produced artifacts | A new or superseding ADR; any spec the decision affects (e.g., ADR-0003 affected `sdd/infra/`, `sdd/analysis/`, and `sdd/context/05_application_responsibilities.md`) |
| Required validation | Internal consistency between the ADR and every spec it affects; ADR index updated in the same task |
| Ownership boundary | Every area the ADR's consequences span |
| Stop for human when | Cross-area sign-off cannot be obtained, once real implementation areas exist with something to protect |

## Release Planning (new task type, following ADR-0003)

| Tier | Documents |
|---|---|
| Mandatory | `sdd/analysis/01_v1_release_specification.md`; `sdd/infra/01_deployment.md`; `sdd/workflow/02_git_and_release_strategy.md` |
| Recommended | `sdd/context/02_product_scope.md` (Success Criteria, Risks) for anything the release specification cites rather than restates |
| Optional | `sdd/architecture/decisions/ADR-0003-single-v1-deployment-target.md`, if the deployment boundary itself is in question |
| Never | `release/` (doesn't exist yet — created only at first actual deployment) |

**Capability attributes:**

| Attribute | Value |
|---|---|
| Purpose | Define or refine what ships as a release, its deployment boundary, and the git process leading to it — before any actual deployment |
| Produced artifacts | Updates to the three Mandatory documents above; a new ADR if the deployment boundary itself changes |
| Required validation | Every fact in `sdd/analysis/01_v1_release_specification.md` still correctly cites its canonical owner, rather than having drifted into restating it |
| Ownership boundary | Infra / Governance areas, jointly |
| Stop for human when | An actual deployment is being considered, not just planned — recording a release before it happens is explicitly forbidden (see `sdd/workflow/02_git_and_release_strategy.md`) |
