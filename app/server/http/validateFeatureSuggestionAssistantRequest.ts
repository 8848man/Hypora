// Request validation — the HTTP boundary's job of turning untrusted JSON into
// the Capability's own typed Request Contract
// (sdd/ai/capabilities/05_feature_suggestion_assistant.md). This module knows
// the Contract's shape; it knows nothing about providers.

import { z } from "zod";
import type { FeatureSuggestionAssistantRequest } from "../ai/capabilities/featureSuggestionAssistant/types.js";
import {
  MAX_CONTEXT_ARRAY_LENGTH,
  MAX_FIELD_VALUE_LENGTH,
  contextFieldArraySchema,
  languageSchema,
  parseRequest,
} from "./validationHelpers.js";

const existingFeatureSchema = z.object({
  name: z.string().max(MAX_FIELD_VALUE_LENGTH),
  priority: z.enum(["must", "should", "could"]),
  inScope: z.boolean(),
});

const schema: z.ZodType<FeatureSuggestionAssistantRequest> = z.object({
  operation: z.literal("suggestion"),
  canvasContext: contextFieldArraySchema,
  mvpScopeContext: contextFieldArraySchema,
  existingFeatures: z.array(existingFeatureSchema).max(MAX_CONTEXT_ARRAY_LENGTH),
  riskContext: contextFieldArraySchema,
  language: languageSchema,
});

export function validateFeatureSuggestionAssistantRequest(body: unknown): FeatureSuggestionAssistantRequest {
  return parseRequest(schema, body);
}
