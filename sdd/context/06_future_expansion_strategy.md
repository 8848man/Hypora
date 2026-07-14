# Future Expansion Strategy

**Refs:** → [00_index](../00_index.md) · [Product Vision](./01_product_vision.md) · [Application Responsibilities](./05_application_responsibilities.md) · [AI Ownership Model](../ai/03_ownership_model.md) · [Workspace Architecture](../workspace/01_architecture.md)

This document owns *how* the architecture stays compatible with V2–V5 without requiring a redesign. It does not restate the roadmap stages themselves — those are canonically owned by [Product Vision](./01_product_vision.md).

## Future-Ready Architecture Principle

*(Explicit constraint, Inferred mechanism)* — the brief states V1 must already be structured so future AI capabilities integrate without major redesign. The mechanism for honoring that, applied consistently across V2–V5:

1. **Data shape stability:** each Canvas field, MVP Scope entry, Feature Planning item, and Validation Checklist item is a discrete, independently-addressable unit in V1's data model — never a single freeform blob per project. This is what lets a future AI capability *augment* one unit (e.g., suggest a rewording of the Value Proposition) without needing to parse or migrate the whole project.
2. **Manual-first, AI-optional fields:** every field a future AI stage would populate or suggest already exists as a manual, user-editable field in V1. AI stages add a *source* (suggested vs. user-authored) to existing fields rather than introducing new field types.
3. **Platform API as the seam:** all future AI, Search, and Integrations capabilities ([Application Responsibilities](./05_application_responsibilities.md)) are additions to Platform API's surface, not changes to how Workspace's screens are structured. Workspace calls Platform API; it does not need to know whether a given response was computed by a human, a LocalStorage read, or a future AI service.
4. **Generalized structured-feature AI Assist is architecture, not a roadmap stage.** Business Structuring's Canvas Assistant (V2) established a reusable pattern — Business Canvas + a Feature's own current structured values, field-level interaction, one AI Capability per Feature — documented in full at [AI Ownership Model](../ai/03_ownership_model.md#context-representation-pipeline) and [Workspace Context Builder](../workspace/01_architecture.md#workspace-context-builder). This pattern applies to *any* structured Feature once that Feature's own specification exists, independent of which V-number introduces it — it is not itself a new roadmap stage, and adopting it for an existing Feature (e.g., MVP Planning, Validation Planning) does not require waiting for a specific future V-stage unless that Feature's own specification says otherwise.
5. **Guided-thinking entry is architecture, not a per-Feature UX choice.** Per [ADR-0012](../architecture/decisions/ADR-0012-guided-question-flow-as-standard-interaction-pattern.md), Business Structuring's guided-question-flow interaction pattern is the standard entry model for any planning Feature specified from this point forward — the structured artifact it produces remains a directly-editable, equally permanent view. This applies independent of which V-number introduces a Feature, the same way principle 4 above already generalizes AI Assist. It does not apply retroactively to MVP Planning or Validation Planning's existing V1 specifications.
6. **Product Analytics is cross-cutting infrastructure, not a V-numbered roadmap stage.** Per [ADR-0013](../architecture/decisions/ADR-0013-analytics-provider-independence.md), Analytics event tracking is introduced ahead of V3 as its own independent Platform API capability, orthogonal to the V1–V5 stage table this document defers to [Product Vision](./01_product_vision.md) — V3 remains canonically Market Intelligence; Analytics is not a redefinition of it. Any Feature or AI Capability at any future stage may emit events under this same architecture without a new decision, exactly as principle 4 already establishes for AI Assist.
7. **Cross-cutting infrastructure capabilities are Platform Services, not per-capability inventions.** Per [ADR-0014](../architecture/decisions/ADR-0014-platform-services-architectural-role.md) and [Platform Services](../architecture/01_platform_services.md), principles 4 and 6 above (AI Assist, Analytics) are two confirmed instances of one named architectural role — a provider-independent capability consumed by more than one Feature. A future infrastructure need (e.g., Search at V3) is checked against that document's Admission Criteria rather than inventing its own independence pattern from scratch.

## Per-Stage Expansion Notes

*(Explicit stage names/content per the brief's roadmap; the "how it plugs in" column is Inferred, applying the principle above.)*

| Stage | Adds | How it plugs into V1's architecture without redesign |
|---|---|---|
| V2 — AI Canvas Assistant | AI assistance inside the Canvas | Adds an AI-suggestion source to existing Canvas fields; no new screen category, no schema break |
| V3 — Market Intelligence | Similar service discovery, competitor research, market trends | New Platform API capability (Search + Integrations); surfaces as new Workspace content alongside the existing Canvas, not a replacement of it |
| V4 — Go-to-Market Planning | Marketing channel recommendations, validation experiment suggestions, early customer strategy | Extends the existing Validation Checklist and MVP Scope concepts with AI-suggested content, reusing the same checklist/scope data shape from V1 |
| V5 — AI Product Builder | Requirement generation, SDD generation, development planning, AI-assisted execution | Consumes the same project data V1 already captures (Business Idea → Feature Planning) as input to generate downstream artifacts; does not require V1's Canvas data to change shape |

## Platform API's Future Backend Transition

*(Inferred — the brief only says V1 "may" use LocalStorage instead of a real backend and that architecture should "already define" future responsibilities; this section makes that concrete.)*

- V1: LocalStorage, no authentication, single-browser persistence (see [Product Scope](./02_product_scope.md) constraints and risks).
- The transition to a real backend is expected to be additive to Platform API's conceptual surface (Authentication, Projects, AI, Search, Integrations — see [Application Responsibilities](./05_application_responsibilities.md)), not a redefinition of it: Workspace's Projects contract stays the same shape, only its implementation moves from LocalStorage to a real service.
- **Open question** (tracked in [Product Scope](./02_product_scope.md#open-questions)): whether the backend transition is scheduled independently of the V2–V5 AI roadmap or bundled with V2.

## What This Strategy Deliberately Does Not Do

- It does not specify V2–V5 screens, APIs, or data shapes in detail — those are out of scope for a V1 product specification and will be authored when each stage is actually planned, per the framework's "current MVP first" principle.
- It does not commit to a specific AI vendor, model, or integration pattern — that is an implementation decision for whichever stage first requires it, and would meet the ADR trigger list at that time.
