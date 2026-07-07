# ADR-0003: Single V1 Deployment Target — Landing + Workspace Bundled, Platform API Excluded

**Status:** Accepted
**Date:** 2026-07-07
**Affects specs:** [Deployment Strategy](../../infra/01_deployment.md), [V1 Release Specification](../../analysis/01_v1_release_specification.md), [Application Responsibilities](../../context/05_application_responsibilities.md)

## Context

Hypora's Product Architecture ([ADR-0001](./ADR-0001-one-product-multiple-applications.md)) defines three Applications — Landing, Workspace, Platform API — each with its own responsibilities and, eventually, its own codebase. V1 needs an actual deployment target before it can ship to real users. Deploying each Application as a fully independent unit is the default assumption a multi-Application architecture might suggest, but V1 has no real backend (Platform API is LocalStorage-only, per [Application Responsibilities](../../context/05_application_responsibilities.md)) and is a small enough surface that independent deployment infrastructure for three units would be disproportionate to what V1 actually needs to ship.

This decision spans Landing, Workspace, and Infra (all three areas' specifications reference the deployment target), is moderately expensive to reverse once real users depend on the bundled deployment's URL structure and release cadence, and was chosen among genuinely different alternatives — it meets the ADR trigger list.

## Decision

Deploy Hypora V1 as **one Vercel project**, containing both Landing and Workspace inside the same deployment. Platform API is not deployed in V1 — it has no real implementation to deploy yet (LocalStorage is client-side, inside the Workspace bundle itself, not a separate service).

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Deploy Landing and Workspace as two separate Vercel projects | Doubles deployment configuration and hosting overhead for no V1 benefit — neither Application has a release cadence or scaling need that currently justifies independent deployment; revisit if either Application's needs diverge |
| Deploy all three Applications (including a placeholder Platform API) now, ahead of real backend need | Platform API has no real implementation in V1 (see [Application Responsibilities](../../context/05_application_responsibilities.md)) — deploying an empty or placeholder service would add operational surface with no corresponding capability, contradicting "current MVP first" |
| A single Vercel project per Application plus a shared reverse proxy / custom domain routing layer | Considered as a middle ground, but rejected as unnecessary infrastructure complexity for an MVP with no traffic, scaling, or team-ownership pressure yet forcing the split |

## Consequences

**Easier:**
- One deployment to configure, monitor, and roll back for all of V1's real, user-facing surface.
- Lower hosting/project-count overhead during the MVP phase, consistent with the explicit stated reasoning (reduce deployment complexity, reduce Vercel project usage, simplify MVP delivery).

**Harder / accepted trade-offs:**
- Landing and Workspace cannot be deployed, scaled, or rolled back independently while bundled — an emergency rollback of one affects the other (recorded as a Release Risk in [V1 Release Specification](../../analysis/01_v1_release_specification.md)).
- If either Application's release cadence or scaling needs diverge significantly in the future, unbundling them requires a new ADR superseding this one — this is an intentionally higher bar than a routine config change, consistent with ADR-0001's precedent for architecturally significant decisions.
