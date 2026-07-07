# Business Structuring: Question Model & Preset Strategy

**Refs:** → [Features Index](./000_index.md) · [Business Structuring](./02_business_structuring.md) · [Workspace Data & State](../02_data_and_state.md) · [ADR-0004](../../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md) · [ADR-0005](../../architecture/decisions/ADR-0005-korean-first-localization-architecture.md)

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

## Localization

*(Explicit — this task's product decision; see [ADR-0005](../../architecture/decisions/ADR-0005-korean-first-localization-architecture.md).)*

The Question Model above already mixes two kinds of information: facts that make a Question *what it is* (independent of any language), and text that makes a Question *presentable to a user* (which must exist once per supported language). This section makes that split explicit — it is not a new concept, it is the same "framework-independent" discipline this document already applies to React, extended to language.

| | Content identity (language-independent) | Presentation content (localized) |
|---|---|---|
| From the table above | Related Canvas field, Validation rule, Completion rule, ordering (this Question's fixed position in the V1 Question Set) | Purpose (shown as the question's title/framing text), Suggested answers (presets) |
| New in this section | `questionId`, `localizationKey` | Localized resource values (`ko`, `en`, ...) |

**The connector is `localizationKey`.** Every Question carries a `questionId` (a stable, language-independent identifier, e.g. `problem_definition`) and a `localizationKey` used to look up its Purpose text in a Localization Resource, one value per supported language. Conceptually (not an implementation class, per this document's own convention):

Question entity (identity only — never contains display text):
```
{
  questionId: "problem_definition",
  relatedCanvasField: "problem",
  localizationKey: "question.problem_definition",
  validation: "non-empty",
  ordering: 2
}
```

Localization Resource (presentation content, one record per key, all supported languages together):
```
{
  key: "question.problem_definition",
  ko: "어떤 문제를 해결하려고 하나요?",
  en: "What problem are you solving?"
}
```

**A Question's identity never changes based on language.** The same `questionId`, the same `relatedCanvasField`, the same validation/completion rules apply regardless of which language is currently selected — only the *text* resolved through `localizationKey` differs. This is what lets [Frontend Architecture](../../frontend/01_architecture.md#localization-layer)'s Localization Layer swap displayed text without the Question Model, the guided flow, or any lifecycle guard needing to know or care which language is active.

**Preset options are localized the same way** — see Preset Strategy below for how the Preset Provider's output becomes language-specific.

**User-entered answers are never run through this mechanism.** Once a preset is selected or a custom answer is typed, the resulting Canvas field value is user content, not presentation content — it is stored and displayed exactly as entered, in whichever language the user wrote it in, per [Workspace Architecture](../01_architecture.md#localization-scope)'s "Not localized" list. The Localization Resource only ever supplies the *question text and preset options offered to the user*, never a stand-in for what the user actually writes.

## Preset Strategy

*(Explicit constraint: V1 uses no AI; presets must be curated, static content in V1, structured so V2 can source them from AI without changing the experience.)*

**Shape:** each question exposes 3–5 preset answers. A preset is a short example phrasing relevant to the question's Purpose — an accelerator or starting point, not a universally correct answer (this framing applies even to open-ended questions like Business Idea or Problem, where presets read as fill-in-style templates rather than literal suggestions, e.g., "A subscription service that helps [audience] do [job]"). Selecting a preset populates the related Canvas field with that text, which the user may then edit further — a selected preset is not locked or read-only.

**Custom input is always available, never hidden behind a toggle that implies it's a fallback** — presets and custom entry are presented as equally valid ways to answer, consistent with the product not knowing better than the user what their own idea is.

**Replaceable-content contract (the V2 seam):** a question's preset list is sourced from a **Preset Provider** — a conceptual boundary, not a class or interface design (out of scope for this document per its "no implementation classes" instruction). V1's Preset Provider returns a fixed, curated list per question, authored as product content. V2's AI Canvas Assistant can become a *different* Preset Provider — one that generates presets contextually (e.g., informed by the user's Business Idea answer when suggesting Problem presets) — **without the guided flow, the Question Model, or the select-or-customize interaction changing at all.** The only thing that changes between V1 and V2 is *where the 3–5 suggestions come from*; everything downstream (validation rule, completion rule, custom-answer path) is identical. This is what makes the [Product Principles](../../context/01_product_vision.md#product-principles)' "AI augmentation, not replacement" rule concrete for this Feature specifically: AI in V2 only ever supplies *suggestions* through the same seam a static list fills in V1 — it never gains a different or more privileged interaction path than the one already specified here.

**V1 preset content itself (the actual curated phrasings per question) is product/content authoring, not specification** — this document owns the *contract* (shape, count, replaceability), not the literal wording of any preset, which may be authored or revised without a specification change as long as it keeps the 3–5-option, always-custom-available shape.

**Preset content must support localization, using the same identity/presentation split as the Question Model above.** The Preset Provider's contract is extended, not replaced, to carry language:

| | Input | Output |
|---|---|---|
| Preset Provider (per [Preset Context](#preset-strategy) above) | Question ID, current answers/context, **current language** | 3–5 **localized** preset options, in the current language |

- **V1: a static Korean/English preset provider.** The curated preset list per question exists once per supported language (Korean authored first, per the [Localization Principle](../../context/01_product_vision.md#localization-principle) — English preserves the original Korean meaning rather than being independently authored) — the provider simply selects the current language's list, the same static-content shape already described above, now keyed by language as well as by question.
- **V2: an AI-based preset provider.** Becomes a different provider behind the identical Input/Output contract — the AI provider receives the current language as part of its input and is responsible for returning presets *already in that language*; it never returns one language for the UI to translate on the fly. This keeps the provider interface language-independent: neither V1's static provider nor V2's AI provider requires the guided flow, the Question Model, or any UI component to know how localization happened — both simply return options already in the requested language.
- **The provider interface itself remains language-independent** — "language" is just one more input parameter, exactly like "Question ID" or "current answers/context" already were; no separate, parallel per-language provider mechanism exists or is needed.

## Ownership

This document is the single authoritative source for the Question Model's shape (including the content-identity/presentation-content split and `localizationKey` mechanism) and the Preset Strategy's replaceable-content contract (including its localization extension). [Business Structuring](./02_business_structuring.md) references both rather than redefining them. Any future Feature adopting a similar guided-question pattern (none currently planned) should reference this document's Question Model rather than defining a parallel one. **The Localization Principle itself** ([Product Vision](../../context/01_product_vision.md#localization-principle)), **the persisted `language` state** ([Data & State](../02_data_and_state.md#application-level-state-non-project)), and **the Localization Layer mechanism** ([Frontend Architecture](../../frontend/01_architecture.md#localization-layer)) are owned elsewhere — this document owns only how Question and Preset content participates in localization, not the localization system itself.
