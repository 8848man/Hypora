// Thin HTTP client for the Feature Suggestion Assistant Capability. Owns only
// request transport and failure-kind classification — identical shape to
// every other capability's client.

import type {
  FeatureSuggestionAssistantFailureKind,
  FeatureSuggestionAssistantRequest,
  FeatureSuggestionAssistantResponse,
} from "./types.ts";

export type FeatureSuggestionAssistantResult =
  | { ok: true; data: FeatureSuggestionAssistantResponse }
  | { ok: false; failureKind: FeatureSuggestionAssistantFailureKind };

const KIND_MAP: Record<string, FeatureSuggestionAssistantFailureKind> = {
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

export async function requestFeatureSuggestionAssistantSuggestion(
  request: FeatureSuggestionAssistantRequest,
  signal?: AbortSignal,
): Promise<FeatureSuggestionAssistantResult> {
  try {
    const response = await fetch("/api/feature-suggestion-assistant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });

    if (response.ok) {
      const data = (await response.json()) as FeatureSuggestionAssistantResponse;
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
