// Thin HTTP client for the Validation Planning Assistant Capability. Owns only
// request transport and failure-kind classification — identical shape to
// riskMemoAssistantClient.ts / mvpPlanningAssistantClient.ts.

import type {
  ValidationPlanningAssistantFailureKind,
  ValidationPlanningAssistantRequest,
  ValidationPlanningAssistantResponse,
} from "./types.ts";

export type ValidationPlanningAssistantResult =
  | { ok: true; data: ValidationPlanningAssistantResponse }
  | { ok: false; failureKind: ValidationPlanningAssistantFailureKind };

const KIND_MAP: Record<string, ValidationPlanningAssistantFailureKind> = {
  timeout: "timeout",
  rate_limited: "rate_limited",
  unavailable: "unavailable",
  network_failure: "unavailable",
  safety_refusal: "safety_refusal",
  validation: "generic",
  invalid_response: "generic",
  unknown: "generic",
  method_not_allowed: "generic",
};

export async function requestValidationPlanningAssistantSuggestion(
  request: ValidationPlanningAssistantRequest,
  signal?: AbortSignal,
): Promise<ValidationPlanningAssistantResult> {
  try {
    const response = await fetch("/api/validation-planning-assistant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });

    if (response.ok) {
      const data = (await response.json()) as ValidationPlanningAssistantResponse;
      return { ok: true, data };
    }

    let kind = "unknown";
    try {
      const body = (await response.json()) as { kind?: string };
      kind = body.kind ?? "unknown";
    } catch {
      // Response body wasn't JSON — fall through to the generic bucket.
    }
    return { ok: false, failureKind: KIND_MAP[kind] ?? "generic" };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    return { ok: false, failureKind: "unavailable" };
  }
}
