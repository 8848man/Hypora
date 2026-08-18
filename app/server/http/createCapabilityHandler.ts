// Generic Vercel Node Function handler factory — the mechanical
// method-check -> body-read -> validate -> invoke -> respond/translate-error
// shape shared identically by every AI Capability's `app/api/*.ts` endpoint.
// Each endpoint still owns which validator and which Capability it wires
// together; only that fully mechanical shell is declared once here.

import type { IncomingMessage, ServerResponse } from "node:http";
import { readJsonBody } from "./readJsonBody.js";
import { translateErrorToHttpResponse } from "./errors.js";
import { checkOrigin } from "./originCheck.js";
import { createRateLimiter, type RateLimiter } from "./rateLimiter.js";

export type CapabilityHttpHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(body));
}

function clientIp(req: IncomingMessage): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  const first = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(",")[0];
  return first?.trim() || req.socket.remoteAddress || "unknown";
}

// One rate limiter instance per Vercel Function module instance, shared
// across every request that module instance handles — matches
// createContainer's own per-invocation-vs-per-instance split (ADR-0023 does
// not require a new Firestore connection per request, only per warm instance).
let sharedRateLimiter: RateLimiter | undefined;

export function createCapabilityHandler<TRequest, TResponse>(
  validateRequest: (body: unknown) => TRequest,
  invoke: (request: TRequest) => Promise<TResponse>,
): CapabilityHttpHandler {
  return async function handler(req, res) {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Method Not Allowed", kind: "method_not_allowed" });
      return;
    }

    if (!checkOrigin(req).allowed) {
      sendJson(res, 403, { error: "Origin not allowed", kind: "forbidden_origin" });
      return;
    }

    sharedRateLimiter ??= createRateLimiter();
    const rateLimit = await sharedRateLimiter.checkAndConsume(clientIp(req));
    if (!rateLimit.allowed) {
      if (rateLimit.retryAfterSeconds) {
        res.setHeader("retry-after", String(rateLimit.retryAfterSeconds));
      }
      sendJson(res, 429, { error: "Too many requests", kind: "rate_limited" });
      return;
    }

    try {
      const rawBody = await readJsonBody(req);
      const request = validateRequest(rawBody);
      const response = await invoke(request);

      sendJson(res, 200, response);
    } catch (err) {
      const { status, body } = translateErrorToHttpResponse(err);
      sendJson(res, status, body);
    }
  };
}
