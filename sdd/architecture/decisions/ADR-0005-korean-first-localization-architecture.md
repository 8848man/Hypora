# ADR-0005: Introduce Korean-First Localization Architecture

**Status:** Accepted
**Date:** 2026-07-08
**Affects specs:** [Product Vision](../../context/01_product_vision.md), [Workspace Architecture](../../workspace/01_architecture.md), [Workspace Data & State](../../workspace/02_data_and_state.md), [Business Structuring](../../workspace/features/02_business_structuring.md), [Question Model & Preset Strategy](../../workspace/features/02_1_question_model.md), [Frontend Architecture](../../frontend/01_architecture.md), [Design System](../../design-system/01_design_system.md), [V1 Release Specification](../../analysis/01_v1_release_specification.md)

## Context

Hypora has so far been specified and implemented with all product copy written directly in English, with no separation between a UI component's display text and the component itself. Product direction now requires official localization: Korean as the canonical, primary product language, with English as an official (not informal or best-effort) secondary language, and an architecture that accommodates further languages later without structural rework.

This decision spans every owned area with user-facing surface — Product/Context (the policy itself), Workspace (the language-selection flow and scope), Frontend (the layer that resolves text), Design System (the component-level contract), and Analysis (the release gate) — is expensive to reverse once components and Question content are written assuming hardcoded strings, and was chosen among genuinely different alternatives for both *content policy* (which language is canonical) and *architecture* (how text separates from components). It meets the ADR trigger list on multiple independent grounds.

## Decision

1. **Content policy:** Korean (`ko`) is Hypora's canonical, primary language — all product copy is authored in Korean first, as the source of truth. English (`en`) is an official supported localization; English resources must preserve the original Korean meaning, not merely approximate it. New features must ship with both languages' resources complete before release (enforced by the [Localization Readiness Gate](../../analysis/01_v1_release_specification.md#localization-readiness-gate)).
2. **Architecture:** introduce a Localization Layer ([Frontend Architecture](../../frontend/01_architecture.md#localization-layer)) between the Application shell and Feature Modules, and require every content-bearing domain concept (starting with the Question Model) to separate **content identity** (language-independent: IDs, ordering, validation/completion rules) from **presentation content** (localized: title/description/option text, looked up via a `localizationKey`). This is the same discipline already applied to keep the Question Model independent of React, extended to cover language as a second, orthogonal independence axis.
3. **State:** the user's selected `language` is a single, Application-level (non-Project) state value ([Data & State](../../workspace/02_data_and_state.md#application-level-state-non-project)), detected as a hint from the device on first launch, defaulting to Korean, persisted locally, and permanently overridden the moment a user manually switches — detection never re-overrides an existing user choice.
4. **Scope boundary:** product/system copy (navigation, questions, presets, empty/validation/system messages) is localized; user-authored content (Project Name, Canvas answers, any user-entered text) is never translated or altered by a language switch, regardless of whether a preset supplied its starting text.
5. **Scope note on the specification tree itself:** this policy governs product-facing copy, not this `sdd/` documentation set, which remains authored in English per this project's established documentation language — Korean-first is a product-content policy, not a specification-authoring policy.

## Alternatives Considered

| Alternative | Why rejected |
|---|---|
| English-first with Korean as the localization | Rejected — contradicts the explicit product direction that Korean is canonical; also would have required re-deriving every existing English spec/content artifact's status as "the translation" rather than "the source," a much larger retroactive exercise than adopting Korean-first going forward |
| Defer internationalization entirely; ship V1 single-language (English) and revisit later | Rejected — the product decision explicitly requires official ko/en support now, not a deferred V2 concern; deferring would also mean V1 components and Question content get built with hardcoded strings, which is exactly the expensive-to-reverse state this ADR exists to avoid |
| Hardcode both languages inline per component now (e.g., a component-level ternary on current language), formalize a resource-based system later | Rejected — this does not achieve "additional languages without structural changes" (a third language would require touching every component), and does not give V2's AI-based preset provider a clean seam; the identity/presentation separation must exist from the start for both requirements to hold |
| A single shared resource format with no identity/presentation separation (e.g., components look up raw strings by an ad hoc key with no formal Question Model tie-in) | Considered, but rejected specifically for the Question Model — without an explicit `localizationKey` on the Question entity, a future AI preset provider (V2) would have no principled way to know it must return already-localized content, re-opening exactly the "AI needs UI changes" problem the Preset Provider seam (ADR-0004) was designed to prevent |

## Consequences

**Positive:**
- Future language expansion beyond Korean/English requires no structural change — a new language is a new set of resource values, not a new code path, component variant, or Question Model change.
- Cleaner architecture overall: the identity/presentation separation this ADR requires for localization is the same discipline the Question Model already needed to stay React-independent (ADR-0004) — this ADR generalizes an existing pattern rather than introducing an unrelated one.
- AI/provider independence: V2's AI-based preset provider (per the [Preset Strategy](../../workspace/features/02_1_question_model.md#preset-strategy)) receives the current language as an ordinary input parameter and must return already-localized output — no UI or Question Model change is needed when V2 arrives, exactly mirroring how the Preset Provider seam already made AI a "different provider," not a different interaction.

**Negative / accepted trade-offs:**
- Additional resource management: every product-facing string now requires two authored values (Korean and English) instead of one, and every new feature's release readiness now includes a translation-completeness check ([Localization Readiness Gate](../../analysis/01_v1_release_specification.md#localization-readiness-gate)).
- Translation maintenance: keeping English resources meaning-accurate as Korean source content evolves is an ongoing content-authoring cost, not a one-time setup cost — accepted as the necessary cost of English being an *official* localization rather than a best-effort one.
- No change to the Business Idea Lifecycle, the guided-flow architecture (ADR-0004), or any lifecycle guard — localization is additive to the existing architecture, not a redesign of it, consistent with this project's "current MVP first" and "no breaking migration" principles.
