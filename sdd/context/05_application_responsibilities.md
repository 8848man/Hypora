# Application Responsibilities

**Refs:** → [00_index](../00_index.md) · [Product Vision](./01_product_vision.md) · [Information Architecture](./04_information_architecture.md) · [Future Expansion Strategy](./06_future_expansion_strategy.md) · [Workspace Architecture](../workspace/01_architecture.md) · [ADR-0001](../architecture/decisions/ADR-0001-one-product-multiple-applications.md)

## Product Architecture

Hypora is **one Product** composed of **multiple Applications**. *(Explicit.)* Landing, Workspace, and Platform API are never modeled or specified as independent products — each is a facet of the same product, and no Application's specification may duplicate a concept another Application already owns. See [ADR-0001](../architecture/decisions/ADR-0001-one-product-multiple-applications.md) for why this structure was chosen over treating them as separate products.

```
Product: Hypora
├── Landing        — marketing website
├── Workspace       — the MVP: the actual web application
└── Platform API    — backend platform (V1: LocalStorage; future: real backend)
```

Per `10_bootstrap_guide.md` Step 3, a dedicated `sdd/<application>/` implementation-layer directory is created once that Application has real code. Landing and Workspace each have their own directory as of 2026-07-17; Platform API does not yet (no real backend exists — V1 uses LocalStorage). Each Application's responsibilities and V1 functional scope are recorded here, once, owned by the Product/Context area, until a dedicated directory becomes warranted — see [Landing Architecture](../landing/01_architecture.md) and [Workspace Architecture](../workspace/01_architecture.md) for the two that have been.

## Landing

**Purpose:** Marketing website. *(Explicit.)*

**Responsible for:** *(Explicit, as revised)*
- Product introduction
- Core value proposition
- Feature showcase
- Future AI vision
- Call-to-action

**"Roadmap" was removed from this list** — Landing no longer presents a product roadmap in any form (no dedicated route, no version/stage table within Home); see [Landing Information Architecture](../landing/02_information_architecture.md#route-model) for the removal and [Vision Section Specification](../landing/02_information_architecture.md#vision-section-specification) for what now occupies that narrative role instead. "Future AI vision" (already listed) is the responsibility Landing's Vision section now actually realizes.

**Hard boundary:** Landing never contains workspace logic. *(Explicit.)* It has no concept of a "project," no persistence, and makes no calls to Platform API beyond what a static marketing site needs.

**V1 Functional Scope:** now canonically owned by [Landing Architecture](../landing/01_architecture.md) and [Landing Information Architecture](../landing/02_information_architecture.md) — Landing has its own dedicated specification directory as of 2026-07-17; this document no longer restates its section/route inventory or component model. In summary only: Landing's Home is a single-page narrative (not a flat feature list); Features remains a separate, directly-linkable deep page; the call-to-action still links into the Workspace's entry point only, never embedding or previewing any Workspace screen in detail.

## Workspace

**Purpose:** The actual web application. *(Explicit.)*

**Responsible for:** *(Explicit)*
- Project management
- Business Canvas
- Feature Planning
- Validation planning
- Project summary

**This is the primary MVP.** *(Explicit.)*

**V1 Functional Scope:** now canonically owned by [Workspace Architecture](../workspace/01_architecture.md) and [Workspace Data & State](../workspace/02_data_and_state.md) — Workspace has its own dedicated specification directory as of this pass; this document no longer restates its screen inventory, feature inventory, or data model. In summary only: Workspace persists all Project data via Platform API's V1 implementation (LocalStorage); it does not implement its own separate persistence mechanism.

## Platform API

**Purpose:** Backend platform. *(Explicit.)*

**Current MVP implementation (V1):** Workspace's own project data (Canvas/MVP Scope/Feature Planning/Validation Checklist) still persists entirely via LocalStorage. *(Explicit.)* The AI Platform capability (row below) is the one exception — it is backed by a real deployed service (Vercel serverless functions, bundled into the same single Vercel project per [Deployment Strategy](../infra/01_deployment.md), not a separate Platform API deployment), not LocalStorage. Platform API otherwise remains scoped to persisting and retrieving project data structured per the shape Workspace defines.

**Platform capabilities** *(Explicit — named as examples in the brief; detail on how each becomes real is in [Future Expansion Strategy](./06_future_expansion_strategy.md)):*

| Capability | V1 status | Future role |
|---|---|---|
| Authentication | Not implemented (general, multi-user) | Required once Workspace moves beyond single-browser, single-user persistence — a narrow, admin-only Firebase Authentication gate exists for the internal Analytics Dashboard only ([ADR-0015](../architecture/decisions/ADR-0015-analytics-dashboard-access-boundary.md)), explicitly not a substitute for or acceleration of this general capability |
| Projects | Implemented via LocalStorage | Same conceptual API surface, backed by a real service instead of the browser |
| AI | **Implemented** — 5 capabilities live (Canvas Assistant, Risk Memo Assistant, MVP Planning Assistant, Validation Planning Assistant, Feature Suggestion Assistant), per [AI Platform Architecture](../ai/01_architecture.md) and [Capability Index](../ai/capabilities/000_index.md) | V2 (AI Canvas Assistant) through V5 (AI Product Builder); the roadmap-stage framing continues to apply to which *Workspace Feature* consumes AI, not whether the AI Platform itself exists |
| Search | Not implemented | Backs V3 (Market Intelligence) discovery features |
| Integrations | Not implemented | Backs future external data sources (market data, competitor data) |
| Analytics | **Implemented** — event tracking write path and an internal Analytics Dashboard read path, per [Analytics Architecture](../analytics/01_architecture.md) | Product event tracking, cross-cutting across every Feature and AI Capability, per [ADR-0013](../architecture/decisions/ADR-0013-analytics-provider-independence.md); see `sdd/analytics/` for its own architecture, independent of AI and Search |

**Distinguishing current vs. future is mandatory for every fact recorded about Platform API** — a capability listed above as "Not implemented" must never be described elsewhere as if it already exists in V1.

AI and Analytics are each a confirmed **Platform Service** — a named cross-cutting architectural role, not a redefinition of either row above; see [Platform Services](../architecture/01_platform_services.md) for the shared definition and [ADR-0014](../architecture/decisions/ADR-0014-platform-services-architectural-role.md) for why it exists.

## Cross-Application Boundaries

| From | To | Rule |
|---|---|---|
| Landing | Workspace | One-directional link only (call-to-action); no shared state, no embedded screens |
| Workspace | Platform API | Workspace consumes Platform API's contract; Workspace does not reimplement persistence itself |
| Platform API | Workspace / Landing | Platform API has no knowledge of UI/navigation; it exposes data operations only |

No Application may restate another's responsibilities table above — every other document in this tree references this one rather than redefining "what Landing/Workspace/Platform API is for."
