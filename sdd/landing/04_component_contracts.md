# Landing Component Contracts

**Refs:** → [00_index](./00_index.md) · [03_component_model](./03_component_model.md) · [05_design_system](./05_design_system.md) · [Design System](../design-system/01_design_system.md#localization-requirements) · [Landing Experiment Strategy](../context/07_landing_experiment_strategy.md) · [06_motion_system](./06_motion_system.md)

Conceptual contracts only — purpose, content requirements, states, and non-goals. No props signatures, file names, or markup, per this task's specification-only scope. Each contract applies the same discipline [Design System](../design-system/01_design_system.md)'s own primitives already follow: a component receives content and emits interaction events; it never owns business meaning, business logic, or a persistence call.

## Contrast Panel

**Purpose:** Present N related items (2 or 3) side by side for visual comparison, with an optional single item visually emphasized as "the resolution." Realizes The Gap's three-way comparison and Structuring vs. Validating's two-way comparison as one shared shape.

**Content it receives** (all already-resolved, per the Localization Requirements below):
- An ordered list of 2–3 items, each with a short label and a description
- Optionally, which item (if any) is "emphasized"
- Optionally, a nested content slot for one item (used by Structuring vs. Validating to place the two validation-check rows inside the "Validating" item)

**States:**
- Default (pre-entrance) and revealed (post-entrance) — motion-driven, per [06_motion_system.md](./06_motion_system.md); the component itself holds no animation logic, only the hook points (see that document's Motion Utilities).
- No interactive/hover state of its own — Contrast Panel is not clickable; any CTA inside its content slot is an ordinary Button, not a Contrast Panel behavior.

**Non-goals:**
- Never decides *which* items are shown or which is emphasized — that's content supplied by the composing section, per [02_information_architecture.md](./02_information_architecture.md).
- Never contains the pulse-emphasis timing itself — only exposes that one item is "emphasized"; [06_motion_system.md](./06_motion_system.md) owns the actual motion.

## Guided Question Preview

**Purpose:** Demonstrate the shape of Hypora's real guided-question mechanism (one question, a set of answer options, a chosen answer, a confirmation) for the "How Hypora Thinks" section — a **marketing simulation**, never a live instance of the real guided flow.

**Content it receives:**
- One example question's text
- A small set of example answer chips, with exactly one marked as the chosen answer
- A confirmation label (e.g., "Saved to your Canvas → [field name]")
- A progress indicator value (e.g., "Question 3 of 5") — a static display value, not a real progress state

**States:**
- Default (pre-entrance), and a one-shot "highlighted" state on the chosen chip, followed by the confirmation appearing — both motion-driven per [06_motion_system.md](./06_motion_system.md#section-3--how-hypora-thinks), never replayed after first trigger.

**Non-goals (explicit, enforcing [01_architecture.md](./01_architecture.md#responsibilities)'s "no Workspace logic" boundary):**
- **Never reads or writes real Workspace/Project state.** Every value it displays is Landing-owned example content, supplied the same way any other Landing copy is (variant-resolved, localized) — never a live query against a Project, a real Question Model instance, or Platform API.
- **Never reuses Workspace's actual guided-flow component.** Even though the visual shape is inspired by the real mechanism, this is a distinct, Landing-owned component — sharing implementation with Workspace's real guided flow would violate the Landing/Workspace separation [Frontend Architecture](../frontend/01_architecture.md#feature-boundaries) and [Application Responsibilities](../context/05_application_responsibilities.md#landing) both establish.
- Never implies real-time interactivity — a visitor cannot actually answer the example question; it is a demonstration, not a functioning form.

## Comparison Table

**Purpose:** Present a fixed list of label + description rows for rapid disambiguation — realizes "What Hypora Is Not."

**Content it receives:**
- An ordered list of rows, each with a short label and a one-line description

**States:**
- Default (pre-entrance) and revealed (post-entrance), via the fast-stagger motion pattern in [06_motion_system.md](./06_motion_system.md#section-5--what-hypora-is-not) — the lightest-touch motion treatment on the page, per that document's own reasoning.

**Non-goals:**
- Never more than a label + one-line description per row — if a future need requires richer per-row content, that is a new component decision, not an extension of this one's contract (per [Frontend Architecture](../frontend/01_architecture.md#component-ownership)'s promotion rule, applied in reverse: don't grow a component past the single need that justified it).

## Localization Requirements (All Three Components)

Restates [Design System](../design-system/01_design_system.md#localization-requirements)'s existing component-level contract, applied to these three specifically — not a new rule:

- No component hardcodes any label, description, question text, or chip text — every string is supplied as data, sourced from the Localization Layer and resolved per the current `(contentKey, variant, language)` tuple ([Landing Experiment Strategy](../context/07_landing_experiment_strategy.md#content-model--composes-with-the-existing-localization-layer)).
- All three must render correctly with both Korean and English content, including Korean's typically more compact line-wrapping — the prototype phase's Korean-only copy was a disposable-artifact simplification, not a precedent; see [07_implementation_plan.md](./07_implementation_plan.md) for the localization gap this creates.
- Comparison Table's fixed-width label column (200px in the prototype) is a genuine space constraint per [Design System](../design-system/01_design_system.md#localization-requirements)'s truncation-rule requirement — flagged as an open implementation decision (wrap vs. reflow) in [07_implementation_plan.md](./07_implementation_plan.md), not resolved here.

## Accessibility Non-Goals (Deferred, Not Solved Here)

None of the three contracts above specify focus order, ARIA roles, or screen-reader behavior — this is a deliberate deferral to [07_implementation_plan.md](./07_implementation_plan.md)'s Phase 5, not an oversight. Per this task's own instruction ("do not implement"), a real accessibility contract requires implementation-level decisions (semantic HTML choices, focus management) out of scope for a conceptual contract document.
