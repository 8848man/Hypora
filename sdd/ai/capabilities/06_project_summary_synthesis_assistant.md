# Capability: Project Summary Synthesis Assistant

**Refs:** → [Capability Index](./000_index.md) · [AI Platform Architecture](../01_architecture.md) · [Ownership Model](../03_ownership_model.md) · [Provider Independence & Configuration](../02_provider_independence_and_configuration.md) · [Project Summary](../../workspace/features/05_project_summary.md) · [ADR-0016](../../architecture/decisions/ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md) · [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md) · [MVP Planning Assistant](./03_mvp_planning_assistant.md) · [Validation Planning Assistant](./04_validation_planning_assistant.md) · [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md)

**Contract Version:** 1.0 — **Stable** (implemented against, this task).

*(Sixth capability instantiating the generalized AI-assisted structured-feature architecture — see [AI Ownership Model](../03_ownership_model.md#context-representation-pipeline) for the pipeline this capability's requests flow through. Deliberately a single capability with two Operations rather than two separate capabilities: both Initial Generation and Sync produce the identical Response Contract shape [a synthesized Summary narrative] from the identical Read Context [Canvas, MVP Scope, Validation Checklist] — the only difference between them is which Invocation Mode triggers the request and what the Feature does with a successful response, neither of which is a Request/Response Contract divergence per [Capability Promotion Rules](./000_index.md#capability-promotion-rules). This is the first capability whose Read Context spans three Features' committed data at once — Business Structuring, MVP Planning, and Validation Planning together — admitted under the existing demand-driven [Context Eligibility Rules](../../workspace/01_architecture.md#context-eligibility-rules), not a new architectural mechanism.)*

## Purpose

Synthesize a concise, plain-language narrative of a Project — what it is, who it's for, what problem it solves, and how it intends to validate the idea — from the user's completed Business Canvas, MVP Plan, and Validation Plan, so a first-time reader (including the project's own founder, returning later) understands the project immediately without re-reading every section. Backs [Project Summary](../../workspace/features/05_project_summary.md)'s persisted Summary artifact, per [ADR-0016](../../architecture/decisions/ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md).

## Responsibility

**In scope:**
- Two Operations, sharing one Request/Response Contract:
  - **`initial_generation`** — invoked automatically, exactly once per Project, per [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md)'s Automatic Invocation exception. A successful response is written directly as the Project's persisted Summary (Summary Lifecycle → `Generated`); no Suggestion Ready/Accept step, per that ADR's Decision 5.
  - **`sync`** — invoked manually, only from the Synchronization Dialog's **AI Summary Update** action, per ordinary Manual Invocation (Governing Rule 1 unaffected). A successful response populates the dialog's editable To-Be TextForm as a draft only — it is never written to the persisted Summary except via the user's own explicit Apply, per [Project Summary](../../workspace/features/05_project_summary.md#synchronization-dialog).
- Grounding every synthesis in the Business Canvas, current MVP Scope, and current Validation Checklist, per the Capability Matrix row this capability adds below — never in Risk Memo or any other Feature's data.
- Producing prose that synthesizes, not a completion checklist or a restatement of section labels — see Acceptance Criteria.

**Not in scope for Contract Version 1.0:**
- Any third Operation beyond `initial_generation`/`sync` (e.g., a partial/targeted re-summary of only one changed section) — the Summary is always synthesized as one whole narrative, not assembled from independently-cached fragments.
- Automatic invocation for the `sync` Operation — only `initial_generation` carries the [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md) exception; `sync` is Manual-only, identically to every other capability.

## Consumers

- [Project Summary](../../workspace/features/05_project_summary.md) — the sole consumer.

## Request Contract

*(Conceptual shape only — mirrors [MVP Planning Assistant](./03_mvp_planning_assistant.md#request-contract)'s pattern, extended with the Operation-scoped context this capability needs.)*

| Field | Meaning |
|---|---|
| Operation | `"initial_generation"` or `"sync"` — kept explicit so the two Invocation-Mode-distinct call sites remain traceable to one shared contract, per this document's own framing note above; does not otherwise change what context is read or how synthesis is performed |
| Canvas context | Normalized Workspace Context for the current Project's Canvas, via the Workspace Context Builder |
| MVP context | Normalized Workspace Context for the current Project's MVP Scope statement and Feature list, via the Workspace Context Builder — read-only, newly admitted to Normalized Workspace Context by this capability's real Context Selection need, per [Context Eligibility Rules](../../workspace/01_architecture.md#context-eligibility-rules) |
| Validation context | Normalized Workspace Context for the current Project's Validation Checklist (assumption, method, success criterion, resolution status per item), via the Workspace Context Builder — read-only, newly admitted on the same basis as MVP context above |
| Language | The user's current language, per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md) |

Context accumulation and user-override-priority rules are Platform-wide, per [04_ai_interaction.md#conversation-policy](../04_ai_interaction.md#conversation-policy) — not redefined here. Per [Context Eligibility Rules](../../workspace/01_architecture.md#context-eligibility-rules) Rule 4 ("committed data only"), this capability never reads an in-progress/unsaved draft of any of the three source Features — including its own `sync` Operation's own not-yet-Applied To-Be draft, which is Feature-local dialog state, not committed Project data.

## Response Contract

| Field | Meaning |
|---|---|
| Summary text | Already-localized presentation content — a concise narrative synthesizing what the project is, who it's for, what problem it solves, and how it intends to validate it |
| Confidence / rationale | Optional supporting note, identical in role to every other capability's own |

For `initial_generation`, the Feature writes this directly as the persisted Summary (per [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md)). For `sync`, the Feature always presents this as an editable draft offer, never an automatic overwrite of the persisted Summary.

## Failure Model

| Case | Handling |
|---|---|
| Provider/Service failure on `initial_generation` | Summary Lifecycle returns to `NotGenerated`, per [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md); safely re-attempted the next time the trigger condition re-evaluates; the Summary page continues to function (readiness/blocking-artifact messaging is unaffected) |
| Provider/Service failure on `sync` | The Synchronization Dialog surfaces the failure per [05_ai_feedback_and_error_experience.md](../05_ai_feedback_and_error_experience.md); the persisted Summary and `OutOfSync` state remain completely untouched; a manual Retry affordance is offered, identically to every other capability's retryable failures |
| Empty or low-value synthesis | Treated as "nothing to suggest," not an error — identical framing to every other capability's own empty-suggestion case |

## Localization

Per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md): the Summary text returns already-localized in the user's current language. Once written as the persisted Summary (via `initial_generation`'s direct write, or a `sync` draft's user-completed Apply), it is ordinary Project-owned content — never re-localized on a later language switch, identically to how an accepted Canvas suggestion is already treated.

## Acceptance Criteria

- A Summary synthesis reads only committed Canvas, MVP Scope, and Validation Checklist data — never Risk Memo, never another capability's internal Request/Response state, per capability independence.
- The synthesized text explains what the project is, who it's for, what problem it solves, and how it intends to validate it — a response that merely restates section completion status (e.g., "Canvas: complete, MVP Scope: complete") fails this capability's Purpose and does not satisfy this criterion.
- `initial_generation` is never invoked more than once automatically per Project (per [ADR-0017](../../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md)); every invocation beyond the first automatic one is a `sync` Operation, invoked only via explicit user action.
- A `sync` draft is never auto-applied — it is always offered as editable text the user must explicitly Apply, per [Project Summary](../../workspace/features/05_project_summary.md#synchronization-dialog).
- If this capability is unavailable or fails, Project Summary's readiness/blocking-artifact messaging and Build-Ready confirmation continue to function exactly as they do with no AI available — additive, never a blocking dependency, per [MVP Planning Assistant](./03_mvp_planning_assistant.md#failure-model)'s identical precedent.

## Out of Scope

- Any data from Risk Memo or any Feature other than Business Structuring, MVP Planning, and Validation Planning, per capability independence.
- Editing or suggesting content for Canvas, MVP Scope, Feature list, or Validation Checklist items themselves — this capability only ever produces the separate Summary narrative, never a suggestion for another Feature's own fields.
- Any workflow/session state connecting `initial_generation` and a later `sync` call — each invocation is stateless per [04_ai_interaction.md#conversation-policy](../04_ai_interaction.md#conversation-policy), identically to every other capability.
- Automatic invocation for anything beyond `initial_generation` — see Responsibility above.

## Future Expansion

- A future stage needing a shorter/longer Summary variant (e.g., an exportable one-pager per the still-open export/print question in [Product Scope](../../context/02_product_scope.md#open-questions)) is a plausible extension, but requires its own explicit Request Contract field (e.g., a length/format parameter) — not assumed by this contract.
- Any future structured Feature needing an analogous cross-Feature synthesis capability follows this same template, including this capability's Operation-field pattern for sharing one contract across an automatic and a manual trigger, as its own next capability file.
