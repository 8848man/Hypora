// LLM Provider Interface — the unified request/response contract every Provider
// implements, per ADR-0007 and sdd/ai/02_provider_independence_and_configuration.md.
// This is the lowest layer of the AI Platform: capability-agnostic, provider-agnostic.
// No code outside a Provider implementation may branch on `id` (the zero-provider-
// conditional rule) — `id` exists for routing/logging only.

export type ProviderRequest = {
  prompt: string;
  parameters?: Record<string, unknown>;
};

export type ProviderResponse = {
  text: string;
  raw?: unknown;
};

export type ProviderErrorKind =
  | "timeout"
  | "rate_limited"
  | "unavailable"
  | "invalid_response"
  | "safety_refusal"
  | "network_failure"
  | "unknown";

export class ProviderError extends Error {
  readonly kind: ProviderErrorKind;
  readonly cause?: unknown;

  constructor(kind: ProviderErrorKind, message: string, cause?: unknown) {
    super(message);
    this.name = "ProviderError";
    this.kind = kind;
    this.cause = cause;
  }
}

export interface Provider {
  readonly id: string;
  generate(request: ProviderRequest): Promise<ProviderResponse>;
}
