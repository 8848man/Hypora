---
Document ID: SPEC-RELEASE-001
Version: 1.0
Status: Authoritative
Scope: What ships as the Hypora V1 release, as one deployable product, and the process that leads to it
Audience: Anyone planning, reviewing, or validating the V1 release boundary
---

# V1 Release Specification

**Refs:** → [00_index](../00_index.md) · [Product Vision](../context/01_product_vision.md) · [Product Scope](../context/02_product_scope.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [Workspace Architecture](../workspace/01_architecture.md) · [Deployment Strategy](../infra/01_deployment.md) · [Git and Release Strategy](../workflow/02_git_and_release_strategy.md) · [ADR-0003](../architecture/decisions/ADR-0003-single-v1-deployment-target.md) · [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md)

Placed under `sdd/analysis/` (Type 12: Large Cross-Layer Authoritative Spec) because it is a single, tightly-coupled contract about *what ships as V1* that cuts across Product Scope, both Applications, Infra, and Git process — none of which alone should own "the release boundary" as a whole. **This document synthesizes; it does not duplicate.** Every fact below already has a canonical owner elsewhere and is cited, not restated in full — this document's own content is limited to the facts that don't yet have a home anywhere else (the release boundary itself, and the included/excluded decision).

## Release Goal

Ship Hypora V1 — the manual, AI-free workspace for structuring and validating a business idea — as one deployable product. See [Product Vision](../context/01_product_vision.md) for the full stated purpose; this document does not restate it.

## Release Scope

V1's functional scope is exactly what [Product Scope](../context/02_product_scope.md) and [Workspace Architecture](../workspace/01_architecture.md)'s Core Feature Inventory already define. This document does not re-list features — see those documents.

## Release Boundary — Applications Included / Excluded

*(Explicit — the deployment decision itself; canonically owned by [Deployment Strategy](../infra/01_deployment.md), restated here at summary level because "what's in the release" is precisely this document's reason to exist.)*

| Application | In the V1 release? |
|---|---|
| Landing | Yes |
| Workspace | Yes |
| Platform API | **No** — remains future work; V1's persistence is LocalStorage inside the Workspace bundle, not a separately deployed service |

Full reasoning and alternatives considered: [Deployment Strategy](../infra/01_deployment.md), [ADR-0003](../architecture/decisions/ADR-0003-single-v1-deployment-target.md).

## Success Criteria

Canonically owned by [Product Scope](../context/02_product_scope.md#mvp-success-criteria) (qualitative gates) and [Product Scope](../context/02_product_scope.md#success-metrics) (North Star + Supporting Metrics). This document adds no new success criteria — a release is successful exactly when those already-defined criteria hold for the deployed product.

## Release Risks

Canonically owned by [Product Scope](../context/02_product_scope.md#risks). One release-specific addition not covered there:

| Risk | Why it matters | Mitigation direction |
|---|---|---|
| Bundling Landing and Workspace into one Vercel project removes the ability to deploy, scale, or roll back either Application independently | If Workspace needs an emergency rollback, Landing rolls back with it (and vice versa) | Accepted trade-off for V1 (see [ADR-0003](../architecture/decisions/ADR-0003-single-v1-deployment-target.md)); revisit if either Application's release cadence diverges enough to justify separate deployments |

## Localization Readiness Gate

*(Explicit — this task's product decision; see [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md). Owned here because this is the release-readiness synthesis document — the underlying localization facts it checks against are owned by [Product Vision](../context/01_product_vision.md#localization-principle), [Question Model](../workspace/features/02_1_question_model.md#localization), [Frontend Architecture](../frontend/01_architecture.md#localization-layer), and [Design System](../design-system/01_design_system.md#localization-requirements) — this gate cites them, it does not redefine them.)*

No release — V1's first release or any later one — is considered ready while any of the following is unmet, per the [Localization Principle](../context/01_product_vision.md#localization-principle)'s "localization is product quality, not an optional layer":

- ☐ Korean resources complete for every feature shipping in the release
- ☐ English resources complete for every feature shipping in the release, and verified to preserve the original Korean meaning
- ☐ No missing localization keys (every `localizationKey` referenced by a Question, preset, or UI string resolves in both languages)
- ☐ No hardcoded UI strings (per [Frontend Architecture](../frontend/01_architecture.md#localization-layer)'s and [Design System](../design-system/01_design_system.md#localization-requirements)'s rules)
- ☐ Language switching verified end-to-end (detection, manual switch, persistence across refresh, per [Workspace Architecture](../workspace/01_architecture.md#localization))
- ☐ Responsive layout checked in both languages (per [Design System](../design-system/01_design_system.md#localization-requirements)'s English-expansion tolerance rule)

This gate applies **in addition to**, not instead of, the Success Criteria above — a release must satisfy both.

## Known Limitations

Synthesized from already-recorded facts — no new limitation is introduced here:

- No backend, no authentication, no cross-device persistence ([Product Scope](../context/02_product_scope.md)'s Constraints and Risks).
- No AI capability of any kind ([Product Vision](../context/01_product_vision.md)'s V1 constraint).
- Platform API is not deployed — Workspace's persistence is entirely client-side LocalStorage ([Deployment Strategy](../infra/01_deployment.md)).

## Deployment Target

Canonically owned by [Deployment Strategy](../infra/01_deployment.md): one Vercel project containing Landing and Workspace.

## Branch Strategy, Merge Strategy, Versioning Strategy

Canonically owned by [Git and Release Strategy](../workflow/02_git_and_release_strategy.md): `main`/`develop`/feature-branch GitFlow-like model, `develop → main` merge as the release action, and the bundled Landing+Workspace component's own semver line starting at `0.1.0`.

## What "Release-Ready" Means for This Specification

This document describes the *intended* release boundary — it is a specification, not a release record. No deployment has occurred yet, and this document does not claim otherwise. Per [Git and Release Strategy](../workflow/02_git_and_release_strategy.md), a `release/` entry is created only once `develop` is actually merged into `main` and deployed — this specification exists to make that eventual action unambiguous, not to record that it has already happened.
