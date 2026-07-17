# Landing Design Principles

**Refs:** → [00_index](../../00_index.md) · [01_reference_analysis](./01_reference_analysis.md) · [02_hypora_current_analysis](./02_hypora_current_analysis.md) · [03_improvement_plan](./03_improvement_plan.md) · [Product Vision](../../context/01_product_vision.md) · [Product Scope](../../context/02_product_scope.md) · [Personas and Journey](../../context/03_personas_and_journey.md) · [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) · [ADR-0004](../../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md) · [ADR-0012](../../architecture/decisions/ADR-0012-guided-question-flow-as-standard-interaction-pattern.md)

## Role of This Document

This is the **canonical philosophy behind Hypora's Landing** — every section, narrative choice, and improvement proposed in this directory must trace back to a principle here, and every principle here must trace back to an existing Hypora specification, never to an external reference. [01_reference_analysis.md](./01_reference_analysis.md) (the Sentinel reference) is consulted only *after* this document, as supporting evidence for how a principle might be executed — never as the source of a principle itself. This document is read first by design: [02_hypora_current_analysis.md](./02_hypora_current_analysis.md) evaluates the current Landing against it, and [03_improvement_plan.md](./03_improvement_plan.md) proposes changes justified by it.

## Part 1 — Hypora's Product Philosophy

*(Every statement below is derived from an existing `sdd/context/`, `sdd/domain/`, or `sdd/architecture/decisions/` fact — cited inline. None is new product direction; this section only makes an already-decided philosophy explicit and named.)*

### What kind of product Hypora actually is

Hypora is a **structuring and validation instrument for one idea at a time** — not a document, not a board, not a conversation. Its entire V1 feature set exists to move an idea through a fixed, honest sequence of states (Captured → Structuring → Scoped → Validating → Validated → Build-Ready, per the [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)), and the product's value is *in that sequence itself*, not in any single screen. [Product Positioning](../../context/01_product_vision.md#product-positioning) states this directly: "the structure itself is the product's value, not an optional template."

### The problem it exists to solve

