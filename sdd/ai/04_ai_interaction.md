# AI Interaction Specification

**Refs:** → [00_index](../00_index.md) · [AI Platform Architecture](./01_architecture.md) · [Provider Independence & Configuration](./02_provider_independence_and_configuration.md) · [Ownership Model](./03_ownership_model.md) · [Capability Index](./capabilities/000_index.md) · [Canvas Assistant](./capabilities/01_canvas_assistant.md) · [AI Feedback & Error Experience](./05_ai_feedback_and_error_experience.md) · [Design System](../design-system/01_design_system.md) · [Frontend Architecture](../frontend/01_architecture.md) · [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md) · [ADR-0009](../architecture/decisions/ADR-0009-ai-platform-localization-integration.md) · [ADR-0010](../architecture/decisions/ADR-0010-search-as-independent-platform-capability.md) · [ADR-0011](../architecture/decisions/ADR-0011-defer-multi-step-workflow-orchestration.md) · [Future Expansion Strategy](../context/06_future_expansion_strategy.md)

Canonical owner of **how a user experiences one AI Capability invocation**: invocation, lifecycle, loading, and suggestion interaction. This document does not redesign any accepted architecture — every mechanism it describes is a UX-facing consequence of ADR-0006 through ADR-0011 and `01_architecture.md`–`03_ownership_model.md`, cited rather than re-derived. It is not Canvas-Assistant-specific: every current and future AI Capability instantiates this same lifecycle.

## Governing Rules

These five rules are binding on every AI Capability's interaction design, present and future. Nothing below may be read to contradict them.

1. **Passive UI never invokes AI.** Displaying an AI hint, an AI badge, or any other AI affordance is not invocation. Invocation requires an explicit user action.
2. **Manual-first.** The targeted field remains editable during Requesting, Generating, and Retrying. AI never locks manual editing. If the user edits the field while a request is in flight, the eventual response must never overwrite those edits.
3. **Single Invocation Scope.** This lifecycle governs exactly one AI Capability invocation. Search + AI composition, workflow orchestration, and multi-capability flows are out of scope (see Out of Scope).
4. **Accessibility Scope.** Only AI-interaction-specific accessibility behavior is owned here. General accessibility remains owned by Frontend/Design System.
5. **Design System Boundary.** Every new visual concept is checked against the existing Design System inventory first. This document defines behavior only; visual primitives belong to Design System.

## Purpose

Give every AI Capability (Canvas Assistant today; Persona Review, Market Intelligence's AI portion, GTM Planner, and Product Builder's single-call operations later) one consistent, reusable interaction model, so that V3–V5 extend this document by instantiating it, not by each inventing their own loading/suggestion behavior — the same reuse guarantee `01_architecture.md`'s Capability Model already establishes on the backend side, extended to the UX side.

## Invocation Model

