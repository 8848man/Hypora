# Capability: Project Summary Synthesis Assistant

**Refs:** → [Capability Index](./000_index.md) · [AI Platform Architecture](../01_architecture.md) · [Ownership Model](../03_ownership_model.md) · [Provider Independence & Configuration](../02_provider_independence_and_configuration.md) · [Project Summary](../../workspace/features/05_project_summary.md) · [ADR-0016](../../architecture/decisions/ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md) · [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md) · [ADR-0018](../../architecture/decisions/ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md) · [Canvas Assistant](./01_canvas_assistant.md) · [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md)

**Contract Version:** 2.0 — **Stable** (implemented against, per [ADR-0018](../../architecture/decisions/ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md)).

*(Sixth capability instantiating the generalized AI-assisted structured-feature architecture — see [AI Ownership Model](../03_ownership_model.md#context-representation-pipeline) for the pipeline this capability's requests flow through. Deliberately a single capability with two Operations rather than two separate capabilities: both Initial Generation and Sync produce the identical Response Contract shape [a synthesized identity narrative] from the identical Read Context [Business Canvas only] — the only difference between them is which Invocation Mode triggers the request and what the Feature does with a successful response, neither of which is a Request/Response Contract divergence per [Capability Promotion Rules](./000_index.md#capability-promotion-rules). Per [ADR-0018](../../architecture/decisions/ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md), this capability's Read Context is now Canvas-only — its Contract Version 1.0 shape (Canvas + MVP + Validation) is preserved in Contract Version History below, not restated here.)*

## Purpose

Synthesize a concise, plain-language **identity narrative** of a Project — what it is, who it's for, what problem it solves, and what value it provides — from the user's Business Canvas, so a first-time reader (including the project's own founder, returning later) understands the idea immediately without re-reading all five guided-flow answers individually. Backs [Project Summary](../../workspace/features/05_project_summary.md)'s persisted Summary artifact, per [ADR-0016](../../architecture/decisions/ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md) and [ADR-0018](../../architecture/decisions/ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md). Per [ADR-0018](../../architecture/decisions/ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md), this capability is deliberately **not** responsible for MVP Planning, Validation Planning, or Build readiness — those remain independent concepts, represented by their own non-AI completion indicators and the Build-Ready confirmation workflow, unaffected by this capability's output.

## Responsibility

**In scope:**
- Two Operations, sharing one Request/Response Contract:
  - **`initial_generation`** — invoked automatically, exactly once per Project, per [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md)'s Automatic Invocation exception (trigger condition per [ADR-0018](../../architecture/decisions/ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md): Canvas reaches completion). A successful response is written directly as the Project's persisted Summary (Summary Lifecycle → `Generated`); no Suggestion Ready/Accept step, per ADR-0017's Decision 5.
  - **`sync`** — invoked manually, only from the Synchronization Dialog's **AI Summary Update** action, per ordinary Manual Invocation (Governing Rule 1 unaffected). A successful response populates the dialog's editable To-Be TextForm as a draft only — it is never written to the persisted Summary except via the user's own explicit Apply, per [Project Summary](../../workspace/features/05_project_summary.md#synchronization-dialog).
- Grounding every synthesis in the Business Canvas only, per [ADR-0018](../../architecture/decisions/ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md) — never MVP Scope, the Feature list, the Validation Checklist, Risk Memo, or any other Feature's data.
- Producing prose that synthesizes, not a completion checklist or a restatement of field labels — see Acceptance Criteria.

**Not in scope for Contract Version 2.0:**
- Any content derived from MVP Planning, Validation Planning, or Build readiness — see [ADR-0018](../../architecture/decisions/ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md); a future need for an AI-narrated overview of those remains a separate, not-yet-decided capability, per that ADR's Future Impact.
- Any third Operation beyond `initial_generation`/`sync` (e.g., a partial/targeted re-summary of only one Canvas field) — the identity narrative is always synthesized as one whole paragraph from all five Canvas fields, not assembled from independently-cached fragments.
- Automatic invocation for the `sync` Operation — only `initial_generation` carries the [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md) exception; `sync` is Manual-only, identically to every other capability.

## Consumers

- [Project Summary](../../workspace/features/05_project_summary.md) — the sole consumer.

## Request Contract

*(Conceptual shape only — mirrors [Canvas Assistant](./01_canvas_assistant.md#request-contract)'s pattern of a Canvas-only Read Context, per [ADR-0018](../../architecture/decisions/ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md).)*

| Field | Meaning |
|---|---|
| Operation | `"initial_generation"` or `"sync"` — kept explicit so the two Invocation-Mode-distinct call sites remain traceable to one shared contract, per this document's own framing note above; does not otherwise change what context is read or how synthesis is performed |
| Canvas context | Normalized Workspace Context for the current Project's Canvas, via the Workspace Context Builder |
| Language | The user's current language, per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md) |

Context accumulation and user-override-priority rules are Platform-wide, per [04_ai_interaction.md#conversation-policy](../04_ai_interaction.md#conversation-policy) — not redefined here. Per [Context Eligibility Rules](../../workspace/01_architecture.md#context-eligibility-rules) Rule 4 ("committed data only"), this capability never reads an in-progress/unsaved draft of Canvas — including its own `sync` Operation's own not-yet-Applied To-Be draft, which is Feature-local dialog state, not committed Project data.

## Response Contract

| Field | Meaning |
|---|---|
| Summary text | Already-localized presentation content — a concise identity narrative synthesizing what the project is, who it's for, what problem it solves, and what value it provides |
| Confidence / rationale | Optional supporting note, identical in role to every other capability's own |

For `initial_generation`, the Feature writes this directly as the persisted Summary (per [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md)). For `sync`, the Feature always presents this as an editable draft offer, never an automatic overwrite of the persisted Summary.

## Contract Version History

*(Per [Contract Versioning](./000_index.md#contract-versioning) — a superseded version's shape stays documented here, never deleted, since this capability file as a whole remains current.)*

**Version 1.0 (Superseded by 2.0, per [ADR-0018](../../architecture/decisions/ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md)):** Request Contract additionally carried `MVP context` (Normalized Workspace Context for MVP Scope statement + Feature list) and `Validation context` (Normalized Workspace Context for the Validation Checklist); Purpose and Response Contract described a whole-project narrative including "how it intends to validate the idea." Removed entirely in 2.0 — not merely deprecated — per ADR-0018's Decision 2.

## Failure Model

| Case | Handling |
|---|---|
| Provider/Service failure on `initial_generation` | Summary Lifecycle returns to `NotGenerated`, per [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md); safely re-attempted the next time the trigger condition re-evaluates; the Summary page continues to function (readiness/blocking-artifact messaging is unaffected) |
| Provider/Service failure on `sync` | The Synchronization Dialog surfaces the failure per [05_ai_feedback_and_error_experience.md](../05_ai_feedback_and_error_experience.md); the persisted Summary and `OutOfSync` state remain completely untouched; a manual Retry affordance is offered, identically to every other capability's retryable failures |
| Empty or low-value synthesis | Treated as "nothing to suggest," not an error — identical framing to every other capability's own empty-suggestion case |

## Localization

Per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md): the Summary text returns already-localized in the user's current language. Once written as the persisted Summary (via `initial_generation`'s direct write, or a `sync` draft's user-completed Apply), it is ordinary Project-owned content — never re-localized on a later language switch, identically to how an accepted Canvas suggestion is already treated.

## Acceptance Criteria

- A Summary synthesis reads only committed Canvas data — never MVP Scope, the Feature list, the Validation Checklist, Risk Memo, or another capability's internal Request/Response state, per capability independence and [ADR-0018](../../architecture/decisions/ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md).
- The synthesized text explains what the project is, who it's for, what problem it solves, and what value it provides — a response that merely restates field completion status (e.g., "Canvas: complete") fails this capability's Purpose and does not satisfy this criterion. It never claims or implies a validation approach, since Validation Planning is out of scope for this capability.
- `initial_generation` is never invoked more than once automatically per Project (per [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md)); every invocation beyond the first automatic one is a `sync` Operation, invoked only via explicit user action.
- A `sync` draft is never auto-applied — it is always offered as editable text the user must explicitly Apply, per [Project Summary](../../workspace/features/05_project_summary.md#synchronization-dialog).
- If this capability is unavailable or fails, Project Summary's readiness/blocking-artifact messaging and Build-Ready confirmation continue to function exactly as they do with no AI available — additive, never a blocking dependency, per [MVP Planning Assistant](./03_mvp_planning_assistant.md#failure-model)'s identical precedent.

## Out of Scope

- Any data from MVP Planning, Validation Planning, Risk Memo, or any Feature other than Business Structuring, per [ADR-0018](../../architecture/decisions/ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md) and capability independence.
- Any representation of project readiness, MVP completion, Validation completion, or Build-Ready status — those remain owned entirely by [Project Summary](../../workspace/features/05_project_summary.md)'s existing non-AI completion cards and Build-Ready confirmation, per ADR-0018.
- Editing or suggesting content for Canvas fields themselves — this capability only ever produces the separate Summary narrative, never a suggestion for a Canvas field (that remains [Canvas Assistant](./01_canvas_assistant.md)'s role).
- Any workflow/session state connecting `initial_generation` and a later `sync` call — each invocation is stateless per [04_ai_interaction.md#conversation-policy](../04_ai_interaction.md#conversation-policy), identically to every other capability.
- Automatic invocation for anything beyond `initial_generation` — see Responsibility above.

## Future Expansion

- A future stage needing a shorter/longer identity variant (e.g., an exportable one-pager per the still-open export/print question in [Product Scope](../../context/02_product_scope.md#open-questions)) is a plausible extension, but requires its own explicit Request Contract field (e.g., a length/format parameter) — not assumed by this contract.
- A future AI-narrated overview of MVP Planning and/or Validation Planning, if a real need for one emerges, is a new, separate capability decision per [ADR-0018](../../architecture/decisions/ADR-0018-narrow-project-summary-to-business-canvas-identity-synthesis.md)'s Future Impact — never a re-widening of this capability's Read Context.
- Any future structured Feature needing an analogous single-Feature synthesis capability follows this same template, including this capability's Operation-field pattern for sharing one contract across an automatic and a manual trigger, as its own next capability file.
