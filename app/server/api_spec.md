# Hypora Platform API — HTTP Reference

Generated from current server code (`app/api/*.ts`, `app/server/http/*`, `app/server/ai/**`). This
is a technical reference for the actual HTTP surface, not a specification — the canonical Request/
Response Contract for each AI Capability is owned by its `sdd/ai/capabilities/*.md` document; this
file describes what the code currently does, evidence rather than intent.

Each endpoint is a Vercel Node Function (`app/api/<name>.ts`). Locally, `server/localDevApiServer.ts`
(untracked, dev-only) serves the same routes on `http://localhost:5191` via the same
filename-to-route convention, proxied from `/api` by `vite.dev.proxy.config.ts`.

## Conventions common to every endpoint

- **Transport**: JSON request body in, JSON response body out. `content-type: application/json`.
- **Method**: `GET /api/health`; every other endpoint is `POST` only — any other method returns
  `405 { "error": "Method Not Allowed", "kind": "method_not_allowed" }`.
- **Body parsing**: missing body is treated as `{}`; a body that fails `JSON.parse` returns `400`
  with `kind: "validation"`.
- **Validation errors**: `400 { "error": "<message>", "kind": "validation" }`. Each capability's
  validator (`server/http/validate<Name>Request.ts`) owns its own field-by-field checks against
  untrusted JSON before the request reaches the Capability.
- **Provider/runtime errors** (unified taxonomy, ADR-0007 — `server/http/errors.ts`):

  | `kind` | HTTP status |
  |---|---|
  | `validation` | 400 |
  | `timeout` | 504 |
  | `rate_limited` | 429 |
  | `unavailable` | 503 |
  | `invalid_response` | 502 |
  | `safety_refusal` | 422 |
  | `network_failure` | 503 |
  | `unknown` (or unclassified failure) | 500 |

  A response body's `error` field is safe to display; unclassified failures never leak internal
  details — they always return the literal message `"Internal Server Error"`.
- **Shared field shapes**:
  - `CanvasContextField = { field: string; value: string }` (`server/ai/shared/types.ts`) — the
    generic "normalized workspace context" element used across most capabilities' `canvasContext`
    (and similar) arrays.
  - `language: "ko" | "en"` — required on every capability request except Onboarding Preset
    Assistant's (which also requires it).

---

## `GET /api/health`

Platform health probe — round-trips a trivial request through
`AiApplicationService -> Provider Interface -> Provider` to prove the pipeline is actually wired,
not merely that the process is running.

**Response** `200` (`status: "ok"`) or `503` (`status: "error"`):

```ts
{
  status: "ok" | "error";
  providerId: string;
  detail?: string; // present only when status is "error"
}
```

---

## `POST /api/canvas-assistant`

capabilityId `canvas-assistant`, contractVersion `1.1` (Stable).

**Request**

```ts
{
  operation: "suggestion" | "missingInfo" | "followUp" | "refinement";
  canvasContext: CanvasContextField[];
  currentField?: string;
  priorAnswers?: CanvasContextField[];
  language: "ko" | "en";
  projectName?: string; // 1.1 addition — seed for AI-first draft generation
}
```

**Response**

```ts
{
  suggestionText: string;
  rationale?: string; // populated for "refinement"; other operations omit it
}
```

---

## `POST /api/feature-suggestion-assistant`

capabilityId `feature-suggestion-assistant`, contractVersion `1.0`.

**Request**

```ts
{
  operation: "suggestion"; // literal, must equal exactly
  canvasContext: CanvasContextField[];
  mvpScopeContext: CanvasContextField[];
  existingFeatures: Array<{
    name: string;
    priority: "must" | "should" | "could";
    inScope: boolean;
  }>;
  riskContext: CanvasContextField[];
  language: "ko" | "en";
}
```

**Response** — a bare array (not wrapped in an object), unlike every other capability here. `[]` is
a valid response ("nothing to suggest").

```ts
Array<{
  name: string;
  rationale: string;
  primaryUserValue: string;
  priority: "must" | "should" | "could";
}>
```

---

## `POST /api/mvp-planning-assistant`

capabilityId `mvp-planning-assistant`, contractVersion `1.0`.

**Request**

```ts
{
  operation: "suggestion"; // literal
  canvasContext: CanvasContextField[];
  riskContext: CanvasContextField[];
  language: "ko" | "en";
}
```

**Response**

```ts
{
  suggestionText: string;
  rationale?: string;
}
```

---

## `POST /api/onboarding-preset-assistant`

capabilityId `onboarding-preset-assistant`, contractVersion `2.0`. Invoked automatically once,
immediately after project creation — before any canvas context exists, so this request carries no
`canvasContext`/`operation` fields at all.

**Request**

```ts
{
  projectName: string;         // required, non-empty after trim
  projectDescription?: string; // optional; absent and "" are treated identically
  language: "ko" | "en";
}
```

**Response** — always a full 5-question preset batch (the discriminated "sufficiency" union from
1.0 was removed entirely in 2.0, per ADR-0021):

```ts
{
  presets: Array<{
    questionId:
      | "business_idea"
      | "problem_definition"
      | "target_customer"
      | "solution_definition"
      | "value_proposition";
    options: string[];
  }>;
}
```

---

## `POST /api/project-summary-assistant`

capabilityId `project-summary-assistant`, contractVersion `2.0` (per ADR-0018 — 1.0's additional
`mvpContext`/`validationContext` fields were removed, not deprecated).

**Request**

```ts
{
  operation: "initial_generation" | "sync";
  canvasContext: CanvasContextField[];
  language: "ko" | "en";
}
```

Both operations share this one request/response shape; they differ only in Invocation Mode
(Automatic vs. Manual) and what the calling Feature does with the response, not in payload shape.

**Response**

```ts
{
  summaryText: string;
  rationale?: string;
}
```

---

## `POST /api/risk-memo-assistant`

capabilityId `risk-memo-assistant`, contractVersion `1.0` (Draft — the only non-Stable contract
among these endpoints).

**Request**

```ts
{
  operation: "suggestion"; // literal
  canvasContext: CanvasContextField[];
  targetField: "technical_risks" | "business_risks" | "open_questions";
  siblingFields?: Array<{
    field: "technical_risks" | "business_risks" | "open_questions"; // same enum as targetField
    value: string;
  }>;
  language: "ko" | "en";
}
```

**Response**

```ts
{
  suggestionText: string;
  rationale?: string;
}
```

---

## `POST /api/validation-planning-assistant`

capabilityId `validation-planning-assistant`, contractVersion `1.0`. The most context-heavy
request among the standard-shape capabilities — all three context arrays are mandatory.

**Request**

```ts
{
  operation: "suggestion"; // literal
  canvasContext: CanvasContextField[];
  riskContext: CanvasContextField[];
  mvpContext: CanvasContextField[];
  language: "ko" | "en";
}
```

**Response**

```ts
{
  suggestionText: string;
  rationale?: string;
}
```
