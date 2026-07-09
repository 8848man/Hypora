# ADR-0009: AI Platform Localization Integration

**Status:** Accepted
**Date:** 2026-07-08
**Affects specs:** [Product Vision](../../context/01_product_vision.md#localization-principle), [Workspace Architecture](../../workspace/01_architecture.md#localization), [Workspace Data & State](../../workspace/02_data_and_state.md#application-level-state-non-project), [Frontend Architecture](../../frontend/01_architecture.md#localization-layer), [Question Model & Preset Strategy](../../workspace/features/02_1_question_model.md#localization), AI Platform Architecture (forthcoming, `sdd/platform-api/`)
**Related ADRs:** [ADR-0005](./ADR-0005-korean-first-localization-architecture.md) (canonical owner of the localization architecture this ADR integrates with, not replaces); [ADR-0006](./ADR-0006-ai-as-platform-capability.md) (the capability boundary AI-generated content flows through)

## Context

[ADR-0005](./ADR-0005-korean-first-localization-architecture.md) already established Korean as Hypora's canonical language, English as an official localization, a Localization Layer in the frontend architecture, and a content-identity/presentation-content separation (via `localizationKey`) that explicitly anticipated V2's AI-based content: "V2's AI-based preset provider receives the current language as an ordinary input parameter and must return already-localized output — no UI or Question Model change is needed when V2 arrives." The AI Platform architecture (ADR-0006 onward) was designed independently of this and does not, as proposed, reference ADR-0005 or the existing `language` state at all — leaving open whether the AI Platform would introduce a second, parallel localization mechanism. Given ADR-0005 explicitly already solved this integration point in principle, allowing the AI Platform to reinvent it would create duplicated ownership over what "the current language" means and how localized content is identified — precisely the kind of duplicated concept ownership the project's ownership discipline forbids.

## Decision

1. **The AI Platform does not introduce a new localization mechanism.** It consumes the existing canonical `language` Application-level state (owned by [Workspace Data & State](../../workspace/02_data_and_state.md#application-level-state-non-project)) as an ordinary input to Context Creation ([ADR-0008](./ADR-0008-ai-platform-ownership-model.md)).
2. **AI-generated content that populates a content-identity-bearing concept** (e.g., a Question Model field, per [ADR-0005](./ADR-0005-korean-first-localization-architecture.md)) follows the same content-identity/presentation-content separation already established there: the AI Application Service returns already-localized presentation content for the requested language, exactly as a human-curated preset would, and never returns a `localizationKey` or content-identity fields itself.
3. **User-authored content is never touched by the AI Platform's localization behavior.** Per ADR-0005's scope boundary, user-entered Canvas answers and Project names are never translated or altered — this applies identically when an AI Capability produces a suggestion for such a field: the suggestion is offered in the user's current language, but accepting it produces ordinary user-authored content, not a re-localizable AI artifact.
4. **This is an integration, not an extension, of ADR-0005.** ADR-0005 remains the sole canonical owner of the localization policy, the Localization Layer, and the content-identity/presentation-content model. This ADR only records that the AI Platform is a consumer of that model, not a second definition of it.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| Let the AI Application Service manage its own language handling independently (e.g., a separate `locale` parameter with its own resolution rules) | Rejected — creates a second, parallel concept of "current language" alongside the canonical Application-level `language` state, violating the project's single-canonical-owner discipline and reopening exactly the problem ADR-0005 closed |
| Require AI responses to include a `localizationKey` and let the Frontend Localization Layer resolve presentation content afterward | Rejected — AI-generated text does not have a pre-existing resource entry to key into; the model best suited here is the same one ADR-0005 already assigned to human-curated presets (return already-localized content directly), not the identity/lookup model used for static UI copy |
| Defer localization integration until a concrete V2 Feature surfaces the gap | Rejected — ADR-0005 already anticipated and resolved this exact integration point in principle; deferring would mean re-deriving a decision that already exists, and risks a V2 implementation silently diverging from it |

## Consequences

**Positive:**
- No duplicated localization system; the AI Platform is simply one more consumer of the architecture ADR-0005 already built for exactly this purpose.
- AI Capability implementations require no localization-specific design work beyond passing `language` through Context Creation — the hard problem was already solved.
- Consistent with ADR-0005's own stated intent: "no UI or Question Model change is needed when V2 arrives."

**Negative / accepted trade-offs:**
- The AI Application Service must treat `language` as a required, non-optional context input for any capability whose output reaches a localized surface — a small but permanent constraint on every future capability's request shape.
- None of ADR-0005's scope boundaries (e.g., the specification tree itself remaining English-authored) are affected or reopened by this ADR.

## Future Impact

Every future AI Capability (V3–V5) that produces user-facing text must pass `language` through Context Creation and return already-localized output, per this ADR. If a future stage needs localization behavior ADR-0005's model cannot express, that is a signal to revisit ADR-0005 directly — this ADR does not have authority to diverge from it.
