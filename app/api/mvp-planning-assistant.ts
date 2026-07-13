// Platform API — MVP Planning Assistant endpoint (POST /api/mvp-planning-assistant).
//
// HTTP request -> validation -> Capability invocation -> error translation ->
// JSON response. Identical shape to /api/risk-memo-assistant.

import type { IncomingMessage, ServerResponse } from "node:http";
import { createContainer } from "../server/ai/container.js";
import { readJsonBody } from "../server/http/readJsonBody.js";
import { validateMvpPlanningAssistantRequest } from "../server/http/validateMvpPlanningAssistantRequest.js";
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
    const request = validateMvpPlanningAssistantRequest(rawBody);

    const container = createContainer();
    const response = await container.mvpPlanningAssistant.invoke(request);

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
