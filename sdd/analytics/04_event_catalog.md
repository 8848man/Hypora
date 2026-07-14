# Analytics Event Catalog

**Refs:** → [00_index](../00_index.md) · [Analytics Platform Architecture](./01_architecture.md) · [Event Model](./02_event_model.md) · [Workspace Feature Specifications](../workspace/features/000_index.md) · [AI Interaction](../ai/04_ai_interaction.md)

The single authoritative list of every valid `eventName`. A Feature or AI Capability specification references an event from this catalog by name; it never defines its own event name inline, per the [Duplication Rule](../rules/spec_authoring_rules.md#duplication-rule--reference-dont-copy). Every event conforms to the [Event Model](./02_event_model.md)'s envelope; only `eventName` and `properties` vary per row below.

## Naming Convention

`eventName` values are `snake_case`, deliberately distinct from this project's `kebab-case` AI Capability id convention (e.g., `risk-memo-assistant`) — event names are the vocabulary this project's event stream shares with whichever Analytics Provider is active, and every provider under consideration (Firestore/Mixpanel/Segment/BigQuery) uses `snake_case` as its own prevailing convention. Verb tense: past tense for a completed state change (`project_created`), `_requested`/`_sent` for an action's initiation — matching the states already named in [AI Interaction](../ai/04_ai_interaction.md#interaction-lifecycle)'s own Interaction Lifecycle (Requesting → Generating → Suggestion Ready).

## Catalog

**Authentication** *(events for a Platform API capability not yet implemented — see [Application Responsibilities](../context/05_application_responsibilities.md#platform-api); catalogued ahead of the capability existing, per this project's "spec leads implementation" allowance, not evidence it exists in V1)*

| `eventName` | Fires when |
|---|---|
| `auth_login` | A user successfully authenticates |
| `auth_logout` | A user ends their authenticated session |

**Project** *(per [Project Management](../workspace/features/01_project_management.md))*

| `eventName` | Fires when |
|---|---|
| `project_created` | A new Project is created |
| `project_opened` | An existing Project is selected from the Dashboard/Project List |
| `project_archived` | A Project is archived — Project Management has no delete concept, so there is no `project_deleted` event |

**Business Structuring** *(per [Business Structuring](../workspace/features/02_business_structuring.md) — named for the Feature, not the Canvas artifact it produces)*

| `eventName` | Fires when |
|---|---|
| `business_structuring_started` | A Project's guided question flow is opened for the first time |
| `canvas_field_updated` | Any one of the five Canvas fields is saved (preset selection or custom text) |
| `business_structuring_review_confirmed` | The user explicitly confirms Review |
| `risk_notes_updated` | Business Structuring's own Risk Notes field (Review step) is edited — distinct from Risk Memo below; the two are separately-owned concepts and must not share an event name |

**Risk Memo** *(per [Risk Memo](../workspace/features/06_risk_memo.md))*

| `eventName` | Fires when |
|---|---|
| `risk_memo_field_updated` | Any one of Risk Memo's three fields (Technical Risks, Business Risks, Open Questions) is saved — `properties.field` names which one |

**MVP Planning** *(per [MVP Planning](../workspace/features/03_mvp_planning.md))*

| `eventName` | Fires when |
|---|---|
| `mvp_scope_updated` | The MVP Scope statement is saved |
| `mvp_scope_marked_complete` | The user explicitly marks MVP Scope complete |
| `feature_created` | A Feature Plan item is added — `properties.origin` (`"manual"` \| `"suggested"`) records how, at the point of creation only; per [MVP Planning](../workspace/features/03_mvp_planning.md#history) this is never persisted as permanent Feature data, only as this transient event's own property |
| `feature_planning_marked_complete` | The user explicitly marks Feature Planning complete |

**Validation Planning** *(per [Validation Planning](../workspace/features/04_validation_planning.md))*

| `eventName` | Fires when |
|---|---|
| `validation_item_created` | A new Validation Checklist item (Assumption) is added |
| `validation_item_resolved` | An item is marked validated or invalidated — `properties.status` records which |

**AI** *(per [AI Interaction](../ai/04_ai_interaction.md) — one shared set of events for every AI Capability's own Interaction Lifecycle, not one set per capability; `properties.capabilityId` names which)*

| `eventName` | Fires when |
|---|---|
| `ai_request_sent` | An invocation enters `Requesting` |
| `ai_suggestion_ready` | An invocation reaches `Suggestion Ready` |
| `ai_request_failed` | An invocation reaches `Failed` — `properties.failureKind` records the taxonomy value, per [AI Feedback & Error Experience](../ai/05_ai_feedback_and_error_experience.md) |
| `ai_suggestion_accepted` | The user Accepts a suggestion |
| `ai_suggestion_rejected` | The user Rejects a suggestion |
| `ai_regenerate_requested` | The user Regenerates |

**Navigation**

| `eventName` | Fires when |
|---|---|
| `screen_view` | A Workspace screen/section is opened |

**Landing** *(per [Application Responsibilities](../context/05_application_responsibilities.md#landing) — Landing has no Feature/Capability vocabulary of its own, so these events carry `pagePath` instead of `feature`/`screen`, per [Event Model](./02_event_model.md))*

| `eventName` | Fires when |
|---|---|
| `landing_page_view` | Any Landing page (Home, Features, Roadmap) is viewed |
| `cta_clicked` | A Landing call-to-action is clicked — `properties.cta` names which one |
| `workspace_started` | A visitor follows a Landing call-to-action into Workspace (the Landing → Workspace conversion point) — distinct from `cta_clicked`: every `workspace_started` is preceded by a `cta_clicked`, but not every `cta_clicked` is a `workspace_started` |
| `template_selected` | *(Anticipated, not yet wired — no template-selection UI exists yet; catalogued ahead of the capability existing, mirroring the Authentication precedent above)* A visitor selects a starter template before entering Workspace |
| `signup_started` | *(Anticipated, not yet wired — V1 has no Authentication, per [Application Responsibilities](../context/05_application_responsibilities.md#platform-api))* A visitor begins a signup flow |

**Deferred, not yet catalogued:** a tab-changed-style event is not defined — Workspace's current Navigation Model ([Workspace Architecture](../workspace/01_architecture.md#navigation-model-workspace-internal)) has no tabbed UI; adding this event ahead of a real tabbed surface would be speculative.

## Extending This Catalog

A new `eventName` is added here, once, the first time a real Feature or Capability needs it — never duplicated into that Feature or Capability's own specification, which references this catalog by name instead. Adding a row here never requires a change to [Event Model](./02_event_model.md) or [Provider Independence](./03_provider_independence.md).
