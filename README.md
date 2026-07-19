# Hypora — Changes This Session: AI Project Summary Feature

**Scope:** Everything from the pre-session baseline (`sync/repository-sync-20260717` @ `3855864`) through the Canvas-only redefinition, now merged into `develop` and deployed to production.

---

## 1. What's New

**Project Summary is no longer a purely derived, read-only checklist.** It is now a persisted, AI-synthesized **Business Identity narrative** — what the project is, who it's for, what problem it solves, what value it provides — generated automatically from the Business Canvas, with an explicit lifecycle and a user-controlled sync/edit flow.

This went through two design iterations in one session:

| Iteration | Read Context | Trigger | Status |
|---|---|---|---|
| v2.0.1 (initial build) | Canvas + MVP Plan + Validation Plan (whole-project) | Project reaches **Validated** stage | Superseded |
| v2.0.2 (current, shipped) | **Canvas only** | Business Canvas reaches **completion** (Structuring → Scoped) | Live in production |

The redefinition happened after a design review found the whole-project version conflated two responsibilities (project *identity* vs. project *readiness*), produced lower-quality AI output (narrative prose forced to also carry checklist-shaped planning data), and was the only capability in the AI Platform's Capability Matrix that recapped everything it read instead of drafting one bounded, new field like every other capability does.

---

## 2. Summary Lifecycle (new concept)

A new state machine, orthogonal to the existing Business Idea Lifecycle:

```
NotGenerated → Generating → Generated → OutOfSync → (Sync dialog Apply) → Generated
```

- **Initial Generation** fires automatically, exactly once per project, the moment the Business Canvas is complete — no button press, never blocks the UI, shows a loading state on the always-visible Summary Card.
- **OutOfSync** is triggered only by a Canvas edit after a summary exists. MVP Scope, Feature Planning, and Validation Checklist edits no longer affect it at all (this changed between v1 and v2 — v1 also went stale on MVP/Validation edits).
- Synchronization is always a deliberate, user-driven action: opening the Sync dialog never calls AI by itself; only pressing **AI Summary Update** does; the result is an editable draft the user can revise before **Apply** replaces the persisted summary.
- Readiness (MVP completion, Validation completion, Build-Ready confirmation) is **completely unaffected** by any of this — it remains the existing non-AI mechanism, untouched.

---

## 3. New AI Capability

**Project Summary Synthesis Assistant** — the 6th AI capability in the platform.

- **Contract Version 2.0** (breaking change from an initial 1.0 that additionally read MVP Scope and the Validation Checklist — removed entirely, not deprecated, since nothing outside this capability ever consumed those fields).
- Two operations sharing one contract: `initial_generation` (automatic) and `sync` (manual, from the dialog).
- Read Context: Business Canvas only.
- This capability introduced the AI Platform's **first-ever Automatic Invocation** — previously every AI capability required an explicit user click ("Manual-first"). This is a narrowly-scoped, single-capability, single-operation exception, not a general precedent.

---

## 4. Architecture Decisions Recorded

| ADR | Decision |
|---|---|
| **ADR-0016** | Project Summary becomes a persisted artifact with an explicit lifecycle, instead of a value recomputed on every page view |
| **ADR-0017** | Introduces Automatic Invocation as a narrow, one-off exception to Manual-first, scoped to this one capability's Initial Generation operation |
| **ADR-0018** | Narrows the capability to Business Canvas identity synthesis; moves the automatic trigger from "Validated" to "Canvas complete"; narrows OutOfSync accordingly; bumps the contract to 2.0 |

ADR-0016 and ADR-0017 were **partially superseded**, not rewritten — their core theses (persisted lifecycle shape; the Automatic Invocation exception itself) remain in force; only the specific Read Context / trigger-condition details changed, per this project's rule against editing an Accepted ADR's Decision in place.

---

## 5. Code Changes (by layer)

- **Domain:** new `summaryLifecycle.ts` (trigger condition, OutOfSync detection) and a `summary` field added to the `Project` type, with forward-compatible defaults for projects saved before this feature existed.
- **Server:** new capability class, prompt template, request validator, and `/api/project-summary-assistant` route; registered in the existing provider-agnostic container alongside the other five capabilities — no changes to Provider selection, DI, or any other capability's code.
- **Client:** new hook (`useProjectSummaryAssistant`) built as a thin wrapper over the existing generic AI-interaction hook — no new state machinery invented.
- **UI:** new `SummaryCard` and `SyncSummaryDialog` components; `SummaryPage` wired to trigger generation automatically and render the lifecycle states.
- **Removed:** two context-builder functions (`buildFeaturePlanContext`, `buildValidationContext`) added for the whole-project version, deleted once the Canvas-only redefinition made them dead code.

---

## 6. Investigated and Resolved: Apparent AI Regression

Mid-session, existing AI features appeared to start returning fake/placeholder text (`[fake-provider] ...`) instead of real Gemini output. Root-caused to **not be a code regression at all**: the local dev server used to preview the app had been launched without loading the real `.env` credential file, so it silently fell back to `FakeProvider`. Confirmed via direct comparison (same code, with vs. without the credential loaded) and fixed by relaunching correctly — no application code was changed as a result.

---

## 7. Deployment

- Deployed to **production**: `hypora-2026.vercel.app` (Vercel project `ttuis-projects/app`), verified live with real Gemini output and zero runtime errors in the post-deploy log scan.

---

## 8. Repository Cleanup

- `feature/project-summary-ai-sync` (this session's work) merged into `develop` (confirmed already fully contained after syncing with `origin/develop`).
- All local branches except `develop` and `main` deleted (remote branches on `origin` untouched).
- `develop` synced with `main`; both now point at the same commit, with `develop` 2 commits ahead of `origin/develop` (not yet pushed).
