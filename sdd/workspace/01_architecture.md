# Workspace Architecture

**Refs:** → [00_index](../00_index.md) · [Product Vision](../context/01_product_vision.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [Core User Journey](../context/03_personas_and_journey.md) · [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md) · [Data & State](./02_data_and_state.md) · [Feature Specifications](./features/000_index.md) · [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md) · [AI Ownership Model](../ai/03_ownership_model.md)

Created ahead of any real Workspace code, per the SDD Framework's "spec leads implementation" principle (`03_document_lifecycle.md`, Type 3: a contract document is created "before or alongside the first real implementation ... spec leads implementation"). This is the point at which Workspace has enough definition to warrant its own architecture document rather than remaining a subsection of the shared context layer.

## Purpose

*(Explicit, by reference)* — Workspace is the primary MVP: the actual web application in which a user structures and validates a business idea (see [Product Vision](../context/01_product_vision.md) and [Application Responsibilities](../context/05_application_responsibilities.md)). This document does not restate *why* Hypora exists — see Product Vision/Positioning for that — it defines *what the Workspace application itself is built to do*.

## Responsibilities

**In scope for Workspace** *(Explicit, per [Application Responsibilities](../context/05_application_responsibilities.md))*:
- Project management (create, list, select, archive a Project)
- Business Canvas authoring
- MVP Scope definition
- Feature Planning
- Validation Checklist
- Project Summary (read view)
- Localization: presenting Workspace's own UI in the user's selected language — see the Localization section below

**Explicitly NOT part of Workspace:**
- Marketing content, value-proposition messaging, or roadmap presentation — owned entirely by Landing; Workspace never renders Landing's pages or duplicates its copy (see [Application Responsibilities](../context/05_application_responsibilities.md)'s Cross-Application Boundaries).
- AI-generated suggestion/assistance is **no longer categorically out of scope** — the product has reached V2: five AI Capabilities are implemented and live (Canvas Assistant, Risk Memo Assistant, MVP Planning Assistant, Validation Planning Assistant, Feature Suggestion Assistant, plus the Project Summary Synthesis Assistant introduced by [ADR-0016](../architecture/decisions/ADR-0016-project-summary-persisted-ai-synthesized-lifecycle.md)), per [Application Responsibilities](../context/05_application_responsibilities.md)'s AI capability row and [AI Platform Architecture](../ai/01_architecture.md). This line previously described V1's manual-only starting point; it is superseded, not deleted, per this project's evolution-rules discipline — V1 itself was and remains 100% manual, but Workspace as it exists today is not V1-only. Every AI Capability still follows [AI Interaction Specification](../ai/04_ai_interaction.md)'s Manual-first Governing Rule, with the sole narrow exception [ADR-0017](../architecture/decisions/ADR-0017-automatic-invocation-for-project-summary-initial-generation.md) grants to Project Summary's Initial Generation.
- Authentication, multi-user accounts, or session management — not part of V1 scope (see [Product Scope](../context/02_product_scope.md)).
- Cross-project comparison views — this would serve the Idea Explorer Future Persona specifically; deferred per the [Workspace Mental Model Review](#workspace-mental-model-review) below.
- Persistence implementation details — Workspace consumes Platform API's conceptual contract; it does not define its own independent storage mechanism (see [Data & State](./02_data_and_state.md)).

## Localization

*(Explicit — this task's product decision; see [ADR-0005](../architecture/decisions/ADR-0005-korean-first-localization-architecture.md) for the full architectural rationale. This section owns the Workspace-facing language selection flow and scope; the persisted `language` state fact itself is owned by [Data & State](./02_data_and_state.md#application-level-state-non-project), and the mechanism that resolves UI text into a language is owned by [Frontend Architecture](../frontend/01_architecture.md#localization-layer) — this section references both rather than restating them.)*

### Language Selection Flow

```
First launch
     │
     ▼
Device language used as a detection hint
     │
     ▼
Default language selected
     │
     ▼
(User may manually switch at any time — see Rules below)
```

**Rules:**
- Korean is the default language — if device-language detection is inconclusive or the device language isn't one Hypora supports yet, the default is Korean, never a silent fallback to English.
- Device language may be used as a detection hint on first launch only — it informs the *initial* default, not a continuous override.
- The user may manually switch language at any time; once a user has manually chosen a language, that choice **overrides** device-language detection permanently — detection is a first-launch convenience only, never re-applied over an existing user preference.
- The selected language is persisted locally and survives refresh — see [Data & State](./02_data_and_state.md#application-level-state-non-project) for the persistence fact itself.

### Localization Scope

**Localized:**
- Navigation labels
- UI text (buttons, headers, hints)
- Business Structuring's guided questions ([Question Model](./features/02_1_question_model.md))
- Presets ([Preset Strategy](./features/02_1_question_model.md#preset-strategy))
- Review field labels (not the answers themselves — see below)
- Empty states
- Validation messages
- System messages (errors, confirmations)

**Not localized in V1** — this is user-authored content, not product copy, and translating it would change its meaning rather than merely present it in another language:
- User-created Project Name
- User-created Project Description (per [ADR-0019](../architecture/decisions/ADR-0019-ai-generated-onboarding-presets-at-project-creation.md); added to [Workspace Data & State](./02_data_and_state.md))
- User answers (Canvas field values, however they were entered — preset-derived or custom)
- Business idea content generally
- Anything in the Canvas that originated from user input, regardless of whether a preset supplied the starting text the user then kept or edited

## Information Architecture

*(Relocated from `context/04_information_architecture.md` — Workspace's information architecture is now canonically owned here. `context/04` retains a pointer rather than the full subtree; see that document's note.)*

```
Workspace (Application)
├── Dashboard / Project List     — every Project the user has created, each showing its current
│                                   lifecycle stage (see Business Idea Lifecycle)
└── Project (one per business idea)
    ├── Business Structuring          — one guided question at a time (Business Idea → Problem →
    │                                    Target Customer → Solution → Value Proposition), then Review
    │                                    (see Business Structuring Feature Specification for the
    │                                    guided-flow model; questions are not separately routed screens)
    ├── MVP Scope
    ├── Feature Planning
    ├── Validation Checklist
    ├── Risk Memo                  — an optional guided-thinking activity reached from within
    │                                 Business Structuring's flow (per ADR-0012), producing three
    │                                 independently-addressable, optional, directly-editable fields
    │                                 (Technical Risks, Business Risks, Open Questions); non-gating
    │                                 (see Risk Memo Feature Specification)
    └── Project Summary            — read-only aggregate view; not a separately stored artifact
                                      (see Data & State)
```

**On "Dashboard" vs. "Project List":** these are the same screen, not two — the Project List already fulfills a Dashboard's role once it displays each Project's lifecycle stage, per the [Workspace Mental Model Review](#workspace-mental-model-review) carried over from the prior specification pass. No separate Dashboard screen is introduced; the existing name is kept rather than renamed without cause.

## Navigation Model (Workspace-internal)

*(Relocated from `context/04_information_architecture.md`.)*

| Level | Model |
|---|---|
| Entry | Landing's call-to-action leads into the Dashboard / Project List — see [Application Responsibilities](../context/05_application_responsibilities.md) for the cross-Application rule; this document does not restate it. |
| Dashboard / Project List → Project | Selecting a Project enters that Project's own navigation scope. |
| Within a Project | Business Structuring, MVP Scope, Feature Planning, and Validation Checklist are siblings — reachable in any order (non-linear), with Project Summary as a read-only aggregate, not a step in the sequence. **Presentation exception:** on a Project whose Canvas is not yet complete, Business Structuring may be shown with greater visual prominence among these siblings — a non-restrictive emphasis layer only, per [ADR-0020](../architecture/decisions/ADR-0020-progressive-navigation-as-non-restrictive-guided-emphasis.md); every sibling remains reachable in any order regardless of this emphasis, and the emphasis itself never extends to ordering the other three siblings against each other. |
| Business Structuring internal order | Within the Business Structuring screen itself, the five questions follow a fixed guided sequence (not free navigation) per [Business Structuring](./features/02_business_structuring.md) and [Core User Journey](../context/03_personas_and_journey.md): Business Idea → Problem → Target Customer → Solution → Value Proposition, ending in Review. This internal sequence is a Feature-level concept, distinct from the Workspace-level non-linear navigation between Features on the row above. |

## Workspace Mental Model Review

*(Relocated from `context/04_information_architecture.md`, unchanged in substance — restated here because it is now Workspace-internal reasoning, not cross-Application IA.)*

Navigation remains organized around **Projects and their artifacts**, not around lifecycle stages as top-level screens — [ADR-0020](../architecture/decisions/ADR-0020-progressive-navigation-as-non-restrictive-guided-emphasis.md)'s onboarding presentation exception (Navigation Model table above) does not change this; it is a time-bounded visual layer over an unchanged set of always-reachable destinations, not a new navigation structure. The [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md)'s stages are a derived status, layered onto the Dashboard/Project List and each Project's own view (showing which artifact is blocking the next transition) — not a parallel navigation structure. See the [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md) document for the state/transition model this status is derived from. Revisit this recommendation only if the Idea Explorer persona is promoted from Future to Secondary/Primary (see [Personas](../context/03_personas_and_journey.md)).

**Thinking flow vs. Feature flow** (per [ADR-0012](../architecture/decisions/ADR-0012-guided-question-flow-as-standard-interaction-pattern.md)): a guided flow's questions may move between conceptual domains whenever it improves the user's thinking, without that transition reading as a navigation event between separate screens — this is a refinement of the Mental Model above, not a change to it. Concept ownership never changes: every answer is still written to its single canonical Feature-owned field; no shared ownership, no duplicated data, and no cross-Feature orchestration state is introduced by this.

**Artifacts as continuously revisable thinking, not one-time output** (per ADR-0012): every Feature's structured view remains fully editable indefinitely — this restates an already-true property of each Feature's existing data model (no field is ever locked or versioned once authored) as permanent, deliberate philosophy. A founder revisiting Canvas after working on Risk Memo, or MVP Scope after Validation Planning, is a manual, user-driven action; it introduces no new cross-Feature read relationship — every existing capability-independence boundary (e.g. [Risk Memo](./features/06_risk_memo.md)'s "No direct relationship" with MVP Planning) is unchanged.

## Feature Inventory (V1)

*(Inferred — the brief and prior specification passes establish the artifact list; this inventory sorts them into build-priority tiers, which is new.)*

### Core Features (required for V1 to ship)

| Feature | Why core | Feature Specification |
|---|---|---|
| Project create / list / select / archive | Without this, no Project exists to structure — the entry point to every other feature | [Project Management](./features/01_project_management.md) |
| Guided Business Structuring (5 questions, one at a time) + Review (incl. Risk Notes) | The Primary Persona's core need; directly implements the Structuring lifecycle stage — a guided flow, not a form, per [ADR-0004](../architecture/decisions/ADR-0004-guided-question-flow-for-business-structuring.md) | [Business Structuring](./features/02_business_structuring.md) · [Question Model](./features/02_1_question_model.md) |
| MVP Scope + Feature Planning | Required to reach the Scoped lifecycle stage; a named V1 deliverable per the product brief | [MVP Planning](./features/03_mvp_planning.md) |
| Validation Checklist | Required to reach Validating/Validated; the product's differentiating "validation as first-class" principle | [Validation Planning](./features/04_validation_planning.md) |
| Project Summary (read view) + Build-Ready confirmation | A named V1 deliverable; the aggregate view a Solo Founder reviews before treating a plan as Build-Ready | [Project Summary](./features/05_project_summary.md) |
| Lifecycle stage display on Dashboard/Project | Required for the Workspace Mental Model Review's recommendation to hold — without it, lifecycle exists only in the domain model with no user-visible surface | Cross-cutting — see [Project Summary](./features/05_project_summary.md) and [Project Management](./features/01_project_management.md) |

**This table only categorizes** (core vs. optional vs. future); each row's Purpose, Responsibilities, User Stories, and Acceptance Criteria are owned by its linked Feature Specification under [`features/`](./features/000_index.md) — this table must not be extended with that level of detail.

### Optional Features (valuable, not release-blocking)

| Feature | Why optional, not core |
|---|---|
| Export/print a completed Project Summary | Named as an open question in [Product Scope](../context/02_product_scope.md#open-questions) — not yet resolved as required; ship V1 without it unless resolved before release |
| Freeform notes attached to a Canvas field | Not named in the brief; a plausible convenience, not required to reach any lifecycle transition |
| [Risk Memo](./features/06_risk_memo.md) | Gates no lifecycle transition (see its own Ownership section); its manual authoring is a self-contained addition, and its AI Assist integration is the first validation consumer of the generalized AI-assisted structured-feature architecture |

### Future Features (explicitly deferred, V2+)

| Feature | Roadmap stage |
|---|---|
| AI-assisted Canvas suggestions | V2 |
| Market/competitor discovery surfaced in Workspace | V3 |
| Go-to-market recommendations against a Validated project | V4 |
| Requirement/SDD/development-plan generation from a Build-Ready project | V5 |
| Cross-project comparison view | Not yet scheduled — tied to the Idea Explorer persona's promotion (see [Personas](../context/03_personas_and_journey.md)) |

## Workspace Context Builder

*(Cross-cutting, forward-looking — this section documents a promotion rule and its trigger condition, not a component that exists in V1's 100%-manual scope. It becomes real the moment a second consumer needs it; see Promotion below.)*

A single, Workspace-owned mechanism that serializes Project data — starting with the Canvas — into **Normalized Workspace Context** (see [AI Ownership Model](../ai/03_ownership_model.md#context-representation-pipeline)'s Context Representation Pipeline for that term's exact place in the request lifecycle) — a shape any consumer can read, so that "how do I read this Project's current state" is implemented once, not independently inside every Feature that needs it.

**Ownership:** Workspace (`sdd/rules/ownership.md`'s Workspace row already owns `sdd/workspace/**` and, by extension, the shape of the data described in [Data & State](./02_data_and_state.md)). This is Workspace's own data being read, not an AI Platform concept — an AI Capability's Context Creation step (Feature-owned, per [AI Ownership Model](../ai/03_ownership_model.md#context-ownership)) is one consumer of this builder, never its owner.

**Promotion rule:** follows the same "promote on second need" discipline `sdd/rules/ownership.md`'s Cross-Boundary Rules already uses for Design System components. It starts, and should remain, Feature-local (as it is today — Business Structuring's own Canvas-serialization logic) until a second consumer genuinely needs the identical shape. At that point, the existing Feature-local logic is promoted into a shared Workspace-level utility; it is not built speculatively ahead of that second real need.

**Consumers, once promoted:** any AI Capability's Context Creation step for any structured Feature (Business Structuring, and any future structured Feature whose own specification exists); also legitimately reusable by non-AI consumers — [Project Summary](./features/05_project_summary.md) already aggregates Canvas + MVP Scope + Features + Validation today, per [Data & State](./02_data_and_state.md)'s "Summary" row, with no AI involved, and would be a natural second (or third) consumer independent of any AI use.

**Explicitly not owned here:** what a Feature does with the data once received — a Feature's own Context Selection (business priority over what's included) remains Feature-owned, unchanged, per [AI Ownership Model](../ai/03_ownership_model.md#context-ownership); nor anything AI-specific (token budgets, provider-specific formatting) — that remains the AI Application Service's own responsibility, referenced there, not restated here.

### Context Eligibility Rules

*(Governs which Workspace artifacts may become part of Normalized Workspace Context, and under what condition, so every future AI Capability follows one rule set rather than inventing its own. Extends this section's existing Promotion rule above; introduces no new architecture.)*

1. **Demand-driven promotion, not automatic inclusion.** An artifact (Canvas, MVP Scope, Validation Checklist, Risk Memo, Project metadata, or any future Feature's own structured data) is added to the Workspace Context Builder only when a real Capability's own Context Selection step needs it — the same "promote on second need" discipline already governing this Builder's own existence above. Existing in the domain model is not sufficient reason to serialize an artifact into context.
2. **Read-only, always.** Inclusion in Normalized Workspace Context never grants write access and never changes data ownership — see [AI Ownership Model](../ai/03_ownership_model.md#context-representation-pipeline)'s Context Ownership table, unaffected by this section.
3. **Context Selection remains Feature-owned.** The Builder makes an artifact available; which subset of it a given Capability's Request actually includes is decided entirely by that Feature's own Context Selection step, never by the Builder itself.
4. **Committed data only.** Only an artifact's saved, current value is eligible — never another Feature's in-progress/unsaved draft state, and never another AI Capability's raw suggestion or rationale text prior to acceptance. Once accepted, a suggestion is ordinary Feature data (per ADR-0009) and becomes eligible under these same rules like any other committed value.
5. **No cross-capability internal state.** An artifact becomes context only as a Feature's committed data — never as another Capability's Request/Response internals, preserving Capability Independence exactly as already established.

## User Flow (Workspace View)

*(Extends, does not duplicate, the canonical [Core User Journey](../context/03_personas_and_journey.md) — that document owns the step sequence itself; this section only maps those steps onto Workspace's own screens.)*

| Journey step (canonical) | Workspace screen |
|---|---|
| Enter the Workspace, create a project | Dashboard / Project List → "new Project" action |
| Structure the idea across the Canvas | Project → Business Structuring (guided flow + Review) |
| Define MVP Scope | Project → MVP Scope |
| Feature Planning | Project → Feature Planning |
| Validation Checklist | Project → Validation Checklist |
| Review the Project Summary | Project → Project Summary |

No new step is introduced beyond what [Core User Journey](../context/03_personas_and_journey.md) already defines; this table exists only to remove any ambiguity about which screen serves which journey step.
