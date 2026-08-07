// Platform API — Risk Memo Assistant endpoint (POST /api/risk-memo-assistant).
//
// HTTP request -> validation -> Capability invocation -> error translation ->
// JSON response, via the shared handler shell (createCapabilityHandler).

import { createContainer } from "../server/ai/container.js";
import { validateRiskMemoAssistantRequest } from "../server/http/validateRiskMemoAssistantRequest.js";
import { createCapabilityHandler } from "../server/http/createCapabilityHandler.js";

export default createCapabilityHandler(validateRiskMemoAssistantRequest, (request) =>
  createContainer().riskMemoAssistant.invoke(request),
);
