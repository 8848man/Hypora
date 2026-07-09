// Error translation — the complete flow required by sdd/ai/02's unified error
// taxonomy (ADR-0007): External Provider Error -> ProviderError -> (here) HTTP
// response -> Frontend. Every branch below reacts to an already-classified error
// type; none of it is provider-specific logic, and no Provider-specific exception
// or message ever escapes past this point unclassified.

import { HttpValidationError } from "./validateCanvasAssistantRequest.ts";
import { HttpBodyError } from "./readJsonBody.ts";
import { ResponseParseError } from "../ai/response/ResponseParser.ts";
import { ResponseValidationError } from "../ai/response/ResponseValidator.ts";
import { ProviderError } from "../ai/provider/ProviderInterface.ts";

export type HttpErrorResponse = {
  status: number;
  body: { error: string; kind?: string };
};

const PROVIDER_ERROR_STATUS: Record<string, number> = {
  timeout: 504,
  rate_limited: 429,
  unavailable: 503,
  invalid_response: 502,
  safety_refusal: 422,
  network_failure: 503,
  unknown: 500,
};

export function translateErrorToHttpResponse(err: unknown): HttpErrorResponse {
  if (err instanceof HttpValidationError || err instanceof HttpBodyError) {
    return { status: 400, body: { error: err.message, kind: "validation" } };
  }
  if (err instanceof ProviderError) {
    return {
      status: PROVIDER_ERROR_STATUS[err.kind] ?? 500,
      body: { error: err.message, kind: err.kind },
    };
  }
  if (err instanceof ResponseParseError || err instanceof ResponseValidationError) {
    return { status: 502, body: { error: err.message, kind: "invalid_response" } };
  }
  // Unclassified failure: never leak internal details past this boundary.
  return { status: 500, body: { error: "Internal Server Error", kind: "unknown" } };
}
