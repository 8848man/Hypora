# Hypora — Agent Instructions

This project follows Specification-Driven Development (SDD), per the methodology documented in `sdd-framework/`. That framework directory is the generalized, project-agnostic operating model; `sdd/` is this project's actual specification tree, built on it.

## Read Order for Any Task

1. This file.
2. `sdd/workflow/00_implementation_lifecycle.md` — the phase sequence every task follows.
3. `sdd/workflow/01_context_loading.md` — which documents to load for your specific task type. **If a document isn't listed there for your task type, don't load it.**

## Current Project Stage

Hypora is in the **product-specification stage**: `sdd/context/` defines the product, but no Application (Landing, Workspace, Platform API) has real code yet. Do not begin implementation, generate development tasks, or design APIs beyond conceptual ownership until a specification-based task explicitly calls for it — see `sdd/00_index.md` for what exists today and what is deliberately deferred.

## Non-Negotiable Rules

- **Specification is the source of truth.** Code (once it exists) is evidence of current behavior, never assumed correct just because it runs.
- **One Product, multiple Applications.** Landing, Workspace, and Platform API are never modeled as independent products — see `sdd/architecture/decisions/ADR-0001-one-product-multiple-applications.md`.
- **Every concept has exactly one canonical owner.** Before writing a fact into any document, check `sdd/rules/ownership.md` and the concept-ownership discipline in `sdd-framework/13_concept_ownership_model.md`. Reference, never duplicate.
- **Never delete historical documentation.** Archive it (`sdd/archive/`, once it exists) instead, per `sdd-framework/14_evolution_rules.md`.
- **Never add a commit hash, PR number, or historical narrative to a living spec.** That belongs in a Release entry or an ADR's optional provenance field.
- **Every task closes with the SDD Drift Check and the Artifact Decision Matrix**, per `sdd-framework/05_validation_and_review.md` — even when the answer to every row is "no change needed," state that explicitly.

## Where Things Live

See `sdd/00_index.md` for the full map. In short: product intent lives in `sdd/context/`, architectural decisions in `sdd/architecture/decisions/`, process/governance in `sdd/workflow/` and `sdd/rules/`. Directories not yet created (`sdd/landing/`, `sdd/domain/`, `sdd/infra/`, `release/`) are deliberately deferred — see the index's "Not Yet Created" table for their trigger conditions.
