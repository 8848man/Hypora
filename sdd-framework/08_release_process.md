# Release Documentation Strategy

## Why Release Lives Outside the Specification Tree

**(Explicit)** — `release/` sits at the repository root, as a sibling to `sdd/`, not nested inside it. The reasoning is symmetric to why specs must never contain commit hashes (see `01_philosophy.md`, Principle 2): a specification describes what the system is/should be, independent of whether or when it has actually been deployed anywhere. Release records describe what was *actually shipped, to real infrastructure, at a real point in time* — content that is inherently tied to this specific repository's real deployment history (real hosting URLs, real cloud project identifiers, real migration state at deploy time). Mixing the two would compromise the specification tree's portability: a spec that accidentally depends on release history stops being reusable if the repository (and its deployment history) disappears.

**Corollary: Specifications must remain unaware of releases.** No spec should reference a release entry, a deployed version, or deployment status — a spec can and often does describe a feature not yet released at all.

## Structure

```
release/
├── 000_index.md      # currently released versions + rules, single entry point
├── project/           # dated rollup entries — REL-YYYY-MM-DD
│   └── <year>.md       # periodized to bound file growth
├── frontend/           # component release log — semver, git-tag anchored
│   └── <year>.md
└── backend/            # component release log — semver, git-tag anchored
    └── <year>.md
```

Periodizing by year (one file per year per sub-area) mirrors the same size discipline the specification tree applies to its own documents — an unbounded single changelog file was the exact failure mode this structure replaces (see "Migrating an Existing Changelog," below).

## Independent Component Versioning

**(Explicit)** — each independently-deployable component (frontend, backend, or any other separately-deployed service) maintains its **own** semantic version, incremented independently of the others. A frontend patch release does not require a backend version bump, and vice versa. This matches how the components actually deploy in practice (a frontend-only change can go out via a single deploy script without touching the backend at all).

## The Rollup Layer (Project Release)

**(Explicit)** — a "Project Release" is a periodic, dated, user-facing rollup: "what did users actually get, and when." It **references** the component versions it bundles; it never duplicates their technical detail (migration IDs, exact build flags). Direction of reference is strictly one-way:

```
Project Release ──references──▶ Frontend version, Backend version
Frontend/Backend release logs ──NEVER reference──▶ Project Release
```

Making component releases point back up to a project release would create a fragile dependency — a backend hotfix might ship between project rollups, or no project rollup might exist yet when a component release is cut. Component logs must stand alone; the rollup is curation layered on top, never a required parent.

## Referencing Git

**(Explicit)** — every release entry (component or rollup) references the actual **git tag** that was deployed, never a raw commit hash. Tag first (`<component>-vX.Y.Z` at the exact commit deployed), then write the entry referencing that tag. A release entry that only has a commit hash to point to, with no corresponding tag, is treated as incomplete — cut the tag as part of writing the entry, don't skip it because "the commit hash is right there anyway." Namespacing tags by component (`frontend-v1.0.0`, `backend-v1.0.0`) avoids collisions in a repository hosting more than one independently-versioned component.

## When to Write a Release Entry

**(Explicit)** — only when something is **actually deployed**. Never at commit time, never speculatively, never as a "we're about to deploy this" placeholder. A commit is not a release. This is enforced as an explicit gate in the development lifecycle (see `04_development_workflow.md`, Phase 9 — Release Decision) precisely so that "deployed" and "committed" are never conflated in the record.

## Release Index

A single `release/000_index.md` states: the currently released version of every independently-deployable component, where it's deployed (real URL/target), and links into the periodized history for each sub-area. This is the one file that must always be current — everything else in `release/` is append-only history.

## Migrating an Existing Changelog

**(Explicit, observed pattern)** — if a project already has an informal running changelog (a single hand-appended file mixing commit references, feature descriptions, and deploy notes across an unbounded time span), migrate its existing entries into the new rollup layer as `REL-YYYY-MM-DD` entries (its content is already release notes in substance, just unstructured), then archive the original file in full (see `03_document_lifecycle.md`, Archived Document) rather than deleting it or leaving it running in parallel with the new structure. Do not attempt to retroactively assign precise semantic versions to every historical component state if the exact version at each historical point isn't independently verifiable — note candidly that pre-migration history predates the tagging convention, and anchor only the current/baseline state with real tags going forward.

## What Release Explicitly Does Not Do

- It does not restate a diff already visible in git — no line-by-line change lists, no file-by-file diffs. That's what `git log`/`git show` are for; duplicating it here is wasted maintenance with no informational benefit.
- It does not replace an ADR — a release entry may narratively mention that a deployment included a particular architectural decision, but the reasoning behind that decision lives only in the ADR, never copied into the release record.
- It does not gate or require a specification update — a spec change and a release are governed by entirely separate decisions in the lifecycle (Phase 7 vs. Phase 9) and can happen independently of each other.
