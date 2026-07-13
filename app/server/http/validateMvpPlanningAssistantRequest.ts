// Request validation — the HTTP boundary's job of turning untrusted JSON into
// the Capability's own typed Request Contract
// (sdd/ai/capabilities/03_mvp_planning_assistant.md). This module knows the
// Contract's shape; it knows nothing about providers.

import type { CanvasContextField, MvpPlanningAssistantRequest } from "../ai/capabilities/mvpPlanningAssistant/types.js";
import { HttpValidationError } from "./HttpValidationError.js";

const VALID_LANGUAGES = ["ko", "en"] as const;

function isContextFieldArray(value: unknown): value is CanvasContextField[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).field === "string" &&
        typeof (item as Record<string, unknown>).value === "string",
    )
  );
}

export function validateMvpPlanningAssistantRequest(body: unknown): MvpPlanningAssistantRequest {
  if (typeof body !== "object" || body === null) {
    throw new HttpValidationError("Request body must be a JSON object");
  }
  const candidate = body as Record<string, unknown>;

  if (candidate.operation !== "suggestion") {
    throw new HttpValidationError('"operation" must be "suggestion"');
  }
  if (!isContextFieldArray(candidate.canvasContext)) {
    throw new HttpValidationError('"canvasContext" must be an array of { field: string, value: string }');
  }
  if (!isContextFieldArray(candidate.riskContext)) {
    throw new HttpValidationError('"riskContext" must be an array of { field: string, value: string }');
  }
  if (typeof candidate.language !== "string" || !VALID_LANGUAGES.includes(candidate.language as "ko" | "en")) {
    throw new HttpValidationError(`"language" must be one of: ${VALID_LANGUAGES.join(", ")}`);
  }

  return {
    operation: "suggestion",
    canvasContext: candidate.canvasContext as CanvasContextField[],
    riskContext: candidate.riskContext as CanvasContextField[],
    language: candidate.language as "ko" | "en",
  };
}
