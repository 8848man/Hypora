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

Placeholder — populate this row the first time a real Application (Landing, Workspace, or Platform API) has actual code. Use the framework's `12_context_loading_strategy.md` Feature Implementation row as the starting template, substituting this project's actual layer/contract documents once they exist.

## Architecture Change (future task type)

Placeholder — populate once `sdd/architecture/decisions/` holds at least one ADR and a second one is being considered. Mandatory loads will include the ADR index and any existing ADR touching the affected area.
