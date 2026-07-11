// Request validation — the HTTP boundary's job of turning untrusted JSON into
// the Capability's own typed Request Contract
// (sdd/ai/capabilities/05_feature_suggestion_assistant.md). This module knows
// the Contract's shape; it knows nothing about providers.

import type {
  CanvasContextField,
  ExistingFeatureContext,
  FeaturePriority,
  FeatureSuggestionAssistantRequest,
} from "../ai/capabilities/featureSuggestionAssistant/types.js";
import { HttpValidationError } from "./HttpValidationError.js";

const VALID_PRIORITIES: readonly FeaturePriority[] = ["must", "should", "could"];
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

function isExistingFeatureArray(value: unknown): value is ExistingFeatureContext[] {
  return (
    Array.isArray(value) &&
    value.every((item) => {
      if (typeof item !== "object" || item === null) return false;
      const candidate = item as Record<string, unknown>;
      return (
        typeof candidate.name === "string" &&
        typeof candidate.priority === "string" &&
        VALID_PRIORITIES.includes(candidate.priority as FeaturePriority) &&
        typeof candidate.inScope === "boolean"
      );
    })
  );
}

export function validateFeatureSuggestionAssistantRequest(body: unknown): FeatureSuggestionAssistantRequest {
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
  if (!isContextFieldArray(candidate.mvpScopeContext)) {
    throw new HttpValidationError('"mvpScopeContext" must be an array of { field: string, value: string }');
  }
  if (!isExistingFeatureArray(candidate.existingFeatures)) {
    throw new HttpValidationError(
      `"existingFeatures" must be an array of { name: string, priority: one of ${VALID_PRIORITIES.join(", ")}, inScope: boolean }`,
    );
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
    mvpScopeContext: candidate.mvpScopeContext as CanvasContextField[],
    existingFeatures: candidate.existingFeatures as ExistingFeatureContext[],
    riskContext: candidate.riskContext as CanvasContextField[],
    language: candidate.language as "ko" | "en",
  };
}
