# Workspace Feature Specifications — Index

**Refs:** → [00_index](../../00_index.md) · [Workspace Architecture](../01_architecture.md) · [Workspace Data & State](../02_data_and_state.md)

Every V1 Feature Specification, in the order a Project moves through them (not a strict enforced order — see each Feature's own Relationships section). Mirrors the ADR index pattern: growth means one new file plus one new row here, never an edit to a shared file.

| # | Feature | Purpose |
|---|---|---|
| [01](./01_project_management.md) | Project Management | Create, list, select, and archive a business idea Project |
| [02](./02_business_structuring.md) | Business Structuring | Transform an idea into a structured hypothesis (Canvas + optional Risk Notes) |
| [03](./03_mvp_planning.md) | MVP Planning | Define the smallest valuable scope and a prioritized feature list |
| [04](./04_validation_planning.md) | Validation Planning | Turn the hypothesis into testable, resolvable assumptions |
| [05](./05_project_summary.md) | Project Summary | Aggregate readiness at a glance; own the Validated → Build-Ready confirmation |

## Feature Philosophy

Each Feature above represents a **user goal that remains stable even if the UI changes** — never a screen, page, or UI component in its own right. See each Feature's own document for how it maps onto [Workspace Architecture](../01_architecture.md)'s actual screens; that mapping may change independently of the Feature's own definition.

## Ownership

Every Feature Specification here is owned by the Workspace area (`sdd/rules/ownership.md`). Each Feature document owns exactly its own Purpose/Responsibilities/User Stories/Acceptance Criteria — none may redefine [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s states/guards, [Workspace Data & State](../02_data_and_state.md)'s data ownership, or [Workspace Architecture](../01_architecture.md)'s screen inventory; each references those documents instead.
