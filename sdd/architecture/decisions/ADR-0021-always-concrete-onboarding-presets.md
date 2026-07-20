# ADR-0021: Always-Concrete Onboarding Presets — Retire Sufficiency Branching and Thinking Prompts

**Status:** Accepted
**Date:** 2026-07-21
**Affects specs:** [Onboarding Preset Assistant](../../ai/capabilities/07_onboarding_preset_assistant.md) (Response Contract, Contract Version 1.0→2.0, breaking), [Business Structuring](../../workspace/features/02_business_structuring.md), [Question Model & Preset Strategy](../../workspace/features/02_1_question_model.md), [AI Capability Index](../../ai/capabilities/000_index.md)
**Related ADRs:** [ADR-0019](./ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) (this ADR partially supersedes Decision 3 and Decision 7's Response-shape framing; every other Decision of ADR-0019 remains fully in force, unchanged — see the partial-supersession note below)

> **Partial supersession note (2026-07-21):** This ADR supersedes only [ADR-0019](./ADR-0019-ai-generated-onboarding-presets-at-project-creation.md)'s Decision 3 (the Sufficiency/Thinking-Prompts branching) and the parts of Decision 1/7 that referenced a discriminated-union Response shape. ADR-0019's core thesis — a single-call, automatically-invoked capability producing preset content that is always offered through Business Structuring's existing select-or-customize interaction, never auto-inserted, falling back to the static V1 provider on failure — is fully in force, unchanged. Read this ADR together with ADR-0019 for the current, accurate Response Contract.

## Context

Real usage surfaced a regression ADR-0019's Decision 3 did not anticipate: when Onboarding Preset Assistant judged a Project's Name/Description as `insufficient`, the Business Idea question rendered **zero selectable presets** — only a block of non-clickable "Thinking Prompts" text plus the always-available custom-answer field. From a user's perspective this looked exactly like the preset-selection UI itself had been removed, not like a different, still-selection-based AI provider. This directly regresses the product's own original interaction model (per [ADR-0004](./ADR-0004-guided-question-flow-for-business-structuring.md)): every question — regardless of preset source — must present multiple selectable options a user can pick with one click, plus free text as an alternative, never the reverse.

Separately, generated preset content was found to be too generic in places — reading like reusable template scaffolding ("[X] process," "Define target users") rather than concrete example answers a founder could immediately recognize as being about their own idea.

Both problems trace to the same root: [Onboarding Preset Assistant](../../ai/capabilities/07_onboarding_preset_assistant.md)'s Response Contract allowed a non-preset output shape (Thinking Prompts) and did not constrain generated text against genericness. Fixing the interaction regression and the content-quality problem together, in the same capability contract, avoids treating them as two unrelated patches.

## Decision

1. **Retire the Sufficiency/Thinking-Prompts branch entirely.** [Onboarding Preset Assistant](../../ai/capabilities/07_onboarding_preset_assistant.md)'s Response Contract no longer carries a `sufficiency` discriminant or a `thinkingPrompts` field. Every successful Response is unconditionally a full batch of preset sets for all five Canvas questions — the capability's own prompt now instructs the model to *invent* plausible, concrete specifics when the supplied Name/Description are thin, rather than asking the user open-ended questions in their place. This is a breaking change to Contract Version 1.0 (Stable, since Project Management is already an implemented Consumer) — bumped to **2.0**; 1.0's shape is preserved in that capability's own Contract Version History, per [Contract Versioning](../../ai/capabilities/000_index.md#contract-versioning).

2. **The preset-selection UI is never replaced or hidden by AI content, for any question, under any capability outcome.** [Business Structuring](../../workspace/features/02_business_structuring.md)'s `ChoiceList` interaction (select one option with a single click, edit it afterward, or ignore every option and write freely) governs every question at every moment — this restates [ADR-0004](./ADR-0004-guided-question-flow-for-business-structuring.md)'s and [ADR-0019](./ADR-0019-ai-generated-onboarding-presets-at-project-creation.md)'s own "never auto-inserted, always offered through the existing interaction" principle, now made an explicit, checkable rule after this regression showed it could be silently violated by a second content type sharing the same screen.

3. **Content Quality Validation, enforced server-side, before a Response is accepted.** The capability now validates every generated option string against a Rejection Pattern set — bracket/placeholder markers (`[`, `]`, `{`, `}`, `<`, `>`), and a small set of generic leading nouns ("Process", "Workflow", "Feature", "System", "Platform" and their direct translations) that signal template scaffolding rather than a concrete answer. An option failing validation is dropped; if fewer than 3 valid options remain for any one of the five questions, the **entire Response is treated as invalid** — identical to a malformed/parsing-failure Response per the capability's existing Failure Scenario Matrix — and Business Structuring falls back to the static V1 provider for that Project, exactly as it already does on any other capability failure. No new failure mode or user-facing error state is introduced; this reuses the existing Fallback path.

4. **No second AI call, no regeneration loop, within one invocation.** Rejecting individual options and — if too many are rejected — falling back to the static provider is a **filter-then-fallback** design, not a retry-and-reprompt design. This keeps the capability a single provider call per Project (per [ADR-0019](./ADR-0019-ai-generated-onboarding-presets-at-project-creation.md) Decision 2 and [ADR-0011](./ADR-0011-defer-multi-step-workflow-orchestration.md)'s deferral of multi-step orchestration) — never a second, automatic re-prompt of the same provider chained onto the first.

5. **Prompt content strengthened with concrete good/bad examples**, instructing the model to write as if the product already exists (e.g., "Automatically reminds customers about upcoming reservations," never "[Feature] reminder system") — a prompt-engineering change to the capability's own template content, not a contract change, and therefore not itself a versioned concern per [Contract Versioning](../../ai/capabilities/000_index.md#contract-versioning)'s scope (which versions shape, not wording).

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Keep Thinking Prompts, but also render them as clickable (insert-on-click) options | Rejected — a Thinking Prompt is an open-ended question ("What inspired you to start this?"), not an answer; making it clickable-to-insert would silently write a question into an answer field, actively misleading rather than merely unhelpful. |
| Keep the Sufficiency branch, but always populate *some* presets for Business Idea even when insufficient, as a secondary path alongside Thinking Prompts | Rejected — this keeps two content types on one screen (exactly the confusion that caused the regression) instead of removing the second type entirely. |
| Reject bad content and re-invoke the provider automatically to regenerate just the failing question | Rejected per Decision 4 — a second automatic provider call within one capability invocation is a multi-step pattern this project's architecture (ADR-0011) defers; filter-then-fallback achieves the same "never show garbage" guarantee with the existing single-call model and the existing Fallback path. |
| Loosen the rejection patterns to reduce Fallback frequency | Rejected — the whole point of Decision 3 is a hard quality floor; a looser filter would let template-like text back into the UI, reintroducing Issue 2. |

## Consequences

**Positive:**
- Restores the product's one, consistent interaction model (select-or-customize) for every question, closing the exact regression reported.
- Content-quality floor is enforced structurally (validation before Response is ever accepted), not left to prompt wording alone.
- No new architecture: reuses the existing Fallback path, the existing single-call model, and the existing `ChoiceList` component unchanged.

**Negative / accepted trade-offs:**
- A Project with an extremely thin Name and no Description may now receive more Fallback (static-preset) outcomes than it would have under the old Thinking-Prompts branch, since validation is stricter and there is no longer a lower-effort content type to fall back to first. Accepted: static V1 presets were always the correct, always-available baseline; per Decision 1, the prompt is now explicitly instructed to still attempt concrete, invented specifics rather than immediately conceding, so this is expected to be the less common outcome, not the typical one.
- Contract Version 2.0 is a breaking change to an already-Stable contract — Project Management (the sole Consumer) is updated in the same change per this ADR; no other Consumer exists to migrate separately.

## Future Considerations

If a genuinely open-ended "help me think this through" content type is wanted again in the future, it needs its own explicit product decision and its own UI treatment clearly distinct from any selectable list (e.g., a separate, clearly-labeled area never sharing a screen slot with `ChoiceList`) — this ADR does not reintroduce that need, and a future proposal should not assume the old Thinking Prompts design is still available to extend.
