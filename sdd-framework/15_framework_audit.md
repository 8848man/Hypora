# Framework Audit

A re-runnable self-consistency checklist for this document set itself — the same discipline this framework asks of any project built on it (`14_evolution_rules.md`'s periodic-audit principle, applied reflexively). Re-run this whenever `sdd-framework/` itself is changed.

## Audit Checklist and Current Results

### 1. Every concept has exactly one canonical owner

**Method:** cross-check every substantive claim against `13_concept_ownership_model.md`.
**Result:** Pass, after this audit's own Phase 1 fix. One violation was found and corrected during this revision: `06_naming_and_versioning.md` independently restated ADR numbering/lifecycle (owned by `07`) and release ID/versioning rules (owned by `08`). Fixed by trimming `06` to a comparative role only, with both sections now pointing at their canonical owners. No other duplicate ownership found in this pass.

### 2. No document duplicates another

**Method:** read every document against every other for restated (not just related) content.
**Result:** Pass, with the same one fix as above. `02_directory_structure.md`'s brief ADR/Release directory summaries were checked against `07`/`08` and confirmed to be pointers ("see X for the full model"), not restatements — this is the correct pattern (a short summary plus an explicit redirect is not duplication; two independent full definitions of the same fact is).

### 3. Internal links remain valid

**Method:** automated sweep of every `](./*.md)` relative link across all 16 files.
**Result:** Pass. Zero broken links as of this revision (one was transiently broken mid-edit — a forward reference to this very file before it existed — and is resolved now that the file exists).

### 4. Reading order is consistent

**Method:** confirm `00_index.md`'s stated reading order matches the actual dependency order (a document should not be listed before documents it depends on to make sense).
**Result:** Pass. The foundational tier (1–10) is unchanged in order from the original draft and was already dependency-consistent. The new AI-operating tier (11–15) is listed after the foundational tier and is internally ordered so that `11_ai_operating_rules.md` (which references `01`, `04`, `05`, `07`, `13`, `14`) comes first among the new documents, consistent with it being the "read this before acting" entry point the index describes.

### 5. Bootstrap instructions are complete

**Method:** verify `10_bootstrap_guide.md`'s mandatory/optional table and step sequence reference every directory and process document actually described elsewhere in the set, and that nothing described elsewhere is missing from the bootstrap sequence.
**Result:** Pass, with one gap closed during this revision: the original `10_bootstrap_guide.md` conflated one-time setup with ongoing evolution (Phase 7's stated concern). Fixed by moving all ongoing-evolution content into the new `14_evolution_rules.md` and replacing it with genuinely new content this document set didn't have before: a First-Review Sequence and a First-Validation Sequence, closing the gap between "here's the general validation model" (`05`) and "here's what running it looks like the very first time on a brand-new project" (`10`).

### 6. AI operating rules are internally consistent

**Method:** check every rule in `11_ai_operating_rules.md` against the decision procedures it summarizes (`04`'s Specification-First/ADR gate, `05`'s validation levels, `07`'s ADR trigger list, `13`'s concept ownership, `14`'s evolution rules) for contradiction.
**Result:** Pass. No contradictions found. `11`'s "Handling Implementation Drift" section correctly defers to `04`'s conflict-resolution order rather than restating or altering it; its refusal criteria are a strict subset of situations already implied by the mandatory-evaluation principle in `01` (Principle 5) and the unifying test added to that principle during this revision — nothing in `11` invents a new standard the rest of the framework doesn't already imply.

### 7. The framework can be understood without access to the Sentinel repository

**Method:** re-read every document checking for a reference that only makes sense with Sentinel-specific knowledge (an actual endpoint name, an actual table name, a Sentinel-specific file path outside of explicitly-marked "(Explicit, source: ...)" evidence citations).
**Result:** Pass. Every Sentinel-specific detail that appears is inside an explicit evidence citation (marked `(Explicit, ...)` or `(Inferred)`) illustrating a *generalized* pattern — e.g., `INC-YYYY-NNN` is cited once in `06_naming_and_versioning.md` as an illustrative example of the general "business entity code" pattern, not as a requirement that a new project use that exact format. No document assumes the reader has Sentinel's actual `sdd/` tree open alongside it.

### 8. Runtime Verification — does the framework answer the core execution questions?

**Method:** pose each question directly and locate the specific document/section that answers it — an unanswerable question is a real gap, not a phrasing problem.

| Question | Answered by |
|---|---|
| How does an AI begin work? | `16_agent_runtime_model.md` — Idle → Task Received → Context Loading |
| How does it know what to read? | `12_context_loading_strategy.md`'s per-task-type tier matrix |
| How does it decide what to modify? | `04`'s Specification-First/ADR combined tree, executed in the Decision Making state (`16`) |
| How does it know validation is complete? | `05`'s L1–L5 decision tree; the Validation state's exit condition (`16`) is "all triggered levels pass" |
| How does it avoid duplicate documentation? | `13_concept_ownership_model.md`, checked before writing any fact |
| How does it know when to stop (task complete)? | The Completed state's entry condition (`16`): Drift Check run and Artifact Decision Matrix produced, with findings explicitly stated |
| When must a human become involved? | `11`'s refusal criteria plus its Request-Human-or-Continue decision tree; the Waiting for Human state's entry conditions (`16`) |

**Result:** Pass. Every question has a specific, locatable answer — none require synthesizing an answer from unstated implications across multiple documents.

## Residual, Explicitly Acknowledged Gaps (Not Failures — Scope Boundaries)

- This framework describes the methodology; it does not include actual working templates as separate files (e.g., a literal `ADR-0000-template.md` file) — templates are described in prose (required sections, in order) rather than provided as copy-paste-ready files, since the deliverable is documentation of the methodology, not a project starter kit. A team adopting this framework will need to write their own template files following `07_adr_process.md`'s "Required Sections" list.
- The per-task-type context-loading matrix in `12_context_loading_strategy.md` is a generalized starting point, not exhaustive — `12`'s own closing section ("Building Your Own Matrix for a New Task Type") explicitly anticipates and provides the test for extending it, rather than claiming completeness.
- This audit was performed by the same process that authored the framework in this revision, not by an independent reviewer — treat a genuinely independent second pass (a different agent or human, without having authored the content) as a valuable future validation step, not yet performed.

## Next Audit Trigger

Re-run this checklist the next time any document in `sdd-framework/` is added, split, or substantially edited — per `14_evolution_rules.md`'s own reorganization-warrants-scrutiny principle, applied to this framework's own maintenance.
