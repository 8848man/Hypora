# Specification Authoring Rules

**Refs:** → [00_index](../00_index.md) · [Ownership Map](./ownership.md) · [Implementation Lifecycle](../workflow/00_implementation_lifecycle.md)

Governs how every document under `sdd/` is written, regardless of area. Created at project inception, before the first content-bearing spec, per `10_bootstrap_guide.md` Step 1.

## Size Tiers

| Tier | Line count | Action |
|---|---|---|
| Target | ≤ 300 | Normal — no action needed |
| Soft limit | 300–450 | Consider splitting by responsibility on the next edit that touches the document |
| Hard limit | > 450 | Must split before the next content addition — see `14_evolution_rules.md` in the framework for the create-vs-extend decision tree |

**Exception:** archived documents (`sdd/archive/`) are frozen and exempt from size discipline — splitting a historical record for size would defeat the purpose of preserving it as-is.

## Splitting Rule

When a document exceeds its soft limit or accumulates a genuinely distinct sub-responsibility, split by responsibility, not by arbitrary section. Each resulting document must be independently meaningful on its own, not a fragment that only makes sense read alongside its siblings. Use a new top-level number for a genuinely separate concern; use sub-numbering (`N_1_`, `N_2_`) when the new document is a focused extension of an existing document's scope.

## Writing Style

- Bullets and tables over narrative prose. A table of facts is easier to scan, diff, and keep current than a paragraph saying the same thing.
- State current/intended state only. Never write historical narrative ("we used to do X, then changed to Y") inline in a spec — that belongs in an ADR (if it was a decision) or a future Release entry (if it was a delivered change).
- Specifications never contain a commit hash, PR number, or branch name. A spec must remain fully readable without git access.
- Omit anything that doesn't contribute. No filler sections, no restating what a linked document already says.

## Duplication Rule — Reference, Don't Copy

Before writing any fact into a document, check `13_concept_ownership_model.md` (framework) and this project's own concept ownership as it emerges. If a fact already has a canonical owner, reference it by link — do not restate it. A reference should give the bare minimum context needed so the reader isn't sent away empty-handed (e.g., "see [Product Vision](../context/01_product_vision.md) for the full roadmap" rather than either re-deriving the roadmap or a bare unexplained link).

## The "Refs" Header

Every document, immediately after its H1 title, carries one line:

```
**Refs:** → [Doc A](path) · [Doc B](path) · ...
```

Linking the most relevant related documents. This gives a reader an instant "what else do I need to know" signal before reading the content.

## Absolute Dates Only

Every date in any spec, ADR, or (future) release entry is `YYYY-MM-DD` — never "recently," "last sprint," or similar relative phrasing. A document is often read long after it was written, by a reader with no memory of "when now was" at authorship time.

## Status Vocabulary

Regular numeric-prefix specs (everything in `sdd/context/`, and any future `sdd/<layer>/`) carry no formal status field — presence in the live tree implies current; retirement is signaled by moving to `sdd/archive/`, never a status flag. ADRs use their own lifecycle (`Proposed` / `Accepted` / `Superseded by ADR-NNNN` / `Deprecated`) — see the framework's `07_adr_process.md`.
