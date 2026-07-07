# Hypora

A web-based workspace that helps users transform business ideas into structured, validated MVP plans. The long-term vision is an AI Co-founder platform; the current stage is a manual MVP with no AI or backend dependency, built so future AI capability can be added without a major redesign.

## Documentation Map

| Location | Contents |
|---|---|
| [`sdd-framework/`](./sdd-framework/) | The generalized Specification-Driven Development methodology this project follows — read this to understand *how* the specification tree below is organized and maintained. |
| [`sdd/00_index.md`](./sdd/00_index.md) | Master index of this project's actual specification tree — product vision, scope, architecture decisions, and process/governance documents. |
| [`CLAUDE.md`](./CLAUDE.md) | Always-loaded agent instructions — read this first for any task. |

## Current Stage

Product specification only. No Application (Landing, Workspace, Platform API) has real code yet — see [`sdd/00_index.md`](./sdd/00_index.md) for what's defined so far and what's deliberately deferred until its trigger condition is real.

## Product Architecture

One Product, multiple Applications — see [`sdd/context/05_application_responsibilities.md`](./sdd/context/05_application_responsibilities.md) and [`ADR-0001`](./sdd/architecture/decisions/ADR-0001-one-product-multiple-applications.md):

- **Landing** — marketing website.
- **Workspace** — the primary MVP; the actual web application.
- **Platform API** — backend platform (V1: LocalStorage; future: real backend).
