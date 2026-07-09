// Thin HTTP client for the Canvas Assistant Capability. Owns only request
// transport and failure-kind classification — never business logic, never a
// Provider concept, and never a raw provider/HTTP-status detail exposed upward
// (sdd/ai/05_ai_feedback_and_error_experience.md: "No stack traces. No raw
// provider messages.").

import type { CanvasAssistantFailureKind, CanvasAssistantRequest, CanvasAssistantResponse } from "./types.ts";

export type CanvasAssistantResult =
  | { ok: true; data: CanvasAssistantResponse }
  | { ok: false; failureKind: CanvasAssistantFailureKind };

const KIND_MAP: Record<string, CanvasAssistantFailureKind> = {
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

export async function requestCanvasAssistantSuggestion(
  request: CanvasAssistantRequest,
  signal?: AbortSignal,
): Promise<CanvasAssistantResult> {
  try {
    const response = await fetch("/api/canvas-assistant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });

    if (response.ok) {
      const data = (await response.json()) as CanvasAssistantResponse;
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
    // An intentional cancellation (question switched, component unmounted) is not
    // a failure — let the caller's own abort handling treat it as a no-op.
    if (err instanceof DOMException && err.name === "AbortError") {
      throw err;
    }
    // Anything else (offline, DNS, CORS) is presented the same as "provider
    // unavailable" — the user experience of "AI assistance isn't available right
    // now" is identical regardless of the underlying transport reason.
    return { ok: false, failureKind: "unavailable" };
  }
}
