# Evolution Rules

How the documentation tree grows and changes shape *after* initial bootstrap (see `10_bootstrap_guide.md` for zero-to-one setup; this document governs ongoing life). The goal stated by this document's own existence: prevent uncontrolled growth — every addition to the tree should be traceable to one of the rules below, not to "it seemed like it should go somewhere."

## Should a New Document Be Created, or an Existing One Extended?

```
Does this content belong to a concept already owned by an existing document?
  (check 13_concept_ownership_model.md)
        │
        ├── Yes → extend the existing document. Do not create a new one
        │         for content that already has a canonical home.
        │
        └── No → is this content a natural sub-topic of an existing
                  document that is still comfortably within its size
                  target?
                        │
                        ├── Yes → add a section to the existing document.
                        │
                        └── No → is the existing document already at or
                                  past its soft size limit, OR is this
                                  content a distinct enough concern that
                                  forcing it in would blur the existing
                                  document's single responsibility?
                                        │
                                        ├── Yes → create a new document
                                        │         (new top-level number, or
                                        │         a sub-number if it's a
                                        │         focused split of the
                                        │         existing one's scope).
                                        │
                                        └── No → extend the existing one.
```

**Never create a new document just because a new feature exists.** Most new features extend an already-owned document (the interface contract gets a new operation, the schema gets a new table, the domain doc gets a new entity's lifecycle). A new document is warranted only when the concept itself is new, not merely an instance of an existing concept.

## Should an Existing Specification Be Modified?

```
Does the implementation now differ from what this spec says?
        │
        ├── No → nothing to do.
        │
        └── Yes → is the implementation the intended/correct behavior?
                        │
                        ├── Yes → modify the spec to match, in the same
                        │         task as the implementation change.
                        │
                        ├── No (the implementation is the bug) →
                        │         fix the implementation instead; the spec
                        │         was correct, do not touch it.
                        │
                        └── Unclear which side is correct →
                                  this is a Conflict outcome — resolve via
                                  the conflict-resolution order
                                  (04_development_workflow.md) before
                                  either side is touched.
```

## Should a Directory Be Introduced?

A new directory (a new layer, a new cross-cutting capability, a new escape-hatch area like the reference project's `analysis/`) is warranted only when an entire *category* of document doesn't fit anywhere that exists — not when a single new document doesn't fit. If you're creating a directory for exactly one document and can't articulate what a second document in that directory would look like, you probably need a new document in an existing directory, not a new directory.

## Should a Document Be Archived?

```
Is this document's content still an accurate description of
current intent/behavior?
        │
        ├── Yes → not a candidate for archival.
        │
        └── No → was it superseded by a specific replacement
                  (a new document, a new ADR, a relocated home)?
                        │
                        ├── Yes → archive it (never delete), with a
                        │         header naming the replacement.
                        │         Use the "Archived" pattern if the
                        │         content itself is retired, or the
                        │         "Relocated" pattern if the content just
                        │         moved without being superseded
                        │         (06_naming_and_versioning.md).
                        │
                        └── No, it's simply no longer relevant
                            (e.g., a one-time analysis whose findings
                            were fully acted on) →
                                  archive it anyway unless there is an
                                  explicit instruction to delete outright.
                                  Default to preserving historical value.
```

## Should Documentation Be Reorganized (Multiple Documents, Not Just One)?

Reorganization (splitting a whole area, merging directories, renumbering a family of documents) is warranted when the *concept ownership model itself* has stopped matching reality — e.g., a capability that used to be owned by one layer now genuinely spans two, or an area has accumulated enough documents that its own index has become hard to navigate. This is qualitatively different from splitting one oversized document (routine, low-risk, happens continuously) — a reorganization changes cross-reference structure across many documents at once and should be treated with the same weight as an architecturally significant decision: **it likely warrants its own ADR**, recording why the old organization stopped fitting and what the new one is, specifically so a future reader isn't confused by a wave of unexplained file moves in the history.

## When Should a Feature Split Into Multiple Specifications?

Apply the same size/responsibility test as document creation generally: when a single document covering the feature has grown past its soft size limit, or when it's accumulated genuinely distinct sub-responsibilities that don't need to be read together (e.g., one API contract covering many unrelated operations; one screen spec covering many unrelated screens). Split by responsibility, never by arbitrary section — each resulting document should be independently meaningful, not a fragment that only makes sense alongside its siblings.

## Should the Framework Itself Evolve Beyond Its First Reference Implementation?

**(Governs `sdd-framework/`'s own evolution, distinct from how a single project's specification tree evolves under the rules above.)** Per `01_philosophy.md`, Principle 8, the framework owns the methodology; no single project — including Sentinel — owns it permanently. A practice observed in a project other than Sentinel is admissible into the framework under the same test this document already applies to promoting a project-local pattern into a shared one: it must be validated independently in a **second** real project before being generalized into the framework, never incorporated speculatively from one project's first attempt at something.

**Genuinely unowned today, named rather than solved:** this document set has no dedicated process for resolving a framework-level conflict — a validated practice from one project contradicting a rule originally sourced from another. Extending the existing ADR-supersession pattern (`07_adr_process.md`) to the framework's own rules is the anticipated shape of that process, but it is deliberately not built now, per the General Anti-Pattern below: decide it the first time a real conflict actually occurs, not ahead of one.

**"Reference Implementation" is a descriptive label, not a formal gate — considered and declined.** A project does not need to first qualify as a Reference Implementation before any of its practices can be cited; each practice is evidenced individually (Explicit/Inferred, per `00_index.md`), the same fine-grained discipline already applied to Sentinel. A project-level admission gate (formal criteria for when a project "becomes" a Reference Implementation) would shift evidence granularity from individually-verified practices to a coarser, harder-to-audit whole-project blessing — declined for that reason, not for lack of consideration, so this does not need re-deciding each time the question resurfaces.

## General Anti-Pattern to Guard Against

**(Inferred, but worth stating as a hard rule for this document specifically):** the most common failure mode in a maturing documentation tree is not "too few documents" — it's silent, uncoordinated proliferation, where every task creates one new small file rather than checking whether the content already has a home. Treat "can this extend something that already exists" as the default answer, and "this needs a new document" as the answer that requires justification, not the reverse.
