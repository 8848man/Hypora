// Shared HTTP-boundary validation helpers, reused identically across every
// `validate<Capability>Request.ts` module. Each of those files still owns its
// own Request Contract's field-by-field shape; only the mechanical, fully
// generic pieces (context-field-array shape, supported language values, the
// zod -> HttpValidationError adapter) live here, so they are declared once
// instead of redefined per validator.
//
// Length bounds below are this module's Request Defense contribution
// (sdd/ai/01_architecture.md#request-defense) — every free-text field and
// every array-shaped field gets a bound here, so no individual validator can
// silently omit one.

import { z } from "zod";
import { HttpValidationError } from "./HttpValidationError.js";

export const VALID_LANGUAGES = ["ko", "en"] as const;
export const languageSchema = z.enum(VALID_LANGUAGES);

export const MAX_FIELD_NAME_LENGTH = 200;
export const MAX_FIELD_VALUE_LENGTH = 5_000;
export const MAX_CONTEXT_ARRAY_LENGTH = 50;

export const contextFieldSchema = z.object({
  field: z.string().max(MAX_FIELD_NAME_LENGTH),
  value: z.string().max(MAX_FIELD_VALUE_LENGTH),
});

export const contextFieldArraySchema = z.array(contextFieldSchema).max(MAX_CONTEXT_ARRAY_LENGTH);

/**
 * Parses `body` against `schema`, translating any failure into the same
 * `HttpValidationError` every validator already threw by hand — so
 * `errors.ts`'s single `instanceof HttpValidationError` -> 400 mapping is
 * unchanged by this module's move to zod.
 */
export function parseRequest<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `"${issue.path.join(".") || "body"}": ${issue.message}`)
      .join("; ");
    throw new HttpValidationError(message);
  }
  return result.data;
}
