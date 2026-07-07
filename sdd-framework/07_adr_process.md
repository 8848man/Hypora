# Architectural Decision Process

## Where ADRs Live and Why

ADRs live under `sdd/architecture/decisions/`, inside the specification tree's directory structure but conceptually a **peer to Specification, not a subtype of it**. This distinction is load-bearing, not cosmetic:

- **Specification** answers "what is true now" — living, mutable, edited in place as intent changes.
- **ADR** answers "why was this decided, at the time it was decided" — a historical record, immutable once accepted.

If ADRs were treated as "a kind of spec," the temptation to edit an ADR's reasoning in place (the way a spec is edited) would quietly destroy the historical record an ADR exists to preserve. Keeping them structurally separate is what keeps that distinction enforceable rather than just aspirational.

## When a New ADR Is Required

**(Explicit)** — an ADR is required when a decision meets **any** of these:

- Spans more than one area in the ownership map
- Is expensive or risky to reverse later
- Was chosen among genuinely viable alternatives that were seriously considered
- Would not be reconstructible by a future reader just from reading the resulting code

## When an ADR Is Never Required

**(Explicit)** — routine CRUD endpoints, a new capability added to an existing plugin/handler architecture that follows the established registration pattern, a new UI surface following an existing reference pattern, ordinary bug fixes, and most refactors. Forcing an ADR here is treated as governance overhead the project's own authoring-style rules already argue against ("omit anything that doesn't contribute").

## Decision Tree

```
Does this change span more than one owned area?
        │
    ┌───┴───┐
   Yes      No
    │        │
  ADR    Is it expensive/risky to reverse later?
required        │
            ┌───┴───┐
           Yes      No
            │        │
          ADR    Was it chosen among real, seriously-considered
        required  alternatives?
                        │
                    ┌───┴───┐
                   Yes      No
                    │        │
                  ADR    Would a future reader be unable to
                required  reconstruct the reasoning from the code alone?
                                │
                            ┌───┴───┐
                           Yes      No
                            │        │
                          ADR     No ADR needed — implement directly,
                        required  citing the existing pattern if one applies.
```

Any single "Yes" anywhere in this chain is sufficient — the four triggers are independent, not cumulative.

## Lifecycle

```
Proposed → Accepted → Superseded by ADR-NNNN
                    ↘ Deprecated
```

- **Proposed:** drafted, not yet binding.
- **Accepted:** binding. From this point, the Decision and Consequences sections are **immutable**.
- **Superseded:** a later ADR replaces this decision's reasoning. The old ADR's Status line changes to `Superseded by ADR-NNNN`; its body is never rewritten. The new decision gets a brand-new, never-reused number.
- **Deprecated:** the decision no longer applies (e.g., the feature it governed was removed) but wasn't replaced by a new decision — distinct from being *superseded* by a better decision.

**Immutability rule in full:** non-substantive fixes (a typo, a broken link, adding a missed "affects" reference) may be edited in place at any status. Any change to the actual Decision or Consequences after `Accepted` requires a brand-new ADR number, full stop.

## Numbering

`ADR-NNNN`, four-digit zero-padded, strictly sequential, starting at `0001`, never reused even for a rejected proposal or a since-superseded decision. A running index file lists every ADR with its current status and a one-line summary — this index is the only place that needs updating on every new ADR; individual ADR files never reference each other's existence except via an explicit "Affects" or "Supersedes/Superseded by" relationship.

## Required Sections (Template)

- **Title** — one line, the decision itself, not the problem.
- **Status** — per the lifecycle above.
- **Date**
- **Affects specs** — which specification documents this decision shapes.
- **Context** — the situation that made a decision necessary. Facts only, not the decision.
- **Decision** — what was decided, one clear sentence plus supporting detail.
- **Alternatives Considered** — each rejected alternative with a one-line reason for rejection. This section is what makes an ADR actually useful later — a decision without its rejected alternatives is much easier to accidentally re-litigate or reverse without realizing why it was made that way.
- **Consequences** — what becomes easier or harder as a result; trade-offs knowingly accepted.
- Optional, never required: a trailing "Implementation commit(s)" or "Originated from" field for provenance — see reference-direction rules below.

## Reference Direction Rules

- **ADR → Specification: required.** Every ADR names the spec(s) its decision affects.
- **ADR → Release: never required.** A decision is made once; its implementation may ship across multiple releases or none yet. Coupling an ADR to one release creates a fragile, meaningless dependency. A release note may optionally *mention* an ADR narratively — never the reverse as a structural requirement.
- **ADR → Commit hash: optional, and never required for the ADR to be meaningful.** If included at all, it's a trailing provenance note ("Implementation commit(s): ..."). The ADR's Context/Decision/Consequences must remain fully understandable with that field stripped out entirely — this is what preserves the specification tree's portability if the repository's git history is ever unavailable.
- **ADR → Issue/task tracker ID: optional**, same treatment as commit hashes.

## Ownership and Sign-Off

The area proposing the decision owns drafting the ADR. Any ADR whose consequences span more than one area — which, per the trigger list above, describes most ADRs by definition — requires sign-off from every affected area before its Status can move to `Accepted`.

## Backfilling Retroactively

**(Explicit, observed in the reference project's own operating-model rollout)** — when ADR is introduced into a project that already has a real implementation history, retroactively write ADRs for the handful of already-made, still-undocumented decisions that meet the trigger list above, mining whatever design discussion or draft analysis documents already exist (even informal ones) for the "alternatives considered" reasoning before those documents are archived. Mark these backfilled ADRs' dates as approximate if the exact original decision date isn't recoverable, and note in the ADR that it was reconstructed rather than written contemporaneously — don't fabricate a false appearance of having been written at decision time.
