// Generic Vercel Node Function handler factory — the mechanical
// method-check -> body-read -> validate -> invoke -> respond/translate-error
// shape shared identically by every AI Capability's `app/api/*.ts` endpoint.
// Each endpoint still owns which validator and which Capability it wires
// together; only that fully mechanical shell is declared once here.

import type { IncomingMessage, ServerResponse } from "node:http";
import { readJsonBody } from "./readJsonBody.js";
import { translateErrorToHttpResponse } from "./errors.js";

export type CapabilityHttpHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

export function createCapabilityHandler<TRequest, TResponse>(
  validateRequest: (body: unknown) => TRequest,
  invoke: (request: TRequest) => Promise<TResponse>,
): CapabilityHttpHandler {
  return async function handler(req, res) {
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ error: "Method Not Allowed", kind: "method_not_allowed" }));
      return;
    }

    try {
      const rawBody = await readJsonBody(req);
      const request = validateRequest(rawBody);
      const response = await invoke(request);

      res.statusCode = 200;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(response));
    } catch (err) {
      const { status, body } = translateErrorToHttpResponse(err);
      res.statusCode = status;
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(body));
    }
  };
}
