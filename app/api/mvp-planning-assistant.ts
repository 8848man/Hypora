// Platform API — MVP Planning Assistant endpoint (POST /api/mvp-planning-assistant).
//
// HTTP request -> validation -> Capability invocation -> error translation ->
// JSON response, via the shared handler shell (createCapabilityHandler).

import { createContainer } from "../server/ai/container.js";
import { validateMvpPlanningAssistantRequest } from "../server/http/validateMvpPlanningAssistantRequest.js";
import { createCapabilityHandler } from "../server/http/createCapabilityHandler.js";

export default createCapabilityHandler(validateMvpPlanningAssistantRequest, (request) =>
  createContainer().mvpPlanningAssistant.invoke(request),
);
