# Ownership Map

**Refs:** → [00_index](../00_index.md) · [Spec Authoring Rules](./spec_authoring_rules.md) · [Application Responsibilities](../context/05_application_responsibilities.md)

Who may modify which files, and the coordination rules for changes spanning areas. Created at project inception, per `10_bootstrap_guide.md` Step 1. At this stage (product-specification phase, no implementation yet), areas map to the three Applications plus the shared governance/context areas — not to real codebases, since none exist yet.

## Areas and Owned Files

| Area | Owns | Must Not Modify |
|---|---|---|
| Product / Context | `sdd/context/**` | Any future `sdd/<application>/` implementation-layer document — context describes intent, not implementation |
| Governance | `sdd/rules/**`, `sdd/00_index.md`, `sdd/workflow/**` | `sdd/context/**` content itself (may only add/rename index entries referencing it) |
| Architecture | `sdd/architecture/decisions/**` | Rewriting an `Accepted` ADR's Decision/Consequences (immutable — supersede instead) |
| Landing (future) | Its own `sdd/landing/**`, once created | Workspace's or Platform API's owned files |
| Workspace (future) | Its own `sdd/workspace/**`, once created | Landing's or Platform API's owned files; must not redefine a Platform API contract it consumes — reference it instead |
| Platform API (future) | Its own `sdd/platform-api/**`, once created | Landing's or Workspace's owned files; must not dictate Workspace-side UI/navigation behavior |

**Note on future areas:** per `10_bootstrap_guide.md` Step 3, a dedicated `sdd/<application>/` directory (architecture doc + contract doc as applicable) is created only once that Application has real code — not before. Until then, each Application's responsibilities and V1 scope are recorded once, in `sdd/context/05_application_responsibilities.md`, owned by the Product/Context area.

## Cross-Boundary Rules

| Situation | Rule |
|---|---|
| Workspace needs a capability from Platform API | Workspace's spec references Platform API's contract document by name once one exists; it never restates the contract inline. |
| Landing references a feature or roadmap stage | Landing's copy points at `sdd/context/01_product_vision.md` / `06_future_expansion_strategy.md` for the canonical roadmap wording rather than re-describing it independently. |
| A change touches the Product Architecture itself (adding/removing an Application, or changing how the three relate) | Requires an ADR (see `sdd/architecture/decisions/`) — this meets the "spans more than one owned area" and "expensive to reverse" ADR triggers by definition. |
| A new top-level content area is introduced (e.g., the first real `sdd/workspace/`, or `sdd/infra/` once a deployment target exists) | Three-step registration ritual: (1) row added here, (2) section added to `sdd/00_index.md`, (3) row added to the root `README.md` documentation map — all in the same task. |

## Sign-Off Requirements

- Any document under `sdd/context/` that changes Product Vision, Scope, or the Application Responsibilities split requires no cross-area sign-off yet (no other area exists with implementation to protect), but must be internally consistent with every other `sdd/context/` document in the same task.
- Once a second Application area is created with real code, any change to a cross-cutting contract between two Applications requires sign-off from both before merging, per the framework's `02_directory_structure.md` cross-cutting capability rule.
