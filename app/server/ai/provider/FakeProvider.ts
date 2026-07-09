// Fake Provider — Stage 1 only. Satisfies the Provider Interface with a deterministic,
// in-process response so the AI Platform's wiring (Service -> Interface -> Provider)
// can be proven before any real vendor (Gemini) is integrated. Never used past Stage 4,
// where it is swapped for GeminiProvider without any change to this file's consumers.

import type { Provider, ProviderRequest, ProviderResponse } from "./ProviderInterface.js";

// A generic, capability-agnostic structured-output hint a Capability may pass via
// ProviderRequest.parameters.responseSchema. FakeProvider honors it the same way a
// real vendor's structured-output mode would (ADR-0007: this is Provider-owned
// behavior) — it has no knowledge of which Capability asked, only that some caller
// wants a JSON object with these keys.
type ResponseSchemaHint = { requiredKeys: string[] };

function isResponseSchemaHint(value: unknown): value is ResponseSchemaHint {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { requiredKeys?: unknown }).requiredKeys)
  );
}

export class FakeProvider implements Provider {
  readonly id = "fake";

  async generate(request: ProviderRequest): Promise<ProviderResponse> {
    const schemaHint = request.parameters?.responseSchema;

    if (isResponseSchemaHint(schemaHint)) {
      const body: Record<string, string> = {};
      for (const key of schemaHint.requiredKeys) {
        body[key] = `[fake-provider structured value for "${key}"] echo: ${request.prompt}`;
      }
      return { text: JSON.stringify(body), raw: { deterministic: true, structured: true } };
    }

    return {
      text: `[fake-provider deterministic response] echo: ${request.prompt}`,
      raw: { deterministic: true, promptLength: request.prompt.length },
    };
  }
}
