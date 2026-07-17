# Reference Analysis — Sentinel Landing (External Reference)

**Refs:** → [00_index](../../00_index.md) · [00_design_principles](./00_design_principles.md) · [Landing Experiment Strategy](../../context/07_landing_experiment_strategy.md) · [Application Responsibilities](../../context/05_application_responsibilities.md) · [Design System](../../design-system/01_design_system.md)

## Standing of This Document

**This document is supporting evidence, not the origin of Hypora's Landing design.** [00_design_principles.md](./00_design_principles.md) — derived entirely from Hypora's own `sdd/context/`, `sdd/domain/`, and `sdd/architecture/decisions/` — is the canonical source every Landing decision is checked against. Read that document first. What follows is a catalog of *how* a landing page can execute narrative/communication mechanics in general, observed in one external reference; it is consulted only after a Hypora-grounded principle already exists, to see whether a known execution pattern happens to fit — never to originate a new principle. [03_improvement_plan.md](./03_improvement_plan.md) states, for every proposal, whether it was justified by Hypora's own philosophy or merely by this document, and removes or rewrites any proposal that fails that test.

## Scope Note

`sentinel_sdd/` documents another product's landing page (Sentinel, an incident-management tool), reverse-engineered into a specification for reference only. It is **not** part of Hypora's specification tree, is never linked from `sdd/00_index.md`, and nothing in it is a canonical fact about Hypora. This document extracts *transferable landing-page principles* from that reference — never Sentinel's wording, branding, or visual identity — for use in [03_improvement_plan.md](./03_improvement_plan.md). See [02_hypora_current_analysis.md](./02_hypora_current_analysis.md) for the corresponding read of Hypora's own Landing.

## 1. Information Architecture

### Observed Structure

A single scrolling page (not multiple routes) with eleven sections in a fixed order: Nav (persistent overlay) → Hero → Problem → Reframe → Solution → HowItWorks → ValueProps → ProductViz → FinalCTA → Contact → Footer.

### Principles Behind the Structure

| Principle | Evidence | Why it likely exists |
|---|---|---|
| **One continuous narrative, not a set of destinations** | All eleven sections live on one route (`/`); Nav's in-page links (`#how-it-works`, `#get-started`, `#contact`) scroll rather than navigate | A single scroll lets each section's argument build on the one before it (pain → reframe → mechanism → proof), which a multi-page split would interrupt — a visitor who leaves after Hero never reaches Reframe or ValueProps |
| **Tension before resolution** | Problem (pain) is placed immediately after Hero (promise), before Solution (mechanism) | Naming the pain early gives the Hero's promise a reason to matter; a visitor who doesn't recognize the pain has no reason to keep reading |
| **A pivot section between pain and product** | Reframe sits between Problem and Solution, with no product UI shown | Converts "here's your pain" into "here's the *real* pain," which is a rhetorical setup that makes the following Solution feel earned rather than asserted |
| **Repetition with increasing concreteness** | The same "structure fixes chaos" idea appears three times: Reframe (abstract argument) → Solution (mechanism + one static preview) → HowItWorks (three concrete step-by-step mockups) → ProductViz (a compressed visual recap) | Each pass adds a layer of proof (claim → mechanism → walkthrough → synthesis) rather than repeating the same claim verbatim — visitors who need only one pass can stop scrolling, visitors who need more get it |
| **CTA density increases toward the bottom, never front-loaded alone** | A single primary CTA in Nav/Hero, then no further CTA until FinalCTA (two paths) and Contact (a third, lower-commitment path) | Early CTAs capture visitors who are already convinced; the mid-page sections exist to convert visitors who aren't yet, so CTAs are deliberately withheld until the argument has been made |
| **A permanent, low-friction path stays available throughout** | Nav's CTA is `position: fixed`, visible at every scroll depth | Visitors who convert without reading the full narrative (e.g., already know the product) are never blocked from doing so |
| **Multiple exit paths of different commitment levels at the end** | FinalCTA offers a self-serve demo *and* a waitlist; Contact offers a human conversation | Not every visitor is ready for the same ask — offering only one CTA type forces visitors who want a lower-commitment option to bounce instead of convert |
| **Visual rhythm via consistent dividers and alternating density** | A horizontal divider before most sections; alternating card-grid sections (Problem, ValueProps) and asymmetric two-column sections (Solution, Reframe, Contact) | Repetition of the same layout for every section would make the scroll feel monotonous; alternating layout keeps attention without changing the underlying content max-width (`1140px`) or spacing scale |

## 2. Communication Strategy

