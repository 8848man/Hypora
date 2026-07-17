# Landing Concept Comparison — Three Communication Strategies

**Refs:** → [00_index](../../00_index.md) · [00_design_principles](../improvement/00_design_principles.md) · [04_target_information_architecture](./04_target_information_architecture.md) · [Landing Experiment Strategy](../../context/07_landing_experiment_strategy.md)

## What This Document Is — and Is Not

This is **not** a new Information Architecture. The section sequence, count, and order are fixed by [04_target_information_architecture.md](./04_target_information_architecture.md) (Hero → The Gap → How Hypora Thinks → Structuring vs. Validating → What Hypora Is Not → Today vs. Tomorrow → Closing) and are identical across all three concepts below — no section is added, removed, merged, or reordered per concept.

What varies is **communication strategy only**: the tone, emphasis, and framing used to deliver each section's already-fixed Core Message and Purpose. This is the same content-only variation dimension [Landing Experiment Strategy](../../context/07_landing_experiment_strategy.md) already governs for Hypora's production A/B/C storytelling experiment — this document applies that same strategy definition to the target IA finalized in [04_target_information_architecture.md](./04_target_information_architecture.md), for stakeholder visual comparison ahead of promotion. It does not introduce a fourth strategy or modify the three already named there.

## The Three Strategies (Source: Landing Experiment Strategy)

| Concept | Strategy | Framing |
|---|---|---|
| **A** | Problem Empathy | "You have ideas but don't know how to start." |
| **B** | Loss Aversion | "Ideas disappear if they never become execution." |
| **C** | Execution Confidence | "Execution matters more than ideas." |

## Per-Section Strategy Mapping

Each row states how the same section's fixed Core Message ([04_target_information_architecture.md](./04_target_information_architecture.md)) is framed differently per concept — never a different claim, only a different emotional entry point into the identical claim.

### Section 1 — Hero

| Concept | Framing angle |
|---|---|
| A | Names the visitor's stuck feeling directly and gently — "you have the idea, you're just not sure where to begin" |
| B | Opens with what's at stake if nothing happens — an idea that stays unstructured doesn't just wait, it fades |
| C | Opens with a confident claim about execution over ideation — momentum starts now |

### Section 2 — The Gap

| Concept | Framing angle |
|---|---|
| A | Sympathetic — describes the in-between space as somewhere many people quietly get stuck, without judgment |
| B | Time-pressure — frames the gap as actively costing something every day it stays unstructured |
| C | Decisive contrast — frames the gap as the difference between people who only think and people who act |

### Section 3 — How Hypora Thinks

| Concept | Framing angle |
|---|---|
| A | Reassuring — "you don't have to figure this out alone; just answer one thing at a time" |
| B | Efficient urgency — "five focused questions are enough; don't let more time pass before capturing structure" |
| C | Momentum — "the moment you answer, your idea becomes something executable" |

### Section 4 — Structuring vs. Validating

| Concept | Framing angle |
|---|---|
| A | Supportive ownership — structuring and judging are yours, but never done in isolation |
| B | Risk-avoidance — an unchecked assumption is a bigger loss later; validate before that happens |
| C | Forward motion — structuring is the starting line, validating is what clears the way to execution |

### Section 5 — What Hypora Is Not

| Concept | Framing angle |
|---|---|
| A | Gentle disambiguation — "it's easy to confuse this with tools you already use; here's why it's different, no pressure" |
| B | Consequence-based — other tool categories leave the exact gap open that costs you your idea |
| C | Sharp contrast — if you want real execution, these adjacent categories aren't built for that |

### Section 6 — Today vs. Tomorrow

| Concept | Framing angle |
|---|---|
| A | Honest and calm — today is manual and human-led, tomorrow adds AI assistance, no overpromising |
| B | Don't-wait framing — don't hold off structuring your idea while waiting for a future AI; the risk is now |
| C | Confident trajectory — start executing today, and future AI only adds speed to what you're already doing |

### Section 7 — Closing

| Concept | Framing angle |
|---|---|
| A | Gentle invitation — "start small, one step at a time" |
| B | Urgency without fabricated scarcity — act before the idea fades, grounded in the real cost of inaction, never a countdown timer or fake stock counter |
| C | Confident call to action — "start executing now" |

## What Must Stay Identical Across All Three (Non-Negotiable)

Per [Landing Experiment Strategy](../../context/07_landing_experiment_strategy.md#non-goals) and [04_target_information_architecture.md](./04_target_information_architecture.md), unchanged regardless of concept:

- Section count, order, and Purpose/Core Message/Success Criteria as specified in [04_target_information_architecture.md](./04_target_information_architecture.md)
- Every fact stated (V1 has no AI, validation is founder-judged, no account required, the honest V2–V5 roadmap) — strategy changes *emphasis*, never *truth*
- Visual identity: color palette, typography, spacing system, button style, overall component shapes (per this task's own Visual Identity requirement)
- No concept introduces urgency via a fabricated mechanism (countdown, fake scarcity, invented stats) — per [00_design_principles.md](../improvement/00_design_principles.md#what-the-landing-must-never-communicate), even Concept B's loss-aversion framing must stay grounded in a real, already-established cost (structure not captured, momentum not started) rather than an invented one

## Deliverables

Three standalone HTML prototypes, one per concept, built directly from this mapping and [04_target_information_architecture.md](./04_target_information_architecture.md)'s section specs — `planning/prototype/concept_a.html`, `concept_b.html`, `concept_c.html` (repo root, disposable, not part of `sdd/`, per `planning/README.md`). All copy is authored in Korean, since these are stakeholder-facing visual comparison artifacts, not a claim about final localized resource content — production copy authoring still follows [ADR-0005](../../architecture/decisions/ADR-0005-korean-first-localization-architecture.md)'s Korean-first, dual-localized process independently of this disposable exercise.
