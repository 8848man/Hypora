# Platform API — Specification Index

**Refs:** → [00_index](../00_index.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md)

## Provenance

Created 2026-08-07, promoted by [ADR-0024](../architecture/decisions/ADR-0024-project-data-durable-server-side-backup.md) — the trigger `sdd/00_index.md`'s "Not Yet Created" table named (a real backend capability beyond the AI capability, or Authentication/Search/Integrations becoming real) fired when Project data gained a Firestore backup and Firebase Anonymous Authentication became real. This is spec leading a narrow slice of implementation forward together in the same task (the ADR and this directory), not spec catching up to pre-existing undocumented code, unlike Landing's own promotion.

## Documents

| Doc | Purpose |
|---|---|
| [01_architecture.md](./01_architecture.md) | Current capability status across Projects/Authentication/Search/Integrations (AI and Analytics remain owned by their own directories, referenced not restated); Projects' backup shape; Authentication's two narrow, non-general uses |

## Ownership

Owned by the Platform API area per `sdd/rules/ownership.md`. Must not restate any fact AI ([`sdd/ai/`](../ai/01_architecture.md)) or Analytics ([`sdd/analytics/`](../analytics/01_architecture.md)) already owns — this directory only covers what neither of those already covers (Projects, Authentication, and the not-yet-implemented Search/Integrations).
