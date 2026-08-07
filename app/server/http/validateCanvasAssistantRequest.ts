// Request validation — the HTTP boundary's job of turning untrusted JSON into the
// Capability's own typed Request Contract (sdd/ai/capabilities/01_canvas_assistant.md).
// This module knows the Contract's shape; it knows nothing about providers.

import { z } from "zod";
import type { CanvasAssistantRequest } from "../ai/capabilities/canvasAssistant/types.js";
import {
  MAX_FIELD_VALUE_LENGTH,
  contextFieldArraySchema,
  languageSchema,
  parseRequest,
} from "./validationHelpers.js";

const schema: z.ZodType<CanvasAssistantRequest> = z.object({
  operation: z.enum(["suggestion", "missingInfo", "followUp", "refinement"]),
  canvasContext: contextFieldArraySchema,
  currentField: z.string().max(MAX_FIELD_VALUE_LENGTH).optional(),
  priorAnswers: contextFieldArraySchema.optional(),
  language: languageSchema,
  projectName: z.string().max(MAX_FIELD_VALUE_LENGTH).optional(),
});

export function validateCanvasAssistantRequest(body: unknown): CanvasAssistantRequest {
  return parseRequest(schema, body);
}
