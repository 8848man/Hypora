// Shared HTTP-boundary validation helpers, reused identically across every
// `validate<Capability>Request.ts` module. Each of those files still owns its
// own Request Contract's field-by-field checks; only the mechanical, fully
// generic pieces (context-field-array shape, supported language values) live
// here, so they are declared once instead of redefined per validator.

import type { CanvasContextField } from "../ai/shared/types.js";

export const VALID_LANGUAGES = ["ko", "en"] as const;

export function isContextFieldArray(value: unknown): value is CanvasContextField[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).field === "string" &&
        typeof (item as Record<string, unknown>).value === "string",
    )
  );
}
