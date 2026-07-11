// Shared across every capability's request validator, so errors.ts's single
// `instanceof HttpValidationError` check classifies all of them identically —
// a second validator defining its own class here would silently bypass that
// check (a different class reference fails `instanceof` even with the same name).

export class HttpValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HttpValidationError";
  }
}
