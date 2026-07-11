// Request validation — the HTTP boundary's job of turning untrusted JSON into the
// Capability's own typed Request Contract (sdd/ai/capabilities/02_risk_memo_assistant.md).
// This module knows the Contract's shape; it knows nothing about providers.

import type {
  CanvasContextField,
  RiskMemoAssistantRequest,
  RiskMemoSiblingField,
  RiskMemoTargetField,
} from "../ai/capabilities/riskMemoAssistant/types.js";
import { HttpValidationError } from "./HttpValidationError.js";

const VALID_TARGET_FIELDS: readonly RiskMemoTargetField[] = [
  "technical_risks",
  "business_risks",
  "open_questions",
];
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

function isSiblingFieldArray(value: unknown): value is RiskMemoSiblingField[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        VALID_TARGET_FIELDS.includes((item as Record<string, unknown>).field as RiskMemoTargetField) &&
        typeof (item as Record<string, unknown>).value === "string",
    )
  );
}

export function validateRiskMemoAssistantRequest(body: unknown): RiskMemoAssistantRequest {
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
  if (
    typeof candidate.targetField !== "string" ||
    !VALID_TARGET_FIELDS.includes(candidate.targetField as RiskMemoTargetField)
  ) {
    throw new HttpValidationError(`"targetField" must be one of: ${VALID_TARGET_FIELDS.join(", ")}`);
  }
  if (candidate.siblingFields !== undefined && !isSiblingFieldArray(candidate.siblingFields)) {
    throw new HttpValidationError(
      `"siblingFields" must be an array of { field: one of ${VALID_TARGET_FIELDS.join(", ")}, value: string } if provided`,
    );
  }
  if (typeof candidate.language !== "string" || !VALID_LANGUAGES.includes(candidate.language as "ko" | "en")) {
    throw new HttpValidationError(`"language" must be one of: ${VALID_LANGUAGES.join(", ")}`);
  }

  return {
    operation: "suggestion",
    canvasContext: candidate.canvasContext as CanvasContextField[],
    targetField: candidate.targetField as RiskMemoTargetField,
    siblingFields: candidate.siblingFields as RiskMemoSiblingField[] | undefined,
    language: candidate.language as "ko" | "en",
  };
}
