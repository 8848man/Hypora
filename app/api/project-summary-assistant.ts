// Platform API — Project Summary Synthesis Assistant endpoint
// (POST /api/project-summary-assistant).
//
// HTTP request -> validation -> Capability invocation -> error translation ->
// JSON response. Identical shape to /api/mvp-planning-assistant. Serves both
// Operations (initial_generation, sync) — the Invocation Mode distinction
// (Automatic per ADR-0017 vs. Manual) is entirely a Frontend-side concern;
// this endpoint treats every request identically regardless of which
// triggered it.

import type { IncomingMessage, ServerResponse } from "node:http";
import { createContainer } from "../server/ai/container.js";
import { readJsonBody } from "../server/http/readJsonBody.js";
import { validateProjectSummaryAssistantRequest } from "../server/http/validateProjectSummaryAssistantRequest.js";
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
    const request = validateProjectSummaryAssistantRequest(rawBody);

    const container = createContainer();
    const response = await container.projectSummaryAssistant.invoke(request);

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
