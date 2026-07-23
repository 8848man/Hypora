// Stage 3 verification script:
//   node --experimental-strip-types server/scripts/verifyStage3.ts
// Exercises the real HTTP handler (POST /api/canvas-assistant) via mock Node
// request/response objects, plus a direct unit check of the error-translation table.

import handler from "../../api/canvas-assistant.js";
import { translateErrorToHttpResponse } from "../http/errors.js";
import { ProviderError } from "../ai/provider/ProviderInterface.js";
import { HttpValidationError } from "../http/HttpValidationError.js";
import { createAssert, createMockRequest, createMockResponse } from "./verifyTestHelpers.js";

const assert = createAssert("Stage 3 verification");

async function main(): Promise<void> {
  // 1. Happy path, one per operation.
  for (const operation of ["suggestion", "missingInfo", "followUp", "refinement"] as const) {
    const { res, status, body } = createMockResponse();
    await handler(
      createMockRequest("POST", {
        operation,
        canvasContext: [{ field: "problem", value: "x" }],
        currentField: "valueProposition",
        language: "en",
      }),
      res,
    );
    assert(status() === 200, `operation "${operation}" expected 200, got ${status()}`);
    const parsed = JSON.parse(body());
    assert(typeof parsed.suggestionText === "string", `operation "${operation}" missing suggestionText in HTTP response`);
  }

  // 2. Method validation.
  {
    const { res, status } = createMockResponse();
    await handler(createMockRequest("GET", undefined), res);
    assert(status() === 405, `expected 405 for GET, got ${status()}`);
  }

  // 3. Invalid operation -> 400.
  {
    const { res, status, body } = createMockResponse();
    await handler(createMockRequest("POST", { operation: "not-a-real-operation", canvasContext: [], language: "en" }), res);
    assert(status() === 400, `expected 400 for invalid operation, got ${status()}`);
    assert(JSON.parse(body()).kind === "validation", "expected kind=validation in 400 response");
  }

  // 4. Missing canvasContext -> 400.
  {
    const { res, status } = createMockResponse();
    await handler(createMockRequest("POST", { operation: "suggestion", language: "en" }), res);
    assert(status() === 400, `expected 400 for missing canvasContext, got ${status()}`);
  }

  // 5. Malformed JSON body -> 400, not a 500 crash.
  {
    const { res, status } = createMockResponse();
    await handler(createMockRequest("POST", "{not valid json"), res);
    assert(status() === 400, `expected 400 for malformed JSON, got ${status()}`);
  }

  // 6. Error-translation table, unit-level (no HTTP round trip needed).
  assert(translateErrorToHttpResponse(new HttpValidationError("x")).status === 400, "validation error must map to 400");
  assert(translateErrorToHttpResponse(new ProviderError("rate_limited", "x")).status === 429, "rate_limited must map to 429");
  assert(translateErrorToHttpResponse(new ProviderError("timeout", "x")).status === 504, "timeout must map to 504");
  assert(translateErrorToHttpResponse(new ProviderError("safety_refusal", "x")).status === 422, "safety_refusal must map to 422");
  assert(translateErrorToHttpResponse(new Error("something unclassified")).status === 500, "unclassified error must map to 500");
  assert(
    translateErrorToHttpResponse(new Error("db password is hunter2")).body.error === "Internal Server Error",
    "unclassified error message must never leak past the boundary",
  );

  console.log("Stage 3 verification: PASS");
}

main().catch((err) => {
  console.error("Stage 3 verification: FAIL - unexpected error", err);
  process.exit(1);
});
