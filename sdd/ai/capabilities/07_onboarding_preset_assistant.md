# Capability: Onboarding Preset Assistant

**Refs:** → [Capability Index](./000_index.md) · [AI Platform Architecture](../01_architecture.md) · [Ownership Model](../03_ownership_model.md) · [AI Interaction Specification](../04_ai_interaction.md) · [Canvas Assistant](./01_canvas_assistant.md) · [Project Management](../../workspace/features/01_project_management.md) · [Business Structuring](../../workspace/features/02_business_structuring.md) · [Question Model & Preset Strategy](../../workspace/features/02_1_question_model.md) · [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) · [ADR-0021](../../architecture/decisions/ADR-0021-always-concrete-onboarding-presets.md)

**Contract Version:** 2.0 — **Stable** (Project Management is an implemented Consumer). Bumped from 1.0 → 2.0 (Major, breaking) per [ADR-0021](../../architecture/decisions/ADR-0021-always-concrete-onboarding-presets.md): the Sufficiency/Thinking-Prompts discriminated union is removed entirely — every successful Response is now unconditionally a full five-question preset batch. 1.0's shape is preserved in Contract Version History below, not restated here.

*(Introduced by [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) as a distinct capability from [Canvas Assistant](./01_canvas_assistant.md), per the [Capability Promotion Rules](./000_index.md#capability-promotion-rules)' mandatory trigger — this capability's Response Contract, a five-question batch, diverges from Canvas Assistant's single-suggestion-per-request shape.)*

## Purpose

Give a newly created Project's Business Structuring guided flow tailored starting presets — instead of only generic, static ones — derived from the Project's Name and optional Description, the moment the Project is created. Realizes the [Preset Strategy](../../workspace/features/02_1_question_model.md#preset-strategy)'s long-anticipated "V2 seam": an AI-based Preset Provider behind the identical Input/Output contract the Question Model already defines. Per [ADR-0021](../../architecture/decisions/ADR-0021-always-concrete-onboarding-presets.md), this capability's sole output shape is always selectable, concrete presets — it never substitutes a different, non-selectable content type for any question.

## Responsibility

**In scope:**
- Producing tailored preset options for all five Canvas questions (Business Idea, Problem, Target Customer, Solution, Value Proposition) in a single request, using the Project's Name and, if present, Description.
- When Name/Description are thin, still producing concrete, specific example presets — inventing plausible specifics rather than asking the user open-ended questions in their place — per [ADR-0021](../../architecture/decisions/ADR-0021-always-concrete-onboarding-presets.md) Decision 1.
- Validating every generated option against the Content Quality Validation rules below before the Response is accepted.

**Out of scope (see also Out of Scope below):**
- Generating presets for any question after Project creation — this capability is invoked exactly once per Project (see [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) Decision 7). Every later per-question suggestion or regeneration is [Canvas Assistant](./01_canvas_assistant.md)'s existing manual behavior, unaffected by this capability.
- Writing to any Canvas field. This capability never produces an answer directly — only preset options, presented through Business Structuring's existing select-or-customize interaction.
- Any non-selectable content type (open-ended questions, hints, "thinking prompts") — retired per [ADR-0021](../../architecture/decisions/ADR-0021-always-concrete-onboarding-presets.md); see Contract Version History.
- A second, automatic re-prompt of the Provider within one invocation to "fix" content that fails validation — see Content Quality Validation below; a validation failure resolves via the existing Fallback path, never a retry loop.

## Consumers

- [Project Management](../../workspace/features/01_project_management.md) — invokes this capability automatically, once, immediately after a Project is created (Name confirmed, Description present or not). Project Management, not Business Structuring, is the Consumer because the invocation happens at creation time, before Business Structuring is ever opened; the resulting presets are handed to Business Structuring to render when the user reaches each question, per [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md).

## Relationship to Other Capabilities

- **Canvas Assistant ([01](./01_canvas_assistant.md)):** a sibling, not a dependency in either direction. Canvas Assistant is never invoked by this capability, and this capability's output is never read by Canvas Assistant — each is a self-contained Preset Provider (see [Question Model & Preset Strategy](../../workspace/features/02_1_question_model.md#preset-strategy)'s three-provider table) that happens to serve the same five questions at different moments in the Project's life. A user's later manual "Ask AI" invocation on a question (Canvas Assistant) is informed by that question's *current* answers and prior questions, per Canvas Assistant's own Request Contract — it does not read this capability's original output; the two capabilities share no state.
- **Every other AI Capability (02–06):** no relationship. This capability's Read Context (Project name/description only) never overlaps with Risk Memo, MVP Planning, Validation Planning, Feature Suggestion, or Project Summary Synthesis's own Read Contexts, per [AI Ownership Model](../03_ownership_model.md#capability-matrix)'s Capability Matrix — no shared context, no invocation ordering dependency, no output dependency.
- **Invocation ownership:** exclusively [Project Management](../../workspace/features/01_project_management.md), per Consumers above — no other Feature may trigger this capability, and Project Management may not trigger any other capability in its place.
- **Lifecycle ownership:** this capability's own Response is stateless and lives only for the duration of one invocation (per [Conversation Policy](../04_ai_interaction.md#conversation-policy)); what happens to that Response afterward — whether and how it is retained — is owned by [Project Management](../../workspace/features/01_project_management.md) as the Consumer, per Response Metadata & Persistence below, not by this capability itself.

## Request Contract

*(Conceptual shape — field meaning, not an API/DTO definition; the binding technical shape is authored when this capability is implemented, per [ADR-0006](../../architecture/decisions/ADR-0006-ai-as-platform-capability.md). Unchanged by Contract Version 2.0 — only the Response Contract changed.)*

| Field | Meaning |
|---|---|
| Project name | The Project's required Name, per [Workspace Data & State](../../workspace/02_data_and_state.md) |
| Project description (optional) | The Project's optional Description, per [Workspace Data & State](../../workspace/02_data_and_state.md)'s update — the primary signal distinguishing a well-specified idea from a bare, generic Name |
| Language | The user's current language, per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md) |

There is no "current answers/context" field, unlike the Preset Strategy's general Preset Provider contract — at the moment this capability is invoked, no Canvas question has been answered yet; every question's presets are generated from Name/Description alone, in one batch.

**Validation rules (Request):** Project name must be non-empty (Project Management's own creation-form Validation State already guarantees this before this capability can be invoked, per [Project Management](../../workspace/features/01_project_management.md#user-interaction) — this capability does not re-validate it, only relies on it). Project description, if present, has no minimum length or format — an empty string and an absent field are treated identically (both mean "no Description was given").

## Response Contract

| Field | Meaning |
|---|---|
| Presets | Per-question localized preset sets for **all five** Canvas questions — 3–5 options each, in the exact shape the [Preset Strategy](../../workspace/features/02_1_question_model.md#preset-strategy)'s Preset Provider contract already defines |

Every successful Response carries presets for all five questions, unconditionally — there is no longer a second Response shape. Per [ADR-0021](../../architecture/decisions/ADR-0021-always-concrete-onboarding-presets.md), a thin Name/Description is handled by the model inventing plausible, concrete specifics, never by returning a different content type or fewer questions.

**Validation rules (Response):** a Response is well-formed only if it carries preset sets for **all five** Canvas questions, each with 3–5 non-empty option strings that additionally pass Content Quality Validation below — a Response carrying presets for fewer than five questions, or fewer than 3 *valid* options for any one of them (after Content Quality Validation filtering), is treated identically to a Provider/Service failure (see Failure Scenario Matrix), never partially accepted. This all-or-nothing validation exists because a partially-tailored batch (e.g., three AI questions and two silently missing) would be indistinguishable from a bug to the user, and Business Structuring has no way to ask this capability for "just the missing two" without a second call, which [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) Decision 2 already ruled out.

**Content Quality Validation.** Per [ADR-0021](../../architecture/decisions/ADR-0021-always-concrete-onboarding-presets.md) Decision 3, every generated option string is checked against a Rejection Pattern set before the Response is accepted:
- Contains a placeholder/template marker: `[`, `]`, `{`, `}`, `<`, `>`.
- Starts with a generic, category-naming noun instead of a concrete statement — e.g. "Process", "Workflow", "Feature", "System", "Platform" (and direct translations in the response's own language).
- Reads as a label or category name rather than a complete, natural-language statement (e.g. unfinished sentences, bare noun phrases with no verb).

An option failing any Rejection Pattern is **dropped** from its question's option list, not repaired or reworded. If a question's surviving option count falls below 3, the entire Response is invalid (per the all-or-nothing rule above) and this capability's invocation resolves to `Fallback` — the static V1 provider — exactly as any other invalid Response would. **No second Provider call is made to regenerate the rejected content** — see [ADR-0021](../../architecture/decisions/ADR-0021-always-concrete-onboarding-presets.md) Decision 4 for why (a single-call capability, per [ADR-0011](../../architecture/decisions/ADR-0011-defer-multi-step-workflow-orchestration.md), stays single-call even when its own output fails its own quality bar).

**Confidence handling:** not applicable to this capability. Unlike [Canvas Assistant](./01_canvas_assistant.md#response-contract) and [Project Summary Synthesis Assistant](./06_project_summary_synthesis_assistant.md#response-contract), whose optional rationale supports a single accept/reject decision on one suggestion, this capability's output is a *menu* of options the user browses at their own pace within Business Structuring's existing interaction — no per-preset confidence score is surfaced, consistent with the [Preset Strategy](../../workspace/features/02_1_question_model.md#preset-strategy)'s existing shape, where a static preset never carries one either.

## Contract Version History

*(Per [Contract Versioning](./000_index.md#contract-versioning) — a superseded version's shape stays documented here, never deleted, since this capability file as a whole remains current.)*

**Version 1.0 (Superseded by 2.0, per [ADR-0021](../../architecture/decisions/ADR-0021-always-concrete-onboarding-presets.md)):** Response Contract was a discriminated union: `Sufficiency: "sufficient" | "insufficient"`; when `sufficient`, `Presets` for all five questions (as in 2.0); when `insufficient`, a `Thinking Prompts` field (3–5 open-ended questions for the Business Idea question only, with the remaining four questions implicitly falling back to the static provider). Removed entirely in 2.0 — a real usage regression showed the `insufficient` branch left the Business Idea question with zero selectable options, contradicting the product's own select-or-customize interaction model. See [ADR-0021](../../architecture/decisions/ADR-0021-always-concrete-onboarding-presets.md) Context.

## Response Metadata & Persistence

| Field | Persisted / Cached / Transient / Regenerated | Reasoning |
|---|---|---|
| Presets (per question) | **Persisted**, on the Project, until the user leaves that question with a saved answer, at which point they become irrelevant (the question is answered) but are not actively deleted — see [Workspace Data & State](../../workspace/02_data_and_state.md)'s forward-compatibility rule; no cleanup mechanism is introduced by this capability | Must survive navigation away from and back to Business Structuring before every question has been answered (per [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) Decision 2, this capability is never re-invoked, so if its output weren't persisted, revisiting an unanswered question later would silently fall back to static presets — an inconsistent, confusing experience the capability's own one-shot design would otherwise create by accident) |
| Provider information (which Provider produced the Response — AI vs. static) | **Not modeled at all.** Per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md)'s and this project's established "no AI-provenance marker" precedent (already binding for every accepted Canvas suggestion), the Project record never distinguishes "these presets came from AI" from "these are static" — Business Structuring's rendering only needs to know *which presets exist right now*, never their provenance. |
| Generation timestamp | **Not modeled.** No existing capability persists an invocation timestamp except Project Summary's `generatedAt`, which exists specifically for OutOfSync staleness comparison — a concept this capability has no equivalent of, since it is never re-triggered and never goes stale, per [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) Decision 4. |
| Prompt version | **Not modeled as Project-persisted data.** Prompt versioning is already an AI Application Service-owned responsibility per [AI Ownership Model](../03_ownership_model.md#prompt-ownership) — this capability does not duplicate that tracking into Workspace-owned data. |

## Lifecycle

*(Deliberately much smaller than [Project Summary](../../workspace/features/05_project_summary.md#summary-lifecycle)'s four-state Summary Lifecycle — that lifecycle exists to track staleness across repeated regeneration; this capability is never re-triggered and has no staleness concept, per [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) Decision 4, so a comparably heavy state machine would be unjustified new architecture.)*

| State | Meaning | Transition |
|---|---|---|
| **NotStarted** | Never independently observable for a Project this capability applies to — Project Management writes `Generating` in the same synchronous save as Project creation itself (see Frontend Representation below), so there is no persisted moment where a Project exists without at least `Generating` already set. Distinct from a pre-AI-era Project, which has no `onboardingPresets` at all — see Frontend Representation's `none` case. | → `Generating`, in the same write as Project creation, per ADR-0019 Decision 7 |
| **Generating** | The call is in flight | → `Ready` (a valid, fully-populated Response received) or → `Fallback` (Provider/Service failure, malformed Response, timeout, Content Quality Validation failure, or an orphaned request — see Failure Scenario Matrix and Frontend Representation below) |
| **Ready** | Presets are persisted on the Project and available to Business Structuring | Terminal — never transitions elsewhere. Not re-entered by a later Description edit, per Acceptance Criteria's existing "one-time snapshot" rule |
| **Fallback** | No AI-sourced content exists for this Project; every question uses static V1 presets | Terminal — never transitions elsewhere. Reached identically whether the cause was an outright failure, a malformed Response, a Content Quality Validation failure, or an orphaned in-flight request (browser refresh mid-generation); the causes are not distinguished in persisted state, only in developer-facing logs, since the user-visible outcome is identical either way |

### Frontend Representation

*(Added to close a real timing bug: without a persisted `Generating` state, a Project mid-generation and a pre-AI-era Project with no onboarding metadata both read back as `undefined`, giving Business Structuring no way to avoid rendering static presets before the pending request resolved. This subsection is the authoritative mapping from the abstract Lifecycle above to what is actually stored/read in the frontend — extend this section, not a new document, for any future change to this mapping.)*

| Lifecycle state | Frontend representation |
|---|---|
| `Generating` | `Project.onboardingPresets = { status: "generating" }`, written synchronously by [Project Management](../../workspace/features/01_project_management.md) (`ProjectListPage.tsx`'s `handleCreate`) in the same `saveProject` call that creates the Project — never a separate write, never a window where the field is `undefined` for a Project this capability applies to. |
| `Ready` | `Project.onboardingPresets = { status: "ready", presets: {...} }`, written when the registered pending call (see `onboardingPresetsRegistry.ts`) resolves successfully — see [Project Management](../../workspace/features/01_project_management.md)'s own Persistence section. |
| `Fallback` | `Project.onboardingPresets = { status: "fallback" }` — written on outright failure, or self-healed from an orphaned `Generating` (see below). |
| Not applicable (pre-AI-era Project) | `Project.onboardingPresets` is `undefined`/absent entirely — [Business Structuring](../../workspace/features/02_business_structuring.md)'s rendering treats this identically to `Fallback` (immediate static presets, no loading state), but the two are represented differently in storage precisely so a `Generating` Project is never confused with one that simply predates this capability. |

**Orphaned `Generating` self-heals to `Fallback`, deterministically, on next load.** The pending-call registry (`onboardingPresetsRegistry.ts`) is in-memory only and does not survive a browser refresh. If a Project is loaded (`useProjectLoader`, `src/features/useProject.ts`) with `onboardingPresets.status === "generating"` but no matching entry exists in the registry, the original request is unobservable — the loader writes `{ status: "fallback" }` immediately rather than leaving the Project in `Generating` indefinitely. This is not a retry (this capability is never re-invoked, per Decision 6) — it is the same accepted degradation [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md)'s Consequences already named ("a user who reaches [the trigger] while offline or mid-navigation may not see generation start... an acceptable, non-blocking degradation"), now made deterministic instead of leaving the Project stuck.

**How Business Structuring learns "generation is pending."** `onboardingStatus(project)` (`questionModel.ts`) reads `project.onboardingPresets?.status ?? "none"` and is checked *before* `resolvePresets()` is ever called — `resolvePresets()` itself has no `Generating` branch and always resolves to a fallback-capable answer, by design (see that function's own doc comment). Rendering the loading state instead of static presets is a rendering-layer decision made by `BusinessStructuringPage.tsx`, not a change to preset-resolution priority.

**There is no user-visible `Failed` state distinct from `Fallback`**, and no `Regeneration`/`Description-Updated`/`Navigation-Update` transition exists for this capability — unchanged from the reasoning already established for Contract Version 1.0 (every failure mode, including a Content Quality Validation failure, resolves to the same static-preset Fallback with no retry and no user-facing error). `Generating` is never user-*blocking* (a user may still navigate freely, write a custom answer, and leave the page) but it *is* user-**visible**: Business Structuring shows a dedicated loading state to any question reached while `Generating`, never static presets — see Frontend Representation above. Once `Ready`/`Fallback` resolves, a question already answered is not expected to "upgrade" retroactively.

## Failure Scenario Matrix

| Scenario | Outcome |
|---|---|
| Provider timeout | → `Fallback`. No retry is attempted automatically (per [AI Feedback and Error Experience](../05_ai_feedback_and_error_experience.md)'s Retry Policy: manual only, no silent auto-retry — and no manual Retry affordance exists for this capability at all, since it is Automatic-Invocation-only with no user-facing loading control to attach one to, per [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) Decision 7) |
| Rate limit | → `Fallback`, identically to timeout — this capability has no differentiated handling per failure *kind*; every Provider/Service failure kind in the AI Platform's unified taxonomy ([Provider Independence & Configuration](../02_provider_independence_and_configuration.md)) collapses to the same outcome here |
| Provider/service unavailable | → `Fallback`, identically to timeout |
| Invalid response (fails Response validation rules above) | → `Fallback` — treated identically to a Provider failure |
| Content Quality Validation failure (fewer than 3 valid options survive for any one question, per Response Contract above) | → `Fallback` — identical outcome to any other invalid Response, per [ADR-0021](../../architecture/decisions/ADR-0021-always-concrete-onboarding-presets.md) Decision 3; never a second Provider call to regenerate just the rejected options |
| Empty response | → `Fallback` — an empty Presets set fails the "3–5 non-empty options" validation rule above |
| Partial response (fewer than 5 questions' presets) | → `Fallback` in full — never partially accepted; see Response Contract's Validation rules for why all-or-nothing is deliberate |
| Parsing failure (malformed JSON, unexpected shape) | → `Fallback`, identically to invalid response |
| User cancellation | **Not applicable.** There is no user-facing affordance to cancel this call — it is Automatic Invocation with no visible control surface (unlike a manual Canvas Assistant "Ask AI" call, which a user can navigate away from mid-flight per [AI Interaction Specification](../04_ai_interaction.md#loading-behavior)'s Cancelability). The user simply proceeds into Business Structuring; if `Ready`/`Fallback` resolves after they've already left a question, that question's presets do not retroactively change (see Lifecycle above) |
| Duplicate/concurrent request for the same Project | **Never occurs by construction.** Per [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) Decision 7, exactly one call is issued per Project, at creation. Project Management's own implementation must guard against issuing a second call for the same Project on the same creation action (e.g., a double form-submit or a React Strict-Mode double-effect) — this is an implementation-level idempotency guard, not a new capability-level concept; [Project Summary](../../workspace/features/05_project_summary.md)'s own `initial_generation` trigger already solved the identical problem, and this capability's Consumer reuses that same pattern rather than inventing a second one |
| Offline / no network | → `Fallback`, identically to Provider unavailable — this capability has no offline-specific behavior beyond what the unified failure taxonomy already provides |
| Browser refresh during generation | → `Fallback`, deterministically, on the next load — see Frontend Representation's "Orphaned `Generating` self-heals to `Fallback`" above. Not a Provider/Service failure; the original request may well still be running server-side, but its result is unobservable once the in-memory pending-call registry is lost to a refresh, so the frontend resolves to the same terminal state a real failure would reach |

## Localization

Per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md): preset options are returned already-localized in the user's current language, exactly as a human-curated preset already is. If a user selects or customizes a preset into a Canvas field, that field becomes ordinary user-authored content from that point on — never re-localized on a later language switch, identically to any other preset-derived answer.

## Acceptance Criteria

- This capability is invoked at most once per Project, automatically, immediately after creation — never re-invoked later for the same Project, per [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) Decision 7.
- A preset produced by this capability is presented through Business Structuring's existing select-or-customize interaction — never auto-inserted into a Canvas field, identically to every other preset regardless of source.
- **The preset-selection UI is never replaced or hidden, for any question, under any outcome of this capability.** Per [ADR-0021](../../architecture/decisions/ADR-0021-always-concrete-onboarding-presets.md) Decision 2: a question either shows AI-tailored presets (this capability, `Ready`) or static V1 presets (`Fallback`/absent) — never zero selectable options and never a non-selectable substitute.
- A preset sourced from this capability is visually indistinguishable, in its select-or-customize interaction, from a static curated preset — a user is never required to know or care which provider supplied it, per the [Preset Strategy](../../workspace/features/02_1_question_model.md#preset-strategy)'s provider-agnostic contract.
- Every accepted option is free of placeholder/template markers and generic category-naming openers, per Content Quality Validation above — a Response containing any such text for a given question either has that specific option dropped, or (if too few valid options remain) triggers `Fallback` for the whole Response; it is never displayed to the user.
- If the capability is unavailable or fails, every question shows its static V1 presets with no user-visible error or blocking wait — per the Failure Scenario Matrix above. If it is still in flight (`Generating`) when the user reaches Business Structuring, every question instead shows a dedicated, non-blocking loading state — never static presets, never an empty area, and never a blocking wait — until `Ready`/`Fallback` resolves, per Frontend Representation above.
- **Static presets never appear merely because generation has not finished.** They appear only after a confirmed `Fallback` decision (failure, invalid Response, Content Quality Validation failure, or an orphaned request) — never as a default rendered while `Generating` is still the persisted status.
- Editing Description after Project creation never retroactively changes already-generated presets or already-answered Canvas fields — this capability's output is a one-time snapshot, not a live-bound derivation.
- **AI never overwrites user-authored Canvas content.** Restated explicitly here (already binding platform-wide per [AI Interaction Specification](../04_ai_interaction.md)'s Governing Rule 2 and [Canvas Assistant](./01_canvas_assistant.md)'s own Acceptance Criteria): this capability never writes to a Canvas field under any circumstance, success or failure — its entire output surface is preset *offers*, consumed only through Business Structuring's existing select-or-customize interaction.

## Regeneration & Overwrite Protection

- **Current field only.** Once Business Structuring is open, a user may regenerate a single question's presets via Canvas Assistant's existing manual Regenerate affordance (per [AI Interaction Specification](../04_ai_interaction.md#suggestion-lifecycle)) — scoped to that one question, exactly like every other Canvas Assistant invocation. There is no "regenerate all five" or "regenerate entire project" action anywhere in this capability or Canvas Assistant; per [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) Decision 6, this capability itself is never re-invoked at all.
- **Description-aware regeneration does not exist.** A per-question Canvas Assistant Regenerate reads that question's *current* Canvas answers and prior questions (per Canvas Assistant's own Request Contract) — it does not read Project Description, which is this capability's own input only. If a future need arises to make Canvas Assistant Description-aware too, that is a Contract Version change to Canvas Assistant, explicitly out of scope here (see Future Expansion).
- **Overwrite protection:** a Regenerate replaces only that question's *offered* preset list (per [AI Interaction Specification](../04_ai_interaction.md#suggestion-lifecycle)'s "Suggestion replacement rule") — never a Canvas field's already-saved value. If the question has already been answered (preset selected or custom text saved), regenerating its presets has no effect on the saved answer; the user must explicitly change their answer to overwrite it, identically to every other Canvas Assistant invocation.

## Out of Scope

- Any invocation after Project creation — see Responsibility above.
- Any external market/competitor data — same boundary [Canvas Assistant](./01_canvas_assistant.md#out-of-scope) already states; this capability reasons only over the Project's own Name/Description.
- Multi-step or session-based generation — out of scope per [ADR-0011](../../architecture/decisions/ADR-0011-defer-multi-step-workflow-orchestration.md); this is a single, independent capability call per Project, per [ADR-0019](../../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) Decision 2. A Content Quality Validation failure resolves via Fallback, never a second Provider call — see Response Contract.
- Any non-selectable content type (open-ended questions, hints) — retired per [ADR-0021](../../architecture/decisions/ADR-0021-always-concrete-onboarding-presets.md); see Future Considerations there for what a future, clearly-distinct content type would require.
- Generating tailored presets for any question other than the five fixed Canvas questions — this capability does not extend to Risk Memo, MVP Scope, Feature Planning, or Validation Planning, each of which has its own capability ([02](./02_risk_memo_assistant.md)–[05](./05_feature_suggestion_assistant.md)) unaffected by this one.

## Future Expansion

*(Consistent with [Future Expansion Strategy](../../context/06_future_expansion_strategy.md) — no new capability designed here, only the seam this specification must not block.)*
- If a future need arises to re-derive presets after Description is edited post-creation, that is a new, explicitly-justified decision (its own trigger condition and, likely, its own Automatic Invocation review) — this capability's Contract does not anticipate it, and none should be inferred from this document alone.
- A future non-selectable content type (see [ADR-0021](../../architecture/decisions/ADR-0021-always-concrete-onboarding-presets.md) Future Considerations) is a new, separately-justified product decision, not an extension of this capability's Response Contract.
