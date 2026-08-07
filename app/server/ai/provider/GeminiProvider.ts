// Gemini Provider — the first real vendor implementation of the LLM Provider
// Interface (ADR-0007). Owns everything vendor-specific: wire communication,
// authentication, structured-output request shaping, and translation of Gemini's
// own error responses into the AI Platform's unified ProviderErrorKind taxonomy.
// No code outside this file may know any of these details (the zero-provider-
// conditional rule) — AiApplicationService and every Capability call only the
// generic Provider interface.

import type { Provider, ProviderRequest, ProviderResponse } from "./ProviderInterface.js";
import { ProviderError } from "./ProviderInterface.js";

export type GeminiProviderConfig = {
  apiKey: string;
  model: string;
  // Provider-specific generation parameters (sdd/ai/02's "Provider-specific
  // configuration" — heterogeneous per vendor, never unified with another
  // provider's shape).
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
  baseUrl?: string;
};

type ResponseSchemaHint = { requiredKeys: string[] };

function isResponseSchemaHint(value: unknown): value is ResponseSchemaHint {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { requiredKeys?: unknown }).requiredKeys)
  );
}

// Gemini's generateContent response shape, narrowly typed to only what this
// Provider actually reads — not a full SDK type, since no SDK dependency is used.
type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
};

const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export class GeminiProvider implements Provider {
  readonly id = "gemini";

  private readonly config: GeminiProviderConfig;

  constructor(config: GeminiProviderConfig) {
    this.config = config;
  }

  async generate(request: ProviderRequest): Promise<ProviderResponse> {
    const schemaHint = request.parameters?.responseSchema;
    // API key is sent as a header, not a `?key=` query-string parameter, so it
    // never ends up captured in URL-based logging (access logs, intermediate
    // proxies, browser history) — the Generative Language API accepts either;
    // this Provider only ever uses one, per its own encapsulation boundary.
    const url = `${this.config.baseUrl ?? DEFAULT_BASE_URL}/models/${this.config.model}:generateContent`;

    const body: Record<string, unknown> = {
      contents: [{ role: "user", parts: [{ text: request.prompt }] }],
      generationConfig: {
        temperature: this.config.temperature,
        topP: this.config.topP,
        maxOutputTokens: this.config.maxOutputTokens,
        // Gemini's own structured-output mechanism: responseMimeType + responseSchema.
        // This is exactly the Provider's job per ADR-0007 — translating a generic
        // "I need these keys" hint into Gemini's native structured-output request.
        ...(isResponseSchemaHint(schemaHint)
          ? {
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                properties: Object.fromEntries(schemaHint.requiredKeys.map((key) => [key, { type: "string" }])),
                required: schemaHint.requiredKeys,
              },
            }
          : {}),
      },
    };

    let httpResponse: Response;
    try {
      httpResponse = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": this.config.apiKey },
        body: JSON.stringify(body),
      });
    } catch (cause) {
      throw new ProviderError("network_failure", "Failed to reach Gemini API", cause);
    }

    if (httpResponse.status === 429) {
      throw new ProviderError("rate_limited", "Gemini API rate limit exceeded");
    }
    if (httpResponse.status === 503) {
      throw new ProviderError("unavailable", "Gemini API is currently unavailable");
    }
    if (httpResponse.status === 408) {
      throw new ProviderError("timeout", "Gemini API request timed out");
    }
    if (!httpResponse.ok) {
      throw new ProviderError(
        "unknown",
        `Gemini API returned an unexpected status: ${httpResponse.status}`,
      );
    }

    let parsed: GeminiGenerateContentResponse;
    try {
      parsed = (await httpResponse.json()) as GeminiGenerateContentResponse;
    } catch (cause) {
      throw new ProviderError("invalid_response", "Gemini API response was not valid JSON", cause);
    }

    const candidate = parsed.candidates?.[0];
    if (candidate?.finishReason === "SAFETY") {
      throw new ProviderError("safety_refusal", "Gemini declined to respond for safety reasons");
    }

    const text = candidate?.content?.parts?.[0]?.text;
    if (typeof text !== "string" || text.length === 0) {
      throw new ProviderError("invalid_response", "Gemini API response did not contain any text");
    }

    return { text, raw: parsed };
  }
}
