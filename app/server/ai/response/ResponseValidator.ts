// Response validation mechanism — owned by AI Application Service per
// sdd/ai/03_ownership_model.md. Generic: a Capability supplies its own type guard
// describing its Response Contract shape; this module only applies it and raises a
// uniform error if it fails. No Capability-specific shape is hardcoded here.

export class ResponseValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResponseValidationError";
  }
}

export function assertNonEmptyText(text: string): void {
  if (!text || text.trim().length === 0) {
    throw new ResponseValidationError("Provider response text was empty");
  }
}

export function assertShape<T>(
  candidate: unknown,
  isValid: (value: unknown) => value is T,
  message: string,
): T {
  if (!isValid(candidate)) {
    throw new ResponseValidationError(message);
  }
  return candidate;
}

// Shared building block for the common "parsed response is an object whose
// primary text field is a non-empty string type" shape every scalar-response
// Capability's own `is<Capability>ResponseShape` guard checks — each
// Capability still declares its own named guard (for its own precise return
// type), but no longer reimplements this same runtime check by hand.
export function isObjectWithStringField<K extends string>(
  candidate: unknown,
  key: K,
): candidate is Record<K, string> {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    typeof (candidate as Record<string, unknown>)[key] === "string"
  );
}
