# Hypora

A web-based workspace that helps users transform business ideas into structured, validated MVP plans. The long-term vision is an AI Co-founder platform; the current stage is a manual MVP with no AI or backend dependency, built so future AI capability can be added without a major redesign.

## Documentation Map

| Location | Contents |
|---|---|
| [`sdd-framework/`](./sdd-framework/) | The generalized Specification-Driven Development methodology this project follows — read this to understand *how* the specification tree below is organized and maintained. |
| [`sdd/00_index.md`](./sdd/00_index.md) | Master index of this project's actual specification tree — product vision, scope, domain model, Workspace spec, infra, release planning, architecture decisions, and process/governance documents. |
| [`CLAUDE.md`](./CLAUDE.md) | Always-loaded agent instructions — read this first for any task. |

## Current Stage

Product, Workspace, and V1 Feature specifications complete; still pre-implementation. No Application has real code yet, but Workspace now has its own dedicated architecture, data specification, and five Feature Specifications (see [`sdd/workspace/`](./sdd/workspace/), [`sdd/workspace/features/`](./sdd/workspace/features/000_index.md)), ahead of code, under the framework's "spec leads implementation" allowance. See [`sdd/00_index.md`](./sdd/00_index.md) for what's defined so far and what's deliberately deferred until its trigger condition is real.

## Product Architecture

One Product, multiple Applications — see [`sdd/context/05_application_responsibilities.md`](./sdd/context/05_application_responsibilities.md) and [`ADR-0001`](./sdd/architecture/decisions/ADR-0001-one-product-multiple-applications.md):

- **Landing** — marketing website.
- **Workspace** — the primary MVP; the actual web application.
- **Platform API** — backend platform (V1: LocalStorage; future: real backend).

Every project's structuring/validation progress follows one canonical lifecycle — see [`sdd/domain/01_business_idea_lifecycle.md`](./sdd/domain/01_business_idea_lifecycle.md) and [`ADR-0002`](./sdd/architecture/decisions/ADR-0002-business-idea-lifecycle-domain-model.md).

## V1 Release

V1 deploys as one Vercel project (Landing + Workspace bundled; Platform API excluded) — see [`sdd/analysis/01_v1_release_specification.md`](./sdd/analysis/01_v1_release_specification.md), [`sdd/infra/01_deployment.md`](./sdd/infra/01_deployment.md), and [`ADR-0003`](./sdd/architecture/decisions/ADR-0003-single-v1-deployment-target.md). Git workflow (branch model, merge strategy, versioning) is documented in [`sdd/workflow/02_git_and_release_strategy.md`](./sdd/workflow/02_git_and_release_strategy.md).
