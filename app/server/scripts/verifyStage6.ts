// Stage 6 verification script:
//   node --experimental-strip-types server/scripts/verifyStage6.ts
// Exercises the Project Summary Synthesis Assistant Capability end-to-end
// against FakeProvider (capability layer, mirroring Stage 2) and its real
// HTTP handler POST /api/project-summary-assistant (mirroring Stage 3), for
// both Operations (initial_generation, sync).

import { Readable } from "node:stream";
import type { IncomingMessage, ServerResponse } from "node:http";
import { createContainer } from "../ai/container.js";
import { FakeProvider } from "../ai/provider/FakeProvider.js";
import handler from "../../api/project-summary-assistant.js";
import type { ProjectSummaryAssistantOperation } from "../ai/capabilities/projectSummaryAssistant/types.js";

// Domain Summary Lifecycle logic (src/domain/summaryLifecycle.ts) is
// verified separately, via `npm run verify:domain-summary`
// (src/domain/verifySummaryLifecycle.ts) — never imported here. Server code
// must not import Frontend src/ directly (browser vs. Node runtime
// boundary — see canvasAssistantClient.ts's own header comment); doing so
// from this script also breaks `tsc -b`'s project-reference boundary
// (tsconfig.server.json's nodenext resolution vs. tsconfig.app.json's
// bundler resolution disagree on extensionless imports).

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`Stage 6 verification: FAIL - ${message}`);
    process.exit(1);
  }
}

function createMockRequest(method: string, body: unknown): IncomingMessage {
  const bodyStr = body === undefined ? "" : typeof body === "string" ? body : JSON.stringify(body);
  const readable = Readable.from([Buffer.from(bodyStr, "utf8")]) as unknown as IncomingMessage;
  (readable as unknown as { method: string }).method = method;
  return readable;
}

function createMockResponse(): { res: ServerResponse; status: () => number; body: () => string } {
  let statusCode = 0;
  let body = "";
  const res = {
    setHeader: () => {},
    end: (chunk: string) => {
      body = chunk;
    },
  } as unknown as ServerResponse;
  Object.defineProperty(res, "statusCode", {
    get: () => statusCode,
    set: (v: number) => {
      statusCode = v;
    },
  });
  return { res, status: () => statusCode, body: () => body };
}

async function main(): Promise<void> {
  // 1. Capability layer — one happy path per Operation.
  const container = createContainer(new FakeProvider());
  const operations: ProjectSummaryAssistantOperation[] = ["initial_generation", "sync"];
  for (const operation of operations) {
    const response = await container.projectSummaryAssistant.invoke({
      operation,
      canvasContext: [{ field: "problem", value: "Founders struggle to structure a new idea" }],
      language: "en",
    });
    assert(
      typeof response.summaryText === "string" && response.summaryText.length > 0,
      `operation "${operation}" did not return a non-empty summaryText`,
    );
  }

  // 2. HTTP layer — happy path.
  {
    const { res, status, body } = createMockResponse();
    await handler(
      createMockRequest("POST", {
        operation: "initial_generation",
        canvasContext: [{ field: "problem", value: "x" }],
        language: "en",
      }),
      res,
    );
    assert(status() === 200, `expected 200, got ${status()}`);
    const parsed = JSON.parse(body());
    assert(typeof parsed.summaryText === "string", "missing summaryText in HTTP response");
  }

  // 3. Method validation.
  {
    const { res, status } = createMockResponse();
    await handler(createMockRequest("GET", undefined), res);
    assert(status() === 405, `expected 405 for GET, got ${status()}`);
  }

  // 4. Invalid operation -> 400.
  {
    const { res, status, body } = createMockResponse();
    await handler(
      createMockRequest("POST", {
        operation: "not-a-real-operation",
        canvasContext: [],
        language: "en",
      }),
      res,
    );
    assert(status() === 400, `expected 400 for invalid operation, got ${status()}`);
    assert(JSON.parse(body()).kind === "validation", "expected kind=validation in 400 response");
  }

  // 5. Missing canvasContext -> 400.
  {
    const { res, status } = createMockResponse();
    await handler(createMockRequest("POST", { operation: "sync", language: "en" }), res);
    assert(status() === 400, `expected 400 for missing canvasContext, got ${status()}`);
  }

  console.log("Stage 6 verification: PASS");
}

main().catch((err) => {
  console.error("Stage 6 verification: FAIL - unexpected error", err);
  process.exit(1);
});
