# `planning/` — Disposable Design-Validation Artifacts

**Not part of `sdd/`.** Nothing in this directory is a specification, is governed by `sdd/rules/spec_authoring_rules.md`, or is reachable from `sdd/00_index.md`. Contents here are throwaway prototypes built solely to validate a design or narrative decision before it is written up as a real specification — see `sdd/landing/planning/04_target_information_architecture.md` for the specification this directory's current contents were built to validate.

Do not reuse code from this directory in production. Do not treat anything here as a source of truth. Safe to delete once the design decision it supported has been finalized and promoted into `sdd/`.

## Contents

- `prototype/concept_a.html`, `concept_b.html`, `concept_c.html` — the three Landing narrative concepts, one page each. See `sdd/landing/planning/05_landing_concept_comparison.md`.
- `prototype/motion-system.css`, `motion-system.js` — the shared Motion Design System engine (utility classes, keyframes, scroll/reduced-motion logic) all three concept pages link to. See `sdd/landing/planning/08_motion_design_system.md`. Each concept page still carries its own small "Motion Configuration" token block for per-concept pacing — the engine is shared, the tuning is not.
- `prototype/landing_prototype.html` — an earlier, single-concept exploratory prototype, superseded by the three concept files above; kept only as prior-iteration history, not a current reference.
