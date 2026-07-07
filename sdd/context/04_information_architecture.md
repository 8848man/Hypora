# Information Architecture and Navigation Model (Product-Level)

**Refs:** → [00_index](../00_index.md) · [Core User Journey](./03_personas_and_journey.md) · [Application Responsibilities](./05_application_responsibilities.md) · [Workspace Architecture](../workspace/01_architecture.md)

*(Inferred — structures the V1 feature list from the brief into a navigable information hierarchy; no screen list or nav model is given explicitly.)*

**Relocation note:** Workspace's own screen inventory, internal navigation, and Workspace Mental Model Review moved to [`workspace/01_architecture.md`](../workspace/01_architecture.md) — now that Workspace has its own dedicated specification, its information architecture is canonically owned there, not here (per the SDD Framework's relocation pattern: this is a move, not a supersession — nothing below was wrong, it simply now has a more specific home). This document retains the product-level tree (both Applications, for orientation) and Landing's own screens, which remain genuinely product/context-level since Landing has no dedicated specification directory yet.

## Information Architecture (Product Level)

```
Hypora (Product)
│
├── Landing (Application — public, unauthenticated)
│   ├── Home                — value proposition, core pitch
│   ├── Features             — feature showcase
│   ├── Roadmap               — V1–V5 stages, future AI vision
│   └── Call-to-Action        — entry point into the Workspace
│
└── Workspace (Application — the product itself)
    └── see [Workspace Architecture](../workspace/01_architecture.md) for the full screen inventory
```

Platform API is not a navigable surface — it is the backend responsibility layer described in [Application Responsibilities](./05_application_responsibilities.md), currently realized as LocalStorage calls made from within Workspace rather than a separate navigable Application.

## Navigation Model (Cross-Application)

| Level | Model |
|---|---|
| Landing ↔ Workspace | One-directional entry point: Landing's Call-to-Action leads into the Workspace. Workspace never links back into Landing's marketing pages as part of its own flow (a user could navigate there manually, but Workspace doesn't route through Landing). |

**Workspace-internal navigation** (Project List → Project → Canvas/Scope/Planning/Checklist/Summary, and the Canvas's internal field order) is owned by [Workspace Architecture](../workspace/01_architecture.md) — this document does not restate it.

**Ownership note:** this document owns Landing's screen inventory and the cross-Application navigation rule only. [Workspace Architecture](../workspace/01_architecture.md) owns Workspace's own screen inventory, internal navigation, and Workspace Mental Model Review. [Application Responsibilities](./05_application_responsibilities.md) owns *which Application* is responsible for each part of the product tree — this document does not restate those responsibility boundaries, only the navigable shape within them.
