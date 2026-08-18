// Request validation — the HTTP boundary's job of turning untrusted JSON into
// the Capability's own typed Request Contract
// (sdd/ai/capabilities/04_validation_planning_assistant.md). This module
// knows the Contract's shape; it knows nothing about providers.

import { z } from "zod";
import type { ValidationPlanningAssistantRequest } from "../ai/capabilities/validationPlanningAssistant/types.js";
import { contextFieldArraySchema, languageSchema, parseRequest } from "./validationHelpers.js";

const schema: z.ZodType<ValidationPlanningAssistantRequest> = z.object({
  operation: z.literal("suggestion"),
  canvasContext: contextFieldArraySchema,
  riskContext: contextFieldArraySchema,
  mvpContext: contextFieldArraySchema,
  language: languageSchema,
});

export function validateValidationPlanningAssistantRequest(body: unknown): ValidationPlanningAssistantRequest {
  return parseRequest(schema, body);
}
