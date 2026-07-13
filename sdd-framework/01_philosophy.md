# SDD Philosophy

## The Core Separation

The methodology separates four kinds of truth that most projects blend into one artifact (usually "the README" or "the code itself"):

| Artifact | Answers | Mutable? | Lives |
|---|---|---|---|
| **Specification** | What the system *is* / should do, right now | Yes — living document, edited in place as intent changes | `sdd/` |
| **Architecture Decision Record (ADR)** | *Why* a significant decision was made, at the time it was made | No — immutable once accepted; superseded by a new record, never rewritten | `sdd/architecture/decisions/` |
| **Git** | *How* the code mechanically changed, commit by commit | N/A — it's infrastructure, not a content area the methodology manages | the repository's own history |
| **Release** | What was actually delivered to users, and when | Append-only, periodized | `release/` — **outside** the specification tree |

**(Explicit, `sdd/rules/spec_authoring_rules.md` + the reference project's own operating-model commits)** — this four-way split is stated as an explicit design goal in the reference project, not something we're imposing after the fact. The project's own commit history shows it being introduced deliberately in a dedicated rollout, phase by phase.

## Principle 1 — Specification Is the Source of Truth

Not the code. Code is *evidence* of current behavior; it is never trusted to describe *correct* or *intended* behavior. When code and spec disagree, that is a defect to resolve — in whichever direction is actually correct — not a signal that the spec should be silently abandoned.

**(Inferred but strongly evidenced)** — earlier in the reference project's history, a rule existed that said the opposite ("when code and spec disagree, the code is correct"). That rule was later identified as being in direct contradiction with this principle and was rewritten. The lesson for a new project: state this principle explicitly, early, in the single document every task reads first (see `04_development_workflow.md`), because an unstated or contradicted version of this principle is exactly how specification drift accumulates unnoticed.

## Principle 2 — Specification Must Remain Independent of Implementation Details It Doesn't Need

A specification describes contracts and intent at the level of detail an implementer needs — but it is not a mirror of the code. It never contains a commit hash, a PR number, or a branch name. This is what allows the specification tree to be read, and even reused, without git access — a spec that only makes sense alongside a specific commit has failed at being a specification.

**(Explicit)** — this is stated as a governance rule in the reference project (extending `spec_authoring_rules.md`) and verified as true across every spec file in the reference project via a repository-wide search.

## Principle 3 — Specification Must Never Duplicate History

A specification is not a changelog. It records current/intended state, not a log of how that state was arrived at over time. Historical narrative, "we used to do X but changed to Y," and session-by-session change logs belong in Release documents or ADRs, never inline in a spec.

**(Explicit, `spec_authoring_rules.md`)**: "Avoid: narrative paragraphs, repeated explanations, historical context, analysis not tied to a build decision." This single rule is what prevents the spec tree from organically turning into an unbounded, ever-growing narrative — which is the single most common failure mode of documentation-heavy projects.

## Principle 4 — Documentation, Implementation, Validation, and Release Are One Process

Not four handoffs between four separate owners or four separate points in time. The same task that changes behavior is responsible for noticing whether specs, ADRs, and release records now need to change — in the same working session, ideally the same commit for specs.

**(Explicit)** — the reference project's lifecycle document states: "spec sync is part of the same commit as implementation — never a follow-up task." The methodology generalizes this same rule to ADR and Release as separate, but parallel, "same-task" obligations.

## Principle 5 — Evaluation Is Mandatory; the Resulting Edit Is Conditional

Every task must *ask* "does the spec need to change? does an ADR? does a release entry?" — but the correct answer for the overwhelming majority of small tasks is legitimately "no," stated explicitly, not silently skipped. Mandating the *check* without mandating a *forced edit* is what keeps the methodology from collapsing into governance theater on routine work.

**(Explicit)** — stated directly: "'No change required' is a valid result," paired with the existing rule that a spec found to be already-correct must say so explicitly rather than skip the check silently.

**The one general test underlying every artifact-specific version of this principle (Inferred — never stated once, in general form, anywhere; each artifact-specific document gives only its own instance):** *"Would skipping this check let something silently become true without anyone having decided it?"* If yes, the check is mandatory regardless of how small the task looks. This is the same test underneath the Specification-First A/B/C procedure, the ADR trigger list, and the Release "was this actually deployed" gate — each is a domain-specific instance of the same underlying question, applied to a different artifact. See `11_ai_operating_rules.md` for how an agent applies this test moment-to-moment while working.

## Principle 6 — Architecture Must Never Evolve Silently

If an implementation task introduces or changes an architecturally significant decision, that decision must either point at an existing ADR or produce a new one. A change that quietly breaks an established pattern, with no record of the decision to break it, is treated as incomplete work — regardless of whether the code itself is correct.

## Principle 7 — The Methodology Is Optimized for AI Agents as Primary Authors

Specifications in this methodology read like implementation contracts an agent can act on directly (exact function signatures, exact error tables, exact JSON shapes) rather than narrative product prose aimed at human stakeholders. This is a deliberate trade-off, not an oversight — it favors machine-actionable precision over readability-as-prose. Product-level narrative (vision, priorities, target users) is still recorded, but kept in a clearly separate, smaller area (`sdd/context/`) that implementation tasks are explicitly told *not* to load by default (see `05_validation_and_review.md` and `09_implicit_conventions.md`).

**(Explicit, `sdd/rules/spec_authoring_rules.md`)**: "Specifications are implementation-oriented documents written for AI implementation agents... not analysis reports, not essays."

## Principle 8 — The Framework Outlives, and Is Not Subordinate to, Its First Reference Implementation

Specification-Driven Development is the methodology. This document set is its codification. Sentinel is the first project this methodology was observed in and validated against — a reference implementation, not the methodology's origin and not its permanent source of truth. A project built on this framework does not inherit a generalized version of Sentinel; it inherits SDD itself, as currently best understood.

**(Explicit, `00_index.md`)** — the framework is described as an extraction of "the Specification-Driven Development (SDD) methodology observed in the Sentinel project," never as an extraction of Sentinel itself. This principle makes that distinction load-bearing rather than incidental.

Ownership follows directly: a project owns its own implementation of the methodology (its own specification tree, its own ADRs, its own evolution). No project — including Sentinel — owns the methodology itself. The framework does. A practice observed in a second or third project carries the same evidentiary weight as a practice observed in Sentinel, provided it meets the same Evidence discipline (`00_index.md`) — historical origin is not a source of permanent authority; only evidence meeting the same standard is.

## Why This Matters for a New Project

Without this separation, a project accumulates one of two failure modes over time: either the specification calcifies (nobody updates it because "the code is obviously right") and becomes actively misleading, or the specification balloons into an unmaintainable historical narrative that duplicates git log. The four-way split, plus the mandatory-evaluate/conditional-edit discipline, is the mechanism that avoids both failure modes simultaneously.

## Documentation and Runtime Are the Same Model, Viewed Twice

Everything above describes the methodology as documentation — directories, document types, artifact rules. `11_ai_operating_rules.md` and `16_agent_runtime_model.md` describe the identical process as agent behavior and as a formal state machine, respectively. These are not three competing descriptions to reconcile; they are one system described at three levels of formality (methodology → behavioral rules → execution states) for three different purposes (design intent, situational judgment, mechanical execution). A change to the process belongs in `04_development_workflow.md` first — the other two are derived views and must be updated to match, never the reverse.
