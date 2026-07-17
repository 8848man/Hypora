# Landing Experiment Strategy

**Refs:** → [00_index](../00_index.md) · [Application Responsibilities](./05_application_responsibilities.md#landing) · [Design System](../design-system/01_design_system.md) · [Frontend Architecture](../frontend/01_architecture.md#localization-layer) · [Analytics Event Model](../analytics/02_event_model.md) · [Analytics Event Catalog](../analytics/04_event_catalog.md) · [Ownership Map](../rules/ownership.md)

Owned here, not a new top-level area: [Ownership Map](../rules/ownership.md) records Landing's content under Product/Context until Landing is promoted to its own `sdd/landing/` directory, and that promotion's own stated trigger ([00_index](../00_index.md#not-yet-created-by-design)) is "an architecture doc + a contract doc" — neither exists yet, and this document is deliberately neither of those; it is one focused mechanic (a controlled content experiment), not Landing's general architecture. Promotion is revisited if a second, comparably substantial Landing-specific need arises — not decided speculatively here. This document is a new, numbered sibling within `sdd/context/` (not sub-numbered under [Application Responsibilities](./05_application_responsibilities.md), since that document covers all three Applications and this is Landing-only) — the same pattern already used for [Future Expansion Strategy](./06_future_expansion_strategy.md).

## Purpose

Let Landing test different **storytelling strategies** — which narrative framing of the same product converts better — without touching the Design System, without becoming a general-purpose experimentation framework, and without duplicating the existing Localization Layer.

## Non-Goals

- **Not a visual design test.** Every structural and presentational element (Design System, components, layout, navigation, typography, colors, spacing, animations, section order, screenshots, CTA placement) is identical across every variant. Only what the copy says differs.
- **Not a general experimentation platform.** No registry, plugin system, or generalized "experiment" abstraction is introduced. This is a narrowly-scoped, Landing-specific mechanism. See Future Evolution below.
- **Not a second localization mechanism.** Variant content composes with the existing Localization Layer; it does not parallel or replace it. See Content Model below.

## Experiment Definition

Three variants, each a different narrative framing of the same product:

| Variant | Strategy | Framing |
|---|---|---|
| A | Problem Empathy | "You have ideas but don't know how to start." |
| B | Loss Aversion | "Ideas disappear if they never become execution." |
| C | Execution Confidence | "Execution matters more than ideas." |

**What may differ between variants:** Headlines, Subheadlines, storytelling copy, section copy, CTA copy, Feature descriptions.

**What must remain identical across all variants:** the Design System, every component, layout, navigation, typography, color, spacing, animation, section order, screenshots, and CTA placement. A variant is a *content substitution*, never a structural or visual one — enforced by the Design System Boundary below.

## Content Model — Composes With the Existing Localization Layer

Variant selection is **a second dimension of content resolution, alongside language — not a separate system.** [Question Model](../workspace/features/02_1_question_model.md#localization) already established the precedent this follows: content identity (a stable key) is separated from presentation content (localized text), and a second dimension (there, language; here, variant) is "just one more input parameter" to the same resolution mechanism, never a parallel one.

Concretely: each piece of variant-eligible copy (a headline, a CTA label, a Feature description) is addressed by a stable content key, and resolved against **both** the current `variant` and the current `language` — the same [Localization Layer](../frontend/01_architecture.md#localization-layer) that already resolves `ko`/`en` text resolves variant-specific text too, keyed by `(contentKey, variant, language)` instead of `(contentKey, language)`. Every variant's copy exists in both Korean and English, authored the same way existing Landing copy already is (Korean first, per the [Localization Principle](./01_product_vision.md#localization-principle)) — a variant is never partially localized.

No Feature module, page component, or Design System primitive resolves variant content itself; each receives already-resolved text as data, exactly as it already receives localized text as data today.

## Variant Assignment

- **Random, uniform assignment across A/B/C on a visitor's first visit** — a simple, unweighted random choice; no stratification, bucketing service, or experimentation platform is warranted at this scale.
- **Persisted locally** so a returning visitor sees the same variant on subsequent visits, within the expiration window below.
- **Assignment expires after 7 days; after expiration, a new random assignment is made.**

**This is a deliberate product-stage decision, not a statistical optimization, and is recorded as such rather than silently accepted:** Hypora is currently at an MVP stage focused on rapid experimentation rather than long-term brand consistency. Exposing returning visitors to a fresh random variant every 7 days is considered more valuable right now than holding one visitor to one variant for the entire experiment's duration — the trade-off being that cross-visit attribution (did this visitor's eventual conversion belong to variant A or C) is intentionally not clean under this design. If and when Hypora's stage shifts toward needing rigorous, publishable experiment results, this expiration behavior is the first thing to revisit — not the assignment mechanism itself.

## URL Override

`?variant=a` (or `b`/`c`) on any Landing URL bypasses random/stored assignment for that page load only — it does not overwrite the persisted assignment, so removing the parameter returns the visitor to their real assigned (or not-yet-assigned) variant. Exists solely for QA, marketing previews, demonstrations, and debugging — never a mechanism a real visitor is expected to use.

## Local Storage Ownership

Per [Frontend Architecture](../frontend/01_architecture.md#localstorage-ownership)'s existing rule, no Landing page or component accesses Local Storage directly. A single, dedicated Landing Experiment storage module is the sole owner of the one storage key this mechanism needs — reading the current assignment, writing a new one, and validating expiration — mirroring the same narrowly-scoped-module precedent the Analytics Platform Service already established for its own session/anonymous-identity storage ([Provider Independence](../analytics/03_provider_independence.md)). This is a single, Landing-specific key, not a generalized `experiment_assignments` structure — see Future Evolution below for why.

## Analytics

Per [Analytics Event Catalog](../analytics/04_event_catalog.md)'s own rule ("never invent an event name inline"), this reuses the existing, already-catalogued Landing events rather than introducing new ones:

- **`landing_page_view`** and **`cta_clicked`** — both already exist. Their `properties` are extended (additive, per [Event Model](../analytics/02_event_model.md#extensibility-of-properties)'s own rule that adding a property to an existing event never requires a change to that document) with:
  - `variant` — the currently active variant (`a`/`b`/`c`)
  - `assignmentSource` — `"random"` (a fresh assignment was just made), `"storage"` (an existing assignment was loaded), or `"url_override"` (the URL parameter was used for this page load)

**No new event is introduced.** A fresh assignment is already fully identifiable as a `landing_page_view` where `assignmentSource = "random"` — a dedicated "assignment" event would carry no information the extended `landing_page_view` doesn't already provide, which is exactly the kind of unnecessary data collection this project's Event Model discipline avoids.

## Design System Boundary

- **The Design System is unaware that Landing variants exist.** No component receives a `variant` prop, checks a variant value, or branches its rendering on which variant is active.
- **No Design System component contains variant-specific logic or conditional styling.** A variant changes only the *text* passed into an already-existing component (`<h1>{variantHeadline}</h1>` instead of `<h1>{t.landing.heroTitle}</h1>`) — never the component's structure, styling, or behavior.
- **Experiments change content only** — this document's Non-Goals and Experiment Definition sections above are the enforced boundary; any implementation that varies layout, components, or styling per variant is a defect against this document, not a stylistic choice.

## Future Evolution

**No experiment framework, registry, plugin system, or generalized experiment architecture is introduced now.** This mechanism — assignment, storage, analytics properties, content resolution — is intentionally Landing-specific and scoped to exactly this one experiment. Illustrative future possibilities (a Pricing experiment, an Onboarding experiment, a Dashboard experiment) are not concretely planned; generalizing ahead of a real second experiment would be exactly the kind of speculative abstraction this project's evolution discipline avoids everywhere else (Platform Services' Admission Criteria, Search's deferred architecture, the Design System's own alternate-implementation seam all apply the identical "promote only once a real second consumer exists" test). If a second real experiment is ever scoped, generalizing this mechanism at that time — informed by what that real second case actually needs — is the correct next step, not a redesign of this one.

## What This Document Does Not Cover

- The actual experiment's duration, success metric, or stopping rule — a product/growth decision, not an architectural one, out of scope here.
- Landing's general architecture (routing, IA, page structure) — still owned by [Application Responsibilities](./05_application_responsibilities.md#landing) until Landing's own promotion trigger fires.
- The Localization Layer's own mechanism — owned by [Frontend Architecture](../frontend/01_architecture.md#localization-layer); this document only states that variant content composes with it, not how it works.
- Implementation details (file names, function signatures, exact storage key name) — specification only, per this task's own scope.
