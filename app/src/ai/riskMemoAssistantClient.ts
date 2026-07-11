// Thin HTTP client for the Risk Memo Assistant Capability. Owns only request
// transport and failure-kind classification — identical shape to
// canvasAssistantClient.ts, confirming the pattern generalizes per capability
// without inventing new transport mechanics (sdd/ai/05_ai_feedback_and_error_experience.md:
// "No stack traces. No raw provider messages.").

import type { RiskMemoAssistantFailureKind, RiskMemoAssistantRequest, RiskMemoAssistantResponse } from "./types.ts";

export type RiskMemoAssistantResult =
  | { ok: true; data: RiskMemoAssistantResponse }
  | { ok: false; failureKind: RiskMemoAssistantFailureKind };

const KIND_MAP: Record<string, RiskMemoAssistantFailureKind> = {
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

export async function requestRiskMemoAssistantSuggestion(
  request: RiskMemoAssistantRequest,
  signal?: AbortSignal,
): Promise<RiskMemoAssistantResult> {
  try {
    const response = await fetch("/api/risk-memo-assistant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });

    if (response.ok) {
      const data = (await response.json()) as RiskMemoAssistantResponse;
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
