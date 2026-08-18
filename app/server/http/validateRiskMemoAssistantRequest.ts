// Request validation — the HTTP boundary's job of turning untrusted JSON into the
// Capability's own typed Request Contract (sdd/ai/capabilities/02_risk_memo_assistant.md).
// This module knows the Contract's shape; it knows nothing about providers.

import { z } from "zod";
import type { RiskMemoAssistantRequest } from "../ai/capabilities/riskMemoAssistant/types.js";
import {
  MAX_CONTEXT_ARRAY_LENGTH,
  MAX_FIELD_VALUE_LENGTH,
  contextFieldArraySchema,
  languageSchema,
  parseRequest,
} from "./validationHelpers.js";

const VALID_TARGET_FIELDS = ["technical_risks", "business_risks", "open_questions"] as const;

const siblingFieldSchema = z.object({
  field: z.enum(VALID_TARGET_FIELDS),
  value: z.string().max(MAX_FIELD_VALUE_LENGTH),
});

const schema: z.ZodType<RiskMemoAssistantRequest> = z.object({
  operation: z.literal("suggestion"),
  canvasContext: contextFieldArraySchema,
  targetField: z.enum(VALID_TARGET_FIELDS),
  siblingFields: z.array(siblingFieldSchema).max(MAX_CONTEXT_ARRAY_LENGTH).optional(),
  language: languageSchema,
});

export function validateRiskMemoAssistantRequest(body: unknown): RiskMemoAssistantRequest {
  return parseRequest(schema, body);
}
