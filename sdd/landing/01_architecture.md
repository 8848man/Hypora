# Landing Architecture

**Refs:** → [00_index](./00_index.md) · [Product Vision](../context/01_product_vision.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [Landing Experiment Strategy](../context/07_landing_experiment_strategy.md) · [02_information_architecture](./02_information_architecture.md) · [Design Principles](./improvement/00_design_principles.md) · [Target IA](./planning/04_target_information_architecture.md) · [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md)

## Provenance

Real Landing code already existed before this directory was created (`app/src/pages/landing/*`, first committed 2026-07-14 or earlier — see [00_index](./00_index.md)'s Provenance section). This document does not describe that existing implementation as the target — it describes the **validated design direction** that emerged from a planning pass (Sentinel-informed but Hypora-philosophy-driven improvement analysis → a finalized target information architecture → three narrative-strategy prototypes → a shared motion system), which the existing implementation has not yet been updated to match. [07_implementation_plan.md](./07_implementation_plan.md) is where that gap is tracked; this document states the target, not the delta.

## Purpose

*(Explicit, by reference)* — Landing is Hypora's marketing website: the public, unauthenticated Application a visitor reaches before ever opening the Workspace (see [Product Vision](../context/01_product_vision.md) and [Application Responsibilities](../context/05_application_responsibilities.md)). This document does not restate *why* Hypora exists or what Landing is *for* at the product level — see Product Vision/Positioning and [Application Responsibilities](../context/05_application_responsibilities.md#landing) for that. It defines what the Landing Application itself is built to do and how.

## Responsibilities

**In scope for Landing** *(Explicit, per [Application Responsibilities](../context/05_application_responsibilities.md#landing), unchanged by this promotion)*:
- Product introduction
- Core value proposition
- Feature showcase
- Roadmap
- Future AI vision
- Call-to-action

**Explicitly NOT part of Landing** *(Explicit, unchanged)*:
- Workspace logic of any kind — no concept of a "project," no persistence, no calls to Platform API beyond what a static marketing site needs.
- Business logic or Feature-specific copy inside any composed component — enforced by the [Design System](../design-system/01_design_system.md)'s Shared Component Boundaries and restated for Landing's own composed components in [03_component_model.md](./03_component_model.md).
- A second localization mechanism — Landing consumes the same [Localization Layer](../frontend/01_architecture.md#localization-layer) and Korean-first principle ([ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md)) Workspace does.

## Final Design Direction (Shared Across All Variants)

**There is no single "winning" concept among A/B/C.** This is a deliberate resolution, not an oversight: [Landing Experiment Strategy](../context/07_landing_experiment_strategy.md) — already canonical, unchanged by this promotion — establishes that Concepts A (Problem Empathy), B (Loss Aversion), and C (Execution Confidence) are **production content variants of one structural page**, not competing designs where one is selected and the other two discarded. That document's own Non-Goals are explicit: "every structural and presentational element... is identical across every variant. Only what the copy says differs."

What "final design direction selected" means, precisely, for this promotion:

| Layer | Status |
|---|---|
| Section count, order, and structure | **Finalized.** The 7-section sequence in [02_information_architecture.md](./02_information_architecture.md) (originally validated as [Target IA](./planning/04_target_information_architecture.md)) is now the single structural target — identical regardless of which A/B/C variant a visitor sees. |
| Component inventory | **Finalized.** See [03_component_model.md](./03_component_model.md) — structurally identical across variants, per the same rule. |
| Motion system | **Finalized as a single production configuration**, not per-concept — see [06_motion_system.md](./06_motion_system.md) for why the prototype phase's per-concept motion tuning could not be promoted as-is, and how it was resolved. |
| Narrative copy (headlines, CTA labels, section framing) | **Still three variants**, resolved per visitor exactly as [Landing Experiment Strategy](../context/07_landing_experiment_strategy.md) already specifies — this promotion does not touch that mechanism. |

This resolution required no new product decision — it follows directly from re-reading [Landing Experiment Strategy](../context/07_landing_experiment_strategy.md) alongside the prototype phase's three concept files, which (correctly, for prototype-stage visual comparison) varied motion pacing per concept in a way production must not carry forward. See [06_motion_system.md](./06_motion_system.md)'s Relationship to the Landing Experiment Strategy section for the full account.

## Visitor Journey

Owned in full by [02_information_architecture.md](./02_information_architecture.md) — this document does not restate the seven-beat sequence (Hero → The Gap → How Hypora Thinks → Structuring vs. Validating → What Hypora Is Not → Vision → Closing) or the emotional-journey mapping behind it, both already fully specified there and in [Design Principles](./improvement/00_design_principles.md#emotional-journey).

## CTA Strategy

Two commitment tiers, unchanged from [planning/04_target_information_architecture.md](./planning/04_target_information_architecture.md#conversion-strategy):
- **Primary** — "start a project," surfaced at Hero (for an already-convinced visitor) and Closing (for a visitor the narrative just convinced). Both instances are the same CTA, not two different asks.
- **Secondary, lower-commitment** — a link to the Vision section, for a visitor not yet ready to start.

No third, human-contact tier exists — [03_improvement_plan.md](./improvement/03_improvement_plan.md#sections-removed-or-not-proposed-and-why)'s reasoning (V1 is fully self-serve, no-account) still holds and is not re-litigated here. CTA copy itself varies per A/B/C content variant; CTA *placement and count* does not — per the same structural-invariance rule as every other layer above.

## Design Constraints

- **No fabricated urgency, ever, regardless of variant** — a permanent rule, not a per-concept choice; see [06_motion_system.md](./06_motion_system.md#cta-motion) for its motion-layer enforcement and [Design Principles](./improvement/00_design_principles.md#what-the-landing-must-never-communicate) for its content-layer origin.
- **Every visible string is Korean-first, dual-localized, and variant-resolved** — composes the existing [Localization Layer](../frontend/01_architecture.md#localization-layer) and [Landing Experiment Strategy](../context/07_landing_experiment_strategy.md#content-model--composes-with-the-existing-localization-layer)'s `(contentKey, variant, language)` resolution; Landing introduces no second mechanism.
- **No component contains business logic or a persistence call** — restates [Design System](../design-system/01_design_system.md)'s Shared Component Boundaries; see [03_component_model.md](./03_component_model.md) for how this is enforced specifically for the two new Landing-owned components that simulate Workspace's guided-question mechanism without ever touching real Workspace state.

## Navigation Strategy

Owned by [02_information_architecture.md](./02_information_architecture.md#route-model) — Home is a single continuous scroll; Features remains a separate, directly-linkable deep page for a convinced visitor who wants more detail. Roadmap no longer exists as a route — see [02_information_architecture.md](./02_information_architecture.md#route-model) for why.
