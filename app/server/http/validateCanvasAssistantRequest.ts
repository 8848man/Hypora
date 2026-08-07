// Request validation — the HTTP boundary's job of turning untrusted JSON into the
// Capability's own typed Request Contract (sdd/ai/capabilities/01_canvas_assistant.md).
// This module knows the Contract's shape; it knows nothing about providers.

import type {
  CanvasAssistantOperation,
  CanvasAssistantRequest,
  CanvasContextField,
} from "../ai/capabilities/canvasAssistant/types.js";
import { HttpValidationError } from "./HttpValidationError.js";
import { VALID_LANGUAGES, isContextFieldArray } from "./validationHelpers.js";

const VALID_OPERATIONS: readonly CanvasAssistantOperation[] = [
  "suggestion",
  "missingInfo",
  "followUp",
  "refinement",
];

export function validateCanvasAssistantRequest(body: unknown): CanvasAssistantRequest {
  if (typeof body !== "object" || body === null) {
    throw new HttpValidationError("Request body must be a JSON object");
  }
  const candidate = body as Record<string, unknown>;

  if (
    typeof candidate.operation !== "string" ||
    !VALID_OPERATIONS.includes(candidate.operation as CanvasAssistantOperation)
  ) {
    throw new HttpValidationError(`"operation" must be one of: ${VALID_OPERATIONS.join(", ")}`);
  }
  if (!isContextFieldArray(candidate.canvasContext)) {
    throw new HttpValidationError('"canvasContext" must be an array of { field: string, value: string }');
  }
  if (candidate.currentField !== undefined && typeof candidate.currentField !== "string") {
    throw new HttpValidationError('"currentField" must be a string if provided');
  }
  if (candidate.priorAnswers !== undefined && !isContextFieldArray(candidate.priorAnswers)) {
    throw new HttpValidationError(
      '"priorAnswers" must be an array of { field: string, value: string } if provided',
    );
  }
  if (typeof candidate.language !== "string" || !VALID_LANGUAGES.includes(candidate.language as "ko" | "en")) {
    throw new HttpValidationError(`"language" must be one of: ${VALID_LANGUAGES.join(", ")}`);
  }
  if (candidate.projectName !== undefined && typeof candidate.projectName !== "string") {
    throw new HttpValidationError('"projectName" must be a string if provided');
  }

  return {
    operation: candidate.operation as CanvasAssistantOperation,
    canvasContext: candidate.canvasContext as CanvasContextField[],
    currentField: candidate.currentField as string | undefined,
    priorAnswers: candidate.priorAnswers as CanvasContextField[] | undefined,
    language: candidate.language as "ko" | "en",
    projectName: candidate.projectName as string | undefined,
  };
}
