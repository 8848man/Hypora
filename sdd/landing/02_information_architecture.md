# Landing Information Architecture

**Refs:** → [00_index](./00_index.md) · [01_architecture](./01_architecture.md) · [Information Architecture (Product-Level)](../context/04_information_architecture.md) · [Frontend Architecture](../frontend/01_architecture.md#react-router-structure) · [Target IA](./planning/04_target_information_architecture.md) · [Concept Comparison](./planning/05_landing_concept_comparison.md)

**Relocation note:** Landing's own screen inventory and section structure moved here from [`context/04_information_architecture.md`](../context/04_information_architecture.md) as of 2026-07-17, mirroring the exact relocation already performed for Workspace when it was promoted. That document retains only the product-level tree (for orientation across all three Applications) and the cross-Application navigation rule; this document is now the canonical, detailed source for everything below.

## Section Sequence (Home)

Finalized from [planning/04_target_information_architecture.md](./planning/04_target_information_architecture.md), unchanged by this promotion — that document's full per-section Purpose / Core Message / User Questions / Transition / Success Criteria remains the authoritative detail; this document restates only the sequence and route model, not each section's own specification.

```
1. Hero                     — the promise and the specific gap, together
2. The Gap                  — recognition: the structural gap Hypora fills
3. How Hypora Thinks         — relief: the guided-question mechanism, demonstrated
4. Structuring vs. Validating — ownership + honest confidence: authorship vs. self-judged validation
5. What Hypora Is Not         — correction: misconceptions closed before the ask
6. Vision                      — trust: where Hypora is headed, as direction, never a roadmap
7. Closing / Entry Point        — proportionate action: a true, low-cost next step
```

**Section 6 was Today vs. Tomorrow through the promotion pass above; it is Vision as of this revision.** The prior section presented a V1-vs-V2–V5 roadmap-style split; product direction determined Landing should no longer present a product roadmap in any form (see Route Model below) — Vision replaces it in the same narrative slot, with a different job: communicating Hypora's long-term direction as trust-building, not as version-by-version commitments. See [Vision Section Specification](#vision-section-specification) below.

No other section is added, removed, merged, or reordered. Content within each section varies per the A/B/C storytelling experiment ([Landing Experiment Strategy](../context/07_landing_experiment_strategy.md)); this sequence does not.

## Vision Section Specification

**Purpose:** Build trust in Hypora's long-term direction without presenting a roadmap, a version table, or feature commitments — the section [Application Responsibilities](../context/05_application_responsibilities.md#landing)'s "Future AI vision" responsibility is realized through, now that "Roadmap" is no longer a Landing responsibility (see that document).

**Core Message:** Hypora grows with the founder — from structured thinking today into a collaborator that helps carry a validated plan into confident execution — without ever taking the founder's own judgment out of the loop.

**User Questions Answered:**
- Where is this going, beyond what exists today?
- Will Hypora still be useful once I'm past the idea stage?
- Does my judgment keep mattering as the product grows?

**Required Components:** A section context label, a headline, one or two supporting sentences, and an optional short set of 2–3 short thematic statements (not a numbered stage list, not a stepper) — composed from existing primitives only; no new Landing-owned component, per [03_component_model.md](./03_component_model.md).

**Explicitly excluded, permanently:** version numbers, stage names (V1–V5), feature checklists, release timelines, "coming soon" language, and any sequential/stepped visual presentation — these are what made the prior Today vs. Tomorrow section a roadmap, and their absence is what makes Vision not one.

**Transition:** Follows What Hypora Is Not (misconceptions now closed) and precedes Closing — Vision is the last belief a visitor needs before the proportionate ask, reinforcing trust and direction immediately before, not instead of, the CTA.

**Success Criteria:** A visitor can state Hypora's long-term direction in their own words, without being able to name a version number or a specific future feature.

## Route Model

| Route | Content | Status |
|---|---|---|
| `/` (Home) | The full 7-section sequence above, one continuous scroll | Primary narrative — every visitor's default entry point |
| `/features` | Per-Feature depth (existing five V1 Features, name + variant-resolved description) | Optional deep page — reachable from Home, not required to reach the Part 1 mental model ([Design Principles](./improvement/00_design_principles.md#part-1--hyporas-product-philosophy)) |
| `/app` | Entry point into the Workspace | Not a Landing screen — the CTA's destination, owned by Workspace |

**`/roadmap` was removed.** Landing no longer presents a product roadmap in any form — neither as a dedicated deep page nor as Home's former Section 6. This is a deliberate scope narrowing, not an oversight: [Application Responsibilities](../context/05_application_responsibilities.md#landing) no longer lists "Roadmap" among Landing's responsibilities.

## Route Model

| Route | Content | Status |
|---|---|---|
| `/` (Home) | The full 7-section sequence above, one continuous scroll | Primary narrative — every visitor's default entry point |
| `/features` | Per-Feature depth (existing five V1 Features, name + variant-resolved description) | Optional deep page — reachable from Home, not required to reach the Part 1 mental model ([Design Principles](./improvement/00_design_principles.md#part-1--hyporas-product-philosophy)) |
| `/roadmap` | The full V1–V5 stage table (Section 6 of Home shows only the Today/Tomorrow split, not every stage in detail) | Optional deep page — same status as Features |
| `/app` | Entry point into the Workspace | Not a Landing screen — the CTA's destination, owned by Workspace |

Features remains a separate, directly-linkable route (preserving shareability and the existing A/B/C experiment's per-route content resolution — see [Improvement 8](./improvement/03_improvement_plan.md#improvement-8--resolve-not-merely-flag-the-featuresroadmap-route-question-keep-as-an-optional-deeper-page-not-a-required-narrative-beat) for the historical reasoning, made when Roadmap was still a second deep page alongside it), while Home's own narrative no longer depends on a visitor reaching it.

## Navigation Model

**Cross-Application** (Landing ↔ Workspace) — owned by [Information Architecture (Product-Level)](../context/04_information_architecture.md#navigation-model-cross-application); this document does not restate the one-directional entry-point rule.

**Within Landing:**
- A persistent header (logo, in-page nav, language switcher, primary CTA) is present on every Landing route — not part of Home's own 7-section narrative flow, but a permanent overlay, consistent with how the prototype phase's `header.site` behaved. The header's in-page navigation no longer includes a Roadmap item.
- Home's in-page anchor links (e.g., Hero's secondary link) scroll to Section 6 (Vision) rather than to a roadmap — the anchor target changed with the section it points to, per [planning/04_target_information_architecture.md](./planning/04_target_information_architecture.md#conversion-strategy)'s secondary-CTA design, which this still follows in shape, not in destination.
- Features carries its own CTA (unlike the pre-promotion implementation, where it was a dead end — see [02_hypora_current_analysis.md](./improvement/02_hypora_current_analysis.md#missing-conversion-opportunities)) — a visitor who navigates there and decides to convert is never forced back to Home first.

## Information Hierarchy and Learning Sequence

Owned by [planning/04_target_information_architecture.md](./planning/04_target_information_architecture.md#information-hierarchy) and its Visitor Learning Sequence table — both fully finalized and unchanged by this promotion; referenced rather than restated here to avoid the exact duplication [Spec Authoring Rules](../rules/spec_authoring_rules.md#duplication-rule--reference-dont-copy) prohibits.

## What This Document Does Not Cover

- Which visual component realizes each section — owned by [03_component_model.md](./03_component_model.md).
- Motion/entrance behavior per section — owned by [06_motion_system.md](./06_motion_system.md).
- The A/B/C content-resolution mechanism itself — owned by [Landing Experiment Strategy](../context/07_landing_experiment_strategy.md); this document only states that section structure is invariant under it.
