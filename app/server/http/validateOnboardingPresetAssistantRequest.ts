// Request validation — the HTTP boundary's job of turning untrusted JSON into
// the Capability's own typed Request Contract
// (sdd/ai/capabilities/07_onboarding_preset_assistant.md). This module knows
// the Contract's shape; it knows nothing about providers or Invocation Mode.

import { z } from "zod";
import type { OnboardingPresetAssistantRequest } from "../ai/capabilities/onboardingPresetAssistant/types.js";
import { MAX_FIELD_VALUE_LENGTH, languageSchema, parseRequest } from "./validationHelpers.js";

const schema: z.ZodType<OnboardingPresetAssistantRequest> = z.object({
  projectName: z
    .string()
    .max(MAX_FIELD_VALUE_LENGTH)
    .refine((value) => value.trim().length > 0, { message: "must be a non-empty string" }),
  projectDescription: z.string().max(MAX_FIELD_VALUE_LENGTH).optional(),
  language: languageSchema,
});

export function validateOnboardingPresetAssistantRequest(body: unknown): OnboardingPresetAssistantRequest {
  return parseRequest(schema, body);
}