| Mode | Status | Rule |
|---|---|---|
| **Manual invocation** | Allowed | A user takes an explicit action (e.g., activating an "Ask AI" affordance) that starts the lifecycle at Requesting. This is the default, and the only invocation mode for every capability except the one named exception below. |
| **Automatic invocation** | **Deferred by default; one narrow, named exception exists** | The system starting a capability call without an explicit user action (e.g., on field blur, on a timer, on page load) remains out of scope by default. Per Governing Rule 1, merely *showing* an AI affordance is never itself invocation — deferring automatic invocation means no code path may trigger Requesting except a user's explicit action, unless a specific ADR grants a narrow exception. **The sole current exception:** [Project Summary Synthesis Assistant](./capabilities/06_project_summary_synthesis_assistant.md)'s `initial_generation` Operation, per [ADR-0017](../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md) — system-triggered exactly once per Project, when the Project's domain lifecycle stage first reaches Validated. No other capability, and no other operation of that same capability (its `sync` Operation remains Manual-only), carries this exception. A future capability wanting Automatic Invocation must obtain its own ADR against the same narrow bar ADR-0017 sets, per that ADR's Future Impact — this table is updated to name each such exception individually, never generalized into a second, open-ended "automatic" mode. A capability offering richer seed context when a field is empty (e.g., [Canvas Assistant](./capabilities/01_canvas_assistant.md)'s AI-first Draft Generation) changes what context is available to an invocation, never whether the invocation itself is automatic — that distinction still binds. |

## Interaction Lifecycle {#interaction-lifecycle}

This state diagram is reusable and named (`#interaction-lifecycle`) so every future single-call AI Capability can cite it by anchor rather than restating it. **It governs exactly one AI Capability invocation from Idle to Completed** (Governing Rule 3) — a Regenerate or Retry loops back to `Requesting` *within that same governed scope*, it does not start a new session, and it never spans more than one capability call at a time.

```
Idle
  │  (explicit user invocation — Governing Rule 1)
  ▼
Requesting
  │  (request sent to the AI Capability)
  ▼
Generating ──────────────────────────────┐
  │  (success)                           │ (failure — see 05_ai_feedback_and_error_experience.md)
  ▼                                      ▼
Suggestion Ready                       Failed
  │              │                       │  (user Retries)
  │ (Accept)     │ (Reject)              └──────────────► Requesting
  ▼              ▼                       │  (user proceeds manually / dismisses)
Accepted       Idle                      ▼
  │                                    Idle
  ▼
Completed

Suggestion Ready ──(user Regenerates)──► Requesting
```

**Scope boundary of this diagram:** it applies to single-call AI Capabilities only (V2–V4, per [ADR-0011](../architecture/decisions/ADR-0011-defer-multi-step-workflow-orchestration.md)). It does not, and is not intended to, describe V5's multi-step workflows — that requires its own architecture, to be decided when V5 is planned, per ADR-0011. Nothing in this document may be read as already covering that case.

**State meanings:**
| State | Meaning |
|---|---|
| Idle | No suggestion is present or being requested for the target field |
| Requesting | The user's invocation has been received; the request is being assembled/sent |
| Generating | Awaiting the Capability's response (see Loading Behavior) |
| Suggestion Ready | A validated suggestion is available and offered, not yet acted on |
| Accepted | The user accepted the suggestion; it becomes ordinary Canvas content (see Suggestion Lifecycle) |
| Rejected | The user dismissed the suggestion without accepting it; returns to Idle |
| Failed | The invocation did not produce a usable suggestion (taxonomy and handling owned by [05_ai_feedback_and_error_experience.md](./05_ai_feedback_and_error_experience.md); this diagram only shows where Failed sits in the lifecycle) |
| Completed | Terminal state for this invocation, reached via Accepted |

## Loading Behavior

**This section defines WHEN loading exists, never HOW it looks** — the visual presentation is the existing Design System Loading Indicator primitive (`design-system/01_design_system.md`'s Component Inventory), referenced here, not redefined.

- Loading exists exactly during `Requesting` and `Generating`.
- **Non-blocking by default**, per Manual-first: loading indication must never prevent the user from continuing to work on the same screen, including the targeted field itself (see Manual-first below).
- **Cancelability:** a user may cancel a `Generating` request (e.g., by navigating away from the field or an explicit cancel affordance). Cancellation always returns to `Idle` cleanly — it never leaves a partial suggestion, a stuck loading indicator, or an inconsistent Canvas value.

## Manual-first Behavior and Field Editability

Restates Governing Rule 2 with its full operational detail:

- The Canvas field targeted by an in-flight invocation remains editable throughout `Requesting`, `Generating`, and any `Retry` loop back through those states. No implementation may disable, lock, or otherwise make that field read-only because a request is in flight.
- If the user types into the field while a request is in flight, the user's edit is authoritative. When the response eventually arrives, it must never silently overwrite what the user has typed — the arriving suggestion is either discarded (if the user has clearly moved on) or still offered as a `Suggestion Ready` option the user may choose to view, but it is never force-applied over live user input.
- This applies identically to every future single-call AI Capability instantiating this lifecycle — it is not a Canvas Assistant-specific rule.

## Suggestion Lifecycle

*(Governs every invocation except [ADR-0017](../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md)'s single named carve-out: [Project Summary Synthesis Assistant](./capabilities/06_project_summary_synthesis_assistant.md)'s `initial_generation` writes a successful response directly to its target on `Generating` success, with no `Suggestion Ready`/Accept step, because that Operation targets an artifact that does not yet exist — there is no live user-authored content for Manual-first's overwrite protection to apply to. That capability's `sync` Operation is not part of this carve-out and follows this Suggestion Lifecycle exactly as written below.)*

- **Accept:** inserts the suggestion text into the targeted field. From that moment, per [ADR-0009](../architecture/decisions/ADR-0009-ai-platform-localization-integration.md) and [Canvas Assistant](./capabilities/01_canvas_assistant.md#localization), it is ordinary user-authored content — never re-localized on a later language switch, and not visually distinguished as AI-originated after acceptance (only the pre-acceptance offer is marked as AI-originated; see AI-Specific UX Terminology).
- **Reject:** dismisses the suggestion without altering the field. The user may invoke the capability again later; rejection carries no penalty or cooldown.
- **Regenerate:** requests a new suggestion for the same operation and context. Per Governing Rule 3 and Conversation Policy below, this is a **new, independent invocation** looping back to `Requesting` — not a continuation of a prior turn.
- **Suggestion replacement rule:** if a new suggestion (from Regenerate) arrives while a prior one is still `Suggestion Ready` and unacted on, the new suggestion **replaces** the old one entirely. Suggestions are never shown side by side — this matches [Canvas Assistant](./capabilities/01_canvas_assistant.md#response-contract)'s Response Contract, which returns one suggestion, not a list.
- An already-`Accepted` suggestion is never retroactively altered by a later invocation for the same field — a later invocation starts its own fresh cycle from `Idle`.

**Acceptance Confirmation (Feature-local presentation, not a new lifecycle state):** The Interaction Lifecycle diagram above already models `Accepted` and `Completed` as two distinct points, reached in sequence; nothing here changes that shape or adds a state. A Feature may give that already-existing `Accepted → Completed` transition a brief, visible dwell time — a transient confirmation displayed in the same UI region the Suggestion Card occupied, disappearing automatically without requiring a user action. This is Feature-owned presentation, per [Ownership Model](./03_ownership_model.md#single-owner-principle)'s Feature-specific view model — not a new shared status value, and adopting it is optional per-Feature.

**Purpose.** The confirmation exists for exactly one reason: to acknowledge that the accepted suggestion has been successfully applied, before the interaction returns to `Idle`. It is an acknowledgment of a completed action, not a new decision point, not a review surface, and not a second suggestion — the user takes no action on it.

**End conditions.** The confirmation is present only between `Accepted` and the interaction's return to `Idle`, and ends — returning the interaction to `Idle` — the moment either of the following becomes true, whichever happens first:
- its intended display period has elapsed, or
- a new invocation begins for the same target (Ask AI, Regenerate).

No other condition ends it, and neither condition above is optional — a Feature adopting this confirmation must satisfy both. How either condition is detected or enforced is an implementation concern this document does not prescribe.

**Requirements that bind regardless of which Feature implements it:**
- It must not move keyboard focus — Manual-first and the page's ordinary tab order are undisturbed.
- A new invocation for the same target supersedes any confirmation still visible for that target, per the End conditions above; the confirmation is transient view-state, not a queued or guaranteed-to-be-seen message.
- Navigating away from the target before the confirmation's own display period elapses must not cause it to later resurface against a different question or field.

**Optional rationale.** If the Response Contract's optional rationale was present on the accepted suggestion, a Feature may include it in this same transient confirmation. Its lifetime is identical to the confirmation's own — governed by the same End conditions above, with no lifetime of its own: it disappears together with the confirmation, is never persisted anywhere, is never treated as conversation or session history (Conversation Policy below remains stateless-per-invocation), and never extends the AI lifecycle beyond `Completed`. It remains an optional UX enhancement to the confirmation, never a requirement for adopting one.

**Non-goals.** This confirmation's sole responsibility is acknowledging successful application of the accepted suggestion. It is deliberately not, and must never be extended to become:
- a history or log of past suggestions,
- an audit trail,
- conversation memory or session state,
- a post-completion review surface a user returns to later, or
- a persistent marker of AI provenance on the field.

Any future need for these belongs to a separate, explicit decision — never an incremental extension of this confirmation.

## Conversation Policy

- **V2 is stateless per invocation**, per [ADR-0011](../architecture/decisions/ADR-0011-defer-multi-step-workflow-orchestration.md): no turn or session memory is carried between invocations. Every Regenerate or Retry is a fresh capability call, re-supplied with whatever context the Feature currently holds — the AI Platform does not remember a prior response.

- **Progressive Context Accumulation.** "Fresh" does not mean "minimal": every invocation uses all currently available, user-approved project state, not only the immediately previous question. As a user answers more questions, each subsequent invocation reflects the fuller, current picture — this is what "whatever context the Feature currently holds" (above) already means, stated explicitly as a named rule so it is never mistaken for "only the last answer." No new mechanism is implied — a Feature already reads its own current data on every invocation; this rule only makes that expectation binding rather than incidental.

- **User Input Has Highest Authority.** Whenever a field's value has been manually edited — including editing over a previously Accepted AI suggestion — that live value is what every future invocation reads. Per [ADR-0009](../architecture/decisions/ADR-0009-ai-platform-localization-integration.md), accepted AI content is ordinary user-authored content the moment it's accepted; there is no separate record of "what the AI originally suggested" for a later invocation to fall back on. A capability reads whatever the Feature's current data holds — never a history of prior values. This holds structurally, not by convention: Canvas fields carry a single current value, not a version history. Even when a request is built entirely from an edited value, the response remains advisory only — Suggestion Lifecycle's Accept/Reject mechanics and Governing Rule 2 apply exactly as to any other invocation; a new suggestion never overwrites confirmed content without the user's own explicit Accept.

- **Context Quality.** Context supplied to an invocation should contain only meaningful, current information — a behavioral expectation, not a prescribed algorithm or token-management strategy (token/length management is an implementation concern, not specified here). Concretely: do not repeat the same information more than once within a single request, and do not include a value already known to be obsolete (e.g., a field's prior value once it has been overwritten) — only the current value accumulates, never a running history of every value a field ever held.

- **Future Consideration.** No formal priority-resolution algorithm exists for combining multiple context sources. Future AI capabilities may require a formal Context Priority Rule once multiple context sources or capabilities coexist (e.g., a composed AI+Search experience, or multiple concurrent capabilities informing one request) — this is a placeholder for a decision to make explicitly if and when that need is real, not a design adopted now.

- This is a deliberate, current-stage answer, not a permanent one: V5 (per ADR-0011) may require session/workflow state. This document's lifecycle explicitly does not model that; extending it to cover conversation memory is a decision to make explicitly when V5 is planned, not something a future Capability may quietly assume this document already supports.

## Accessibility (AI-Interaction-Specific Only)

Per Governing Rule 4, only what is specific to this lifecycle is stated here; the general accessibility baseline (focus order, general ARIA contract) remains an open, project-wide item owned by Frontend/Design System, not resolved by this document.

- The transition into `Suggestion Ready` must be announced to assistive technology (e.g., via a live region), since it arrives asynchronously and is not the direct result of the user's most recent keystroke.
- The `Accepted → Completed` transition, when a Feature chooses to surface a completion confirmation (see Suggestion Lifecycle's Acceptance Confirmation), must be announced to assistive technology using the same mechanism as the Suggestion Ready and Failed transitions above — a sighted-only confirmation is not sufficient.
- Accept, Reject, and Regenerate affordances must be reachable via standard keyboard navigation — satisfied by using compliant Design System primitives for these actions, not custom unreachable controls. This document does not redefine what makes a primitive keyboard-compliant; that contract is Design System's own (`design-system/01_design_system.md`).
- A failure transition into `Failed` must also be announced (detailed failure-messaging content is owned by [05_ai_feedback_and_error_experience.md](./05_ai_feedback_and_error_experience.md); this section only requires that the state change itself is not silent to assistive technology).

## Localization

References [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md), [ADR-0009](../architecture/decisions/ADR-0009-ai-platform-localization-integration.md), and [AI Platform Architecture](./01_architecture.md#localization) — none of it is redefined here.

- Static interaction copy this lifecycle needs (e.g., "Accept," "Regenerate," a loading message) is ordinary Workspace UI text, resolved through the existing Localization Layer (`frontend/01_architecture.md#localization-layer`) — no new copy or resource mechanism is introduced.
- The suggestion text itself arrives already-localized from the Capability (per each capability's own Localization section, e.g. [Canvas Assistant](./capabilities/01_canvas_assistant.md#localization)) — this interaction layer renders it as-is and never attempts to translate or re-localize it client-side.

## AI-Specific UX Terminology

| Term | Meaning |
|---|---|
| Invocation | The explicit user action that starts the lifecycle at `Requesting` (never a passive display) |
| Suggestion | The AI-generated content offered at `Suggestion Ready`, prior to being Accepted |
| Suggestion Card | The visual container presenting a suggestion — behavior only is defined here; the primitive itself is Design System's (see Design System Routing) |
| Regenerate | Requesting a different suggestion after one is already `Suggestion Ready` |
| Retry | Requesting the capability again after a `Failed` outcome |

## Design System Routing

Per Governing Rule 5, checked against `design-system/01_design_system.md`'s current Component Inventory before defining anything new:

| Concept | Status in Design System today | Routing |
|---|---|---|
| Suggestion Card | Does not exist | **Behavioral contract only, defined above** (must convey suggestion text, and expose Accept/Reject/Regenerate actions, visually distinguishable from user-authored text prior to acceptance). The visual primitive itself is proposed to Design System as a new addition, following the same preemptive-promotion precedent already used for Progress Indicator/Choice List — every future single-call AI Capability will need the identical shape. This document does not design its markup, styling, or component API. |
| Loading indication | Exists — Loading Indicator | Reused as-is; no new primitive |
| AI hint / AI badge / AI affordance | Existing Tag/Chip and Inline Alert-family primitives cover this | Reused as-is; this document adds only the behavioral rule that displaying one is never invocation (Governing Rule 1) |
| Failure messaging presentation | Existing Inline Alert / Error Banner | Reused as-is; content/messaging principles owned by [05_ai_feedback_and_error_experience.md](./05_ai_feedback_and_error_experience.md) |

## Out of Scope

- Search orchestration and any AI+Search composed experience — Search is an independent Platform Capability, per [ADR-0010](../architecture/decisions/ADR-0010-search-as-independent-platform-capability.md); this lifecycle governs one AI Capability invocation only (Governing Rule 3).
- Multi-agent behavior.
- Workflow chaining / multi-step orchestration — deferred per [ADR-0011](../architecture/decisions/ADR-0011-defer-multi-step-workflow-orchestration.md).
- Conversation memory beyond what Conversation Policy above states.
- Autonomous execution.
- Streaming responses.
- V3+ capability-specific interaction needs (Market Intelligence, GTM Planner, Product Builder) — each instantiates this same lifecycle per single-call invocation; this document does not anticipate any capability-specific UX beyond that reuse guarantee.
