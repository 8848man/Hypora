# Product Vision

**Refs:** → [00_index](../00_index.md) · [Product Scope](./02_product_scope.md) · [Application Responsibilities](./05_application_responsibilities.md) · [Future Expansion Strategy](./06_future_expansion_strategy.md)

## Product Vision

**Hypora** is a web-based workspace that helps users transform business ideas into structured, validated MVP plans. *(Explicit — stated directly in the product brief.)*

The long-term vision is an **AI Co-founder platform**: a system that doesn't just hold a user's plan, but actively helps generate, validate, and refine it. *(Explicit.)* The product begins, however, as a **manual MVP with no dependency on AI or backend intelligence** — V1 must stand on its own as a useful tool even though no AI capability exists yet. *(Explicit.)*

**Design commitment:** the V1 MVP is structured so that future AI capabilities can be layered in without a major redesign. *(Explicit.)* Concretely, this means V1's data model and screen structure anticipate — without implementing — the fields, categories, and touchpoints that later stages will populate with AI-generated content (see [Future Expansion Strategy](./06_future_expansion_strategy.md)).

## Product Positioning

*(Inferred — the brief states Hypora's Vision and V1 feature list explicitly, but not a market-positioning statement; this section derives one from the Vision, V1 Scope, and Non-Goals already established, so that every future specification is written against a stable notion of what Hypora is competing to be, not just what it contains.)*

**What Hypora is:** a purpose-built workspace for turning one business idea at a time into a structured, validated MVP plan — and, over time, an AI collaborator that participates in that structuring rather than a passive document store.

**What Hypora is not:**
- Not a generic note-taking tool (e.g., Notion, Evernote). Those capture unstructured thought; Hypora enforces a specific structure (Business Idea → Problem → Target Customer → Solution → Value Proposition → MVP Scope → Feature Planning → Validation) because the structure itself is the product's value, not an optional template.
- Not a project-management or ticketing tool (e.g., Jira, Trello, Asana). Those manage execution once scope is already decided; Hypora deliberately stops before execution — see [Non-Goals](./02_product_scope.md#non-goals).
- Not a one-click AI business-plan generator. V1 has zero AI involvement by design, and even at V5 the roadmap frames AI as *assisting* structuring and execution planning, not replacing the founder's judgment (see [Product Principles](#product-principles) below).

**Primary problem solved:** a raw business idea has no dedicated home between "an unstructured note" and "a fully scoped execution plan." Generic note-taking tools don't force structure; generic PM tools assume the scope decision has already been made. Hypora exists specifically for the gap in between — structuring and validating an idea *before* it becomes a build plan.

**Why users choose Hypora instead of generic tools:**
- The structure (Canvas → MVP Scope → Feature Planning → Validation Checklist) is built into the product, not something the user has to invent with a blank note or a generic board.
- Validation is a first-class, structural part of every project — not a side note a user has to remember to add.
- The tool's scope is deliberately narrow (pre-build clarity), so it doesn't compete with — or get bloated by — full execution-management features a founder doesn't need yet.

**Core value proposition:** turn a vague idea into a scoped, validated MVP plan, in one purpose-built workspace, without needing a business background or a patchwork of separate tools. The workspace is experienced as answering meaningful questions, not filling out framework-labeled forms — see [ADR-0012](../architecture/decisions/ADR-0012-guided-question-flow-as-standard-interaction-pattern.md).

**Long-term product identity:** an AI Co-founder that starts (V1) as a manual structuring tool and grows (V2–V5) into an active collaborator across canvas assistance, market intelligence, go-to-market planning, and product execution guidance — see [Product Roadmap](#product-roadmap).

## Product Goals

*(Inferred — derived from the stated vision and MVP framing; not verbatim in the brief, but necessary to make "MVP" and "validated" operational.)*

| Goal | What it means for V1 |
|---|---|
| Give a founder a single place to structure a raw idea | Business Idea, Problem, Target Customer, Solution, Value Proposition captured in one workspace, not scattered across documents |
| Force scope discipline before building | MVP Scope and Feature Planning exist as explicit steps, separate from the idea itself |
| Make validation a first-class step, not an afterthought | A Validation Checklist is a structural part of every project, not a side note |
| Be honest about what's manual today vs. AI-assisted later | Every V1 screen and data shape is written to survive AI augmentation later without breaking existing user data |

## Product Principles

*(Inferred — the brief never states these as a named list, but each principle is a direct consequence of an already-Explicit fact: the "manual MVP, no AI" constraint, the "AI Co-founder" long-term vision, and the fixed Canvas → Scope → Feature Planning → Validation structure. Stated explicitly here so every future feature — V1 through V5 — can be checked against a stable, enduring bar rather than re-deriving it each time.)*

Every future feature, in every stage of the roadmap, must respect:

| Principle | What it rules out |
|---|---|
| **Structured thinking over freeform capture** | A feature that turns any Canvas/Scope/Planning/Validation field back into an unstructured blob (that would make Hypora indistinguishable from generic note-taking — see [Product Positioning](#product-positioning)) |
| **Validation before implementation** | A feature that lets a user jump to Feature Planning or execution guidance without the Validation Checklist existing as a first-class, structurally required step |
| **AI augmentation, not replacement** | Any V2–V5 AI feature that auto-fills or auto-decides without the user's explicit review; AI may suggest, the user always retains final authorship of their plan |
| **Progressive disclosure** | Surfacing all eight V1 sections, or any future stage's full capability, at once, rather than guiding the user through one meaningful step at a time |
| **Simplicity — narrow scope over feature breadth** | Any feature that turns Hypora into a general-purpose PM/ticketing tool, per the Non-Goals in [Product Scope](./02_product_scope.md) |
| **Localization is product quality, not an optional layer** | Any feature shipped with only one language's resources complete — see Localization Principle below |
| **Thinking before documents** | Any Feature designed to present an empty structured form, or its framework's name, as the first thing a user encounters — per [ADR-0012](../architecture/decisions/ADR-0012-guided-question-flow-as-standard-interaction-pattern.md), guided thinking is the preferred entry; the structured artifact it produces remains a fully editable, equally permanent surface, never a replacement for it. Guided questions may cross Feature boundaries in service of better thinking, but every answer is still written to its one canonical owner (see ADR-0012). |
| **Internal identity is not required UX vocabulary** | Any requirement that a user understand or see a Feature's internal name (Business Structuring, Risk Memo, Validation Planning) before making progress — Feature identity is an architecture concept; users experience questions and progressively revealed structure, not a map of internal Features (see [ADR-0012](../architecture/decisions/ADR-0012-guided-question-flow-as-standard-interaction-pattern.md)) |
| **One consistent AI interaction, regardless of Feature** | Any Feature inventing its own AI interaction shape — every AI-assistable field exposes the identical `Ask AI → Suggestion → Accept / Reject / Regenerate` interaction, per [04_ai_interaction.md](../ai/04_ai_interaction.md)'s Interaction Lifecycle; only which field, prompt, and context differ per Capability, never the interaction shape itself |

These principles do not change across V1–V5 — a stage may add *capability* (e.g., AI suggestions in V2), but never in a way that violates a principle above (e.g., V2's AI Canvas Assistant may suggest a Value Proposition rewrite, but must never silently overwrite the user's own entry).

### Localization Principle

*(Explicit — this task's product decision, recorded here as it's an enduring product principle, not a one-time V1 scope item.)*

- **Hypora is Korean-first.** Korean (`ko`) is the canonical language for all product content — every piece of product copy is authored in Korean first, as the source of truth.
- **English (`en`) is an official supported localization**, not a lesser or informal translation — English resources must preserve the original Korean meaning, not merely approximate it.
- **New features must include both Korean and English resources before release** — a feature shipped with only one language's copy complete is not release-ready, per the [Localization Readiness Gate](../analysis/01_v1_release_specification.md#localization-readiness-gate).
- **The architecture must accommodate additional languages beyond Korean and English in the future without structural changes** — this is an architectural requirement flowing from the principle, detailed in [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md) and its affected specs (Workspace Architecture, Question Model, Frontend Architecture, Design System).
- **Scope note:** this principle governs *product-facing copy* (what a user sees in Landing and Workspace) — it does not require this specification tree itself to be authored in Korean. The `sdd/` documents remain in English, per this project's established documentation language; see [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md) for this distinction stated explicitly.

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
