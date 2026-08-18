// Stage 8 verification script:
//   npm run verify:stage8
// Exercises the Request Defense additions (sdd/ai/01_architecture.md#request-defense):
// body-size cap -> 413, zod-enforced string/array length bounds -> 400, and
// GeminiProvider's own request timeout -> ProviderError("timeout").

import { Readable } from "node:stream";
import type { IncomingMessage } from "node:http";
import handler from "../../api/canvas-assistant.js";
import { GeminiProvider } from "../ai/provider/GeminiProvider.js";
import { ProviderError } from "../ai/provider/ProviderInterface.js";
import { MAX_FIELD_VALUE_LENGTH } from "../http/validationHelpers.js";
import { createAssert, createMockRequest, createMockResponse } from "./verifyTestHelpers.js";

const assert = createAssert("Stage 8 verification");

function createOversizedMockRequest(byteLength: number): IncomingMessage {
  // A body this large is never legal JSON *content* we care about here — only
  // its raw byte size matters, since readJsonBody must reject on size before
  // ever attempting to parse it.
  const oversized = Buffer.alloc(byteLength, "a");
  const readable = Readable.from([oversized]) as unknown as IncomingMessage;
  const mutable = readable as unknown as {
    method: string;
    headers: Record<string, string>;
    socket: { remoteAddress: string };
  };
  mutable.method = "POST";
  mutable.headers = {};
  mutable.socket = { remoteAddress: "127.0.0.1" };
  return readable;
}

async function main(): Promise<void> {
  // 1. Body over the 256KB cap -> 413, before JSON parsing is ever attempted.
  {
    const { res, status, body } = createMockResponse();
    await handler(createOversizedMockRequest(300 * 1024), res);
    assert(status() === 413, `expected 413 for oversized body, got ${status()}`);
    assert(JSON.parse(body()).kind === "payload_too_large", "expected kind=payload_too_large in 413 response");
  }

  // 2. A free-text field beyond MAX_FIELD_VALUE_LENGTH -> 400 (zod bound, not a crash).
  {
    const { res, status, body } = createMockResponse();
    await handler(
      createMockRequest("POST", {
        operation: "suggestion",
        canvasContext: [{ field: "problem", value: "x".repeat(MAX_FIELD_VALUE_LENGTH + 1) }],
        language: "en",
      }),
      res,
    );
    assert(status() === 400, `expected 400 for over-length field value, got ${status()}`);
    assert(JSON.parse(body()).kind === "validation", "expected kind=validation for over-length field value");
  }

  // 3. GeminiProvider times out -> ProviderError("timeout"), not an unhandled hang
  //    or a generic network_failure. Stubs global.fetch to hang until aborted,
  //    mirroring how undici rejects a fetch whose AbortSignal.timeout fires.
  {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = ((_url: unknown, init?: { signal?: AbortSignal }) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const err = new Error("The operation was aborted due to timeout");
          err.name = "TimeoutError";
          reject(err);
        });
      })) as typeof fetch;

    // AbortSignal.timeout()'s internal timer is deliberately unref'd (Node
    // never lets it alone keep a process alive) — a real fetch call has its
    // own socket handle to keep the event loop open until abort fires, but
    // this stub has none, so a ref'd keep-alive timer stands in for it here.
    const keepAlive = setTimeout(() => {}, 200);
    try {
      const provider = new GeminiProvider({ apiKey: "test-key", model: "test-model", timeoutMs: 20 });
      let caught: unknown;
      try {
        await provider.generate({ prompt: "hello" });
      } catch (err) {
        caught = err;
      }
      assert(caught instanceof ProviderError, "expected a ProviderError to be thrown on timeout");
      assert(
        caught instanceof ProviderError && caught.kind === "timeout",
        `expected ProviderError kind "timeout", got "${caught instanceof ProviderError ? caught.kind : "n/a"}"`,
      );
    } finally {
      clearTimeout(keepAlive);
      globalThis.fetch = originalFetch;
    }
  }

  console.log("Stage 8 verification: PASS");
}

main().catch((err) => {
  console.error("Stage 8 verification: FAIL - unexpected error", err);
  process.exit(1);
});
