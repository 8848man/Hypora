# SDD Framework — Bootstrap Documentation

**What this is:** A generalized, project-agnostic extraction of the Specification-Driven Development (SDD) methodology observed in the Sentinel project (`sentinel_mvp`), which serves here as the **reference implementation**. This documentation set is written so a new, unrelated project can recreate the same methodology from these documents alone — without ever seeing Sentinel's actual specs.

**What this is not:** A copy of Sentinel's specifications. No product requirements, API shapes, or screen designs from Sentinel appear here except as illustrative examples of the *pattern* they follow.

**Evidence discipline:** Every claim in this set is grounded in Sentinel's actual `sdd/` tree, `release/` tree, `CLAUDE.md`, and git history. Where a document states a rule that is never written down anywhere in Sentinel but is followed consistently in practice, it is marked **(Inferred)**. Where a rule is stated explicitly in a Sentinel document, it is marked **(Explicit)** with a source reference. Do not treat inferred rules as weaker — they are conventions strong enough to reconstruct, just never committed to writing in the source project.

---

## Reading Order (for bootstrapping a new project)

**Foundational — read in order:**
1. [`01_philosophy.md`](./01_philosophy.md) — the mental model everything else depends on. Read this first; skipping it makes every other document look like arbitrary bureaucracy instead of a coherent system.
2. [`02_directory_structure.md`](./02_directory_structure.md) — the folder layout and why each directory exists.
3. [`03_document_lifecycle.md`](./03_document_lifecycle.md) — how individual documents are born, edited, and retired.
4. [`04_development_workflow.md`](./04_development_workflow.md) — the actual sequence of steps a change goes through.
5. [`05_validation_and_review.md`](./05_validation_and_review.md) — how correctness is checked, and by whom.
6. [`06_naming_and_versioning.md`](./06_naming_and_versioning.md) — every ID scheme, filename convention, and status vocabulary used (comparative only — see `13` for canonical ownership).
7. [`07_adr_process.md`](./07_adr_process.md) — how architectural decisions are captured, separately from specs.
8. [`08_release_process.md`](./08_release_process.md) — how "what shipped, to users, when" is recorded, separately from both specs and git.
9. [`09_implicit_conventions.md`](./09_implicit_conventions.md) — the unwritten rules, made explicit.
10. [`10_bootstrap_guide.md`](./10_bootstrap_guide.md) — the one-time zero-to-one checklist for a brand-new project.

**AI-operating layer — read before acting as an agent inside a project built on this framework:**
11. [`11_ai_operating_rules.md`](./11_ai_operating_rules.md) — how an agent should actually behave, situation by situation. Read this before starting real work; documents 1–10 describe the system, this one describes your behavior inside it.
12. [`12_context_loading_strategy.md`](./12_context_loading_strategy.md) — the generalized mandatory/recommended/optional/never matrix per task type.
13. [`13_concept_ownership_model.md`](./13_concept_ownership_model.md) — check this before writing any fact into any document, to avoid duplicating something that already has a canonical owner.
14. [`14_evolution_rules.md`](./14_evolution_rules.md) — governs the project's entire life *after* bootstrap: when to create vs. extend vs. split vs. archive vs. reorganize.
15. [`15_framework_audit.md`](./15_framework_audit.md) — the self-consistency checklist for this document set itself, re-runnable after any future change to it.
16. [`16_agent_runtime_model.md`](./16_agent_runtime_model.md) — the execution-semantics view: states, transitions, entry/exit conditions, and a consolidated index of every decision tree in this document set. Read `04` first; this is that same process as a formal state machine, not a replacement for it.

If you only read one document beyond this index: read `16_agent_runtime_model.md` if you need to know precisely what state you're in and what to do next; `11_ai_operating_rules.md` if you need behavioral guidance for a specific situation; or `10_bootstrap_guide.md` if you are setting up a brand-new project. Everything else is the reasoning behind those three.

---

## One-Paragraph Summary

SDD, as practiced in the reference project, separates four concerns that are conventionally tangled together: **Specification** (what the system is/should do — living, mutable, the source of truth), **Architecture Decision Records** (why a significant decision was made — immutable once accepted, append-only), **Git** (how the code mechanically changed — infrastructure, not a content area), and **Release** (what was actually shipped to users, when — operational history, explicitly outside the specification tree). A fixed, mandatory-to-*evaluate* (not mandatory-to-*edit*) lifecycle runs on every implementation task, gating whether each of these four artifacts needs to change. Every fact has exactly one canonical owner (`13_concept_ownership_model.md`) — every other document references it, never restates it. The system is deliberately optimized for AI coding agents as primary authors, reviewers, and maintainers of the documentation, not just consumers of it (`11_ai_operating_rules.md`).
