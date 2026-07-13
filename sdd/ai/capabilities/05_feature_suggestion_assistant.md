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
| Operation | `"suggestion"` — the same literal value every existing capability already uses; not a new vocabulary |
| Canvas context | Normalized Workspace Context for the current Project's Canvas |
| MVP Scope context | The current Project's MVP Scope statement — intra-Feature sibling data (MVP Planning owns both), not read via the Workspace Context Builder |
| Existing Feature context | **Every** current Feature Plan entry (name, priority, inScope), unfiltered — including `inScope: false` entries, so the model sees the full picture rather than a partial one. Id omitted — internal bookkeeping, not meaningful to the model |
| Risk context | Normalized Workspace Context for the current Project's Risk Memo (all non-empty fields) — optional, read-only |
| Language | The user's current language, per [ADR-0009](../../architecture/decisions/ADR-0009-ai-platform-localization-integration.md) |

## Response Contract

An ordered array of proposed Features — array order is the suggested implementation order; no separate ordering field exists. No duplicate-flag or id field exists anywhere in this contract — duplicate detection is entirely client-computed (see Acceptance Criteria) against data the client already holds locally; ids are minted client-side only at Accept time, never by this capability. Each item:

| Field | Meaning | Required | Persists after Accept? |
|---|---|---|---|
| Name | The proposed Feature's name | Yes | Yes — the only field this capability contributes to permanent data |
| Rationale | Why this Feature exists, grounded in Canvas/Scope content | **Yes** | **No** — preview-only, governed by the existing "optional rationale, never persisted" rule |
| Primary user value | The concrete benefit to the user | **Yes** | **No** — same governance as Rationale; both are instances of the same "optional rationale" concept |
| Suggested priority | One of the existing `must`/`should`/`could` tiers — no new vocabulary | Yes | Yes — becomes the initial value of the Feature's own already-existing priority field |

**Deliberate deviation, called out explicitly:** every other capability's rationale is *optional* (`rationale?`). Here, Rationale and Primary user value are **required**, not optional — because, unlike every other capability, this one persists almost nothing (only name and priority); the read-only preview content is the user's *only* basis for an Accept/reject decision beyond the bare name. A future capability author copying this file as a template should notice this is a deliberate exception tied to this capability's unusually minimal permanent footprint, not the new default.

No dependency field exists in this contract — see Responsibility above.

