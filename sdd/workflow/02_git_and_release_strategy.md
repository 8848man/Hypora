# Git and Release Strategy

**Refs:** → [00_index](../00_index.md) · [Implementation Lifecycle](./00_implementation_lifecycle.md) · [V1 Release Specification](../analysis/01_v1_release_specification.md) · [Deployment Strategy](../infra/01_deployment.md)

*(Explicit — the branch model and its roles are given directly; this document records it as project governance, per the framework's `sdd/workflow/` document type, and adds only the minimum inferred detail needed to make it actionable.)*

## Branch Model (GitFlow-like)

| Branch | Role | Rule |
|---|---|---|
| `main` | Production-ready releases only | Never committed to directly; receives merges only from `develop` at release time |
| `develop` | Primary integration branch | All completed feature work lands here first |
| Feature branches | One per unit of work | Created from `develop`; merged back into `develop`; never merged directly into `main` |

**No release branches** are introduced at this stage — the task establishing this strategy explicitly does not require them, and the framework's own bias (`14_evolution_rules.md`: don't introduce structure ahead of a real trigger) argues against adding a branch tier with no current need. If a future release genuinely needs to be stabilized independently of ongoing `develop` work, introduce a release-branch rule here, in this same document, rather than inventing one ad hoc.

## Merge Strategy

- Feature branch → `develop`: once the feature branch's own validation (per [Implementation Lifecycle](./00_implementation_lifecycle.md)) passes. Within a feature branch, commit granularity (when and how often to commit while work is in progress) is owned by [Implementation Lifecycle](./00_implementation_lifecycle.md#commit-discipline) — this document governs branch-to-branch flow only, not individual commits.
- `develop` → `main`: only at an actual release point — this merge *is* the release action. Per the framework's Release Flow rule, a release record is written only when something is actually deployed, never speculatively — so this merge and an actual Vercel deployment of `main` should happen together, not as two disconnected events.

## Versioning Strategy

Per the SDD Framework's `06_naming_and_versioning.md`: each independently-deployable component declares its own version and is tagged in git at the exact deployed commit — never a single monorepo-wide version number.

- Hypora V1's deployable unit is **one component**: the bundled Landing + Workspace Vercel project (see [Deployment Strategy](../infra/01_deployment.md)) — Platform API is excluded from V1's deployment entirely, so it does not yet need its own version line.
- This bundled component's version starts at `0.1.0` (pre-first-production-release) and is tagged in git only at the commit actually deployed to production — never tagged speculatively ahead of a real deploy, consistent with the framework's Release Flow rule.
- Once Platform API becomes independently deployable (a real backend, deployed separately from the Landing+Workspace bundle), it becomes its own versioned component at that point — not before.

## Relationship to `release/`

Per `10_bootstrap_guide.md` Step 8, `release/` is created "the first time something is actually deployed to real users." This document governs the *process* the framework's Release Flow describes for that event — the exact tag/entry mechanics live in `sdd-framework/08_release_process.md`, not here, and this document does not track whether `release/` currently exists or what it currently contains, per the framework's own rule that specifications stay unaware of release status.

## Open Item — Existing `v1` Branch

A branch named `v1` already exists in this repository (created before this Git strategy was documented), diverging from the `main`/`develop`/feature-branch model above. This document does not delete or rename it — that is a destructive action requiring explicit confirmation. **Recommendation:** treat `v1` as superseded by this strategy (its intended work should happen as feature branches off `develop` instead) and retire it once confirmed with whoever created it; do not build further work on top of it under the new model.
