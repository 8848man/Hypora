# Capability: Feature Suggestion Assistant

**Refs:** → [Capability Index](./000_index.md) · [AI Platform Architecture](../01_architecture.md) · [Ownership Model](../03_ownership_model.md) · [Provider Independence & Configuration](../02_provider_independence_and_configuration.md) · [MVP Planning](../../workspace/features/03_mvp_planning.md) · [MVP Planning Assistant](./03_mvp_planning_assistant.md) · [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md)

**Contract Version:** 1.0 — **Draft** (not yet implemented against).

*(Fifth capability instantiating the generalized AI-assisted structured-feature architecture. Named for what it produces — a batch of Suggestions, per [04_ai_interaction.md](../04_ai_interaction.md)'s own AI-Specific UX Terminology — not "Feature Plan," since this capability never manages sequencing, dependencies, or the Feature Plan as a structure; it proposes individual Feature entries. Deliberately distinct from [MVP Planning Assistant](./03_mvp_planning_assistant.md), which targets the MVP Scope statement, not the Feature list — the two must not be confused despite both belonging to MVP Planning. Deliberately a separate capability from every existing one, per [Capability Promotion Rules](./000_index.md#capability-promotion-rules): its Response Contract (an array of structured Feature proposals) diverges from every existing capability's single-string `{suggestionText, rationale?}` shape, the mandatory Response Contract divergence trigger.)*

## Purpose

Help a user populate their Feature Plan by proposing individual Features grounded in their completed Business Canvas, MVP Scope statement, and Risk Memo (if any) — reducing the repetitive work of naming an initial set of Features from scratch, while the user retains full authorship over which, if any, are added.

## Responsibility

**In scope:**
- Proposing a batch of Feature name suggestions, each with a rationale, a primary-user-value statement (preview-only — see Acceptance Criteria), and a suggested priority.
- Grounding every proposal in the Business Canvas and the current MVP Scope statement; using the current Feature Plan (existing Feature names) to avoid re-proposing what's already present, and Risk Memo (if any) as optional supporting context.
- Producing more Features when the existing Feature Plan is empty, and fewer/targeted Features when it's already substantially populated — governed entirely by prompt guidance reading the supplied existing-Feature context, not a separate mode or operation.

