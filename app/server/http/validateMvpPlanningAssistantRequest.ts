// Request validation — the HTTP boundary's job of turning untrusted JSON into
// the Capability's own typed Request Contract
// (sdd/ai/capabilities/03_mvp_planning_assistant.md). This module knows the
// Contract's shape; it knows nothing about providers.

import { z } from "zod";
import type { MvpPlanningAssistantRequest } from "../ai/capabilities/mvpPlanningAssistant/types.js";
import { contextFieldArraySchema, languageSchema, parseRequest } from "./validationHelpers.js";

const schema: z.ZodType<MvpPlanningAssistantRequest> = z.object({
  operation: z.literal("suggestion"),
  canvasContext: contextFieldArraySchema,
  riskContext: contextFieldArraySchema,
  language: languageSchema,
});

export function validateMvpPlanningAssistantRequest(body: unknown): MvpPlanningAssistantRequest {
  return parseRequest(schema, body);
}
