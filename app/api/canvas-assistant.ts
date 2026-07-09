// Platform API — Canvas Assistant endpoint (POST /api/canvas-assistant).
//
// HTTP request -> validation -> Capability invocation -> error translation ->
// JSON response. This handler performs dependency injection by way of the existing
// composition root (createContainer) — it never constructs a Provider itself.

import type { IncomingMessage, ServerResponse } from "node:http";
import { createContainer } from "../server/ai/container.ts";
import { readJsonBody } from "../server/http/readJsonBody.ts";
import { validateCanvasAssistantRequest } from "../server/http/validateCanvasAssistantRequest.ts";
import { translateErrorToHttpResponse } from "../server/http/errors.ts";

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "Method Not Allowed", kind: "method_not_allowed" }));
    return;
  }

  try {
    const rawBody = await readJsonBody(req);
    const request = validateCanvasAssistantRequest(rawBody);

    const container = createContainer();
    const response = await container.canvasAssistant.invoke(request);

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
