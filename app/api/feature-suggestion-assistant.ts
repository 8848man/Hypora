// Platform API — Feature Suggestion Assistant endpoint
// (POST /api/feature-suggestion-assistant).
//
// HTTP request -> validation -> Capability invocation -> error translation ->
// JSON response, via the shared handler shell (createCapabilityHandler).

import { createContainer } from "../server/ai/container.js";
import { validateFeatureSuggestionAssistantRequest } from "../server/http/validateFeatureSuggestionAssistantRequest.js";
import { createCapabilityHandler } from "../server/http/createCapabilityHandler.js";

export default createCapabilityHandler(validateFeatureSuggestionAssistantRequest, (request) =>
  createContainer().featureSuggestionAssistant.invoke(request),
);
