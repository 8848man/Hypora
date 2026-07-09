// Platform API health endpoint — Vercel Node Function entrypoint (GET /api/health).
//
// Typed against Node's http primitives directly rather than @vercel/node, since no
// dependency on that package exists yet and Vercel's Node runtime request/response
// objects are a superset of these — sufficient for this handler. Implementation
// assumption (tooling choice), not an architectural decision; revisit if a future
// stage needs Vercel-specific request helpers.

import type { IncomingMessage, ServerResponse } from "node:http";
import { createContainer } from "../server/ai/container.js";
import { checkAiPlatformHealth } from "../server/ai/health.js";

export default async function handler(_req: IncomingMessage, res: ServerResponse): Promise<void> {
  const container = createContainer();
  const result = await checkAiPlatformHealth(container);

  res.statusCode = result.status === "ok" ? 200 : 503;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(result));
}
