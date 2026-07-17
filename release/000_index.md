# Release Index

**Refs:** → [sdd/00_index.md](../sdd/00_index.md) · [Git and Release Strategy](../sdd/workflow/02_git_and_release_strategy.md) · [Deployment Strategy](../sdd/infra/01_deployment.md) · [V1 Release Specification](../sdd/analysis/01_v1_release_specification.md)

Per `sdd-framework/08_release_process.md`: this is the one file in `release/` that must always be current. Everything else here is append-only history. This directory sits outside `sdd/` deliberately — release records describe what was actually deployed, to real infrastructure, at a real point in time; specifications remain unaware of them (see that document's "Corollary").

## Currently Released Components

| Component | Version | Git Tag | Deployed | Log |
|---|---|---|---|---|
| Frontend (bundled Landing + Workspace) | `0.1.0` | `frontend-v0.1.0` | [https://hypora-2026.vercel.app](https://hypora-2026.vercel.app) | [frontend/2026.md](./frontend/2026.md) |

Platform API has no entry — it is not deployed (V1 uses LocalStorage inside the frontend bundle; see [Deployment Strategy](../sdd/infra/01_deployment.md)).

## Project Rollups

| Date | Entry |
|---|---|
| 2026-07-17 | [project/2026.md](./project/2026.md) — REL-2026-07-17 |
