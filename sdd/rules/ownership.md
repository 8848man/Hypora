# Ownership Map

**Refs:** → [00_index](../00_index.md) · [Spec Authoring Rules](./spec_authoring_rules.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md)

Who may modify which files, and the coordination rules for changes spanning areas. Created at project inception, per `10_bootstrap_guide.md` Step 1. At this stage (product-specification phase, no implementation yet), areas map to the three Applications plus the shared governance/context areas — not to real codebases, since none exist yet.

## Areas and Owned Files

| Area | Owns | Must Not Modify |
|---|---|---|
| Product / Context | `sdd/context/**` | Any future `sdd/<application>/` implementation-layer document — context describes intent, not implementation; `sdd/domain/**` (context may reference lifecycle stage, never redefine a transition) |
| Domain | `sdd/domain/**` | Any `sdd/context/**` document's own concerns (vision, scope, IA screen structure) — domain owns entity state/transitions only |
| Governance | `sdd/rules/**`, `sdd/00_index.md`, `sdd/workflow/**` | `sdd/context/**` or `sdd/domain/**` content itself (may only add/rename index entries referencing it) |
| Architecture | `sdd/architecture/**` | Rewriting an `Accepted` ADR's Decision/Consequences (immutable — supersede instead); any subsystem's own specification (`sdd/ai/**`, `sdd/analytics/**`, or a future `sdd/search/**`) — `sdd/architecture/01_platform_services.md` describes a shared role, it does not own or supersede any instance's own architecture |
| Workspace | `sdd/workspace/**` | Landing's or Platform API's owned files; must not redefine a Business Idea Lifecycle transition (reference `sdd/domain/**` instead); must not redefine a Platform API contract it consumes once one exists |
| Analytics | `sdd/analytics/**` | Any Feature's own Purpose/Responsibilities/Acceptance Criteria, or the AI Platform's own capability contracts — Analytics owns the Event Model, Provider Independence, Event Catalog, and Migration Strategy only, per [ADR-0013](../architecture/decisions/ADR-0013-analytics-provider-independence.md) |
| Infra | `sdd/infra/**` | Any Application's own responsibilities/IA — infra owns deployment target and pipeline, not what each Application does |
| Analysis | `sdd/analysis/**` | Any fact owned elsewhere — an analysis document synthesizes and cites; it must not become a second definition of a fact already owned by Context, Domain, Workspace, or Infra |
| Frontend | `sdd/frontend/**` | Any Feature's own Purpose/Responsibilities/Acceptance Criteria — frontend owns codebase structure (routing, boundaries, state), not what a Feature does |
| Design System | `sdd/design-system/**` | Any Feature-specific business logic or copy — the Design System owns presentational primitives only |
| Landing (future) | Its own `sdd/landing/**`, once created | Workspace's or Platform API's owned files |
| Platform API (future) | Its own `sdd/platform-api/**`, once created | Landing's or Workspace's owned files; must not dictate Workspace-side UI/navigation behavior |

**Note on Landing and Platform API:** per `10_bootstrap_guide.md` Step 3, a dedicated `sdd/<application>/` directory is created only once that Application has real code — not before. Landing's and Platform API's responsibilities and V1 scope remain recorded in `sdd/context/05_application_responsibilities.md`, owned by the Product/Context area, until each is promoted. **Workspace was promoted early** (before real code exists) under the framework's "spec leads implementation" allowance (`03_document_lifecycle.md`, Type 3) — this is a deliberate, documented exception, not a departure from the rule for Landing/Platform API.

## Cross-Boundary Rules

| Situation | Rule |
|---|---|
| Workspace needs a capability from Platform API | Workspace's spec references Platform API's contract document by name once one exists; it never restates the contract inline. |
| Landing references a feature or roadmap stage | Landing's copy points at `sdd/context/01_product_vision.md` / `06_future_expansion_strategy.md` for the canonical roadmap wording rather than re-describing it independently. |
| A change touches the Product Architecture itself (adding/removing an Application, or changing how the three relate) | Requires an ADR (see `sdd/architecture/decisions/`) — this meets the "spans more than one owned area" and "expensive to reverse" ADR triggers by definition. |
| A new top-level content area is introduced (e.g., the first real `sdd/workspace/`, or `sdd/infra/` once a deployment target exists) | Three-step registration ritual: (1) row added here, (2) section added to `sdd/00_index.md`, (3) row added to the root `README.md` documentation map — all in the same task. |
| A layer document (e.g., `sdd/workspace/`) needs to describe project state | Reference `sdd/domain/01_business_idea_lifecycle.md` by name; never re-specify a state, transition, or guard locally. |
| A document needs to describe the V1 release boundary, deployment target, or git/versioning process | Reference `sdd/analysis/01_v1_release_specification.md`, `sdd/infra/01_deployment.md`, or `sdd/workflow/02_git_and_release_strategy.md` respectively by name; never restate them. |
| A Feature needs a new UI pattern not yet in the Design System | Add it to the Feature-owned tier first (`sdd/frontend/01_architecture.md`'s Component Ownership); promote it to `sdd/design-system/01_design_system.md` only once a second Feature or Landing needs the identical pattern. |
| A Feature or AI Capability wants to emit an analytics event | Reference an existing `eventName` from `sdd/analytics/04_event_catalog.md`, or add a new row there first if it doesn't yet exist — never invent an event name inline in a Feature or Capability specification. |

## Sign-Off Requirements

- Any document under `sdd/context/` that changes Product Vision, Scope, or the Application Responsibilities split requires no cross-area sign-off yet (no other area exists with implementation to protect), but must be internally consistent with every other `sdd/context/` document in the same task.
- Once a second Application area is created with real code, any change to a cross-cutting contract between two Applications requires sign-off from both before merging, per the framework's `02_directory_structure.md` cross-cutting capability rule.
