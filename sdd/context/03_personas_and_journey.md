# User Personas and Core User Journey

**Refs:** → [00_index](../00_index.md) · [Product Scope](./02_product_scope.md) · [Information Architecture](./04_information_architecture.md)

*(Inferred — the brief does not name personas or walk through a journey explicitly; both are derived from the stated purpose ("transform business ideas into structured, validated MVP plans") and the V1 feature list, since a workspace product cannot be specified without them.)*

## User Personas

| Persona | Description | What they need from Hypora V1 |
|---|---|---|
| **Solo Founder** | An individual with a business idea, no co-founder, limited structured-planning experience | A guided structure that turns a vague idea into something concrete, without needing a business background |
| **Early-Stage Team Lead** | One person on a small team responsible for defining what to build first | A shared reference document (the Canvas) the team can align around before writing a single ticket |
| **Idea Explorer** | Someone testing multiple business ideas before committing to one | The ability to hold several independently-structured projects and compare their scope and validation status |

All three personas are individual users in V1 — none require multi-user collaboration features, consistent with the V1 non-goals in [Product Scope](./02_product_scope.md).

## Core User Journey (V1)

```
1. Arrive at Landing
        → understand what Hypora does, see the value proposition and roadmap
        ↓
2. Enter the Workspace, create a project
        ↓
3. Structure the idea across the Canvas
        → Business Idea → Problem → Target Customer → Solution → Value Proposition
        ↓
4. Define MVP Scope
        → decide what's in vs. out for a first version
        ↓
5. Feature Planning
        → break the MVP Scope into concrete features
        ↓
6. Validation Checklist
        → mark assumptions as validated or still-open, against the plan just built
        ↓
7. Review the Project Summary
        → see the whole structured plan in one place
```

Steps 3–6 are not strictly linear in the UI (a user may revisit Problem after starting Feature Planning), but they represent the intended completion order for a first pass through a new project — see [Information Architecture](./04_information_architecture.md) for how this maps to actual screens and navigation.

**This document owns persona definitions and the journey sequence.** [Information Architecture](./04_information_architecture.md) references this journey when defining navigation; it does not redefine the journey steps independently.
