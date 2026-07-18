// Request validation — the HTTP boundary's job of turning untrusted JSON into
// the Capability's own typed Request Contract
// (sdd/ai/capabilities/06_project_summary_synthesis_assistant.md). This
// module knows the Contract's shape; it knows nothing about providers or
// which Invocation Mode (Automatic vs. Manual) produced the call.

import type {
  CanvasContextField,
  ProjectSummaryAssistantOperation,
  ProjectSummaryAssistantRequest,
} from "../ai/capabilities/projectSummaryAssistant/types.js";
import { HttpValidationError } from "./HttpValidationError.js";

const VALID_LANGUAGES = ["ko", "en"] as const;
const VALID_OPERATIONS = ["initial_generation", "sync"] as const;

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

export function validateProjectSummaryAssistantRequest(body: unknown): ProjectSummaryAssistantRequest {
  if (typeof body !== "object" || body === null) {
    throw new HttpValidationError("Request body must be a JSON object");
  }
  const candidate = body as Record<string, unknown>;

  if (!VALID_OPERATIONS.includes(candidate.operation as ProjectSummaryAssistantOperation)) {
    throw new HttpValidationError(`"operation" must be one of: ${VALID_OPERATIONS.join(", ")}`);
  }
  if (!isContextFieldArray(candidate.canvasContext)) {
    throw new HttpValidationError('"canvasContext" must be an array of { field: string, value: string }');
  }
  if (!isContextFieldArray(candidate.mvpContext)) {
    throw new HttpValidationError('"mvpContext" must be an array of { field: string, value: string }');
  }
  if (!isContextFieldArray(candidate.validationContext)) {
    throw new HttpValidationError('"validationContext" must be an array of { field: string, value: string }');
  }
  if (typeof candidate.language !== "string" || !VALID_LANGUAGES.includes(candidate.language as "ko" | "en")) {
    throw new HttpValidationError(`"language" must be one of: ${VALID_LANGUAGES.join(", ")}`);
  }

  return {
    operation: candidate.operation as ProjectSummaryAssistantOperation,
    canvasContext: candidate.canvasContext as CanvasContextField[],
    mvpContext: candidate.mvpContext as CanvasContextField[],
    validationContext: candidate.validationContext as CanvasContextField[],
    language: candidate.language as "ko" | "en",
  };
}
