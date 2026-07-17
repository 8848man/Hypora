# Landing Component Model

**Refs:** → [00_index](./00_index.md) · [01_architecture](./01_architecture.md) · [02_information_architecture](./02_information_architecture.md) · [04_component_contracts](./04_component_contracts.md) · [05_design_system](./05_design_system.md) · [Design System](../design-system/01_design_system.md) · [Frontend Architecture](../frontend/01_architecture.md#component-ownership)

## Review Method

Every visual pattern from the three prototype files (`planning/prototype/concept_a.html`/`b`/`c`) was reviewed once, classified into exactly one of four outcomes, and reasoned against [Frontend Architecture](../frontend/01_architecture.md#component-ownership)'s three-tier ownership model (Design System primitives / Feature-owned components / App-shell components) and its Promotion Rule ("a component moves from Feature-owned to Design System only when a second Feature — or Landing — needs the identical pattern"). Landing has no Feature subdivision the way Workspace does, so the middle tier is realized here as **Landing-owned, section-specific components** — owned by Landing itself, not any single Feature, and not yet promoted to the shared Design System since no second consumer exists today.

| Outcome | Meaning |
|---|---|
| **Promote** | An existing Design System primitive already covers this pattern — Landing continues consuming it, unchanged |
| **Promote (new, Landing-owned)** | A genuinely new pattern, not covered by an existing primitive, but not yet warranting Design System promotion either (single consumer) — becomes a named Landing-owned component |
| **Merge** | Two or more prototype patterns collapse into one component, since they were the same underlying shape with different content |
| **Remove / Replace** | A prototype-phase pattern is dropped as its own named component; the same visual result is achieved by plain composition of existing primitives, with no new component required |

## Review Table

| Prototype pattern | Section(s) | Outcome | Reasoning |
|---|---|---|---|
| Header/nav chrome (logo, in-page nav, CTA) | Persistent, all routes | **Promote** | Already implemented (`LandingLayout.tsx`); an App-shell component per [Frontend Architecture](../frontend/01_architecture.md#component-ownership)'s own naming ("Landing's page chrome"). Its scroll-triggered chrome behavior is a [Motion System](./06_motion_system.md) behavior applied to an existing component, not a new one; its internal layout now follows a three-region (logo / centered nav / actions) structure per [05_design_system.md](./05_design_system.md#header-navigation-centering) — a layout correction, not a new component. |
| Hero (eyebrow + headline + lede + CTA row) | Hero | **Promote** | [Design System](../design-system/01_design_system.md#component-inventory) already lists "Hero Section" for Landing Home. No new component; Section 2's "The Gap" content is a *separate* section, not folded into Hero. |
| Eyebrow / context label | Every section | **Promote** | Reuses the existing **Status Badge** primitive, per [Improvement 9](./improvement/03_improvement_plan.md#improvement-9--reuse-status-badge-as-a-landing-section-context-label) — a same-component, new-composition change, not a new primitive. |
| Primary / Secondary Button | Hero, Closing, header | **Promote** | Existing Primary/Secondary Button primitives. Hover motion (lift/fade) is a [Motion System](./06_motion_system.md) utility applied at composition time — never a new Button variant. |
| Three-card contrast group (note tool / project tool / Hypora) | The Gap | **Merge**, into **Contrast Panel** | Same underlying shape (N items, one visually emphasized) as the next row — see below. |
| Two-panel contrast (Structuring / Validating) | Structuring vs. Validating | **Merge**, into **Contrast Panel** | The Gap's 3-card group and this section's 2-panel group differ only in item count and whether one item is emphasized — one Landing-owned **Contrast Panel** component, parameterized by item count and an optional "emphasized" item, replaces both prototype-specific patterns. Not promoted to the shared Design System: no Workspace need for this shape exists today. |
| Guided-question mechanism visual (question card + answer chips + confirmation) | How Hypora Thinks | **Promote (new, Landing-owned)** — **Guided Question Preview** | No existing primitive represents "one guided question + a chosen answer + a saved confirmation." This is a **simulation for marketing purposes only** — see [04_component_contracts.md](./04_component_contracts.md) for the explicit non-goal preventing it from ever reading real Workspace state, enforcing [01_architecture.md](./01_architecture.md#responsibilities)'s "no Workspace logic" boundary at the component level. |
| Validation checklist rows (open / done, inside the Validating panel) | Structuring vs. Validating | **Promote (new, Landing-owned)** — folded into **Contrast Panel**'s content slot | Not a separate component — these rows are ordinary content passed into the Validating side of the same Contrast Panel instance, not a distinct visual pattern requiring their own component. |
| Four-row comparison table ("What Hypora Is Not") | What Hypora Is Not | **Promote (new, Landing-owned)** — **Comparison Table** | Distinct shape from Contrast Panel (a label/description row list, not a side-by-side card layout) — kept separate rather than force-merged, since merging would have made both components' contracts less clear for no reuse benefit. |
| Today / Tomorrow two-card roadmap track | *(Removed — see Vision row below)* | **Removed** | Superseded, not merely replaced: the Today/Tomorrow section itself no longer exists (Landing no longer presents a product roadmap in any form — see [02_information_architecture.md](./02_information_architecture.md#route-model)). Its slot in the section sequence is now Vision, which is not this pattern reused, but a different, simpler composition — see below. |
| Vision (headline + 1–2 supporting sentences + optional short thematic list) | Vision | **Remove / Replace** *(no new component)* | Composed from a Status Badge, plain heading/paragraph text, and — if used — a plain 2–3 item list, matching Hero's simple centered composition pattern rather than any comparison/contrast shape. Deliberately **not** built from Contrast Panel: Vision's themes are complementary facets of one direction, not a comparison between distinct items, so reusing Contrast Panel would misrepresent its own contract. No new Landing-owned component is warranted for this. |
| Closing panel (rounded background, heading, lede, CTA, micro-copy, secondary link) | Closing | **Remove / Replace** | No new "Closing Card" component. Composed from existing **Hero Section** (in a compact variant, or plain heading + Button composition), the existing Button primitives, and ordinary text — the prototype's bespoke `.closing` container styling is a composition detail, not a component boundary. |
| Callout emphasis (pulse on the "resolution" item) | The Gap (via Contrast Panel) | **Promote (new, Landing-owned)** — a **Contrast Panel** prop/state, not a separate component | The `.pulse-emphasis` motion behavior ([06_motion_system.md](./06_motion_system.md)) attaches to whichever Contrast Panel item is marked emphasized — motion-layer detail, not a second component. |
| Footer | Persistent, all routes | **Promote** | Already implemented; unchanged. |

## Resulting Production Component Inventory (Landing-Specific)

Only the three genuinely new, Landing-owned components survive as named components — everything else is either an existing Design System primitive or a composition of existing primitives with no new component boundary:

| Component | Tier | Contract |
|---|---|---|
| **Contrast Panel** | Landing-owned, section-specific | [04_component_contracts.md](./04_component_contracts.md#contrast-panel) |
| **Guided Question Preview** | Landing-owned, section-specific | [04_component_contracts.md](./04_component_contracts.md#guided-question-preview) |
| **Comparison Table** | Landing-owned, section-specific | [04_component_contracts.md](./04_component_contracts.md#comparison-table) |

## Promotion Watch List (Not Promoted Now)

Per [Design System](../design-system/01_design_system.md#composition-rules)'s own promotion rule ("added to this inventory only once a second Feature or Landing needs the identical pattern"), none of the three components above are added to the shared Design System by this document — Landing is currently their only consumer. If Workspace (or a future Application) is ever found to need an identical shape, that is the trigger to revisit this list, not a speculative decision made now.
