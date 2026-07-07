# Feature: Business Structuring

**Refs:** → [Features Index](./000_index.md) · [Question Model & Preset Strategy](./02_1_question_model.md) · [Workspace Architecture](../01_architecture.md) · [Workspace Data & State](../02_data_and_state.md) · [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) · [Validation Planning](./04_validation_planning.md) · [ADR-0004](../../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md)

*(Explicit — the brief names Business Idea, Problem, Target Customer, Solution, and Value Proposition directly, and now explicitly mandates a guided, question-based interaction model over a form, per [ADR-0004](../../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md). Risk Notes remains Inferred scope, now placed in the Review step rather than the guided sequence — see Responsibilities below.)*

## Purpose

Let a user transform a raw business idea into a structured hypothesis — naming the problem, who has it, the proposed solution, and why it's worth choosing — **one focused question at a time**, so that structuring never feels like filling out a long form, and so every later Feature (MVP Planning, Validation Planning, Project Summary) operates on a clearly articulated idea rather than a vague one. The guided, progressive interaction is not a presentation detail — it *is* the feature; **the Canvas remains the underlying business model that the guided flow writes to**, unchanged in shape (see [Workspace Data & State](../02_data_and_state.md)).

## Responsibilities

**In Scope:**
- Presenting the five Canvas questions ([Question Model](./02_1_question_model.md)) one at a time, in the fixed order: Business Idea → Problem → Target Customer → Solution → Value Proposition.
- Offering 3–5 curated preset answers per question, plus an always-available custom answer — per the [Preset Strategy](./02_1_question_model.md#preset-strategy).
- Saving each answer automatically the moment it's given (preset selection or custom text).
- Tracking and displaying progress through the sequence automatically — derived from which Canvas fields are already non-empty, never a separately authored/persisted counter (see [Workspace Data & State](../02_data_and_state.md)).
- Allowing free backward movement through already-answered questions without losing any answer.
- Presenting a **Review** step after the fifth question — showing the full Canvas plus an editable, optional Risk Notes field — that the user must explicitly confirm before Business Structuring is considered complete.
- Driving the Project's Structuring lifecycle stage and its transition to Scoped once all five Canvas fields are filled (see [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)) — unchanged from before this decision.

**Out of Scope:**
- Turning Risk Notes into testable, trackable items with a validation method and resolution status — that is Validation Planning's Assumptions responsibility (see below and [Validation Planning](./04_validation_planning.md)). Business Structuring captures *that* a risk exists in the founder's own words; it does not track *whether* it's been resolved.
- Defining what to build (features, scope) — that is MVP Planning's responsibility.
- Any AI generation of preset content — V1 presets are static, curated content; see the [Preset Strategy](./02_1_question_model.md#preset-strategy) for the V2 seam. Out of scope until V2.

**Why Risk Notes moved to Review, not a guided question:** Risk Notes is optional and non-gating (per the Boundary below); giving it a guided step would require either (a) a skippable step, which needs a persisted "was this skipped" flag purely to make resume behavior correct — introducing state with no other purpose — or (b) treating it as required, which it explicitly is not. Presenting it as an editable field within Review avoids inventing that flag entirely: Review is reachable exactly when the five required questions are done, and Risk Notes simply lives there as one more editable field, answered or not. See [ADR-0004](../../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md).

**Boundary with Validation Planning (Risks vs. Assumptions):** unchanged from the prior specification — Risk Notes is a lightweight, optional, non-gating reflection; Validation Planning's Assumptions are the operationalized, checklist-tracked items that gate Validating → Validated. A user may, but is not required to, turn a Risk Note into a tracked Assumption; Business Structuring performs no automatic conversion.

## User Stories

- As the **Primary Persona (Solo Founder)**, I want to answer one focused question at a time, so that structuring my idea doesn't feel like filling out a long form.
- As the **Primary Persona**, I want example answers I can pick from, so that I have a starting point when I'm not sure how to phrase something.
- As the **Primary Persona**, I want to go back and change an earlier answer without losing anything else I've written, so that I can refine my thinking as it develops.
- As any persona, I want to see my full Canvas before it counts as done, so that I can catch anything that reads wrong once I see it all together.

## Acceptance Criteria

- Exactly one question is visible at a time; no screen shows more than one Canvas question's input at once.
- Each question offers 3–5 preset answers and a custom-answer option that is always visible/available, never hidden behind an extra step.
- Selecting a preset or entering a custom answer saves automatically — no explicit "save" action exists for a question's answer.
- Progress (e.g., "question 3 of 5") is visible at every step, derived from which Canvas fields already have a saved value — never a separately tracked counter.
- Moving backward to a previous question preserves every other question's already-saved answer.
- After the fifth question, a Review step shows all five Canvas answers plus an editable, optional Risk Notes field.
- Business Structuring is not considered complete — and the guided flow does not "finish" — until the user explicitly confirms Review; this confirmation carries no lifecycle-transition meaning of its own beyond marking the guided flow as visited (see Dependencies on Product Lifecycle below — the actual Structuring → Scoped guard already fires once all five fields are non-empty, independent of whether Review has been confirmed).
- The Project transitions from Structuring to Scoped once all five Canvas fields are non-empty — unchanged from before, and not gated by Review confirmation (a user could in principle fill all five fields and navigate away before reaching Review; the guard already tolerates this per its Canvas-field-only definition).
- Risk Notes may be left empty in Review without blocking anything.
- No question's preset content is ever AI-generated in V1.

## Relationships with Other Features

| Feature | Relationship |
|---|---|
| Project Management | Cannot begin until a Project exists (see [Project Management](./01_project_management.md)) |
| MVP Planning | Consumes the completed Canvas as context, but does not read Risk Notes directly — MVP Planning operates on Scope/Features, not on the hypothesis narrative |
| Validation Planning | May be informed by Risk Notes, but Validation Planning owns its own, separately-authored Assumptions — no automatic conversion in V1 |
| Project Summary | Reads Canvas completion state (Section-Complete, per [Workspace Data & State](../02_data_and_state.md)) to report structuring progress — unaffected by whether Review has been confirmed, since that's a guided-flow concept, not a Canvas data concept |

## Dependencies on Product Lifecycle

Owns the **Structuring** stage and the **Structuring → Scoped** transition guard (all five Canvas fields non-empty) — see [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md). **This guard is unchanged by the guided-flow decision** — it was already keyed on Canvas field completeness, not on any UI form factor, so no domain model update was required (see [ADR-0004](../../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md)'s Consequences). Risk Notes remains excluded from the guard.

## Dependencies on Workspace

Depends on the Canvas screen structure and field order owned by [Workspace Architecture](../01_architecture.md); depends on the Canvas and Risk Notes data ownership defined in [Workspace Data & State](../02_data_and_state.md); depends on the Question Model and Preset Strategy defined in [02_1_question_model.md](./02_1_question_model.md). Does not redefine any of these.

## Future Expansion (V2–V5)

*(Explicit stage names per [Product Roadmap](../../context/01_product_vision.md#product-roadmap)); mapping is Inferred.)*

- V2 (AI Canvas Assistant) becomes a different **Preset Provider** for these same five questions, per the [Preset Strategy](./02_1_question_model.md#preset-strategy) — the guided flow, the select-or-customize interaction, and the Review step do not change; only where the 3–5 suggestions come from changes. Per the [Product Principles](../../context/01_product_vision.md#product-principles)' "AI augmentation, not replacement" rule, an AI-sourced preset is still just a suggestion the user may select, edit, or ignore.
- V3 (Market Intelligence) may surface external context (competitor/market data) alongside a question — additive, not a redefinition of the Question Model.

## Risks and Constraints

- Constraint: must not introduce a sixth *required* (guard-gating) Canvas question without a corresponding update to [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md).
- Constraint: preset content must always keep custom input equally available — never a design that makes presets feel mandatory or custom input feel like a fallback (per the [Preset Strategy](./02_1_question_model.md#preset-strategy)).
- Risk: if Risk Notes and Validation Planning's Assumptions are presented too similarly in the UI, users may confuse "wrote a risk down" with "validated a risk" — carried over from the prior specification; still a constraint on future UI work, not resolved by this specification.
- Risk: a user who fills all five Canvas fields but abandons the flow before reaching Review still causes the Project to reach Scoped (per the unchanged guard) without ever seeing their own completed Canvas reflected back — accepted as consistent with the guard's existing, data-only definition; Review is a guided-flow quality gate, not a lifecycle gate.

## User Journey

| Stage | Description |
|---|---|
| Beginning | User opens a Project's Business Structuring flow for the first time (Captured, no questions answered) or resumes one already partially answered (Structuring) |
| Normal Flow | User answers each question in order — selecting a preset or entering a custom answer — advancing automatically to the next question after each save; after the fifth question, reaches Review, edits Risk Notes if desired, and confirms |
| Alternative Flow | User moves backward to revise an earlier answer, then forward again — per the Lifecycle's Stickiness Rule, none of this affects the Project's lifecycle stage except by changing Canvas field values themselves |
| Completion | All five Canvas fields are non-empty and Review is confirmed; user proceeds to [MVP Planning](./03_mvp_planning.md) |
| Cancellation | User leaves mid-flow with some questions unanswered — not an error; resuming later reopens at the first unanswered question |
| Recovery | If an answer's save fails, the user is told before advancing to the next question, rather than silently losing the answer (per [Workspace Data & State](../02_data_and_state.md)'s Error States) |

## User Interaction

| Aspect | Definition |
|---|---|
| Primary Actions | Select a preset answer; enter a custom answer; move to the next question; move to the previous question; confirm Review |
| Secondary Actions | Jump directly to any question from Review; edit Risk Notes in Review |
| Empty State | A not-yet-answered question shows its Purpose framing and its preset options, with custom input equally available — not an error state |
| Loading State | The current question (and its saved answer, if resuming) loading when the Project is opened |
| Error State | An answer's save fails, or the Canvas fails to load (per [Workspace Data & State](../02_data_and_state.md)) |
| Validation State | A question's answer must be non-empty to count as answered, whether from a preset or custom text; Risk Notes in Review has no validation, being optional |
| Success State | An answer is saved and the flow advances; once all five are saved and Review is confirmed, Business Structuring is complete |

## Navigation

| Aspect | Definition |
|---|---|
| Entry Point | From the Dashboard (new or resumed Project), or from any other section within the same Project (non-linear at the Feature level — see [Workspace Architecture](../01_architecture.md)) |
| Exit Point | To [MVP Planning](./03_mvp_planning.md) after Review is confirmed, or back to the Dashboard at any point mid-flow |
| Previous Screen | Dashboard / Project List, or whichever section the user navigated from |
| Next Screen | MVP Scope / Feature Planning |
| Cross-Feature Navigation | Freely reachable from and to any other section of the same Project — this Feature's *internal* question-to-question movement is a separate, local concept from *cross-Feature* navigation (see [Frontend Architecture](../../frontend/01_architecture.md)) |
| Browser Back Behavior | **Distinct from in-flow backward movement.** Since individual questions are not routed (see Deep Link Considerations below), the guided flow's own "previous question" action is an in-app control, not the browser's native Back button. The native Back button follows normal single-route behavior: it navigates away from Business Structuring entirely (e.g., to the Dashboard or whichever screen preceded it), the same as leaving any other Workspace screen — it does not step backward through questions. "Move backward without losing answers" (per Acceptance Criteria) is satisfied by the in-app control only. |
| Deep Link Considerations | Applicable at the Feature level only — a Project's Business Structuring flow is addressable as one screen; individual questions are **not** separately addressable routes (no per-question URLs), per [Frontend Architecture](../../frontend/01_architecture.md)'s "no unnecessary routes" rule — the current question is local view state, not routed |

## Persistence

| Aspect | Definition |
|---|---|
| Becomes dirty | The moment the user selects a preset or types a custom answer for the current question |
| Automatically saved | Immediately upon selecting a preset, or upon leaving a custom-text question (consistent with every other authoring Feature's "save on leaving the field" rule) |
| Restored | On reopening the Project, the flow resumes at the first Canvas field that is still empty; if all five are non-empty, it opens directly to Review — **this is derived from Canvas field completeness every time, never a separately persisted "current question" pointer** (see [Workspace Data & State](../02_data_and_state.md)) |
| Discarded | An answer typed but not yet saved (e.g., the user closes the tab before the save fires) may be lost — the same known limitation shared with every other authoring Feature |
