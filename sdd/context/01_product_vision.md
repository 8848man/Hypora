# Product Vision

**Refs:** → [00_index](../00_index.md) · [Product Scope](./02_product_scope.md) · [Application Responsibilities](./05_application_responsibilities.md) · [Future Expansion Strategy](./06_future_expansion_strategy.md)

## Product Vision

**Hypora** is a web-based workspace that helps users transform business ideas into structured, validated MVP plans. *(Explicit — stated directly in the product brief.)*

The long-term vision is an **AI Co-founder platform**: a system that doesn't just hold a user's plan, but actively helps generate, validate, and refine it. *(Explicit.)* The product begins, however, as a **manual MVP with no dependency on AI or backend intelligence** — V1 must stand on its own as a useful tool even though no AI capability exists yet. *(Explicit.)*

**Design commitment:** the V1 MVP is structured so that future AI capabilities can be layered in without a major redesign. *(Explicit.)* Concretely, this means V1's data model and screen structure anticipate — without implementing — the fields, categories, and touchpoints that later stages will populate with AI-generated content (see [Future Expansion Strategy](./06_future_expansion_strategy.md)).

## Product Goals

*(Inferred — derived from the stated vision and MVP framing; not verbatim in the brief, but necessary to make "MVP" and "validated" operational.)*

| Goal | What it means for V1 |
|---|---|
| Give a founder a single place to structure a raw idea | Business Idea, Problem, Target Customer, Solution, Value Proposition captured in one workspace, not scattered across documents |
| Force scope discipline before building | MVP Scope and Feature Planning exist as explicit steps, separate from the idea itself |
| Make validation a first-class step, not an afterthought | A Validation Checklist is a structural part of every project, not a side note |
| Be honest about what's manual today vs. AI-assisted later | Every V1 screen and data shape is written to survive AI augmentation later without breaking existing user data |

## Product Roadmap

*(Explicit — stages and order given directly in the product brief; the content within each stage beyond V1 is Hypora's stated direction, not yet specified in detail.)*

| Stage | Name | Adds |
|---|---|---|
| **V1** | Manual Workspace | Business Idea, Problem, Target Customer, Solution, Value Proposition, MVP Scope, Feature Planning, Validation Checklist — all user-authored, no AI |
| **V2** | AI Canvas Assistant | AI assistance directly inside the Canvas (the V1 structuring screens) |
| **V3** | Market Intelligence | Similar service discovery, competitor research, market trends |
| **V4** | Go-to-Market Planning | Marketing channel recommendations, validation experiment suggestions, early customer strategy |
| **V5** | AI Product Builder | Requirement generation, SDD generation, development planning, AI-assisted product execution |

Each stage builds on the data and structure established by the previous one — see [Future Expansion Strategy](./06_future_expansion_strategy.md) for how V1's architecture stays compatible with V2–V5 without redesign, and [Application Responsibilities](./05_application_responsibilities.md) for which Application each stage's capability belongs to.

**This document owns the roadmap's stage order and top-line content.** No other document restates the stage-by-stage table — [Future Expansion Strategy](./06_future_expansion_strategy.md) references it and elaborates *how* the architecture accommodates it, and the [Landing](./05_application_responsibilities.md) application references it for marketing copy rather than redefining it.
