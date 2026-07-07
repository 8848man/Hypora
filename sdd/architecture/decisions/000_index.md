# Architecture Decision Record Index

**Refs:** → [00_index](../../00_index.md) · [Application Responsibilities](../../context/05_application_responsibilities.md)

| ID | Title | Status | Date | Summary |
|---|---|---|---|---|
| [ADR-0001](./ADR-0001-one-product-multiple-applications.md) | One Product, Multiple Applications | Accepted | 2026-07-07 | Hypora is structured as one Product (Landing, Workspace, Platform API as Applications), never as three independent products |
| [ADR-0002](./ADR-0002-business-idea-lifecycle-domain-model.md) | Introduce a Canonical Business Idea Lifecycle as the Domain Model | Accepted | 2026-07-07 | A seven-state Project lifecycle (Captured → Structuring → Scoped → Validating → Validated → Build-Ready → Archived) is the single authoritative source for a project's structuring/validation progress |
| [ADR-0003](./ADR-0003-single-v1-deployment-target.md) | Single V1 Deployment Target — Landing + Workspace Bundled, Platform API Excluded | Accepted | 2026-07-07 | Hypora V1 deploys as one Vercel project containing Landing and Workspace; Platform API is not deployed in V1 |
