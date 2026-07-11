# Feature: Risk Memo

**Refs:** → [Features Index](./000_index.md) · [Workspace Architecture](../01_architecture.md) · [Workspace Data & State](../02_data_and_state.md) · [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) · [Business Structuring](./02_business_structuring.md) · [Validation Planning](./04_validation_planning.md) · [AI Ownership Model](../../ai/03_ownership_model.md) · [Canvas Assistant](../../ai/capabilities/01_canvas_assistant.md)

*(First downstream consumer of the generalized AI-assisted structured-feature architecture, per [Future Expansion Strategy](../../context/06_future_expansion_strategy.md#future-ready-architecture-principle)'s 4th principle. Authored as a real Feature Specification, not a placeholder — this document is the prerequisite the AI architecture review series previously identified as missing.)*

## Purpose

Let a user structure the risks facing their business idea — technical and business — plus what they genuinely don't yet know, as three discrete, revisitable fields, so risk-awareness is an explicit, addressable artifact rather than buried in freeform prose or conflated with the testable Assumptions [Validation Planning](./04_validation_planning.md) already owns.

## Feature Scope

**In Scope:**
- Authoring three structured fields per Project: Technical Risks, Business Risks, Open Questions (see Structured Data Model below).
- Each field is independently addressable and independently editable — not a single combined memo blob.
- Optional AI Assist per field, once implemented, per the frozen AI-assisted structured-feature architecture (see AI Integration Points below).

**Out of Scope:**
- Resolving or tracking a risk's status (validated/invalidated/mitigated) — that is testable-assumption territory, already owned by [Validation Planning](./04_validation_planning.md); Risk Memo records that a risk or unknown exists, in the founder's own words, exactly as [Business Structuring](./02_business_structuring.md)'s Risk Notes already does for its own single field, extended here to three.
- Any lifecycle-gating behavior — Risk Memo does not block or drive any [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) transition (see Ownership below).
- Automatic conversion of a Risk Memo entry into a Validation Planning Assumption — a user may draw on Risk Memo when authoring an Assumption, but the connection is manual, identical to the existing Risk Notes ↔ Assumptions boundary.
- AI generation of Risk Memo content beyond a suggestion a user may accept, edit, or ignore — Manual-first applies identically to every other AI-assisted field in this product.

## Structured Data Model / Field Definitions

| Field | Meaning | Shape |
|---|---|---|
| Technical Risks | What could fail or prove harder than expected on the technical/implementation side — feasibility, dependencies, unproven assumptions about how the thing will be built | Freeform text, optional |
| Business Risks | What could fail on the market/business-model side — competition, demand, pricing, timing | Freeform text, optional |
| Open Questions | What the founder genuinely doesn't know yet that could materially change the idea if answered | Freeform text, optional |

Each field is a discrete, independently-addressable unit — the same "Data shape stability" principle already governing the Canvas, MVP Scope, Feature, and Validation entries in [Workspace Data & State](../02_data_and_state.md)'s Data Ownership table. No field is a combined blob; a future AI Capability may augment one field without touching the other two.

**Concept boundary (why these are not named "Assumptions"):** Validation Planning already owns "Assumptions" as a testable, resolvable checklist concept (statement + method + success criterion + resolution). Risk Memo deliberately does not reuse that name or introduce a fourth field that would collide with it — Risk Memo records that a risk or unknown exists; Validation Planning is where a user decides to make one of them testable. This mirrors the existing, already-accepted boundary between Business Structuring's Risk Notes and Validation Planning's Assumptions, extended to Risk Memo's finer-grained fields.

## Validation Rules

- Every field may be left empty — Risk Memo is entirely optional; no field is required for the Feature to be considered "visited."
- No cross-field validation exists (a Technical Risk does not require a corresponding Business Risk, etc.).
- No non-empty requirement exists anywhere in this Feature, consistent with its non-gating role (see Ownership below).

## Relationships with Other Features

| Feature | Relationship |
|---|---|
| Business Structuring | Risk Memo's AI Assist reads the completed Canvas as context (see AI Integration Points); Risk Memo does not read or duplicate Business Structuring's own Risk Notes field, and neither Feature edits the other's data |
| Validation Planning | May be informed by a Risk Memo entry when a user authors an Assumption, but no automatic conversion exists — the same manual-only boundary Risk Notes already has with Validation Planning |
| MVP Planning | No direct relationship — Risk Memo does not read Scope/Feature data, per the frozen architecture's capability-independence rule (a capability may not consume another capability's internal state) |
| Project Summary | May read Risk Memo's presence/emptiness for completeness display, exactly as it already reads Risk Notes — read-only, no authoring |

## User Stories

- As the **Primary Persona (Solo Founder)**, I want to write down what could technically go wrong, separately from what could go wrong in the market, so I don't lose either kind of risk in one undifferentiated note.
- As the **Primary Persona**, I want to record what I genuinely don't know yet, so I can see it as an open question rather than quietly assuming an answer.
- As the **Primary Persona**, I want AI help drafting a risk field from my Canvas, so I have a starting point without needing to already know what to write.

## Acceptance Criteria

- Each of the three fields is independently editable and independently saved — editing one never affects another.
- Risk Memo may be left entirely empty without blocking any other Feature or lifecycle transition.
- If AI Assist is available for a field, the suggestion is presented as an offer, never auto-inserted — identical to every other AI-assisted field in this product (per [04_ai_interaction.md](../../ai/04_ai_interaction.md)'s Governing Rules).
- No field's label or copy is ever hardcoded — resolved through the existing Localization Layer, consistent with every other Workspace Feature.

## User Workflow / User Journey

| Stage | Description |
|---|---|
| Beginning | User opens Risk Memo for the first time (all three fields empty) or resumes a partially-authored one |
| Normal Flow | User writes into any of the three fields, in any order; optionally uses AI Assist per field once available |
| Alternative Flow | User revisits Risk Memo after Business Structuring's Canvas has changed, to update a risk field in light of new Canvas content |
| Completion | There is no "completion" state — Risk Memo has no required fields and drives no transition; a user simply stops editing when satisfied |
| Cancellation | User leaves with some or all fields empty — not an error, the accepted default state |
| Recovery | Same persistence-failure handling as every other authoring Feature, per [Workspace Data & State](../02_data_and_state.md) |

## Interaction Model

| Aspect | Definition |
|---|---|
| Primary Actions | Edit Technical Risks, Business Risks, or Open Questions; optionally invoke AI Assist per field |
| Secondary Actions | None beyond field editing |
| Empty State | All three fields empty — shown as an invitation to write, not an error, identical in tone to Risk Notes' own empty state |
| Loading State | The three fields' saved values loading when the section opens |
| Error State | Persistence failure on read or write (per [Workspace Data & State](../02_data_and_state.md)) |
| Validation State | None — every field accepts any text, including empty |
| Success State | A field's edit is saved; there is no larger "success" state beyond individual field saves |

**Field-level AI interaction, once implemented:** identical shape to Business Structuring's Canvas Assistant integration — Ask AI / Suggestion Card / Accept / Reject / the existing Acceptance Confirmation pattern, per [04_ai_interaction.md](../../ai/04_ai_interaction.md), reused verbatim, one field at a time. No batch, whole-section generation — consistent with the frozen architecture's field-level-only interaction model.

## Navigation

| Aspect | Definition |
|---|---|
| Entry Point | From Business Structuring once the Canvas exists (Structuring stage reached), or directly from the Dashboard for a resumed Project |
| Exit Point | Back to the Dashboard or any other section, at any time |
| Previous Screen | Whichever section the user came from (non-linear) |
| Next Screen | None formally — Risk Memo is not a step in any required sequence |
| Cross-Feature Navigation | Freely reachable from and to any other section of the same Project, identical to MVP Planning/Validation Planning's own non-linear model |
| Browser Back Behavior | Returns to whichever section was previously open |
| Deep Link Considerations | Applicable — Risk Memo should be addressable within the Project, consistent with every other Feature |

## Persistence

| Aspect | Definition |
|---|---|
| Becomes dirty | Editing any of the three fields |
| Automatically saved | Field-level edits save on leaving the field, consistent with every other authoring Feature |
| Restored | On reopening, all three fields' saved values are restored as-is |
| Discarded | Unsaved keystroke-level edits not yet auto-saved may be lost on abrupt navigation, same known limitation as every other authoring Feature |

## Future Expansion

- If a future roadmap stage needs Risk Memo content as input to another capability (e.g., a future GTM or Market Intelligence stage informing risk framing), that capability reads Risk Memo's fields read-only, exactly as [Project Summary](./05_project_summary.md) already does — it does not gain write access, per the frozen architecture's capability-independence rule.
- If Risk Memo's own AI Assist later needs richer context than Canvas + its own fields, that is a new, explicit architecture decision (per [AI Ownership Model](../../ai/03_ownership_model.md)'s "never consume another capability's internal state" rule) — not something this specification pre-authorizes.

## Ownership

**Dependencies on Product Lifecycle:** None. Risk Memo does not gate, drive, or read any [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) transition — consistent with Business Structuring's own Risk Notes precedent ("a guided-flow quality artifact, not a lifecycle gate"). No change to the domain model was made or is required by this specification.

**Dependencies on Workspace:** Depends on the Risk Memo screen (once designed) owned by [Workspace Architecture](../01_architecture.md); depends on this Feature's own field data being added as a new row in [Workspace Data & State](../02_data_and_state.md)'s Data Ownership table (see that document for the required update). Does not redefine either.

**AI Integration Points** *(see [AI Ownership Model](../../ai/03_ownership_model.md#context-representation-pipeline) for the full pipeline this instantiates):*
- One new AI Capability, e.g. `RiskMemoAssistant`, Contract Version 1.0 (Draft until this Feature is actually implemented), per [Capability Index](../../ai/capabilities/000_index.md)'s template — a new file, a new row, never folded into Canvas Assistant's existing contract (their Request/Response shapes diverge from the outset, per the Capability Promotion Rules' mandatory trigger already identified in this architecture's own review history).
- Request context: Business Canvas (via the Workspace Context Builder, once promoted — see below) + Risk Memo's own current field values (the two other fields, as "sibling" context, alongside the field being targeted) — no MVP Planning or Validation Planning data, per the frozen architecture's capability-independence rule.
- **This Feature is the concrete trigger for promoting the Workspace Context Builder** out of Business Structuring's own local Canvas-serialization code — the "second consumer" condition previously left unmet is satisfied the moment Risk Memo's own AI Capability is implemented, not before.
