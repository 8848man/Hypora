// Platform API — Onboarding Preset Assistant endpoint
// (POST /api/onboarding-preset-assistant).
//
// HTTP request -> validation -> Capability invocation -> error translation ->
// JSON response. Identical shape to /api/project-summary-assistant. Per
// ADR-0019, this endpoint is called automatically, once, by Project
// Management immediately after Project creation -- the Automatic-vs-Manual
// Invocation Mode distinction is a Frontend-side concern only; this endpoint
// treats every request identically.

import type { IncomingMessage, ServerResponse } from "node:http";
import { createContainer } from "../server/ai/container.js";
import { readJsonBody } from "../server/http/readJsonBody.js";
import { validateOnboardingPresetAssistantRequest } from "../server/http/validateOnboardingPresetAssistantRequest.js";
import { translateErrorToHttpResponse } from "../server/http/errors.js";

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "Method Not Allowed", kind: "method_not_allowed" }));
    return;
  }

  try {
    const rawBody = await readJsonBody(req);
    const request = validateOnboardingPresetAssistantRequest(rawBody);

    const container = createContainer();
    const response = await container.onboardingPresetAssistant.invoke(request);

    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(response));
  } catch (err) {
    const { status, body } = translateErrorToHttpResponse(err);
    res.statusCode = status;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(body));
  }
}
