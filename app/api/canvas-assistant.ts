// Platform API — Canvas Assistant endpoint (POST /api/canvas-assistant).
//
// HTTP request -> validation -> Capability invocation -> error translation ->
// JSON response, via the shared handler shell (createCapabilityHandler).
// Dependency injection is via the existing composition root (createContainer)
// — this handler never constructs a Provider itself.

import { createContainer } from "../server/ai/container.js";
import { validateCanvasAssistantRequest } from "../server/http/validateCanvasAssistantRequest.js";
import { createCapabilityHandler } from "../server/http/createCapabilityHandler.js";

export default createCapabilityHandler(validateCanvasAssistantRequest, (request) =>
  createContainer().canvasAssistant.invoke(request),
);