**Implementation note, not a specification deviation:** this Response Contract is a structured array, not the scalar `{suggestionText, rationale?}` shape most existing capabilities use. `04_ai_interaction.md`'s Suggestion Lifecycle never constrains a Suggestion's content to be scalar text — only this product's existing frontend hook's generic type signature happens to assume it, because every capability built so far used that shape. Carrying this Response Contract will require a compatible, backward-compatible widening of that hook's generic constraint at implementation time — an implementation task, not a specification or architecture change, and not something this document resolves.

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
- **No reordering, no separate "remove from preview" action.** Proposals render in response order (the suggested implementation order) and are not manually reorderable within the preview — the persisted Feature list has no manual-reorder mechanism today, so inventing one scoped only to this preview would be new, unsupported UI capability. Removing a proposal from consideration is done by unchecking it (see below); no additional delete affordance exists, to avoid two UI actions doing overlapping things.
- **Accept operates on an arbitrary, user-selected subset.** Every proposed Feature has a selection control, checked by default, except duplicate-flagged items (see below), which default unchecked. One Accept action commits only the checked subset — remaining under Governing Rule 3's Single Invocation Scope (one invocation, one Suggestion Ready state, one Accept action), never per-item Accept/Reject/Regenerate cycles. **Accept is disabled when zero items are checked** — accepting nothing is a no-op, not a valid action.
- **Duplicate handling, stated exactly:** a proposed Feature's name is compared, trimmed and case-folded, against (a) every existing Feature's name and (b) every *other* proposed name in the same batch. Any match — against existing data or a sibling proposal — is shown with a "similar to an existing Feature" indicator and defaults unchecked; it is never removed or hidden from the preview (no automatic filtering). If the user checks it anyway and presses Accept, it is added as an ordinary new Feature — a plain append, never merged with the existing one, never blocked, and duplicate names are otherwise permitted (manual entry already allows duplicate names today; this introduces no new restriction). Semantic (non-exact) duplicate detection is not implemented — see Responsibility above.
- **Accept mechanics, stated exactly:**
  1. Ids are minted client-side, at the moment Accept fires, in the same format the existing manual `addFeature()` path already uses — the Response Contract never carries an id.
  2. Checked proposals (including any inline edits made in preview) are appended to the existing Feature list, preserving their relative response order — `features: [...existing, ...newlyAccepted]`. Existing entries are never read, matched, or overwritten by this operation.
  3. One History Created event is recorded per newly accepted Feature (not one combined "batch" event) — see [MVP Planning](../../workspace/features/03_mvp_planning.md#history).
  4. The Acceptance Confirmation (reusing the existing transient, focus-preserving, auto-dismissing mechanism) displays a count-based message (e.g., "N features added") rather than a suggestion's rationale — no single rationale applies to a batch, so this capability's confirmation content differs from other capabilities' in content only, not in mechanism.
- **Regenerate replaces the current unaccepted preview batch entirely** — the existing, already-frozen "a new suggestion replaces the old one entirely, never shown side by side" rule, applied to a batch payload; no new rule is introduced. A Regenerate reads the currently *accepted* Feature Plan as "existing" (fresh at click time, per Progressive Context Accumulation), never an unaccepted, in-preview batch — any unsaved preview edits or selections are discarded, identical in kind to how Regenerate already discards any other capability's unaccepted suggestion.
- Accepted Features are indistinguishable from manually-added ones the moment they're added — no provenance marker, no permanently different shape, per ADR-0009's precedent. This extends to History (see [MVP Planning](../../workspace/features/03_mvp_planning.md#history)): a Created event never records whether its Feature originated manually or from an accepted suggestion.
- Every proposed Feature is presented as an offer; nothing is auto-inserted into the Feature Plan without an explicit Accept.

## Interaction States

*(Every state the frontend passes through, end to end — no state below is ambiguous or left to implementation-time interpretation.)*

| State | Trigger | Notes |
|---|---|---|
| Idle | Default; also reached after Reject, after a completed Accept, or after a page refresh | Nothing about a prior preview survives a refresh — no draft persistence exists anywhere in this flow |
| Requesting → Generating | User clicks the invocation affordance | Identical to every other capability's lifecycle; cancelable per existing Loading Behavior rules |
| Suggestion Ready | A valid, non-empty response array arrives | Renders the full proposal list; per-item checkbox (default per Duplicate handling above) and inline-editable name/priority/scope fields are ordinary component state layered *within* this single lifecycle state — not a new state, not a sub-invocation |
| Suggestion Ready → Accepted → Completed → Idle | User presses Accept with ≥1 item checked | Per Accept mechanics above |
| Suggestion Ready → Idle | User presses Reject | Discards the entire batch and any in-preview edits/selections; no partial reject exists at this action (partial curation happens via checkboxes before Accept, not via Reject) |
| Suggestion Ready → Requesting (Regenerate) | User presses Regenerate | Per Regenerate rule above |
| Failed → Requesting (Retry) | Provider/Service failure, or malformed response (see Edge Cases) | Identical to every other capability's Failed/Retry handling |
| Idle (no preview shown) | Response array is empty | See Edge Cases — not rendered as a Suggestion Ready state with zero rows |

## Edge Cases

| Case | Expected behavior |
|---|---|
| AI returns an empty array | Treated as "nothing to suggest" (Failure Model) — the UI returns to Idle with a brief neutral notice, never an open preview panel containing zero rows and a dead Accept button |
| Every proposal is duplicate-flagged | All default unchecked; Accept stays disabled until the user deliberately checks at least one |
| User accepts none (unchecks everything, or never checks anything) | Accept is disabled by construction — this state cannot be reached as a submitted action |
| Batch of exactly one proposal | Handled identically to any other batch size — no special-casing |
| Response contains a priority outside `must`/`should`/`could` | Rejected by response-shape validation as a malformed response — surfaced as a generic failure, identical to any other capability's malformed-response handling; never silently coerced or defaulted |
| Two proposals in the same batch share a name | No uniqueness enforcement — consistent with manual entry, which has never required unique Feature names. Each is independently checkable; the *second* occurrence is duplicate-flagged against the first, per the sibling-batch comparison rule above |
| User edits a preview field, then presses Regenerate | The edit is discarded — Regenerate always starts a fresh, independent invocation, per the existing Suggestion Lifecycle |
| Network failure / AI timeout | Routes to the existing Failed state with the matching `timeout`/`unavailable` failureKind; Retry available — no capability-specific handling |
| MVP Scope statement is empty at invocation time | Not blocked — the request is still sent; an empty MVP Scope context simply means less grounding is available, handled the same way Canvas Assistant already tolerates a partially-empty Canvas |

## Backend / Frontend Responsibility Boundary

The capability class's server-side responsibility ends at: render the prompt, invoke the provider, parse and validate the response shape (including the priority-enum check above). It performs **no** duplicate detection, mints **no** ids, and records **no** History events — every one of those is Feature-owned, client-side behavior, per the Acceptance Criteria above. This mirrors the same boundary already established for every other capability; nothing UI-specific is added to the backend by this capability.

## Out of Scope

- Dependency relationships — see Responsibility and Future Expansion.
- Semantic duplicate detection — see Responsibility.
- Any data from Validation Planning or any Feature other than Business Structuring, Risk Memo, and MVP Planning itself, per capability-independence.
- Merging a proposed Feature into an existing one — every acceptance is a plain append; merge logic (which field wins in a conflict) is not defined because nothing persisted beyond name/priority could meaningfully conflict.
- External market/competitor data — Search's future capability, per [ADR-0010](../../architecture/decisions/ADR-0010-search-as-independent-platform-capability.md).

## Future Expansion

- Dependency inference between Features is expected to belong to a future Requirement/Specification Generation capability (V5-adjacent), operating on the full committed Feature list with richer context than this capability has — not a future version of this contract.
- Semantic duplicate detection may be added later if real usage shows exact-name matching is insufficient in practice — not assumed or designed for now.
