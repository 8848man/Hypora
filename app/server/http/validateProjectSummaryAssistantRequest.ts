// Request validation — the HTTP boundary's job of turning untrusted JSON into
// the Capability's own typed Request Contract
// (sdd/ai/capabilities/06_project_summary_synthesis_assistant.md). This
// module knows the Contract's shape; it knows nothing about providers or
// which Invocation Mode (Automatic vs. Manual) produced the call.

import { z } from "zod";
import type { ProjectSummaryAssistantRequest } from "../ai/capabilities/projectSummaryAssistant/types.js";
import { contextFieldArraySchema, languageSchema, parseRequest } from "./validationHelpers.js";

const schema: z.ZodType<ProjectSummaryAssistantRequest> = z.object({
  operation: z.enum(["initial_generation", "sync"]),
  canvasContext: contextFieldArraySchema,
  language: languageSchema,
});

export function validateProjectSummaryAssistantRequest(body: unknown): ProjectSummaryAssistantRequest {
  return parseRequest(schema, body);
}