| Stage | What Sentinel does | Reusable principle |
|---|---|---|
| **Introduction (Hero)** | States the outcome ("stop solving the same incident twice"), not the feature list; a status badge signals the product is real and shipping ("Now in Early Access") rather than speculative | Lead with the *outcome* the visitor wants, and signal the product's realness before its feature set — a visitor decides whether to keep reading before deciding whether to believe a claim |
| **Problem presentation** | Names three concrete, specific failure modes (signal overload, knowledge loss, process failure) rather than one generic pain statement; each is paired with a small illustrative "mini-mockup" so the pain is shown, not just asserted | Specific, named pain points a visitor can self-identify with are more persuasive than one abstract problem statement; pairing each with a visual makes the pain concrete rather than rhetorical |
| **Trust establishment** | A social-proof line under Hero's CTA ("Trusted by on-call teams at engineering-first companies"), a "LIVE" badge on the Solution preview, and a working interactive demo as the primary CTA (not a form-gated request) | Trust is built by *reducing the visitor's uncertainty about whether the product is real and works*, not only by testimonials — an always-available demo is itself a trust signal |
| **Value communication** | ValueProps quantifies impact with specific stats (68% reduction, 100% capture, 3× faster) rather than qualitative claims alone; HowItWorks shows the literal screens a user would see | Quantified, specific claims are more persuasive than adjectives ("faster," "better"); showing the actual mechanism (not just describing it) lets the visitor evaluate the claim themselves |
| **Objection reduction** | FinalCTA's demo path is explicitly framed as low-commitment ("5 min guided walkthrough · No account needed"); a waitlist option exists for visitors not ready to commit; Contact exists for visitors with unanswered questions | Every remaining hesitation a visitor might have (too much time, requires signup, I have a question first) is given its own explicit answer rather than left unaddressed |
| **Conversion encouragement** | The closing CTA restates Hero's exact promise verbatim ("Stop solving the same incident twice") as a call to action | Closing on the same emotional hook the visitor arrived on reinforces that the argument in between was in service of that one promise, not a digression from it |

## 3. Component Strategy

| Component pattern | Why it exists (communication role, not visual styling) |
|---|---|
| **Badge** | A small, consistent "context label" (section eyebrow, status indicator) that orients the visitor to what a section is about before they read its headline — reduces cognitive load at each new section |
| **Card (with variants: problem/contrast/value/CTA)** | One shape for "one discrete unit of an argument" (one problem, one value prop, one CTA option) — visually groups related content and enables scannable, parallel comparison (three problems, three value props) rather than a wall of prose |
| **Primary / Secondary Button** | Consistent visual hierarchy between the one deliberate forward action and supporting actions, repeated identically at every CTA moment so a visitor never has to re-learn "which button matters" |
| **Section Divider** | A lightweight, consistent visual boundary between narrative beats, without introducing a heavy background-color change per section — keeps the page feeling like one continuous document, not stitched-together blocks |
| **Product mockups embedded per-section** (dashboard mockup, mini alert lists, workflow preview, step visuals) | Each narrative beat gets its own concrete visual proof rather than one hero screenshot reused throughout — this is the single most repeated pattern in the reference and appears to be the primary mechanism by which abstract claims ("structured," "repeatable") are made concrete |
| **Contact/Waitlist forms with inline success/error state** | Keeps the conversion action on-page (no route change, no external tool) and gives immediate feedback, minimizing the steps between intent and confirmation |

**Component-strategy caveat for Hypora:** Sentinel's components are unparameterized, single-use, hardcoded-copy React components (per `sentinel_sdd/landing/00_index.md`'s extraction notes) — a pattern explicitly at odds with Hypora's own [Design System](../../design-system/01_design_system.md), which requires every primitive to be a parameterized, localization-driven, cross-Application-reusable contract. The *shapes* above (badge, card variants, section rhythm, embedded proof visuals) are transferable; the *implementation pattern* (one-off components per section) is not, and must not be copied — see [03_improvement_plan.md](./03_improvement_plan.md) for how these shapes map onto Hypora's existing Design System boundary instead.

## 4. Overall Design Philosophy

Sentinel's landing page is best characterized as **problem-first, proof-dense storytelling**: it does not open with features or pricing, but with pain the visitor is assumed to already feel, then spends most of its length *proving* — through repeated, increasingly concrete visuals and quantified stats — that the product resolves that pain, before ever asking for commitment. Three supporting philosophies observed:

- **Progressive concreteness** — every claim is made twice: once as an argument (Reframe, Solution's copy) and once as a visual (Solution's preview, HowItWorks' mockups, ProductViz's diagram). Nothing rests on assertion alone.
- **Low-friction, multi-tier conversion** — the page never assumes one CTA fits every visitor; it offers a spectrum from "try it now, no signup" to "join a waitlist" to "talk to a human," in decreasing order of visitor readiness.
- **Consistency as a trust signal** — identical spacing, card shapes, and badge patterns recur at every section, which (independent of any single section's content) itself signals a considered, non-improvised product.

These three are the principles carried forward into [03_improvement_plan.md](./03_improvement_plan.md) — not Sentinel's incident-management framing, copy, or visual identity, none of which apply to Hypora.
