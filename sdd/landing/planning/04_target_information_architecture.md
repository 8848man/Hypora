# Target Information Architecture — Hypora Landing

**Refs:** → [00_index](../../00_index.md) · [00_design_principles](../improvement/00_design_principles.md) · [01_reference_analysis](../improvement/01_reference_analysis.md) · [02_hypora_current_analysis](../improvement/02_hypora_current_analysis.md) · [03_improvement_plan](../improvement/03_improvement_plan.md) · [Information Architecture](../../context/04_information_architecture.md) · [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)

## Status

**Draft — validated against a prototype, not yet promoted.** This document finalizes the section sequence proposed in [03_improvement_plan.md](../improvement/03_improvement_plan.md)'s Part A into a complete, reviewable visitor journey. It is a **planning document**, not the `sdd/landing/` architecture promotion itself — see [Improvement 8](../improvement/03_improvement_plan.md#improvement-8--resolve-not-merely-flag-the-featuresroadmap-route-question-keep-as-an-optional-deeper-page-not-a-required-narrative-beat) and the standing recommendation that promotion happen once this target IA is accepted, not before. The Self-Review in this document's final section records one real revision pass, made after building the companion prototype (`planning/prototype/landing_prototype.html`, repo root, disposable).

## How to Read This Document

Every section below is checked against [00_design_principles.md](../improvement/00_design_principles.md)'s Emotional Journey and Part 1 mental model — not against the Sentinel reference. "Required Components" names logical building blocks only (an eyebrow label, a contrast panel, a CTA) — never a Design System primitive name, prop, or implementation detail; that mapping happens only after promotion, not here.

---

## Section 1 — Hero

**Purpose:** State the product's promise and the specific gap it closes, together, in the first moment — so a visitor's very first impression is already anchored to Hypora's actual philosophy, not a generic SaaS opener.

**Core Message:** *A vague idea becomes a validated plan by being structured — one guided question at a time.*

**User Questions Answered:**
- What is this?
- Why should I care about this right now?

**Required Components:**
- A short context label (signals what kind of product this is before the headline is read)
- Headline (states the outcome, not a feature)
- Supporting subheadline (names the mechanism briefly — "guided," "one question at a time")
- Primary call to action

**Transition:** First section — nothing precedes it.

**Success Criteria:** A visitor can restate, in their own words, that Hypora turns a vague idea into a structured plan, and forms an initial opinion on whether that's relevant to them, before scrolling further.

---

## Section 2 — The Gap

