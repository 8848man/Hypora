# Hypora — Agent Instructions

This project follows Specification-Driven Development (SDD), per the methodology documented in `sdd-framework/`. That framework directory is the generalized, project-agnostic operating model; `sdd/` is this project's actual specification tree, built on it.

## Read Order for Any Task

1. This file.
2. `sdd/workflow/00_implementation_lifecycle.md` — the phase sequence every task follows.
3. `sdd/workflow/01_context_loading.md` — which documents to load for your specific task type. **If a document isn't listed there for your task type, don't load it.**

## Current Project Stage

`sdd/context/` defines the product; `sdd/workspace/` and `sdd/landing/` each define their own Application in detail; both have real code (`app/src/`). Platform API remains unpromoted — V1 still uses LocalStorage, not a real backend, and has no dedicated `sdd/platform-api/` directory yet. Landing's specification directory was promoted 2026-07-17 as spec catching up to already-existing code and a validated redesign direction — see `sdd/landing/00_index.md`'s Provenance section — not as spec leading implementation the way Workspace's was. Do not begin *new* implementation, generate development tasks, generate UI components, or design backend APIs beyond what an explicit specification-based task calls for — see `sdd/00_index.md` for what exists today and what is deliberately deferred.

## Non-Negotiable Rules

- **Specification is the source of truth.** Code (once it exists) is evidence of current behavior, never assumed correct just because it runs.
- **One Product, multiple Applications.** Landing, Workspace, and Platform API are never modeled as independent products — see `sdd/architecture/decisions/ADR-0001-one-product-multiple-applications.md`.
- **Every concept has exactly one canonical owner.** Before writing a fact into any document, check `sdd/rules/ownership.md` and the concept-ownership discipline in `sdd-framework/13_concept_ownership_model.md`. Reference, never duplicate.
- **Never delete historical documentation.** Archive it (`sdd/archive/`, once it exists) instead, per `sdd-framework/14_evolution_rules.md`.
- **Never add a commit hash, PR number, or historical narrative to a living spec.** That belongs in a Release entry or an ADR's optional provenance field.
- **Every task closes with the SDD Drift Check and the Artifact Decision Matrix**, per `sdd-framework/05_validation_and_review.md` — even when the answer to every row is "no change needed," state that explicitly.

## Where Things Live

See `sdd/00_index.md` for the full map. In short: product intent lives in `sdd/context/`, the Project lifecycle in `sdd/domain/`, Workspace's own spec in `sdd/workspace/`, Landing's own spec in `sdd/landing/` (its `improvement/` and `planning/` subdirectories are frozen historical evidence, not specification — see `sdd/landing/00_index.md`), the AI Platform's own spec in `sdd/ai/`, Analytics' own spec in `sdd/analytics/`, deployment target in `sdd/infra/`, the unified V1 release plan in `sdd/analysis/`, architectural decisions in `sdd/architecture/decisions/`, actual release/deployment history in `release/` (outside `sdd/` — see `sdd-framework/08_release_process.md` for why), process/governance (including the Git branch/release strategy) in `sdd/workflow/` and `sdd/rules/`. Directories not yet created (`sdd/platform-api/`, `sdd/archive/`) are deliberately deferred — see the index's "Not Yet Created" table for their trigger conditions.
