// Platform API — Project Summary Synthesis Assistant endpoint
// (POST /api/project-summary-assistant).
//
// HTTP request -> validation -> Capability invocation -> error translation ->
// JSON response, via the shared handler shell (createCapabilityHandler).
// Serves both Operations (initial_generation, sync) — the Invocation Mode
// distinction (Automatic per ADR-0017 vs. Manual) is entirely a Frontend-side
// concern; this endpoint treats every request identically regardless of
// which triggered it.

import { createContainer } from "../server/ai/container.js";
import { validateProjectSummaryAssistantRequest } from "../server/http/validateProjectSummaryAssistantRequest.js";
import { createCapabilityHandler } from "../server/http/createCapabilityHandler.js";

export default createCapabilityHandler(validateProjectSummaryAssistantRequest, (request) =>
  createContainer().projectSummaryAssistant.invoke(request),
);
