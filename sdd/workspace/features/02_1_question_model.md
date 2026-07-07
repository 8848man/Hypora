# Business Structuring: Question Model & Preset Strategy

**Refs:** → [Features Index](./000_index.md) · [Business Structuring](./02_business_structuring.md) · [Workspace Data & State](../02_data_and_state.md) · [ADR-0004](../../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md)

*(Inferred — the brief for the guided-flow decision requires a conceptual Question Model and Preset Strategy; this document defines both. Sub-numbered (`02_1_`) rather than a new top-level document because it is a focused extension of Business Structuring's own scope — the detailed schema and content strategy behind that Feature's guided flow — per the framework's sub-numbering convention.)*

## Why This Is a Separate Document

[Business Structuring](./02_business_structuring.md) already covers Purpose, Responsibilities, and UX at the Feature level; the Question Model and Preset Strategy are detailed enough — and specific enough to one Feature's internal mechanics — to bloat that document past its natural scope if inlined. This is exactly the sub-numbering case the framework describes: "a focused extension of an existing numbered document's scope, split out because it grew too large or specialized" (`06_naming_and_versioning.md`).

## Question Model (Conceptual — Independent of Any UI Framework)

A **Question** is the atomic unit of the guided flow. It is a plain data concept — nothing here presumes React, a component tree, or any rendering technology.

| Property | Meaning |
|---|---|
| **Purpose** | A one-line statement of what this question is trying to elicit (e.g., "identify who specifically has this problem") — shown to the user as framing, not just a label |
| **Related Canvas field** | Which of the five Canvas fields ([Workspace Data & State](../02_data_and_state.md)) this question's answer populates — a strict 1:1 mapping in V1; no question exists without a Canvas field to write to |
| **Suggested answers (presets)** | 3–5 curated example answers relevant to this question's Purpose — see Preset Strategy below for their source and shape |
| **Custom answer** | Always available, regardless of whether a preset is selected — freeform text entry that becomes the field's value |
| **Validation rule** | The condition an answer must satisfy to count as answered — for every V1 question, "non-empty text," matching the Canvas field's own non-empty requirement in [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md) |
| **Completion rule** | A question is complete the moment its related Canvas field is non-empty — whether that value came from selecting a preset verbatim, editing a selected preset, or writing a fully custom answer. There is no separate "answered" flag distinct from the field's own value. |

**The V1 Question Set** is exactly the five Canvas fields, in the fixed order already established by [Core User Journey](../../context/03_personas_and_journey.md): Business Idea → Problem → Target Customer → Solution → Value Proposition. This document does not renumber or reorder them — it references that canonical sequence rather than redefining it.

**Risk Notes is deliberately not a Question in this model.** It has no preset strategy and no fixed position in the guided sequence — see [Business Structuring](./02_business_structuring.md) for why it lives in the Review step instead.

## Preset Strategy

*(Explicit constraint: V1 uses no AI; presets must be curated, static content in V1, structured so V2 can source them from AI without changing the experience.)*

**Shape:** each question exposes 3–5 preset answers. A preset is a short example phrasing relevant to the question's Purpose — an accelerator or starting point, not a universally correct answer (this framing applies even to open-ended questions like Business Idea or Problem, where presets read as fill-in-style templates rather than literal suggestions, e.g., "A subscription service that helps [audience] do [job]"). Selecting a preset populates the related Canvas field with that text, which the user may then edit further — a selected preset is not locked or read-only.

**Custom input is always available, never hidden behind a toggle that implies it's a fallback** — presets and custom entry are presented as equally valid ways to answer, consistent with the product not knowing better than the user what their own idea is.

**Replaceable-content contract (the V2 seam):** a question's preset list is sourced from a **Preset Provider** — a conceptual boundary, not a class or interface design (out of scope for this document per its "no implementation classes" instruction). V1's Preset Provider returns a fixed, curated list per question, authored as product content. V2's AI Canvas Assistant can become a *different* Preset Provider — one that generates presets contextually (e.g., informed by the user's Business Idea answer when suggesting Problem presets) — **without the guided flow, the Question Model, or the select-or-customize interaction changing at all.** The only thing that changes between V1 and V2 is *where the 3–5 suggestions come from*; everything downstream (validation rule, completion rule, custom-answer path) is identical. This is what makes the [Product Principles](../../context/01_product_vision.md#product-principles)' "AI augmentation, not replacement" rule concrete for this Feature specifically: AI in V2 only ever supplies *suggestions* through the same seam a static list fills in V1 — it never gains a different or more privileged interaction path than the one already specified here.

**V1 preset content itself (the actual curated phrasings per question) is product/content authoring, not specification** — this document owns the *contract* (shape, count, replaceability), not the literal wording of any preset, which may be authored or revised without a specification change as long as it keeps the 3–5-option, always-custom-available shape.

## Ownership

This document is the single authoritative source for the Question Model's shape and the Preset Strategy's replaceable-content contract. [Business Structuring](./02_business_structuring.md) references both rather than redefining them. Any future Feature adopting a similar guided-question pattern (none currently planned) should reference this document's Question Model rather than defining a parallel one.
