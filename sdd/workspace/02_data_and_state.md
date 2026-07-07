# Workspace Data Ownership, State Model, Persistence, and Error States

**Refs:** → [00_index](../00_index.md) · [Workspace Architecture](./01_architecture.md) · [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md) · [Application Responsibilities](../context/05_application_responsibilities.md) · [Product Scope](../context/02_product_scope.md)

*(Inferred — the brief names the artifacts a Project contains but not their conceptual data relationships, UI-level states, or persistence ownership; this document derives them. No database schema, field list, or storage key names are specified — only conceptual ownership, per this task's explicit instruction.)*

## Data Ownership

| Concept | Conceptual shape | Owned by | Relationship |
|---|---|---|---|
| **Project** | The top-level entity — one per business idea | Workspace (authored), Platform API (persisted) | Root of every other concept below |
| **Canvas** | The five structuring fields (Business Idea, Problem, Target Customer, Solution, Value Proposition) | Project | 1:1 with Project |
| **Risk Notes** | An optional, freeform reflection on key hypothesis risks, authored alongside the Canvas | Project | 1:1 (optional) with Project; distinct from Validation's testable assumptions below — see [Feature: Business Structuring](./features/02_business_structuring.md) for the boundary between the two |
| **MVP Scope** | A scope boundary statement authored once per Project | Project | 1:1 with Project |
| **Feature** | A discrete planned item produced during Feature Planning, carrying a priority (e.g., an ordering or Must/Should/Could tier) | Project | Many per Project; each Feature may reference MVP Scope to indicate in/out-of-scope status |
| **Validation** | A Validation Checklist item — an assumption statement, an intended validation method, a success criterion, and a resolution status (validated / invalidated / open) | Project | Many per Project |
| **Summary** | The aggregate read view of Canvas + MVP Scope + Features + Validation | Project (derived) | **Not independently stored** — computed from the other four at render time, never persisted as its own record |
| **Status / Lifecycle** | A Project's current lifecycle stage | [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md) | Derived from the completion state of Canvas/Scope/Features/Validation per that document's guards — this document does not maintain an independent status field; it reads the domain model's derivation rules, never redefines them |

**Ownership boundary:** this table is the canonical source for *what conceptually belongs to what* within Workspace's data. It must never be restated by a future `sdd/platform-api/` document — that document, once created, defines the persisted schema *implementing* this ownership, and should reference this table rather than re-deriving it. The Risk Notes, Feature priority, and Validation attributes above were added during Feature Specification (`sdd/workspace/features/`) — each is referenced, not redefined, by its owning Feature Specification.

## State Model

**This is deliberately distinct from the Business Idea Lifecycle** ([domain/01](../domain/01_business_idea_lifecycle.md)), which owns Project-level entity state (Captured → ... → Archived) exclusively. The states below are UI/section-level interaction states — orthogonal to, and never a redefinition of, the domain lifecycle.

| State | Applies to | Meaning |
|---|---|---|
| **Empty** | Any Canvas field, Risk Notes, MVP Scope statement, or Feature/Validation list | No content has been authored yet |
| **Draft** | Any of the above | Content has been entered in the current session but not yet confirmed as saved |
| **Saved** | Any of the above | Content has been persisted via Platform API's V1 (LocalStorage) implementation |
| **Section-Complete** | Canvas (all 5 fields Saved), MVP Scope, Feature Planning, Validation Checklist | All required content within that section is Saved — this is the signal that feeds the [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md)'s transition guards (e.g., all Canvas fields Section-Complete is what allows Structuring → Scoped); it is a section-level flag, not the Project's own lifecycle stage |

**Archived is intentionally excluded from this table** — archiving only ever applies at the whole-Project level, and is fully owned by the [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md); no section-level "archived" state exists.

## Local Persistence (Conceptual)

*(Explicit that V1 uses LocalStorage in place of a backend; the mapping below is Inferred conceptual ownership, not an implementation.)*

- Platform API's V1 implementation ([Application Responsibilities](../context/05_application_responsibilities.md)) owns all persistence; Workspace never accesses LocalStorage directly in its own right — it only consumes Platform API's conceptual contract.
- Conceptually, persistence is scoped **per Project**: one Project's Canvas, MVP Scope, Features, and Validation Checklist items are stored and retrieved together as a single unit — Summary is never separately persisted (see Data Ownership above).
- A second, separate persisted concept enumerates **all Project IDs** the user has created, so the Dashboard/Project List can render without loading every Project's full content.
- No cross-device or cross-browser persistence exists in V1 — this is a known, already-recorded limitation (see [Product Scope](../context/02_product_scope.md)'s Risks table), not restated here beyond this reference.

## Error States

*(Inferred — the brief does not enumerate these; derived from the artifacts, lifecycle guards, and the already-recorded LocalStorage risk.)*

| Situation | Expected Workspace behavior |
|---|---|
| Dashboard / Project List has zero Projects | Show an empty state prompting Project creation — not an error; this is the expected first-run state (Project not yet Captured) |
| A Canvas / MVP Scope / Feature Planning / Validation Checklist section has no content yet | Show an Empty-state prompt for that section specifically, distinct from a data-loading error |
| User attempts a lifecycle transition whose guard isn't satisfied (e.g., confirming Build-Ready without every Validation Checklist item resolved) | Block the transition; state explicitly which guard failed and which artifact is incomplete, per [Business Idea Lifecycle](../domain/01_business_idea_lifecycle.md)'s transition table |
| Platform API's LocalStorage read fails or returns corrupted/unreadable data for a Project | Show a recoverable "this project's data couldn't be loaded" state — never a silent data loss or an unhandled crash |
| Platform API's LocalStorage write fails (e.g., storage quota exceeded) | Surface the failure to the user immediately, before they assume the edit was Saved — never leave content in an ambiguous Draft/Saved state without telling the user which it is |
| User's LocalStorage is cleared or the Project is opened on a different browser/device | Show the Dashboard's normal empty state (no Projects found) — this is the accepted, already-documented V1 limitation ([Product Scope](../context/02_product_scope.md) Risks), not a new failure mode to solve here |

**Recovery behavior in V1 is limited to what's stated above** — there is no cloud backup, undo-after-clear, or cross-device recovery mechanism; introducing one is future Platform API work (a real backend), not a V1 Workspace responsibility.
