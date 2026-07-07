# Product Scope, Constraints, and Risk

**Refs:** → [00_index](../00_index.md) · [Product Vision](./01_product_vision.md) · [Application Responsibilities](./05_application_responsibilities.md)

## Product Scope (V1)

*(Explicit where listed in the brief; grouped here for scope clarity.)*

In scope for V1:

- A manual workspace where a user structures one or more business ideas into: Business Idea, Problem, Target Customer, Solution, Value Proposition, MVP Scope, Feature Planning, Validation Checklist.
- A marketing Landing application that introduces the product, explains the value proposition, showcases features, and presents the roadmap and future AI vision.
- Project-level organization: a user can hold multiple projects, each independently structured.
- Local persistence (LocalStorage) standing in for a backend in V1. *(Explicit.)*

Out of scope for V1 (deferred to later stages — see [Future Expansion Strategy](./06_future_expansion_strategy.md)):

- Any AI-generated content, suggestion, or assistance (V2+).
- Market/competitor research or trend discovery (V3).
- Go-to-market recommendation or experiment suggestion (V4).
- Requirement/SDD/development-plan generation (V5).
- A real backend, multi-user accounts, or authentication. *(Inferred — V1 explicitly uses LocalStorage instead of a real backend, which implies no server-side auth/session model yet; the brief doesn't rule out a future backend, but nothing in V1 requires one.)*

## Non-Goals

*(Inferred — necessary to prevent V1 scope creep, drawn from what the brief explicitly excludes or defers.)*

- Hypora V1 is **not** an AI product. It must be fully usable and valuable with zero AI involvement.
- Hypora is **not** three separate products. Landing, Workspace, and Platform API are Applications of one Product — never modeled or pitched as independent products (see [Application Responsibilities](./05_application_responsibilities.md)).
- Hypora V1 is **not** a project-management or task-tracking tool. Feature Planning in V1 structures *what* to build, not sprints, tickets, or assignees.
- Hypora V1 does **not** attempt real market research, competitor discovery, or GTM advice — those are explicitly staged for V3/V4.

## Product Constraints

*(Explicit where noted; otherwise Inferred from the "manual MVP, no AI, no backend" framing.)*

| Constraint | Source |
|---|---|
| V1 must not depend on AI or backend intelligence | Explicit |
| V1 uses LocalStorage in place of a real backend | Explicit |
| V1's structure must accommodate future AI integration without major redesign | Explicit |
| Landing must never contain workspace logic | Explicit |
| Product Architecture must remain one Product with multiple Applications — never modeled as independent products | Explicit |
| Every concept must have exactly one canonical specification owner | Explicit (SDD Framework governance rule, applied to this product) |

## MVP Success Criteria

*(Inferred — the brief states the MVP's purpose ("transform business ideas into structured, validated MVP plans") but not measurable success criteria; these operationalize that purpose.)*

- A user can take a raw idea and produce a complete Canvas (all eight V1 structuring sections filled) without leaving the Workspace.
- A user can distinguish, within one project, what is validated (Validation Checklist items marked complete) from what is still assumption.
- A visitor to Landing can understand what Hypora does and why, without needing to open the Workspace.
- The V1 data structure requires no breaking migration when V2 (AI Canvas Assistant) is introduced — verified by design review before V1 ships, not by a real V2 migration (V2 doesn't exist yet).

## Success Metrics

*(Inferred — the brief gives Hypora's purpose ("transform business ideas into structured, validated MVP plans") but no metrics; these operationalize that purpose as measurable outcomes, extending the qualitative [MVP Success Criteria](#mvp-success-criteria) above with a quantitative North Star and supporting set. Chosen deliberately to measure *outcomes a user achieved*, not *activity a user performed* — a login count or session length would be trivially gameable by a confused user clicking around, and would not indicate the product actually did its job.)*

**North Star Metric: Validated MVP Plans Completed** — the count of projects that reach a fully validated state (all five Canvas fields authored, MVP Scope defined, Feature Planning done, and every Validation Checklist item explicitly marked validated or resolved). This is the one number that most directly reflects Hypora's stated purpose: not "ideas started," but "ideas actually taken through to a structured, validated plan." A project that stalls at a half-filled Canvas has not yet delivered the product's core value, however much time was spent in the app.

**Supporting Metrics:**

| Metric | What it measures | Why it's a supporting signal, not the North Star |
|---|---|---|
| Canvas completion rate (% of started projects with all 5 Canvas fields filled) | Whether users get through the *structuring* half of the journey | Necessary but not sufficient — a completed Canvas without a validated checklist is still an unvalidated plan |
| Validation Checklist completion rate (validated items ÷ total items, per project) | Whether validation is actually happening, not just present as a UI section | Directly tied to the "validation as a first-class step" [Product Principle](./01_product_vision.md#product-principles) |
| MVP Scope → Feature Planning conversion rate | Whether users carry a defined scope forward into concrete features, or abandon after scoping | Signals whether the Scope → Planning step of the [Core User Journey](./03_personas_and_journey.md) is actually working end-to-end |
| Projects reopened after Project Summary review | Whether users revisit and refine rather than treating the Summary as a dead end | A proxy for genuine iterative use vs. one-shot, throwaway use |

**Explicitly excluded as metrics:** raw signups, login frequency, session count/duration, or page views. These measure activity, not whether an idea was actually transformed into a structured, validated plan — the stated purpose of the product — and are excluded on that basis, not merely because they're easy to game.

## Assumptions

*(Inferred — reasonable defaults needed to make the spec concrete; flagged here rather than silently baked into other documents, per [Open Questions](#open-questions) below for the ones genuinely unresolved.)*

- A single user owns a project in V1; no collaboration/sharing model is assumed yet.
- LocalStorage persistence is scoped per-browser; a user does not expect their projects to follow them across devices in V1.
- "Validated" in V1 means "the user has manually marked a checklist item as validated" — not automated or third-party-verified validation.

## Risks

*(Inferred — standard risks for this kind of MVP, grounded in the stated constraints.)*

| Risk | Why it matters | Mitigation direction |
|---|---|---|
| LocalStorage data loss (cleared cache, different browser/device) | Users lose their only copy of a project with no backend | Flagged as a known V1 limitation; a real Platform API backend is the long-term mitigation (see [Application Responsibilities](./05_application_responsibilities.md)) |
| V1 data model designed too narrowly, forcing a breaking change at V2 | Directly contradicts the "future-ready architecture" constraint | Design the Canvas data shape with explicit extension points reviewed against the V2–V5 roadmap before V1 ships |
| Landing and Workspace scope blur over time (Landing accreting workspace logic) | Violates the explicit Landing/Workspace separation | Ownership map (`sdd/rules/ownership.md`) enforces the boundary; any Landing change proposing interactive project logic requires an ADR |
| Manual-only V1 fails to demonstrate enough value to justify V2+ investment | Product risk beyond the specification's scope to resolve | Out of scope for this document — a business/product decision, not a spec gap |

## Open Questions

*(Genuinely unresolved — flagged rather than guessed at, per the framework's "stop for human" discipline.)*

- Should V1 support multiple projects per user from day one, or start with a single project and add multi-project support later?
- What is the minimum viable shape of the "Validation Checklist" — a fixed template, or user-authored freeform items?
- Does V1 need any export/print capability (e.g., a shareable summary of a completed Canvas), or is in-app viewing sufficient for the MVP?
- At what point does Platform API move from "LocalStorage today, backend later" to an actual backend build — is this a V2-adjacent decision or independent of the AI roadmap?