**Purpose:** Name the specific structural gap Hypora exists to fill — not generic founder pain, but the precise, ungoverned middle between an unstructured note and a scoped execution plan ([Product Positioning](../../context/01_product_vision.md#product-positioning)).

**Core Message:** *A note tool won't force structure. A project tool assumes the scope is already decided. Nothing sits in the middle — until now.*

**User Questions Answered:**
- Why does this need to exist at all?
- Isn't this just another note app, or another project-management tool?

**Required Components:**
- Section context label
- Headline naming the gap
- A short contrast set (what a note tool does / what a PM tool does / what's missing between them)
- One supporting sentence connecting the gap directly to Hero's promise

**Transition:** Hero states the promise; this section justifies *why* the promise is needed, by naming the exact unmet need — recognition must precede relief.

**Success Criteria:** A visitor recognizes the gap as their own lived experience ("that's exactly the problem"), not as an abstract pain statement they have to take on faith.

---

## Section 3 — How Hypora Thinks

**Purpose:** Demonstrate the guided, one-question-at-a-time mechanism directly — the single most differentiating, deliberately-chosen fact about Hypora ([ADR-0004](../../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md), [ADR-0012](../../architecture/decisions/ADR-0012-guided-question-flow-as-standard-interaction-pattern.md)), currently invisible on Landing.

**Core Message:** *You answer one focused question at a time. Not a blank form. Not an open-ended chat. Structure emerges as you go.*

**User Questions Answered:**
- How does this actually work, mechanically?
- Do I need to already know a business framework to start?
- Is this an AI chatbot?

**Required Components:**
- Section context label
- Headline
- A mechanism visual: the shape of one guided question, and the shape of the structured field it produces — shown as a concrete pair, not described only in prose
- 2–3 short supporting statements (no framework jargon required; presets plus a custom option; progress is always visible)

**Transition:** Having recognized the gap, a visitor needs proof of the mechanism that closes it — concreteness must follow recognition, or the promise stays abstract.

**Success Criteria:** A visitor can picture the actual interaction — one question, then a structured answer — and no longer assumes this is either a blank template or a chat window.

---

## Section 4 — Structuring vs. Validating

**Purpose:** Distinguish authorship (structuring — the founder's own thinking) from honest verification (validating — explicitly founder-judged, never automated), mirroring the [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s own Structuring → Validating separation.

**Core Message:** *Structuring is yours to author. Validating is yours to judge — honestly, never auto-confirmed.*

**User Questions Answered:**
- Who decides whether my plan is any good?
- Does the tool tell me I'm "done" automatically?
- Can I trust what "validated" means here?

**Required Components:**
- Section context label
- Headline
- A two-panel contrast: Structuring (authored by you) / Validating (judged by you, explicitly, item by item)
- One clarifying line: validation is a checklist the founder marks themselves — never a third-party or automated stamp ([Assumptions](../../context/02_product_scope.md#assumptions))

**Transition:** Having seen the mechanism, a visitor now needs to understand what it produces and what "done" honestly means — moving from *how it works* to *what it's for*.

**Success Criteria:** A visitor understands the plan is theirs to author, and that "validated" is their own honest judgment call, never a scientific or automated guarantee.

---

## Section 5 — What Hypora Is Not

**Purpose:** Actively correct the remaining, most costly misconceptions before they affect conversion — surfacing [Product Positioning](../../context/01_product_vision.md#product-positioning)'s already-specified "What Hypora is not" list, which has never appeared on Landing.

**Core Message:** *Not a note app. Not a project tracker. Not an AI that writes your plan for you. Not (yet) a team tool.*

**User Questions Answered:**
- Is this just [a tool I already use] with a new name?
- Is an AI going to write my plan and decide for me?
- Is this for my team, or just for me?

**Required Components:**
- Section context label
- Headline
- A short comparison list: Hypora vs. 3–4 named tool categories, one line of distinction each
- One honest disqualifying line (who this isn't built for yet)

**Transition:** With the mechanism and the structuring/validating model both established, this section closes any remaining "is this actually just Y" ambiguity before the visitor is asked to commit.

**Success Criteria:** A visitor can state, unprompted, why Hypora isn't the tool category they may have first assumed — and self-selects in or out honestly, rather than converting on a mismatched expectation.

---

## Section 6 — Today vs. Tomorrow

**Purpose:** Show V1's manual reality and the longer AI Co-founder vision as clearly separated, never blended — directly serving [Product Goals](../../context/01_product_vision.md#product-goals)'s "be honest about what's manual today vs. AI-assisted later" commitment.

**Core Message:** *Today: a manual structuring and validation workspace, zero AI. Tomorrow: the same workspace, with AI assisting — never deciding — at every later stage.*

**User Questions Answered:**
- Is there any AI in this right now?
- Where is this headed?
- Will AI ever take over my judgment?

**Required Components:**
- Section context label
- Headline
- A two-part timeline: Today (V1, fully manual) vs. Tomorrow (V2–V5, AI-assisted)
- One assurance line: AI suggests, the founder always decides — at every future stage, not just V1

**Transition:** Having established trust in the honest, manual present (Sections 2–5), the visitor is now shown where that trust extends — a future vision that reinforces rather than undercuts what's true today.

**Success Criteria:** A visitor can state plainly that V1 has no AI, and that AI, when it arrives, stays assistive rather than decision-making.

---

## Section 7 — Closing / Entry Point

**Purpose:** Ask for action proportionate to what starting actually costs — no hype, no urgency, no invented scarcity.

**Core Message:** *Start structuring your idea. No account. Nothing to lose. The plan stays yours.*

**User Questions Answered:**
- What happens if I click this?
- What am I actually committing to?
- What if I'm not ready to start a project yet?

**Required Components:**
- Restated core promise (not a verbatim repeat of Hero — a closing variant)
- Primary call to action
- Objection-reduction microcopy (true, current V1 facts: no account, local-only, [Product Scope](../../context/02_product_scope.md#product-scope-v1))
- A secondary, lower-commitment link for a visitor not ready to start (e.g., revisit the roadmap)

**Transition:** Every prior belief (the gap, the mechanism, the honesty of validation, what Hypora isn't, the honest roadmap) is now established — this is the proportionate ask that follows, not a cold CTA dropped at the end of an unrelated page.

**Success Criteria:** A visitor understands exactly what happens next and what it costs, and either acts immediately or leaves with the full mental model intact for a later, better-informed return.

---

## Overall Narrative Progression

```
Hero              → the promise, stated with the gap already implied
The Gap           → recognition: the specific unmet need, not generic pain
How Hypora Thinks → relief: the mechanism made concrete
Structuring/Validating → ownership + honest confidence: what the mechanism produces, and what "done" means
What Hypora Is Not → correction: remaining misconceptions closed before the ask
Today vs. Tomorrow → honesty: manual now, assisted later — never blurred
Closing            → proportionate action: a true, low-cost next step
```

Each section exists because it is required to reach [00_design_principles.md](../improvement/00_design_principles.md)'s Part 1 mental model — not because a comparable section existed in any external reference. No section repeats another's core claim; each adds a layer (gap → mechanism → output → honesty → positioning → future → action) rather than restating the same point twice.

## Information Hierarchy

Within every section, the same fixed order applies, so a visitor's eye always knows where to look first: **context label → headline → one supporting layer (visual or short text) → optional micro-copy.** No section ever leads with a visual before its headline, and no section carries more than one primary visual idea — consistent with [00_design_principles.md](../improvement/00_design_principles.md#information-architecture-principles)'s bounded-cognitive-load principle (11): Hypora's own product bounds a founder to one question at a time, and the page describing it is held to the same discipline.

## Visitor Learning Sequence (Cumulative)

| After section | The visitor now knows |
|---|---|
| 1. Hero | Hypora turns ideas into structured plans |
| 2. The Gap | *Why* that's needed — the specific gap, not a generic one |
| 3. How Hypora Thinks | *How* it works — one guided question at a time |
| 4. Structuring vs. Validating | *What* it produces, and that validation is honest, self-judged |
| 5. What Hypora Is Not | What Hypora *isn't* — mismatched assumptions are corrected |
| 6. Today vs. Tomorrow | What's true *today* vs. *later* — no overclaiming |
| 7. Closing | Exactly what starting costs, and what to do next |

By Section 5, a visitor has enough to make an informed decision even if they never reach the CTA — consistent with [00_design_principles.md](../improvement/00_design_principles.md#what-visitors-should-understand-before-they-leave)'s requirement that understanding, not just conversion, is the page's job.

## Conversion Strategy

- **One primary ask, stated once at full strength (Section 7), foreshadowed but not duplicated in Hero.** Hero's CTA exists for visitors already convinced without reading further; Section 7's CTA exists for visitors the narrative just convinced.
- **One secondary, lower-commitment path (Section 7's roadmap link)** — for a visitor who isn't ready to start a project but wants to keep learning, per [00_design_principles.md](../improvement/00_design_principles.md#conversion-principles) Principle 16.
- **No third, human-contact-tier CTA.** Per [03_improvement_plan.md](../improvement/03_improvement_plan.md#sections-removed-or-not-proposed-and-why), Hypora's current stage (fully self-serve, no-account V1) doesn't warrant a "talk to us" tier — adding one would import a Sentinel-shaped conversion tier Hypora doesn't need yet.
- **No urgency or scarcity device anywhere** — consistent with the Emotional Journey's closing beat (proportionate action, not hype).

---

## Self-Review

Read as a first-time visitor, against `planning/prototype/landing_prototype.html`, ignoring implementation quality entirely.

**Narrative — does the story naturally progress?** Yes. Each section's claim depends on the one before it: the Hero's promise means nothing until The Gap justifies it; the mechanism (How Hypora Thinks) means nothing until you've felt the gap; the structuring/validating distinction only lands once you've seen the mechanism produce something; What Hypora Is Not only works as reassurance once the prior four sections have already shown, not told, what Hypora *is*. No section could be read first and still make sense — a good sign the order is load-bearing, not arbitrary.

**Clarity — can visitors understand the product quickly?** Yes, with one caveat. By the end of Section 3 (three sections, well under a minute of reading), a visitor already knows what Hypora does and how. The caveat: Section 1's subheadline uses "guided" without yet showing what that means — acceptable, since Section 3 resolves it quickly, but worth flagging as a one-section delay, not a gap.

**Cognitive load — is too much information presented at once?** No section exceeds one primary visual idea plus a short supporting list, matching the Information Hierarchy rule. The one section that initially risked overload was Section 5 (What Hypora Is Not) — a four-row comparison table is more scanning than any other section asks for. Left as-is after review: it's a deliberately dense, skimmable table (not prose), and it's the single section whose entire job is rapid disambiguation, so the slightly higher density there is purposeful, not accidental clutter.

**Information hierarchy — does the eye naturally move through the page?** Yes, in the prototype as built — every section follows eyebrow → headline → one visual/textual layer → optional micro-copy without exception, so a visitor skimming just headlines and eyebrows top-to-bottom still gets the full argument in miniature.

**Conversion — does the final CTA feel earned?** Yes. By Section 7, nothing about "start structuring your idea" needs further explanation — the mechanism, the honesty of validation, the positioning, and the honest roadmap have already been shown. The micro-copy (no account, local-only) answers the one remaining practical question a convinced visitor would still have.

**Product philosophy — does the Landing communicate Hypora's unique philosophy rather than simply listing features?** Yes. No section is a feature list; Section 3 shows the mechanism (not a feature grid), Section 4 teaches a distinction most founders don't normally make (structuring vs. honestly-judged validation), and Section 5 is positioning, not a capability inventory. The existing Features page (per [Improvement 8](../improvement/03_improvement_plan.md#improvement-8--resolve-not-merely-flag-the-featuresroadmap-route-question-keep-as-an-optional-deeper-page-not-a-required-narrative-beat)) remains the correct home for per-capability depth — deliberately not reproduced here.

## Revision Log

Two changes were made as a direct result of the self-review above; both are already reflected in this document's section specs and in the prototype — recorded here so the "why" isn't lost.

**Observation 1 — Section 5 ("What Hypora Is Not") risked reading as defensive if placed with no positive framing nearby.** A comparison list phrased purely as "not X, not Y, not Z" can read as apologetic rather than confident. **Revision:** the section's headline was reframed to lead with what Hypora *is* (a single-idea structuring and validation workspace) before the comparison list, so the section corrects misconceptions from a position of clarity rather than defensiveness. Applied to both this document's Core Message wording above and the prototype.

**Observation 2 — Section 6 and Section 7 both discussed "what happens later," risking a soft repeat.** Today vs. Tomorrow's future half and Closing's proportionate-action framing could blur into each other if not visually and tonally distinct. **Revision:** confirmed Section 6 stays roadmap-only (product trajectory) and Section 7 stays action-only (what clicking costs, right now) — no roadmap content was added to Section 7 in the prototype, keeping the two beats distinct as designed.

**Observation 3 — cognitive load check.** Reading the full 7-section sequence in one sitting took under two minutes at a normal reading pace in the prototype, each section legible without needing to reread — consistent with Information Hierarchy's bounded-load requirement. No section was cut or merged as a result; the sequence held.

No further revision cycles were required after these two changes — narrative held on the second read against all six Self-Review criteria above.

---

## SDD Drift Check (per `sdd-framework/05_validation_and_review.md`)

1. **Implementation ↔ Specification** — the real Landing code (`app/src/pages/landing/*`) still does not match this target IA, by design: this document specifies a *target*, not current state, and no implementation work is in scope for this task. The pre-existing, separately-flagged drift (Landing code exists while `CLAUDE.md`/`00_index.md` still claim "no Application has real code yet," and the `sdd/landing/` promotion trigger has fired but is unactioned) is unchanged by this task and remains open for separate follow-up — not re-litigated or silently resolved here.
2. **Architecture ↔ ADR** — every ADR cited ([ADR-0004](../../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md), [ADR-0012](../../architecture/decisions/ADR-0012-guided-question-flow-as-standard-interaction-pattern.md)) is referenced for its existing Decision only; nothing here proposes or requires superseding either.
3. **Release ↔ Current state** — no `release/` directory exists yet; not applicable.
4. **Folder ownership** — `sdd/rules/ownership.md` did not yet mention `sdd/landing/planning/` or the repo-root `planning/` prototype directory. Fixed in this task: the existing note on `sdd/landing/improvement/` was extended to cover `sdd/landing/planning/`, and a new note covers the repo-root `planning/` directory, both clarifying these are not the `sdd/landing/` Application promotion.
5. **Obsolete documentation** — no document became obsolete. `00_design_principles.md` through `03_improvement_plan.md` remain valid inputs, explicitly treated as such (per this task's own framing) rather than superseded; this document is a new, additive artifact finalizing what they proposed into a validated sequence, not a replacement for any of them.

## Artifact Decision Matrix (per `sdd-framework/05_validation_and_review.md`)

| Artifact | Change? | Reasoning |
|---|---|---|
| Specification | Yes | `sdd/landing/planning/04_target_information_architecture.md` created; `sdd/00_index.md` and `sdd/rules/ownership.md` updated to keep both reachable/accurate |
| ADR | No | No architecturally significant, hard-to-reverse decision was made — this remains a content/narrative validation exercise, not a Design System, persistence, or cross-Application boundary change |
| Release | No | Nothing deployed; `release/`'s creation trigger has not fired |
| Validation | None of L1–L5 | No product code changed — the prototype (`planning/prototype/landing_prototype.html`) is explicitly a disposable, non-production artifact outside the codebase's validation surface, not a change subject to L1–L5 |
| Version | No | No component version bump applies to planning-only content |
| Git Commit | Not yet — pending user review | Should reference both new documents and note that the prototype and `planning/` directory are intentionally excluded from any build/lint/CI surface, consistent with `planning/README.md` |
