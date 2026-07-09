// Response parsing mechanism — owned by AI Application Service per
// sdd/ai/03_ownership_model.md. Generic: parses raw provider text into an unknown
// structure. No Capability-specific shape knowledge lives here — a Capability
// validates the parsed result against its own shape separately (ResponseValidator.ts).

export class ResponseParseError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "ResponseParseError";
    this.cause = cause;
  }
}

export function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new ResponseParseError("Provider response was not valid JSON", err);
  }
}