**Not in scope for Contract Version 1.0:**
- Dependency relationships between Features. A dependency graph is not a Feature Plan concept in the current product — see [MVP Planning](../../workspace/features/03_mvp_planning.md#future-expansion-v2-v5)'s Future Expansion note. If a future Requirement/Specification Generation capability needs dependency information, it is expected to infer it from the full committed Feature list and Canvas at that later stage, with fuller context than this capability ever has — not something this capability pre-computes or persists.
- Semantic duplicate detection. Only exact-name matching (client-side, Feature-owned) is defined for V1 — see Acceptance Criteria. Detecting near-duplicate phrasings ("Search by category" vs. "Filter listings by category") is a named Future Consideration, not built now.
- Any persisted metadata beyond a Feature's name and initial priority. Rationale and primary-user-value are preview-only, per the Response Contract and Acceptance Criteria below — never written into permanent Feature data, per the same rule that already governs every other capability's optional rationale ([04_ai_interaction.md#suggestion-lifecycle](../04_ai_interaction.md#suggestion-lifecycle)).

## Consumers

- [MVP Planning](../../workspace/features/03_mvp_planning.md) — the sole consumer, targeting its Feature Plan specifically (not the MVP Scope statement, which [MVP Planning Assistant](./03_mvp_planning_assistant.md) already owns).

## Request Contract

| Field | Meaning |
|---|---|
| Operation | Currently always a single fixed value — kept explicit for future extensibility without a breaking change |
| Canvas context | Normalized Workspace Context for the current Project's Canvas |
| MVP Scope context | The current Project's MVP Scope statement — intra-Feature sibling data (MVP Planning owns both), not read via the Workspace Context Builder |
| Existing Feature context | The current Feature Plan's Features (name, priority, inScope only — id omitted, internal bookkeeping not meaningful to the model) — intra-Feature sibling data, enabling "propose only what's missing" |
| Risk context | Normalized Workspace Context for the current Project's Risk Memo (all non-empty fields) — optional, read-only |
| Language | The user's current language, per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md) |

## Response Contract

An ordered array of proposed Features — array order is the suggested implementation order; no separate ordering field exists. Each item:

| Field | Meaning | Persists after Accept? |
|---|---|---|
| Name | The proposed Feature's name | Yes — the only field this capability contributes to permanent data |
| Rationale | Why this Feature exists, grounded in Canvas/Scope content | **No** — preview-only, governed by the existing "optional rationale, never persisted" rule |
| Primary user value | The concrete benefit to the user | **No** — same governance as Rationale; both are instances of the same "optional rationale" concept |
| Suggested priority | One of the existing `must`/`should`/`could` tiers — no new vocabulary | Yes — becomes the initial value of the Feature's own already-existing priority field |

No dependency field exists in this contract — see Responsibility above.

## Failure Model

| Case | Handling |
|---|---|
| Provider/Service failure | MVP Planning's Feature Plan proceeds exactly as it does today with no AI available |
| Empty or low-value proposal batch | Treated as "nothing to suggest," not an error |

## Localization

Per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md): proposals return already-localized in the user's current language. Once a proposed name is accepted, it is ordinary user-authored content — never re-localized on a later language switch, identical to every other AI-assisted field in this product.

## Feature Generation Rules

*(Permanent rules governing what this capability may propose — enforced entirely through prompt guidance, since no mechanical/server-side test reliably distinguishes a real product capability from a UI element. This mirrors the same responsibility split already used for duplicate handling below: quality/framing guidance is a prompt concern, never a server validation.)*

1. A Feature names a user-facing capability or outcome a person can do or receive — never a UI element. Not "Add a submit button," not "Create a settings page."
2. Phrased as an action or outcome from the user's perspective, not an implementation noun — "Search listings by category," never "Search index" or "API endpoint."
3. Every proposal must be traceable to the supplied Canvas or MVP Scope content — a proposal the model can't ground in that context should not be made.
4. Purely technical/infrastructure concerns (authentication systems, databases, admin panels, generic settings) are excluded unless reframed as the specific user-facing capability they serve, and only if the Canvas's problem/customer actually calls for it.
5. Priority uses only the existing `must`/`should`/`could` vocabulary — no new taxonomy invented per capability.

## Acceptance Criteria

- **Preview is editable, not just offered.** Each proposed Feature's name, priority, and in/out-of-scope tag are editable inline within the preview, before Accept — the same fields that will persist, and no others (Rationale/primary-user-value remain read-only display, since they never persist). This is ordinary Feature-local UI state, not a new AI Interaction Lifecycle state, and triggers no additional AI invocation.
- **Accept operates on an arbitrary, user-selected subset.** Every proposed Feature has a selection control, checked by default, except duplicate-flagged items (see below), which default unchecked. One Accept action commits only the checked subset — remaining under Governing Rule 3's Single Invocation Scope (one invocation, one Suggestion Ready state, one Accept action), never per-item Accept/Reject/Regenerate cycles.
- **Duplicate handling, stated exactly:** a proposed Feature whose name exact-matches (trimmed, case-insensitive) an existing Feature's name is shown with a "similar to an existing Feature" indicator and defaults unchecked. If the user checks it anyway and presses Accept, it is added as an ordinary new Feature — a plain append, never merged with the existing one, never blocked. Semantic (non-exact) duplicate detection is not implemented — see Responsibility above.
- **Regenerate replaces the current unaccepted preview batch entirely** — the existing, already-frozen "a new suggestion replaces the old one entirely, never shown side by side" rule, applied to a batch payload; no new rule is introduced. A Regenerate reads the currently *accepted* Feature Plan as "existing," never an unaccepted, in-preview batch.
- Accepted Features are indistinguishable from manually-added ones the moment they're added — no provenance marker, no permanently different shape, per ADR-0009's precedent.
- Every proposed Feature is presented as an offer; nothing is auto-inserted into the Feature Plan without an explicit Accept.

## Out of Scope

- Dependency relationships — see Responsibility and Future Expansion.
- Semantic duplicate detection — see Responsibility.
- Any data from Validation Planning or any Feature other than Business Structuring, Risk Memo, and MVP Planning itself, per capability-independence.
- Merging a proposed Feature into an existing one — every acceptance is a plain append; merge logic (which field wins in a conflict) is not defined because nothing persisted beyond name/priority could meaningfully conflict.
- External market/competitor data — Search's future capability, per [ADR-0010](../../architecture/decisions/ADR-0010-search-as-independent-platform-capability.md).

## Future Expansion

- Dependency inference between Features is expected to belong to a future Requirement/Specification Generation capability (V5-adjacent), operating on the full committed Feature list with richer context than this capability has — not a future version of this contract.
- Semantic duplicate detection may be added later if real usage shows exact-name matching is insufficient in practice — not assumed or designed for now.
