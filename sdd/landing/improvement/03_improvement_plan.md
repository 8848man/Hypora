# Improvement Plan — Hypora Landing

**Refs:** → [00_index](../../00_index.md) · [00_design_principles](./00_design_principles.md) · [01_reference_analysis](./01_reference_analysis.md) · [02_hypora_current_analysis](./02_hypora_current_analysis.md) · [Landing Experiment Strategy](../../context/07_landing_experiment_strategy.md) · [Information Architecture](../../context/04_information_architecture.md) · [Design System](../../design-system/01_design_system.md) · [Product Vision](../../context/01_product_vision.md)

## How to Read This Document

This is a **planning document, implementation-independent** — it proposes what should change and why, never how to build it. Every proposal states an **Origin Judgment**: whether it exists because Hypora's own philosophy ([00_design_principles.md](./00_design_principles.md)) requires it, or because the Sentinel reference happened to have it. Any proposal that could not be justified from Hypora's philosophy alone was removed or rewritten — none remain in that state below. Where the reference is cited, it is cited only as *supporting evidence for execution*, in a clearly separated line, never as the origin.

**Boundary note (unchanged from the prior iteration):** a new section's *copy* is expected to vary per A/B/C narrative variant exactly as existing Hero/value-card copy already does, per [Landing Experiment Strategy](../../context/07_landing_experiment_strategy.md#non-goals) — but a section's *existence, layout, and components* are structural decisions, identical across all three variants.

---

## Part A — Information Architecture, Reevaluated From Hypora Outward

The question asked of every section below is not "what did Sentinel do" but **"if Hypora had been designed first, what does a visitor need to see, in what order, to reach the mental model in [00_design_principles.md](./00_design_principles.md#part-1--hyporas-product-philosophy)?"**

### Deriving Section Order From Hypora's Own Thinking Order

Hypora's own domain model already implies a sequence: an idea has no home (the gap) → it gets structured through guided questions (the mechanism) → it becomes a Canvas (structuring, one lifecycle phase) → it gets honestly checked (validation, a distinct later phase) → it optionally goes further (the roadmap, honestly separated from what exists today) → a visitor acts, proportionate to what starting actually costs (entry point). This is the [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s own state order, read outward as a narrative — not a marketing template applied to Hypora.

### Proposed Section Sequence

