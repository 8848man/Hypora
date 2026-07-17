# Current State Analysis — Hypora Landing

**Refs:** → [00_index](../../00_index.md) · [00_design_principles](./00_design_principles.md) · [01_reference_analysis](./01_reference_analysis.md) · [Information Architecture](../../context/04_information_architecture.md) · [Landing Experiment Strategy](../../context/07_landing_experiment_strategy.md) · [Product Vision](../../context/01_product_vision.md) · [Design System](../../design-system/01_design_system.md)

Every gap below is measured against [00_design_principles.md](./00_design_principles.md) — Hypora's own philosophy, not the Sentinel reference. A gap citation to a reference pattern appears only where it clarifies *how* a Hypora principle could be executed, never as the reason the gap matters.

## What Exists Today

Per [Information Architecture](../../context/04_information_architecture.md#information-architecture-product-level), Landing is three routed pages sharing one persistent header/footer (`app/src/layout/LandingLayout.tsx`):

| Page | Content (current implementation) |
|---|---|
| **Home** (`HomePage.tsx`) | One centered Hero block (headline, subheadline, single primary CTA) + a three-card row of value props. No other section. |
| **Features** (`FeaturesPage.tsx`) | A page header + a vertical list of five Feature cards (name + one-line description), one per V1 Feature |
| **Roadmap** (`RoadmapPage.tsx`) | A page header + a Stepper of the five V1–V5 roadmap stages |

Header/footer are shared and persistent: logo, in-page nav (Home/Features/Roadmap), language switcher, a header-level CTA button, and a one-line footer.

**Already in place and not addressed by this analysis (pre-existing strengths, out of scope to change):** the A/B/C storytelling experiment ([Landing Experiment Strategy](../../context/07_landing_experiment_strategy.md)), Korean-first localization on every string, and full composition through the shared [Design System](../../design-system/01_design_system.md) rather than ad hoc markup.

## Strengths

| Strength | Which design principle it already satisfies |
|---|---|
| **A working content-experimentation mechanism already exists**, tracking narrative variants per visitor | Supports Communication Principle 1 (teach-the-belief) — but currently has almost no narrative surface *to* vary; see Gaps below |
| **Every string is Korean-first and dual-localized from day one** | Not a Landing Design Principle directly, but a precondition every proposal below must respect ([Product Vision](../../context/01_product_vision.md#localization-principle)) |
| **Composed entirely from the Design System, zero one-off components** | Directly satisfies Visual Communication Principle 13 (no parallel marketing-only visual language) |
| **The Hero's variant copy already opens with outcome/frustration, not a feature list** (e.g., Variant A: "You have the idea. You just don't know where to start.") | Partially satisfies Narrative Principle 5 (open with the structural gap) — see Gaps for why this is only a partial match |

## Gaps, Read Against 00_design_principles.md

### Against the Mental Model (Part 1)

| Gap | Principle not yet met |
|---|---|
| **No misconception is ever corrected.** Nothing on Landing states that Hypora is not a chatbot, not a blank canvas template, not a PM tool, and not a team tool. A first-time visitor arriving with the most likely misconception (per [00_design_principles.md](./00_design_principles.md#the-misconception-people-are-likely-to-have) — "this is an AI plan-generator") has nothing on the page to correct that assumption. | "Misconceptions the Landing Must Correct" — currently zero of five are addressed |
| **The guided-question mechanism is never shown or described anywhere.** A visitor cannot tell, from Landing alone, that Hypora works one question at a time rather than as a form or a chat window — the single fact [ADR-0004](../../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md) and [ADR-0012](../../architecture/decisions/ADR-0012-guided-question-flow-as-standard-interaction-pattern.md) treat as most differentiating is invisible. | Narrative Principle 6 |
| **Structuring and validation are never distinguished.** The Home value cards mention "structure the idea," "scope the MVP," and "validate before you build" as three parallel bullet points of equal visual weight — not as a sequence, and with no indication that validation is a distinct, later, founder-judged step (vs. an automated check). | Narrative Principle 7; "Trust the Landing Must Build" (honest, founder-judged validation) |

### Against the Emotional Journey (Part 2)

| Gap | Journey beat not yet reached |
|---|---|
| **Recognition (beat 1) is present but generic.** The Hero states a frustration ("you just don't know where to start"), but nothing on the page names the *specific* structural gap ([00_design_principles.md](./00_design_principles.md#the-problem-it-exists-to-solve) — no home between an unstructured note and a scoped execution plan) — a visitor recognizes *a* feeling, not *the* gap Hypora is actually built for. | Beat 1 (Recognition), only partially reached |
| **Relief (beat 2) never occurs.** Nothing shows or explains the one-question-at-a-time mechanism, so a visitor has no basis to feel reassured that they don't need prior framework knowledge. | Beat 2 (Relief) — entirely absent |
| **Ownership (beat 3) never occurs.** No copy states that the plan is authored by the founder, not generated for them — a meaningful omission specifically because it is the fact most likely to correct the chatbot misconception. | Beat 3 (Ownership) — entirely absent |
| **Honest confidence (beat 4) never occurs.** Validation is mentioned as a value-card bullet ("validate before you build") but never explained as founder-judged rather than automated. | Beat 4 (Honest confidence) — entirely absent |
| **Proportionate action (beat 5) is asserted implicitly but never stated.** The CTA exists, but nothing tells a hesitant visitor what starting actually costs (no account, LocalStorage-only, per [Product Scope](../../context/02_product_scope.md#product-scope-v1)) — a true, favorable, and currently unstated fact. | Beat 5 (Proportionate action) |

### Against Information Architecture and Conversion Principles

| Gap | Principle not yet met |
|---|---|
| **Section order does not mirror Hypora's own thinking order.** Home is Hero + three parallel value statements; Features and Roadmap are separate, un-sequenced routes a visitor may never reach. There is no gap → mechanism → structuring → validation → roadmap → entry-point progression anywhere. | Information Architecture Principle 9 |
| **A visitor who converts from Hero alone has been shown nothing but a headline and three one-line claims.** Every fact needed to reach the Part 1 mental model (mechanism, honesty of validation, founder authorship, true cost of starting) sits, if anywhere, only on Features/Roadmap — pages the Hero's CTA routes past entirely. | Information Architecture Principle 10 (every section earns its place — currently, several *necessary* sections don't exist at all) |
| **Only one CTA, one commitment level, everywhere.** No lower-commitment path (e.g., understanding the roadmap) is surfaced within the conversion narrative itself. | Conversion Principle 16 |
| **No objection-reduction copy anywhere**, despite Hypora having unusually strong, true, currently-available facts to offer (no account, no signup, works fully offline-of-backend). | Conversion Principle 15 |

### Against "What the Landing Must Never Communicate" — a check for existing violations, not just omissions

None of the current copy affirmatively claims Hypora generates plans, verifies validation automatically, or serves teams — there is no active misstatement today. The risk is entirely one of *omission* (the misconceptions are never corrected), not commission. This matters for prioritization: the fix is additive (state what's true), not corrective (retract what's false).

## Summary

Hypora's Landing is not under-engineered on the mechanisms that matter most for its own roadmap (localization, experimentation, Design System discipline) — it is under-built on **teaching its own mental model**. The current Home states a frustration and three value claims, then asks for commitment immediately — without ever showing the mechanism that makes Hypora different, without distinguishing structuring from validation, without correcting the single most likely misconception a visitor arrives with, and without stating the true, low cost of starting. [03_improvement_plan.md](./03_improvement_plan.md) proposes a narrative built to close exactly these gaps, each justified by [00_design_principles.md](./00_design_principles.md) first.
