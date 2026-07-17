# Landing Animation Plan

**Refs:** → [00_index](../../00_index.md) · [00_design_principles](../improvement/00_design_principles.md) · [04_target_information_architecture](./04_target_information_architecture.md) · [05_landing_concept_comparison](./05_landing_concept_comparison.md)

## Scope and Status

**Planning artifact, not an implementation spec.** This document plans motion for the seven sections already fixed by [04_target_information_architecture.md](./04_target_information_architecture.md) — no section, narrative beat, or copy changes as a result of this pass. Motion is applied to the three existing disposable prototypes (`planning/prototype/concept_a.html`/`concept_b.html`/`concept_c.html`) as an enhancement, not a rebuild.

**On the task's own "Concept A/B/C" motion examples:** the task prompt illustrated per-concept motion differentiation using generic example labels ("Philosophy First," "Problem First," "Product First") explicitly marked as examples only. Hypora's three concepts are already named and defined in [05_landing_concept_comparison.md](./05_landing_concept_comparison.md) — **A = Problem Empathy (공감형), B = Loss Aversion (손실회피형), C = Execution Confidence (실행자신감형)**. This plan applies the requested *pattern* (each concept's motion reinforces its own narrative identity) to Hypora's actual concepts, not the example labels — no renaming occurred.

## Guiding Test (Applied to Every Row Below)

Per the task's Animation Philosophy, every animation in this plan was checked against: *what deserves attention first, what to read next, how the eye should move, what's interactive, what belongs together, or which action matters most.* An animation idea that answered none of these was cut before being added to the tables below — see the Self-Review at the end for two ideas that were considered and rejected on exactly this test.

---

## Section 1 — Hero

**Communication Goal:** The visitor's eye should land on the context label, then the headline, then the CTA, in that order — the same fixed reading order [04_target_information_architecture.md](./04_target_information_architecture.md) already specifies.

**Animation Goal:** Reinforce that reading order automatically, and make the CTA the visual "arrival point" of the page's very first moment.

**Trigger:** Initial page load.

**Animation Type:** Staggered fade + upward slide, one element at a time (eyebrow → headline → lede → CTA row).

**Duration:** ~500–700ms per element (concept-tuned, see Per-Concept Tuning).

**Easing:** Decelerating ("ease-out" character) — motion arrives and settles, never overshoots.

**Expected User Effect:** The visitor doesn't have to decide what to read first; the page decides for them, silently, in under a second.

**Priority:** Essential.

---

## Section 2 — The Gap

**Communication Goal:** The three cards should read as one connected argument (note tool / project tool / the gap between them), with the third card landing as the resolution, not just a third identical item.

**Animation Goal:** Reveal the three cards in reading order as the section enters view; give the third (Hypora) card a slightly more pronounced entrance so it reads as the answer, not a peer.

**Trigger:** Scroll into viewport (plays once).

**Animation Type:** Stagger reveal (fade + slide-up) left to right; the callout card's entrance includes a brief border/glow emphasis on top of the same fade+slide.

**Duration:** ~450ms per card, ~120ms stagger gap; callout emphasis ~600ms.

**Easing:** Decelerating.

**Expected User Effect:** The visitor experiences "note tool, project tool... and here's what's missing" as a small sequence, not three static facts read in arbitrary order.

**Priority:** Recommended.

---

## Section 3 — How Hypora Thinks

**Communication Goal:** The visitor must perceive this as a real, working mechanism — not a screenshot — since this section exists specifically to correct the "chatbot" and "blank template" misconceptions ([00_design_principles.md](../improvement/00_design_principles.md#the-misconception-people-are-likely-to-have)).

**Animation Goal:** Let the visitor watch the mechanism happen once: the question card settles in, then the already-selected answer chip visibly highlights, then the "saved" confirmation appears — cause before effect, in view.

**Trigger:** Scroll into viewport (plays once).

**Animation Type:** Reveal (fade+slide) for the question card, followed by a micro-interaction (chip highlight: color/border transition) after a short delay, followed by a second reveal (fade+slide) for the result confirmation.

**Duration:** Card reveal ~450ms; chip highlight ~300ms (starts after card settles); result reveal ~400ms (starts after chip highlight).

**Easing:** Decelerating for reveals; a slightly firmer, more deliberate easing for the chip highlight itself (this is the one "decision" moment in the sequence).

**Expected User Effect:** The mechanism is demonstrated, not described — directly reinforces Section 3's differentiation job from [04_target_information_architecture.md](./04_target_information_architecture.md).

**Priority:** Essential — this section carries the most misconception-correcting weight of any section, per [02_hypora_current_analysis.md](../improvement/02_hypora_current_analysis.md).

---

## Section 4 — Structuring vs. Validating

**Communication Goal:** Structuring and Validating must read as two distinct, equally-weighted processes — and the validation checklist specifically must read as being marked one honest judgment at a time, never delivered pre-completed.

**Animation Goal:** Reveal both panels together (parallel, not staggered — they're equal partners, not sequential steps), then reveal the two validation-check rows one at a time within the Validating panel.

**Trigger:** Scroll into viewport (plays once).

**Animation Type:** Simultaneous fade+slide for both panels; sequential fade+scale-in for the two `sv-check` rows.

**Duration:** Panel entrance ~450ms; each check row ~300ms, ~350ms apart.

**Easing:** Decelerating.

**Expected User Effect:** The visitor watches "honestly marked, one at a time" happen, rather than reading a claim about it — motion embodies the section's actual core message rather than merely decorating it.

**Priority:** Essential — the section exists specifically to correct the "validation is automated/complete" misconception ([00_design_principles.md](../improvement/00_design_principles.md#misconceptions-the-landing-must-correct)); a pre-completed-looking checklist would visually contradict its own copy.

---

## Section 5 — What Hypora Is Not

**Communication Goal:** Fast, confident disambiguation — a visitor should be able to scan all four rows quickly, without the section slowing down a visitor who already understands the point.

**Animation Goal:** A light sequential reveal of the four rows, fast enough to stay out of the way — this section's job is quick scanning, not a slow reveal.

**Trigger:** Scroll into viewport (plays once).

**Animation Type:** Fast stagger fade (no slide — minimal movement) across the four rows.

**Duration:** ~300ms per row, ~70ms stagger — deliberately the fastest rhythm on the page.

**Easing:** Decelerating.

**Expected User Effect:** Rows still land in top-to-bottom reading order, but the section doesn't feel like a "big reveal moment" the way Sections 3–4 do — appropriately, since its job is correction, not persuasion.

**Priority:** Optional — see Self-Review; this is the first candidate cut if it doesn't earn its keep against a real prototype.

---

## Section 6 — Today vs. Tomorrow

**Communication Goal:** Today and Tomorrow must read as clearly separate, sequential time states — never as two interchangeable side-by-side options, per [04_target_information_architecture.md](./04_target_information_architecture.md)'s "never blurred" requirement.

**Animation Goal:** Reveal the Today card first, then the Tomorrow card after a deliberately longer pause than a normal stagger gap — motion itself communicates "this comes first, chronologically; this comes after."

**Trigger:** Scroll into viewport (plays once).

**Animation Type:** Sequential fade+slide, Today then Tomorrow, with an intentionally larger gap between the two than any other stagger on the page.

**Duration:** ~450ms each; gap ~300–400ms (vs. ~70–150ms elsewhere).

**Easing:** Decelerating.

**Expected User Effect:** The manual-today / assisted-tomorrow honesty commitment is felt as a temporal fact, not just stated as one.

**Priority:** Recommended.

---

## Section 7 — Closing

**Communication Goal:** The primary CTA must read as the single most important interactive element on the page at this point — earned by everything already read, never manufactured.

**Animation Goal:** A calm entrance for the heading/lede/CTA block, plus a subtle, interaction-only (never auto-looping) emphasis on the CTA itself.

**Trigger:** Scroll into viewport for the entrance; hover/focus (visitor-initiated only) for CTA emphasis.

**Animation Type:** Fade+slide-up entrance for the block; gentle elevation (small lift + soft shadow) on the primary CTA on hover/focus.

**Duration:** Entrance ~500ms; hover transition ~180ms.

**Easing:** Decelerating for entrance; standard ease for hover.

**Expected User Effect:** The CTA feels like the natural next step the whole page has been building to — inviting, never pressuring.

**Priority:** Essential.

**Explicitly rejected for this section:** any auto-playing, looping, or pulsing CTA emphasis. Per [00_design_principles.md](../improvement/00_design_principles.md#what-the-landing-must-never-communicate) and [05_landing_concept_comparison.md](./05_landing_concept_comparison.md)'s guardrail against fabricated urgency, a self-animating "act now" pulse would manufacture urgency Hypora's actual facts don't support — this applies to all three concepts equally, including B (Loss Aversion), where the temptation to add exactly this kind of device is highest and exactly where it's most important to resist.

---

## Structural Chrome (Not Section-Specific)

| Element | Communication Goal | Animation | Trigger | Priority |
|---|---|---|---|---|
| Sticky header | Signal a persistent path back to the CTA without demanding attention while reading | Background/blur/border fade-in transition (~200ms) | Scroll past ~10px | Recommended |
| In-page anchor links (roadmap link → Section 6) | Reinforce that clicking moves the visitor within one continuous page, not to a new page | Smooth scroll | Click | Recommended |

---

## Global Motion Principles

- **Motion rhythm:** every scroll-triggered animation plays once per page load, the first time its section enters the viewport — never replays on re-scroll. Repeated motion on every scroll would read as a glitch, not a signal, and would violate the bounded-cognitive-load principle already governing this Landing ([00_design_principles.md](../improvement/00_design_principles.md#information-architecture-principles)).
- **Entrance timing:** no single element's entrance exceeds ~700ms; most sit in the 300–500ms range. Motion should never be the slowest thing on the page — the reading, not the animation, sets the pace.
- **Scroll rhythm:** one animated "beat" per section (a stagger group, a sequential pair, or a single reveal) — never more than one distinct animated idea competing for attention within a single section.
- **Hover behavior:** interactive elements get a small, consistent elevation/opacity shift (~150–200ms) on hover/focus. No hover transform is large enough to shift surrounding layout.
- **CTA emphasis:** the primary CTA always receives the *calmest* motion treatment on the page — visitor-initiated (hover/focus) only, never auto-playing. This is a deliberate, permanent rule, not a per-concept variable — see Section 7's explicit rejection above.
- **Reduced motion:** every animation is gated behind a single `prefers-reduced-motion: reduce` check. When set, all entrance/stagger/reveal animation is skipped — content renders immediately at its final state — and hover elevation is limited to color/opacity only (no transform). This is treated as a core motion-language decision made in this plan, not an accessibility add-on bolted on after the fact, even though broader accessibility polish otherwise remains out of scope for this prototype per the prior planning phase.

## Per-Concept Motion Tuning

Only timing values (duration, stagger gap, easing character) differ per concept — never animation type, trigger, or which elements animate. This keeps the three prototypes visually comparable (per the prior task's Visual Identity requirement) while letting pacing alone carry each concept's identity.

| Concept | Rhythm character | Duration | Stagger gap | Easing character |
|---|---|---|---|---|
| **A — Problem Empathy (공감형)** | Calm, unhurried, reflective — matches the concept's gentle, reassuring tone | Longest (~600–700ms) | Widest (~150ms) | Soft deceleration, low initial velocity |
| **B — Loss Aversion (손실회피형)** | Tighter, more energetic — communicates momentum through pacing, never through a fabricated urgency device | Shorter (~350–450ms) | Narrower (~70–90ms) | Snappier deceleration, slightly more pronounced movement distance |
| **C — Execution Confidence (실행자신감형)** | Immediate, decisive — elements arrive almost together, as if everything is already in motion | Shortest (~300–400ms) | Minimal (~40–60ms) | Confident, front-loaded deceleration, no overshoot |

The Section 3 (mechanism) micro-interaction and Section 7 (CTA) rules above are held constant in *character* across all three — only their duration values follow the table, never their existence, per the Section 7 anti-fabricated-urgency rule applying identically to every concept.

---

## Self-Review

Reviewed against the enhanced prototypes, as a first-time visitor, ignoring implementation polish.

**Does motion improve readability?** Yes for Sections 1, 3, 4, 6, 7 — each reinforces an order the visitor needs (read-this-then-that, or watch-this-happen). Section 2's stagger is a mild improvement, not a necessary one. Section 5's stagger was, on review, genuinely optional — the section reads identically well static, since a four-row comparison table doesn't need sequencing to be scannable; **kept at Optional priority, implemented but the lightest-touch treatment on the page**, consistent with the plan above rather than upgraded.

**Does motion improve hierarchy?** Yes — the Hero and Closing sections in particular now unambiguously signal "the CTA is the destination" through timing (arrives last) rather than only through visual styling.

**Does motion guide attention?** Yes, most clearly in Section 3 (mechanism) and Section 4 (validation checks), where sequencing itself carries part of the section's actual claim, not just its polish.

**Does motion ever distract?** Two ideas were considered and rejected for this reason:
1. *A continuous, slow "floating" idle animation on the mechanism mock, to keep it feeling "alive."* Rejected — it answers none of the six required questions (nothing about attention order, reading order, or interactivity), and continuous motion during reading is a known distraction risk. Not implemented.
2. *A looping pulse on the primary CTA to draw the eye.* Rejected for the reason stated under Section 7 above — this would manufacture urgency, most damagingly in Concept B, where the line between "energetic pacing" and "fabricated pressure" is easiest to cross. Not implemented in any of the three concepts.

**Does motion reinforce Hypora's philosophy?** Yes, specifically in Sections 3 and 4 — the two sections where the animation isn't decorative but is the mechanism by which the visitor experiences "one question at a time" and "validated one honest judgment at a time" rather than just reading those claims.

**Does motion feel intentional?** Yes — every remaining animation in the tables above traces to a specific row in the Guiding Test; nothing plays "because it looks nice" survived this review.

---

## Final Validation

- **Every animation has a documented communication purpose** — stated per-section above; two ideas that lacked one were identified and explicitly excluded, not silently omitted.
- **Motion enhances the narrative rather than competing with it** — durations stay short, no continuous/looping motion exists anywhere on any of the three pages, and Section 7's CTA is deliberately the calmest element in motion terms despite being the most important in narrative terms.
- **The three concepts preserve their distinct narrative identities** — motion timing (not type) is tuned per concept per the table above, and the one universal rule (no fabricated CTA urgency) is held constant precisely because a concept-specific exception there would contradict [05_landing_concept_comparison.md](./05_landing_concept_comparison.md)'s own non-negotiable guardrail.
- **The prototypes remain planning artifacts, not production implementations** — motion is implemented with CSS transitions/keyframes plus one small vanilla-JS `IntersectionObserver` helper shared inline in each file; no animation library, no framework, no build step.
- **This plan is detailed enough to seed a future Landing motion specification** — every row is stated in terms of goal, trigger, and timing character (never a CSS property name or JS API), so it can be translated into a real Design System motion token set at promotion time without redoing the underlying design thinking.
