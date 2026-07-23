// Platform API — Validation Planning Assistant endpoint
// (POST /api/validation-planning-assistant).
//
// HTTP request -> validation -> Capability invocation -> error translation ->
// JSON response, via the shared handler shell (createCapabilityHandler).

import { createContainer } from "../server/ai/container.js";
import { validateValidationPlanningAssistantRequest } from "../server/http/validateValidationPlanningAssistantRequest.js";
import { createCapabilityHandler } from "../server/http/createCapabilityHandler.js";

export default createCapabilityHandler(validateValidationPlanningAssistantRequest, (request) =>
  createContainer().validationPlanningAssistant.invoke(request),
);