| # | Section | Purpose (traces to Emotional Journey beat in 00_design_principles.md) | Relationship to the prior iteration's sections |
|---|---|---|---|
| 1 | **Hero** | States the promise and the specific gap together | Kept, refined (see Improvement 1) |
| 2 | **The Gap** | Recognition (beat 1) — the specific structural gap, not generic pain | Refines the previous "Problem section" proposal — narrowed from generic pain to Hypora's specific positioning gap |
| 3 | **How Hypora Thinks** | Relief (beat 2) — demonstrates the guided-question mechanism itself | **Merges** the previous "make the structure visible" and "how-it-works walkthrough" proposals — both were showing the same mechanism from two angles; V1 has no separate "execution" phase to walk through beyond the mechanism itself, so a second, separate walkthrough section would repeat rather than add |
| 4 | **Structuring vs. Validating** | Ownership (beat 3) + Honest confidence (beat 4) — distinguishes authorship from verification | **New** — did not exist in the prior iteration or in the Sentinel reference; derived entirely from the [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s own Structuring → Validating separation and the honesty requirement in [00_design_principles.md](./00_design_principles.md#trust-the-landing-must-build) |
| 5 | **What Hypora Is Not** | Corrects misconceptions directly, before they cost a conversion | **New** — surfaces [Product Positioning](../../context/01_product_vision.md#product-positioning)'s existing "What Hypora is not" list, which is fully specified but has never appeared on Landing at all |
| 6 | **Roadmap (honest split)** | Keeps V1 and the AI Co-founder vision legible as separate, not blended | Retained from the existing Roadmap page's content, repositioned in the single narrative rather than left as an unreached separate route |
| 7 | **Closing / Entry Point** | Proportionate action (beat 5) | Refines the previous "closing section" proposal — grounded in V1's true, low cost of starting rather than a generic restated promise |

### Sections Removed or Not Proposed, and Why

| Considered | Disposition | Reasoning |
|---|---|---|
| A separate "How It Works" step-by-step walkthrough (previously its own proposal) | **Merged into "How Hypora Thinks."** | Its only content, on inspection, was the same guided-question mechanism restated as numbered steps — a second pass at the identical claim, which [00_design_principles.md](./00_design_principles.md#narrative-principles)'s cognitive-load principle (11) argues against once one section already demonstrates it clearly |
| A quantified "value props with stats" section (the reference's ValueProps pattern) | **Not proposed.** | [00_design_principles.md](./00_design_principles.md#what-the-landing-must-never-communicate) explicitly rules out any stat not real and disclosed; Hypora currently has no usage history to cite. The existing three value cards remain, but are not expanded into a stats section on this basis. |
| A trust/social-proof section (customer logos, testimonial quotes) | **Not proposed.** | No such proof currently exists to disclose; fabricating placeholder proof would violate the same "no invented data" rule above. Revisit only once real usage data exists — not a planning-time decision to make now. |
| A separate Contact/waitlist form section | **Not proposed as a new structural addition.** | Nothing in Hypora's own philosophy calls for a human-conversation entry point at this stage — V1 is a fully self-serve, no-account tool by design ([Product Scope](../../context/02_product_scope.md#product-scope-v1)); adding a "talk to us" path would be borrowing a Sentinel-shaped conversion tier Hypora's current stage doesn't need, not fixing a gap Hypora has. |
| Splitting Features into its own route vs. folding into the single narrative | **Resolved, not merely flagged.** | The prior iteration left this as an open question. Reevaluated here (see Improvement 8): Feature-by-feature detail is downstream of, not a substitute for, understanding the mechanism (Section 3) — it belongs as an optional deeper page a convinced visitor can reach, not a required narrative beat. |

---

## Part B — Improvement Proposals

Each proposal states an **Origin Judgment** first.

### Improvement 1 — Sharpen the Hero to name Hypora's specific gap, not a generic frustration

**Origin Judgment:** Hypora-justified. The current Hero (all three variants) states a frustration but not the specific structural gap [00_design_principles.md](./00_design_principles.md#the-problem-it-exists-to-solve) identifies — the ungoverned middle between an unstructured note and a scoped execution plan. This is a refinement of existing copy, not an addition inspired by the reference.

**Reason:** Narrative Principle 5 requires opening with the *specific* gap, not a feeling a visitor could equally attach to any productivity tool.

**Expected User Impact:** Faster, more precise recognition (Emotional Journey beat 1) — a visitor self-identifies with Hypora specifically, not with "yet another productivity app."

**Priority:** High

---

### Improvement 2 — Add "The Gap" section immediately after Hero

**Origin Judgment:** Hypora-justified. Directly derived from [Product Positioning](../../context/01_product_vision.md#product-positioning)'s own stated contrast with note-taking and PM tools — not a generic "problem section."

*(Supporting evidence only, not the origin: [01_reference_analysis.md](./01_reference_analysis.md#2-communication-strategy) separately observes that naming pain before resolution is a persuasive general pattern — this proposal exists independent of that observation.)*

**Reason:** Narrative Principle 5; completes Emotional Journey beat 1.

**Expected User Impact:** A visitor understands *why* Hypora is shaped the way it is, before being shown the shape itself.

**Priority:** High

---

### Improvement 3 — Add "How Hypora Thinks": demonstrate the guided-question mechanism directly

**Origin Judgment:** Hypora-justified, and the merge of two previously separate proposals (structure visualization + how-it-works walkthrough). Justified entirely by [ADR-0004](../../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md) and [ADR-0012](../../architecture/decisions/ADR-0012-guided-question-flow-as-standard-interaction-pattern.md) treating the guided one-question flow as Hypora's most differentiating, deliberately-chosen mechanism — currently invisible on Landing per [02_hypora_current_analysis.md](./02_hypora_current_analysis.md#against-the-mental-model-part-1).

**Reason:** Narrative Principle 6 (demonstrate, don't just claim, "guided"); directly corrects the "blank canvas template" and "AI chatbot" misconceptions by showing the actual shape of one question and one resulting structured field — neither a form nor a chat window.

**Expected User Impact:** Relief (Emotional Journey beat 2) — a visitor sees concretely that they aren't being handed a blank document or an open-ended chat, before deciding to start.

**Priority:** High

---

### Improvement 4 — Add "Structuring vs. Validating": distinguish authorship from honest verification

**Origin Judgment:** Hypora-justified, and entirely new — not present in the prior iteration or suggested by the reference at all. Derived from the [Business Idea Lifecycle](../../domain/01_business_idea_lifecycle.md)'s own Structuring → Scoped → Validating state separation and [Assumptions](../../context/02_product_scope.md#assumptions)'s statement that "validated" means the founder's own explicit judgment, never automated verification.

**Reason:** Narrative Principle 7 and the "Trust the Landing Must Build" section of [00_design_principles.md](./00_design_principles.md) both require this distinction to be visible — collapsing structuring and validation into one narrative beat (as the current three parallel value cards do) misrepresents the product's own model.

**Expected User Impact:** Ownership and honest confidence (Emotional Journey beats 3–4) — a visitor understands the plan is theirs to author and theirs to judge, not generated or verified for them.

**Priority:** High

---

### Improvement 5 — Add "What Hypora Is Not": surface the existing positioning contrast directly

**Origin Judgment:** Hypora-justified, and entirely new. [Product Positioning](../../context/01_product_vision.md#product-positioning) already fully specifies "What Hypora is not" (not a note-taking tool, not a PM tool, not a one-click AI generator) — this proposal only makes an already-written fact visitor-facing; it originates from Hypora's spec, not from any external pattern.

**Reason:** Directly answers [00_design_principles.md](./00_design_principles.md#misconceptions-the-landing-must-correct)'s misconception list — the single highest-leverage gap identified in [02_hypora_current_analysis.md](./02_hypora_current_analysis.md#against-the-mental-model-part-1), since the most likely misconception (AI plan generator) is currently corrected nowhere.

**Expected User Impact:** Pre-qualifies visitors honestly — a visitor expecting a hands-off AI generator or a team tool learns immediately that Hypora isn't that, reducing mismatched-expectation drop-off later rather than at conversion.

**Priority:** High

---

### Improvement 6 — Reposition Roadmap content as an honest "V1 today vs. AI-assisted later" split within the narrative

**Origin Judgment:** Hypora-justified. [Product Goals](../../context/01_product_vision.md#product-goals)'s own commitment ("be honest about what's manual today vs. AI-assisted later") requires this distinction to be stated plainly, not left to a separately-routed page a visitor may never reach.

**Reason:** Communication Principle 4 — the long-term AI Co-founder vision must never blur into implying V1 already has AI; placing it explicitly *after* the mechanism/validation sections (which are entirely manual) reinforces rather than undercuts that boundary.

**Expected User Impact:** A visitor who is excited by the AI Co-founder roadmap understands precisely what exists today vs. later — avoiding the single most damaging misconception identified in [00_design_principles.md](./00_design_principles.md#the-misconception-people-are-likely-to-have).

**Priority:** Medium

---

### Improvement 7 — Add a closing section stating the true, low cost of starting

**Origin Judgment:** Hypora-justified. [Product Scope](../../context/02_product_scope.md#product-scope-v1) states V1 requires no account, no backend, no authentication — LocalStorage only. This is an unusually strong, currently true, and currently unstated fact.

*(Supporting evidence only: [01_reference_analysis.md](./01_reference_analysis.md#2-communication-strategy) separately observes that objection-reduction copy near a CTA is generally persuasive — this proposal is justified by Hypora's actual V1 facts regardless of that observation.)*

**Reason:** Conversion Principle 15 — objection-reduction copy must be true today; Hypora's is unusually favorable and currently absent.

**Expected User Impact:** Proportionate action (Emotional Journey beat 5) — lowers perceived commitment at the exact decision moment, using a fact that happens to be true rather than a persuasion technique borrowed from elsewhere.

**Priority:** Medium

---

### Improvement 8 — Resolve (not merely flag) the Features/Roadmap route question: keep as an optional deeper page, not a required narrative beat

**Origin Judgment:** Hypora-justified; supersedes the prior iteration's deferred Improvement 8. Reevaluated using Information Architecture Principle 9: Feature-by-feature detail is *downstream* of understanding the mechanism, not a substitute for it. A visitor who hasn't yet grasped "guided one-question-at-a-time" gets no value from a flat list of five Feature names.

**Reason:** The single continuous Home narrative (Sections 1–7 above) carries every fact required to reach the Part 1 mental model. Features remains a separate, optional, directly-linkable route for a convinced visitor who wants per-Feature detail — consistent with Information Architecture Principle 10 (a section earns its place; Feature-by-feature depth is not required to reach the mental model, so it does not belong in the primary narrative). Roadmap's content moves into Section 6 of the primary narrative (Improvement 6); the standalone Roadmap route may remain as a directly-linkable deep page for the same reason Features does, without contradicting Improvement 6 — a visitor gets the honest V1-vs-later split either way.

**Expected User Impact:** Resolves the largest structural ambiguity from the prior iteration with a decision grounded in what a visitor needs to understand Hypora, not in route-count minimalism for its own sake.

**Priority:** Medium (a structural decision, not a stat/copy change — deliberately not High, since it affects routing and the existing A/B/C experiment's content-resolution surface and should be sequenced after Sections 1–7 are validated)

---

### Improvement 9 — Reuse Status Badge as a Landing section-context label

**Origin Judgment:** Hypora-justified, restated from the prior iteration on Design-System grounds alone. [Design System](../../design-system/01_design_system.md#composition-rules) already establishes that Landing and Workspace compose the same primitives differently — applying the existing `Status Badge` to Landing sections is a same-component, new-composition change already licensed by that rule, independent of any external pattern.

**Reason:** Visual Communication Principle 13 (no parallel marketing-only visual language) and Information Architecture Principle 11 (bounded cognitive load) both favor a lightweight, consistent per-section context label as the page grows from one section to seven.

**Expected User Impact:** Faster scanning/orientation across the longer narrative proposed above.

**Priority:** Low

---

### Improvement 10 — Establish a Card variant vocabulary for Landing's different argument types

**Origin Judgment:** Hypora-justified, restated on Design-System grounds. Distinguishing a "gap" card from a "value" card from an "entry point" card is a token-level composition decision already within [Design System](../../design-system/01_design_system.md#design-tokens-conceptual)'s existing color-role and spacing-scale categories — not a request for a new component or a new pattern borrowed elsewhere.

**Reason:** Supports Improvements 2, 4, and 5 by letting a visitor visually distinguish "this is the gap" from "this is what's true about validation" from "this is what Hypora isn't" without reading every word.

**Expected User Impact:** Faster visual parsing as Home grows from one section to seven — supporting infrastructure, not a standalone improvement.

**Priority:** Low

---

## Priority Summary

| # | Improvement | Priority |
|---|---|---|
| 1 | Sharpen the Hero to name Hypora's specific gap | High |
| 2 | Add "The Gap" section | High |
| 3 | Add "How Hypora Thinks" (merged mechanism + walkthrough) | High |
| 4 | Add "Structuring vs. Validating" | High |
| 5 | Add "What Hypora Is Not" | High |
| 6 | Reposition Roadmap as an honest V1-vs-later split | Medium |
| 7 | Add a closing section stating the true cost of starting | Medium |
| 8 | Resolve Features/Roadmap route question (optional deeper pages) | Medium |
| 9 | Reuse Status Badge as a section-context label | Low |
| 10 | Establish a Card variant vocabulary | Low |

## Part C — Missing Opportunities Found by Thinking From Hypora Alone

Beyond the proposals above, reasoning independently from the reference surfaced opportunities no comparison to Sentinel would have produced, since they are specific to what Hypora is:

- **Hypora can honestly say what almost no funded competitor can: it costs nothing, requires no account, and keeps data local.** This is not a generic "no signup" trust line — it is a direct consequence of a deliberate V1 constraint ([Product Scope](../../context/02_product_scope.md#product-scope-v1)), and is Improvement 7's basis.
- **Hypora can pre-qualify visitors honestly, which most landing pages are structurally incentivized never to do.** Improvement 5 and [00_design_principles.md](./00_design_principles.md#who-hypora-is-intentionally-not-trying-to-convert-yet)'s "who Hypora is not trying to convert" list are, together, an unusual move for a landing page — actively telling some visitors they are not (yet) the right fit is only correct because Hypora's stage and non-goals make it true, not because it is a clever persuasion technique.
- **The distinction between "structured" and "validated" is a genuine piece of founder education Hypora is positioned to teach, that most tools never separate.** Improvement 4 is not only a product-explanation section — it is arguably the single most differentiated piece of content Hypora's Landing could carry, because the distinction is central to Hypora's domain model and largely absent from how founders normally think about their own ideas.

## Final Validation

- **Is every recommendation justified by Hypora rather than Sentinel?** Yes — every proposal in Part B states an explicit Origin Judgment, and every one is Hypora-justified; where the reference is cited, it is separated as supporting evidence for execution only, and the proposal's justification does not depend on it.
- **Does the proposed narrative teach visitors how to think about the problem before introducing the product?** Yes — Sections 1–2 (Hero, The Gap) establish the structural gap before Section 3 introduces the mechanism; Section 4 teaches the structuring/validation distinction before Section 7 asks for commitment.
- **Does the Landing communicate a philosophy rather than merely a feature list?** Yes — Features (per-capability detail) is deliberately relegated to an optional deeper page (Improvement 8); the primary narrative carries the mental model in [00_design_principles.md](./00_design_principles.md#part-1--hyporas-product-philosophy), not a capability inventory.
- **Could Sentinel be removed from the repository tomorrow while the proposed Landing would remain essentially unchanged?** Yes. Every section in Part A and every proposal in Part B is justified from `sdd/context/`, `sdd/domain/`, and `sdd/architecture/decisions/` citations that exist independent of `sentinel_sdd/`. The two remaining citations to [01_reference_analysis.md](./01_reference_analysis.md) (Improvements 2 and 7) are explicitly marked as non-originating supporting evidence and the proposals are unchanged if those lines are deleted — verified by rereading each with the reference citation removed.

## SDD Drift Check (per `sdd-framework/05_validation_and_review.md`)

1. **Implementation ↔ Specification** — does the changed code still match what the relevant spec(s) say?
   Not a clean "no change needed": real Landing code already exists (`app/src/pages/landing/HomePage.tsx`, `FeaturesPage.tsx`, `RoadmapPage.tsx`, `app/src/layout/LandingLayout.tsx`, first committed `8502e8d`, 2026-07-14 or earlier) and is accurately described by [02_hypora_current_analysis.md](./02_hypora_current_analysis.md)'s "What Exists Today" table — that part matches. **But** this contradicts `CLAUDE.md`'s and `sdd/00_index.md`'s standing claim that "no Application (Landing, Workspace, Platform API) has real code yet" and that the `sdd/landing/` promotion trigger ("once each Application has real code") has not fired. It has. This is a genuine, pre-existing drift this review surfaces, not one this task introduces — and per the framework's own rule, it "cannot be left ambiguous." Resolving it (updating `CLAUDE.md`/`00_index.md`'s stage claim, and deciding whether to promote `sdd/landing/` to a full architecture+contract doc) is out of scope for a Landing-copy planning task and is flagged here for separate follow-up, not silently corrected in passing.
2. **Architecture ↔ ADR** — if this touched an area governed by an existing ADR, does the implementation still honor it?
   No implementation was touched. Every ADR cited ([ADR-0004](../../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md), [ADR-0012](../../architecture/decisions/ADR-0012-guided-question-flow-as-standard-interaction-pattern.md), [ADR-0005](../../architecture/decisions/ADR-0005-korean-first-localization-architecture.md)) is referenced for its existing Decision only, never restated or contradicted — no supersession is warranted.
3. **Release ↔ Current state** — if release records exist for the affected component, do they still describe what's actually deployed?
   No `release/` directory exists yet (per `sdd/00_index.md`'s "Not Yet Created" table — trigger is an actual deployment, which hasn't happened). Not applicable.
4. **Folder ownership** — does the ownership map still correctly describe who owns what was touched?
   It did not, until this pass: `sdd/rules/ownership.md` had no entry for `sdd/landing/improvement/`, which sits under the path prefix reserved for the future Landing Application promotion and could be misread as that promotion. Fixed in this task — a clarifying note was added under Ownership's "Note on Landing and Platform API," stating `sdd/landing/improvement/` is Product/Context-owned, not an instance of the reserved "Landing (future)" row.
5. **Obsolete documentation** — did this task make anything obsolete? If so, archive it in the same task.
   No. `02_hypora_current_analysis.md` and `03_improvement_plan.md` were substantially rewritten in place rather than archived-and-replaced. This is a deliberate, correct application of the framework's own archival test ([`14_evolution_rules.md`](../../../sdd-framework/14_evolution_rules.md)#should-a-document-be-archived): archival applies to a document no longer an accurate description of current intent; these are draft planning documents whose *role* (current-state analysis, improvement plan) is unchanged and which the requesting task explicitly asked to be refined in place ("do not preserve previous conclusions merely because they already exist") rather than superseded by a new file. No `sdd/archive/` entry is warranted for iterating on a not-yet-finalized plan.

## Artifact Decision Matrix (per `sdd-framework/05_validation_and_review.md`)

| Artifact | Change? | Reasoning |
|---|---|---|
| Specification | Yes | `sdd/landing/improvement/00_design_principles.md` created; `01_reference_analysis.md`, `02_hypora_current_analysis.md`, `03_improvement_plan.md` revised; `sdd/00_index.md` and `sdd/rules/ownership.md` updated to keep both reachable/accurate |
| ADR | No | No architecturally significant, hard-to-reverse decision was made — Improvement 8 resolves a planning-level IA question within this directory's own scope, not a cross-area or persistence/contract decision |
| Release | No | Nothing was deployed; `release/`'s creation trigger (an actual deployment) has not fired |
| Validation | None of L1–L5 | No code changed — L1–L5 all gate on a code/behavior/interface change (per the Decision Tree), none of which occurred; this task is Specification-tier only |
| Version | No | No component version bump applies to planning-only `sdd/` content |
| Git Commit | Not yet — pending user review | Once committed, the message should reference this directory and note the standing `CLAUDE.md`/`00_index.md` "no real code yet" drift flagged above, so it isn't lost between now and its separate resolution |
