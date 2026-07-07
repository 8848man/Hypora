# Naming and Versioning Conventions

Every identifier scheme observed in the reference project, why it exists, and when to use which one. **General rule underlying all of them (Inferred):** each artifact type gets exactly one ID scheme, chosen to match how that artifact actually changes over time — sequential for append-only decision logs, dated for episodic events, semantic-version for independently-deployable components, numeric-prefix for a stable but occasionally-reordered document tree. Do not default to timestamp-only IDs everywhere; they're the *wrong* fit for anything except genuinely dated, episodic events.

## File Naming — Numeric Prefix per Area

**(Explicit, observed consistently across `sdd/context/`, `sdd/backend/`, `sdd/frontend/`, `sdd/infra/`)** — files within an area are numbered sequentially (`01_requirements.md`, `02_product_spec.md`, ...), with sub-numbering for a file split out of a parent (`04_1_ocr_log_extraction.md` splits out of `04_screen_spec.md`; `05_1_ocr_api_spec.md` splits out of `05_api_spec.md`; `08_1_ocr_ai_integration.md` splits out of `08_ai_integration_spec.md`). The number is the primary stable identity of the document — cross-references use the number+name, and the master index orders entries by it.

**When to use sub-numbering vs a new top-level number:** sub-numbering (`N_1_`, `N_2_`) is used when the new document is a focused extension of an existing numbered document's scope (e.g., one sub-feature's API contract, split out of the main API spec because it grew too large or too specialized). A new top-level number is used when the new document is a genuinely separate concern.

**Renumbering:** avoid it. The reference project's own governance rules explicitly favor *not* renumbering existing files even during a large restructuring, because it breaks every existing cross-reference for no benefit — new content gets a new number or a sub-number; existing numbers are treated as stable identifiers, not as a strict ordering that must stay contiguous.

## Requirement IDs

**(Explicit)** — functional requirements use `FR-<AREA>-<NN>` (e.g., `FR-AUTH-01`, `FR-DASH-03`), grouped by area within the requirements document, two-digit sequential within each area. This lets an implementation-level document cite exactly which requirement it satisfies without restating it.

## Business Entity Codes (Domain-Specific, Human-Readable)

**(Explicit)** — a core business entity gets a human-readable code distinct from its internal storage identifier, in the form `<PREFIX>-<YEAR>-<NNN>` (e.g., `INC-2026-041`), globally unique, generated via a dedicated sequence table keyed by year. The internal storage ID (a UUID) is never user-facing; the business code is what users and cross-references see. **General lesson:** if your domain has a primary entity users need to reference by name/number, give it a dedicated human-readable code separate from its storage key — don't expose the storage key as the user-facing identifier.

## Large Cross-Layer Authoritative Spec IDs

**(Explicit, one instance observed)** — a document of this type (see `03_document_lifecycle.md` #12) carries its own frontmatter: `Document ID: SPEC-<DOMAIN>-<NNN>`, `Version: <integer>.<integer>`, `Status: Draft | Authoritative | Superseded`, and if superseding a prior version, an explicit "supersedes vX.Y" note. This is opt-in — most documents rely on the numeric-filename scheme alone; this heavier scheme is reserved for the rare document explicitly declaring itself authoritative over competing definitions elsewhere.

## ADR IDs and Release IDs — Canonical Definitions Live Elsewhere

**This document does not restate them.** `ADR-NNNN` numbering and lifecycle are owned by `07_adr_process.md` (§Numbering, §Lifecycle). Component semver (`<component>-vMAJOR.MINOR.PATCH`, git-tag-anchored) and rollup dated IDs (`REL-YYYY-MM-DD`) are owned by `08_release_process.md`. This document's role is comparative only: both schemes exist because each fits how its artifact actually changes over time (append-only sequential for a decision log; tag-anchored semver for an independently-deployable component; dated for an episodic rollup) — see the general rule stated at the top of this document. If you need the actual ID format or lifecycle rule, go to the owning document; duplicating it here was an error in an earlier draft of this framework and has been removed.

## Status Vocabulary Summary

**Comparison only — each row's authoritative definition lives in the document that owns that artifact type (linked in `13_concept_ownership_model.md` if not already referenced elsewhere in this document set). This table exists because the comparison itself is a distinct, useful fact that no single artifact-owning document could state without duplicating the others.**

| Artifact type | Status values | Mutable after status set? |
|---|---|---|
| Regular spec (numeric-prefix) | No formal status field — presence in the live tree implies current; retirement is signaled by moving to archive, not a status flag | N/A |
| Large cross-layer authoritative spec | `Draft` \| `Authoritative` \| `Superseded` | Yes, until `Superseded`; content is edited in place |
| ADR | `Proposed` \| `Accepted` \| `Superseded by ADR-NNNN` \| `Deprecated` | **No** — an `Accepted` ADR's Decision/Consequences are immutable; only the Status line ever changes after acceptance |
| Archived document | Implicit `Archived` via header convention, not a formal field | No — frozen except for the one-time archival header |
| Relocation stub | Implicit `Moved` via header convention | Essentially never edited again |
| Release entry | No formal status — an entry only exists once something is actually deployed | No — a release entry is a historical fact, not edited after the fact except to fix an error |

## Archive / Relocation Header Convention

**(Explicit, observed consistently)** — two distinct patterns, easy to conflate but serving different purposes:

- **Archived (supersession):** the document's content has been fully replaced or is no longer live, but has historical value. Original filename is retained at the archive location; the H1 title gets `(Archived)` appended; a short header block states what superseded it and why, before the original content resumes unchanged.
- **Relocated (moved):** the document's content simply lives somewhere else now — nothing was superseded, the home just changed (typically because a cross-cutting home became necessary). The *old* path keeps a short permanent stub with a "Moved" notice and links to the new documents; there is no archived copy of old content because nothing old exists — it's the same content, just filed correctly now.

Do not use the archive pattern for a relocation, or vice versa — an archived document implies "this is no longer current, read it only for history"; a relocation stub implies "this is current, just filed elsewhere."

## Versioning for Independently-Deployable Components

**(Explicit)** — each independently-deployable component (a frontend app, a backend service) declares its own version in its own manifest (e.g., a package manifest's version field, an application object's version string) and is tagged in git at the exact commit that was actually deployed with that version. **Never** version the monorepo as a whole with a single number if its components deploy independently — this was an identified gap in the reference project (both components had declared `1.0.0` for a long time without the tag/release discipline actually being exercised) and was corrected by establishing real git tags as the anchor the moment release management was introduced.
