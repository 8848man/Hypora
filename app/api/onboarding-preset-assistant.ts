// Platform API — Onboarding Preset Assistant endpoint
// (POST /api/onboarding-preset-assistant).
//
// HTTP request -> validation -> Capability invocation -> error translation ->
// JSON response, via the shared handler shell (createCapabilityHandler). Per
// ADR-0019, this endpoint is called automatically, once, by Project
// Management immediately after Project creation -- the Automatic-vs-Manual
// Invocation Mode distinction is a Frontend-side concern only; this endpoint
// treats every request identically.

import { createContainer } from "../server/ai/container.js";
import { validateOnboardingPresetAssistantRequest } from "../server/http/validateOnboardingPresetAssistantRequest.js";
import { createCapabilityHandler } from "../server/http/createCapabilityHandler.js";

export default createCapabilityHandler(validateOnboardingPresetAssistantRequest, (request) =>
  createContainer().onboardingPresetAssistant.invoke(request),
);
