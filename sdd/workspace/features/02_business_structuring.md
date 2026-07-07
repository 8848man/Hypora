# Feature: Business Structuring

**Refs:** → [Features Index](./000_index.md) · [Workspace Architecture](../01_architecture.md) · [Workspace Data & State](../02_data_and_state.md) · [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) · [Validation Planning](./04_validation_planning.md)

*(Explicit — the brief names Business Idea, Problem, Target Customer, Solution, and Value Proposition directly; Risks is named as an "includes" example in this task's prompt and is treated here as Inferred scope, reconciled against Validation Planning's Assumptions below to avoid duplicated responsibility.)*

## Purpose

Let a user transform a raw business idea into a structured hypothesis — naming the problem, who has it, the proposed solution, why it's worth choosing, and what could make it wrong — so that every later Feature (MVP Planning, Validation Planning, Project Summary) operates on a clearly articulated idea rather than a vague one.

## Responsibilities

**In Scope:**
- Authoring the five Canvas fields: Business Idea, Problem, Target Customer, Solution, Value Proposition (see [Workspace Data & State](../02_data_and_state.md)).
- Authoring optional Risk Notes: a freeform reflection on what could make the hypothesis wrong, captured alongside the Canvas.
- Driving the Project's Structuring lifecycle stage and its transition to Scoped once all five Canvas fields are filled (see [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)).

**Out of Scope:**
- Turning Risk Notes into testable, trackable items with a validation method and resolution status — that is Validation Planning's Assumptions responsibility (see below and [Validation Planning](./04_validation_planning.md)). Business Structuring captures *that* a risk exists in the founder's own words; it does not track *whether* it's been resolved.
- Defining what to build (features, scope) — that is MVP Planning's responsibility.
- Any AI suggestion or auto-completion of Canvas content — out of scope until V2 (see [Product Roadmap](../../context/01_product_vision.md#product-roadmap)).

**Boundary with Validation Planning (Risks vs. Assumptions):** Risk Notes is a lightweight, optional, non-gating reflection — it does not block any lifecycle transition. Validation Planning's Assumptions are the operationalized, checklist-tracked items that *do* gate the Validating → Validated transition. A user may (but is not required to) turn a Risk Note into a tracked Assumption; Business Structuring does not perform that conversion itself — see [Validation Planning](./04_validation_planning.md) for how an Assumption is authored.

## User Stories

- As the **Primary Persona (Solo Founder)**, I want to write down the problem I'm solving and who has it, so that I'm forced to be specific instead of staying vague.
- As the **Primary Persona**, I want to articulate why my solution is worth choosing (Value Proposition), so that I can tell whether the idea holds together before investing more time.
- As any persona, I want to jot down what could make this idea fail, so that I don't lose that instinct before Validation Planning formalizes it.

## Acceptance Criteria

- A Project in the Structuring stage allows independent authoring of each of the five Canvas fields, in any order (per [Workspace Architecture](../01_architecture.md)'s non-linear navigation), with the suggested order being Business Idea → Problem → Target Customer → Solution → Value Proposition.
- The Project transitions from Structuring to Scoped only once all five Canvas fields are non-empty — never partially, per [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s guard.
- Risk Notes may be left Empty without blocking the Structuring → Scoped transition.
- No Canvas field or Risk Notes entry is ever auto-filled or suggested in V1.

## Relationships with Other Features

| Feature | Relationship |
|---|---|
| Project Management | Cannot begin until a Project exists (see [Project Management](./01_project_management.md)) |
| MVP Planning | Consumes the completed Canvas as context, but does not read Risk Notes directly — MVP Planning operates on Scope/Features, not on the hypothesis narrative |
| Validation Planning | May be informed by Risk Notes, but Validation Planning owns its own, separately-authored Assumptions — no automatic conversion in V1 |
| Project Summary | Reads Canvas completion state (Section-Complete, per [Workspace Data & State](../02_data_and_state.md)) to report structuring progress |

## Dependencies on Product Lifecycle

Owns the **Structuring** stage and the **Structuring → Scoped** transition guard (all five Canvas fields non-empty) — see [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md). Does not alter this guard; Risk Notes is explicitly excluded from it, per the Responsibilities section above.

## Dependencies on Workspace

Depends on the Canvas screen structure and field order owned by [Workspace Architecture](../01_architecture.md); depends on the Canvas and Risk Notes data ownership defined in [Workspace Data & State](../02_data_and_state.md). Does not redefine either.

## Future Expansion (V2–V5)

*(Explicit stage names per [Product Roadmap](../../context/01_product_vision.md#product-roadmap); mapping is Inferred.)*

- V2 (AI Canvas Assistant) adds suggestion content to these same five fields — per the [Product Principles](../../context/01_product_vision.md#product-principles)' "AI augmentation, not replacement" rule, suggestions must never auto-overwrite a user's own entry.
- V3 (Market Intelligence) may surface external context (competitor/market data) alongside the Canvas — additive, not a redefinition of the Canvas fields themselves.

## Risks and Constraints

- Constraint: must not introduce a sixth *required* (guard-gating) Canvas field without a corresponding update to [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) — Risk Notes is deliberately kept optional/non-gating specifically to avoid this.
- Risk: if Risk Notes and Validation Planning's Assumptions are presented too similarly in the UI, users may confuse "wrote a risk down" with "validated a risk" — a Project Summary or UI-level distinction (out of scope for this document) should make the difference visible; flagged here as a constraint on future UI work, not resolved by this specification.
