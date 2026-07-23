// Request validation — the HTTP boundary's job of turning untrusted JSON into
// the Capability's own typed Request Contract
// (sdd/ai/capabilities/07_onboarding_preset_assistant.md). This module knows
// the Contract's shape; it knows nothing about providers or Invocation Mode.

import type { OnboardingPresetAssistantRequest } from "../ai/capabilities/onboardingPresetAssistant/types.js";
import { HttpValidationError } from "./HttpValidationError.js";
import { VALID_LANGUAGES } from "./validationHelpers.js";

export function validateOnboardingPresetAssistantRequest(body: unknown): OnboardingPresetAssistantRequest {
  if (typeof body !== "object" || body === null) {
    throw new HttpValidationError("Request body must be a JSON object");
  }
  const candidate = body as Record<string, unknown>;

  if (typeof candidate.projectName !== "string" || candidate.projectName.trim().length === 0) {
    throw new HttpValidationError('"projectName" must be a non-empty string');
  }
  if (candidate.projectDescription !== undefined && typeof candidate.projectDescription !== "string") {
    throw new HttpValidationError('"projectDescription", if present, must be a string');
  }
  if (typeof candidate.language !== "string" || !VALID_LANGUAGES.includes(candidate.language as "ko" | "en")) {
    throw new HttpValidationError(`"language" must be one of: ${VALID_LANGUAGES.join(", ")}`);
  }

  return {
    projectName: candidate.projectName,
    projectDescription: candidate.projectDescription as string | undefined,
    language: candidate.language as "ko" | "en",
  };
}