A raw idea has no dedicated home between "an unstructured note" and "a fully scoped execution plan" ([Product Positioning](../../context/01_product_vision.md#product-positioning)). Generic tools force a founder to invent structure themselves (note-taking) or assume the scope decision is already made (project management). Hypora exists specifically for the ungoverned middle: *structuring and validating an idea before it becomes a build plan.*

### The misconception people are likely to have

Because Hypora is built by a small team in the current wave of "AI-powered founder tools," the most likely first assumption a visitor makes is: **"this is a chatbot that writes my business plan for me."** This is the single most consequential misconception to correct, for two independent reasons:

1. It is factually wrong for V1 — [Product Scope](../../context/02_product_scope.md#non-goals) states plainly: "Hypora V1 is not an AI product. It must be fully usable and valuable with zero AI involvement."
2. It is philosophically wrong for every future stage too — [Product Principles](../../context/01_product_vision.md#product-principles)'s "AI augmentation, not replacement" rule means even V2–V5 AI never auto-decides; the founder always retains final authorship. A visitor who expects an AI to *decide* for them will be permanently mismatched with Hypora, at any roadmap stage.

A second, quieter misconception: that Hypora is a **blank canvas/template tool** (like a Lean Canvas or Business Model Canvas worksheet) that a founder fills in unassisted. [ADR-0004](../../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md) and [ADR-0012](../../architecture/decisions/ADR-0012-guided-question-flow-as-standard-interaction-pattern.md) exist specifically because that model was rejected: "founders think in questions, not framework vocabulary," and framework identity is deliberately hidden until a user reaches the structured, editable view (ADR-0012, Decisions 4 and 10) — the opposite of handing someone a labeled, blank multi-field form up front.

### What makes Hypora fundamentally different

| Compared to | The difference, and its source |
|---|---|
| **Note-taking tools** (Notion, Evernote) | Those capture unstructured thought; Hypora enforces one specific structure because the structure *is* the value, not a template the user could ignore. ([Product Positioning](../../context/01_product_vision.md#product-positioning)) |
| **Project-management tools** (Jira, Trello, Asana) | Those manage execution once scope is already decided; Hypora deliberately stops *before* execution — Feature Planning defines *what* to build, never sprints, tickets, or assignees. ([Non-Goals](../../context/02_product_scope.md#non-goals)) |
| **AI chat interfaces** (a general-purpose chatbot) | Hypora's guided entry was deliberately built as a structured, one-question-at-a-time flow with curated presets — explicitly *not* a chat-style conversational interface, rejected in [ADR-0004](../../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md) as implying an intelligence that (in V1) isn't there. Even once AI exists (V2+), the interaction stays a bounded `Ask AI → Suggestion → Accept/Reject/Regenerate` lifecycle ([Product Principles](../../context/01_product_vision.md#product-principles)) — never an open-ended conversation the founder has to steer. |
| **Business canvas templates** (Lean Canvas, Business Model Canvas worksheets) | Those hand a founder a fully-labeled blank grid on day one. Hypora hides framework identity until a user reaches the structured view, and structures the *authoring* itself as one guided question at a time rather than a form to fill in unassisted. ([ADR-0012](../../architecture/decisions/ADR-0012-guided-question-flow-as-standard-interaction-pattern.md), Decisions 4 and 10) |

### The mental model a visitor should leave with

*A vague idea becomes valuable by being structured and honestly validated — one guided question at a time, with the founder's own judgment always in charge, before anything gets built.*

### Hypora's Core Philosophy Statements

*(Named here so every downstream principle and proposal can cite one directly, in the style requested — each is a direct consequence of an already-Explicit or already-Inferred fact cited above, not a new claim.)*

1. **Structure is the product, not a byproduct of using it.**
2. **Thinking happens in questions, not blank forms — and not open-ended conversation either.**
3. **An idea isn't valuable until it's been structured and honestly validated; until then, it's a hope.**
4. **Judgment stays with the founder. Assistance — now none, later AI — only ever suggests.**
5. **Framework vocabulary is earned by using the product, never required to understand it.**
6. **Clarity comes before building, not during it.**

## Part 2 — Landing Design Principles

### Why This Landing Exists

Not to demonstrate feature completeness or to persuade through volume of proof — to let a visitor arrive at the same mental model Hypora's own domain model already encodes (Part 1's closing statement), *before* they are asked to commit to using it. If a visitor doesn't share that belief going in, opening a project reads as busywork instead of the product's actual value.

### What Visitors Should Understand Before They Leave

Whether or not they convert, a visitor should leave understanding:

- Hypora treats structuring as the whole point, not a form to get through.
- The tool works through one guided question at a time — not a chatbot, not a blank template.
- Validation is a required, later, distinct step from structuring, and it means the founder's own explicit judgment — not an automated or third-party check.
- The founder's judgment is always the final authority, in V1 and every future stage.
- Hypora deliberately stops before execution; it does not try to be where you manage the build.

### The Emotional Journey

| Beat | Visitor state | Grounded in |
|---|---|---|
| 1. Recognition | "I have an idea, and no idea where the structuring even starts." | [Primary Persona](../../context/03_personas_and_journey.md#primary-persona--solo-founder)'s stated frustration |
| 2. Relief | "I don't need to already know a framework, or write a document from nothing — I just answer one question." | [ADR-0012](../../architecture/decisions/ADR-0012-guided-question-flow-as-standard-interaction-pattern.md) Decisions 4/10 |
| 3. Ownership | "This plan is mine. Nothing was generated or decided for me." | [Product Principles](../../context/01_product_vision.md#product-principles) — AI augmentation, not replacement |
| 4. Honest confidence | "I can see exactly what's confirmed and what's still an assumption — no false completeness." | [Assumptions](../../context/02_product_scope.md#assumptions) — validation is user-marked, not automated |
| 5. Proportionate action | "Starting costs me nothing I'm not ready to give." | [Product Scope](../../context/02_product_scope.md#product-scope-v1) — LocalStorage only, no account/backend in V1 |

The journey ends in **proportionate, honest action** — never in urgency, scarcity, or a promise of business success the product cannot back.

### Misconceptions the Landing Must Correct

| Misconception | Correction, grounded in |
|---|---|
| "This is a note-taking app." | Structure is enforced, not optional — [Product Positioning](../../context/01_product_vision.md#product-positioning) |
| "This is a project-management tool." | Hypora stops before execution — [Non-Goals](../../context/02_product_scope.md#non-goals) |
| "This is an AI chatbot / AI business-plan generator." | Zero AI in V1; AI (later) only ever suggests — [Non-Goals](../../context/02_product_scope.md#non-goals), [Product Principles](../../context/01_product_vision.md#product-principles) |
| "This is a blank canvas template I fill out myself." | Guided, one question at a time; framework identity is earned, not required upfront — [ADR-0012](../../architecture/decisions/ADR-0012-guided-question-flow-as-standard-interaction-pattern.md) |
| "This is a team collaboration tool." | V1 has no multi-user or collaboration model — [Personas and Journey](../../context/03_personas_and_journey.md#all-three-personas-are-individual-users-in-v1) |

### Trust the Landing Must Build

- That structure is genuinely enforced, not a marketing word — demonstrated via the actual mechanism, not asserted.
- That "validated" is honest and founder-judged, never inflated into automated or third-party proof — [Assumptions](../../context/02_product_scope.md#assumptions).
- That no business background or framework vocabulary is required to start — [Core Value Proposition](../../context/01_product_vision.md#product-positioning).
- That this is a real, currently-usable manual tool today — not a waitlist for a future AI product. V1's manual-first commitment is a trust asset, not something to downplay.

### What the Landing Must Never Communicate

- That Hypora generates or decides the plan for the user, at any stage — directly contradicts AI augmentation-not-replacement and V1's zero-AI reality.
- That "validated" means scientifically or externally verified — it is the founder's own explicit checklist judgment ([Assumptions](../../context/02_product_scope.md#assumptions)).
- That Hypora is a team/multiplayer product — no collaboration model exists in V1.
- That Hypora is a place to manage or track execution (sprints, tickets, deployment) — explicitly out of scope.
- Any quantified claim (a stat, a percentage, a "used by") that is not a real, disclosed, currently-true number — Hypora at this stage has no usage history to cite; inventing one would be fabrication, not persuasion.

### What Must Never Become the Focus

- Visual production value as an end in itself — Landing composes the same functional, data-dense-oriented [Design System](../../design-system/01_design_system.md) Workspace uses; it does not grow a separate marketing-only visual language.
- Feature-completeness as a selling point — [Product Principles](../../context/01_product_vision.md#product-principles)' "simplicity — narrow scope over feature breadth" applies to how Landing talks about the product, not only to what the product builds.
- The long-term AI Co-founder vision, at the expense of clarity about what V1 actually is today — the roadmap may be shown, but never in a way that blurs manual V1 with assisted V2+.

### Who Hypora Is Intentionally Not Trying to Convert (Yet)

- Teams wanting a multiplayer, shared-workspace tool today — no collaboration model exists in V1 ([Non-Goals](../../context/02_product_scope.md#non-goals)).
- Anyone wanting an AI to generate a finished plan hands-off — contradicts AI augmentation at every stage, and V1 has no AI at all.
- Someone wanting to compare many ideas side by side today — that is the [Future Persona — Idea Explorer](../../context/03_personas_and_journey.md#future-persona--idea-explorer), explicitly not yet served by V1's Information Architecture.
- Someone who wants to skip thinking/validation and go straight to building — contradicts "validation before implementation" ([Product Principles](../../context/01_product_vision.md#product-principles)); converting this visitor without correcting the expectation produces churn, not success.

## Part 3 — Principle Categories

### Communication Principles

1. Teach the belief before selling the tool — a visitor understands *why* structuring and validation matter before being shown the mechanism that provides them.
2. Every claim about what Hypora does must be demonstrable from the real V1 guided-flow mechanism — never proven by adjectives or borrowed statistics alone.
3. State plainly what is manual today vs. assisted later, per [Product Goals](../../context/01_product_vision.md#product-goals)' "be honest about what's manual today vs AI-assisted later."
4. The long-term "AI Co-founder" vision may be shown but must never blur into implying V1 already has AI.

### Narrative Principles

5. Open with the specific structural gap Hypora exists to fill — not a generic pain statement, and not a feature list.
6. Demonstrate the guided-question mechanism directly — a visitor should see the shape of a question and the shape of the resulting structured artifact, not just be told the flow is "guided."
7. Present structuring and validation as distinct, sequential narrative beats, mirroring the [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s own Structuring → Scoped → Validating separation — collapsing them into one beat would misrepresent the product's own model.
8. Close on honesty and agency, not hype — the plan is the founder's own, marked confirmed vs. assumption by their own judgment, never a promise of outcome.

### Information Architecture Principles

9. One continuous narrative a visitor can follow start to end, sequenced to match how Hypora's *own* journey actually unfolds (gap → mechanism → structuring → validation → roadmap → entry point) — never a generic marketing template applied wholesale.
10. Every section earns its place by answering "does a visitor need this to reach the mental model in Part 1," not "does the page look incomplete without it."
11. Cognitive load is bounded the same way the product itself bounds it — one idea at a time, progressive disclosure — a Landing that dumps every fact at once contradicts the product it's describing.

### Visual Communication Principles

12. Visuals exist to make the guided-question mechanism and the resulting structured Canvas legible — never decorative product theater unconnected to a specific claim.
13. All visual elements are composed from the existing [Design System](../../design-system/01_design_system.md) per its own Composition Rules — Landing never grows a parallel, marketing-only visual language.
14. No data visualization not grounded in a real, disclosed number — see "What the Landing Must Never Communicate" above.

### Conversion Principles

15. The primary ask is proportionate to V1's real commitment level (starting a project — no account, no backend, LocalStorage-only) — objection-reduction copy must be true today, never aspirational.
16. Offer a next step for a visitor not yet ready to start a project (e.g., understanding the roadmap) without treating it as equal to the primary path.
17. Never rush a visitor past the structuring/validation belief in service of a faster funnel — a visitor who converts without sharing Part 1's mental model is a worse outcome than one who leaves better-informed and returns later.

## Relationship to the Rest of This Directory

- [01_reference_analysis.md](./01_reference_analysis.md) remains useful as a catalog of *how* a landing page can execute narrative and communication principles in general — it is read after this document, never before, and no principle in this document originates there.
- [02_hypora_current_analysis.md](./02_hypora_current_analysis.md) evaluates the current Landing's gaps against Part 2 above.
- [03_improvement_plan.md](./03_improvement_plan.md) proposes changes justified primarily by Part 1–2 above; where a reference pattern is cited, it appears only as supporting evidence for execution, never as the reason a proposal exists.
