// Thin HTTP client for the Project Summary Synthesis Assistant Capability.
// Owns only request transport and failure-kind classification — never
// business logic, never a Provider concept, and never a raw provider/HTTP-status
// detail exposed upward (sdd/ai/05_ai_feedback_and_error_experience.md).
// Identical shape to canvasAssistantClient.ts.

import type {
  ProjectSummaryAssistantFailureKind,
  ProjectSummaryAssistantRequest,
  ProjectSummaryAssistantResponse,
} from "./types.ts";

export type ProjectSummaryAssistantResult =
  | { ok: true; data: ProjectSummaryAssistantResponse }
  | { ok: false; failureKind: ProjectSummaryAssistantFailureKind };

const KIND_MAP: Record<string, ProjectSummaryAssistantFailureKind> = {
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

export async function requestProjectSummaryAssistant(
  request: ProjectSummaryAssistantRequest,
  signal?: AbortSignal,
): Promise<ProjectSummaryAssistantResult> {
  try {
    const response = await fetch("/api/project-summary-assistant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
      signal,
    });

    if (response.ok) {
      const data = (await response.json()) as ProjectSummaryAssistantResponse;
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
