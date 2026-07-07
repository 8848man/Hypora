# ADR-0004: Guided Question-Based Flow Replaces the Multi-Field Canvas Form

**Status:** Accepted
**Date:** 2026-07-07
**Affects specs:** [Business Structuring](../../workspace/features/02_business_structuring.md), [Question Model & Preset Strategy](../../workspace/features/02_1_question_model.md), [Workspace Architecture](../../workspace/01_architecture.md), [Frontend Architecture](../../frontend/01_architecture.md), [Design System](../../design-system/01_design_system.md)

## Context

V1's Business Structuring Feature was originally specified — and implemented — as a single scrolling form exposing all five Canvas fields (plus optional Risk Notes) at once. Product direction has since determined that this no longer reflects the intended experience: the Feature's purpose is to *progressively* help a user structure an idea, not to hand them a blank multi-field document. The existing [Product Principles](../../context/01_product_vision.md#product-principles) already commit to Progressive Disclosure as an enduring rule — the original form-based implementation was a spec gap against that principle, not a new idea being introduced now.

This decision spans three owned areas (Workspace's Feature Specification, Frontend Architecture's component/state model, and the Design System's component inventory), is moderately expensive to reverse once a Question Model and preset content exist and features are built against them, and was chosen among genuinely different alternatives — it meets the ADR trigger list.

## Decision

Replace the multi-field form with a **guided, one-question-at-a-time flow**: one focused question per step, automatic saving after each answer, visible progress, free backward navigation without data loss, and a Review step (displaying the full Canvas) that gates completion. The underlying Canvas data model is unchanged — five fields, same shape, same role in the [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s Structuring → Scoped guard. Only the authoring interaction model changes. Each question offers 3–5 curated preset answers plus an always-available custom input, defined as replaceable content (see [Question Model & Preset Strategy](../../workspace/features/02_1_question_model.md)) so that V2's AI Canvas Assistant can source presets from AI without changing the interaction model itself.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Keep the multi-field form, add inline hints or example text per field | Doesn't achieve genuine progressive disclosure — the user still sees, and is cognitively burdened by, all five fields at once; violates the Progressive Disclosure principle as directly as the original form did |
| A wizard grouping 2–3 fields per screen | Dilutes the explicit "one focused question" requirement and weakens the per-question AI-preset seam V2 needs — each screen would need multiple parallel preset sets shown simultaneously, reintroducing much of today's cognitive load |
| A chat-style conversational interface | Rejected as premature for V1 — implies a conversational agent before any AI exists, contradicting the explicit "do not implement AI" constraint; a structured one-question-per-step flow with curated presets achieves progressive guidance without implying intelligence that isn't there |

## Consequences

**Easier:**
- V2's per-question AI preset injection becomes a provider swap (per the Preset Strategy), not a redesign of navigation or interaction.
- The Review step gives users one clear point to confirm accuracy before the Project can rely on the Canvas being "done," rather than trusting a scrolled-past form.

**Harder / accepted trade-offs:**
- Slightly more implementation complexity than a single form: an ordered, resumable question sequence and a Review step must be built and kept consistent with the underlying Canvas data.
- Risk Notes, previously presented alongside the Canvas fields in the form, moves to being an editable field within the Review step rather than a guided question in its own right — see [Business Structuring](../../workspace/features/02_business_structuring.md) for why (its optional, non-gating nature fits Review's "edit any answer" framing better than a skippable guided step, and avoids introducing a persisted "skipped" flag purely to track that skip).
- No change to the Business Idea Lifecycle: the Structuring → Scoped guard was already keyed on Canvas field completeness, not on any particular UI form factor, so this decision requires no domain model change.
