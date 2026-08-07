# Platform API — Specification Index

**Refs:** → [00_index](../00_index.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md) · [ADR-0025](../architecture/decisions/ADR-0025-account-authentication-and-one-directional-migration.md)

## Provenance

Created 2026-08-07, promoted by [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md) — the trigger `sdd/00_index.md`'s "Not Yet Created" table named (a real backend capability beyond the AI capability, or Authentication/Search/Integrations becoming real) fired when Project data gained a Firestore backup and Firebase Anonymous Authentication became real. This is spec leading a narrow slice of implementation forward together in the same task (the ADR and this directory), not spec catching up to pre-existing undocumented code, unlike Landing's own promotion. `02_projects.md` and `03_authentication.md` split out of `01_architecture.md` the same day, once [ADR-0025](../architecture/decisions/ADR-0025-account-authentication-and-one-directional-migration.md) gave each enough content to warrant its own document — mirroring how Analytics' `01_architecture.md` stays a summary once `02_event_model.md` etc. exist.

## Documents

| Doc | Purpose |
|---|---|
| [01_architecture.md](./01_architecture.md) | Cross-capability status summary only (Duplication Rule) — points to 02/03 below, and to Application Responsibilities for Search/Integrations |
| [02_projects.md](./02_projects.md) | Projects' dual-mode LocalStorage/Firestore access, one-directional migration policy, Firestore document shape |
| [03_authentication.md](./03_authentication.md) | Authentication's three narrow, non-general uses; account sign-up/sign-in validation policy; the anti-enumeration error classification |

## Ownership

Owned by the Platform API area per `sdd/rules/ownership.md`. Must not restate any fact AI ([`sdd/ai/`](../ai/01_architecture.md)) or Analytics ([`sdd/analytics/`](../analytics/01_architecture.md)) already owns — this directory only covers what neither of those already covers (Projects, Authentication, and the not-yet-implemented Search/Integrations).
