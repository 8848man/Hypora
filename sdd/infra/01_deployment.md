# Deployment Strategy (V1)

**Refs:** → [00_index](../00_index.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [V1 Release Specification](../analysis/01_v1_release_specification.md) · [ADR-0003](../architecture/decisions/ADR-0003-single-v1-deployment-target.md)

Created because the trigger condition for `sdd/infra/` fired — per `10_bootstrap_guide.md` Step 6, "as soon as there's a real deployment target (even a single manual deploy script counts)." This document records the *intended* deployment target; see [V1 Release Specification](../analysis/01_v1_release_specification.md) for release-readiness status and `release/000_index.md` (outside `sdd/`) for actual deployment history, per the framework's rule that specifications stay unaware of release status.

## Deployment Target

*(Explicit.)* Hypora V1 is deployed as **one Vercel project**, containing both Landing and Workspace inside the same deployment — realized as **one React application with one Router**, per [Frontend Architecture](../frontend/01_architecture.md), which is the canonical owner of the codebase-level detail; this document owns only the deployment-target fact itself.

## Applications Included / Excluded

| Application | In V1 deployment? | Reasoning |
|---|---|---|
| Landing | Yes | Bundled with Workspace into the single Vercel project |
| Workspace | Yes | Bundled with Landing into the single Vercel project |
| Platform API | Partially — see note | Workspace's own project persistence remains LocalStorage-only, no separate deployment; the AI capability, however, **is** deployed — as serverless functions co-located inside this same single Vercel project, not a second deployment (see [Application Responsibilities](../context/05_application_responsibilities.md#platform-api)). This does not reopen [ADR-0003](../architecture/decisions/ADR-0003-single-v1-deployment-target.md)'s accepted "one Vercel project" decision — it's still exactly one project — but its literal "Platform API is not deployed in V1" sentence is narrower than current reality; see that ADR's own immutable Decision text for what was actually decided, and treat this row as the corrected status, not a silent rewrite of the ADR. |

## Reasoning

*(Explicit — stated directly as the reason for this decision.)*

- Reduce deployment complexity.
- Reduce Vercel project usage.
- Simplify MVP delivery.

This is recorded as an architectural decision, not merely a configuration note — see [ADR-0003](../architecture/decisions/ADR-0003-single-v1-deployment-target.md) for the alternatives considered and why bundling was chosen over deploying Landing and Workspace separately.

## What This Document Does Not Cover

- Environment variables / secrets: real ones now exist for the AI capability (`GEMINI_API_KEY`) and Analytics/admin-auth (Firebase config), per `app/.env.example` — owned and enumerated by [AI Platform Architecture](../ai/01_architecture.md) / [Provider Independence & Configuration](../ai/02_provider_independence_and_configuration.md) and [Analytics Architecture](../analytics/01_architecture.md) respectively, not restated here; this document only confirms they exist, since it previously (and incorrectly, once the AI capability shipped) claimed none did.
- CI/CD pipeline shape: not yet defined: no pipeline configuration exists in this specification pass. Add it here, in this same document, the moment one is introduced — do not create a competing document.
- Testing strategy: not yet defined for the same reason; mark as a gap here rather than silently absent, per the framework's convention for a testing spec that runs ahead of actual coverage.

## Relationship to `release/`

This document records the *intended* deployment target — it is not itself a release record, and never becomes one. Per `10_bootstrap_guide.md` Step 8, release management is owned entirely by `release/` (outside `sdd/`), introduced once something is actually deployed to real users; this document does not track whether that has happened, per the framework's own rule that specifications stay unaware of release status. See [sdd/workflow/02_git_and_release_strategy.md](../workflow/02_git_and_release_strategy.md) for the branch/versioning process governing that event.
