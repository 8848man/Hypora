# Application Responsibilities

**Refs:** → [00_index](../00_index.md) · [Product Vision](./01_product_vision.md) · [Information Architecture](./04_information_architecture.md) · [Future Expansion Strategy](./06_future_expansion_strategy.md) · [ADR-0001](../architecture/decisions/ADR-0001-one-product-multiple-applications.md)

## Product Architecture

Hypora is **one Product** composed of **multiple Applications**. *(Explicit.)* Landing, Workspace, and Platform API are never modeled or specified as independent products — each is a facet of the same product, and no Application's specification may duplicate a concept another Application already owns. See [ADR-0001](../architecture/decisions/ADR-0001-one-product-multiple-applications.md) for why this structure was chosen over treating them as separate products.

```
Product: Hypora
├── Landing        — marketing website
├── Workspace       — the MVP: the actual web application
└── Platform API    — backend platform (V1: LocalStorage; future: real backend)
```

Per `10_bootstrap_guide.md` Step 3, no `sdd/<application>/` implementation-layer directory is created for any of the three yet — none has real code. Each Application's responsibilities and V1 functional scope are recorded here, once, owned by the Product/Context area, until a dedicated directory becomes warranted.

## Landing

**Purpose:** Marketing website. *(Explicit.)*

**Responsible for:** *(Explicit)*
- Product introduction
- Core value proposition
- Feature showcase
- Roadmap
- Future AI vision
- Call-to-action

**Hard boundary:** Landing never contains workspace logic. *(Explicit.)* It has no concept of a "project," no persistence, and makes no calls to Platform API beyond what a static marketing site needs.

**V1 Functional Scope:**
- Static/near-static pages: Home, Features, Roadmap, Call-to-Action (see [Information Architecture](./04_information_architecture.md)).
- Roadmap content reproduces the stage table from [Product Vision](./01_product_vision.md) by reference — Landing does not maintain its own independent copy of roadmap wording.
- Call-to-action links into the Workspace application; Landing does not embed any Workspace screen.

## Workspace

**Purpose:** The actual web application. *(Explicit.)*

**Responsible for:** *(Explicit)*
- Project management
- Business Canvas
- Feature Planning
- Validation planning
- Project summary

**This is the primary MVP.** *(Explicit.)*

**V1 Functional Scope:**
- Create, list, and select projects (Project Management).
- Author the five Business Canvas fields per project: Business Idea, Problem, Target Customer, Solution, Value Proposition.
- Define MVP Scope and Feature Planning for the project.
- Maintain a Validation Checklist per project.
- View a Project Summary aggregating the above.
- Persist all of the above via Platform API's V1 implementation (LocalStorage) — Workspace does not implement its own separate persistence mechanism; it consumes Platform API's contract (see below).

## Platform API

**Purpose:** Backend platform. *(Explicit.)*

**Current MVP implementation (V1):** LocalStorage stands in for a real backend. *(Explicit.)* Workspace reads/writes project data through this layer; Platform API's V1 responsibility is scoped entirely to persisting and retrieving project data structured per the Canvas/MVP Scope/Feature Planning/Validation Checklist shape Workspace defines.

**Future platform capabilities** *(Explicit — named as examples in the brief; detail on how each becomes real is in [Future Expansion Strategy](./06_future_expansion_strategy.md))*:

| Capability | V1 status | Future role |
|---|---|---|
| Authentication | Not implemented | Required once Workspace moves beyond single-browser, single-user persistence |
| Projects | Implemented via LocalStorage | Same conceptual API surface, backed by a real service instead of the browser |
| AI | Not implemented | Backs V2 (AI Canvas Assistant) through V5 (AI Product Builder) |
| Search | Not implemented | Backs V3 (Market Intelligence) discovery features |
| Integrations | Not implemented | Backs future external data sources (market data, competitor data) |

**Distinguishing current vs. future is mandatory for every fact recorded about Platform API** — a capability listed above as "Not implemented" must never be described elsewhere as if it already exists in V1.

## Cross-Application Boundaries

| From | To | Rule |
|---|---|---|
| Landing | Workspace | One-directional link only (call-to-action); no shared state, no embedded screens |
| Workspace | Platform API | Workspace consumes Platform API's contract; Workspace does not reimplement persistence itself |
| Platform API | Workspace / Landing | Platform API has no knowledge of UI/navigation; it exposes data operations only |

No Application may restate another's responsibilities table above — every other document in this tree references this one rather than redefining "what Landing/Workspace/Platform API is for."
