# User Personas and Core User Journey

**Refs:** → [00_index](../00_index.md) · [Product Scope](./02_product_scope.md) · [Information Architecture](./04_information_architecture.md)

*(Inferred — the brief does not name personas or walk through a journey explicitly; both are derived from the stated purpose ("transform business ideas into structured, validated MVP plans") and the V1 feature list, since a workspace product cannot be specified without them.)*

## User Personas

*(Inferred — the three personas themselves were already inferred in the initial discovery pass; this refinement categorizes them into Primary, Secondary, and Future tiers, with the reasoning for each tier made explicit, so downstream feature specifications know whose needs to prioritize first.)*

### Primary Persona — Solo Founder

| Aspect | Detail |
|---|---|
| Goals | Turn a vague business idea into a structured, validated MVP plan without outside help |
| Motivations | Wants to move from "an idea in my head" to "something I can act on" with confidence it's been thought through |
| Frustrations | Generic note-taking tools give no structure; generic PM tools assume the scope decision is already made — neither helps at the "is this idea even worth building" stage |
| Expected outcomes | A complete Canvas, a defined MVP Scope, and a Validation Checklist that tells them, honestly, what's still assumption vs. confirmed |

**Why Primary:** this persona's need maps one-to-one onto Hypora's core value proposition (see [Product Positioning](./01_product_vision.md#product-positioning)) with no adaptation required — no co-founder, no team, no cross-project comparison. V1's entire feature set (Canvas → MVP Scope → Feature Planning → Validation Checklist) is sufficient, on its own, to fully serve this persona today.

### Secondary Persona — Early-Stage Team Lead

| Aspect | Detail |
|---|---|
| Goals | Get a small team aligned on what to build first, before anyone starts ticketing work |
| Motivations | Wants one authoritative reference document the team can point back to, rather than scattered chat threads and assumptions |
| Frustrations | Without a shared structure, "what are we actually building" gets re-litigated informally, mid-build |
| Expected outcomes | A Canvas and Feature Planning output the team treats as the source of truth before work is broken into tickets elsewhere (e.g., in a separate PM tool) |

**Why Secondary, not Primary:** V1 has no multi-user or collaboration features (per the V1 [Non-Goals](./02_product_scope.md#non-goals)) — this persona is still a single individual using Hypora alone, then sharing the *output* with a team outside the product. The need is real and served by V1 today, but the persona's full "team alignment" motivation is only partially realized until a genuine sharing/collaboration capability exists, which is not on the V1–V5 roadmap as currently scoped.

### Future Persona — Idea Explorer

| Aspect | Detail |
|---|---|
| Goals | Compare multiple business ideas side by side before committing to one |
| Motivations | Wants to avoid sunk-cost commitment to the first idea structured, by seeing several ideas' scope and validation status at a glance |
| Frustrations | Holding several projects with no way to compare them makes "which idea is actually most validated" a manual, error-prone exercise |
| Expected outcomes | A comparison view across projects' Validation Checklist completion and MVP Scope maturity — not just a list of project names |

**Why Future, not Secondary:** V1 already supports holding multiple independent projects (per [Product Scope](./02_product_scope.md)), so this persona's *basic* need is met today. But the defining need — comparing projects' scope and validation status against each other — requires a cross-project comparison capability that is not part of V1's Information Architecture (see [Information Architecture](./04_information_architecture.md)); Project List is a list, not a comparison view. This persona becomes fully served once such a capability is deliberately scoped, which has not yet happened.

All three personas are individual users in V1 — none require multi-user collaboration features, consistent with the V1 non-goals in [Product Scope](./02_product_scope.md).

## Core User Journey (V1)

```
1. Arrive at Landing
        → understand what Hypora does, see the value proposition and roadmap
        ↓
2. Enter the Workspace, create a project
        ↓
3. Structure the idea across the Canvas
        → Business Idea → Problem → Target Customer → Solution → Value Proposition
        ↓
4. Define MVP Scope
        → decide what's in vs. out for a first version
        ↓
5. Feature Planning
        → break the MVP Scope into concrete features
        ↓
6. Validation Checklist
        → mark assumptions as validated or still-open, against the plan just built
        ↓
7. Review the Project Summary
        → see the whole structured plan in one place
```

Steps 3–6 are not strictly linear in the UI (a user may revisit Problem after starting Feature Planning), but they represent the intended completion order for a first pass through a new project — see [Information Architecture](./04_information_architecture.md) for how this maps to actual screens and navigation.

**This document owns persona definitions and the journey sequence.** [Information Architecture](./04_information_architecture.md) references this journey when defining navigation; it does not redefine the journey steps independently.
