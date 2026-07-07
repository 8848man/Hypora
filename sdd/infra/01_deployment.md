# Deployment Strategy (V1)

**Refs:** → [00_index](../00_index.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [V1 Release Specification](../analysis/01_v1_release_specification.md) · [ADR-0003](../architecture/decisions/ADR-0003-single-v1-deployment-target.md)

Created now because the trigger condition for `sdd/infra/` has fired — per `10_bootstrap_guide.md` Step 6, "as soon as there's a real deployment target (even a single manual deploy script counts)." A concrete deployment target has now been decided for V1, even though no deploy has actually happened yet (see [V1 Release Specification](../analysis/01_v1_release_specification.md) for release-readiness status).

## Deployment Target

*(Explicit.)* Hypora V1 is deployed as **one Vercel project**, containing both Landing and Workspace inside the same deployment — realized as **one React application with one Router**, per [Frontend Architecture](../frontend/01_architecture.md), which is the canonical owner of the codebase-level detail; this document owns only the deployment-target fact itself.

## Applications Included / Excluded

| Application | In V1 deployment? | Reasoning |
|---|---|---|
| Landing | Yes | Bundled with Workspace into the single Vercel project |
| Workspace | Yes | Bundled with Landing into the single Vercel project |
| Platform API | **No** | Remains future work; V1 has no real backend to deploy — it uses LocalStorage inside the Workspace bundle itself (see [Application Responsibilities](../context/05_application_responsibilities.md)) |

## Reasoning

*(Explicit — stated directly as the reason for this decision.)*

- Reduce deployment complexity.
- Reduce Vercel project usage.
- Simplify MVP delivery.

This is recorded as an architectural decision, not merely a configuration note — see [ADR-0003](../architecture/decisions/ADR-0003-single-v1-deployment-target.md) for the alternatives considered and why bundling was chosen over deploying Landing and Workspace separately.

## What This Document Does Not Cover

- Environment variables / secrets: none are required for V1 — no backend, no auth, no third-party API keys. This section is deliberately empty rather than omitted, so a future Platform API deployment doesn't silently need to guess whether this was considered.
- CI/CD pipeline shape: not yet defined: no pipeline configuration exists in this specification pass. Add it here, in this same document, the moment one is introduced — do not create a competing document.
- Testing strategy: not yet defined for the same reason; mark as a gap here rather than silently absent, per the framework's convention for a testing spec that runs ahead of actual coverage.

## Relationship to `release/`

**No `release/` directory exists yet, and this document does not create one.** Per `10_bootstrap_guide.md` Step 8, release management is introduced only "the first time something is actually deployed to real users" — this document records the *intended* deployment target ahead of that event; it is not itself a release record. See [sdd/workflow/02_git_and_release_strategy.md](../workflow/02_git_and_release_strategy.md) for the branch/versioning process that will lead up to the first real release.
