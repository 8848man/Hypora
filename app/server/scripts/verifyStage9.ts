// Stage 9 verification script:
//   npm run verify:stage9
// Exercises ADR-0023's abuse defenses: the pure token-bucket algorithm
// (no Firestore needed), the origin allowlist, and end-to-end wiring through
// the real HTTP handler (rate limiter falls back to its Noop implementation
// in this environment, since no Firebase config is set — the same "unset =
// not configured" contract the Analytics Provider already uses).

import type { IncomingMessage } from "node:http";
import handler from "../../api/canvas-assistant.js";
import { computeTokenBucket, TOKEN_BUCKET_CAPACITY } from "../http/tokenBucket.js";
import { checkOrigin } from "../http/originCheck.js";
import { createAssert, createMockRequest, createMockResponse } from "./verifyTestHelpers.js";

const assert = createAssert("Stage 9 verification");

function withHeaders(req: IncomingMessage, headers: Record<string, string>): IncomingMessage {
  (req as unknown as { headers: Record<string, string> }).headers = headers;
  return req;
}

async function main(): Promise<void> {
  // 1. Token bucket: capacity, depletion, refusal, and time-based refill.
  {
    const t0 = 1_000_000;
    let state: import("../http/tokenBucket.js").TokenBucketState | undefined;
    let allowedCount = 0;
    for (let i = 0; i < TOKEN_BUCKET_CAPACITY; i++) {
      const result = computeTokenBucket(state, t0);
      assert(result.allowed, `request ${i + 1}/${TOKEN_BUCKET_CAPACITY} within capacity should be allowed`);
      state = result.state;
      allowedCount++;
    }
    assert(allowedCount === TOKEN_BUCKET_CAPACITY, "expected exactly capacity requests allowed with no elapsed time");

    const overCapacity = computeTokenBucket(state, t0);
    assert(!overCapacity.allowed, "request beyond capacity, same instant, should be rejected");
    assert(typeof overCapacity.retryAfterSeconds === "number" && overCapacity.retryAfterSeconds > 0, "rejected request must report retryAfterSeconds");

    // A full minute later, the bucket should have fully refilled.
    const afterRefill = computeTokenBucket(overCapacity.state, t0 + 60_000);
    assert(afterRefill.allowed, "request one minute later should be allowed again (full refill)");
  }

  // 2. Origin check: no Vercel env vars configured in this environment ->
  //    enforcement is skipped entirely (see originCheck.ts's own reasoning).
  {
    const req = withHeaders({} as IncomingMessage, { origin: "https://evil.example.com" });
    const result = checkOrigin(req);
    assert(result.allowed, "with no deployment env vars configured, origin check must not enforce (would break local dev otherwise)");
  }

  // 3. Origin check: with an explicit allowlist, a mismatched Origin is rejected
  //    and a matching one is allowed.
  {
    process.env.ALLOWED_ORIGINS = "https://hypora.example.com";
    try {
      const blocked = checkOrigin(withHeaders({} as IncomingMessage, { origin: "https://not-hypora.example.com" }));
      assert(!blocked.allowed, "mismatched Origin against an explicit allowlist must be rejected");

      const allowed = checkOrigin(withHeaders({} as IncomingMessage, { origin: "https://hypora.example.com" }));
      assert(allowed.allowed, "Origin matching the explicit allowlist must be allowed");

      const noHeader = checkOrigin(withHeaders({} as IncomingMessage, {}));
      assert(noHeader.allowed, "absent Origin/Referer must be allowed, not rejected on silence alone");
    } finally {
      delete process.env.ALLOWED_ORIGINS;
    }
  }

  // 4. End-to-end: the real handler still returns 200 for a valid request in
  //    this environment (Noop rate limiter, no origin enforcement) — proves
  //    the new checks are wired in without breaking the existing happy path.
  {
    const { res, status } = createMockResponse();
    await handler(
      createMockRequest("POST", {
        operation: "suggestion",
        canvasContext: [{ field: "problem", value: "x" }],
        language: "en",
      }),
      res,
    );
    assert(status() === 200, `expected 200 for a valid request with defenses wired in, got ${status()}`);
  }

  console.log("Stage 9 verification: PASS");
}

main().catch((err) => {
  console.error("Stage 9 verification: FAIL - unexpected error", err);
  process.exit(1);
});
