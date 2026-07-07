# Implicit Conventions

Every convention below is followed consistently in the reference project but is **not** stated anywhere as an explicit written rule. These are inferred from repeated practice across many documents and many changes, not from any single instruction. Distinguish these from the explicit rules cataloged in earlier documents — an implicit convention is evidence of *working practice*, and is exactly as important to reproduce as an explicit rule, even though no one wrote it down.

## 1. The "Refs" Header Micro-Format

Almost every document, immediately after its H1 title, has a single line: `**Refs:** → [Doc A](path) · [Doc B](path) · ...` — an arrow followed by middle-dot-separated links to the most relevant related documents. No document explicitly requires this format. It is followed with near-total consistency anyway, because it gives a reader (human or agent) an instant "what else do I need to know" signal before reading a single line of content.

## 2. One New File + One Index Line Is the Universal Shape for Extension Points

Stated explicitly for exactly one case (adding a new pluggable capability to an integration architecture: one handler file + one registry entry, touching no shared orchestration code). Observed, but never generalized in writing, as the *same shape* for: adding a new ADR (one new file + one index line), adding a new release entry (one new file-section, or one new periodized file at year boundaries), and adding a new spec (one new numbered file + one index line). **General inferred principle:** any extensible category in this methodology should be designed so growth means "add one file, add one index line" — never "edit a shared file that every addition must touch." This is a strong, reusable architectural bias worth deliberately preserving in a new project even though the source project only wrote it down for one specific case.

## 3. "Reference, Don't Duplicate" Has a Specific Shape in Practice

The explicit rule says "reference the other doc instead of duplicating." In practice, the *shape* of a good reference is narrower than "any mention": it's a one-line pointer plus, if the referencing document needs at least a minimal self-contained shape (e.g., an interface contract document listing an operation that's fully specified elsewhere), the bare minimum needed to not send the reader away empty-handed (e.g., just the request/response shape, with "full state-machine/behavioral contract is authoritative in [other doc]" rather than either fully duplicating it or citing it with zero detail at all).

## 4. Extend the Canonical Document, Don't Create a Competing One

Never observed as a single written rule until it was made explicit for one specific rollout — but the pattern predates that: every major workflow addition in the reference project's history was made by adding a new numbered decision to the existing decision-tree document, or a new phase to the existing lifecycle document, never by writing `00_implementation_lifecycle_v2.md` or a parallel process document. **Treat "there is exactly one canonical document for any given process area, and it grows by extension" as load-bearing**, not just a one-time instruction.

## 5. New Top-Level Content Areas Get a Fixed Three-Step "Registration Ritual"

Every time a genuinely new top-level content area was introduced (an ADR area, a release area), the same three registrations happened together, every time: (1) a row added to the ownership map, (2) a section added to the master index, (3) a row added to the human-facing top-level README's documentation map. No document states "when you add a new area, do these three things" — but skipping any one of them was treated, when it happened, as an incompleteness to fix in the same task, not a follow-up.

## 6. "Never Delete, Always Archive" Is the Default Assumption for Any Removal

Stated explicitly in specific task instructions ("do not delete historical information") — but observed as the *default reflex* any time removal of anything was contemplated, not just when explicitly told. The unstated but consistently-applied test before deleting anything: "does this have any historical/reasoning value at all?" If yes, archive; only genuinely valueless, fully-disposable artifacts (e.g., a one-time raw test-run log with no unresolved findings) are ever candidates for outright deletion, and even those are archived by default unless deletion is explicitly requested.

## 7. Absolute Dates Only, Never Relative

Every date appearing anywhere in specs, ADRs, or release entries is an absolute `YYYY-MM-DD` — never "last week," "recently," or "a few sessions ago." This is never written as a rule; it's simply never violated. **Reason to preserve deliberately:** a document is often read long after it was written, by an agent or person with no memory of "when now was" at authorship time — relative dates silently rot into meaningless or misleading text the moment enough time passes.

## 8. Document Size Discipline Has an Unstated Exception for Frozen/Historical Content

The explicit size rule (target/soft-limit/hard-limit line counts, split-by-responsibility if exceeded) is written for *specifications*. It is never explicitly exempted for archived documents — but in practice, an archived document is never split for size, because splitting a frozen historical record would defeat the purpose of preserving it exactly as it was. **Inferred boundary of the rule:** size discipline applies to *living* documents only; a document that has been moved to archive is implicitly out of scope for it.

## 9. Ownership "Must Not Modify" Is Usually, But Not Strictly, Symmetric

When two areas have a natural pairing (e.g., a general-purpose layer and a specialized sub-layer carved out of it), each area's "must not modify" column usually names the other's owned files. This is not stated as a hard bidirectional-symmetry rule, and at least one pairing in the reference project is asymmetric on purpose (one side may read/coordinate where the other may not modify at all). **Do not assume every pairing must be perfectly symmetric** — treat symmetry as the common case, not an enforced invariant.

## 10. Commit Message Prefixes Follow an Unwritten Convention

Every commit in the reference project's history uses a short lowercase prefix (`feat:`, `fix:`, `docs:`, `test:`) before a concise imperative summary — matching the widely-known "Conventional Commits" convention. No document in `sdd/` states this as a required format, and no commit-linting tool enforces it. It is followed with effectively 100% consistency anyway. **This is worth writing down explicitly in a new project** rather than leaving it purely conventional, since an unstated convention is the first thing a new contributor (human or agent) will accidentally break.

## 11. A Spec/Code Conflict Resolution Order Exists Even Where Not Every Case Is Covered

The explicit conflict-resolution decision tree covers several named cases (a divergence noted in the always-loaded instructions file wins; a recently-written file usually means the spec is stale; the security/auth-critical implementation file is treated as always authoritative for its narrow domain; failing all else, check the file's own change history for intent). **Inferred generalization:** the underlying heuristic is "prefer whichever artifact was most recently and most deliberately touched for *this specific concern*," with an explicit hard exception carved out for security-critical code (which is trusted over any conflicting spec, on the theory that a stale security spec is more dangerous to trust than stale security code). A new project should decide, explicitly, whether it wants that same hard exception for its own security-critical paths, rather than assuming it by default.
