# Platform API Architecture

**Refs:** → [00_index](./00_index.md) · [sdd/00_index](../00_index.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [AI Platform Architecture](../ai/01_architecture.md) · [Analytics Architecture](../analytics/01_architecture.md) · [02_projects](./02_projects.md) · [03_authentication](./03_authentication.md) · [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md)

Created per [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md), which fired this directory's promotion trigger (`sdd/00_index.md`'s "Not Yet Created" table — a real backend capability beyond the AI capability, or Authentication/Search/Integrations becoming real). This document does not redesign anything ADR-0024 already decided; it records the current, standing shape of Platform API as a whole, mirroring how [AI Platform Architecture](../ai/01_architecture.md) and [Analytics Architecture](../analytics/01_architecture.md) each already document their own Platform Service.

## Purpose

*(By reference)* — Platform API is the Application named in [Application Responsibilities](../context/05_application_responsibilities.md#platform-api)'s Product Architecture. This document owns *how* its capabilities are structured once real, not *what* Platform API is for (owned by that document, never restated here).

## Current Capability Status

This table is the single place that summarizes cross-capability status; per-capability detail is owned by each capability's own document, never restated here (Duplication Rule, `sdd/rules/spec_authoring_rules.md`) — mirrors why [Analytics Architecture](../analytics/01_architecture.md) stays a summary once `02_event_model.md` etc. exist alongside it.

| Capability | Status | Owning doc |
|---|---|---|
| AI | Implemented — real backend (Vercel serverless functions) | [`sdd/ai/`](../ai/01_architecture.md) |
| Analytics | Implemented — write path + internal Dashboard read path | [`sdd/analytics/`](../analytics/01_architecture.md) |
| Projects | **Partially implemented** — dual-mode (LocalStorage or Firestore, by auth state), one-directional migration at sign-in/link time. No cross-device sync for pre-login usage. | [`02_projects.md`](./02_projects.md) |
| Authentication | **Partially implemented** — Anonymous identity, plus email/password account sign-up/sign-in. Not the general, multi-user capability in full. | [`03_authentication.md`](./03_authentication.md) |
| Search | Not implemented | [Application Responsibilities](../context/05_application_responsibilities.md#platform-api) |
| Integrations | Not implemented | [Application Responsibilities](../context/05_application_responsibilities.md#platform-api) |

**Distinguishing current vs. future is mandatory for every fact recorded here** — the same rule [Application Responsibilities](../context/05_application_responsibilities.md) already states for its own capability table applies identically to this one.

## What This Document Does Not Cover

- AI's own Capability Model, Provider Interface, or per-capability contracts — owned entirely by [`sdd/ai/`](../ai/01_architecture.md).
- Analytics' own Event Model, Provider Independence, or Query/Reporting — owned entirely by [`sdd/analytics/`](../analytics/01_architecture.md).
- Projects' dual-mode access, migration policy, and storage shape — owned entirely by [`02_projects.md`](./02_projects.md).
- Authentication's three uses, sign-up/sign-in validation policy, and error classification — owned entirely by [`03_authentication.md`](./03_authentication.md).
- Search and Integrations — not yet implemented; when either is promoted, it gets its own document here, per the same "promote on real evidence" discipline this directory itself was just promoted under.
