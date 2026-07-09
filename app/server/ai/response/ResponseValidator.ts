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
